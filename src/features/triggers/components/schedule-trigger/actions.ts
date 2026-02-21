"use server";

import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken } from "@inngest/realtime";

export async function fetchScheduleTriggerRealtimeToken() {
  return getSubscriptionToken(inngest, {
    channel: scheduleTriggerChannel(),
    topics: ["status"],
  });
}