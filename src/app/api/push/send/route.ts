import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import webpush from "web-push";

const prisma = new PrismaClient();

webpush.setVapidDetails(
  "mailto:contato@alugaai.com.br",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscriptions: true }
  });

  if (!user || user.subscriptions.length === 0) {
    return NextResponse.json({ error: "No subscriptions found" }, { status: 404 });
  }

  const payload = JSON.stringify({
    title: title || "Novo Imóvel na sua Região!",
    body: body || "Um imóvel que combina com seus filtros acabou de ser publicado.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: "/favoritos" }
  });

  const sendPromises = user.subscriptions.map((sub) => {
    return webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      payload
    ).catch((err) => {
      console.error("Error sending push to endpoint:", sub.endpoint, err);
      // Automatically clean up stale subscriptions (HTTP 410 Gone)
      if (err.statusCode === 410) {
        return prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
      }
    });
  });

  await Promise.all(sendPromises);

  return NextResponse.json({ success: true });
}
