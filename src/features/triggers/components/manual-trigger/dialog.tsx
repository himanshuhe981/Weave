"use client";

import { NodeDialog, DialogSection, VarChip, SetupStep, InfoBanner } from "@/components/node-dialog";
import { PlayIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManualTriggerDialog = ({ open, onOpenChange }: Props) => (
  <NodeDialog
    open={open}
    onOpenChange={onOpenChange}
    icon={PlayIcon}
    title="Manual Trigger"
    subtitle="Runs the workflow when you click the Run button — great for testing"
    badge="Trigger"
  >
    <InfoBanner variant="tip">
      This node has no configuration fields. It simply waits for you to press <strong>&quot;Run workflow&quot;</strong> at the bottom of the canvas.
    </InfoBanner>

    <DialogSection title="How It Works">
      <div className="space-y-2.5">
        <SetupStep n={1}>Make sure your workflow is saved (use the Save button in the top-right header).</SetupStep>
        <SetupStep n={2}>Click the <strong>&quot;Run workflow&quot;</strong> button that appears at the bottom of the canvas.</SetupStep>
        <SetupStep n={3}>The workflow executes immediately. Check the <strong>Executions</strong> tab to see logs and output.</SetupStep>
        <SetupStep n={4}>Each connected node runs in sequence — outputs from one node feed into the next.</SetupStep>
      </div>
    </DialogSection>

    <DialogSection title="Available Variables" hint="click to copy">
      <VarChip variable="trigger.timestamp" label="ISO timestamp of when the run started" />
      <VarChip variable="trigger.workflowId" label="ID of this workflow" />
    </DialogSection>

    <DialogSection title="Tips for Testing">
      <div className="space-y-2.5">
        <SetupStep n={1}><strong>Select a node</strong> on the canvas to see its toolbar — the trash icon deletes it.</SetupStep>
        <SetupStep n={2}>If an execution fails, open it in the <strong>Executions</strong> tab for a step-by-step error trace.</SetupStep>
        <SetupStep n={3}>Replace this node with a Webhook, Schedule, or Stripe Trigger for production automation.</SetupStep>
      </div>
    </DialogSection>
  </NodeDialog>
);