import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import prisma from "./db";
import {checkout,portal,polar} from "@polar-sh/better-auth"
import { polarClient } from "./polar";


export const auth = betterAuth({

    // / --- ADDED THIS SECTION TO FIX VERCEL 403 ERRORS ---
    baseURL: process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_URL}`,
    trustedOrigins: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [],
    // --------------------------------------------------

    database: prismaAdapter(prisma,{
        provider:"postgresql",
    }),
    emailAndPassword:{
        enabled:true,
        autoSignIn:true,
    },
     socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
     },
    plugins:[
        polar({
            client:polarClient,
            createCustomerOnSignUp:true,
            use: [
                checkout({
                    products: [
                        {
                            productId:"5c038e1f-c9b8-4d7c-a656-f37e6219da9b",
                            slug:"pro",
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true,
                }),
                portal(),
            ],
        })
    ]
});