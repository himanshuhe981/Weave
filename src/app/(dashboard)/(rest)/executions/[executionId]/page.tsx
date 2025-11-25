import { requireAuth } from "@/lib/auth-utils";

interface Pageprops {
    params: Promise<{
        executionId: string;
    }>
};


const Page = async({params}:Pageprops) => {
    await requireAuth();
    const { executionId }=
    await params;
    return (
        <p>Execution id:{executionId}</p>
    )
};

export default Page;