// import { NonRetriableError, step } from "inngest";
// import { inngest } from "./client";
// import prisma from "@/lib/db";
// import { topologicalSort } from "./utils";
// import { Executionstatus, NodeType } from "@prisma/client";
// import { getExecutor } from "@/features/executions/lib/executor-registry";
// import { httpRequestChannel } from "./channels/http-requests";
// import {  manualTriggerChannel } from "./channels/manual-trigger";
// import { googleFormTriggerChannel } from "./channels/google-form-trigger";
// import { stripeTriggerChannel } from "./channels/stripe-trigger";
// import { geminiChannel } from "./channels/gemini";
// import { openAiChannel } from "./channels/openai";
// import { anthropicChannel } from "./channels/anthropic";
// import { discordChannel } from "./channels/discord";
// import { slackChannel } from "./channels/slack";
// import { telegramChannel } from "./channels/telegram";
// import { conditionChannel } from "./channels/condition";


// export const executeWorkflow  = inngest.createFunction(
//   { 
//     id: "execute-workflow",
//     retries: process.env.NODE_ENV === "production" ? 3 : 0,
//     onFailure: async ({event, step }) => {
//       return prisma.execution.update({
//         where: {inngestEventId: event.data.event.id },
//         data: {
//           status: Executionstatus.FAILED,
//           error: event.data.error.message,
//           errorStack: event.data.error.stack,
//         },
//       });
//     },
//    },
//   { 
//     event: "workflows/execute.workflow",
//     channels: [
//       httpRequestChannel(),
//       manualTriggerChannel(),
//       googleFormTriggerChannel(),
//       stripeTriggerChannel(),
//       geminiChannel(),
//       openAiChannel(),
//       anthropicChannel(),
//       discordChannel(),
//       slackChannel(),
//       telegramChannel(),
//       conditionChannel(),


//     ],  
//   },
//   async ({ event, step, publish}) => {
//     const inngestEventId = event.id;
//     const workflowId = event.data.workflowId;
 
//     if(!inngestEventId || !workflowId) {
//       throw new NonRetriableError("Event ID or Workflow ID is  missing");
//     }

//     await step.run("create-execution",async () => {
//       return prisma.execution.create({
//         data: {
//           workflowId,
//           inngestEventId,
//         },
//       });
//     });

//     const sortedNodes = await step.run("prepare-workflow", async () => {
//       const workflow = await prisma.workflow.findUniqueOrThrow({
//         where: { id: workflowId },
//         include: {
//           nodes: true,
//           connections: true,
//         }
//       });
//       return topologicalSort(workflow.nodes, workflow.connections);
//     });

//     const userId = await step.run("find-user-id", async () => {
//       const workflow = await prisma.workflow.findUniqueOrThrow({
//         where: { id: workflowId },
//         select: {
//           userId: true
//         },
//       });

//       return workflow.userId;

//     })

//     // Initialize context with any initial data from the trigger
//     let context = event.data.initialData || {};

//     //execute each node 
//     for (const node of sortedNodes){
//       const executor = getExecutor(node.type as NodeType);
//       context = await executor({
//         data: node.data as Record<string, unknown>,
//         nodeId: node.id,
//         userId,
//         context,
//         step,
//         publish,
//       });
//     }

//     await step.run("update-execution", async () => {
//       return prisma.execution.update({
//         where: {inngestEventId, workflowId},
//         data: {
//           status: Executionstatus.SUCCESS,
//           completedAt: new Date(),
//           output: context,
//         }
//       })
//     })

//     return { 
//         workflowId,
//         result: context,
//      };
    
//   },
// );


//-------------------for conditon node ------------

import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { Executionstatus, NodeType } from "@prisma/client";
import { getExecutor } from "@/features/executions/lib/executor-registry";

import { httpRequestChannel } from "./channels/http-requests";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiChannel } from "./channels/gemini";
import { openAiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { telegramChannel } from "./channels/telegram";
import { conditionChannel } from "./channels/condition";
import { jsonTransformChannel } from "./channels/json-transform";
import { delayChannel } from "./channels/delay";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    onFailure: async ({ event }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: Executionstatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
      telegramChannel(),
      conditionChannel(),
      jsonTransformChannel(),
      delayChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or Workflow ID is missing");
    }

    // Create execution
    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const workflow = await step.run("load-workflow", async () => {
  const wf = await prisma.workflow.findUniqueOrThrow({
    where: { id: workflowId },
    include: {
      nodes: true,
      connections: true,
    },
  });

  return JSON.parse(JSON.stringify(wf));
});

    const sortedNodes = topologicalSort(
      workflow.nodes,
      workflow.connections
    );

    if (!sortedNodes.length) {
      throw new NonRetriableError("Workflow has no nodes");
    }

    // Get userId
    const userId = await step.run("find-user-id", async () => {
      const wf = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: { userId: true },
      });
      return wf.userId;
    });

    let context = event.data.initialData || {};

    //  BRANCHING ENGINE
    let currentNodeId = sortedNodes[0].id;

    // Safety guard (prevents infinite loops)
    let executionCounter = 0;
    const MAX_STEPS = 100;

    while (currentNodeId && executionCounter < MAX_STEPS) {
      executionCounter++;

      const node = workflow.nodes.find((n: { id: string; }) => n.id === currentNodeId);
      if (!node) break;

      const executor = getExecutor(node.type as NodeType);

      const result = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
        publish,
      });

      const { __branch, ...cleanContext } = result;
      context = cleanContext;

      // CONDITION BRANCH
      if (node.type === NodeType.CONDITION && result.__branch) {
  const branch = result.__branch; // "true" | "false"

        const nextConnection = workflow.connections.find(
          (c: { fromNodeId: any; fromOutput: {}; }) =>
            c.fromNodeId === node.id &&
            c.fromOutput === branch
        );

        if (!nextConnection) break;

        currentNodeId = nextConnection.toNodeId;
        continue;
      }

      // 🔹 NORMAL FLOW
      const nextConnection = workflow.connections.find(
        (c: { fromNodeId: any; }) => c.fromNodeId === node.id
      );

      if (!nextConnection) break;

      currentNodeId = nextConnection.toNodeId;
    }

    // Prevent infinite loop crash
    if (executionCounter >= MAX_STEPS) {
      throw new NonRetriableError("Workflow exceeded maximum step count");
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: Executionstatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return {
      workflowId,
      result: context,
    };
  }
);
