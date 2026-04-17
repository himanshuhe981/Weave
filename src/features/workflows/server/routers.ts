import { PAGINATION } from "@/config/constants";
import { NodeType } from "@prisma/client";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { polarClient } from "@/lib/polar";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import type { Node, Edge } from "@xyflow/react";
import { sendWorkflowExecution } from "@/inngest/utils";
import { encrypt } from "@/lib/encryption";

const checkUserPremium = async (userId: string) => {
    try {
        const customer = await polarClient.customers.getStateExternal({
            externalId: userId,
        });
        return !!(customer.activeSubscriptions && customer.activeSubscriptions.length > 0);
    } catch (error) {
        console.error("polar.getStateExternal failed", { userId: userId, error });
        return false;
    }
};



export const workflowsRouter = createTRPCRouter({

    execute: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({input, ctx}) => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: {
                    id: input.id,
                    userId: ctx.auth.user.id,
                },
            });

            await sendWorkflowExecution({
                workflowId: input.id,
            });

            return workflow;
        }),

    getUsage: protectedProcedure.query(async ({ctx}) => {
        const count = await prisma.workflow.count({
            where: { userId: ctx.auth.user.id },
        });

        return {
            count,
            limit: 5,
        };
    }),

    create: protectedProcedure.mutation(async ({ctx}) => {
        const isPremium = await checkUserPremium(ctx.auth.user.id);

        if (!isPremium) {
            return prisma.$transaction(async (tx) => {
                const count = await tx.workflow.count({
                    where: { userId: ctx.auth.user.id },
                });
                if (count >= 5) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Workflow credit limit reached. Upgrade to Pro for unlimited workflows."
                    });
                }
                return tx.workflow.create({
                    data: {
                        name: generateSlug(3),
                        userId: ctx.auth.user.id,
                        nodes: {
                            create: {
                                type: NodeType.INITIAL,
                                position: { x: 0, y: 0 },
                                name: NodeType.INITIAL,
                            },
                        },
                    },
                });
            });
        }

        return prisma.workflow.create({
            data: {
                name: generateSlug(3),
                userId: ctx.auth.user.id,
                nodes: {
                    create: {
                        type: NodeType.INITIAL,
                        position: { x: 0, y: 0 },
                        name: NodeType.INITIAL,
                    },
                },
            },
        });
    }),
    
    deployDemo: protectedProcedure
        .input(z.object({
            type: z.enum(["summarizer", "triage"]),
        }))
        .mutation(async ({ ctx, input }) => {
            const { type } = input;
            const userId = ctx.auth.user.id;

            const demoName = type === "summarizer"
                ? "__demo__ AI Summarizer Bot"
                : "__demo__ Smart Ticket Triage";

            // IDEMPOTENT: return existing demo if user already has one
            const existing = await prisma.workflow.findFirst({
                where: { userId, name: demoName },
                select: { id: true },
            });
            if (existing) {
                return { id: existing.id, demoType: type };
            }

            // First time: create the workflow scaffold
            const workflow = await prisma.workflow.create({
                data: { name: demoName, userId }
            });

            try {
                if (type === "summarizer") {
                    const [triggerNode, aiNode, discordNode] = await Promise.all([
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "WEBHOOK_TRIGGER",
                                name: "WEBHOOK_TRIGGER",
                                position: { x: 100, y: 200 },
                                data: {}
                            }
                        }),
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "GEMINI",
                                name: "GEMINI",
                                position: { x: 500, y: 200 },
                                // variableName, credentialId, model, userPrompt â€” all read from data by executor
                                data: {
                                    variableName: "myGemini",
                                    model: "gemini-2.5-flash-lite",
                                    systemPrompt: "You are a helpful assistant that summarizes content.",
                                    userPrompt: "Summarize the following content as 3 concise bullet points:\n{{webhook.body.text}}",
                                }
                            }
                        }),
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "DISCORD",
                                name: "DISCORD",
                                position: { x: 900, y: 200 },
                                // Discord executor reads: variableName, webhookUrl, content, username
                                data: {
                                    variableName: "myDiscord",
                                    content: "ðŸ“‹ Summary:\n{{myGemini.text}}",
                                }
                            }
                        }),
                    ]);

                    await prisma.connection.createMany({
                        data: [
                            { workflowId: workflow.id, fromNodeId: triggerNode.id, toNodeId: aiNode.id, fromOutput: "source-1", toInput: "target-1" },
                            { workflowId: workflow.id, fromNodeId: aiNode.id, toNodeId: discordNode.id, fromOutput: "source-1", toInput: "target-1" },
                        ]
                    });
                }
                else if (type === "triage") {
                    const [triggerNode, aiNode, conditionNode, slackNode, discordNode] = await Promise.all([
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "MANUAL_TRIGGER",
                                name: "MANUAL_TRIGGER",
                                position: { x: 100, y: 300 },
                                data: {}
                            }
                        }),
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "GEMINI",
                                name: "GEMINI",
                                position: { x: 500, y: 300 },
                                data: {
                                    variableName: "myGemini",
                                    model: "gemini-2.5-flash-lite",
                                    systemPrompt: "You are a support ticket classifier. Respond with exactly one word: 'urgent' or 'normal'.",
                                    userPrompt: "Classify this support ticket:\n\nSubject: Server Down!\nOur production database is unreachable and all our customers are getting 500 errors. Please help immediately!",
                                }
                            }
                        }),
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "CONDITION",
                                name: "CONDITION",
                                position: { x: 900, y: 300 },
                                data: {
                                    variableName: "myCondition",
                                    rules: [{ left: "{{myGemini.text}}", operator: "contains", right: "urgent" }],
                                    combinator: "AND"
                                }
                            }
                        }),
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "SLACK",
                                name: "SLACK",
                                position: { x: 1300, y: 150 },
                                // Slack executor reads: variableName, webhookUrl, content
                                data: {
                                    variableName: "mySlack",
                                    content: "ðŸš¨ URGENT Ticket:\n{{myGemini.text}}",
                                }
                            }
                        }),
                        prisma.node.create({
                            data: {
                                workflowId: workflow.id,
                                type: "DISCORD",
                                name: "DISCORD",
                                position: { x: 1300, y: 450 },
                                data: {
                                    variableName: "myDiscord",
                                    content: "ðŸ“‹ Normal Ticket:\n{{myGemini.text}}",
                                }
                            }
                        }),
                    ]);

                    await prisma.connection.createMany({
                        data: [
                            { workflowId: workflow.id, fromNodeId: triggerNode.id, toNodeId: aiNode.id, fromOutput: "source-1", toInput: "target-1" },
                            { workflowId: workflow.id, fromNodeId: aiNode.id, toNodeId: conditionNode.id, fromOutput: "source-1", toInput: "target-1" },
                            { workflowId: workflow.id, fromNodeId: conditionNode.id, toNodeId: slackNode.id, fromOutput: "true", toInput: "target-1" },
                            { workflowId: workflow.id, fromNodeId: conditionNode.id, toNodeId: discordNode.id, fromOutput: "false", toInput: "target-1" },
                        ]
                    });
                }
            } catch (err) {
                await prisma.workflow.delete({ where: { id: workflow.id } }).catch(() => null);
                throw err;
            }

            return { id: workflow.id, demoType: type };
        }),

    attachDemoCredentials: protectedProcedure
        .input(z.object({
            workflowId: z.string(),
            credentials: z.object({
                geminiKey: z.string().optional(),
                discordWebhook: z.string().optional(),
                slackWebhook: z.string().optional(),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            const { workflowId, credentials } = input;
            const userId = ctx.auth.user.id;

            await prisma.workflow.findUniqueOrThrow({ where: { id: workflowId, userId } });

            const nodes = await prisma.node.findMany({
                where: { workflowId },
                select: { id: true, type: true, data: true },
            });

            // Create the Gemini credential once, encrypting the key before storage
            // (geminiExecutor calls decrypt(credential.value) â€” so the stored value must be encrypted)
            let geminiCredId: string | null = null;
            if (credentials.geminiKey) {
                const cred = await prisma.credential.create({
                    data: { name: "Demo Gemini Key", value: encrypt(credentials.geminiKey), type: "GEMINI", userId }
                });
                geminiCredId = cred.id;
            }

            // Update each node â€” writing all values into the data JSON blob
            // (executors read from node.data, not from the separate node.credentialId column)
            await Promise.all(nodes.map(async (node) => {
                const currentData = (node.data as Record<string, unknown>) || {};

                if (node.type === "GEMINI" && geminiCredId) {
                    await prisma.node.update({
                        where: { id: node.id },
                        data: {
                            credentialId: geminiCredId,
                            data: { ...currentData, credentialId: geminiCredId },
                        }
                    });
                }
                if (node.type === "DISCORD" && credentials.discordWebhook) {
                    await prisma.node.update({
                        where: { id: node.id },
                        data: { data: { ...currentData, webhookUrl: credentials.discordWebhook } }
                    });
                }
                if (node.type === "SLACK" && credentials.slackWebhook) {
                    await prisma.node.update({
                        where: { id: node.id },
                        data: { data: { ...currentData, webhookUrl: credentials.slackWebhook } }
                    });
                }
            }));

            // Return updated node data so the client can refresh the canvas
            const updatedNodes = await prisma.node.findMany({
                where: { workflowId },
                select: { id: true, type: true, data: true, credentialId: true },
            });

            return { success: true, nodes: updatedNodes };
        }),

    remove: protectedProcedure
        .input(z.object({id: z.string()}))
        .mutation(({ctx,input}) => {
            return prisma.workflow.delete({
                where:{
                    id: input.id,
                    userId: ctx.auth.user.id,
                    
                }
            })
        }),

    update: protectedProcedure
    .input(
        z.object({
            id: z.string(),
             nodes: z.array(
                z.object({
                    id: z.string(),
                    type: z.string().nullish(),
                    position: z.object({ x: z.number(),y: z.number() }),
                    data: z.record(z.string(), z.any()).optional(),
                }),
             ),
             edges: z.array(
                z.object({
                    source: z.string(),
                    target: z.string(),
                    sourceHandle: z.string().nullish(),
                    targetHandle: z.string().nullish(),
                }),
             ),
            }),
        )
    .mutation(async({ctx, input }) => {

        const {id, nodes , edges } = input;
        
        const workflow = await prisma.workflow.findUniqueOrThrow({
            where: {id, userId: ctx.auth.user.id}
        });

        // Transaction to ensure copnsistency

        return await prisma.$transaction(async (tx) => {
            // Delete existing nodes and connections (cascade deletes connection)

            await tx.node.deleteMany({
                where: { workflowId: id},
            });

            // Create nodes
            await tx.node.createMany({
                data: nodes.map((node) => ({
                    id: node.id,
                    workflowId: id,
                    name: node.type || "unknown",
                    type: node.type as NodeType,
                    position: node.position,
                    data: node.data || {},
                })),
            });

            await tx.connection.createMany({
                data: edges.map((edge) => ({
                    workflowId: id,
                    fromNodeId: edge.source,
                    toNodeId: edge.target,
                    fromOutput: edge.sourceHandle || "main",
                    toInput: edge.targetHandle || "main",
                })),
            });

            // Update workflow's updateAt timestamp
            await tx.workflow.update({
                where: { id },
                data: {updatedAt: new Date()}
            });

            return workflow;
        },{
            maxWait: 5000,
            timeout: 20000 // to allow upto 20 seconds (fixes 7.7s prisma timeout crash)
        });
           
    }),

    updateName: protectedProcedure
    .input(z.object({id: z.string(), name: z.string().min(1)}))
    .mutation(({ctx, input }) => {
        return prisma.workflow.update({
            where: {id: input.id, userId: ctx.auth.user.id},
            data: {name: input.name}, 
        });
    }),

    getOne: protectedProcedure
     .input(z.object({ id: z.string()}))
     .query(async ({ctx,input}) => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
            where: { id: input.id, userId: ctx.auth.user.id },
            include: {nodes: true, connections:true},
        });

        
        // Transform server nodes to react-flow compatible nodes

        const nodes: Node[] = workflow.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position as { x: number, y:number},
            data: (node.data as Record<string, unknown> ) || {},
        }));

         // Transform server connections to react-flow compatible edges
        
         const edges: Edge[] = workflow.connections.map((connection) => ({
            id: connection.id,
            source: connection.fromNodeId,
            target: connection.toNodeId,
            sourceHandle: connection.fromOutput,
            targetHandle: connection.toInput,
         }));

         return {
            id: workflow.id,
            name: workflow.name,
            nodes,
            edges,
         };
        
     }),

     getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEAFULT_PAGE),
                pageSize: z
                    .number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),


            })
        )
     .query(async({ctx,input}) => {
        const {page,pageSize,search} = input;
        const [items,totalCount] = await Promise.all([
            prisma.workflow.findMany({
                skip: (page-1) * pageSize,
                take: pageSize,
                where: {
                    userId: ctx.auth.user.id,
                    // Exclude demo workflows (prefixed with __demo__)
                    NOT: { name: { startsWith: "__demo__" } },
                    name:{
                        contains:search,
                        mode:"insensitive",
                    },
                },
                orderBy: {
                    updatedAt: "desc",
                },
            }),
         prisma.workflow.count({
            where: {
                 userId: ctx.auth.user.id,
                 NOT: { name: { startsWith: "__demo__" } },
                 name:{
                        contains:search,
                        mode:"insensitive",
                    },
            },
        }),
        ])

        const totalPages = Math.ceil(totalCount/pageSize);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            hasNextPage,
            hasPreviousPage,
        }

     }),

});