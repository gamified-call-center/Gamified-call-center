import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "process";
import * as jwt from "jsonwebtoken";
import apiClient from "@/Utils/apiClient";

const authOptions: NextAuthOptions = {
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
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier;
        const otp = credentials?.otp;
        const payload: { email?: string; phone?: string; otp?: string } = {
          otp,
        };

        if (identifier?.includes("@")) {
          payload.email = identifier;
        } else {
          payload.phone = identifier;
        }
        try {
          const res = await apiClient.post(`${apiClient.URLS.otp}/verify`, {
            ...payload,
          });
          const { body } = res || {};
          const { existingUser, token } = body || {};

          if (res?.status === 201 && existingUser && token) {
            return { ...existingUser, token };
          } else {
            console.warn("Unexpected response structure or missing fields.");
            return null;
          }
        } catch (error) {
          console.error("Error in OTP verification:", error);
          return null;
        }
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

        const payload: { email?: string; phone?: string; password: string } = {
          password,
        };

        if (identifier.includes("@")) {
          payload.email = identifier;
        } else {
          payload.phone = identifier;
        }

        try {
          const res = await apiClient.post(
            `${apiClient.URLS.user}/login-user`,
            payload
          );

          const { body } = res || {};
          const { user, token } = body || {};

          if (res?.status === 201 && user && token) {
            return { ...user, token };
          } else {
            console.warn("Invalid credentials.");
            return null;
          }
        } catch (error) {
          console.error("Error in login:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ token, session }: any) {
      if (!token.user) {
        session.error = "Invalid Session";
        return session;
      }

      if (token?.userToken) {
        const decoded = jwt.decode(token.userToken) as any;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (decoded?.exp < currentTimestamp) {
          session.error = "Invalid Session";
          return session;
        }

        session.user = {
          id: token.user.id,
          username: token.user.username,
          email: token.user.email,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          phone: token.user.phone,
          role: token.user.role,
        };

        session.token = token.userToken;
      }

      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        const { password, token: userToken, ...safeUser } = user;

        token.user = {
          ...safeUser,
        };

        token.userToken = userToken;
      }
      return token;
    },
  },
  pages: {
    signOut: env.NEXTAUTH_URL,
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
