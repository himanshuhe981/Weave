import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const executionsRouter = createTRPCRouter({

    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.execution.findUniqueOrThrow({
                where: { id: input.id, workflow: { userId: ctx.auth.user.id } },
                include: {
                    workflow: { select: { id: true, name: true } },
                },
            });
        }),

    getMany: protectedProcedure
        .input(z.object({
            page:     z.number().default(PAGINATION.DEAFULT_PAGE),
            pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE),
            search:   z.string().default(""),
        }))
        .query(async ({ ctx, input }) => {
            const { page, pageSize } = input;
            const [items, totalCount] = await Promise.all([
                prisma.execution.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: { workflow: { userId: ctx.auth.user.id } },
                    orderBy: { startedAt: "desc" },
                    include: { workflow: { select: { id: true, name: true } } },
                }),
                prisma.execution.count({ where: { workflow: { userId: ctx.auth.user.id } } }),
            ]);

            const totalPages      = Math.ceil(totalCount / pageSize);
            const hasNextPage     = page < totalPages;
            const hasPreviousPage = page > 1;

            return { items, page, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage };
        }),

    /** Delete a single execution (must belong to current user's workflow) */
    deleteOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const execution = await prisma.execution.findUniqueOrThrow({
                where: { id: input.id },
                include: { workflow: { select: { userId: true } } },
            });
            if (execution.workflow.userId !== ctx.auth.user.id) {
                throw new Error("Not authorised");
            }
            return prisma.execution.delete({ where: { id: input.id } });
        }),

    /** Delete ALL executions that belong to the current user's workflows */
    deleteAll: protectedProcedure
        .mutation(async ({ ctx }) => {
            return prisma.execution.deleteMany({
                where: { workflow: { userId: ctx.auth.user.id } },
            });
        }),
});