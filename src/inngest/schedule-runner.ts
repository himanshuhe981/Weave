import { inngest } from "./client";
import prisma from "@/lib/db";
import { NonRetriableError } from "inngest";
import { NodeType } from "@prisma/client";
import { CronExpressionParser } from "cron-parser";



export const scheduleRunner = inngest.createFunction(
  { id: "schedule-runner" },
  { event: "schedule/start" },
  async ({ event, step }) => {
    const { workflowId } = event.data;

    if (!workflowId) {
      throw new NonRetriableError("Missing workflowId");
    }

    console.log("SCHEDULE RUNNER STARTED", workflowId);
    
    while (true) {
      const workflow = await step.run("load-workflow", async () => {
        return prisma.workflow.findUnique({
          where: { id: workflowId },
          include: { nodes: true },
        });
      });

      

      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }

      console.log("Node types in DB:", workflow.nodes.map(n => n.type));

      const scheduleNode = workflow.nodes.find(
        (n) => n.type === NodeType.SCHEDULE_TRIGGER
      );

      if (!scheduleNode) return;

      const data = scheduleNode.data as {
        cron?: string;
        timezone?: string;
        enabled?: boolean;
      };

      // 🛑 Stop if disabled
      if (!data?.enabled) {
        return;
      }

      if (!data?.cron) {
        throw new NonRetriableError("Missing cron expression");
      }

      const interval = CronExpressionParser.parse(data.cron, {
        tz: data.timezone || "UTC",
      });

      const nextDate = interval.next().toDate();

      await step.sleepUntil(`next-run-${workflowId}`, nextDate);

      await step.run("trigger-workflow", async () => {
        await inngest.send({
          name: "workflows/execute.workflow",
          data: {
            workflowId,
            initialData: {
              schedule: {
                triggeredAt: new Date().toISOString(),
              },
            },
          },
        });
      });

      // loop continues automatically
    }
  }
);
