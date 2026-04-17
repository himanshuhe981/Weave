import AuthLayout from "@/features/auth/componenets/auth-layout";
import { requireUnauth } from "@/lib/auth-utils";

const Layout = async ({children}:{children: React.ReactNode;}) => {
    await requireUnauth();
    return (
        <AuthLayout>
            {children}
        </AuthLayout>
    )
}

export default Layout;