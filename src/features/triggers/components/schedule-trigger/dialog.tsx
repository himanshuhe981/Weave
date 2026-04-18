"use client";

import { NodeDialog, DialogSection, VarChip, SetupStep, InfoBanner, INPUT_CLS, FieldRow } from "@/components/node-dialog";
import { Switch } from "@/components/ui/switch";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { generateCronFromPreset } from "./utils";
import { ClockIcon } from "lucide-react";

type FormValues = {
  preset: string;
  cron: string;
  timezone: string;
  enabled: boolean;
};

function detectPresetFromCron(cron: string) {
  if (cron === "*/5 * * * *") return "every-5-min";
  if (cron === "0 * * * *") return "hourly";
  if (cron === "0 9 * * *") return "daily-9am";
  if (cron === "0 9 * * 1") return "weekly-monday";
  if (cron === "0 9 1 * *") return "monthly-1st";
  return "custom";
}

const PRESETS = [
  { value: "every-5-min",   label: "Every 5 minutes",       cron: "*/5 * * * *" },
  { value: "hourly",        label: "Every hour",             cron: "0 * * * *" },
  { value: "daily-9am",     label: "Daily at 9:00 AM",       cron: "0 9 * * *" },
  { value: "weekly-monday", label: "Weekly — Monday 9:00 AM", cron: "0 9 * * 1" },
  { value: "monthly-1st",   label: "1st of every month",     cron: "0 9 1 * *" },
  { value: "custom",        label: "Custom (cron expression)", cron: "" },
];

function humanReadableCron(cron: string, presets: typeof PRESETS): string {
  const preset = presets.find(p => p.cron === cron && p.value !== "custom");
  return preset?.label ?? cron;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  workflowId: string | undefined;
  data?: { cron?: string; timezone?: string; enabled?: boolean };
};

export const ScheduleTriggerDialog = ({ open, onOpenChange, nodeId, workflowId, data }: Props) => {
  const { setNodes } = useReactFlow();
  const [advanced, setAdvanced] = useState(false);

  const { register, watch, setValue, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues: { preset: "daily-9am", cron: "0 9 * * *", timezone: "UTC", enabled: false },
  });

  const preset = watch("preset");
  const cron   = watch("cron");
  const enabled = watch("enabled");

  useEffect(() => {
    if (!data) return;
    const detectedPreset = data.cron ? detectPresetFromCron(data.cron) : "daily-9am";
    reset({ preset: detectedPreset, cron: data.cron ?? "0 9 * * *", timezone: data.timezone ?? "UTC", enabled: data.enabled ?? false });
    setAdvanced(detectedPreset === "custom");
  }, [data, reset]);

  useEffect(() => {
    if (!advanced && preset !== "custom") {
      setValue("cron", generateCronFromPreset(preset));
    }
  }, [preset, advanced, setValue]);

  const onSubmit = async (values: FormValues) => {
    setNodes(nodes => nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, cron: values.cron, timezone: values.timezone, enabled: values.enabled } }
        : node
    ));
    if (values.enabled) {
      await fetch("/api/schedule/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId }),
      });
    }
    onOpenChange(false);
  };

  return (
    <NodeDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ClockIcon}
      title="Schedule Trigger"
      subtitle="Runs the workflow automatically on a recurring time-based schedule"
      badge="Trigger"
      formId="schedule-form"
    >
      <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Enable toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-white/50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/40">
          <div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Enable schedule</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Schedule won&apos;t run until this is turned on.
            </p>
          </div>
          <Controller
            control={control}
            name="enabled"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {!enabled && (
          <InfoBanner variant="warning">
            The schedule is currently <strong>disabled</strong>. Turn it on above and save to activate.
          </InfoBanner>
        )}

        {/* Frequency */}
        <DialogSection title="Frequency">
          <FieldRow label="Preset schedule">
            {!advanced ? (
              <select {...register("preset")} className={INPUT_CLS}>
                {PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            ) : (
              <FieldRow label="Cron expression" hint="standard 5-field: min hour day month weekday">
                <input {...register("cron")} className={INPUT_CLS + " font-mono"} placeholder="0 9 * * 1" />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Preview: <strong>{humanReadableCron(cron, PRESETS)}</strong>
                  {advanced && " — use crontab.guru to validate"}
                </p>
              </FieldRow>
            )}
          </FieldRow>

          {!advanced && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Expression: <code className="font-mono text-zinc-700 dark:text-zinc-300">{cron}</code>
            </p>
          )}

          <button
            type="button"
            onClick={() => setAdvanced(v => !v)}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors"
          >
            {advanced ? "← Use simple presets" : "Advanced: enter cron expression →"}
          </button>
        </DialogSection>

        {/* Timezone */}
        <DialogSection title="Timezone">
          <FieldRow label="Timezone" hint="IANA name e.g. America/New_York">
            <input {...register("timezone")} className={INPUT_CLS} placeholder="UTC" />
          </FieldRow>
        </DialogSection>

        {/* Variables */}
        <DialogSection title="Available Variables" hint="click to copy">
          <VarChip variable="schedule.timestamp" label="ISO timestamp when the schedule fired" />
          <VarChip variable="schedule.cronExpression" label="The cron expression that triggered this run" />
          <VarChip variable="schedule.timezone" label="Timezone configured for this schedule" />
        </DialogSection>

        <DialogSection title="How It Works">
          <div className="space-y-2.5">
            <SetupStep n={1}>Choose a frequency preset or write a custom cron expression.</SetupStep>
            <SetupStep n={2}>Enable the schedule and save the workflow.</SetupStep>
            <SetupStep n={3}>Weave automatically runs the workflow at every scheduled time.</SetupStep>
            <SetupStep n={4}>Each run creates an execution log you can review in the <strong>Executions</strong> tab.</SetupStep>
          </div>
        </DialogSection>
      </form>
    </NodeDialog>
  );
};