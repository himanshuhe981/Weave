import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await context.params;

    const secret = request.headers.get("x-webhook-secret");

    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { id: true },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    await inngest.send({
  name: "workflows/execute.workflow", // ✅ MATCH YOUR FUNCTION
  data: {
    workflowId,
    initialData: {
      webhook: {
        body,
        headers: Object.fromEntries(
        [...request.headers.entries()].filter(
          ([key]) =>
            ![
              "authorization",
              "cookie",
              "set-cookie",
              "x-forwarded-for"
            ].includes(key.toLowerCase())
        )
      ),
        query: Object.fromEntries(
          request.nextUrl.searchParams.entries()
        ),
      },
    },
  },
});

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}