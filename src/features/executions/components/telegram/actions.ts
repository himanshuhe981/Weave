"use server";

import { telegramChannel } from "@/inngest/channels/telegram";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type TelegramToken = Realtime.Token<
  typeof telegramChannel,
  ["status"]
>;

export async function fetchTelegramRealtimeToken(): Promise<TelegramToken> {
  return getSubscriptionToken(inngest, {
    channel: telegramChannel(),
    topics: ["status"],
  });
}
