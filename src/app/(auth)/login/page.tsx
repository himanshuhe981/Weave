import { LoginForm } from "@/features/auth/components/login-form";
import { requireAuth, requireUnauth } from "@/lib/auth-utils";

 const Page = async () => {
    await requireUnauth();

    return (

        <div>
            <LoginForm/>
        </div>
    )

 };

 export default Page;