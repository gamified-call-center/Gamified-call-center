import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import * as jwt from "jsonwebtoken";
import apiClient from "@/Utils/apiClient";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Email or Phone Login",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const identifier = credentials?.identifier;
        const password = credentials?.password;

        if (!identifier || !password) return null;

        const payload = {
          email: identifier,
          password,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          console.log("Non-JSON backend response:", text);
          return null;
        }

        if (!res.ok) {
          console.log("Login failed:", res.status, data);
          return null;
        }

        const user = data?.user ?? data?.body?.user;
        const token =
          data?.accessToken ??
          data?.token ??
          data?.body?.accessToken ??
          data?.body?.token;

        if (!user || !token) {
          console.log("Unexpected login success shape:", data);
          return null;
        }

        return { ...user, token };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const { token: userToken, password, ...safeUser } = user as any;
        token.user = safeUser;
        token.userToken = userToken;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (!token?.user) {
        session.error = "Invalid Session";
        return session;
      }

      if (token?.userToken) {
        const decoded = jwt.decode(token.userToken) as any;
        const now = Math.floor(Date.now() / 1000);

        if (decoded?.exp && decoded.exp < now) {
          session.error = "Invalid Session";
          return session;
        }
        session.user = {
          ...token.user,
        };
        session.token = token.userToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
