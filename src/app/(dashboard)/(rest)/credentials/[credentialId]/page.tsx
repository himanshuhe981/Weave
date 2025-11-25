import { requireAuth } from "@/lib/auth-utils";

interface Pageprops {
    params: Promise<{
        credentialId: string;
    }>
};


const Page = async({params}:Pageprops) => {
    await requireAuth();
    const { credentialId }=
    await params;
    return (
        <p>Credential id:{credentialId}</p>
    )
};

export default Page;