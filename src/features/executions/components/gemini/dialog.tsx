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
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
] as const;

const MODEL_DESCRIPTIONS: Record<string, string> = {
    "gemini-2.5-flash-lite": "Fastest · lowest cost · great for simple tasks",
    "gemini-2.0-flash":      "Fast · balanced cost/quality",
    "gemini-1.5-flash":      "Fast · strong reasoning",
    "gemini-1.5-flash-8b":   "Small & efficient",
    "gemini-1.5-pro":        "Highest quality · longer context window",
    "gemini-1.0-pro":        "Stable production model",
    "gemini-pro":            "Legacy alias for gemini-1.0-pro",
};

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message: "Must start with a letter or underscore, only letters/numbers/underscores",
    }),
    credentialId: z.string().min(1, "Select a Gemini credential"),
    model: z.string().min(1, "Model is required"),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, "User prompt is required"),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: GeminiFormValues) => void;
    defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { data: credentials, isLoading } = useCredentialsByType(CredentialType.GEMINI);

    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<GeminiFormValues>({
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

    const varName  = watch("variableName") || "myGemini";
    const model    = watch("model") as string;

    const handleSave = handleSubmit(values => { onSubmit(values); onOpenChange(false); });

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon="/logos/gemini.svg"
            title="Google Gemini"
            subtitle="Generate text, summaries, classifications and more using Gemini AI"
            badge="AI"
            formId="gemini-form"
        >
            <form id="gemini-form" onSubmit={handleSave} className="space-y-4">

                {/* Output variable */}
                <DialogSection title="Output Variable" hint="how to reference this node's result downstream">
                    <FieldRow label="Variable name" required hint="letters, numbers, underscores only" error={errors.variableName?.message}>
                        <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="myGemini" />
                    </FieldRow>
                    <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400">Access this node&apos;s output in later nodes:</p>
                        <VarChip variable={`${varName}.text`} label="Generated text" description="the main output" />
                        <VarChip variable={`${varName}.usage.inputTokens`} label="Input token count" />
                        <VarChip variable={`${varName}.usage.outputTokens`} label="Output token count" />
                    </div>
                </DialogSection>

                {/* Credential */}
                <DialogSection title="Credential">
                    {!credentials?.length && !isLoading && (
                        <InfoBanner variant="warning">
                            No Gemini credentials found.{" "}
                            <a href="/credentials" target="_blank" className="underline inline-flex items-center gap-0.5">
                                Add one in Credentials <ExternalLinkIcon className="size-2.5" />
                            </a>
                        </InfoBanner>
                    )}
                    <FieldRow label="Gemini API Key" required error={errors.credentialId?.message}>
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
                                                    <Image src="/logos/gemini.svg" alt="Gemini" width={14} height={14} />
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

                {/* Model */}
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
                                            <SelectItem key={m} value={m}>
                                                <div>
                                                    <p className="text-sm">{m}</p>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FieldRow>
                    {model && MODEL_DESCRIPTIONS[model] && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{MODEL_DESCRIPTIONS[model]}</p>
                    )}
                </DialogSection>

                {/* Prompts */}
                <DialogSection title="Prompts" hint="use {{variables}} from previous nodes">
                    <FieldRow label="System prompt" hint="optional — sets AI behaviour">
                        <textarea
                            {...register("systemPrompt")}
                            rows={3}
                            className={MONO_INPUT_CLS}
                            placeholder="You are a helpful assistant that summarizes text concisely."
                        />
                    </FieldRow>
                    <FieldRow label="User prompt" required error={errors.userPrompt?.message}>
                        <textarea
                            {...register("userPrompt")}
                            rows={5}
                            className={MONO_INPUT_CLS}
                            placeholder={"Summarize the following:\n\n{{webhook.body.text}}"}
                        />
                    </FieldRow>
                    <InfoBanner variant="tip">
                        Use <code className="font-mono text-[10px]">{"{{variableName.text}}"}</code> for plain text or <code className="font-mono text-[10px]">{"{{json variableName}}"}</code> to stringify objects before passing them to the AI.
                    </InfoBanner>
                </DialogSection>
            </form>
        </NodeDialog>
    );
};