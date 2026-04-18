import Link from "next/link";

// ─── Weave thread logo (same SVG paths as app-sidebar WeaveLogoStatic) ────────
const WeaveLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
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

// ─── Subtle dot-grid background (matches editor canvas) ───────────────────────
const DotGrid = () => (
    <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
            backgroundImage: "radial-gradient(circle, rgba(161,161,170,0.28) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
        }}
    />
);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="relative min-h-svh bg-white dark:bg-zinc-950 flex flex-col overflow-hidden">
            {/* Dot-grid background */}
            <DotGrid />

            {/* Very subtle radial vignette — white centre, slightly dimmed edges */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 30%, rgba(244,244,245,0.55) 100%)",
                }}
            />

            {/* Top navbar */}
            <header className="relative z-10 flex items-center justify-between px-8 py-5">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity duration-150"
                >
                    <WeaveLogo className="w-6 h-6" />
                    <span className="text-[15px] font-semibold tracking-tight">Weave</span>
                </Link>

                {/* Subtle version badge */}
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide select-none">
                    Automate anything
                </span>
            </header>

            {/* Centred form area */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
                <div className="w-full max-w-[400px]">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 pb-6 text-center">
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal">
                    © {new Date().getFullYear()} Weave. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default AuthLayout;