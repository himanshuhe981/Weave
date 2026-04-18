"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z.object({
    email:           z.email("Please enter a valid email address"),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Shared design tokens (must match login-form.tsx) ─────────────────────────

const INPUT_CLS = [
    "w-full h-10 px-3.5 rounded-[10px] text-[13px]",
    "bg-zinc-50 dark:bg-zinc-900",
    "border border-zinc-200/80 dark:border-zinc-800",
    "text-zinc-800 dark:text-zinc-200",
    "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
    "focus:outline-none focus:ring-1 focus:ring-zinc-400/40 dark:focus:ring-zinc-600/40",
    "focus:border-zinc-400/60 dark:focus:border-zinc-600/60",
    "shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
    "transition-all duration-150",
].join(" ");

const SOCIAL_BTN = [
    "w-full h-10 flex items-center justify-center gap-2.5",
    "rounded-[10px] border border-zinc-200/80 dark:border-zinc-800",
    "bg-white dark:bg-zinc-900",
    "text-[13px] font-medium text-zinc-700 dark:text-zinc-300",
    "shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]",
    "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
    "hover:border-zinc-300/80 dark:hover:border-zinc-700",
    "transition-all duration-150 active:scale-[0.99]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const SUBMIT_BTN = [
    "w-full h-10 flex items-center justify-center gap-2",
    "rounded-[10px]",
    "bg-zinc-900 dark:bg-zinc-50",
    "text-[13px] font-semibold text-white dark:text-zinc-900",
    "border border-zinc-800/50 dark:border-zinc-200/50",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,0.18)]",
    "hover:bg-zinc-800 dark:hover:bg-zinc-100",
    "transition-all duration-150 active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
].join(" ");

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
        <div className="flex flex-col gap-8">

            {/* ── Heading ─────────────────────────────────────────────── */}
            <div className="text-center space-y-1.5">
                <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Create your account
                </h1>
                <p className="text-[13px] text-zinc-400 dark:text-zinc-500 font-normal">
                    Start automating with Weave in minutes
                </p>
            </div>

            {/* ── Form card ───────────────────────────────────────────── */}
            <div className="bg-white dark:bg-zinc-950 rounded-[16px] border border-zinc-200/80 dark:border-zinc-800 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] p-6 flex flex-col gap-5">

                {/* Social buttons */}
                <div className="flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={signInGithub}
                        disabled={isPending}
                        className={SOCIAL_BTN}
                    >
                        <Image alt="GitHub" src="/logos/github.svg" width={17} height={17} />
                        Continue with GitHub
                    </button>
                    <button
                        type="button"
                        onClick={signInGoogle}
                        disabled={isPending}
                        className={SOCIAL_BTN}
                    >
                        <Image alt="Google" src="/logos/google.svg" width={17} height={17} />
                        Continue with Google
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium select-none">or</span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>

                {/* Fields */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <label htmlFor="reg-email" className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                                        Email
                                    </label>
                                    <FormControl>
                                        <input
                                            id="reg-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            className={INPUT_CLS}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <label htmlFor="reg-password" className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                                            Password
                                        </label>
                                        <FormControl>
                                            <input
                                                id="reg-password"
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                className={INPUT_CLS}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <label htmlFor="reg-confirm" className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide uppercase">
                                            Confirm
                                        </label>
                                        <FormControl>
                                            <input
                                                id="reg-confirm"
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                className={INPUT_CLS}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Password hint */}
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 -mt-1">
                            Minimum 8 characters required
                        </p>

                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(SUBMIT_BTN, "mt-1")}
                        >
                            {isPending ? (
                                <><Loader2 className="size-3.5 animate-spin" /> Creating account…</>
                            ) : "Create account"}
                        </button>
                    </form>
                </Form>

                {/* Terms note */}
                <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600 text-center leading-relaxed -mt-1">
                    By continuing you agree to Weave&apos;s{" "}
                    <span className="text-zinc-500 dark:text-zinc-500 underline underline-offset-2 cursor-pointer">Terms</span>
                    {" "}and{" "}
                    <span className="text-zinc-500 dark:text-zinc-500 underline underline-offset-2 cursor-pointer">Privacy Policy</span>
                </p>
            </div>

            {/* ── Footer link ─────────────────────────────────────────── */}
            <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-500">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-zinc-700 dark:text-zinc-300 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
