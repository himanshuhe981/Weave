"use client";

import { type ReactNode } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlaceholderNodeProps = Partial<NodeProps> & {
  children?: ReactNode;
  onClick?: () => void;
};

// ─── Placeholder / Add-node card ─────────────────────────────────────────────
// Same 72px squircle as BaseNode but dramatically more transparent (bg-white/8)
// with a 2px dashed border — reads clearly as an empty "insert here" slot.
// On hover it gains a subtle glass surface to invite interaction.
export function PlaceholderNode({ onClick }: PlaceholderNodeProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        // Same dimensions as BaseNode
        "relative w-[72px] h-[72px] rounded-[20px]",
        // Very transparent — you see the canvas through it
        "bg-white/8 dark:bg-zinc-900/10 backdrop-blur-md",
        // Dashed border — clearly "empty"
        "border-2 border-dashed border-zinc-300/60 dark:border-zinc-600/50",
        "shadow-none",
        // Hover — materialises into glass
        "hover:bg-white/20 hover:border-zinc-400/70",
        "hover:shadow-[0_4px_18px_rgba(0,0,0,0.07),inset_0_1px_1px_rgba(255,255,255,0.90)]",
        "transition-all duration-200 cursor-pointer active:scale-95",
      )}
    >
      {/* Centred plus icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <PlusIcon className="size-5 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
      </div>

      {/* Hidden handles required by React Flow */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
        isConnectable={false}
      />
    </div>
  );
}
