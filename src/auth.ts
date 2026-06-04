import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Obrigatório para evitar o colapso do Edge Middleware
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Admin Access",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "admin@aluga.ai" && credentials?.password === "admin123") {
          const user = await prisma.user.findUnique({
            where: { email: "admin@aluga.ai" }
          });
          if (user) return user;
        }
        return null;
      }
    }),
  ]
});
