"use client"

import { Execution } from "@prisma/client";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon, ArrowLeftIcon, TimerIcon, CalendarIcon, HashIcon, Trash2Icon } from "lucide-react";
import { useSuspenseExecution, useDeleteExecution } from "../hooks/use-executions";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

const ExecutionStatusConfig: Record<Execution["status"], {
    icon: React.ReactNode;
    label: string;
    iconBg: string;
    badge: string;
}> = {
    SUCCESS: {
        icon: <CheckCircle2Icon className="size-5" />,
        label: "Success",
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
        badge:  "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    FAILED: {
        icon: <XCircleIcon className="size-5" />,
        label: "Failed",
        iconBg: "bg-red-50 text-red-500 border-red-100",
        badge:  "text-red-700 bg-red-50 border-red-100",
    },
    RUNNING: {
        icon: <Loader2Icon className="size-5 animate-spin" />,
        label: "Running",
        iconBg: "bg-blue-50 text-blue-500 border-blue-100",
        badge:  "text-blue-700 bg-blue-50 border-blue-100",
    },
};

// ─── Metric tile ──────────────────────────────────────────────────────────────
const MetricTile = ({
    label, value, icon
}: {
    label: string; value: React.ReactNode; icon: React.ReactNode;
}) => (
    <div className={[
        "p-4 rounded-2xl",
        "bg-zinc-50/70 dark:bg-zinc-800/30",
        "border border-zinc-100 dark:border-zinc-800",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_4px_rgba(0,0,0,0.03)]",
    ].join(" ")}>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            {icon}{label}
        </div>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</div>
    </div>
);

export const ExecutionView = ({ executionId }: { executionId: string }) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStack, setShowStack] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const deleteExecution = useDeleteExecution();
    const router = useRouter();

    const config = ExecutionStatusConfig[execution.status] ?? ExecutionStatusConfig.RUNNING;

    const duration = execution.completedAt
        ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)
        : null;

    const durationLabel = duration !== null
        ? duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m ${duration % 60}s`
        : "In progress";

    const workflowName = execution.workflow.name.startsWith("__demo__")
        ? execution.workflow.name.replace("__demo__", "").replace(/_/g, " ").trim()
        : execution.workflow.name;

    const handleDelete = () => {
        deleteExecution.mutate(
            { id: execution.id },
            { onSuccess: () => router.push("/executions") }
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">

            {/* Back nav */}
            <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
            >
                <Link
                    href="/executions"
                    prefetch
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                    <ArrowLeftIcon className="size-3.5" />
                    Back to executions
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Main card ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:col-span-2 space-y-4"
                >
                    {/* Header card */}
                    <div className={[
                        "p-6 rounded-2xl",
                        "bg-white dark:bg-zinc-900",
                        "border border-zinc-100 dark:border-zinc-800",
                        "shadow-[0_4px_24px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]",
                    ].join(" ")}>
                        <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-zinc-50 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className={`size-12 rounded-xl flex items-center justify-center border ${config.iconBg}`}>
                                    {config.icon}
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                        {workflowName}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${config.badge}`}>
                                            {config.label}
                                        </span>
                                        {execution.status === "RUNNING" && (
                                            <span className="flex items-center gap-1 text-[10px] text-blue-500">
                                                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                Live
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Delete button */}
                            {!confirmDelete ? (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="p-2 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                    title="Delete this execution"
                                >
                                    <Trash2Icon className="size-4" />
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-xs text-red-600">Delete?</span>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleteExecution.isPending}
                                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                                    >
                                        {deleteExecution.isPending ? "…" : "Yes"}
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="px-3 py-1 text-xs rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all"
                                    >
                                        No
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <MetricTile
                                label="Duration"
                                icon={<TimerIcon className="size-2.5" />}
                                value={durationLabel}
                            />
                            <MetricTile
                                label="Started"
                                icon={<CalendarIcon className="size-2.5" />}
                                value={format(new Date(execution.startedAt), "MMM d, h:mm a")}
                            />
                            {execution.completedAt && (
                                <MetricTile
                                    label="Completed"
                                    icon={<CalendarIcon className="size-2.5" />}
                                    value={formatDistanceToNow(execution.completedAt, { addSuffix: true })}
                                />
                            )}
                            <MetricTile
                                label="Event ID"
                                icon={<HashIcon className="size-2.5" />}
                                value={
                                    <span className="font-mono text-xs truncate block" title={execution.inngestEventId ?? ""}>
                                        {execution.inngestEventId?.slice(0, 16)}…
                                    </span>
                                }
                            />
                        </div>
                    </div>

                    {/* Error block */}
                    {execution.error && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={[
                                "p-5 rounded-2xl overflow-hidden",
                                "bg-red-50 dark:bg-red-950/20",
                                "border border-red-100 dark:border-red-800/50",
                            ].join(" ")}
                        >
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">Error</p>
                            <p className="text-sm text-red-800 dark:text-red-300 font-mono leading-relaxed break-all whitespace-pre-wrap">
                                {execution.error}
                            </p>
                            {execution.errorStack && (
                                <div className="mt-3">
                                    <button
                                        onClick={() => setShowStack(!showStack)}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                    >
                                        {showStack ? "Hide" : "Show"} stack trace
                                    </button>
                                    <AnimatePresence>
                                        {showStack && (
                                            <motion.pre
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 text-xs font-mono text-red-700 dark:text-red-300 bg-red-100/60 dark:bg-red-900/30 rounded-xl p-3 overflow-auto max-h-48 break-all whitespace-pre-wrap"
                                            >
                                                {execution.errorStack}
                                            </motion.pre>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Output block */}
                    {execution.output && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className={[
                                "p-5 rounded-2xl",
                                "bg-white dark:bg-zinc-900",
                                "border border-zinc-100 dark:border-zinc-800",
                                "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
                            ].join(" ")}
                        >
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Output</p>
                            <pre className="text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 overflow-auto max-h-60">
                                {JSON.stringify(execution.output, null, 2)}
                            </pre>
                        </motion.div>
                    )}
                </motion.div>

                {/* ── Right: workflow link card ──────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className={[
                        "p-5 rounded-2xl",
                        "bg-white dark:bg-zinc-900",
                        "border border-zinc-100 dark:border-zinc-800",
                        "shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
                    ].join(" ")}>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Workflow</p>
                        <Link
                            href={`/workflows/${execution.workflowId}`}
                            prefetch
                            className={[
                                "flex items-center gap-2 text-sm font-medium",
                                "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
                                "transition-colors",
                            ].join(" ")}
                        >
                            {workflowName}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                                Open →
                            </span>
                        </Link>
                        <p className="text-xs text-zinc-400 mt-2">
                            Started {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};