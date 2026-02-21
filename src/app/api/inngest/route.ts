import {serve} from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";
import { scheduleRunner } from "@/inngest/schedule-runner";

export const {GET,POST,PUT}= serve({
    client: inngest,
    functions: [
        executeWorkflow,
        scheduleRunner    
    ],
});