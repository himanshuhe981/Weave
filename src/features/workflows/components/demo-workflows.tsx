"use client";

import { motion } from "motion/react";
import { Bot, GitBranch, Loader2, ArrowRight, Zap } from "lucide-react";
import { useDeployDemo } from "../hooks/use-workflows";

const DEMOS = [
    {
        id: "summarizer" as const,
        title: "AI Summarizer Bot",
        badge: "Beginner",
        icon: Bot,
        nodes: ["Webhook Trigger", "Gemini AI", "Discord"],
    },
    {
        id: "triage" as const,
        title: "Smart Ticket Triage",
        badge: "Intermediate",
        icon: GitBranch,
        nodes: ["Manual Trigger", "Gemini AI", "Condition", "Slack", "Discord"],
    },
] as const;

export const DemoWorkflows = () => {
    const deployDemo = useDeployDemo();
    const loadingType = deployDemo.isPending ? deployDemo.variables?.type : null;

    const handleDeploy = (type: "summarizer" | "triage") => {
        if (deployDemo.isPending) return;
        deployDemo.mutate({ type });
    };

    return (
        <section className="mb-10">
            {/* Section divider */}
            <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                    Quick Start
                </span>
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                <span className="text-[10px] font-medium text-zinc-300 dark:text-zinc-700 whitespace-nowrap">
                    1-click deploy
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {DEMOS.map((demo, idx) => {
                    const Icon = demo.icon;
                    const isLoading = loadingType === demo.id;
                    const isDisabled = deployDemo.isPending;

                    return (
                        <motion.button
                            key={demo.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDeploy(demo.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.06, ease: "easeOut" }}
                            whileHover={!isDisabled ? { y: -3, transition: { duration: 0.2 } } : {}}
                            whileTap={!isDisabled ? { scale: 0.98 } : {}}
                            className="
                                group relative text-left w-full overflow-hidden
                                rounded-[1.5rem]
                                bg-white dark:bg-zinc-900
                                border border-zinc-100 dark:border-zinc-800/80
                                shadow-[0_2px_16px_0_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_0_rgba(0,0,0,0.12)]
                                dark:shadow-none dark:hover:shadow-[0_8px_40px_0_rgba(255,255,255,0.03)]
                                hover:border-zinc-200/70 dark:hover:border-zinc-600/50
                                transition-all duration-300
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
                                disabled:opacity-60 disabled:cursor-wait
                            "
                        >
                            {/* Card body */}
                            <div className="p-6">
                                {/* Header row */}
                                <div className="flex items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        {/* Icon — same landing-page circle style */}
                                        <div className="size-10 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 shadow-sm shrink-0 group-hover:border-zinc-200 dark:group-hover:border-zinc-600 group-hover:shadow-md transition-all duration-200">
                                            <Icon className="size-4.5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[0.9rem] font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-snug tracking-tight">
                                                {demo.title}
                                            </p>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                                                {demo.badge}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deploy button */}
                                    <div className="size-9 flex items-center justify-center rounded-xl shrink-0 border border-zinc-100 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800 shadow-sm group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 group-hover:shadow-md transition-all duration-200">
                                        {isLoading ? (
                                            <Loader2 className="size-4 text-zinc-500 dark:text-zinc-400 animate-spin" />
                                        ) : (
                                            <Zap
                                                className="size-4 text-zinc-500 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors"
                                                strokeWidth={1.75}
                                                fill={isLoading ? "none" : "currentColor"}
                                                fillOpacity={isLoading ? 0 : 0.15}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Node flow — arrow separated */}
                                <div className="flex flex-wrap items-center gap-1">
                                    {demo.nodes.map((node, i) => (
                                        <span key={node} className="flex items-center gap-1">
                                            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                                                {node}
                                            </span>
                                            {i < demo.nodes.length - 1 && (
                                                <ArrowRight className="size-2.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Card footer strip — liquid glass */}
                            <div className="px-5 py-3 border-t border-zinc-100/60 dark:border-zinc-800/50 bg-white/30 dark:bg-zinc-800/20 backdrop-blur-sm flex items-center justify-between">
                                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                                    {isLoading ? "Deploying…" : "Click to open in editor"}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Deploy <ArrowRight className="size-2.5" />
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
};
