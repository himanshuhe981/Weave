import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await context.params;

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
      name: "workflows/execute.workflow",
      data: {
        workflowId,
        initialData: {
          webhook: {
            body,
            headers: Object.fromEntries(request.headers.entries()),
            query: Object.fromEntries(
              request.nextUrl.searchParams.entries()
            ),
          },
        },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    // Log the real error so it's visible in terminal output
    console.error("[Webhook Route] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Webhook processing failed", detail: message },
      { status: 500 }
    );
  }
}