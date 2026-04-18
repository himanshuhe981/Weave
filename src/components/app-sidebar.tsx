"use client"

import {
    CreditCardIcon,
    GitBranchIcon,
    HistoryIcon,
    KeyIcon,
    LogOutIcon,
    StarIcon,
    SparklesIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription"
import { useWorkflowUsage } from "@/features/workflows/hooks/use-workflows"
import { Progress } from "@/components/ui/progress"
import { startProCheckout } from "@/lib/checkout"


// ─── Weave thread logo ────────────────────────────────────────────────────────
// viewBox enlarged so all bezier extremes stay inside — no clip artefacts
const WeaveLogoStatic = ({ className = "w-5 h-5" }: { className?: string }) => (
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
)

// ─── Acrylic "sheet on wall" styles ──────────────────────────────────────────
// Mimics a thick frosted glass panel fixed slightly above the surface.
// The inset top highlight = light catching the top sanded edge.
// The layered shadows = panel thickness + lift above the wall.
const ACRYLIC_ACTIVE = [
    // Truly transparent liquid glass — you see the background through it
    "bg-white/20 dark:bg-zinc-800/20",
    "backdrop-blur-2xl",
    "border border-white/70 dark:border-zinc-600/50",
    // Lift shadow + top catch-light + underside
    "shadow-[0_6px_28px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.04)]",
    "dark:shadow-[0_6px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
].join(" ")

// Nail style — tiny screw head with radial gradient and shadow
const Nail = ({ side }: { side: "left" | "right" }) => (
    <span
        className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-[10px]" : "right-[10px]"} size-[5px] rounded-full pointer-events-none z-10 group-data-[collapsible=icon]:hidden`}
        style={{
            background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.85) 0%, rgba(180,180,185,0.65) 45%, rgba(130,130,138,0.50) 100%)",
            boxShadow: "0 1.5px 4px rgba(0,0,0,0.22), inset 0 0.5px 1px rgba(255,255,255,0.85)",
        }}
    />
)

// Acrylic glass for plan/billing/utility widgets (same physical language, lighter shadow)
const ACRYLIC_WIDGET = [
    "bg-white/85 dark:bg-zinc-800/70",
    "backdrop-blur-2xl",
    "border border-zinc-200/70 dark:border-zinc-700/50",
    "shadow-[0_4px_20px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.03)]",
    "dark:shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
].join(" ")


const NAV_ITEMS = [
    { title: "Workflows",   icon: GitBranchIcon, url: "/workflows"   },
    { title: "Credentials", icon: KeyIcon,        url: "/credentials" },
    { title: "Executions",  icon: HistoryIcon,    url: "/executions"  },
] as const


