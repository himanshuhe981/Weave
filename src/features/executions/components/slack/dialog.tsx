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
    webhookUrl: z.string().min(11, "Incoming webhook URL is required"),
    content: z.string().min(1, "Message content is required"),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: SlackFormValues) => void;
    defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { register, watch, handleSubmit, reset, formState: { errors } } = useForm<SlackFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            webhookUrl: defaultValues.webhookUrl || "",
            content: defaultValues.content || "",
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "",
            webhookUrl: defaultValues.webhookUrl || "",
            content: defaultValues.content || "",
        });
    }, [open, defaultValues, reset]);

    const varName = watch("variableName") || "mySlack";

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon="/logos/slack.svg"
            title="Slack"
            subtitle="Post a message to a Slack channel using an Incoming Webhook"
            badge="Action"
            formId="slack-form"
            wide
        >
            <form id="slack-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <DialogSection title="Configuration">
                            <FieldRow label="Output variable name" required error={errors.variableName?.message}>
                                <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="mySlack" />
                            </FieldRow>

                            <FieldRow label="Incoming Webhook URL" required error={errors.webhookUrl?.message}>
                                <input
                                    {...register("webhookUrl")}
                                    className={INPUT_CLS}
                                    placeholder="https://hooks.slack.com/services/T.../B.../..."
                                    type="url"
                                />
                            </FieldRow>
                        </DialogSection>

                        <DialogSection title="How to Get a Webhook URL">
                            <div className="space-y-2.5">
                                <SetupStep n={1}>Go to <strong>api.slack.com/apps</strong> → <strong>Create New App</strong> → From scratch.</SetupStep>
                                <SetupStep n={2}>Choose <strong>Incoming Webhooks</strong> → toggle it on.</SetupStep>
                                <SetupStep n={3}>Click <strong>Add New Webhook to Workspace</strong> and pick a channel.</SetupStep>
                                <SetupStep n={4}>Copy the Webhook URL and paste it above.</SetupStep>
                            </div>
                            <InfoBanner variant="tip">
                                Save the webhook URL securely — Slack only shows it once on creation.
                            </InfoBanner>
                        </DialogSection>

                        <DialogSection title="Output Variables" hint="click to copy">
                            <VarChip variable={`${varName}.ok`} label="true if the message was sent" />
                            <VarChip variable={`${varName}.ts`} label="Message timestamp (used to thread replies)" />
                        </DialogSection>
                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">
                        <DialogSection title="Message">
                            <FieldRow label="Message content" required error={errors.content?.message}>
                                <textarea
                                    {...register("content")}
                                    rows={8}
                                    className={MONO_INPUT_CLS}
                                    placeholder={"*New Form Submission* 🎉\n\nName: {{webhook.body.name}}\nEmail: {{webhook.body.email}}\n\nAI Summary:\n{{myGemini.text}}"}
                                />
                            </FieldRow>
                            <InfoBanner variant="tip">
                                Slack supports *bold*, _italic_, `code`, and &gt;blockquote formatting. Use <code className="font-mono text-[10px]">{"{{variableName.text}}"}</code> to embed AI output.
                            </InfoBanner>
                        </DialogSection>
                    </div>
                </div>
            </form>
        </NodeDialog>
    );
};