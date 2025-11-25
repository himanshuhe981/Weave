import prisma from '@/lib/db';
import { baseProcedure, createTRPCRouter, premiumProcedure, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { email } from 'zod';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';


export const appRouter = createTRPCRouter({
  testAi: premiumProcedure.mutation(async () => {
    await inngest.send({
    name: "execute/ai",
  });
  return {success: true, message: "Job queued"}
}),
  getWorkflows: protectedProcedure.query(({ctx}) => {
      return prisma.workflow.findMany();
    }),
    createWorkflow: protectedProcedure.mutation(async ()=>{
      await inngest.send({
        name:"test/hello.world",
        data:{
          email:"antonio@gmail.com",
        },
      });
      return {success: true, message: "Job queued"}
    }),
});
export type AppRouter = typeof appRouter;