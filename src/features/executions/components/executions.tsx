"use client"

import { useSuspenseExecutions, useDeleteExecution, useDeleteAllExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import type { Execution } from "@prisma/client";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
    CheckCircle2Icon, XCircleIcon, Loader2Icon,
    Search, HistoryIcon, ActivityIcon, TimerIcon,
    Trash2Icon, AlertTriangleIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { LoadingView, ErrorView } from "@/components/entity-components";

// ─── Status config ────────────────────────────────────────────────────────────
type StatusKey = Execution["status"];

const STATUS_CONFIG: Record<StatusKey, {
    icon: React.ReactNode;
    label: string;
    bar: string;
    badge: string;
    icon_bg: string;
}> = {
    SUCCESS: {
        icon:    <CheckCircle2Icon className="size-4" />,
        label:   "Success",
        bar:     "bg-emerald-400",
        badge:   "text-emerald-700 bg-emerald-50 border-emerald-100",
        icon_bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    FAILED: {
        icon:    <XCircleIcon className="size-4" />,
        label:   "Failed",
        bar:     "bg-red-400",
        badge:   "text-red-700 bg-red-50 border-red-100",
        icon_bg: "bg-red-50 text-red-500 border-red-100",
    },
    RUNNING: {
        icon:    <Loader2Icon className="size-4 animate-spin" />,
        label:   "Running",
        bar:     "bg-blue-400",
        badge:   "text-blue-700 bg-blue-50 border-blue-100",
        icon_bg: "bg-blue-50 text-blue-500 border-blue-100",
    },
};

// ─── Animated title ───────────────────────────────────────────────────────────
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

// ─── Nameplate nail ───────────────────────────────────────────────────────────
const NameplateNail = ({ side }: { side: "left" | "right" }) => (
    <span
        className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-4" : "right-4"} size-[10px] rounded-full pointer-events-none z-10`}
        style={{
            background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.88) 0%, rgba(185,185,192,0.70) 42%, rgba(135,135,145,0.55) 100%)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.22), 0 0.5px 1px rgba(0,0,0,0.12), inset 0 1px 1.5px rgba(255,255,255,0.88)",
        }}
    />
);

