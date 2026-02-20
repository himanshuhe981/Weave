"use server";

import { jsonTransformChannel } from "@/inngest/channels/json-transform";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type JsonTransformToken = Realtime.Token<
  typeof jsonTransformChannel,
  ["status"]
>;

export async function fetchJsonTransformRealtimeToken():
  Promise<JsonTransformToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: jsonTransformChannel(),
    topics: ["status"],
  });

  return token;
}