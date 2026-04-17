"use client";

import { motion } from "motion/react";
import { CheckCircle2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push("/workflows");
        }, 4500);
        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
            
            {/* Background elements to match aesthetics */}
            <div className="absolute inset-0 bg-black/[0.02] bg-[size:40px_40px]" style={{
                backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)"
            }}/>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center max-w-md p-8 bg-white/40 backdrop-blur-md rounded-3xl border border-black/5 shadow-2xl shadow-black/5"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="mb-6 rounded-full bg-emerald-100 p-4 shadow-sm shadow-emerald-200"
                >
                    <CheckCircle2Icon className="size-12 text-emerald-600" />
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2"
                >
                    Payment Successful
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-slate-600 mb-8 px-2 font-medium"
                >
                    Welcome to Pro! Your account is equipped with unlimited workflow access.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex flex-col items-center justify-center space-y-2 w-full"
                >
                    <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
                        <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                        <span>Redirecting to dashboard...</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