// ─── Delete-all confirm ───────────────────────────────────────────────────────
const ConfirmDeleteAll = ({ onConfirm, onCancel, isPending }: {
    onConfirm: () => void; onCancel: () => void; isPending: boolean;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 shadow-[0_2px_12px_rgba(239,68,68,0.08)]"
    >
        <AlertTriangleIcon className="size-4 text-red-500 shrink-0" />
        <span className="text-sm text-red-700 flex-1">Delete all execution history? This cannot be undone.</span>
        <button onClick={onConfirm} disabled={isPending} className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all">
            {isPending ? "Deleting…" : "Yes, delete all"}
        </button>
        <button onClick={onCancel} className="px-3 py-1 text-xs font-medium rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all">
            Cancel
        </button>
    </motion.div>
);

// ─── Nameplate ────────────────────────────────────────────────────────────────
const ExecutionsNameplate = () => {
    const [search, setSearch] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const deleteAll = useDeleteAllExecutions();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y:   0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={[
                "relative mb-8 px-12 py-7 rounded-2xl overflow-hidden",
                "bg-zinc-100/80 dark:bg-zinc-800/60 backdrop-blur-xl",
                "border border-zinc-200/60 dark:border-zinc-700/50",
                // Full-edge moulding
                "shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_6px_rgba(0,0,0,0.04),inset_0_1.5px_0px_rgba(255,255,255,0.90),inset_0_-1.5px_0px_rgba(0,0,0,0.04),inset_1.5px_0px_rgba(255,255,255,0.60),inset_-1.5px_0px_rgba(0,0,0,0.03)]",
            ].join(" ")}
        >
            <NameplateNail side="left"  />
            <NameplateNail side="right" />

            {/* Animated ActivityIcon watermark */}
            <motion.div
                className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none"
                animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
                <ActivityIcon className="w-28 h-28 text-zinc-600" strokeWidth={1} />
            </motion.div>

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    <AnimatedTitle text="Executions" />
                </h1>
                <AnimatedSubtitle text="Monitor your workflow run history and performance" />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-zinc-300/40 dark:via-zinc-600/40 to-transparent mb-5" />

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px] max-w-xs group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400 pointer-events-none group-focus-within:text-zinc-600 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search executions…"
                        className={[
                            "w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all",
                            "bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm",
                            "border border-white/70 dark:border-zinc-600/50",
                            "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400",
                            "shadow-[0_3px_14px_rgba(0,0,0,0.07),inset_0_1px_1px_rgba(255,255,255,0.9)]",
                            "focus:bg-white/60 focus:border-white/90",
                        ].join(" ")}
                    />
                </div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.55 }}
                    onClick={() => setShowConfirm(true)}
                    className={[
                        "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0",
                        "bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm",
                        "text-zinc-500 border border-zinc-200/60",
                        "hover:bg-red-50 hover:text-red-600 hover:border-red-100",
                        "transition-all active:scale-[0.98]",
                    ].join(" ")}
                >
                    <Trash2Icon className="size-3.5" />
                    Clear history
                </motion.button>
            </div>

            <AnimatePresence>
                {showConfirm && (
                    <div className="mt-4">
                        <ConfirmDeleteAll
                            isPending={deleteAll.isPending}
                            onConfirm={() => deleteAll.mutate(undefined, { onSuccess: () => setShowConfirm(false) })}
                            onCancel={() => setShowConfirm(false)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Execution timeline row ───────────────────────────────────────────────────
export const ExecutionItem = ({
    data,
    index = 0,
}: {
    data: Execution & { workflow: { id: string; name: string } };
    index?: number;
}) => {
    const config = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.RUNNING;
    const deleteExecution = useDeleteExecution();

    const duration = data.completedAt
        ? Math.round((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000)
        : null;
    const durationLabel = duration !== null
        ? duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m ${duration % 60}s`
        : null;

    const workflowName = data.workflow.name.startsWith("__demo__")
        ? data.workflow.name.replace("__demo__", "").replace(/_/g, " ").trim()
        : data.workflow.name;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.22, delay: index * 0.03, ease: "easeOut" }}
            className="group"
        >
            {/*
              The flex row has a fixed-width delete slot at the right (w-8).
              The slot ALWAYS reserves space — no absolute positioning —
              so the timestamp text can never be hidden behind the button.
            */}
            <div className={[
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150",
                "bg-white dark:bg-zinc-900",
                "border border-zinc-100 dark:border-zinc-800",
                "shadow-[0_1px_6px_rgba(0,0,0,0.04)]",
                "hover:shadow-[0_3px_16px_rgba(0,0,0,0.07)] hover:border-zinc-200 hover:bg-zinc-50/50",
            ].join(" ")}>

                {/* Left colour bar */}
                <div className={`w-0.5 h-8 rounded-full shrink-0 ${config.bar}`} />

                {/* Status icon */}
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${config.icon_bg}`}>
                    {config.icon}
                </div>

                {/* Main info — flex-1 so it fills available space */}
                <Link href={`/executions/${data.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {workflowName}
                        </span>
                        <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${config.badge}`}>
                            {config.label}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        {format(new Date(data.startedAt), "MMM d, h:mm a")}
                        &nbsp;·&nbsp;
                        {formatDistanceToNow(data.startedAt, { addSuffix: true })}
                    </p>
                </Link>

                {/* Duration chip */}
                {durationLabel && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
                        <TimerIcon className="size-3" />
                        {durationLabel}
                    </div>
                )}

                {/* Running pulse */}
                {data.status === "RUNNING" && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-500 shrink-0">
                        <span className="size-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                        Live
                    </div>
                )}

                {/*
                  Delete slot: ALWAYS w-8 wide so it reservers space.
                  Button is opacity-0 by default → opacity-100 on group-hover.
                  No absolute positioning → zero overlap with any text.
                */}
                <div className="w-8 flex items-center justify-center shrink-0">
                    <button
                        onClick={() => deleteExecution.mutate({ id: data.id })}
                        disabled={deleteExecution.isPending}
                        className={[
                            "size-7 rounded-lg flex items-center justify-center",
                            "opacity-0 group-hover:opacity-100 transition-all duration-150",
                            "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700",
                            "text-zinc-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50",
                            "shadow-sm disabled:opacity-40",
                        ].join(" ")}
                        title="Delete this execution"
                    >
                        <Trash2Icon className="size-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ─── List ─────────────────────────────────────────────────────────────────────
export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();
    const { items } = executions.data;

    if (items.length === 0) return <ExecutionsEmpty />;

    const successCount = items.filter(e => e.status === "SUCCESS").length;
    const failedCount  = items.filter(e => e.status === "FAILED").length;
    const runningCount = items.filter(e => e.status === "RUNNING").length;

    return (
        <>
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-zinc-100 text-zinc-500 shadow-sm">
                    <HistoryIcon className="size-2.5" />
                    {items.length} run{items.length !== 1 ? "s" : ""}
                </span>
                {successCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-100 text-emerald-600 shadow-sm">
                        <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                        {successCount} succeeded
                    </span>
                )}
                {failedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-red-50/80 border border-red-100 text-red-600 shadow-sm">
                        <span className="size-1.5 rounded-full bg-red-400 inline-block" />
                        {failedCount} failed
                    </span>
                )}
                {runningCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 shadow-sm">
                        <span className="size-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
                        {runningCount} running
                    </span>
                )}
            </motion.div>

            <AnimatePresence mode="popLayout">
                <div className="flex flex-col gap-2">
                    {items.map((execution, idx) => (
                        <ExecutionItem key={execution.id} data={execution as any} index={idx} />
                    ))}
                </div>
            </AnimatePresence>
        </>
    );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionsParams();
    const { page, totalPages } = executions.data;

    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 pt-4 border-t border-zinc-100/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">{page} / {totalPages}</span>
            <div className="flex gap-2">
                <button disabled={page === 1 || executions.isFetching} onClick={() => setParams({ ...params, page: Math.max(1, page - 1) })} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/60 border border-zinc-200/60 text-zinc-500 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Previous</button>
                <button disabled={page === totalPages || executions.isFetching} onClick={() => setParams({ ...params, page: Math.min(totalPages, page + 1) })} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/60 border border-zinc-200/60 text-zinc-500 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Next</button>
            </div>
        </div>
    );
};

// ─── Container ────────────────────────────────────────────────────────────────
export const ExecutionsContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <ExecutionsNameplate />
        {children}
        <ExecutionsPagination />
    </div>
);

export const ExecutionsHeader  = () => null;
export const ExecutionsLoading = () => <LoadingView message="Loading executions…" />;
export const ExecutionsError   = () => <ErrorView   message="Error loading executions" />;

export const ExecutionsEmpty = () => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-16 rounded-2xl flex items-center justify-center mb-5 bg-zinc-100 border border-zinc-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <HistoryIcon className="size-7 text-zinc-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-zinc-700 mb-1">No executions yet</h3>
        <p className="text-sm text-zinc-400 max-w-xs">Run a workflow to see its execution history, timing, and status here.</p>
    </motion.div>
);