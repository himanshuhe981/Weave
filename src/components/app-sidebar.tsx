"use client"

import { CreditCardIcon, FolderOpenIcon, HistoryIcon, KeyIcon, LogOutIcon,  StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname,  useRouter } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription"
import { useWorkflowUsage } from "@/features/workflows/hooks/use-workflows"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"


const menuItems = [
    {
        title: "Main",
        items: [
            {
                title:"Workflows",
                icon:FolderOpenIcon,
                url:"/workflows"
            },
            {
                title:"Credentials",
                icon:KeyIcon,
                url:"/credentials"
            },
            {
                title:"Executions",
                icon:HistoryIcon,
                url:"/executions"
            },
        ],
    }
];

export const AppSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const {hasActiveSubscription,isLoading} = useHasActiveSubscription();
    const { data: usage, isLoading: isUsageLoading } = useWorkflowUsage();
    return (
        <Sidebar collapsible="icon">
        <SidebarHeader>
            <SidebarMenuItem>
                <SidebarMenuButton asChild className="gap-x-4">
                    <Link href={"/"} prefetch>
                    <Image src={"/logos/logo2.svg"} alt="Weave" width={30} height={30}/>
                    <span className="font-semibold text-sm">
                       Weave 
                    </span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group)=>(
                    <SidebarGroup key={group.title}>                      
                        <SidebarGroupContent>
                            <SidebarMenu>
                            {group.items.map((item)=>(
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={
                                            item.url === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(item.url)
                                        }
                                        asChild
                                        className="gap-x-4 h-10 px-4"
                                    >
                                        <Link href={item.url} prefetch>
                                            <item.icon className="size-4"/>
                                            <span>{item.title}</span>
                                        </Link>

                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
                
                {/* Usage Widget */}
                <SidebarGroup className="mt-auto mb-2 group-data-[collapsible=icon]:hidden">
                    <SidebarGroupContent>
                        {!isUsageLoading && !isLoading && (
                            <div className="px-4 py-3 bg-black/5 mx-2 rounded-xl border border-black/10 backdrop-blur-sm space-y-2">
                                {hasActiveSubscription ? (
                                    <>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-black/70">Plan</span>
                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase font-bold py-0.5 px-2">Pro</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-black/60">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-medium tracking-wide uppercase">Unlimited Access</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-black/70">Credits</span>
                                            <span className="text-xs font-medium text-black/80">{usage?.count || 0} / {usage?.limit || 5}</span>
                                        </div>
                                        <Progress value={Math.min(((usage?.count || 0) / (usage?.limit || 5)) * 100, 100)} className="h-1.5 bg-black/10" />
                                        <p className="text-[10px] text-black/50 font-medium mt-1 uppercase tracking-wide">
                                            {(usage?.count || 0) >= (usage?.limit || 5) ? 'Upgrade Required' : `${(usage?.limit || 5) - (usage?.count || 0)} Remaining`}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Collapsed Pro Indicator */}
                {hasActiveSubscription && !isLoading && (
                    <SidebarGroup className="mt-auto mb-2 hidden group-data-[collapsible=icon]:block">
                        <SidebarGroupContent>
                            <div className="flex h-10 w-full items-center justify-center p-2 mb-4" title="Pro Member">
                                <StarIcon className="size-6 text-amber-500 fill-amber-500" />
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {!hasActiveSubscription && !isLoading && (
                    <SidebarMenuItem>
                        <SidebarMenuButton
                        tooltip={"Upgrade to Pro"}
                        className="gap-x-4 h-10 px-4"
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
                            <StarIcon className="h-4 w-4"/>
                            <span>Upgrade to Pro</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                        tooltip={"Billing Portal"}
                        className="gap-x-4 h-10 px-4"
                        onClick={()=>authClient.customer.portal()}
                        >
                            <CreditCardIcon className="h-4 w-4"/>
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                        tooltip={"Sign out"}
                        className="gap-x-4 h-10 px-4"
                        onClick={()=> authClient.signOut({
                            fetchOptions:{
                                onSuccess:()=>{
                                    router.push("/");
                                },
                            },
                        })}
                        >
                            <LogOutIcon className="h-4 w-4"/>
                            <span>Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
