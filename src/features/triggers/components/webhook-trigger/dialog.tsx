"use client";

import { NodeDialog, DialogSection, VarChip, CodeBlock, SetupStep, InfoBanner } from "@/components/node-dialog";
import { useParams } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WebhookTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/${workflowId}`;

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alice","email":"alice@example.com"}'`;

  const jsExample = `await fetch("${webhookUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice" }),
});`;

  return (
    <NodeDialog
      open={open}
      onOpenChange={onOpenChange}
      icon="/logos/webhook.svg"
      title="Webhook Trigger"
      subtitle="Starts the workflow when an HTTP POST request is received"
      badge="Trigger"
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Endpoint URL */}
          <DialogSection title="Your Endpoint URL">
            <CodeBlock code={webhookUrl} copyLabel="URL" />
            <InfoBanner variant="tip">
              Save your workflow first — the endpoint won&apos;t accept requests until it&apos;s been saved at least once.
            </InfoBanner>
          </DialogSection>

          {/* How it works */}
          <DialogSection title="How It Works">
            <div className="space-y-2.5">
              <SetupStep n={1}>Send an HTTP <strong>POST</strong> request to the URL above from any service, script, or tool.</SetupStep>
              <SetupStep n={2}>Include a JSON body — all fields become available as template variables in later nodes.</SetupStep>
              <SetupStep n={3}>The workflow runs immediately and processes the payload.</SetupStep>
            </div>
          </DialogSection>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Code examples */}
          <DialogSection title="Request Examples">
            <CodeBlock code={curlExample} label="cURL" copyLabel="cURL command" />
            <CodeBlock code={jsExample} label="JavaScript (fetch)" copyLabel="JS snippet" />
          </DialogSection>

          {/* Variables */}
          <DialogSection title="Available Variables" hint="click any to copy">
            <VarChip variable="webhook.body" label="Full request body" description="access nested fields with dot notation" />
            <VarChip variable="webhook.body.fieldName" label="Specific field" description="e.g. webhook.body.email" />
            <VarChip variable="webhook.headers" label="All request headers" />
            <VarChip variable="webhook.query" label="URL query parameters" description="e.g. ?page=2" />
            <VarChip variable="webhook.method" label="HTTP method used" description="always POST for this trigger" />
            <VarChip variable="json webhook.body" label="Full body as JSON string" description="for passing to AI prompts" />
          </DialogSection>
        </div>
      </div>
    </NodeDialog>
  );
};