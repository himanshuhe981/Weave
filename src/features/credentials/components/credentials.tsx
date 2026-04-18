"use client"

import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Credential } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, KeyIcon, Trash2, ShieldCheckIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { LoadingView, ErrorView } from "@/components/entity-components";

// ─── Credential type map ─────────────────────────────────────────────────────
const CredentialType = {
    OPENAI:    "OPENAI",
    ANTHROPIC: "ANTHROPIC",
    GEMINI:    "GEMINI",
    TELEGRAM:  "TELEGRAM",
    DISCORD:   "DISCORD",
    SLACK:     "SLACK",
} as const;

const credentialLogos: Record<Credential["type"], string> = {
    [CredentialType.OPENAI]:    "/logos/openai.svg",
    [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
    [CredentialType.GEMINI]:    "/logos/gemini.svg",
    [CredentialType.TELEGRAM]:  "/logos/telegram.svg",
    [CredentialType.DISCORD]:   "/logos/discord.svg",
    [CredentialType.SLACK]:     "/logos/slack.svg",
};

const credentialLabels: Record<Credential["type"], string> = {
    [CredentialType.OPENAI]:    "OpenAI",
    [CredentialType.ANTHROPIC]: "Anthropic",
    [CredentialType.GEMINI]:    "Google Gemini",
    [CredentialType.TELEGRAM]:  "Telegram",
    [CredentialType.DISCORD]:   "Discord",
    [CredentialType.SLACK]:     "Slack",
};

// ─── Animated title ──────────────────────────────────────────────────────────
const AnimatedTitle = ({ text }: { text: string }) => (
    <span className="inline-flex overflow-hidden">
        {text.split("").map((char, i) => (
            <motion.span
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
                style={{ whiteSpace: char === " " ? "pre" : "normal" }}
            >
                {char}
            </motion.span>
        ))}
    </span>
);

const AnimatedSubtitle = ({ text }: { text: string }) => (
    <motion.p
        initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
        className="text-sm text-zinc-400 dark:text-zinc-500 mt-1"
    >
        {text}
    </motion.p>
);

// ─── Nameplate nail ──────────────────────────────────────────────────────────
const NameplateNail = ({ side }: { side: "left" | "right" }) => (
    <span
        className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-4" : "right-4"} size-[10px] rounded-full pointer-events-none z-10`}
        style={{
            background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.88) 0%, rgba(185,185,192,0.70) 42%, rgba(135,135,145,0.55) 100%)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.22), 0 0.5px 1px rgba(0,0,0,0.12), inset 0 1px 1.5px rgba(255,255,255,0.88)",
        }}
    />
);

