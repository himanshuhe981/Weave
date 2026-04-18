"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import {
    BracesIcon, ClockIcon, GlobeIcon, MousePointerIcon,
    SearchIcon, TimerIcon, XIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "./ui/sheet";
import { NodeType } from "@prisma/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;
    category: "trigger" | "ai" | "action" | "logic";
};

// ─── Node catalogue ───────────────────────────────────────────────────────────

const NODES: NodeTypeOption[] = [
    { type: NodeType.MANUAL_TRIGGER,      label: "Manual Trigger",  description: "Start a run with a button click",           icon: MousePointerIcon,        category: "trigger" },
    { type: NodeType.WEBHOOK_TRIGGER,     label: "Webhook",         description: "Fire on any HTTP POST request",             icon: "/logos/webhook.svg",    category: "trigger" },
    { type: NodeType.GOOGLE_FORM_TRIGGER, label: "Google Form",     description: "Trigger on Google Form submission",         icon: "/logos/googleform.svg", category: "trigger" },
    { type: NodeType.STRIPE_TRIGGER,      label: "Stripe",          description: "Listen to Stripe payment events",           icon: "/logos/stripe.svg",     category: "trigger" },
    { type: NodeType.SCHEDULE_TRIGGER,    label: "Schedule",        description: "Run on a recurring cron schedule",          icon: ClockIcon,               category: "trigger" },
    { type: NodeType.GEMINI,    label: "Gemini",    description: "Google Gemini 2.0 / 1.5",          icon: "/logos/gemini.svg",    category: "ai" },
    { type: NodeType.OPENAI,    label: "OpenAI",    description: "GPT-4o, GPT-4.1 and more",          icon: "/logos/openai.svg",    category: "ai" },
    { type: NodeType.ANTHROPIC, label: "Anthropic", description: "Claude Sonnet, Haiku, Opus",        icon: "/logos/anthropic.svg", category: "ai" },
    { type: NodeType.HTTP_REQUEST,   label: "HTTP Request",   description: "Call any external REST API",          icon: GlobeIcon,            category: "action" },
    { type: NodeType.DISCORD,        label: "Discord",        description: "Post a message via Incoming Webhook", icon: "/logos/discord.svg", category: "action" },
    { type: NodeType.SLACK,          label: "Slack",          description: "Post a message via Incoming Webhook", icon: "/logos/slack.svg",   category: "action" },
    { type: NodeType.TELEGRAM,       label: "Telegram",       description: "Send a message via Telegram bot",     icon: "/logos/telegram.svg",category: "action" },
    { type: NodeType.CONDITION,      label: "Condition",      description: "Branch YES / NO based on rules",      icon: "/logos/condition.svg",category: "logic" },
    { type: NodeType.JSON_TRANSFORM, label: "JSON Transform", description: "Reshape data with templates",         icon: BracesIcon,           category: "logic" },
    { type: NodeType.DELAY,          label: "Delay",          description: "Pause execution for a set time",      icon: TimerIcon,            category: "logic" },
];

const SECTIONS = [
    { id: "all",     label: "All"      },
    { id: "trigger", label: "Triggers" },
    { id: "ai",      label: "AI"       },
    { id: "action",  label: "Actions"  },
    { id: "logic",   label: "Logic"    },
];

const GROUP_LABELS: Record<string, string> = {
    trigger: "Triggers",
    ai:      "AI Models",
    action:  "Actions",
    logic:   "Logic",
};

// ─── NodeRow ──────────────────────────────────────────────────────────────────
// At rest: fully invisible — just text floating in the frosted surface.
// On hover: a soft white wash lifts the row — no borders, no card, just glow.

