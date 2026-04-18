"use client"

import { CredentialType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCreateCredential, useUpdateCredential, useSuspenseCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeftIcon, KeyIcon, SaveIcon, PlusIcon, ShieldCheckIcon } from "lucide-react";

const formSchema = z.object({
    name:  z.string().min(1, "Name is required"),
    type:  z.enum(CredentialType),
    value: z.string().min(1, "API key is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
    { value: CredentialType.OPENAI,    label: "OpenAI",        logo: "/logos/openai.svg"    },
    { value: CredentialType.ANTHROPIC, label: "Anthropic",     logo: "/logos/anthropic.svg" },
    { value: CredentialType.GEMINI,    label: "Google Gemini", logo: "/logos/gemini.svg"    },
    { value: CredentialType.TELEGRAM,  label: "Telegram",      logo: "/logos/telegram.svg"  },
    { value: CredentialType.DISCORD,   label: "Discord",       logo: "/logos/discord.svg"   },
    { value: CredentialType.SLACK,     label: "Slack",         logo: "/logos/slack.svg"     },
];

const credentialLogos: Partial<Record<CredentialType, string>> = {
    OPENAI:    "/logos/openai.svg",
    ANTHROPIC: "/logos/anthropic.svg",
    GEMINI:    "/logos/gemini.svg",
    TELEGRAM:  "/logos/telegram.svg",
    DISCORD:   "/logos/discord.svg",
    SLACK:     "/logos/slack.svg",
};

interface CredentialFormProps {
    initialData?: {
        id?:   string;
        name:  string;
        type:  CredentialType;
        value: string;
    };
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
const GlassField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className={[
        "p-4 rounded-2xl",
        "bg-zinc-50/60 dark:bg-zinc-800/30",
        "border border-zinc-100 dark:border-zinc-800",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_4px_rgba(0,0,0,0.03)]",
    ].join(" ")}>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            {label}
        </label>
        {children}
    </div>
);

// ─── Form component ───────────────────────────────────────────────────────────
export const CredentialForm = ({ initialData }: CredentialFormProps) => {
    const router  = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();
    const { handleError, modal } = useUpgradeModal();

    const isEdit = !!initialData?.id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || { name: "", type: CredentialType.OPENAI, value: "" },
    });

    const watchedType = form.watch("type");
    const logoSrc = credentialLogos[watchedType] || "/logos/openai.svg";
    const selectedOption = credentialTypeOptions.find(o => o.value === watchedType);

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({ id: initialData.id, ...values });
        } else {
            await createCredential.mutateAsync(values, {
                onSuccess: (data) => router.push(`/credentials/${data.id}`),
                onError:   (error) => handleError(error),
            });
        }
    };

    const isPending = createCredential.isPending || updateCredential.isPending;

    return (
        <>
            {modal}
            <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">

                {/* Back nav */}
                <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                >
                    <Link
                        href="/credentials"
                        prefetch
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    >
                        <ArrowLeftIcon className="size-3.5" />
                        Back to credentials
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: form card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:col-span-2"
                    >
                        <div className={[
                            "p-6 rounded-2xl",
                            "bg-white dark:bg-zinc-900",
                            "border border-zinc-100 dark:border-zinc-800",
                            "shadow-[0_4px_24px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]",
                        ].join(" ")}>
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-zinc-50 dark:border-zinc-800">
                                <div className={[
                                    "size-10 rounded-xl flex items-center justify-center",
                                    "bg-zinc-50 dark:bg-zinc-800",
                                    "border border-zinc-100 dark:border-zinc-700 shadow-sm",
                                ].join(" ")}>
                                    {isEdit
                                        ? <Image src={logoSrc} alt={selectedOption?.label || ""} width={22} height={22} />
                                        : <KeyIcon className="size-5 text-zinc-400" strokeWidth={1.75} />
                                    }
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                        {isEdit ? "Edit credential" : "New credential"}
                                    </h2>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {isEdit
                                            ? "Update your API key or connection details"
                                            : "Connect a service to use in your workflows"
                                        }
                                    </p>
                                </div>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <GlassField label="Name">
                                                    <FormControl>
                                                        <input
                                                            {...field}
                                                            placeholder="My OpenAI key"
                                                            className={[
                                                                "w-full text-sm outline-none transition-all bg-transparent",
                                                                "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-300",
                                                                "border-0 p-0 focus:ring-0",
                                                            ].join(" ")}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500 mt-1.5" />
                                                </GlassField>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <GlassField label="Service type">
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <SelectTrigger className="w-full border-0 p-0 h-auto shadow-none bg-transparent text-sm text-zinc-800 dark:text-zinc-100 focus:ring-0">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg">
                                                                {credentialTypeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                                                        <div className="flex items-center gap-2">
                                                                            <Image src={option.logo} alt={option.label} width={16} height={16} />
                                                                            {option.label}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500 mt-1.5" />
                                                </GlassField>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <GlassField label="API key / secret">
                                                    <FormControl>
                                                        <input
                                                            {...field}
                                                            type="password"
                                                            placeholder="sk-..."
                                                            className={[
                                                                "w-full text-sm outline-none transition-all bg-transparent",
                                                                "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-300",
                                                                "border-0 p-0 focus:ring-0 font-mono",
                                                            ].join(" ")}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs text-red-500 mt-1.5" />
                                                </GlassField>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className={[
                                                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold",
                                                "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900",
                                                "border border-zinc-800/20 dark:border-white/20",
                                                "shadow-[0_4px_16px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.1)]",
                                                "hover:bg-zinc-800 dark:hover:bg-zinc-100",
                                                "disabled:opacity-50 transition-all active:scale-[0.98]",
                                            ].join(" ")}
                                        >
                                            {isPending
                                                ? "Saving…"
                                                : isEdit
                                                ? <><SaveIcon className="size-3.5" /> Update</>
                                                : <><PlusIcon className="size-3.5" /> Create</>
                                            }
                                        </button>
                                        <Link
                                            href="/credentials"
                                            prefetch
                                            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </motion.div>

                    {/* Right: info card */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-4"
                    >
                        {/* Security note */}
                        <div className={[
                            "p-5 rounded-2xl",
                            "bg-white dark:bg-zinc-900",
                            "border border-zinc-100 dark:border-zinc-800",
                            "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
                        ].join(" ")}>
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheckIcon className="size-4 text-zinc-400" strokeWidth={1.75} />
                                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Security</span>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Your API keys are encrypted at rest and never exposed in API responses.
                                Only the last 4 characters are shown in the UI after saving.
                            </p>
                        </div>

                        {/* Live preview */}
                        {watchedType && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={[
                                    "p-5 rounded-2xl",
                                    "bg-white dark:bg-zinc-900",
                                    "border border-zinc-100 dark:border-zinc-800",
                                    "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
                                ].join(" ")}
                            >
                                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Selected service</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                                        <Image src={logoSrc} alt={selectedOption?.label || ""} width={20} height={20} />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                        {selectedOption?.label}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

// ─── View (edit existing) ─────────────────────────────────────────────────────
export const CredentialView = ({ credentialId }: { credentialId: string }) => {
    const { data: credential } = useSuspenseCredential(credentialId);
    return <CredentialForm initialData={credential} />;
};
