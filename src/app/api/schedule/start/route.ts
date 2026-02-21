import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth"; // adjust to your auth helper
import prisma from "@/lib/db";
import z from "zod";

const bodySchema = z.object({ workflowId: z.string().min(1) });
  export async function POST(request: NextRequest) {
try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = bodySchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { workflowId } = body.data;

    // Verify the authenticated user owns this workflow
    await prisma.workflow.findUniqueOrThrow({
      where: { id: workflowId, userId: session.user.id },
    });

    await inngest.send({ name: "schedule/start", data: { workflowId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("schedule/start error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}