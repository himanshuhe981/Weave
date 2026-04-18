"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, INPUT_CLS, MONO_INPUT_CLS, InfoBanner } from "@/components/node-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import z from "zod";
import { PlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ruleSchema = z.object({
    left: z.string().min(1, "Left value required"),
    operator: z.enum(["equals", "not_equals", "contains", "starts_with", "ends_with", "greater_than", "less_than", "is_empty", "is_not_empty"]),
    right: z.string().optional(),
});

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message: "Must start with a letter or underscore",
    }),
    combinator: z.enum(["AND", "OR"]),
    rules: z.array(ruleSchema).min(1, "Add at least one rule"),
});

export type ConditionFormValues = z.infer<typeof formSchema>;

const OPERATORS = [
    { value: "equals",       label: "equals",        noRight: false },
    { value: "not_equals",   label: "does not equal", noRight: false },
    { value: "contains",     label: "contains",       noRight: false },
    { value: "starts_with",  label: "starts with",    noRight: false },
    { value: "ends_with",    label: "ends with",      noRight: false },
    { value: "greater_than", label: "is greater than", noRight: false },
    { value: "less_than",    label: "is less than",   noRight: false },
    { value: "is_empty",     label: "is empty",       noRight: true  },
    { value: "is_not_empty", label: "is not empty",   noRight: true  },
];

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ConditionFormValues) => void;
    defaultValues?: Partial<ConditionFormValues>;
}

export const ConditionDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { register, control, watch, setValue, getValues, handleSubmit, reset, formState: { errors } } = useForm<ConditionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "conditionResult",
            combinator: defaultValues.combinator || "AND",
            rules: defaultValues.rules || [{ left: "", operator: "equals", right: "" }],
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "conditionResult",
            combinator: defaultValues.combinator || "AND",
            rules: defaultValues.rules || [{ left: "", operator: "equals", right: "" }],
        });
    }, [open, defaultValues, reset]);

    const varName   = watch("variableName") || "conditionResult";
    const rules     = watch("rules");
    const combinator = watch("combinator");

    const addRule = () => setValue("rules", [...getValues("rules"), { left: "", operator: "equals", right: "" }]);
    const removeRule = (i: number) => setValue("rules", getValues("rules").filter((_, idx) => idx !== i));

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={undefined}
            title="Condition"
            subtitle="Branch the workflow based on one or more rules — YES if conditions pass, NO if they don't"
            badge="Logic"
            formId="condition-form"
            wide
        >
            <form id="condition-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">

                {/* Variable + Combinator */}
                <div className="grid gap-3 sm:grid-cols-2">
                    <DialogSection title="Output Variable">
                        <FieldRow label="Variable name" required error={errors.variableName?.message}>
                            <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="conditionResult" />
                        </FieldRow>
                        <div className="space-y-1">
                            <p className="text-[10px] text-zinc-400">Access downstream:</p>
                            <VarChip variable={`${varName}.passed`} label="true/false — did the condition pass?" />
                        </div>
                    </DialogSection>

                    <DialogSection title="Rule Logic">
                        <FieldRow label="Combine rules with">
                            <Controller
                                control={control}
                                name="combinator"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AND">AND — all rules must pass</SelectItem>
                                            <SelectItem value="OR">OR — any rule must pass</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FieldRow>
                        <InfoBanner variant="info">
                            <strong>{combinator === "AND" ? "ALL" : "ANY ONE"}</strong> of the rules below must be true to route to the <strong>YES</strong> branch.
                        </InfoBanner>
                    </DialogSection>
                </div>

                {/* Rules */}
                <DialogSection title="Rules" hint="Left value can be a {{variable}} or literal text">
                    <div className="space-y-2">
                        {rules.map((rule, i) => {
                            const opMeta = OPERATORS.find(o => o.value === rule.operator);
                            return (
                                <div key={i} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                    {/* Left */}
                                    <input
                                        {...register(`rules.${i}.left`)}
                                        className={cn(MONO_INPUT_CLS, "flex-1 min-w-0")}
                                        placeholder="{{webhook.body.status}}"
                                    />

                                    {/* Operator */}
                                    <Controller
                                        control={control}
                                        name={`rules.${i}.operator`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[165px] shrink-0 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPERATORS.map(o => (
                                                        <SelectItem key={o.value} value={o.value} className="text-xs">
                                                            {o.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                    {/* Right (hidden for no-right operators) */}
                                    {!opMeta?.noRight && (
                                        <input
                                            {...register(`rules.${i}.right`)}
                                            className={cn(MONO_INPUT_CLS, "flex-1 min-w-0")}
                                            placeholder="active"
                                        />
                                    )}

                                    {/* Remove */}
                                    {rules.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRule(i)}
                                            className="shrink-0 size-6 flex items-center justify-center rounded-[6px] text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <XIcon className="size-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={addRule}
                        className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mt-1"
                    >
                        <PlusIcon className="size-3" /> Add rule
                    </button>
                </DialogSection>

                <InfoBanner variant="tip">
                    Connect a node to the <strong>YES</strong> handle (right) for when the condition passes, and another to the <strong>NO</strong> handle (bottom) for when it fails.
                </InfoBanner>
            </form>
        </NodeDialog>
    );
};
