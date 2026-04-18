import type { ComponentProps } from "react";
import { Handle, type HandleProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

// ─── BaseHandle — nail-head connector ────────────────────────────────────────
//
// The handle IS the nail. Same radial-gradient screw-head material as the
// sidebar ACRYLIC_ACTIVE Nail component (identical gradient + box-shadow).
// Threads "arrive" (target) and "originate" (source) at these nail heads,
// exactly as the user described: nails are the connection points.
//
// React Flow positions handles at the midpoint of each edge automatically.
// The nail-head visual sits at that point, completing the physical language:
// the glass node is "pinned to the canvas" by its two nails, and the threads
// are hung between those nails.
export function BaseHandle({
  className,
  children,
  ...props
}: ComponentProps<typeof Handle>) {
  return (
    <Handle
      {...props}
      className={cn(
        // Size — same 9px as sidebar nail (5px) * scale-up for easier targeting
        "!size-[9px] !rounded-full",
        // Remove React Flow default border/bg  so our inline style wins
        "!border-0 !bg-transparent",
        "!transition-all !duration-150",
        // Subtle grow on hover — invites connection without being distracting
        "hover:!size-[11px]",
        className,
      )}
      // Inline style: exact same nail-head radial gradient + box-shadow as sidebar Nail
      style={{
        background:
          "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.88) 0%, rgba(185,185,192,0.70) 42%, rgba(135,135,145,0.55) 100%)",
        boxShadow:
          "0 1.5px 4px rgba(0,0,0,0.22), inset 0 0.5px 1px rgba(255,255,255,0.85)",
      }}
    >
      {children}
    </Handle>
  );
}

export type BaseHandleProps = HandleProps;
