"use server"

import { webhookTriggerChannel } from "@/inngest/channels/webhook-trigger";
import { inngest } from "@/inngest/client";
import {
  getSubscriptionToken,
  type Realtime,
} from "@inngest/realtime";

export type WebhookTriggerRealtimeToken = Realtime.Token<
  typeof webhookTriggerChannel,
  ["status"]
>;

export async function fetchWebhookTriggerRealtimeToken(): Promise<WebhookTriggerRealtimeToken> {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: webhookTriggerChannel(),
      topics: ["status"],
    });
    return token;
  } catch {
    // Inngest dev server not running — return a null-safe token so the page still loads
    return null as unknown as WebhookTriggerRealtimeToken;
  }
}