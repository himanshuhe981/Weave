"use client";

import { NodeDialog, DialogSection, VarChip, FieldRow, INPUT_CLS, MONO_INPUT_CLS, InfoBanner, SetupStep } from "@/components/node-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import z from "zod";
import Image from "next/image";
import { useSuspenseCredentials } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@prisma/client";
import { ExternalLinkIcon } from "lucide-react";

const formSchema = z.object({
    variableName: z.string().min(1, "Variable name is required").regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
    credentialId: z.string().min(1, "Select a Telegram credential"),
    chatId: z.string().min(1, "Chat ID is required"),
    content: z.string().min(1, "Message content is required").max(4096, "Telegram limit is 4096 characters"),
});

export type TelegramFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TelegramFormValues) => void;
    defaultValues?: Partial<TelegramFormValues>;
}

export const TelegramDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
    const { data } = useSuspenseCredentials();
    const telegramCredentials = data.items.filter(c => c.type === CredentialType.TELEGRAM);

    const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<TelegramFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            chatId: defaultValues.chatId || "",
            content: defaultValues.content || "",
        },
    });

    useEffect(() => {
        if (open) reset({
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            chatId: defaultValues.chatId || "",
            content: defaultValues.content || "",
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const varName  = watch("variableName") || "myTelegram";
    const content  = watch("content") || "";

    return (
        <NodeDialog
            open={open}
            onOpenChange={onOpenChange}
            icon="/logos/telegram.svg"
            title="Telegram"
            subtitle="Send a message to a Telegram chat via bot"
            badge="Action"
            formId="telegram-form"
            wide
        >
            <form id="telegram-form" onSubmit={handleSubmit(v => { onSubmit(v); onOpenChange(false); })} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <DialogSection title="Configuration">
                            <FieldRow label="Output variable name" required error={errors.variableName?.message}>
                                <input {...register("variableName")} className={MONO_INPUT_CLS} placeholder="myTelegram" />
                            </FieldRow>

                            <FieldRow label="Bot credential" required error={errors.credentialId?.message}>
                                {!telegramCredentials.length && (
                                    <InfoBanner variant="warning">
                                        No Telegram credentials.{" "}
                                        <a href="/credentials" target="_blank" className="underline inline-flex items-center gap-0.5">
                                            Add one <ExternalLinkIcon className="size-2.5" />
                                        </a>{" "}
                                        — create a bot at <strong>@BotFather</strong> on Telegram.
                                    </InfoBanner>
                                )}
                                <Controller
                                    control={control}
                                    name="credentialId"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!telegramCredentials.length}>
                                            <SelectTrigger className="w-full text-sm">
                                                <SelectValue placeholder="Select Telegram bot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {telegramCredentials.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Image src="/logos/telegram.svg" alt="Telegram" width={14} height={14} />
                                                            {c.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FieldRow>

                            <FieldRow label="Chat ID" required error={errors.chatId?.message}
                                hint="numeric ID of the recipient chat">
                                <input {...register("chatId")} className={INPUT_CLS} placeholder="2043606214" />
                            </FieldRow>
                        </DialogSection>

                        <DialogSection title="How to Find Your Chat ID">
                            <div className="space-y-2.5">
                                <SetupStep n={1}>Open Telegram and send <strong>any message</strong> to your bot.</SetupStep>
                                <SetupStep n={2}>Open this URL in your browser, replacing <code className="text-[10px]">TOKEN</code> with your bot token:</SetupStep>
                            </div>
                            <code className="block text-[10px] font-mono bg-zinc-900/80 dark:bg-zinc-950/80 text-zinc-200 px-3 py-2 rounded-[8px] mt-2 break-all">
                                https://api.telegram.org/botTOKEN/getUpdates
                            </code>
                            <p className="text-[11px] text-zinc-500 mt-2">Find the <strong>chat.id</strong> field in the response — that&apos;s your Chat ID.</p>
                            <InfoBanner variant="tip">
                                For group chats, add the bot to the group and the Chat ID will be a negative number (e.g. <code className="font-mono text-[10px]">-1001234567890</code>).
                            </InfoBanner>
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
                                    placeholder={"📬 *New submission*\n\nName: {{webhook.body.name}}\nEmail: {{webhook.body.email}}\n\nSummary:\n{{myGemini.text}}"}
                                />
                                <p className={`text-[10px] mt-1 ${content.length > 3800 ? "text-red-400" : "text-zinc-400"}`}>
                                    {content.length}/4096 characters
                                </p>
                            </FieldRow>
                            <InfoBanner variant="tip">
                                Telegram supports *bold*, _italic_, `code`, and [link](url) Markdown. Supports up to 4096 characters per message.
                            </InfoBanner>
                        </DialogSection>

                        <DialogSection title="Output Variables" hint="click to copy">
                            <VarChip variable={`${varName}.message_id`} label="Telegram message ID" />
                            <VarChip variable={`${varName}.chat.id`} label="Chat ID the message was sent to" />
                            <VarChip variable={`${varName}.date`} label="Unix timestamp when message was sent" />
                        </DialogSection>
                    </div>
                </div>
            </form>
        </NodeDialog>
    );
};
