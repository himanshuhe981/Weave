"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, INPUT_CLS, MONO_INPUT_CLS, InfoBanner, SetupStep } from "@/components/node-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import z from "zod";

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message: "Must start with a letter or underscore",
    }),
    webhookUrl: z.string().min(11, "Discord webhook URL is required"),
    content: z.string().min(1, "Message content is required").max(2000, "Discord messages cannot exceed 2000 characters"),
    username: z.string().optional(),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: DiscordFormValues) => void;
    defaultValues?: Partial<DiscordFormValues>;
}

export const DiscordDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { register, watch, handleSubmit, reset, formState: { errors } } = useForm<DiscordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            webhookUrl: defaultValues.webhookUrl || "",
            content: defaultValues.content || "",
            username: defaultValues.username || "",
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "",
            webhookUrl: defaultValues.webhookUrl || "",
            content: defaultValues.content || "",
            username: defaultValues.username || "",
        });
    }, [open, defaultValues, reset]);

    const varName = watch("variableName") || "myDiscord";
    const content = watch("content") || "";

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon="/logos/discord.svg"
            title="Discord"
            subtitle="Send a message to a Discord channel via webhook"
            badge="Action"
            formId="discord-form"
            wide
        >
            <form id="discord-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <DialogSection title="Configuration">
                            <FieldRow label="Output variable name" required error={errors.variableName?.message}
                                hint="letters, numbers, underscores">
                                <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="myDiscord" />
                            </FieldRow>

                            <FieldRow label="Webhook URL" required error={errors.webhookUrl?.message}>
                                <input
                                    {...register("webhookUrl")}
                                    className={INPUT_CLS}
                                    placeholder="https://discord.com/api/webhooks/..."
                                    type="url"
                                />
                                <p className="text-[10px] text-zinc-400 mt-1">
                                    In Discord: <strong>Channel Settings → Integrations → Webhooks → New Webhook</strong>
                                </p>
                            </FieldRow>

                            <FieldRow label="Bot username" hint="optional — overrides default webhook name">
                                <input {...register("username")} className={INPUT_CLS} placeholder="Weave Bot" />
                            </FieldRow>
                        </DialogSection>

                        <DialogSection title="How to Get a Webhook URL">
                            <div className="space-y-2">
                                <SetupStep n={1}>Open Discord and go to your server.</SetupStep>
                                <SetupStep n={2}>Right-click the channel → <strong>Edit Channel</strong>.</SetupStep>
                                <SetupStep n={3}>Click <strong>Integrations → Webhooks → New Webhook</strong>.</SetupStep>
                                <SetupStep n={4}>Copy the webhook URL and paste it above.</SetupStep>
                            </div>
                        </DialogSection>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <DialogSection title="Message Content">
                            <FieldRow label="Message" required error={errors.content?.message}>
                                <textarea
                                    {...register("content")}
                                    rows={6}
                                    className={MONO_INPUT_CLS}
                                    placeholder={"✅ New signup!\n\nName: {{webhook.body.name}}\nEmail: {{webhook.body.email}}\n\nAI Summary: {{myGemini.text}}"}
                                />
                                <p className={`text-[10px] mt-1 ${content.length > 1900 ? "text-red-400" : "text-zinc-400"}`}>
                                    {content.length}/2000 characters
                                </p>
                            </FieldRow>
                            <InfoBanner variant="tip">
                                Use <code className="font-mono text-[10px]">{"{{variableName.text}}"}</code> for AI output, <code className="font-mono text-[10px]">{"{{webhook.body.field}}"}</code> for trigger data. Discord supports **bold**, *italic*, and `code` formatting.
                            </InfoBanner>
                        </DialogSection>

                        <DialogSection title="Output Variables" hint="click to copy">
                            <VarChip variable={`${varName}.id`} label="Discord message ID" description="for editing/deleting later" />
                            <VarChip variable={`${varName}.channelId`} label="Channel the message was sent to" />
                            <VarChip variable={`${varName}.timestamp`} label="When the message was sent" />
                        </DialogSection>
                    </div>
                </div>
            </form>
        </NodeDialog>
    );
};