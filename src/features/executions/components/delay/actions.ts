"use server";

import { delayChannel } from "@/inngest/channels/delay";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type DelayToken = Realtime.Token<
  typeof delayChannel,
  ["status"]
>;

export async function fetchDelayRealtimeToken(): Promise<DelayToken> {
  try { return getSubscriptionToken(inngest, {
    channel: delayChannel(),
    topics: ["status"],
  }); } catch { return null as any; }
}