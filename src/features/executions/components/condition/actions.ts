"use server"

import { conditionChannel } from "@/inngest/channels/condition";
import { inngest } from "@/inngest/client"
import { getSubscriptionToken, type Realtime } from "@inngest/realtime"

export type ConditionToken = Realtime.Token<
    typeof conditionChannel,
    ["status"]
>;

export async function fetchConditionRealtimeToken():
Promise<ConditionToken> {
    try { const token = await getSubscriptionToken(inngest, {
        channel: conditionChannel(),
        topics: ["status"]
    });
    return token; } catch { return null as any; }
};
