/* eslint-disable @typescript-eslint/no-unused-vars */

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAccount, login } from "@/lib/api";

declare module "next-auth" {
    interface User {
        backendToken?: string;
        id?: string;
    }
    interface Session {
        backendToken?: string;
        userId?: string;
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                authType: { label: "AuthType", type: "text" }, 
            },
            async authorize(credentials) {
                console.log("inside authorize")
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    let auth = null;
                    if(credentials.authType == 'signin'){
                        auth = await createAccount(credentials.email, credentials.password, credentials.password);
                    }else{
                        auth = await login(credentials.email, credentials.password);
                    }
                    if (auth && auth.Token) {
                        // Ensure the returned object matches the User type
                        return {
                            id: auth.UserId ? String(auth.UserId) : credentials.email, // fallback to email if UserId is missing
                            email: credentials.email,
                            backendToken: auth.Token,
                        };
                    }
                    return null;
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log("inside singIn")
            if (account?.provider === "google") {
                // try {
                //     // Use login from api.ts for Google login
                //     const auth = await login();
                //     if (!auth?.Token) return false;
                //     user.backendToken = auth.Token;
                //     return true;
                // } catch (error) {
                //     console.error("Error communicating with Go backend:", error);
                //     return false;
                // }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.backendToken = user.backendToken;
                token.userId = user.id
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.backendToken = String(token.backendToken);
                session.userId = String(token.userId)
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
