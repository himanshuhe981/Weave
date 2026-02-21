import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
  const { workflowId } = await request.json();

  await inngest.send({
    name: "schedule/start",
    data: { workflowId },
  });

  return NextResponse.json({ success: true });
}