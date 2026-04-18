"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, MONO_INPUT_CLS, InfoBanner } from "@/components/node-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";
import { TimerIcon } from "lucide-react";

const formSchema = z.object({
    amount: z.string().min(1, "Duration is required"),
    unit: z.enum(["milliseconds", "minutes", "hours", "days"]),
    jitter: z.boolean(),
});

export type DelayFormValues = z.infer<typeof formSchema>;
export type DelayUnit = "milliseconds" | "minutes" | "hours" | "days";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: DelayFormValues) => void;
    defaultValues?: Partial<DelayFormValues>;
}

const UNIT_HINTS: Record<string, string> = {
    milliseconds: "1000 = 1 second · useful for tight retry loops",
    minutes:      "most common · up to 60 minutes on free plans",
    hours:        "good for daily digests and scheduled follow-ups",
    days:         "long delays — check your plan limit",
};

export const DelayDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<DelayFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: defaultValues.amount || "5",
            unit: defaultValues.unit || "minutes",
            jitter: defaultValues.jitter ?? false,
        },
    });

    useEffect(() => {
        if (open) reset({
            amount: defaultValues.amount || "5",
            unit: defaultValues.unit || "minutes",
            jitter: defaultValues.jitter ?? false,
        });
    }, [open, defaultValues, reset]);

    const amount  = watch("amount") || "5";
    const unit    = watch("unit");
    const jitter  = watch("jitter");

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={TimerIcon}
            title="Delay"
            subtitle="Pause workflow execution for a fixed or dynamic duration"
            badge="Logic"
            formId="delay-form"
        >
            <form id="delay-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">

                <DialogSection title="Duration">
                    <div className="flex gap-2 items-start">
                        <FieldRow label="Amount" required error={errors.amount?.message} className="flex-1">
                            <input
                                {...register("amount")}
                                className={MONO_INPUT_CLS}
                                placeholder="5 or {{user.waitMinutes}}"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1">
                                Supports <code className="font-mono">{"{{variables}}"}</code> — e.g. <code className="font-mono">{"{{form.delayDays}}"}</code>
                            </p>
                        </FieldRow>

                        <FieldRow label="Unit" required className="w-[140px] shrink-0">
                            <Controller
                                control={control}
                                name="unit"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="milliseconds">Milliseconds</SelectItem>
                                            <SelectItem value="minutes">Minutes</SelectItem>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FieldRow>
                    </div>

                    {/* Live preview */}
                    <div className="px-3 py-2 rounded-[9px] bg-zinc-900/80 dark:bg-zinc-950/80 border border-zinc-700/50">
                        <p className="text-[12px] font-mono text-zinc-200">
                            ⏱ Workflow will pause for{" "}
                            <span className="text-emerald-400 font-bold">{amount} {unit}</span>
                            {jitter ? " (± up to 20% jitter)" : ""}
                        </p>
                    </div>

                    {unit && UNIT_HINTS[unit] && (
                        <p className="text-[10px] text-zinc-400">{UNIT_HINTS[unit]}</p>
                    )}
                </DialogSection>

                {/* Jitter */}
                <DialogSection title="Options">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Enable jitter</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Adds ±20% random variation to the delay — prevents thundering herd when many workflows run simultaneously</p>
                        </div>
                        <Controller
                            control={control}
                            name="jitter"
                            render={({ field }) => (
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                    </div>
                </DialogSection>

                <DialogSection title="Common Use Cases">
                    <div className="space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <p>• <strong>Rate limiting:</strong> Add 1–5 seconds between API calls to avoid hitting rate limits</p>
                        <p>• <strong>Follow-up emails:</strong> Delay 30 minutes after signup before sending the next message</p>
                        <p>• <strong>Retry logic:</strong> Wait before retrying a failed HTTP request</p>
                        <p>• <strong>Scheduling:</strong> Delay until business hours before alerting on-call</p>
                    </div>
                </DialogSection>

                <DialogSection title="Output Variables" hint="click to copy">
                    <VarChip variable="delay.scheduledAt" label="ISO timestamp when the delay was scheduled" />
                    <VarChip variable="delay.resumedAt" label="ISO timestamp when execution resumed" />
                </DialogSection>

                <InfoBanner variant="warning">
                    Very long delays (hours/days) require a durable scheduler. Check your plan — free plans may be limited to shorter delays.
                </InfoBanner>
            </form>
        </NodeDialog>
    );
};