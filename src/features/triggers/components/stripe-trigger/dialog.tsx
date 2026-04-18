"use client";

import { NodeDialog, DialogSection, VarChip, CodeBlock, SetupStep, InfoBanner } from "@/components/node-dialog";
import { useParams } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const testCliCommand = `stripe listen --forward-to ${webhookUrl}`;

  return (
    <NodeDialog
      open={open}
      onOpenChange={onOpenChange}
      icon="/logos/stripe.svg"
      title="Stripe Trigger"
      subtitle="Fires when Stripe sends a webhook event to your endpoint"
      badge="Trigger"
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-4">
          <DialogSection title="Webhook Endpoint">
            <CodeBlock code={webhookUrl} copyLabel="Stripe webhook URL" />
          </DialogSection>

          <DialogSection title="Setup in Stripe Dashboard">
            <div className="space-y-2.5">
              <SetupStep n={1}>Open <strong>Stripe Dashboard</strong> → Developers → Webhooks.</SetupStep>
              <SetupStep n={2}>Click <strong>&quot;Add endpoint&quot;</strong> and paste the URL above.</SetupStep>
              <SetupStep n={3}>Select the events to listen for — e.g. <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">payment_intent.succeeded</code>.</SetupStep>
              <SetupStep n={4}>Click <strong>Save</strong> — Stripe will show a <strong>Signing Secret</strong>. Store it securely; Weave validates signatures automatically.</SetupStep>
            </div>
          </DialogSection>

          <DialogSection title="Test Locally">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Use the Stripe CLI to forward live events to your local server:</p>
            <CodeBlock code={testCliCommand} copyLabel="Stripe CLI command" />
          </DialogSection>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <DialogSection title="Available Variables" hint="click any to copy">
            <VarChip variable="stripe.eventType" label="Event type" description='e.g. "payment_intent.succeeded"' />
            <VarChip variable="stripe.amount" label="Payment amount" description="in smallest currency unit (cents for USD)" />
            <VarChip variable="stripe.currency" label="Currency code" description='e.g. "usd"' />
            <VarChip variable="stripe.customerId" label="Stripe customer ID" />
            <VarChip variable="stripe.paymentIntentId" label="Payment intent ID" />
            <VarChip variable="stripe.customerEmail" label="Customer email" description="if available on the customer" />
            <VarChip variable="json stripe" label="Full event payload as JSON" description="for AI nodes or HTTP requests" />
          </DialogSection>

          <InfoBanner variant="warning">
            <strong>Amount is in cents.</strong> Stripe sends amounts in the smallest currency unit — $25.00 arrives as <code className="font-mono">2500</code>. Divide by 100 in your prompt or transform node.
          </InfoBanner>

          <InfoBanner variant="info">
            Any field from the Stripe event object is accessible as <code className="font-mono text-[10px]">{"{{stripe.fieldName}}"}</code>. Use <code className="font-mono text-[10px]">{"{{json stripe}}"}</code> to pass the entire payload.
          </InfoBanner>
        </div>
      </div>
    </NodeDialog>
  );
};