import type { NodeExecutor } from "@/features/executions/types";
import { delayChannel } from "@/inngest/channels/delay";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

type DelayUnit = "minutes" | "hours" | "days" | "milliseconds";

type DelayData = {
  amount?: string;
  unit?: DelayUnit;
  jitter?: boolean;
};

const UNIT_TO_MS: Record<DelayUnit, number> = {
  milliseconds: 1,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
};

export const delayExecutor: NodeExecutor<DelayData> =
  async ({ data, nodeId, context, publish, step }) => {

    await publish(
      delayChannel().status({ nodeId, status: "loading" })
    );

    try {
      //  Validate configuration
      if (!data.amount || !data.unit) {
        throw new NonRetriableError("Delay node misconfigured");
      }

      //  Resolve dynamic template
      const compiled = Handlebars.compile(data.amount);
      const resolvedAmount = compiled(context);

      const numericAmount = Number(resolvedAmount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new NonRetriableError("Invalid delay amount");
      }

      //  Convert to milliseconds
      let delayMs = numericAmount * UNIT_TO_MS[data.unit];

      //  Optional jitter (±10%)
      if (data.jitter) {
        const variation = delayMs * 0.1;
        delayMs += Math.random() * variation * 2 - variation;
      }

      //  Safety limit (max 30 days)
      const MAX_DELAY = 30 * 24 * 60 * 60 * 1000;
      if (delayMs > MAX_DELAY) {
        throw new NonRetriableError(
          "Delay exceeds maximum allowed time"
        );
      }

      //  Durable sleep
      await step.sleep(
        `delay-${nodeId}`,
        `${Math.floor(delayMs)}ms`
      );

    } catch (error) {

      try {
        await publish(
          delayChannel().status({ nodeId, status: "error" })
        );
      } catch {
      
      }

      throw error;
    }

   
    try {
      await publish(
        delayChannel().status({ nodeId, status: "success" })
      );
    } catch {

    }

    return context;
  };