"use client";

import { useState, useCallback, useMemo } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Background,
    BackgroundVariant,
    MiniMap,
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    useReactFlow,
    Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@prisma/client";
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import { DemoSetupPanel } from "./demo-setup-panel";
import { AnimatePresence, motion } from "motion/react";
import {
    BookOpen,
    ZoomInIcon,
    ZoomOutIcon,
    MaximizeIcon,
    InfoIcon,
} from "lucide-react";
import { FlowThreadEdge } from "./flow-thread-edge";

// ─── Edge types ──────────────────────────────────────────────────────────────
const edgeTypes = { flowThread: FlowThreadEdge } as const;

// ─── Loading / Error states ──────────────────────────────────────────────────
export const EditorLoading = () => <LoadingView message="Loading editor..." />;
export const EditorError   = () => <ErrorView  message="Error Loading Editor" />;

// ─── Tooltip helper (canvas-safe, no portal needed) ──────────────────────────
function CanvasTip({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="relative group/t flex items-center">
            {children}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap
                bg-zinc-800/95 dark:bg-zinc-700 text-zinc-100
                opacity-0 scale-95 group-hover/t:opacity-100 group-hover/t:scale-100
                transition-all duration-150 shadow-lg">
                {label}
            </span>
        </div>
    );
}

// ─── Glass control button (same material as nodes) ───────────────────────────
function GlassControlBtn({
    onClick,
    icon: Icon,
    label,
}: {
    onClick: () => void;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
}) {
    return (
        <CanvasTip label={label}>
            <button
                onClick={onClick}
                className={[
                    "size-8 flex items-center justify-center rounded-[10px]",
                    "bg-white/20 dark:bg-zinc-800/20 backdrop-blur-2xl",
                    "border border-white/70 dark:border-zinc-600/50",
                    "shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.92)]",
                    "text-zinc-500 dark:text-zinc-400",
                    "hover:bg-white/35 hover:text-zinc-800 dark:hover:text-zinc-200",
                    "hover:shadow-[0_6px_20px_rgba(0,0,0,0.10),inset_0_1.5px_1px_rgba(255,255,255,0.95)]",
                    "transition-all duration-150 active:scale-90",
                ].join(" ")}
            >
                <Icon className="size-3.5" strokeWidth={1.75} />
            </button>
        </CanvasTip>
    );
}

// ─── Custom zoom / fit controls replacing the default React Flow Controls ────
function ZoomControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    return (
        <div className="flex flex-col gap-1.5">
            <GlassControlBtn onClick={() => zoomIn()}          icon={ZoomInIcon}   label="Zoom in  (Ctrl +)"      />
            <GlassControlBtn onClick={() => zoomOut()}         icon={ZoomOutIcon}  label="Zoom out  (Ctrl -)"     />
            <GlassControlBtn onClick={() => fitView({ padding: 0.15 })} icon={MaximizeIcon} label="Fit view  (Ctrl Shift F)" />
        </div>
    );
}

