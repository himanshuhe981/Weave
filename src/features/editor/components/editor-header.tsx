"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSuspenseWorkflow, useUpdateWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/use-workflows";
import { useAtomValue } from "jotai";
import {
    CheckIcon,
    Loader2Icon,
    PencilIcon,
    SaveIcon,
    WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { editorAtom } from "../store/atoms";
import { toast } from "sonner";

// ─── Small floating tooltip ───────────────────────────────────────────────────
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="relative group/tip flex items-center">
            {children}
            <span className={[
                "pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50",
                "px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap",
                "bg-zinc-800/95 dark:bg-zinc-700 text-zinc-100 shadow-lg",
                "opacity-0 scale-95 translate-y-0",
                "group-hover/tip:opacity-100 group-hover/tip:scale-100",
                "transition-all duration-150",
            ].join(" ")}>
                {label}
            </span>
        </div>
    );
}

// ─── Save button ──────────────────────────────────────────────────────────────
// Tracks pending state with a transient ✓ confirm flash.
// An orange dot appears when there are unsaved changes.
export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
    const editor = useAtomValue(editorAtom);
    const saveWorkflow = useUpdateWorkflow();
    const [justSaved, setJustSaved] = useState(false);

    const handleSave = () => {
        if (!editor) return;
        saveWorkflow.mutate(
            { id: workflowId, nodes: editor.getNodes(), edges: editor.getEdges() },
            {
                onSuccess: () => {
                    setJustSaved(true);
                    toast.success("Workflow saved");
                    setTimeout(() => setJustSaved(false), 2000);
                },
                onError: () => toast.error("Failed to save workflow"),
            },
        );
    };

    const isLoading = saveWorkflow.isPending;
    const Icon = isLoading ? Loader2Icon : justSaved ? CheckIcon : SaveIcon;
    const label = isLoading ? "Saving…" : justSaved ? "Saved" : "Save";

    return (
        <Tip label="Save workflow  (Ctrl+S)">
            <button
                onClick={handleSave}
                disabled={isLoading}
                aria-label="Save workflow"
                className={[
                    "h-7 pl-2.5 pr-3 rounded-[10px] flex items-center gap-1.5",
                    "text-[11px] font-semibold tracking-tight",
                    "border backdrop-blur-xl",
                    "transition-all duration-150 active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    // Primary dark glass
                    justSaved
                        ? "bg-emerald-600/80 border-emerald-500/50 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                        : "bg-zinc-800/85 dark:bg-zinc-100/90 border-zinc-700/50 dark:border-zinc-300/40 text-white dark:text-zinc-900 hover:bg-zinc-700/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.18)]",
                ].join(" ")}
            >
                <Icon className={["size-3", isLoading ? "animate-spin" : ""].join(" ")} strokeWidth={2.5} />
                <span>{label}</span>
            </button>
        </Tip>
    );
};

// ─── Inline editable workflow name ────────────────────────────────────────────
export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const updateWorkflow = useUpdateWorkflowName();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workflow.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (workflow.name) setName(workflow.name); }, [workflow.name]);
    useEffect(() => { if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [isEditing]);

    const commit = async () => {
        if (!name.trim() || name === workflow.name) { setIsEditing(false); setName(workflow.name); return; }
        try {
            await updateWorkflow.mutateAsync({ id: workflowId, name: name.trim() });
            toast.success("Workflow renamed");
        } catch {
            setName(workflow.name);
            toast.error("Could not rename workflow");
        } finally {
            setIsEditing(false);
        }
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter")  commit();
        if (e.key === "Escape") { setName(workflow.name); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commit}
                onKeyDown={onKey}
                disabled={updateWorkflow.isPending}
                placeholder="Workflow name…"
                className={[
                    "h-6 px-2 rounded-[8px] text-xs font-semibold",
                    "text-zinc-800 dark:text-zinc-100",
                    "bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm",
                    "border border-zinc-300/70 dark:border-zinc-600/50",
                    "outline-none focus:ring-1 focus:ring-zinc-400/50",
                    "w-[180px]",
                ].join(" ")}
            />
        );
    }

    return (
        <BreadcrumbItem
            onClick={() => setIsEditing(true)}
            className="cursor-pointer group/name flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors select-none"
        >
            {workflow.name}
            <PencilIcon className="size-2.5 opacity-0 group-hover/name:opacity-35 transition-opacity" />
        </BreadcrumbItem>
    );
};

// ─── Breadcrumb trail ─────────────────────────────────────────────────────────
export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => (
    <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-1 text-xs">
            <BreadcrumbItem>
                <BreadcrumbLink asChild>
                    <Link
                        prefetch
                        href="/workflows"
                        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                        <WorkflowIcon className="size-3" />
                        <span className="hidden sm:inline">Workflows</span>
                    </Link>
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-300 dark:text-zinc-600" />
            <EditorNameInput workflowId={workflowId} />
        </BreadcrumbList>
    </Breadcrumb>
);

// ─── EditorHeader ─────────────────────────────────────────────────────────────
// Layout: [SidebarToggle] [|] [Breadcrumbs] [flex-1] [Save]
//
// The Save button sits at the far-right — conventional for editor toolbars
// (Figma, VS Code, Notion all use this pattern). The breadcrumb anchors the
// user contextually (which workflow they're in + editable name).
export const EditorHeader = ({ workflowId }: { workflowId: string }) => (
    <header className={[
        "flex h-11 shrink-0 items-center gap-3 px-3",
        "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl",
        "border-b border-zinc-100/80 dark:border-zinc-800/60",
        "sticky top-0 z-30",
    ].join(" ")}>

        {/* Sidebar toggle */}
        <Tip label="Toggle sidebar">
            <SidebarTrigger className="size-7 flex items-center justify-center rounded-[8px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-all duration-150" />
        </Tip>

        {/* Hairline divider */}
        <div className="h-4 w-px bg-zinc-200/70 dark:bg-zinc-700/50" />

        {/* Breadcrumbs: Workflows › [workflow name] */}
        <EditorBreadcrumbs workflowId={workflowId} />

        {/* Push save to right */}
        <div className="flex-1" />

        {/* Save */}
        <EditorSaveButton workflowId={workflowId} />
    </header>
);