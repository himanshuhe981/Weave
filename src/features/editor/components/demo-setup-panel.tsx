"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    X, ChevronRight, ChevronLeft, CheckCircle2, Loader2,
    Key, Link2, ExternalLink, Check, ClipboardCopy,
    Bot, GitBranch, Webhook, Sparkles, Save,
    ShieldCheck,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";

// ─── Types ────────────────────────────────────────────────────────────────────

type DemoType = "summarizer" | "triage";

interface Props {
    workflowId: string;
    demoType: DemoType;
    onClose: () => void;
}

// ─── Design tokens — strictly from app-sidebar's ACRYLIC vocabulary ───────────

/** The outer panel: same material as ACRYLIC_WIDGET */
const PANEL_CLS = [
    "bg-white/55 dark:bg-zinc-900/62",
    "backdrop-blur-[48px] saturate-150",
    "border-l border-white/80 dark:border-zinc-600/40",
    "shadow-[-24px_0_64px_rgba(0,0,0,0.10),-8px_0_20px_rgba(0,0,0,0.06),inset_0_1.5px_1px_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(0,0,0,0.04)]",
    "dark:shadow-[-24px_0_64px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.06)]",
].join(" ");

const CARD_CLS = [
    "bg-white/45 dark:bg-zinc-800/35",
    "border border-white/70 dark:border-zinc-700/40",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.80)]",
    "rounded-[10px]",
].join(" ");

/** Sunken text input */
const INPUT_CLS = [
    "w-full h-9 px-3 rounded-[9px] font-mono text-[12px]",
    "bg-white/55 dark:bg-zinc-800/40",
    "border border-white/70 dark:border-zinc-700/40",
    "shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]",
    "text-zinc-800 dark:text-zinc-200",
    "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    "focus:outline-none focus:border-zinc-400/60 dark:focus:border-zinc-500/60",
    "focus:bg-white/80 dark:focus:bg-zinc-800/70",
    "transition-all duration-150",
].join(" ");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
            catch { toast.error("Copy failed"); }
        }}
            className={cn("flex items-center gap-1.5 text-[11px] transition-colors", copied ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300")}
        >
            {copied ? <Check className="size-3" /> : <ClipboardCopy className="size-3" />}
            {label && <span>{copied ? "Copied" : label}</span>}
        </button>
    );
};

/** Monochrome neutral note */
const Note = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(CARD_CLS, "px-3.5 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-1.5")}>
        {children}
    </div>
);

/** Tinted callout — low-saturation colour hints for readability */
const Callout = ({ variant = "info", children }: { variant?: "info" | "success" | "warning"; children: React.ReactNode }) => {
    const cls = {
        info:    "bg-sky-500/[0.07]   dark:bg-sky-400/[0.08]   border-sky-400/25   dark:border-sky-400/20   text-sky-800   dark:text-sky-300",
        success: "bg-emerald-500/[0.07] dark:bg-emerald-400/[0.08] border-emerald-400/25 dark:border-emerald-400/20 text-emerald-800 dark:text-emerald-300",
        warning: "bg-amber-500/[0.07]  dark:bg-amber-400/[0.08]  border-amber-400/25  dark:border-amber-400/20  text-amber-800  dark:text-amber-300",
    }[variant];
    return (
        <div className={cn("px-3.5 py-3 rounded-[10px] border text-[11px] leading-relaxed space-y-1.5", cls)}>
            {children}
        </div>
    );
};

const NODE_BADGE_COLOR: Record<string, string> = {
    "Webhook":         "bg-violet-500/[0.10] text-violet-700 dark:text-violet-400",
    "Gemini AI":       "bg-emerald-500/[0.10] text-emerald-700 dark:text-emerald-400",
    "Discord":         "bg-indigo-500/[0.10] text-indigo-700 dark:text-indigo-400",
    "Manual Trigger":  "bg-zinc-500/[0.08] text-zinc-600 dark:text-zinc-400",
    "Condition":       "bg-orange-500/[0.10] text-orange-700 dark:text-orange-400",
    "Slack (YES)":     "bg-sky-500/[0.10] text-sky-700 dark:text-sky-400",
    "Discord (NO)":    "bg-indigo-500/[0.10] text-indigo-700 dark:text-indigo-400",
};

