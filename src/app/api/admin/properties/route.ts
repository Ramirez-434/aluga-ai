import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { z } from "zod";
import webpush from "web-push";
import { waitUntil } from "@vercel/functions";
import { revalidateTag } from "next/cache";

// Configuração do VAPID para disparos do Radar
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:contato@alugaai.com.br",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const propertySchema = z.object({
  title: z.string().min(5, "Título muito curto").max(100, "Título muito longo"),
  description: z.string().min(10, "Descrição muito curta").max(1000, "Descrição muito longa"),
  price: z.preprocess((val) => Number(val), z.number().positive("Preço deve ser maior que 0")),
  area: z.preprocess((val) => Number(val), z.number().positive("Área deve ser maior que 0")),
  bedrooms: z.preprocess((val) => Number(val), z.number().min(0, "Quartos não pode ser negativo")),
  bathrooms: z.preprocess((val) => Number(val), z.number().min(1, "Deve ter pelo menos 1 banheiro")),
  parkingSpots: z.preprocess((val) => Number(val), z.number().min(0, "Vagas não pode ser negativo").optional().default(0)),
  petFriendly: z.boolean().optional().default(false),
  furnished: z.boolean().optional().default(false),
  address: z.string().min(5, "Endereço inválido"),
  city: z.string().min(2, "Cidade inválida").optional().default("Gurupi"),
  neighborhood: z.string().min(2, "Bairro inválido"),
  lat: z.preprocess((val) => Number(val), z.number().min(-90).max(90).optional().default(-11.726)),
  lng: z.preprocess((val) => Number(val), z.number().min(-180).max(180).optional().default(-49.068)),
  featuredImage: z.union([z.literal(""), z.string().url("A URL da imagem é inválida")]).optional(),
  images: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Enforce RBAC
  if (user.role !== "ADMIN" && user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();

  try {
    // Validate payload with Zod
    const parsedData = propertySchema.parse(body);

    const property = await prisma.property.create({
      data: {
        title: parsedData.title,
        description: parsedData.description,
        price: parsedData.price,
        area: parsedData.area,
        bedrooms: parsedData.bedrooms,
        bathrooms: parsedData.bathrooms,
        parkingSpots: parsedData.parkingSpots,
        petFriendly: parsedData.petFriendly,
        furnished: parsedData.furnished,
        address: parsedData.address,
        city: parsedData.city,
        neighborhood: parsedData.neighborhood,
        lat: parsedData.lat,
        lng: parsedData.lng,
        featuredImage: parsedData.featuredImage || (parsedData.images?.[0]) || null,
        ownerId: user.id,
        images: parsedData.images && parsedData.images.length > 0 ? {
          create: parsedData.images.map((url, index) => ({
            url,
            order: index
          }))
        } : undefined,
      },
    });

    // Gatilho Event-Driven para o Modo Radar (Disparo Assíncrono com waitUntil)
    waitUntil(
      (async () => {
        try {
          const activeRadars = await prisma.savedSearch.findMany({
            where: {
              AND: [
                { OR: [{ city: property.city }, { city: null }] },
                { OR: [{ maxPrice: { gte: property.price } }, { maxPrice: null }] },
                { OR: [{ minBedrooms: { lte: property.bedrooms } }, { minBedrooms: null }] },
                property.petFriendly ? {} : { OR: [{ petFriendly: false }, { petFriendly: null }] },
                property.furnished ? {} : { OR: [{ furnished: false }, { furnished: null }] }
              ]
            },
            include: { user: { include: { subscriptions: true } } }
          });

          if (activeRadars.length > 0 && process.env.VAPID_PRIVATE_KEY) {
            const payload = JSON.stringify({
              title: "🔔 Radar Aluga AI",
              body: `Match perfeito! Novo imóvel em ${property.city} por R$ ${property.price.toLocaleString('pt-BR')} acabou de ser publicado.`,
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
              data: { url: `/imovel/${property.id}` }
            });

            const sendPromises: Promise<any>[] = [];
            
            for (const radar of activeRadars) {
              for (const sub of radar.user.subscriptions) {
                sendPromises.push(
                  webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                  ).catch(err => {
                    if (err.statusCode === 410) {
                      return prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                    }
                  })
                );
              }
            }
            await Promise.all(sendPromises);
            console.log(`[Radar] Push notifications enviadas para ${sendPromises.length} devices.`);
          }
        } catch (err) {
          console.error("[Radar] Erro na varredura de matching:", err);
        }
      })()
    );

    // G61: On-Demand ISR revalidate
    // @ts-expect-error Next.js 16 typings bug
    revalidateTag('properties');

    return NextResponse.json({ success: true, property });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Error creating property:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
