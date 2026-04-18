import { type ReactNode } from "react";

export type NodeStatus = "loading" | "success" | "error" | "initial";
export type NodeStatusVariant = "overlay" | "border";

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
};

// ─── NodeStatusIndicator ──────────────────────────────────────────────────────
// All visual status feedback now lives inside BaseNode itself (corner dot +
// subtle ring). This wrapper is intentionally a transparent pass-through so
// existing call sites that wrap with <NodeStatusIndicator> continue to work
// with zero changes — no extra DOM wrappers, no loud borders/spinners.
export const NodeStatusIndicator = ({
  children,
}: NodeStatusIndicatorProps) => <>{children}</>;

// Legacy named exports kept so imported symbols don't break
export const BorderLoadingIndicator  = ({ children }: { children: ReactNode; className?: string }) => <>{children}</>;
export const SpinnerLoadingIndicator = ({ children }: { children: ReactNode }) => <>{children}</>;
