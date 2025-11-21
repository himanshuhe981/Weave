import { RegisterForm } from "@/features/auth/componenets/register-form"
import { requireUnauth } from "@/lib/auth-utils";

const Page = async () =>{
    await requireUnauth();

    return (
        <div>
            <RegisterForm></RegisterForm>
        </div>
    )

}

export default Page;