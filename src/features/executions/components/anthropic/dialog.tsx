"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, MONO_INPUT_CLS, InfoBanner } from "@/components/node-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import z from "zod";
import Image from "next/image";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@prisma/client";
import { ExternalLinkIcon } from "lucide-react";

export const AVAILABLE_MODELS = [
    "claude-3-5-haiku-20241022",
    "claude-3-5-haiku-latest",
    "claude-3-7-sonnet-20250219",
    "claude-3-7-sonnet-latest",
    "claude-3-haiku-20240307",
    "claude-haiku-4-5",
    "claude-opus-4-20250514",
    "claude-sonnet-4-20250514",
] as const;

const MODEL_DESCRIPTIONS: Record<string, string> = {
    "claude-3-5-haiku-20241022":   "Fastest · cheapest · great for classification",
    "claude-3-5-haiku-latest":     "Latest Haiku snapshot · fast & affordable",
    "claude-3-7-sonnet-20250219":  "Strong reasoning · excellent writing",
    "claude-3-7-sonnet-latest":    "Latest Sonnet snapshot",
    "claude-3-haiku-20240307":     "Stable Haiku · production-ready",
    "claude-haiku-4-5":            "Haiku 4.5 · next-gen fast model",
    "claude-opus-4-20250514":      "Most powerful · complex multi-step tasks",
    "claude-sonnet-4-20250514":    "Sonnet 4 · balanced power and speed",
};

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message: "Must start with a letter or underscore, only letters/numbers/underscores",
    }),
    credentialId: z.string().min(1, "Select an Anthropic credential"),
    model: z.string().min(1, "Model is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
});

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: AnthropicFormValues) => void;
    defaultValues?: Partial<AnthropicFormValues>;
}

export const AnthropicDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { data: credentials, isLoading } = useCredentialsByType(CredentialType.ANTHROPIC);

    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<AnthropicFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || AVAILABLE_MODELS[0],
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            model: defaultValues.model || AVAILABLE_MODELS[0],
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        });
    }, [open, defaultValues, reset]);

    const varName = watch("variableName") || "myAnthropic";
    const model   = watch("model") as string;

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon="/logos/anthropic.svg"
            title="Anthropic Claude"
            subtitle="Use Claude models for nuanced reasoning, writing, and analysis"
            badge="AI"
            formId="anthropic-form"
        >
            <form id="anthropic-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">

                <DialogSection title="Output Variable" hint="reference this node downstream">
                    <FieldRow label="Variable name" required error={errors.variableName?.message}>
                        <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="myAnthropic" />
                    </FieldRow>
                    <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400">Access in later nodes:</p>
                        <VarChip variable={`${varName}.text`} label="Generated text" description="main Claude response" />
                        <VarChip variable={`${varName}.usage.inputTokens`} label="Input tokens used" />
                        <VarChip variable={`${varName}.usage.outputTokens`} label="Output tokens used" />
                    </div>
                </DialogSection>

                <DialogSection title="Credential">
                    {!credentials?.length && !isLoading && (
                        <InfoBanner variant="warning">
                            No Anthropic credentials.{" "}
                            <a href="/credentials" target="_blank" className="underline inline-flex items-center gap-0.5">
                                Add one <ExternalLinkIcon className="size-2.5" />
                            </a>{" "}
                            — you need a Claude API key from console.anthropic.com
                        </InfoBanner>
                    )}
                    <FieldRow label="Anthropic API Key" required error={errors.credentialId?.message}>
                        <Controller
                            control={control}
                            name="credentialId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || !credentials?.length}>
                                    <SelectTrigger className="w-full text-sm">
                                        <SelectValue placeholder={isLoading ? "Loading…" : "Select credential"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {credentials?.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <div className="flex items-center gap-2">
                                                    <Image src="/logos/anthropic.svg" alt="Anthropic" width={14} height={14} />
                                                    {c.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FieldRow>
                </DialogSection>

                <DialogSection title="Model">
                    <FieldRow label="Model" required error={errors.model?.message}>
                        <Controller
                            control={control}
                            name="model"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full text-sm">
                                        <SelectValue placeholder="Select a model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABLE_MODELS.map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FieldRow>
                    {model && MODEL_DESCRIPTIONS[model] && (
                        <p className="text-[10px] text-zinc-400 mt-1">{MODEL_DESCRIPTIONS[model]}</p>
                    )}
                </DialogSection>

                <DialogSection title="Prompts" hint="use {{variables}} from upstream nodes">
                    <FieldRow label="System prompt" hint="optional — defines Claude's role">
                        <textarea {...register("systemPrompt")} rows={3} className={MONO_INPUT_CLS}
                            placeholder="You are a professional copywriter. Be concise." />
                    </FieldRow>
                    <FieldRow label="User prompt" required error={errors.userPrompt?.message}>
                        <textarea {...register("userPrompt")} rows={5} className={MONO_INPUT_CLS}
                            placeholder={"Write a professional email for this support ticket:\n\n{{webhook.body.message}}"} />
                    </FieldRow>
                    <InfoBanner variant="tip">
                        Claude excels at long-form analysis. Use <code className="font-mono text-[10px]">{"{{json myNode}}"}</code> to pass structured data as readable JSON.
                    </InfoBanner>
                </DialogSection>
            </form>
        </NodeDialog>
    );
};
