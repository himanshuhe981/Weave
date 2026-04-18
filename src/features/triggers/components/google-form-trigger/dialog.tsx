"use client";

import { NodeDialog, DialogSection, VarChip, CodeBlock, SetupStep, InfoBanner } from "@/components/node-dialog";
import { useParams } from "next/navigation";
import { generateGoogleFormScript } from "./utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;
  const script = generateGoogleFormScript(webhookUrl);

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      toast.success("Apps Script copied to clipboard");
    } catch {
      toast.error("Failed to copy script");
    }
  };

  return (
    <NodeDialog
      open={open}
      onOpenChange={onOpenChange}
      icon="/logos/google-forms.svg"
      title="Google Form Trigger"
      subtitle="Fires when a Google Form response is submitted"
      badge="Trigger"
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-4">
          <DialogSection title="Your Webhook URL">
            <CodeBlock code={webhookUrl} copyLabel="Webhook URL" />
          </DialogSection>

          <DialogSection title="Setup Steps">
            <div className="space-y-2.5">
              <SetupStep n={1}>Open your Google Form → click the <strong>⋮ menu</strong> (three dots, top-right) → <strong>Script editor</strong>.</SetupStep>
              <SetupStep n={2}>Delete any existing code. Copy and paste the Apps Script below (it already contains your webhook URL).</SetupStep>
              <SetupStep n={3}>Click <strong>Save</strong> (disk icon) and give the project a name.</SetupStep>
              <SetupStep n={4}>Click <strong>Triggers</strong> (clock icon, left sidebar) → <strong>Add Trigger</strong>.</SetupStep>
              <SetupStep n={5}>Choose: <em>Function</em> → <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">onFormSubmit</code> · <em>Event source</em> → From form · <em>Event type</em> → On form submit → <strong>Save</strong>.</SetupStep>
              <SetupStep n={6}>Authorize the script when prompted. Your form is now connected. Test by submitting a response.</SetupStep>
            </div>
          </DialogSection>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <DialogSection title="Google Apps Script">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              This script is pre-configured with your webhook URL. Paste it directly into the Apps Script editor.
            </p>
            <button
              type="button"
              onClick={copyScript}
              className="w-full h-8 rounded-[10px] text-[11px] font-semibold bg-zinc-800/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 border border-zinc-700/50 dark:border-zinc-300/40 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all duration-150"
            >
              Copy Apps Script →
            </button>
            <InfoBanner variant="info">
              The script automatically maps every question in your form to a named field, so <code className="font-mono text-[10px]">{"{{googleForm.responses['Question text']}}"}</code> just works.
            </InfoBanner>
          </DialogSection>

          <DialogSection title="Available Variables" hint="click to copy">
            <VarChip variable="googleForm.respondentEmail" label="Respondent's email address" description="only if email collection is on" />
            <VarChip variable="googleForm.responses['Question text']" label="Answer to a specific question" description="use exact question label" />
            <VarChip variable="googleForm.formId" label="Google Form ID" />
            <VarChip variable="googleForm.responseId" label="Unique ID of this submission" />
            <VarChip variable="googleForm.timestamp" label="Submission timestamp" />
            <VarChip variable="json googleForm.responses" label="All answers as JSON string" description="for AI nodes" />
          </DialogSection>

          <InfoBanner variant="tip">
            Rename your form questions to short, readable names (e.g. &quot;Name&quot;, &quot;Email&quot;) — they become your variable keys.
          </InfoBanner>
        </div>
      </div>
    </NodeDialog>
  );
};