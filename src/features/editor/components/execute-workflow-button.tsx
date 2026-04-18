"use client";

import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { Loader2Icon, PlayIcon } from "lucide-react";

// ─── Execute Workflow button — prominent glass pill ────────────────────────────
// Sits in the bottom-center Panel. Uses dark glass for primary-action weight.
// Pulses subtly while running via animate-pulse on the icon container.
export const ExecuteWorkflowButton = ({ workflowId }: { workflowId: string }) => {
    const executeWorkflow = useExecuteWorkflow();
    const isPending = executeWorkflow.isPending;

    return (
        <button
            onClick={() => executeWorkflow.mutate({ id: workflowId })}
            disabled={isPending}
            className={[
                // Shape
                "h-9 px-5 rounded-[14px] flex items-center gap-2",
                // Solid dark glass — reads as the "main action"
                "bg-zinc-800/90 dark:bg-zinc-100/90",
                "text-white dark:text-zinc-900",
                "text-[12px] font-semibold tracking-tight",
                // Thin bright border catches the light
                "border border-zinc-600/50 dark:border-zinc-300/40",
                // Lift shadow — matches the ACRYLIC_ACTIVE outer lift shadow
                "shadow-[0_6px_28px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.12)]",
                // Hover
                "hover:bg-zinc-700/90 dark:hover:bg-zinc-200/90",
                "hover:shadow-[0_10px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]",
                "hover:-translate-y-px",
                // State
                "transition-all duration-150 active:scale-[0.97] active:shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:-translate-y-0",
                // Backdrop
                "backdrop-blur-xl",
            ].join(" ")}
        >
            {/* Icon container — pulses during execution */}
            <span className={isPending ? "animate-pulse" : ""}>
                {isPending
                    ? <Loader2Icon className="size-3.5 animate-spin" />
                    : <PlayIcon className="size-3.5 fill-current" />}
            </span>
            <span>{isPending ? "Running…" : "Run workflow"}</span>
        </button>
    );
};