import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import prisma from "./db";
import {checkout,portal,polar} from "@polar-sh/better-auth"
import { polarClient } from "./polar";


export const auth = betterAuth({
    database: prismaAdapter(prisma,{
        provider:"postgresql",
    }),
    emailAndPassword:{
        enabled:true,
        autoSignIn:true,
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