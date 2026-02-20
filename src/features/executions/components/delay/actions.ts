"use server";

import { delayChannel } from "@/inngest/channels/delay";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type DelayToken = Realtime.Token<
  typeof delayChannel,
  ["status"]
>;

export async function fetchDelayRealtimeToken(): Promise<DelayToken> {
  return getSubscriptionToken(inngest, {
    channel: delayChannel(),
    topics: ["status"],
  });
}