// ─── Credentials Nameplate — exact structure of WorkflowsNameplate ────────────
const CredentialsNameplate = ({ disabled }: { disabled?: boolean }) => {
    const [params, setParams] = useCredentialsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y:   0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={[
                "relative mb-8 px-12 py-7 rounded-2xl overflow-hidden",
                "bg-zinc-100/80 dark:bg-zinc-800/60 backdrop-blur-xl",
                "border border-zinc-200/60 dark:border-zinc-700/50",
                // Full-edge moulding: top catch-light + bottom depth + left highlight + right shadow
                "shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_6px_rgba(0,0,0,0.04),inset_0_1.5px_0px_rgba(255,255,255,0.90),inset_0_-1.5px_0px_rgba(0,0,0,0.04),inset_1.5px_0px_rgba(255,255,255,0.60),inset_-1.5px_0px_rgba(0,0,0,0.03)]",
                "dark:shadow-[0_4px_24px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]",
            ].join(" ")}
        >
            {/* Mounting screws */}
            <NameplateNail side="left"  />
            <NameplateNail side="right" />

            {/* Animated LockIcon watermark — same position/opacity as WeaveWatermark in workflows */}
            <motion.div
                className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.055] pointer-events-none select-none"
                animate={{ y: [0, -7, 0], rotate: [0, -4, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
                <LockIcon className="w-40 h-40 text-zinc-500" strokeWidth={0.9} />
            </motion.div>

            {/* Title block */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    <AnimatedTitle text="Credentials" />
                </h1>
                <AnimatedSubtitle text="Manage your API keys and service connections" />
            </div>

            {/* Separator — etched line on glass */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-300/40 dark:via-zinc-600/40 to-transparent mb-5" />

            {/* Embedded controls — pop from the glass surface */}
            <div className="flex items-center gap-3">

                {/* Search — slightly raised frosted input embedded in the glass */}
                <div className="relative flex-1 max-w-xs group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search credentials…"
                        className={[
                            "w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all",
                            "bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm",
                            "border border-white/70 dark:border-zinc-600/50",
                            "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400",
                            // Slightly raised from the glass panel below it
                            "shadow-[0_3px_14px_rgba(0,0,0,0.07),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.04)]",
                            "focus:bg-white/60 focus:border-white/90 dark:focus:bg-zinc-800/60",
                            "focus:shadow-[0_5px_20px_rgba(0,0,0,0.09),inset_0_1px_1px_rgba(255,255,255,1)]",
                        ].join(" ")}
                    />
                </div>

                {/* New Credential — dark button pops forward from the translucent board */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.55, ease: "easeOut" }}
                    disabled={disabled}
                    onClick={() => router.push("/credentials/new")}
                    className={[
                        "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shrink-0",
                        "bg-zinc-900/85 dark:bg-white/85 backdrop-blur-xl",
                        "text-white dark:text-zinc-900",
                        "border border-zinc-700/20 dark:border-white/20",
                        // Stronger shadow so it truly pops off the glass board
                        "shadow-[0_6px_24px_rgba(0,0,0,0.20),0_2px_6px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.18)]",
                        "hover:bg-zinc-800 dark:hover:bg-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.26)]",
                        "disabled:opacity-50 transition-all active:scale-[0.98] active:shadow-sm",
                    ].join(" ")}
                >
                    <Plus className="size-3.5" />
                    New Credential
                </motion.button>
            </div>
        </motion.div>
    );
};


// ─── Credential card — ENTIRE card is clickable to open/edit ─────────────────
export const CredentialItem = ({ data }: { data: Credential }) => {
    const removeCredential = useRemoveCredential();
    const logo  = credentialLogos[data.type]  || "/logos/openai.svg";
    const label = credentialLabels[data.type] || data.type;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="group"
        >
            {/* Full-card Link — clicking anywhere opens the edit page */}
            <Link href={`/credentials/${data.id}`} className="block">
                <div className={[
                    "p-5 rounded-2xl transition-all duration-200",
                    "bg-white dark:bg-zinc-900",
                    "border border-zinc-100 dark:border-zinc-800",
                    "shadow-[0_2px_12px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]",
                    "hover:shadow-[0_6px_28px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]",
                    "hover:border-zinc-200 dark:hover:border-zinc-700 hover:-translate-y-0.5",
                ].join(" ")}>

                    {/* Header: logo + name + Secured badge */}
                    <div className="flex items-start gap-3 mb-4">
                        <div className={[
                            "size-10 rounded-xl flex items-center justify-center shrink-0",
                            "bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm",
                        ].join(" ")}>
                            <Image src={logo} alt={label} width={22} height={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{data.name}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{label}</p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200/60">
                            <ShieldCheckIcon className="size-2.5" />
                            Secured
                        </span>
                    </div>

                    {/*
                      Footer — delete button lives HERE, bottom-right of the footer row.
                      e.preventDefault() + stopPropagation() prevents the Link from firing.
                      Always in the DOM so layout is stable; only visible on group-hover.
                    */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400">
                            Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                        </span>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeCredential.mutate({ id: data.id });
                            }}
                            disabled={removeCredential.isPending}
                            className={[
                                "size-6 rounded-lg flex items-center justify-center",
                                // Hidden until hover — but in footer so it never overlaps the header area
                                "opacity-0 group-hover:opacity-100 transition-all duration-150",
                                "border border-zinc-100 dark:border-zinc-700",
                                "text-zinc-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50",
                                "shadow-sm disabled:opacity-40",
                            ].join(" ")}
                            title="Remove credential"
                        >
                            <Trash2 className="size-3" />
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// ─── List ────────────────────────────────────────────────────────────────────
export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();
    const { items } = credentials.data;

    if (items.length === 0) return <CredentialsEmpty />;

    const byType = items.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-6 flex-wrap"
            >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-zinc-100 text-zinc-500 shadow-sm">
                    <KeyIcon className="size-2.5" />
                    {items.length} credential{items.length !== 1 ? "s" : ""}
                </span>
                {Object.entries(byType).map(([type, count]) => (
                    <span key={type} className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-zinc-100 text-zinc-400 shadow-sm">
                        {credentialLabels[type as Credential["type"]] || type} · {count}
                    </span>
                ))}
            </motion.div>

            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((credential, idx) => (
                        <motion.div
                            key={credential.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.04, ease: "easeOut" }}
                        >
                            <CredentialItem data={credential} />
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        </>
    );
};

// ─── Pagination ──────────────────────────────────────────────────────────────
export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();
    const { page, totalPages } = credentials.data;

    if (totalPages <= 1) return null;

    return (
        <div className="mt-10 pt-4 border-t border-zinc-100/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">{page} / {totalPages}</span>
            <div className="flex gap-2">
                <button disabled={page === 1 || credentials.isFetching} onClick={() => setParams({ ...params, page: Math.max(1, page - 1) }) } className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/60 border border-zinc-200/60 text-zinc-500 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Previous</button>
                <button disabled={page === totalPages || credentials.isFetching} onClick={() => setParams({ ...params, page: Math.min(totalPages, page + 1) })} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/60 border border-zinc-200/60 text-zinc-500 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Next</button>
            </div>
        </div>
    );
};

// ─── Container ───────────────────────────────────────────────────────────────
export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <CredentialsNameplate />
        {children}
        <CredentialsPagination />
    </div>
);

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => null;
export const CredentialsSearch = () => null;
export const CredentialsLoading = () => <LoadingView message="Loading credentials…" />;
export const CredentialsError   = () => <ErrorView   message="Error loading credentials" />;

export const CredentialsEmpty = () => {
    const router = useRouter();
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl flex items-center justify-center mb-5 bg-zinc-100 border border-zinc-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <KeyIcon className="size-7 text-zinc-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-zinc-700 mb-1">No credentials yet</h3>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs">Add your first API key or service connection to start building automation workflows.</p>
            <button onClick={() => router.push("/credentials/new")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] hover:bg-zinc-800 transition-all">
                <Plus className="size-3.5" /> Add credential
            </button>
        </motion.div>
    );
};