"use client";

import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "@prisma/client";
import { Trash2, ArrowRight, GitBranch, Search, Plus, LayoutGrid, Clock, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";


// ─── Nameplate Nail ─────────────────────────────────────────────────────────
const NameplateNail = ({ side }: { side: "left" | "right" }) => (
    <span
        className={`absolute top-1/2 -translate-y-1/2 ${
            side === "left" ? "left-4" : "right-4"
        } size-[10px] rounded-full pointer-events-none z-10`}
        style={{
            background:
                "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.88) 0%, rgba(185,185,192,0.70) 42%, rgba(135,135,145,0.55) 100%)",
            boxShadow:
                "0 2px 6px rgba(0,0,0,0.22), 0 0.5px 1px rgba(0,0,0,0.12), inset 0 1px 1.5px rgba(255,255,255,0.88)",
        }}
    />
);

// ─── Weave branding watermark for nameplate background ───────────────────────
const WeaveWatermark = () => (
    <svg
        viewBox="-12 -22 124 132"
        className="w-40 h-40 text-zinc-500"
        fill="none"
        aria-hidden
    >
        <path
            d="M 50 50 C 70 95, 95 95, 95 25 C 95 -20, 70 5, 50 50 C 30 95, 5 95, 5 25 C 5 -20, 30 5, 50 50 Z"
            stroke="currentColor" strokeOpacity="1" strokeWidth="3" strokeLinecap="round"
        />
        <path
            d="M 50 50 C 75 95, 95 70, 95 25 C 95 -10, 75 5, 50 50 C 25 95, 5 70, 5 25 C 5 -10, 25 5, 50 50 Z"
            stroke="currentColor" strokeOpacity="1" strokeWidth="1.8" strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="4.5" fill="currentColor" />
        <circle cx="95" cy="25" r="3" fill="currentColor" />
        <circle cx="5"  cy="25" r="3" fill="currentColor" />
    </svg>
);


// ─── Glass Nameplate ──────────────────────────────────────────────────────────
const WorkflowsNameplate = ({ disabled }: { disabled?: boolean }) => {
    const [params, setParams] = useWorkflowsParams();
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams });
    const createWorkflow = useCreateWorkflow();
    const router         = useRouter();
    const { handleError, modal } = useUpgradeModal();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => router.push(`/workflows/${data.id}`),
            onError:   (error) => handleError(error),
        });
    };

    return (
        <>
            {modal}
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

                {/* Weave branding watermark — animated float */}
                <motion.div
                    className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.055] pointer-events-none select-none"
                    animate={{ y: [0, -7, 0], rotate: [0, 4, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                >
                    <WeaveWatermark />
                </motion.div>

                {/* Title block */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        <AnimatedTitle text="Workflows" />
                    </h1>
                    <AnimatedSubtitle text="Build and run your automation pipelines" />
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
                            placeholder="Search workflows…"
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

                    {/* New Workflow — dark button pops forward from the translucent board */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, delay: 0.55, ease: "easeOut" }}
                        disabled={createWorkflow.isPending || disabled}
                        onClick={handleCreate}
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
                        New Workflow
                    </motion.button>
                </div>
            </motion.div>
        </>
    );
};


// ─── Legacy Search export (kept for any external use) ─────────────────────────
export const WorkflowsSearch = () => null;


// ─── List ─────────────────────────────────────────────────────────────────────

export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();
    const { items } = workflows.data;

    const demoCount    = items.filter(w => w.name.startsWith("__demo__")).length;
    const regularCount = items.length - demoCount;

    if (items.length === 0) return <WorkflowsEmpty />;

    return (
        <>
            {/* Stats pills */}
            <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-6"
            >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/70 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 shadow-sm">
                    <span className="size-1.5 rounded-full bg-zinc-400 inline-block" />
                    My Workflows · {regularCount}
                </span>
                {demoCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/70 dark:border-zinc-700/50 text-zinc-400 dark:text-zinc-500 shadow-sm">
                        <Sparkles className="size-2.5" />
                        {demoCount} demo
                    </span>
                )}
            </motion.div>

            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((workflow, idx) => (
                        <WorkflowItem key={workflow.id} data={workflow} index={idx} />
                    ))}
                </div>
            </AnimatePresence>
        </>
    );
};


// ─── Animated Title chars ─────────────────────────────────────────────────────

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



// ─── Pagination ───────────────────────────────────────────────────────────────

export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowsParams();
    const { page, totalPages } = workflows.data;

    if (totalPages <= 1) return null;

    return (
        <div className="mt-10 pt-4 border-t border-zinc-100/60 dark:border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">{page} / {totalPages}</span>
            <div className="flex gap-2">
                <button
                    disabled={page === 1 || workflows.isFetching}
                    onClick={() => setParams({ ...params, page: Math.max(1, page - 1) })}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/70 dark:border-zinc-700/50 text-zinc-500 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Previous
                </button>
                <button
                    disabled={page === totalPages || totalPages === 0 || workflows.isFetching}
                    onClick={() => setParams({ ...params, page: Math.min(totalPages, page + 1) })}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/70 dark:border-zinc-700/50 text-zinc-500 hover:border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    Next
                </button>
            </div>
        </div>
    );
};


// ─── Container ────────────────────────────────────────────────────────────────

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
            {/* Glass nameplate board — title, search, new workflow all on one panel */}
            <WorkflowsNameplate />
            {children}
            <WorkflowsPagination />
        </div>
    );
};


