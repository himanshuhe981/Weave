import { channel, topic } from "@inngest/realtime";

export const JSON_TRANSFORM_CHANNEL_NAME = "json-transform-execution";

export const jsonTransformChannel = channel(JSON_TRANSFORM_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  );