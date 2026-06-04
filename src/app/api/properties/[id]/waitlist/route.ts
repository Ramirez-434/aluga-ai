import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const WaitlistSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsedData = WaitlistSchema.parse(body);

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Criar o lead na fila de espera
    await prisma.waitlistLead.create({
      data: {
        propertyId: property.id,
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone || null,
      }
    });

    // CRM Hook Simulation
    console.log(`[CRM HOOK] Lead ${parsedData.email} entrou na fila de espera do imóvel ${property.id}.`);

    return NextResponse.json({ success: true, message: "Inscrito na fila de espera com sucesso" }, { status: 201 });
  } catch (error) {
    console.error("Waitlist API Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: "Você já está na nossa lista VIP!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
