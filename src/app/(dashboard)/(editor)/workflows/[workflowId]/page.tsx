import { requireAuth } from "@/lib/auth-utils";

interface Pageprops {
    params: Promise<{
        workflowId: string;
    }>
};


const Page = async({params}:Pageprops) => {
    await requireAuth();
    const { workflowId }=
    await params;
    return (
        <p>Workflow id:{workflowId}</p>
    )
};

export default Page;