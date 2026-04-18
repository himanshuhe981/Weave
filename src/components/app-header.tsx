"use client";

import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";

// Static (non-animated) version of the Weave logo — same SVG paths as the landing page logo
const WeaveLogoStatic = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`${className} overflow-visible`} fill="none">
        <path d="M 50 50 C 70 95, 95 95, 95 25 C 95 -20, 70 5, 50 50 C 30 95, 5 95, 5 25 C 5 -20, 30 5, 50 50 Z" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 50 50 C 75 95, 95 70, 95 25 C 95 -10, 75 5, 50 50 C 25 95, 5 70, 5 25 C 5 -10, 25 5, 50 50 Z" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
        <path d="M 50 50 C 65 95, 95 120, 95 25 C 95 -30, 65 5, 50 50 C 35 95, 5 120, 5 25 C 5 -30, 35 5, 50 50 Z" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
        <circle cx="50" cy="50" r="3" fill="currentColor" fillOpacity="0.6" />
        <circle cx="95" cy="25" r="2" fill="currentColor" fillOpacity="0.4" />
        <circle cx="5" cy="25" r="2" fill="currentColor" fillOpacity="0.4" />
    </svg>
);

const ROUTE_LABELS: Record<string, string> = {
    "/workflows":   "Workflows",
    "/credentials": "Credentials",
    "/executions":  "Executions",
};

export const AppHeader = () => {
    const pathname = usePathname();
    const sectionKey = Object.keys(ROUTE_LABELS).find(k => pathname.startsWith(k));
    const sectionLabel = sectionKey ? ROUTE_LABELS[sectionKey] : null;

    return (
        <header className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60 px-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-30">
            {/* Sidebar toggle */}
            <SidebarTrigger className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors" />

            {/* Thin divider */}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700/60" />

            {/* Weave brand — static logo + wordmark */}
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
                <WeaveLogoStatic className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold tracking-wide">Weave</span>
            </div>

            {/* Breadcrumb */}
            {sectionLabel && (
                <>
                    <span className="text-zinc-200 dark:text-zinc-700 text-sm select-none">/</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {sectionLabel}
                    </span>
                </>
            )}

            {/* Spacer */}
            <div className="flex-1" />

        </header>
    );
};