// ─── Keyboard shortcut hint panel ─────────────────────────────────────────────
function ShortcutHint() {
    const [open, setOpen] = useState(false);
    const shortcuts = [
        { key: "Backspace / Del",  action: "Delete selected node" },
        { key: "Scroll",           action: "Pan canvas"           },
        { key: "Pinch / Ctrl+Scroll", action: "Zoom"             },
        { key: "Click drag (bg)",  action: "Pan"                  },
        { key: "Ctrl + Shift + F", action: "Fit view"             },
        { key: "Double-click node","action": "Open node settings" },
    ];

    return (
        <div className="relative">
            <CanvasTip label="Keyboard shortcuts">
                <button
                    onClick={() => setOpen((v) => !v)}
                    className={[
                        "size-8 flex items-center justify-center rounded-[10px]",
                        "bg-white/20 dark:bg-zinc-800/20 backdrop-blur-2xl",
                        "border border-white/70 dark:border-zinc-600/50",
                        "shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.92)]",
                        "text-zinc-500 dark:text-zinc-400",
                        "hover:bg-white/35 hover:text-zinc-800 dark:hover:text-zinc-200",
                        "transition-all duration-150 active:scale-90",
                        open ? "bg-white/40 dark:bg-zinc-700/40 text-zinc-800 dark:text-zinc-200" : "",
                    ].join(" ")}
                >
                    <InfoIcon className="size-3.5" strokeWidth={1.75} />
                </button>
            </CanvasTip>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                        animate={{ opacity: 1, scale: 1,    y: 0 }}
                        exit={{   opacity: 0, scale: 0.95, y: 6 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={[
                            "absolute bottom-full left-0 mb-2 w-[220px] z-50",
                            "rounded-[14px] p-3",
                            "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl",
                            "border border-white/70 dark:border-zinc-700/50",
                            "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1.5px_1px_rgba(255,255,255,0.92)]",
                        ].join(" ")}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                            Shortcuts
                        </p>
                        <ul className="flex flex-col gap-1.5">
                            {shortcuts.map(({ key, action }) => (
                                <li key={key} className="flex items-start justify-between gap-2">
                                    <span className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100/80 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded-md leading-snug shrink-0">
                                        {key}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 text-right leading-snug">
                                        {action}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Editor ──────────────────────────────────────────────────────────────────
export const Editor = ({
    workflowId,
    demoType,
}: {
    workflowId: string;
    demoType?: "summarizer" | "triage";
}) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const setEditor = useSetAtom(editorAtom);

    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(workflow.edges);
    const [showDemoPanel, setShowDemoPanel] = useState(!!demoType);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) =>
            setNodes((ns) => applyNodeChanges(changes, ns)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) =>
            setEdges((es) => applyEdgeChanges(changes, es)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((es) => addEdge({ ...params, type: "flowThread" }, es)),
        [],
    );

    const hasManualTrigger = useMemo(
        () => nodes.some((n) => n.type === NodeType.MANUAL_TRIGGER),
        [nodes],
    );

    return (
        <div className="size-full relative overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeComponents}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{ type: "flowThread" }}
                onInit={setEditor}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                snapGrid={[10, 10]}
                snapToGrid
                panOnScroll
                panOnDrag
                deleteKeyCode={["Backspace", "Delete"]}
                proOptions={{ hideAttribution: true }}
                // Subtle dot grid matching the nameplate / dashboard canvas feel
                style={{ background: "transparent" }}
            >
                {/*
                  Fine dot-grid background — muted zinc dots on white/near-white.
                  Consistent with the dot-grid pattern used throughout the dashboard.
                */}
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="rgba(161,161,170,0.30)"
                    className="dark:!bg-zinc-950"
                />

                {/* ── Glass minimap — bottom-right ──────────────────── */}
                <MiniMap
                    pannable
                    zoomable
                    nodeColor="rgba(113,113,122,0.50)"
                    maskColor="rgba(249,249,250,0.55)"
                    style={{
                        /* Glass panel — same liquid-glass material as node cards         */
                        /* overflow:hidden is CRITICAL — clips boxShadow to borderRadius */
                        background: "rgba(255,255,255,0.82)",
                        backdropFilter: "blur(20px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                        border: "1px solid rgba(255,255,255,0.72)",
                        borderRadius: 14,
                        overflow: "hidden",
                        boxShadow:
                            "0 8px 24px rgba(0,0,0,0.09)," +
                            "0 2px 6px rgba(0,0,0,0.05)," +
                            "inset 0 1.5px 1px rgba(255,255,255,0.95)," +
                            "inset 0 -1px 0 rgba(0,0,0,0.04)",
                        width: 156,
                        height: 96,
                    }}
                />

                {/* ── Top-right: Add node ─────────────────────────────── */}
                <Panel position="top-right" className="m-3">
                    <AddNodeButton />
                </Panel>

                {/* ── Bottom-left: Zoom controls + shortcut hint ─────── */}
                <Panel position="bottom-left" className="m-3">
                    <div className="flex flex-col gap-1.5">
                        <ZoomControls />
                        <div className="h-px bg-white/30 dark:bg-zinc-700/40 mx-1" />
                        <ShortcutHint />
                    </div>
                </Panel>

                {/* ── Bottom-center: Run workflow button ─────────────── */}
                {hasManualTrigger && (
                    <Panel position="bottom-center" className="mb-4">
                        <ExecuteWorkflowButton workflowId={workflowId} />
                    </Panel>
                )}
            </ReactFlow>

            {/* Demo setup panel */}
            <AnimatePresence>
                {demoType && showDemoPanel && (
                    <DemoSetupPanel
                        workflowId={workflowId}
                        demoType={demoType}
                        onClose={() => setShowDemoPanel(false)}
                    />
                )}
            </AnimatePresence>

            {/* Re-open setup guide */}
            <AnimatePresence>
                {demoType && !showDemoPanel && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{    opacity: 0, scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        onClick={() => setShowDemoPanel(true)}
                        className={[
                            "absolute top-3 right-3 z-50",
                            "flex items-center gap-2 px-3 py-2 rounded-[12px]",
                            "bg-white/20 dark:bg-zinc-800/20 backdrop-blur-2xl",
                            "border border-white/70 dark:border-zinc-600/50",
                            "shadow-[0_6px_20px_rgba(0,0,0,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.92)]",
                            "text-[11px] font-semibold text-zinc-600 dark:text-zinc-400",
                            "hover:bg-white/35 hover:text-zinc-800 dark:hover:text-zinc-200",
                            "transition-all duration-150",
                        ].join(" ")}
                    >
                        <BookOpen className="size-3.5" strokeWidth={1.75} />
                        Setup Guide
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};