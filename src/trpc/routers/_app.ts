import prisma from '@/lib/db';
import { createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
import { email } from 'zod';


export const appRouter = createTRPCRouter({
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