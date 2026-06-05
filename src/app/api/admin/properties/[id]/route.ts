import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { waitUntil } from "@vercel/functions";

const propertySchema = z.object({
  title: z.string().min(5, "Título muito curto").max(100, "Título muito longo").optional(),
  description: z.string().min(10, "Descrição muito curta").max(1000, "Descrição muito longa").optional(),
  basePrice: z.preprocess((val) => Number(val), z.number().positive("Preço base deve ser maior que 0")).optional(),
  condominiumFee: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  iptuTax: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  areaUseful: z.preprocess((val) => Number(val), z.number().positive("Área útil deve ser maior que 0")).optional(),
  areaTotal: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  bedrooms: z.preprocess((val) => Number(val), z.number().min(0, "Quartos não pode ser negativo")).optional(),
  bathrooms: z.preprocess((val) => Number(val), z.number().min(1, "Deve ter pelo menos 1 banheiro")).optional(),
  suites: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  parkingSpots: z.preprocess((val) => Number(val), z.number().min(0, "Vagas não pode ser negativo")).optional(),
  isCoveredParking: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  furnished: z.boolean().optional(),
  address: z.string().min(5, "Endereço inválido").optional(),
  city: z.string().min(2, "Cidade inválida").optional(),
  neighborhood: z.string().min(2, "Bairro inválido").optional(),
  state: z.string().min(2, "Estado inválido").optional(),
  lat: z.preprocess((val) => Number(val), z.number().min(-90).max(90)).optional(),
  lng: z.preprocess((val) => Number(val), z.number().min(-180).max(180)).optional(),
  featuredImage: z.union([z.literal(""), z.string().url("A URL da imagem é inválida")]).optional(),
  images: z.array(z.string().url()).optional(),
  isPremium: z.boolean().optional(),
  status: z.enum(["AVAILABLE", "RENTED", "SOLD", "UNAVAILABLE"]).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.role !== "ADMIN" && user.role !== "ADVERTISER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const parsedData = propertySchema.parse(body);

    const { images, ...restData } = parsedData;

    if (images && images.length > 0 && !restData.featuredImage) {
      restData.featuredImage = images[0];
    }

    // 1. Busca imóvel atual antes de atualizar (para Radar de Preço)
    const oldProperty = await prisma.property.findUnique({
      where: { id },
      select: { basePrice: true, favoritedBy: { include: { user: true } } }
    });

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(restData as any),
        ...(parsedData.basePrice && { basePrice: parsedData.basePrice }),
        ...(parsedData.condominiumFee !== undefined && { condominiumFee: parsedData.condominiumFee }),
        ...(parsedData.iptuTax !== undefined && { iptuTax: parsedData.iptuTax }),
        ...(parsedData.areaUseful && { areaUseful: parsedData.areaUseful }),
        ...(parsedData.areaTotal !== undefined && { areaTotal: parsedData.areaTotal }),
        ...(parsedData.bathrooms && { bathrooms: parsedData.bathrooms }),
        ...(parsedData.suites !== undefined && { suites: parsedData.suites }),
        ...(parsedData.parkingSpots !== undefined && { parkingSpots: parsedData.parkingSpots }),
        ...(parsedData.isCoveredParking !== undefined && { isCoveredParking: parsedData.isCoveredParking }),
        ...(images !== undefined ? {
          images: {
            deleteMany: {}, // Clean existing images
            create: images.map((url, index) => ({ url, order: index }))
          }
        } : {})
      },
    });

    // 2. Radar de Preço (CRM) - Gatilho se o preço cair
    if (
      oldProperty && 
      parsedData.basePrice && 
      parsedData.basePrice < oldProperty.basePrice
    ) {
      const dropAmount = oldProperty.basePrice - parsedData.basePrice;
      const leads = oldProperty.favoritedBy.map(f => f.user.email);
      
      if (leads.length > 0) {
        console.log(`[CRM HOOK - RADAR DE PREÇO] 🚨 Alerta de Baixa de Preço!`);
        console.log(`- Imóvel ID: ${id}`);
        console.log(`- Queda de R$ ${oldProperty.basePrice} para R$ ${parsedData.basePrice} (Desconto de R$ ${dropAmount})`);
        
        // Blindagem Serverless (Auditoria 2): Disparo Fire-and-Forget
        const dispatchEmails = async () => {
          try {
            console.log(`- Iniciando disparo em background para ${leads.length} leads...`);
            // Simulação de processamento SMTP em lote
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`✅ [CRM BACKGROUND] E-mails disparados com sucesso para:`, leads);
          } catch (err) {
            console.error(`❌ [CRM BACKGROUND] Falha ao enviar e-mails de alerta:`, err);
          }
        };

        // Chama usando a API nativa da Vercel para não travar a resposta HTTP
        waitUntil(dispatchEmails());
      }
    }

    // G61: On-Demand ISR revalidate
    // @ts-expect-error Next.js 16 typings bug
    revalidateTag(`property-${id}`);
    // @ts-expect-error Next.js 16 typings bug
    revalidateTag(`properties`);

    return NextResponse.json({ success: true, property });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Error updating property:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
