import Link from "next/link";

// ─── Weave SVG logo (same paths as app-header and app-sidebar) ────────────────
export const WeaveLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="-12 -22 124 132" className={className} fill="none" aria-hidden>
        <path
            d="M 50 50 C 70 95, 95 95, 95 25 C 95 -20, 70 5, 50 50 C 30 95, 5 95, 5 25 C 5 -20, 30 5, 50 50 Z"
            stroke="currentColor" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round"
        />
        <path
            d="M 50 50 C 75 95, 95 70, 95 25 C 95 -10, 75 5, 50 50 C 25 95, 5 70, 5 25 C 5 -10, 25 5, 50 50 Z"
            stroke="currentColor" strokeOpacity="0.38" strokeWidth="1.8" strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="4.5" fill="currentColor" fillOpacity="0.70" />
        <circle cx="95" cy="25" r="3"   fill="currentColor" fillOpacity="0.42" />
        <circle cx="5"  cy="25" r="3"   fill="currentColor" fillOpacity="0.42" />
    </svg>
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        // Same weave-bg wavy pattern used by the dashboard
        <div className="weave-bg min-h-svh flex flex-col">

            {/* ── Navbar — matches AppHeader styling exactly ───────────── */}
            <header className="flex h-11 shrink-0 items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60 px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-30">
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150"
                >
                    <WeaveLogo className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold tracking-wide">Weave</span>
                </Link>
            </header>

            {/* ── Centred content ──────────────────────────────────────── */}
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-[420px]">
                    {children}
                </div>
            </main>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="pb-6 text-center">
                <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                    © {new Date().getFullYear()} Weave
                </p>
            </footer>
        </div>
    );
};

export default AuthLayout;