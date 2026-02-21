"use server";

import { webhookTriggerChannel } from "@/inngest/channels/webhook-trigger";
import { inngest } from "@/inngest/client";
import {
  getSubscriptionToken,
  type Realtime,
} from "@inngest/realtime";

import { auth } from "@/lib/auth"; // adjust import to your auth helper
import { headers } from "next/headers";

export type WebhookTriggerRealtimeToken = Realtime.Token<
  typeof webhookTriggerChannel,
  ["status"]
>;

export async function fetchWebhookTriggerRealtimeToken():
  Promise<WebhookTriggerRealtimeToken> {

    const session = await auth.api.getSession({ headers: await headers() });
     if (!session) throw new Error("Unauthorized");

  const token = await getSubscriptionToken(inngest, {
    channel: webhookTriggerChannel(),
    topics: ["status"],
  });

  return token;
}