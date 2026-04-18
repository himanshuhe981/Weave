"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, INPUT_CLS, MONO_INPUT_CLS, InfoBanner } from "@/components/node-dialog";
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
    "gpt-4.1-nano",
    "gpt-4o-mini",
    "chatgpt-4o-latest",
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-5",
    "gpt-5-mini",
] as const;

const MODEL_DESCRIPTIONS: Record<string, string> = {
    "gpt-4.1-nano":       "Fastest · cheapest · daily automation tasks",
    "gpt-4o-mini":        "Fast · excellent for structured output",
    "chatgpt-4o-latest":  "Latest GPT-4o snapshot",
    "gpt-3.5-turbo":      "Legacy · fast & cheap for simple prompts",
    "gpt-4":              "Stable GPT-4 · strong reasoning",
    "gpt-4-turbo":        "GPT-4 Turbo · 128k context",
    "gpt-4.1":            "GPT-4.1 · best coding & instruction following",
    "gpt-4.1-mini":       "GPT-4.1 Mini · balanced speed/cost",
    "gpt-5":              "Most capable · complex multi-step reasoning",
    "gpt-5-mini":         "GPT-5 Mini · affordable next-gen",
};

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message: "Must start with a letter or underscore, only letters/numbers/underscores",
    }),
    credentialId: z.string().min(1, "Select an OpenAI credential"),
    model: z.string().min(1, "Model is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
});

export type OpenAiFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: OpenAiFormValues) => void;
    defaultValues?: Partial<OpenAiFormValues>;
}

export const OpenAiDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { data: credentials, isLoading } = useCredentialsByType(CredentialType.OPENAI);

    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<OpenAiFormValues>({
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

    const varName = watch("variableName") || "myOpenAi";
    const model   = watch("model") as string;

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon="/logos/openai.svg"
            title="OpenAI"
            subtitle="Use GPT models to generate, classify, summarize, or transform text"
            badge="AI"
            formId="openai-form"
        >
            <form id="openai-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">

                <DialogSection title="Output Variable" hint="how to reference this node downstream">
                    <FieldRow label="Variable name" required error={errors.variableName?.message}>
                        <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="myOpenAi" />
                    </FieldRow>
                    <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400">Access in later nodes:</p>
                        <VarChip variable={`${varName}.text`} label="Generated text output" description="the main AI response" />
                        <VarChip variable={`${varName}.usage.promptTokens`} label="Prompt token count" />
                        <VarChip variable={`${varName}.usage.completionTokens`} label="Completion token count" />
                    </div>
                </DialogSection>

                <DialogSection title="Credential">
                    {!credentials?.length && !isLoading && (
                        <InfoBanner variant="warning">
                            No OpenAI credentials.{" "}
                            <a href="/credentials" target="_blank" className="underline inline-flex items-center gap-0.5">
                                Add one <ExternalLinkIcon className="size-2.5" />
                            </a>{" "}
                            — you need an OpenAI API key.
                        </InfoBanner>
                    )}
                    <FieldRow label="OpenAI API Key" required error={errors.credentialId?.message}>
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
                                                    <Image src="/logos/openai.svg" alt="OpenAI" width={14} height={14} />
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

                <DialogSection title="Prompts" hint="use {{variables}} from previous nodes">
                    <FieldRow label="System prompt" hint="optional — defines AI role/behaviour">
                        <textarea {...register("systemPrompt")} rows={3} className={MONO_INPUT_CLS}
                            placeholder="You are a helpful assistant." />
                    </FieldRow>
                    <FieldRow label="User prompt" required error={errors.userPrompt?.message}>
                        <textarea {...register("userPrompt")} rows={5} className={MONO_INPUT_CLS}
                            placeholder={"Classify this support ticket as URGENT or NORMAL:\n\n{{webhook.body.message}}"} />
                    </FieldRow>
                    <InfoBanner variant="tip">
                        Use <code className="font-mono text-[10px]">{"{{varName.text}}"}</code> for text or <code className="font-mono text-[10px]">{"{{json varName}}"}</code> to pass objects as JSON strings.
                    </InfoBanner>
                </DialogSection>
            </form>
        </NodeDialog>
    );
};
