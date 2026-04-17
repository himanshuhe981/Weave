"use server"

import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger"
import { inngest } from "@/inngest/client"
import { getSubscriptionToken,type Realtime } from "@inngest/realtime"


export type GoogleFormTriggerToken = Realtime.Token<
    typeof googleFormTriggerChannel,
    ["status"]
>;

export async function fetchGoogleFormTriggerRealtimeToken():
Promise<GoogleFormTriggerToken> {
    try { const token = await getSubscriptionToken(inngest, {
        channel: googleFormTriggerChannel(),
        topics: ["status"]
    });

    return token; } catch { return null as any; }     
};
