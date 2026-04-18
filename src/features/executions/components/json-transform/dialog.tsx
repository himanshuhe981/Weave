"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, MONO_INPUT_CLS, InfoBanner, CodeBlock } from "@/components/node-dialog";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import * as z from "zod";
import { BracesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
    template: z.string().min(1, "Transformation template is required"),
    strict: z.boolean(),
});

export type JsonTransformFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: JsonTransformFormValues) => void;
    defaultValues?: Partial<JsonTransformFormValues>;
}

const EXAMPLE_TEMPLATE = `{
  "id": "{{webhook.body.userId}}",
  "displayName": "{{webhook.body.firstName}} {{webhook.body.lastName}}",
  "summary": "{{myGemini.text}}",
  "tags": {{json webhook.body.tags}},
  "processedAt": "{{schedule.timestamp}}"
}`;

export const JsonTransformDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<JsonTransformFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            template: defaultValues.template || "",
            strict: defaultValues.strict ?? true,
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "",
            template: defaultValues.template || "",
            strict: defaultValues.strict ?? true,
        });
    }, [open, defaultValues, reset]);

    const varName = watch("variableName") || "myTransform";
    const strict  = watch("strict");

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={BracesIcon}
            title="JSON Transform"
            subtitle="Reshape, combine, and restructure data from previous nodes using Handlebars templates"
            badge="Logic"
            formId="json-transform-form"
            wide
        >
            <form id="json-transform-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <DialogSection title="Configuration">
                            <FieldRow label="Output variable name" required error={errors.variableName?.message}>
                                <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="transformedData" />
                            </FieldRow>

                            <div className="space-y-1">
                                <p className="text-[10px] text-zinc-400">Access the result downstream:</p>
                                <VarChip variable={varName} label="The entire transformed object" />
                                <VarChip variable={`${varName}.fieldName`} label="A specific field from the output" />
                                <VarChip variable={`json ${varName}`} label="Output as JSON string" description="for AI prompts" />
                            </div>
                        </DialogSection>

                        <DialogSection title="Options">
                            <div className="flex items-center justify-between px-1">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Strict mode</p>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">
                                        {strict
                                            ? "Execution fails if a referenced variable is missing"
                                            : "Missing variables render as empty strings (silent failure)"}
                                    </p>
                                </div>
                                <Controller
                                    control={control}
                                    name="strict"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </DialogSection>

                        <DialogSection title="Handlebars Reference">
                            <div className="space-y-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <p><code className="font-mono text-zinc-700 dark:text-zinc-300">{"{{variable.path}}"}</code> — insert a value</p>
                                <p><code className="font-mono text-zinc-700 dark:text-zinc-300">{"{{json variable}}"}</code> — stringify an object</p>
                                <p><code className="font-mono text-zinc-700 dark:text-zinc-300">{"{{#if cond}}…{{/if}}"}</code> — conditional</p>
                                <p><code className="font-mono text-zinc-700 dark:text-zinc-300">{"{{#each arr}}…{{/each}}"}</code> — iterate array</p>
                            </div>
                        </DialogSection>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <DialogSection title="Transformation Template" hint="Handlebars syntax">
                            <FieldRow label="Template" required error={errors.template?.message}>
                                <textarea
                                    {...register("template")}
                                    rows={10}
                                    className={cn(MONO_INPUT_CLS, "min-h-[160px]")}
                                    placeholder={EXAMPLE_TEMPLATE}
                                />
                            </FieldRow>
                            <InfoBanner variant="tip">
                                The template must produce valid JSON. Use <code className="font-mono text-[10px]">{"{{json obj}}"}</code> to embed nested objects or arrays correctly.
                            </InfoBanner>
                        </DialogSection>

                        <DialogSection title="Example Template">
                            <CodeBlock
                                code={EXAMPLE_TEMPLATE}
                                label="Click to see a working example"
                                copyLabel="Example template"
                            />
                        </DialogSection>
                    </div>
                </div>
            </form>
        </NodeDialog>
    );
};