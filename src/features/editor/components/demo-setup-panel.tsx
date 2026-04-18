"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    X, ChevronRight, ChevronLeft, CheckCircle2, Loader2,
    Key, Link2, ExternalLink, Check, ClipboardCopy,
    Bot, GitBranch, Webhook, Sparkles, Info, Save,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";

// ─── Types ───────────────────────────────────────────────────────────────────

type DemoType = "summarizer" | "triage";

interface Props {
    workflowId: string;
    demoType: DemoType;
    onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
    const [copied, setCopied] = useState(false);
    const handle = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };
    return (
        <button type="button" onClick={handle}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <ClipboardCopy className="size-3.5" />}
            {label && <span>{copied ? "Copied!" : label}</span>}
        </button>
    );
};

const Callout = ({ color, children }: { color: "blue" | "green" | "amber" | "violet" | "slate"; children: React.ReactNode }) => {
    const styles = {
        blue: "bg-blue-500/8 border-blue-500/25 text-blue-700 dark:text-blue-300",
        green: "bg-emerald-500/8 border-emerald-500/25 text-emerald-700 dark:text-emerald-300",
        amber: "bg-amber-500/8 border-amber-500/25 text-amber-700 dark:text-amber-300",
        violet: "bg-violet-500/8 border-violet-500/25 text-violet-700 dark:text-violet-300",
        slate: "bg-slate-500/8 border-slate-500/25 text-slate-700 dark:text-slate-300",
    };
    return (
        <div className={cn("p-3.5 rounded-lg border text-xs leading-relaxed space-y-1", styles[color])}>
            {children}
        </div>
    );
};

const CredField = ({
    id, label, icon: Icon, placeholder, secret = false, value, onChange, saved = false,
}: {
    id: string; label: string; icon: React.ElementType; placeholder: string;
    secret?: boolean; value: string; onChange: (v: string) => void; saved?: boolean;
}) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
            <Icon className="size-4 text-muted-foreground" /> {label}
            {saved && (
                <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" /> Saved
                </span>
            )}
        </Label>
        <Input
            id={id}
            type={secret ? "password" : "text"}
            placeholder={saved ? "Leave blank to keep saved value" : placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn("font-mono h-9", saved && !value && "border-emerald-500/40 bg-emerald-500/5")}
            autoComplete="off"
        />
        {saved && !value && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                ✓ Already configured — enter a new value only if you want to replace it.
            </p>
        )}
    </div>
);

// ─── Webhook URL block ────────────────────────────────────────────────────────