export const AppSidebar = () => {
    const router   = useRouter()
    const pathname = usePathname()
    const { hasActiveSubscription, isLoading }       = useHasActiveSubscription()
    const { data: usage, isLoading: isUsageLoading } = useWorkflowUsage()

    const usedPct   = Math.min(((usage?.count ?? 0) / (usage?.limit ?? 5)) * 100, 100)
    const remaining = (usage?.limit ?? 5) - (usage?.count ?? 0)
    const atLimit   = (usage?.count ?? 0) >= (usage?.limit ?? 5)

    return (
        <Sidebar collapsible="icon">

            {/* ── Header ──────────────────────────────────────────────── */}
            <SidebarHeader className="py-5 px-3">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip="Weave"
                        className="h-10 px-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150"
                    >
                        <Link href="/" prefetch className="flex items-center gap-3 w-full">
                            <span className="size-6 group-data-[collapsible=icon]:!size-4 flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200 transition-all">
                                <WeaveLogoStatic className="w-full h-full" />
                            </span>
                            <span className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100 tracking-tight leading-none group-data-[collapsible=icon]:hidden">
                                Weave
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>

            {/* ── Nav ─────────────────────────────────────────────────────── */}
            <SidebarContent className="px-3 py-0 gap-0">
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        {/*
                            gap-2.5 between items gives visual breathing room so
                            hovering one item doesn't visually crowd the active acrylic sheet
                        */}
                        <SidebarMenu className="gap-2.5">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname.startsWith(item.url)
                                return (
                                    <SidebarMenuItem key={item.title} className="relative">

                                        {/* Nail heads — only on active, above the acrylic panel */}
                                        {isActive && (
                                            <>
                                                <Nail side="left"  />
                                                <Nail side="right" />
                                            </>
                                        )}

                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={isActive}
                                            asChild
                                            className={[
                                                "h-10 pl-5 pr-3 rounded-2xl transition-all duration-200",
                                                isActive ? ACRYLIC_ACTIVE : [
                                                    "text-zinc-500 dark:text-zinc-400",
                                                    "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40",
                                                    "hover:text-zinc-800 dark:hover:text-zinc-100",
                                                ].join(" "),
                                            ].join(" ")}
                                        >
                                            <Link href={item.url} prefetch>
                                                <item.icon
                                                    className={[
                                                        "size-4 shrink-0",
                                                        isActive
                                                            ? "text-zinc-800 dark:text-zinc-100"
                                                            : "text-zinc-400 dark:text-zinc-500",
                                                    ].join(" ")}
                                                    strokeWidth={isActive ? 2.25 : 1.75}
                                                />
                                                <span className={[
                                                    "text-sm group-data-[collapsible=icon]:hidden",
                                                    isActive ? "font-semibold text-zinc-900 dark:text-zinc-100" : "font-medium",
                                                ].join(" ")}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* ── Usage / Plan widget ──────────────────────────────────── */}
                {!isUsageLoading && !isLoading && (
                    <SidebarGroup className="mt-auto px-0 pb-2 group-data-[collapsible=icon]:hidden">
                        <SidebarGroupContent>
                            <div className={`${ACRYLIC_WIDGET} mx-0 p-4 rounded-2xl space-y-2.5`}>
                                {hasActiveSubscription ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <SparklesIcon className="size-3 text-zinc-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                    Plan
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                                                Pro
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400">Unlimited workflow runs</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                Usage
                                            </span>
                                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                                                {usage?.count ?? 0}
                                                <span className="text-zinc-400 font-normal">/{usage?.limit ?? 5}</span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={usedPct}
                                            className="h-1 bg-zinc-100 dark:bg-zinc-700 [&>div]:bg-zinc-800 dark:[&>div]:bg-zinc-200 [&>div]:rounded-full [&>div]:transition-all"
                                        />
                                        <p className={`text-[9px] font-medium ${atLimit ? "text-red-500" : "text-zinc-400"}`}>
                                            {atLimit ? "Limit reached" : `${remaining} runs remaining`}
                                        </p>
                                    </>
                                )}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <SidebarFooter className="px-3 py-4 gap-1 border-t border-zinc-100/80 dark:border-zinc-800/50">
                <SidebarMenu className="gap-1">

                    {!hasActiveSubscription && !isLoading && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Upgrade to Pro"
                                onClick={startProCheckout}
                                className={`h-10 px-3 rounded-2xl gap-3 transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100
                                    hover:bg-white/90 hover:backdrop-blur-2xl hover:border hover:border-zinc-200/80
                                    hover:shadow-[0_4px_20px_rgba(0,0,0,0.07),inset_0_1px_1px_rgba(255,255,255,1)]`}
                            >
                                <StarIcon className="size-4 shrink-0 text-zinc-400" />
                                <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Upgrade to Pro</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Billing"
                            onClick={() => authClient.customer.portal()}
                            className={`h-10 px-3 rounded-2xl gap-3 transition-all duration-200 text-zinc-400 dark:text-zinc-500
                                hover:text-zinc-700 dark:hover:text-zinc-300
                                hover:bg-white/90 hover:backdrop-blur-2xl hover:border hover:border-zinc-200/80
                                hover:shadow-[0_4px_20px_rgba(0,0,0,0.07),inset_0_1px_1px_rgba(255,255,255,1)]`}
                        >
                            <CreditCardIcon className="size-4 shrink-0" />
                            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Billing</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign out"
                            onClick={() => authClient.signOut({
                                fetchOptions: { onSuccess: () => router.push("/") },
                            })}
                            className="h-10 px-3 rounded-2xl gap-3 transition-all duration-200 text-zinc-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <LogOutIcon className="size-4 shrink-0" />
                            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                </SidebarMenu>
            </SidebarFooter>

        </Sidebar>
    )
}