function NodeRow({ node, onSelect }: { node: NodeTypeOption; onSelect: (n: NodeTypeOption) => void }) {
    const Icon = node.icon;
    return (
        <button
            type="button"
            onClick={() => onSelect(node)}
            className={cn(
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left",
                "bg-transparent border border-transparent",
                // Hover: a soft white luminance wash — no hard card border
                "hover:bg-white/40 dark:hover:bg-white/[0.06]",
                "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]",
                "dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]",
                "transition-all duration-150 active:scale-[0.99]",
            )}
        >
            {/* Icon — clean neutral chip, no category colour */}
            <div className="shrink-0 size-8 rounded-[9px] flex items-center justify-center bg-white/60 dark:bg-zinc-800/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.06)]">
                {typeof Icon === "string" ? (
                    <Image src={Icon} alt={node.label} width={16} height={16} className="object-contain" />
                ) : (
                    <Icon className="size-4 text-zinc-500 dark:text-zinc-400" />
                )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 leading-none tracking-tight">
                    {node.label}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-[3px] leading-snug truncate font-normal">
                    {node.description}
                </p>
            </div>
        </button>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function NodeSelector({ open, onOpenChange, children }: NodeSelectorProps) {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState<string>("all");

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return NODES.filter(n => {
            const tabOk = tab === "all" || n.category === tab;
            const qOk   = !q || n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
            return tabOk && qOk;
        });
    }, [query, tab]);

    const groups = useMemo(() => {
        const order: NodeTypeOption["category"][] = ["trigger", "ai", "action", "logic"];
        return order.reduce<{ cat: string; items: NodeTypeOption[] }[]>((acc, cat) => {
            const items = filtered.filter(n => n.category === cat);
            if (items.length) acc.push({ cat, items });
            return acc;
        }, []);
    }, [filtered]);

    const handleSelect = useCallback((selection: NodeTypeOption) => {
        if (selection.type === NodeType.MANUAL_TRIGGER && getNodes().some(n => n.type === NodeType.MANUAL_TRIGGER)) {
            toast.error("Only one trigger per workflow");
            return;
        }
        setNodes(nodes => {
            const hasInitial = nodes.some(n => n.type === NodeType.INITIAL);
            const pos = screenToFlowPosition({
                x: window.innerWidth  / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
            });
            const newNode = { id: createId(), data: {}, position: pos, type: selection.type };
            return hasInitial ? [newNode] : [...nodes, newNode];
        });
        onOpenChange(false);
        setQuery("");
    }, [setNodes, getNodes, onOpenChange, screenToFlowPosition]);

    return (
        <Sheet open={open} onOpenChange={v => { onOpenChange(v); if (!v) setQuery(""); }}>
            {children}
            <SheetContent
                side="right"
                className={cn(
                    "w-[340px] sm:w-[360px] max-w-[90vw] p-0 flex flex-col overflow-hidden",
                    // Plain white — same as the dashboard sidebar
                    "bg-white dark:bg-zinc-900",
                    "border-l border-zinc-200/80 dark:border-zinc-800",
                    "shadow-[-8px_0_24px_rgba(0,0,0,0.06)]",
                    "[&>button]:hidden",
                )}
            >
                <SheetTitle className="sr-only">Add node</SheetTitle>

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="shrink-0 px-5 pt-5 pb-4">

                    {/* Title row */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
                                Add node
                            </h2>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">
                                {NODES.length} nodes available
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { onOpenChange(false); setQuery(""); }}
                            className="size-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-white/[0.08] transition-all duration-150"
                        >
                            <XIcon className="size-3.5" />
                        </button>
                    </div>

                    {/* Search — inset pill, slightly sunken */}
                    <div className={cn(
                        "flex items-center gap-2 h-9 px-3 rounded-full",
                        "bg-black/[0.05] dark:bg-white/[0.06]",
                        "border border-black/[0.07] dark:border-white/[0.09]",
                        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]",
                        "focus-within:bg-white/70 dark:focus-within:bg-zinc-800/50",
                        "focus-within:border-zinc-300/60 dark:focus-within:border-zinc-500/50",
                        "focus-within:shadow-[inset_0_1px_3px_rgba(0,0,0,0.04),0_0_0_3px_rgba(0,0,0,0.03)]",
                        "transition-all duration-200",
                    )}>
                        <SearchIcon className="size-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search…"
                            className="flex-1 bg-transparent text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")}
                                className="size-4 flex items-center justify-center rounded-full bg-zinc-300/60 dark:bg-zinc-600/60 text-zinc-500 hover:bg-zinc-400/60 transition-colors">
                                <XIcon className="size-2.5" />
                            </button>
                        )}
                    </div>

                    {/* Category tabs — text pills, active = soft black */}
                    <div className="flex gap-1 mt-3.5">
                        {SECTIONS.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setTab(s.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150",
                                    tab === s.id
                                        // Active: soft opaque warm white pill — not harsh black
                                        ? "bg-zinc-800/85 dark:bg-zinc-100/85 text-white dark:text-zinc-900 shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-white/40 dark:hover:bg-white/[0.06]",
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hairline divider */}
                <div className="shrink-0 h-px bg-black/[0.06] dark:bg-white/[0.07] mx-5" />

                {/* ── Node list ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
                    {groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <SearchIcon className="size-5 text-zinc-300 dark:text-zinc-600 mb-2" />
                            <p className="text-[12px] text-zinc-400">No results for &ldquo;{query}&rdquo;</p>
                            <button type="button" onClick={() => setQuery("")}
                                className="text-[11px] text-zinc-400 underline underline-offset-2 mt-1">
                                Clear
                            </button>
                        </div>
                    ) : (
                        groups.map(({ cat, items }) => (
                            <div key={cat}>
                                {tab === "all" && (
                                    <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400/60 dark:text-zinc-600 select-none">
                                        {GROUP_LABELS[cat]}
                                    </p>
                                )}
                                {/* No gap between rows — rows have their own py-2.5 */}
                                <div>
                                    {items.map(node => (
                                        <NodeRow key={node.type} node={node} onSelect={handleSelect} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Hairline divider */}
                <div className="shrink-0 h-px bg-black/[0.06] dark:bg-white/[0.07] mx-5" />

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div className="shrink-0 px-5 py-3">
                    <p className="text-[10px] text-zinc-400/60 dark:text-zinc-600 text-center tracking-wide font-normal">
                        Double-click any node on the canvas to configure
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
