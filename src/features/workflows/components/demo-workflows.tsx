"use client";

import { motion } from "motion/react";
import { Bot, Briefcase, Zap, Loader2, ArrowRight, GitBranch, Webhook } from "lucide-react";
import { useDeployDemo } from "../hooks/use-workflows";

const DEMOS = [
    {
        id: "summarizer" as const,
        title: "AI Summarizer Bot",
        subtitle: "Webhook → Gemini → Discord",
        description:
            "Listens for any payload via a webhook, summarizes the content using Gemini AI, and posts a clean bullet-point summary to a Discord channel.",
        icon: Bot,
        nodes: ["Webhook Trigger", "Gemini AI", "Discord"],
        accentFrom: "from-blue-500/10",
        accentTo: "to-violet-500/10",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-600",
        buttonBg: "bg-blue-500/5 hover:bg-blue-500/15 border-blue-500/20 text-blue-700 dark:text-blue-400",
        pillColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        badge: "Beginner",
        badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    {
        id: "triage" as const,
        title: "Smart Ticket Triage",
        subtitle: "Manual → Gemini → Branch → Slack / Discord",
        description:
            "Classifies incoming support tickets with Gemini AI. A conditional branch then routes urgent tickets to Slack and standard ones to Discord — automatically.",
        icon: GitBranch,
        nodes: ["Manual Trigger", "Gemini AI", "Condition", "Slack", "Discord"],
        accentFrom: "from-amber-500/10",
        accentTo: "to-orange-500/10",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-600",
        buttonBg: "bg-amber-500/5 hover:bg-amber-500/15 border-amber-500/20 text-amber-700 dark:text-amber-400",
        pillColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        badge: "Intermediate",
        badgeColor: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    },
];

export const DemoWorkflows = () => {
    const deployDemo = useDeployDemo();
    const loadingType = deployDemo.isPending ? deployDemo.variables?.type : null;

    const handleDeploy = (type: "summarizer" | "triage") => {
        if (deployDemo.isPending) return;
        deployDemo.mutate({ type });
    };

    return (
        <section className="mb-12 w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Quick Start Demos
                </h2>
                <span className="text-xs text-muted-foreground border border-border/50 px-2 py-0.5 rounded-full">
                    1-click deploy
                </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
                Click a demo to instantly open the visual editor — nodes pre-wired and a setup guide ready inside.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMOS.map((demo) => {
                    const Icon = demo.icon;
                    const isLoading = loadingType === demo.id;
                    const isDisabled = deployDemo.isPending;

                    return (
                        <motion.button
                            key={demo.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDeploy(demo.id)}
                            whileHover={!isDisabled ? { y: -2, scale: 1.005 } : {}}
                            whileTap={!isDisabled ? { scale: 0.995 } : {}}
                            className={`
                                relative group text-left w-full overflow-hidden rounded-xl border border-border/60
                                bg-card shadow-sm transition-all duration-300
                                hover:border-border hover:shadow-md
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                disabled:opacity-60 disabled:cursor-wait
                            `}
                        >
                            {/* Gradient shimmer on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${demo.accentFrom} via-transparent ${demo.accentTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                            <div className="relative z-10 p-6 flex flex-col gap-4">
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg ${demo.iconBg} ${demo.iconColor} flex-shrink-0`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-sm text-foreground leading-snug">{demo.title}</h3>
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${demo.badgeColor}`}>{demo.badge}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{demo.subtitle}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {demo.description}
                                </p>

                                {/* Node pills */}
                                <div className="flex flex-wrap gap-1.5">
                                    {demo.nodes.map((node, i) => (
                                        <span key={node} className="flex items-center gap-1">
                                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${demo.pillColor}`}>
                                                {node}
                                            </span>
                                            {i < demo.nodes.length - 1 && (
                                                <ArrowRight className="size-3 text-muted-foreground/50" />
                                            )}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className={`
                                    flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border
                                    text-sm font-medium transition-all duration-200
                                    ${demo.buttonBg}
                                `}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Deploying workspace…
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="size-4" />
                                            Open in Editor
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
};
