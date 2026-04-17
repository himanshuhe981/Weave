import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const startProCheckout = async () => {
    try {
        const [session, res] = await Promise.all([
            authClient.getSession(),
            authClient.checkout({ slug: "pro", redirect: false } as any),
        ]);
        
        if (!res.data?.url) {
            toast.error("Unable to start checkout. Please try again.");
            return;
        }

        const url = new URL(res.data.url);
        const user = session.data?.user;
        
        if (user?.email) {
            url.searchParams.set("customer_email", user.email);
        }
        if (user?.name) {
            url.searchParams.set("customer_name", user.name);
        }
        
        window.location.href = url.toString();
    } catch (err) {
        console.error("Checkout failed", err);
        toast.error("Checkout failed. Please try again.");
    }
};
