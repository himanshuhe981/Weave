"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { generateCronFromPreset } from "./utils";
import { useReactFlow } from "@xyflow/react";

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

type ScheduleTriggerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  workflowId: string | undefined;
  data?: {
    cron?: string;
    timezone?: string;
    enabled?: boolean;
  };
};

export const ScheduleTriggerDialog = ({
  open,
  onOpenChange,
  nodeId,
  workflowId,
  data,
}: ScheduleTriggerDialogProps) => {
  const { setNodes } = useReactFlow();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      preset: "daily-9am",
      cron: "0 9 * * *",
      timezone: "UTC",
      enabled: false,
    },
  });

  const preset = watch("preset");
  const [advanced, setAdvanced] = useState(false);

  // ✅ Hydrate form from DB data properly
  useEffect(() => {
    if (!data) return;

    const detectedPreset = data.cron
      ? detectPresetFromCron(data.cron)
      : "daily-9am";

    reset({
      preset: detectedPreset,
      cron: data.cron ?? "0 9 * * *",
      timezone: data.timezone ?? "UTC",
      enabled: data.enabled ?? false,
    });

    // Enable advanced mode automatically if cron is custom
    setAdvanced(detectedPreset === "custom");
  }, [data, reset]);

  // ✅ When preset changes in simple mode → update cron
  useEffect(() => {
    if (!advanced && preset !== "custom") {
      setValue("cron", generateCronFromPreset(preset));
    }
  }, [preset, advanced, setValue]);

  const onSubmit = async (values: FormValues) => {
    // ✅ Update React Flow state
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                cron: values.cron,
                timezone: values.timezone,
                enabled: values.enabled,
              },
            }
          : node
      )
    );

    // ✅ Always start scheduler if enabled
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Schedule Trigger</DialogTitle>
          <DialogDescription>
            Run workflow automatically using time-based schedules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Enable Switch */}
          <div className="flex items-center justify-between">
            <span>Enable schedule</span>

            <Controller
              control={control}
              name="enabled"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Simple Preset Mode */}
          {!advanced && (
            <select
              {...register("preset")}
              className="w-full border rounded-md p-2"
            >
              <option value="every-5-min">Every 5 minutes</option>
              <option value="hourly">Every hour</option>
              <option value="daily-9am">Daily at 9AM</option>
              <option value="weekly-monday">Weekly Monday</option>
              <option value="monthly-1st">1st of every month</option>
              <option value="custom">Custom</option>
            </select>
          )}

          {/* Cron */}
          <div>
            <label className="text-sm font-medium">
              Cron Expression
            </label>
            <Input {...register("cron")} disabled={!advanced} />
          </div>

          {/* Timezone */}
          <div>
            <label className="text-sm font-medium">
              Timezone
            </label>
            <Input {...register("timezone")} />
          </div>

          {/* Mode Toggle */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setAdvanced((v) => !v)}
          >
            {advanced ? "Use Simple Mode" : "Advanced Cron Mode"}
          </Button>

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};