const NodeBadge = ({ label, desc }: { label: string; desc: string }) => {
    const colorCls = NODE_BADGE_COLOR[label] ?? "bg-zinc-500/[0.08] text-zinc-600 dark:text-zinc-400";
    return (
        <div className={cn(CARD_CLS, "flex gap-3 px-3 py-2.5 items-start")}>
            <span className={cn(
                "shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-[5px] leading-none mt-px whitespace-nowrap",
                colorCls,
            )}>
                {label}
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{desc}</p>
        </div>
    );
};

/** Credential input field */
const CredField = ({ id, label, icon: Icon, placeholder, secret = false, value, onChange, saved = false }: {
    id: string; label: string; icon: React.ElementType; placeholder: string;
    secret?: boolean; value: string; onChange: (v: string) => void; saved?: boolean;
}) => (
    <div className="space-y-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            <Icon className="size-3 text-zinc-400" />
            {label}
            {saved && (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                    <ShieldCheck className="size-2.5" /> saved
                </span>
            )}
        </label>
        <input
            id={id}
            type={secret ? "password" : "text"}
            placeholder={saved ? "Leave blank to keep existing" : placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            autoComplete="off"
            className={cn(INPUT_CLS, saved && !value && "border-zinc-300/40 dark:border-zinc-600/40")}
        />
        {saved && !value && (
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Check className="size-2.5" /> Already configured
            </p>
        )}
    </div>
);

// ─── Webhook URL block ────────────────────────────────────────────────────────

const WebhookUrlBlock = ({ workflowId }: { workflowId: string }) => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${base}/api/webhooks/${workflowId}`;
    const curl = `curl -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"text": "Paste any content you want summarized."}'`;

    return (
        <div className="space-y-3">
            <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Webhook URL</p>
                <div className={cn(CARD_CLS, "flex items-center gap-2 px-3 py-2")}>
                    <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 break-all flex-1 leading-snug">{url}</span>
                    <CopyButton text={url} />
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Example cURL</p>
                    <CopyButton text={curl} label="Copy" />
                </div>
                <pre className={cn(CARD_CLS, "text-[10.5px] font-mono leading-relaxed px-3.5 py-3 overflow-x-auto whitespace-pre-wrap break-all text-zinc-500 dark:text-zinc-400")}>
{curl}
                </pre>
            </div>
            <Note>
                Send a JSON body with a <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">text</code> field — it becomes{" "}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">{"{{webhook.body.text}}"}</code> inside Gemini.
            </Note>
        </div>
    );
};

// ─── Summarizer flow ──────────────────────────────────────────────────────────

