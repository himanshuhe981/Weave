"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { Settings2Icon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";

interface WorkflowNodeProps {
    children: ReactNode;
    showToolbar?: boolean;
    onDelete?: () => void;
    onSettings?: () => void;
    name?: string;
    description?: string;
    /** Show the double-click hint — driven by parent hover state */
    showHint?: boolean;
}

// ─── Toolbar action button (glass pill) ──────────────────────────────────────
function ToolbarBtn({
    onClick,
    icon: Icon,
    label,
    danger = false,
}: {
    onClick?: () => void;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    danger?: boolean;
}) {
    return (
        <div className="relative group/tbtn">
            <button
                onClick={onClick}
                className={[
                    "size-[26px] rounded-[9px] flex items-center justify-center",
                    "transition-all duration-150 active:scale-90",
                    "border",
                    danger
                        ? "bg-red-50/70 border-red-200/60 text-red-500 hover:bg-red-100/90 hover:border-red-300/70"
                        : "bg-white/50 border-zinc-200/60 text-zinc-500 hover:bg-white/75 hover:border-zinc-300/70",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_1px_4px_rgba(0,0,0,0.07)]",
                    "backdrop-blur-xl",
                ].join(" ")}
            >
                <Icon className="size-3" strokeWidth={1.75} />
            </button>
            {/* Individual button tooltip */}
            <span className={[
                "pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50",
                "px-1.5 py-0.5 rounded-md text-[9px] font-medium whitespace-nowrap",
                "bg-zinc-800/95 text-zinc-100 shadow-sm",
                "opacity-0 scale-95",
                "group-hover/tbtn:opacity-100 group-hover/tbtn:scale-100",
                "transition-all duration-100",
            ].join(" ")}>
                {label}
            </span>
        </div>
    );
}

// ─── WorkflowNode ─────────────────────────────────────────────────────────────
export function WorkflowNode({
    children,
    showToolbar = true,
    onDelete,
    onSettings,
    name,
    description,
    showHint = false,
}: WorkflowNodeProps) {
    return (
        <>
            {/* ── Action toolbar — appears above node on selection ────── */}
            {showToolbar && (
                <NodeToolbar>
                    <div className={[
                        "flex items-center gap-1 px-1.5 py-1 rounded-[12px]",
                        "bg-white/40 dark:bg-zinc-900/50 backdrop-blur-2xl",
                        "border border-white/70 dark:border-zinc-600/50",
                        "shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]",
                    ].join(" ")}>
                        <ToolbarBtn icon={Settings2Icon} label="Settings" onClick={onSettings} />
                        <div className="w-px h-3.5 bg-zinc-200/60 dark:bg-zinc-700/50 mx-0.5" />
                        <ToolbarBtn icon={Trash2Icon}   label="Delete"   onClick={onDelete}   danger />
                    </div>
                </NodeToolbar>
            )}

            {children}

            {/* ── Name + description label — always visible, below node ─ */}
            {name && (
                <NodeToolbar position={Position.Bottom} isVisible>
                    <div className="flex flex-col items-center text-center max-w-[160px] gap-0.5">

                        {/* Node name */}
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-snug tracking-tight">
                            {name}
                        </p>

                        {/* Description — truncated subtitle */}
                        {description && (
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight truncate max-w-[150px]">
                                {description}
                            </p>
                        )}

                        {/* Double-click hint — hover-only, very subtle.
                            showHint is true only while the node is hovered
                            AND it has an onDoubleClick handler. */}
                        {showHint && (
                            <p className="text-[9px] text-zinc-300 dark:text-zinc-600 leading-tight mt-0.5 select-none">
                                ↕ double-click to configure
                            </p>
                        )}
                    </div>
                </NodeToolbar>
            )}
        </>
    );
}