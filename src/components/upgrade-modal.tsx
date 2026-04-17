"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,


} from "@/components/ui/alert-dialog";

import {authClient} from "@/lib/auth-client";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const UpgradeModal = ({
    open,
    onOpenChange
}: UpgradeModalProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Upgrade to Pro
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You need an active subscription to perform this action. Upgrade to Pro to unlock all the features.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                    onClick={async () => {
                        const session = await authClient.getSession();
                        const res = await authClient.checkout({
                            slug: "pro",
                            redirect: false
                        } as any);

                        if (res.data?.url) {
                            const url = new URL(res.data.url);
                            if (session.data?.user?.email) {
                                url.searchParams.set("customer_email", session.data.user.email);
                            }
                            if (session.data?.user?.name) {
                                url.searchParams.set("customer_name", session.data.user.name);
                            }
                            window.location.href = url.toString();
                        }
                    }}
                    >
                        Upgrade Now
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
};