const SummarizerFlow = ({ workflowId, onClose }: { workflowId: string; onClose: () => void }) => {
    const trpc = useTRPC();
    const editor = useAtomValue(editorAtom);
    const [step, setStep] = useState(0);
    const [geminiKey, setGeminiKey] = useState("");
    const [discordWebhook, setDiscordWebhook] = useState("");
    const [done, setDone] = useState(false);

    const { data: workflowData } = useQuery(trpc.workflows.getOne.queryOptions({ id: workflowId }));
    const geminiNode  = workflowData?.nodes.find(n => n.type === "GEMINI");
    const discordNode = workflowData?.nodes.find(n => n.type === "DISCORD");
    const geminiSaved  = !!(geminiNode?.data as Record<string, unknown>)?.credentialId;
    const discordSaved = !!((discordNode?.data as Record<string, unknown>)?.webhookUrl || (discordNode?.data as Record<string, unknown>)?.credentialId);

    useEffect(() => {
        if (discordNode?.data) { const d = discordNode.data as Record<string, unknown>; if (d.webhookUrl && !d.credentialId && !discordWebhook) setDiscordWebhook(d.webhookUrl as string); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowData]);

    const attach = useMutation(trpc.workflows.attachDemoCredentials.mutationOptions({
        onSuccess: (result) => {
            setDone(true);
            toast.success("Credentials saved");
            if (result.nodes && editor) {
                editor.setNodes(prev => prev.map(n => {
                    const u = result.nodes.find((x: { id: string; data: unknown }) => x.id === n.id);
                    return u ? { ...n, data: u.data as Record<string, unknown> } : n;
                }));
            }
        },
        onError: e => toast.error(e.message),
    }));

    const steps = [
        {
            label: "Overview", icon: Webhook,
            content: (
                <div className="space-y-3">
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Three pre-wired nodes are already on your canvas:
                    </p>
                    <div className="space-y-1.5">
                        <NodeBadge label="Webhook"   desc="Accepts any HTTP POST — the JSON body becomes workflow input" />
                        <NodeBadge label="Gemini AI" desc={"Summarizes content into bullet points using {{webhook.body.text}}"} />
                        <NodeBadge label="Discord"   desc={"Posts the summary to your channel via {{myGemini.text}}"} />
                    </div>
                    <Callout variant="info">We&apos;ll ask for a Gemini API key and a Discord webhook URL. You can skip either and configure nodes directly on the canvas.</Callout>
                </div>
            ),
        },
        {
            label: "Gemini API Key", icon: Key,
            content: (
                <div className="space-y-4">
                    <Callout variant="info">
                        <p className="font-semibold">Get your API key</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline underline-offset-2 inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="size-2.5" /></a></li>
                            <li>Click <strong className="text-zinc-600 dark:text-zinc-400">Create API Key</strong></li>
                            <li>Paste it below</li>
                        </ol>
                    </Callout>
                    <CredField id="s-gemini" label="Gemini API Key" icon={Key} placeholder="AIzaSy…" secret value={geminiKey} onChange={setGeminiKey} saved={geminiSaved} />
                    <p className="text-[10px] text-zinc-400">
                        Defaults to <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">gemini-2.5-flash-lite</code>. Click the node to change model.
                    </p>
                </div>
            ),
        },
        {
            label: "Discord Webhook", icon: Link2,
            content: (
                <div className="space-y-4">
                    <Callout variant="info">
                        <p className="font-semibold">Create a Discord webhook</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Open Discord → go to a channel</li>
                            <li>Channel settings → <strong className="text-zinc-600 dark:text-zinc-400">Integrations → Webhooks</strong></li>
                            <li>New Webhook → copy the URL</li>
                        </ol>
                    </Callout>
                    <CredField id="s-discord" label="Discord Webhook URL" icon={Link2} placeholder="https://discord.com/api/webhooks/…" value={discordWebhook} onChange={setDiscordWebhook} saved={discordSaved} />
                </div>
            ),
        },
        {
            label: "Test", icon: CheckCircle2,
            content: (
                <div className="space-y-4">
                    {(done || (geminiSaved && discordSaved)) ? (
                        <Callout variant="success"><p className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> Ready — send a POST to trigger it</p></Callout>
                    ) : (
                        <Callout variant="warning"><p className="font-semibold">Missing credentials</p><p>Go back and fill in the required fields, then click Save.</p></Callout>
                    )}
                    <WebhookUrlBlock workflowId={workflowId} />
                    <Note>
                        <p className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"><Save className="size-3" /> Canvas save is separate</p>
                        <p>This panel saves credentials only. Use the <strong className="text-zinc-600 dark:text-zinc-400">Save</strong> button in the toolbar to persist node positions.</p>
                    </Note>
                </div>
            ),
        },
    ];

    return (
        <StepShell
            steps={steps}
            step={step}
            setStep={setStep}
            onSave={() => attach.mutate({ workflowId, credentials: { geminiKey: geminiKey || undefined, discordWebhook: discordWebhook || undefined } })}
            onClose={onClose}
            isSaving={attach.isPending}
            done={done}
        />
    );
};

// ─── Triage flow ──────────────────────────────────────────────────────────────

const TriageFlow = ({ workflowId, onClose }: { workflowId: string; onClose: () => void }) => {
    const trpc = useTRPC();
    const editor = useAtomValue(editorAtom);
    const [step, setStep] = useState(0);
    const [geminiKey, setGeminiKey] = useState("");
    const [slackWebhook, setSlackWebhook] = useState("");
    const [discordWebhook, setDiscordWebhook] = useState("");
    const [done, setDone] = useState(false);

    const { data: workflowData } = useQuery(trpc.workflows.getOne.queryOptions({ id: workflowId }));
    const geminiNode   = workflowData?.nodes.find(n => n.type === "GEMINI");
    const slackNode    = workflowData?.nodes.find(n => n.type === "SLACK");
    const discordNode  = workflowData?.nodes.find(n => n.type === "DISCORD");
    const geminiSaved  = !!(geminiNode?.data as Record<string, unknown>)?.credentialId;
    const slackSaved   = !!((slackNode?.data as Record<string, unknown>)?.webhookUrl || (slackNode?.data as Record<string, unknown>)?.credentialId);
    const discordSaved = !!((discordNode?.data as Record<string, unknown>)?.webhookUrl || (discordNode?.data as Record<string, unknown>)?.credentialId);

    useEffect(() => {
        if (slackNode?.data) { const d = slackNode.data as Record<string, unknown>; if (d.webhookUrl && !d.credentialId && !slackWebhook) setSlackWebhook(d.webhookUrl as string); }
        if (discordNode?.data) { const d = discordNode.data as Record<string, unknown>; if (d.webhookUrl && !d.credentialId && !discordWebhook) setDiscordWebhook(d.webhookUrl as string); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowData]);

    const attach = useMutation(trpc.workflows.attachDemoCredentials.mutationOptions({
        onSuccess: (result) => {
            setDone(true);
            toast.success("Credentials saved");
            if (result.nodes && editor) {
                editor.setNodes(prev => prev.map(n => {
                    const u = result.nodes.find((x: { id: string; data: unknown }) => x.id === n.id);
                    return u ? { ...n, data: u.data as Record<string, unknown> } : n;
                }));
            }
        },
        onError: e => toast.error(e.message),
    }));

    const steps = [
        {
            label: "Overview", icon: GitBranch,
            content: (
                <div className="space-y-3">
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Five pre-wired nodes — Gemini classifies each ticket, the Condition branches it:
                    </p>
                    <div className="space-y-1.5">
                        <NodeBadge label="Manual Trigger" desc="Click Run at the bottom of the canvas" />
                        <NodeBadge label="Gemini AI"      desc={'Replies with "urgent" or "normal" based on the ticket'} />
                        <NodeBadge label="Condition"      desc={'Checks if {{myGemini.text}} contains "urgent"'} />
                        <NodeBadge label="Slack (YES)"    desc="Urgent tickets → your on-call Slack channel" />
                        <NodeBadge label="Discord (NO)"   desc="Normal tickets → general support Discord channel" />
                    </div>
                </div>
            ),
        },
        {
            label: "Gemini API Key", icon: Key,
            content: (
                <div className="space-y-4">
                    <Callout variant="info">
                        <p className="font-semibold">Get your API key</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline underline-offset-2 inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="size-2.5" /></a></li>
                            <li>Click <strong>Create API Key</strong></li>
                            <li>Paste it below</li>
                        </ol>
                    </Callout>
                    <CredField id="t-gemini" label="Gemini API Key" icon={Key} placeholder="AIzaSy…" secret value={geminiKey} onChange={setGeminiKey} saved={geminiSaved} />
                </div>
            ),
        },
        {
            label: "Slack (urgent)", icon: Link2,
            content: (
                <div className="space-y-4">
                    <Callout variant="info">
                        <p className="font-semibold">Create a Slack Incoming Webhook</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className="underline underline-offset-2 inline-flex items-center gap-0.5">api.slack.com/apps <ExternalLink className="size-2.5" /></a></li>
                            <li>Create or select app → <strong>Incoming Webhooks</strong> → Enable</li>
                            <li>Add webhook to workspace → pick channel → copy URL</li>
                        </ol>
                    </Callout>
                    <CredField id="t-slack" label="Slack Webhook — Urgent tickets" icon={Link2} placeholder="https://hooks.slack.com/services/…" value={slackWebhook} onChange={setSlackWebhook} saved={slackSaved} />
                </div>
            ),
        },
        {
            label: "Discord (normal)", icon: Link2,
            content: (
                <div className="space-y-4">
                    <Callout variant="info">
                        <p className="font-semibold">Create a Discord webhook</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Open Discord → channel settings → <strong>Integrations → Webhooks</strong></li>
                            <li>New Webhook → copy the URL</li>
                        </ol>
                    </Callout>
                    <CredField id="t-discord" label="Discord Webhook — Normal tickets" icon={Link2} placeholder="https://discord.com/api/webhooks/…" value={discordWebhook} onChange={setDiscordWebhook} saved={discordSaved} />
                </div>
            ),
        },
        {
            label: "Test", icon: CheckCircle2,
            content: (
                <div className="space-y-4">
                    {(done || (geminiSaved && slackSaved && discordSaved)) ? (
                        <Callout variant="success"><p className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> Ready — hit Run on the canvas</p></Callout>
                    ) : (
                        <Callout variant="warning"><p className="font-semibold">Missing credentials</p><p>Go back and fill in the required fields, then click Save.</p></Callout>
                    )}
                    <div className={cn(CARD_CLS, "px-3.5 py-3 space-y-2")}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">How to test</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Click <strong className="text-zinc-600 dark:text-zinc-400">Run</strong> at the bottom of the canvas. The Manual Trigger fires, Gemini classifies the sample ticket, and the result routes to Slack or Discord.</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Edit the Gemini <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded font-mono">userPrompt</code> to test different urgency — try &ldquo;server down&rdquo; vs &ldquo;billing question&rdquo;.</p>
                    </div>
                    <Note>
                        <p className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"><Save className="size-3" /> Canvas save is separate</p>
                        <p>This panel saves credentials only. Use <strong className="text-zinc-600 dark:text-zinc-400">Save</strong> in the toolbar to persist canvas edits.</p>
                    </Note>
                </div>
            ),
        },
    ];

    return (
        <StepShell
            steps={steps}
            step={step}
            setStep={setStep}
            onSave={() => attach.mutate({ workflowId, credentials: { geminiKey: geminiKey || undefined, slackWebhook: slackWebhook || undefined, discordWebhook: discordWebhook || undefined } })}
            onClose={onClose}
            isSaving={attach.isPending}
            done={done}
        />
    );
};

// ─── Step shell ───────────────────────────────────────────────────────────────

interface ShellProps {
    steps: { label: string; icon: React.ElementType; content: React.ReactNode }[];
    step: number;
    setStep: (n: number) => void;
    onSave: () => void;
    onClose: () => void;
    isSaving: boolean;
    done: boolean;
}

const StepShell = ({ steps, step, setStep, onSave, onClose, isSaving, done }: ShellProps) => {
    const current = steps[step];
    const Icon = current.icon;
    const isLast = step === steps.length - 1;

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Step strip */}
            <div className="flex border-b border-white/50 dark:border-zinc-700/40 overflow-x-auto shrink-0 bg-white/20 dark:bg-zinc-800/20">
                {steps.map((s, i) => {
                    const SIcon = s.icon;
                    const isActive = i === step;
                    const isPast   = i < step;
                    return (
                        <button key={i} type="button" onClick={() => setStep(i)}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-medium shrink-0",
                                "border-b-2 transition-all duration-150",
                                isActive
                                    ? "border-zinc-800 dark:border-zinc-200 text-zinc-900 dark:text-zinc-50"
                                    : isPast
                                    ? "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    : "border-transparent text-zinc-300 dark:text-zinc-600 cursor-default",
                            )}
                        >
                            {isPast && !isActive
                                ? <CheckCircle2 className="size-3.5 text-zinc-400 shrink-0" />
                                : <SIcon className={cn("size-3.5 shrink-0", isActive ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-300 dark:text-zinc-600")} />
                            }
                            <span className="hidden sm:inline truncate max-w-[80px]">{s.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Step title */}
            <div className="shrink-0 px-5 py-3.5 border-b border-black/[0.05] dark:border-white/[0.07]">
                <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-zinc-400 shrink-0" />
                    <h3 className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">{current.label}</h3>
                    <span className="text-[10px] text-zinc-400 ml-auto">{step + 1} / {steps.length}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                    >
                        {current.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-2 px-5 py-3.5 border-t border-black/[0.05] dark:border-white/[0.07]">
                <button type="button"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className={cn(
                        "h-8 px-3 rounded-[9px] text-[11px] font-medium flex items-center gap-1",
                        "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
                        "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                        "transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed",
                    )}
                >
                    <ChevronLeft className="size-3.5" /> Back
                </button>

                <div className="flex-1" />

                {isLast ? (
                    <button type="button" onClick={onSave} disabled={isSaving || done}
                        className={cn(
                            "h-8 px-4 rounded-[9px] text-[11px] font-semibold flex items-center gap-1.5",
                            "bg-zinc-900/90 dark:bg-zinc-50/90 text-white dark:text-zinc-900",
                            "border border-zinc-700/50 dark:border-zinc-300/40",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.15)]",
                            "hover:bg-zinc-800 dark:hover:bg-zinc-100",
                            "transition-all duration-150 active:scale-95",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                        )}
                    >
                        {isSaving ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
                            : done  ? <><CheckCircle2 className="size-3.5" /> Saved</>
                            :         <><Sparkles className="size-3.5" /> Save credentials</>}
                    </button>
                ) : (
                    <button type="button" onClick={() => setStep(step + 1)}
                        className={cn(
                            "h-8 px-4 rounded-[9px] text-[11px] font-semibold flex items-center gap-1.5",
                            "bg-zinc-900/90 dark:bg-zinc-50/90 text-white dark:text-zinc-900",
                            "border border-zinc-700/50 dark:border-zinc-300/40",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.15)]",
                            "hover:bg-zinc-800 dark:hover:bg-zinc-100",
                            "transition-all duration-150 active:scale-95",
                        )}
                    >
                        Next <ChevronRight className="size-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const DemoSetupPanel = ({ workflowId, demoType, onClose }: Props) => (
    <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className={cn(
            "absolute top-0 right-0 bottom-0 z-50",
            "w-[400px] max-w-[92vw] flex flex-col overflow-hidden",
            PANEL_CLS,
        )}
    >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.07] shrink-0">
            <div className="flex items-center gap-2.5">
                {/* Icon badge */}
                <div className={cn(CARD_CLS, "size-8 rounded-[9px] flex items-center justify-center text-zinc-500 dark:text-zinc-400")}>
                    {demoType === "summarizer" ? <Bot className="size-4" /> : <GitBranch className="size-4" />}
                </div>
                {/* Text */}
                <div>
                    <h2 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-50 leading-none">
                        {demoType === "summarizer" ? "AI Summarizer Bot" : "Smart Ticket Triage"}
                    </h2>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Setup guide</p>
                </div>
                {/* Badge — monochrome, no colour */}
                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    Demo
                </span>
            </div>
            <button type="button" onClick={onClose}
                className="size-7 flex items-center justify-center rounded-[8px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150">
                <X className="size-4" />
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
            {demoType === "summarizer"
                ? <SummarizerFlow workflowId={workflowId} onClose={onClose} />
                : <TriageFlow workflowId={workflowId} onClose={onClose} />}
        </div>
    </motion.div>
);
