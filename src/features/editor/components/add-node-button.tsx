"use client";

import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { NodeSelector } from "@/components/node-selector";

// ─── Add Node button — glass pill ─────────────────────────────────────────────
// Sits in the top-right Panel of the ReactFlow canvas.
// Same liquid-glass material as the node bodies and editor header.
export const AddNodeButton = memo(() => {
    const [selectorOpen, setSelectorOpen] = useState(false);

    return (
        <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
            <button
                onClick={() => setSelectorOpen(true)}
                title="Add a new node"
                className={[
                    // Shape & size
                    "h-8 px-3 rounded-[12px] flex items-center gap-1.5",
                    // Liquid glass — same as ACRYLIC_ACTIVE sidebar
                    "bg-white/30 dark:bg-zinc-800/30 backdrop-blur-2xl",
                    "border border-white/70 dark:border-zinc-600/50",
                    "shadow-[0_6px_20px_rgba(0,0,0,0.07),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.04)]",
                    // Text
                    "text-[11px] font-semibold text-zinc-600 dark:text-zinc-400",
                    // Interactions
                    "hover:bg-white/50 dark:hover:bg-zinc-700/50",
                    "hover:text-zinc-800 dark:hover:text-zinc-200",
                    "hover:shadow-[0_8px_24px_rgba(0,0,0,0.09),inset_0_1.5px_1px_rgba(255,255,255,0.98)]",
                    "transition-all duration-150 active:scale-95",
                ].join(" ")}
            >
                <PlusIcon className="size-3.5" strokeWidth={2.5} />
                <span>Add node</span>
            </button>
        </NodeSelector>
    );
});

AddNodeButton.displayName = "AddNodeButton";
