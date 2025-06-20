/* eslint-disable @typescript-eslint/no-unused-vars */

import NextAuth, { NextAuthOptions } from "next-auth";
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

const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                verifyPassword: { label: "VerifyPassword", type: "password" },
                authType: { label: "AuthType", type: "text" },
            },
            async authorize(credentials) {
                // The authorize function is for validating credentials and creating a session,
                // not for getting an existing one. The incorrect call to getSession is removed.
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    let auth = null;
                    if (credentials.authType === 'signin' && credentials.verifyPassword) {
                        auth = await createAccount(credentials.email, credentials.password, credentials.verifyPassword);
                    } else {
                        auth = await login(credentials.email, credentials.password);
                    }

                    if (auth && auth.Token) {
                        return {
                            id: auth.UserId ? String(auth.UserId) : credentials.email,
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
        async jwt({ token, user }) {
            if (user) {
                token.backendToken = user.backendToken;
                token.userId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.backendToken = String(token.backendToken);
                session.userId = String(token.userId);
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
