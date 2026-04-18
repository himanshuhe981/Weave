import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { NodeStatus } from "./node-status-indicator";

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  status?: NodeStatus;
}

// ─── Corner status dot — minimal, non-intrusive ───────────────────────────────
const StatusDot = ({ status }: { status: NodeStatus }) => {
  if (status === "initial") return null;
  const cfg: Record<string, string> = {
    loading: "bg-blue-400 animate-pulse",
    success: "bg-emerald-400",
    error:   "bg-red-400",
  };
  return (
    <span
      aria-label={status}
      className={cn(
        "absolute bottom-[6px] right-[6px] size-[4px] rounded-full z-20 pointer-events-none",
        cfg[status] ?? "",
      )}
    />
  );
};

// ─── BaseNode — 56 × 56 px liquid-glass squircle ─────────────────────────────
//
//  Visual identity is IDENTICAL to the sidebar ACRYLIC_ACTIVE constant:
//    bg-white/20       → almost transparent; canvas shows through
//    backdrop-blur-2xl → frosted glass
//    border-white/70   → crisp glass edge
//    inset 1.5px top   → light catching the sanded top edge
//    outer lift shadow → panel floating above the canvas
//
//  The LEFT and RIGHT edges carry the nail-styled handles (see base-handle.tsx).
//  There are NO corner nails inside the card — handles ARE the nails.
//
//  Hover: glass is ENHANCED (more shadow, slight opacity bump) — never goes flat.
//  Selected: thin zinc ring added.
export const BaseNode = forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, status = "initial", children, ...props }, ref) => {
    const statusRing: Record<string, string> = {
      loading: "ring-[1.5px] ring-inset ring-blue-300/40",
      success: "ring-[1.5px] ring-inset ring-emerald-300/40",
      error:   "ring-[1.5px] ring-inset ring-red-300/40",
      initial: "",
    };

    return (
      <div
        ref={ref}
        tabIndex={0}
        className={cn(
          // ── Shape ────────────────────────────────────────────────────
          "relative size-[56px] rounded-[18px] overflow-visible",
          // ── Exact sidebar ACRYLIC_ACTIVE liquid glass ─────────────
          "bg-white/20 dark:bg-zinc-800/20",
          "backdrop-blur-2xl",
          "border border-white/70 dark:border-zinc-600/50",
          "shadow-[0_6px_28px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.04)]",
          "dark:shadow-[0_6px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
          // ── Status ring ───────────────────────────────────────────
          statusRing[status] ?? "",
          // ── Hover: enhance, never flatten ─────────────────────────
          "transition-all duration-200 cursor-default",
          // Keep ALL shadow components on hover — add depth, never remove glass
          "hover:bg-white/28 dark:hover:bg-zinc-800/28",
          "hover:shadow-[0_10px_36px_rgba(0,0,0,0.10),0_4px_10px_rgba(0,0,0,0.06),inset_0_1.5px_1px_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(0,0,0,0.04)]",
          "hover:-translate-y-px",
          // ── Selected: thin zinc ring ──────────────────────────────
          "[.react-flow__node.selected_&]:ring-[1.5px]",
          "[.react-flow__node.selected_&]:ring-inset",
          "[.react-flow__node.selected_&]:ring-zinc-400/50",
          "[.react-flow__node.selected_&]:shadow-[0_12px_40px_rgba(0,0,0,0.11),inset_0_1.5px_1px_rgba(255,255,255,0.98)]",
          className,
        )}
        {...props}
      >
        {children}
        <StatusDot status={status} />
      </div>
    );
  },
);

BaseNode.displayName = "BaseNode";

// ─── Sub-components (kept for any existing usage) ─────────────────────────────

export function BaseNodeHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header {...props} className={cn("flex flex-col items-center justify-center gap-1 p-2", className)} />
  );
}

export function BaseNodeHeaderTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="base-node-title"
      className={cn("text-[9px] font-semibold text-zinc-500 text-center uppercase tracking-widest select-none", className)}
      {...props}
    />
  );
}

export function BaseNodeContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="base-node-content" className={cn("flex flex-col items-center gap-1 p-2", className)} {...props} />
  );
}

export function BaseNodeFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="base-node-footer"
      className={cn("flex flex-col items-center gap-1 border-t border-white/40 dark:border-zinc-700/40 px-2 pt-1.5 pb-2", className)}
      {...props}
    />
  );
}
