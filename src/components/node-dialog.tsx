"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

// ─── Design tokens ────────────────────────────────────────────────────────────
// These match the sidebar ACRYLIC_ACTIVE liquid-glass values exactly.
const GLASS_CARD =
  "bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm " +
  "border border-zinc-200/70 dark:border-zinc-700/40 " +
  "rounded-[12px]";

// ─── NodeDialog shell ─────────────────────────────────────────────────────────
interface NodeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Service icon — string path OR lucide component */
  icon?: string | React.ComponentType<{ className?: string }>;
  title: string;
  /** Short subtitle describing what the node does */
  subtitle?: string;
  /** "Trigger" | "Action" | "AI" | "Logic" */
  badge?: string;
  badgeColor?: string;
  /** If true → max-w-2xl two-column layout */
  wide?: boolean;
  /** Attach to a <form> element's id for submit */
  formId?: string;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
  children: ReactNode;
}

const BADGE_COLORS: Record<string, string> = {
  Trigger: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Action:  "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
  AI:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Logic:   "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
};

export function NodeDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  subtitle,
  badge,
  wide = false,
  formId,
  onSave,
  saveLabel = "Save",
  saving = false,
  children,
}: NodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden",
          "border border-white/70 dark:border-zinc-700/50",
          "rounded-[20px]",
          "shadow-[0_24px_64px_rgba(0,0,0,0.14),0_8px_24px_rgba(0,0,0,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.90)]",
          "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl",
          wide ? "max-w-2xl" : "max-w-lg",
          "[&>button]:hidden", // hide default shadcn close button — we render our own
        )}
      >
        {/* Screen-reader title — Radix requires DialogTitle inside DialogContent.
            The visual title is rendered below as an h2 in the glass header. */}
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-zinc-100/80 dark:border-zinc-800/60">
          {/* Icon */}
          {Icon && (
            <div className={cn(
              "shrink-0 size-9 rounded-[10px] flex items-center justify-center",
              GLASS_CARD,
            )}>
              {typeof Icon === "string"
                ? <Image src={Icon} alt={title} width={20} height={20} className="object-contain" />
                : <Icon className="size-4 text-zinc-500" />}
            </div>
          )}

          {/* Title + badge */}
          <div className="flex-1 min-w-0 mt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
                {title}
              </h2>
              {badge && (
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  BADGE_COLORS[badge] ?? "bg-zinc-100 text-zinc-600",
                )}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">
                {subtitle}
              </p>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => onOpenChange(false)}
            className="shrink-0 size-6 flex items-center justify-center rounded-[7px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-all duration-150 mt-0.5"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4 overflow-y-auto max-h-[65vh] space-y-4">
          {children}
        </div>

        {/* ── Footer (only when there's a save action) ── */}
        {(onSave || formId) && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-100/80 dark:border-zinc-800/60">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "h-8 px-3.5 rounded-[10px] text-[11px] font-semibold",
                "text-zinc-500 dark:text-zinc-400",
                "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60",
                "transition-all duration-150",
              )}
            >
              Cancel
            </button>
            <button
              type={formId ? "submit" : "button"}
              form={formId}
              onClick={formId ? undefined : onSave}
              disabled={saving}
              className={cn(
                "h-8 px-4 rounded-[10px] text-[11px] font-semibold",
                "bg-zinc-800/90 dark:bg-zinc-100/90",
                "text-white dark:text-zinc-900",
                "border border-zinc-700/50 dark:border-zinc-300/40",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.15)]",
                "hover:bg-zinc-700 dark:hover:bg-zinc-200",
                "transition-all duration-150 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {saving ? "Saving…" : saveLabel}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── DialogSection ────────────────────────────────────────────────────────────
