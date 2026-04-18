import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAuth } from "@/lib/auth-utils";

// weave-bg is NOT applied here — it's applied per child layout
// so the editor doesn't get the wave background over React Flow
const Layout = async ({ children }: { children: React.ReactNode }) => {
    await requireAuth();
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;