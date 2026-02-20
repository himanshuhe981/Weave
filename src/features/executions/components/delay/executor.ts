import type { NodeExecutor } from "@/features/executions/types";
import { delayChannel } from "@/inngest/channels/delay";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";

type DelayData = {
  amount?: string;
  unit?: "minutes" | "hours" | "days" | "milliseconds";
  jitter?: boolean;
};

const UNIT_TO_MS = {
  milliseconds: 1,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
};

export const delayExecutor: NodeExecutor<DelayData> =
  async ({ data, nodeId, context, publish, step }) => {

    await publish(delayChannel().status({ nodeId, status: "loading" }));

    if (!data.amount || !data.unit) {
      throw new NonRetriableError("Delay node misconfigured");
    }

    try {
      const compiled = Handlebars.compile(data.amount);
      const resolvedAmount = compiled(context);

      const numericAmount = Number(resolvedAmount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new NonRetriableError("Invalid delay amount");
      }

      let delayMs = numericAmount * UNIT_TO_MS[data.unit];

      // Optional jitter (±10%)
      if (data.jitter) {
        const variation = delayMs * 0.1;
        delayMs =
          delayMs +
          (Math.random() * variation * 2 - variation);
      }

      // Safety limit (max 30 days)
      const MAX_DELAY = 30 * 24 * 60 * 60 * 1000;
      if (delayMs > MAX_DELAY) {
        throw new NonRetriableError("Delay exceeds maximum allowed time");
      }

      await step.sleep(`delay-${nodeId}`, `${Math.floor(delayMs)}ms`);

      await publish(delayChannel().status({ nodeId, status: "success" }));

      return context;

    } catch (err) {
      await publish(delayChannel().status({ nodeId, status: "error" }));
      throw err;
    }
  };