export function DialogSection({
  title,
  icon: Icon,
  hint,
  children,
  className,
}: {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="size-3 text-zinc-400" />}
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {title}
          </p>
          {hint && (
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600 normal-case font-normal tracking-normal">
              — {hint}
            </span>
          )}
        </div>
      )}
      <div className={cn(GLASS_CARD, "p-3 space-y-3")}>
        {children}
      </div>
    </div>
  );
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────
export function FieldRow({
  label,
  hint,
  required,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline gap-1">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        {required && <span className="text-[10px] text-red-400">*</span>}
        {hint && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1 font-normal">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[10px] text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── GlassInput / GlassTextarea / GlassSelect styles (class strings) ─────────
export const INPUT_CLS =
  "w-full px-3 py-2 rounded-[9px] text-sm " +
  "bg-white/60 dark:bg-zinc-900/60 " +
  "border border-zinc-200/80 dark:border-zinc-700/50 " +
  "text-zinc-800 dark:text-zinc-200 " +
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-600 " +
  "focus:outline-none focus:ring-1 focus:ring-zinc-400/50 dark:focus:ring-zinc-500/50 " +
  "transition-all duration-150";

export const MONO_INPUT_CLS = INPUT_CLS + " font-mono text-[12px]";

// ─── VarChip ──────────────────────────────────────────────────────────────────
// Click to copy the template variable expression to clipboard.
export function VarChip({
  variable,
  label,
  description,
}: {
  variable: string;
  label: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`{{${variable}}}`);
      setCopied(true);
      toast.success(`Copied {{${variable}}}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "group flex items-center justify-between w-full px-2.5 py-2 rounded-[8px]",
        "bg-white/40 dark:bg-zinc-800/40",
        "border border-zinc-200/60 dark:border-zinc-700/40",
        "hover:bg-white/70 dark:hover:bg-zinc-700/50",
        "hover:border-zinc-300/70 dark:hover:border-zinc-600/50",
        "transition-all duration-150 text-left",
      )}
    >
      <div className="min-w-0">
        <code className="block text-[11px] font-mono text-zinc-700 dark:text-zinc-300 truncate">
          {`{{${variable}}}`}
        </code>
        {label && (
          <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {label}
            {description ? ` — ${description}` : ""}
          </span>
        )}
      </div>
      <span className="shrink-0 ml-2 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
        {copied
          ? <CheckIcon className="size-3 text-emerald-500" />
          : <CopyIcon className="size-3" />}
      </span>
    </button>
  );
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────
export function CodeBlock({
  code,
  label,
  copyLabel,
}: {
  code: string;
  label?: string;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`${copyLabel ?? "Code"} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {label}
        </p>
      )}
      <div className={cn(
        "relative rounded-[9px] overflow-hidden",
        "bg-zinc-900/90 dark:bg-zinc-950/90",
        "border border-zinc-700/50",
      )}>
        <pre className="px-3.5 py-3 text-[11px] font-mono text-zinc-200 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
          {code}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "absolute top-2 right-2",
            "size-6 flex items-center justify-center rounded-[6px]",
            "bg-zinc-700/60 hover:bg-zinc-600/80 text-zinc-300 hover:text-white",
            "transition-all duration-150",
          )}
        >
          {copied
            ? <CheckIcon className="size-3 text-emerald-400" />
            : <CopyIcon className="size-3" />}
        </button>
      </div>
    </div>
  );
}

// ─── SetupStep ────────────────────────────────────────────────────────────────
export function SetupStep({
  n,
  children,
}: {
  n: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={cn(
        "shrink-0 size-5 rounded-full flex items-center justify-center mt-0.5",
        "bg-zinc-800/10 dark:bg-zinc-100/10",
        "text-[10px] font-bold text-zinc-500 dark:text-zinc-400",
      )}>
        {n}
      </span>
      <p className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-snug">
        {children}
      </p>
    </div>
  );
}

// ─── InfoBanner ───────────────────────────────────────────────────────────────
export function InfoBanner({
  variant = "info",
  children,
}: {
  variant?: "info" | "warning" | "tip";
  children: ReactNode;
}) {
  const cls = {
    info:    "bg-blue-50/80   dark:bg-blue-900/20  border-blue-200/60  dark:border-blue-700/40  text-blue-700  dark:text-blue-300",
    warning: "bg-amber-50/80  dark:bg-amber-900/20  border-amber-200/60 dark:border-amber-700/40 text-amber-700 dark:text-amber-300",
    tip:     "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300",
  }[variant];

  return (
    <div className={cn("px-3 py-2.5 rounded-[9px] border text-[11px] leading-snug", cls)}>
      {children}
    </div>
  );
}