// ─── Legacy Header export kept for backward compat ───────────────────────────
export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => null;

// ─── Loading / Error ──────────────────────────────────────────────────────────

export const WorkflowsLoading = () => <LoadingView message="Loading workflows…" />;
export const WorkflowsError   = () => <ErrorView message="Error Loading Workflows" />;


// ─── Empty State ──────────────────────────────────────────────────────────────

export const WorkflowsEmpty = () => {
    const router         = useRouter();
    const createWorkflow = useCreateWorkflow();
    const { handleError, modal } = useUpgradeModal();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onError:   (error) => handleError(error),
            onSuccess: (data)  => router.push(`/workflows/${data.id}`),
        });
    };

    return (
        <>
            {modal}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 flex flex-col items-center justify-center text-center py-24 px-8 rounded-[2rem] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-white/70 dark:border-zinc-700/50 shadow-[0_4px_40px_0_rgba(0,0,0,0.05)]"
            >
                <div className="size-14 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 mb-6 shadow-inner">
                    <LayoutGrid className="size-6 text-zinc-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">No workflows yet</h3>
                <p className="text-sm text-zinc-400 max-w-xs mb-8 leading-relaxed">
                    Start from scratch or deploy a quick-start demo above.
                </p>
                <button
                    onClick={handleCreate}
                    disabled={createWorkflow.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                    <Plus className="size-3.5" />
                    Create Workflow
                </button>
            </motion.div>
        </>
    );
};


// ─── Workflow Card ────────────────────────────────────────────────────────────

export const WorkflowItem = ({
    data,
    index = 0,
}: {
    data: Workflow & { nodes?: { type: string }[] };
    index?: number;
}) => {
    const removeWorkflow = useRemoveWorkflow();
    const isDemo        = data.name.startsWith("__demo__");
    const displayName   = isDemo ? data.name.replace(/^__demo__\s?/, "") : data.name;

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeWorkflow.mutate({ id: data.id });
    };

    const nodeTypes = data.nodes
        ? Array.from(new Set(data.nodes.map(n => n.type))).filter(t => t !== "INITIAL")
        : [];

    const isEmpty    = nodeTypes.length === 0;
    const nodeCount  = nodeTypes.length;
    const shown      = nodeTypes.slice(0, 4);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, delay: index * 0.05, ease: "easeOut" }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            layout
        >
            <Link href={`/workflows/${data.id}`} prefetch className="block outline-none group h-full">
                <div className={`
                    relative flex flex-col h-full rounded-[1.5rem] overflow-hidden
                    bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md
                    border transition-all duration-300
                    shadow-[0_2px_16px_0_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]
                    dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)]
                    hover:shadow-[0_8px_36px_0_rgba(0,0,0,0.10)]
                    dark:hover:shadow-[0_8px_36px_0_rgba(0,0,0,0.5)]
                    ${isDemo
                        ? "border-zinc-200/70 dark:border-zinc-700/50 hover:border-zinc-300/80 dark:hover:border-zinc-600/60"
                        : "border-white/80 dark:border-zinc-800/70 hover:border-zinc-200/80 dark:hover:border-zinc-700/60"
                    }
                    ${removeWorkflow.isPending ? "opacity-40 pointer-events-none" : ""}
                `}>
                    {/* Demo shimmer stripe */}
                    {isDemo && (
                        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-zinc-300/70 dark:via-zinc-600/50 to-transparent" />
                    )}

                    {/* Card body */}
                    <div className="flex-1 p-5 pb-4">
                        {/* Top row: icon + name + delete */}
                        <div className="flex items-start justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="size-9 rounded-xl flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-700/60 shrink-0 shadow-sm group-hover:shadow-md group-hover:border-zinc-200 dark:group-hover:border-zinc-600 transition-all duration-200">
                                    <GitBranch className="size-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-[0.875rem] font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight leading-snug">
                                            {displayName}
                                        </h3>
                                        {isDemo && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-400 dark:text-zinc-500 shrink-0">
                                                <Sparkles className="size-2" />
                                                demo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleRemove}
                                disabled={removeWorkflow.isPending}
                                title="Delete"
                                className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all outline-none shrink-0"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>

                        {/* Node flow — arrow-separated minimal text */}
                        <div className="min-h-[20px] flex items-center">
                            {isEmpty ? (
                                <span className="text-[10px] text-zinc-300 dark:text-zinc-600 italic">
                                    Empty canvas
                                </span>
                            ) : (
                                <div className="flex items-center gap-1 flex-wrap">
                                    {shown.map((type, i) => (
                                        <span key={type} className="flex items-center gap-1">
                                            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                                                {type.replace(/_/g, " ")}
                                            </span>
                                            {i < shown.length - 1 && (
                                                <ArrowRight className="size-2.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                                            )}
                                        </span>
                                    ))}
                                    {nodeCount > 4 && (
                                        <span className="text-[9px] font-medium text-zinc-300 dark:text-zinc-600 ml-0.5">
                                            +{nodeCount - 4}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100/60 dark:border-zinc-800/50 bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                                <Clock className="size-3" strokeWidth={2} />
                                {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                            </span>
                            {!isEmpty && (
                                <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium">
                                    {nodeCount} node{nodeCount !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0 transition-all duration-200">
                            Open <ArrowRight className="size-3" />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
