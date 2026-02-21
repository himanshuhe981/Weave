import type { NodeExecutor } from "@/features/executions/types";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";

type ScheduleTriggerData = {
  cron?: string;
  timezone?: string;
  enabled?: boolean;
};

export const scheduleTriggerExecutor: NodeExecutor<
  ScheduleTriggerData
> = async ({ nodeId, context, step, publish }) => {

  await publish(
    scheduleTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  try {
    const result = await step.run(
      "schedule-trigger",
      async () => context
    );

    await publish(
      scheduleTriggerChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;

  } catch (error) {
    await publish(
      scheduleTriggerChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};