"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
    email:           z.email("Please enter a valid email address"),
    password:        z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Acrylic tokens ───────────────────────────────────────────────────────────

const ACRYLIC_PANEL = [
    "bg-white/85 dark:bg-zinc-900/80 backdrop-blur-2xl",
    "border border-zinc-200/70 dark:border-zinc-700/50",
    "shadow-[0_12px_48px_rgba(0,0,0,0.09),0_4px_12px_rgba(0,0,0,0.06),inset_0_1.5px_1px_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.04)]",
    "dark:shadow-[0_12px_48px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.08)]",
].join(" ");

const ACRYLIC_BTN = [
    "relative",
    "w-full h-12 rounded-[13px] flex items-center justify-center gap-2.5",
    "bg-white/20 dark:bg-zinc-800/20 backdrop-blur-2xl",
    "border border-white/70 dark:border-zinc-600/50",
    "shadow-[0_6px_28px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.04)]",
    "dark:shadow-[0_6px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
    "text-[13.5px] font-medium text-zinc-700 dark:text-zinc-200",
    "hover:bg-white/40 dark:hover:bg-zinc-800/40",
    "hover:shadow-[0_8px_32px_rgba(0,0,0,0.11),0_3px_8px_rgba(0,0,0,0.07),inset_0_1.5px_1px_rgba(255,255,255,0.98)]",
    "transition-all duration-200 active:scale-[0.99]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const SUBMIT_BTN = [
    "relative",
    "w-full h-12 rounded-[13px] flex items-center justify-center gap-2",
    "bg-zinc-900/92 dark:bg-zinc-50/95",
    "border border-zinc-700/30 dark:border-zinc-200/30",
    "shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.10),0_6px_24px_rgba(0,0,0,0.24),0_2px_6px_rgba(0,0,0,0.14)]",
    "text-[13.5px] font-semibold text-white dark:text-zinc-900",
    "hover:bg-zinc-800 dark:hover:bg-white",
    "transition-all duration-200 active:scale-[0.99]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const INPUT_CLS = [
    "w-full h-11 px-4 rounded-[11px] text-[13px]",
    "bg-white/70 dark:bg-zinc-800/50",
    "border border-zinc-200/80 dark:border-zinc-700/60",
    "text-zinc-800 dark:text-zinc-200",
    "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
    "focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600",
    "focus:bg-white dark:focus:bg-zinc-800/90",
    "shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
    "transition-all duration-150",
].join(" ");

const LABEL_CLS = "text-[10.5px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.1em]";

// ─── Nail components ──────────────────────────────────────────────────────────

const NAIL_STYLE = {
    background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.85) 0%, rgba(180,180,185,0.65) 45%, rgba(130,130,138,0.50) 100%)",
    boxShadow:  "0 1.5px 4px rgba(0,0,0,0.22), inset 0 0.5px 1px rgba(255,255,255,0.85)",
};

const Nail = ({ side }: { side: "left" | "right" }) => (
    <span
        aria-hidden
        className={cn(
            "absolute top-1/2 -translate-y-1/2 size-[5px] rounded-full pointer-events-none z-20",
            side === "left" ? "left-[14px]" : "right-[14px]",
        )}
        style={NAIL_STYLE}
    />
);

const CornerNail = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => (
    <span
        aria-hidden
        className={cn(
            "absolute size-[5px] rounded-full pointer-events-none z-20",
            position === "tl" && "top-[14px] left-[14px]",
            position === "tr" && "top-[14px] right-[14px]",
            position === "bl" && "bottom-[14px] left-[14px]",
            position === "br" && "bottom-[14px] right-[14px]",
        )}
        style={NAIL_STYLE}
    />
);

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm() {
    const router = useRouter();
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });
    const isPending = form.formState.isSubmitting;

    const signInGithub = async () => {
        await authClient.signIn.social({ provider: "github", callbackURL: "/workflows" }, {
            onSuccess: () => router.push("/workflows"),
            onError:   () => { toast.error("Something went wrong"); },
        });
    };
    const signInGoogle = async () => {
        await authClient.signIn.social({ provider: "google", callbackURL: "/workflows" }, {
            onSuccess: () => router.push("/workflows"),
            onError:   () => { toast.error("Something went wrong"); },
        });
    };
    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email({
            name:        values.email,
            email:       values.email,
            password:    values.password,
            callbackURL: "/workflows",
        }, {
            onSuccess: () => router.push("/workflows"),
            onError: (ctx) => { toast.error(ctx.error.message); },
        });
    };

    return (
        <div className="flex flex-col gap-6">

            {/* ── Nameplate ────────────────────────────────────────────── */}
            <div className="px-1 space-y-2">
                <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                    Create account
                </h1>
                <p className="text-[14px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                    Start automating with Weave — free forever
                </p>
            </div>

            {/* ── Acrylic sheet panel ──────────────────────────────────── */}
            <div className={cn("relative rounded-[20px] p-7 flex flex-col gap-5", ACRYLIC_PANEL)}>
                <CornerNail position="tl" />
                <CornerNail position="tr" />
                <CornerNail position="bl" />
                <CornerNail position="br" />

                {/* Social buttons with side nails */}
                <div className="flex flex-col gap-3">
                    <button type="button" onClick={signInGithub} disabled={isPending} className={ACRYLIC_BTN}>
                        <Nail side="left" />
                        <Image alt="GitHub" src="/logos/github.svg" width={18} height={18} className="opacity-80" />
                        Continue with GitHub
                        <Nail side="right" />
                    </button>
                    <button type="button" onClick={signInGoogle} disabled={isPending} className={ACRYLIC_BTN}>
                        <Nail side="left" />
                        <Image alt="Google" src="/logos/google.svg" width={18} height={18} />
                        Continue with Google
                        <Nail side="right" />
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-700/40" />
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-600 tracking-wide select-none">or email</span>
                    <div className="flex-1 h-px bg-zinc-200/60 dark:bg-zinc-700/40" />
                </div>

                {/* Fields */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <label htmlFor="reg-email" className={LABEL_CLS}>Email</label>
                                    <FormControl>
                                        <input id="reg-email" type="email" placeholder="you@example.com" autoComplete="email" className={INPUT_CLS} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />

                        {/* Password side-by-side on sm+ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <label htmlFor="reg-password" className={LABEL_CLS}>Password</label>
                                        <FormControl>
                                            <input id="reg-password" type="password" placeholder="Min. 8 chars" autoComplete="new-password" className={INPUT_CLS} {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <label htmlFor="reg-confirm" className={LABEL_CLS}>Confirm</label>
                                        <FormControl>
                                            <input id="reg-confirm" type="password" placeholder="Repeat password" autoComplete="new-password" className={INPUT_CLS} {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submit — dark pill with nails */}
                        <button type="submit" disabled={isPending} className={SUBMIT_BTN}>
                            <Nail side="left" />
                            {isPending
                                ? <><Loader2 className="size-3.5 animate-spin" />Creating account…</>
                                : "Create account"
                            }
                            <Nail side="right" />
                        </button>

                        <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600 text-center leading-relaxed -mt-1">
                            By continuing you agree to our{" "}
                            <span className="underline underline-offset-2 cursor-pointer hover:text-zinc-600 transition-colors">Terms</span>
                            {" "}&amp;{" "}
                            <span className="underline underline-offset-2 cursor-pointer hover:text-zinc-600 transition-colors">Privacy Policy</span>
                        </p>
                    </form>
                </Form>
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <p className="text-center text-[12.5px] text-zinc-400 dark:text-zinc-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-zinc-700 dark:text-zinc-300 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
