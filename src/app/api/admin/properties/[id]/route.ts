import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const propertySchema = z.object({
  title: z.string().min(5, "Título muito curto").max(100, "Título muito longo").optional(),
  description: z.string().min(10, "Descrição muito curta").max(1000, "Descrição muito longa").optional(),
  price: z.preprocess((val) => Number(val), z.number().positive("Preço deve ser maior que 0")).optional(),
  area: z.preprocess((val) => Number(val), z.number().positive("Área deve ser maior que 0")).optional(),
  bedrooms: z.preprocess((val) => Number(val), z.number().min(0, "Quartos não pode ser negativo")).optional(),
  bathrooms: z.preprocess((val) => Number(val), z.number().min(1, "Deve ter pelo menos 1 banheiro")).optional(),
  parkingSpots: z.preprocess((val) => Number(val), z.number().min(0, "Vagas não pode ser negativo")).optional(),
  petFriendly: z.boolean().optional(),
  furnished: z.boolean().optional(),
  address: z.string().min(5, "Endereço inválido").optional(),
  city: z.string().min(2, "Cidade inválida").optional(),
  neighborhood: z.string().min(2, "Bairro inválido").optional(),
  lat: z.preprocess((val) => Number(val), z.number().min(-90).max(90)).optional(),
  lng: z.preprocess((val) => Number(val), z.number().min(-180).max(180)).optional(),
  featuredImage: z.union([z.literal(""), z.string().url("A URL da imagem é inválida")]).optional(),
  images: z.array(z.string().url()).optional(),
  isPremium: z.boolean().optional(),
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

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(restData as any),
        ...(images !== undefined ? {
          images: {
            deleteMany: {}, // Clean existing images
            create: images.map((url, index) => ({ url, order: index }))
          }
        } : {})
      },
    });

    // G61: On-Demand ISR revalidate
    revalidatePath(`/imovel/${id}`);
    revalidatePath(`/`);

    return NextResponse.json({ success: true, property });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Error updating property:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