const WebhookUrlBlock = ({ workflowId }: { workflowId: string }) => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${base}/api/webhooks/${workflowId}`;
    const curlExample = `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Paste any article, email, or content you want summarized here."}'`;

    return (
        <div className="space-y-4">
            {/* URL */}
            <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">Webhook URL</p>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground break-all flex-1">{url}</span>
                    <CopyButton text={url} />
                </div>
            </div>

            {/* Curl */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Example cURL Request</p>
                    <CopyButton text={curlExample} label="Copy" />
                </div>
                <pre className="text-[11px] text-muted-foreground bg-muted/60 border rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all font-mono leading-relaxed">
{curlExample}
                </pre>
            </div>

            <Callout color="blue">
                <p className="font-semibold flex items-center gap-1.5"><Info className="size-3.5" /> What to send</p>
                <p>Send a JSON body with a <code className="bg-blue-500/10 px-1 rounded">text</code> property. This string is passed as <code className="bg-blue-500/10 px-1 rounded">{"{{webhook.body.text}}"}</code> to Gemini so it can summarize your exact content.</p>
            </Callout>
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

    // Load existing node data to pre-fill fields
    const { data: workflowData } = useQuery(trpc.workflows.getOne.queryOptions({ id: workflowId }));

    const geminiNode = workflowData?.nodes.find(n => n.type === "GEMINI");
    const discordNode = workflowData?.nodes.find(n => n.type === "DISCORD");
    const geminiAlreadySaved = !!(geminiNode?.data as Record<string, unknown>)?.credentialId;
    const discordAlreadySaved = !!((discordNode?.data as Record<string, unknown>)?.webhookUrl || (discordNode?.data as Record<string, unknown>)?.credentialId);

    // Pre-fill from saved data on load
    useEffect(() => {
        if (discordNode?.data) {
            const d = discordNode.data as Record<string, unknown>;
            if (d.webhookUrl && !d.credentialId && !discordWebhook) setDiscordWebhook(d.webhookUrl as string);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowData]);

    const attach = useMutation(trpc.workflows.attachDemoCredentials.mutationOptions({
        onSuccess: (result) => {
            setDone(true);
            toast.success("Credentials saved! Nodes are now configured.");
            if (result.nodes && editor) {
                editor.setNodes((prev) => prev.map((n) => {
                    const updated = result.nodes.find((u: { id: string; data: unknown }) => u.id === n.id);
                    if (!updated) return n;
                    return { ...n, data: updated.data as Record<string, unknown> };
                }));
            }
        },
        onError: (e) => toast.error(e.message),
    }));

    const handleSave = () => {
        // Only send fields the user actually filled in (blank = keep existing)
        attach.mutate({
            workflowId,
            credentials: {
                geminiKey: geminiKey || undefined,
                discordWebhook: discordWebhook || undefined,
            },
        });
    };

    const steps = [
        {
            label: "Overview",
            icon: Webhook,
            shortLabel: "How it works",
            content: (
                <div className="space-y-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This demo has <span className="font-semibold text-foreground">3 pre-wired nodes</span> on your canvas. Here's what each one does:
                    </p>
                    {[
                        { bg: "bg-violet-500/10", color: "text-violet-700 dark:text-violet-400", label: "Webhook Trigger", desc: "Accepts any HTTP POST request. The JSON body becomes the input for the next node." },
                        { bg: "bg-blue-500/10", color: "text-blue-700 dark:text-blue-400", label: "Gemini AI", desc: 'Summarizes the incoming content into 3 concise bullet points using {{webhook.body.text}}.' },
                        { bg: "bg-indigo-500/10", color: "text-indigo-700 dark:text-indigo-400", label: "Discord", desc: 'Posts the summary to a Discord channel via a webhook. Uses {{myGemini.text}} as the message.' },
                    ].map(({ bg, color, label, desc }) => (
                        <div key={label} className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                            <span className={cn("shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-md", bg, color)}>{label}</span>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                    <Callout color="blue">
                        <p className="font-semibold flex items-center gap-1.5"><Info className="size-3.5" />Before continuing</p>
                        <p>We'll ask for a Gemini API key and a Discord webhook URL. You can skip either and configure nodes directly on the canvas later.</p>
                    </Callout>
                </div>
            ),
        },
        {
            label: "Gemini Key",
            icon: Key,
            shortLabel: "AI credentials",
            content: (
                <div className="space-y-5">
                    <Callout color="blue">
                        <p className="font-semibold">Getting your Gemini API key</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline underline-offset-2 inline-flex items-center gap-0.5 font-medium">Google AI Studio <ExternalLink className="size-3" /></a></li>
                            <li>Click <span className="font-semibold">"Create API Key"</span></li>
                            <li>Copy and paste it below</li>
                        </ol>
                    </Callout>
                    <CredField
                        id="s-gemini"
                        label="Gemini API Key"
                        icon={Key}
                        placeholder="AIzaSy..."
                        secret
                        value={geminiKey}
                        onChange={setGeminiKey}
                        saved={geminiAlreadySaved}
                    />
                    <p className="text-xs text-muted-foreground">
                        Uses <code className="bg-muted px-1 rounded">gemini-2.5-flash-lite</code> by default. Click the Gemini node on the canvas to change the model or prompt.
                    </p>
                </div>
            ),
        },
        {
            label: "Discord",
            icon: Link2,
            shortLabel: "Output channel",
            content: (
                <div className="space-y-5">
                    <Callout color="violet">
                        <p className="font-semibold">Creating a Discord webhook</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Open Discord → go to a channel</li>
                            <li>Click <span className="font-semibold">Edit Channel → Integrations → Webhooks</span></li>
                            <li>Click <span className="font-semibold">New Webhook</span> → copy the URL</li>
                        </ol>
                    </Callout>
                    <CredField
                        id="s-discord"
                        label="Discord Webhook URL"
                        icon={Link2}
                        placeholder="https://discord.com/api/webhooks/..."
                        value={discordWebhook}
                        onChange={setDiscordWebhook}
                        saved={discordAlreadySaved}
                    />
                </div>
            ),
        },
        {
            label: "Test",
            icon: CheckCircle2,
            shortLabel: "Go live",
            content: (
                <div className="space-y-5">
                    {(done || (geminiAlreadySaved && discordAlreadySaved)) && (
                        <Callout color="green">
                            <p className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="size-3.5" />Workflow is ready!</p>
                            <p>Trigger it by sending a POST request to the webhook URL below.</p>
                        </Callout>
                    )}
                    {!done && (!geminiAlreadySaved || !discordAlreadySaved) && (
                        <Callout color="amber">
                            <p className="font-semibold">Missing configuration</p>
                            <p>Go back and fill in your missing credentials, then click <span className="font-semibold">Save Credentials</span>.</p>
                        </Callout>
                    )}
                    <WebhookUrlBlock workflowId={workflowId} />
                    <Callout color="slate">
                        <p className="font-semibold flex items-center gap-1.5"><Save className="size-3.5" />Top-bar Save button</p>
                        <p>This panel saves <span className="font-semibold">credentials only</span>. To save node positions, message content, and other canvas edits — click the <span className="font-semibold">Save</span> button in the top toolbar.</p>
                    </Callout>
                </div>
            ),
        },
    ];

    return (
        <StepShell
            steps={steps}
            step={step}
            setStep={setStep}
            onSave={handleSave}
            onClose={onClose}
            isSaving={attach.isPending}
            done={done}
            saveLabel="Save Credentials"
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

    const geminiNode = workflowData?.nodes.find(n => n.type === "GEMINI");
    const slackNode = workflowData?.nodes.find(n => n.type === "SLACK");
    const discordNode = workflowData?.nodes.find(n => n.type === "DISCORD");
    const geminiAlreadySaved = !!(geminiNode?.data as Record<string, unknown>)?.credentialId;
    const slackAlreadySaved = !!((slackNode?.data as Record<string, unknown>)?.webhookUrl || (slackNode?.data as Record<string, unknown>)?.credentialId);
    const discordAlreadySaved = !!((discordNode?.data as Record<string, unknown>)?.webhookUrl || (discordNode?.data as Record<string, unknown>)?.credentialId);

    useEffect(() => {
        if (slackNode?.data) {
            const d = slackNode.data as Record<string, unknown>;
            if (d.webhookUrl && !d.credentialId && !slackWebhook) setSlackWebhook(d.webhookUrl as string);
        }
        if (discordNode?.data) {
            const d = discordNode.data as Record<string, unknown>;
            if (d.webhookUrl && !d.credentialId && !discordWebhook) setDiscordWebhook(d.webhookUrl as string);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowData]);

    const attach = useMutation(trpc.workflows.attachDemoCredentials.mutationOptions({
        onSuccess: (result) => {
            setDone(true);
            toast.success("Credentials saved! Click Run to test the branched flow.");
            if (result.nodes && editor) {
                editor.setNodes((prev) => prev.map((n) => {
                    const updated = result.nodes.find((u: { id: string; data: unknown }) => u.id === n.id);
                    if (!updated) return n;
                    return { ...n, data: updated.data as Record<string, unknown> };
                }));
            }
        },
        onError: (e) => toast.error(e.message),
    }));

    const handleSave = () => {
        attach.mutate({
            workflowId,
            credentials: {
                geminiKey: geminiKey || undefined,
                slackWebhook: slackWebhook || undefined,
                discordWebhook: discordWebhook || undefined,
            },
        });
    };

    const allSaved = geminiAlreadySaved && slackAlreadySaved && discordAlreadySaved;

    const steps = [
        {
            label: "Overview",
            icon: GitBranch,
            shortLabel: "How it works",
            content: (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        A <span className="font-semibold text-foreground">branched conditional workflow</span> with 5 pre-wired nodes. Gemini classifies the ticket, and the Condition node routes it:
                    </p>
                    {[
                        { bg: "bg-slate-500/10", color: "text-slate-600 dark:text-slate-400", label: "Manual Trigger", desc: "Click Run at the bottom of the canvas to fire the flow." },
                        { bg: "bg-blue-500/10", color: "text-blue-700 dark:text-blue-400", label: "Gemini AI", desc: 'Reads the ticket and replies with exactly "urgent" or "normal".' },
                        { bg: "bg-orange-500/10", color: "text-orange-700 dark:text-orange-400", label: "Condition", desc: 'Checks if {{myGemini.text}} contains "urgent" — branches accordingly.' },
                        { bg: "bg-emerald-500/10", color: "text-emerald-700 dark:text-emerald-400", label: "Slack (true →)", desc: "Receives urgent tickets. Alerts your on-call team." },
                        { bg: "bg-indigo-500/10", color: "text-indigo-700 dark:text-indigo-400", label: "Discord (false →)", desc: "Receives normal tickets. Posts to a general support channel." },
                    ].map(({ bg, color, label, desc }) => (
                        <div key={label} className="flex gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                            <span className={cn("shrink-0 mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md", bg, color)}>{label}</span>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            label: "Gemini Key",
            icon: Key,
            shortLabel: "AI credentials",
            content: (
                <div className="space-y-5">
                    <Callout color="blue">
                        <p className="font-semibold">Getting your Gemini API key</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline underline-offset-2 inline-flex items-center gap-0.5 font-medium">Google AI Studio <ExternalLink className="size-3" /></a></li>
                            <li>Click <span className="font-semibold">"Create API Key"</span></li>
                            <li>Copy and paste it below</li>
                        </ol>
                    </Callout>
                    <CredField
                        id="t-gemini"
                        label="Gemini API Key"
                        icon={Key}
                        placeholder="AIzaSy..."
                        secret
                        value={geminiKey}
                        onChange={setGeminiKey}
                        saved={geminiAlreadySaved}
                    />
                </div>
            ),
        },
        {
            label: "Slack",
            icon: Link2,
            shortLabel: "Urgent route",
            content: (
                <div className="space-y-5">
                    <Callout color="green">
                        <p className="font-semibold">Creating a Slack Incoming Webhook</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className="underline underline-offset-2 inline-flex items-center gap-0.5 font-medium">api.slack.com/apps <ExternalLink className="size-3" /></a></li>
                            <li>Create or select an app → <span className="font-semibold">Incoming Webhooks</span> → Enable</li>
                            <li>Click <span className="font-semibold">Add New Webhook to Workspace</span>, pick channel, copy URL</li>
                        </ol>
                    </Callout>
                    <CredField
                        id="t-slack"
                        label="Slack Webhook URL (Urgent tickets)"
                        icon={Link2}
                        placeholder="https://hooks.slack.com/services/..."
                        value={slackWebhook}
                        onChange={setSlackWebhook}
                        saved={slackAlreadySaved}
                    />
                </div>
            ),
        },
        {
            label: "Discord",
            icon: Link2,
            shortLabel: "Normal route",
            content: (
                <div className="space-y-5">
                    <Callout color="violet">
                        <p className="font-semibold">Creating a Discord Webhook</p>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Open Discord → channel settings → <span className="font-semibold">Integrations → Webhooks</span></li>
                            <li>Click <span className="font-semibold">New Webhook</span></li>
                            <li>Copy the URL and paste it below</li>
                        </ol>
                    </Callout>
                    <CredField
                        id="t-discord"
                        label="Discord Webhook URL (Normal tickets)"
                        icon={Link2}
                        placeholder="https://discord.com/api/webhooks/..."
                        value={discordWebhook}
                        onChange={setDiscordWebhook}
                        saved={discordAlreadySaved}
                    />
                </div>
            ),
        },
        {
            label: "Test",
            icon: CheckCircle2,
            shortLabel: "Go live",
            content: (
                <div className="space-y-5">
                    {(done || allSaved) ? (
                        <Callout color="green">
                            <p className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="size-3.5" />Ready to test!</p>
                            <p>Hit the <span className="font-semibold">Run</span> button at the bottom of the canvas. The Condition node will branch your ticket to Slack (urgent) or Discord (normal).</p>
                        </Callout>
                    ) : (
                        <Callout color="amber">
                            <p className="font-semibold">Missing configuration</p>
                            <p>Go back and fill in your missing credentials, then click <span className="font-semibold">Save Credentials</span>.</p>
                        </Callout>
                    )}
                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
                        <p className="text-xs font-semibold text-foreground">How to test</p>
                        <p className="text-xs text-muted-foreground">Click <span className="font-semibold">Run</span> at the bottom of the canvas. The Manual Trigger fires and passes a sample ticket through Gemini and into the correct output branch.</p>
                        <p className="text-xs text-muted-foreground mt-1">To test different urgency, click the Gemini node and change the <code className="bg-muted px-1 rounded">userPrompt</code> to include words like "server down" (urgent) or "billing question" (normal).</p>
                    </div>
                    <Callout color="slate">
                        <p className="font-semibold flex items-center gap-1.5"><Save className="size-3.5" />Top-bar Save button</p>
                        <p>This panel saves <span className="font-semibold">credentials only</span>. To persist node positions and canvas edits — use the <span className="font-semibold">Save</span> button in the top toolbar.</p>
                    </Callout>
                </div>
            ),
        },
    ];

    return (
        <StepShell
            steps={steps}
            step={step}
            setStep={setStep}
            onSave={handleSave}
            onClose={onClose}
            isSaving={attach.isPending}
            done={done}
            saveLabel="Save Credentials"
        />
    );
};

// ─── Step shell ───────────────────────────────────────────────────────────────

interface ShellProps {
    steps: { label: string; icon: React.ElementType; shortLabel: string; content: React.ReactNode }[];
    step: number;
    setStep: (n: number) => void;
    onSave: () => void;
    onClose: () => void;
    isSaving: boolean;
    done: boolean;
    saveLabel?: string;
}

const StepShell = ({ steps, step, setStep, onSave, onClose, isSaving, done, saveLabel = "Save & Finish" }: ShellProps) => {
    const current = steps[step];
    const Icon = current.icon;
    const isLast = step === steps.length - 1;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Step tabs */}
            <div role="tablist" aria-orientation="horizontal" className="flex border-b border-border/60 overflow-x-auto scrollbar-hide shrink-0">
                {steps.map((s, i) => {
                    const SIcon = s.icon;
                    const isActive = i === step;
                    const isPast = i < step;
                    return (
                        <button
                            key={i}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`panel-${i}`}
                            id={`tab-${i}`}
                            type="button"
                            onClick={() => setStep(i)}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium shrink-0 border-b-2 transition-all",
                                isActive
                                    ? "border-primary text-foreground"
                                    : isPast
                                    ? "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                    : "border-transparent text-muted-foreground/50 cursor-default"
                            )}
                        >
                            {isPast && !isActive ? (
                                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            ) : (
                                <SIcon className={cn("size-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground/50")} />
                            )}
                            <span className="hidden sm:inline">{s.label}</span>
                            <span className="sr-only sm:hidden">{s.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div role="tabpanel" id={`panel-${step}`} aria-labelledby={`tab-${step}`} className="flex-1 overflow-y-auto p-5">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="size-4 text-primary" />
                        <h3 className="text-base font-semibold">{current.label}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{current.shortLabel}</p>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {current.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-2 p-4 border-t border-border/60 bg-muted/20">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="gap-1"
                >
                    <ChevronLeft className="size-4" /> Back
                </Button>

                <span className="flex-1 text-center text-xs text-muted-foreground">
                    {step + 1} / {steps.length}
                </span>

                {isLast ? (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onSave}
                        disabled={isSaving || done}
                        className="gap-1.5 min-w-[150px]"
                    >
                        {isSaving ? (
                            <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
                        ) : done ? (
                            <><CheckCircle2 className="size-3.5" /> Saved!</>
                        ) : (
                            <><Sparkles className="size-3.5" /> {saveLabel}</>
                        )}
                    </Button>
                ) : (
                    <Button type="button" size="sm" onClick={() => setStep(step + 1)} className="gap-1 min-w-[90px]">
                        Next <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const DemoSetupPanel = ({ workflowId, demoType, onClose }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 420 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 420 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="
                absolute top-0 right-0 bottom-0 z-50
                w-[420px] max-w-[92vw]
                bg-background/98 backdrop-blur-md
                border-l border-border/80 shadow-2xl
                flex flex-col overflow-hidden
            "
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0 bg-muted/20">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "p-1.5 rounded-md",
                        demoType === "summarizer" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                        {demoType === "summarizer" ? <Bot className="size-4" /> : <GitBranch className="size-4" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold leading-none">
                            {demoType === "summarizer" ? "AI Summarizer Bot" : "Smart Ticket Triage"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Setup guide</p>
                    </div>
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                        Demo
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close setup panel"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
                {demoType === "summarizer"
                    ? <SummarizerFlow workflowId={workflowId} onClose={onClose} />
                    : <TriageFlow workflowId={workflowId} onClose={onClose} />
                }
            </div>
        </motion.div>
    );
};
