import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      from: "no-reply@alugaai.com.br",
      // apiKey é injetada via variável de ambiente AUTH_RESEND_KEY (NextAuth v5)
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: `Acesse o Aluga AI em ${host}`,
            html: htmlTemplate({ url, host }),
          }),
        });

        if (!res.ok) {
          throw new Error("Resend error: " + await res.text());
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
});

function htmlTemplate({ url, host }: { url: string; host: string }) {
  return `
    <div style="background-color:#0a0a0a;color:#ffffff;font-family:Inter,Helvetica,sans-serif;padding:40px 20px;text-align:center;">
      <div style="max-width:500px;margin:0 auto;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px 20px;box-shadow:0 10px 40px rgba(0,0,0,0.5);backdrop-filter:blur(10px);">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(79,70,229,0.4);">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;line-height:48px;">A</h1>
        </div>
        <h2 style="font-size:24px;font-weight:800;margin-bottom:8px;color:#ffffff;">Aluga AI</h2>
        <p style="color:#a1a1aa;font-size:15px;margin-bottom:32px;">Seu link de acesso seguro está pronto.</p>
        <a href="${url}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-weight:700;font-size:16px;text-decoration:none;padding:16px 32px;border-radius:12px;box-shadow:0 4px 15px rgba(79,70,229,0.4);">
          Entrar na Plataforma
        </a>
        <p style="color:#52525b;font-size:13px;margin-top:32px;">Se você não solicitou este link, pode ignorar este e-mail.</p>
      </div>
    </div>
  `;
}
