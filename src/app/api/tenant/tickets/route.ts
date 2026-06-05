import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/utils/prisma';
import { z } from 'zod';

const TicketSchema = z.object({
  propertyId: z.string().uuid("ID do imóvel inválido").or(z.string().cuid()),
  category: z.string().min(2, "Categoria obrigatória"),
  description: z.string().min(10, "Detalhe o problema com no mínimo 10 caracteres"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const parsedData = TicketSchema.parse(body);

    // Auditoria 2: Impede que o mesmo inquilino abra vários chamados ABERTOS para a mesma categoria no mesmo imóvel
    const existingTicket = await prisma.maintenanceTicket.findFirst({
      where: {
        tenantId: user.id,
        propertyId: parsedData.propertyId,
        category: parsedData.category,
        status: 'OPEN'
      }
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: `Você já possui um chamado aberto para '${parsedData.category}'. Por favor, aguarde o atendimento antes de abrir um novo.` },
        { status: 429 } // Too Many Requests / Conflict
      );
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        tenantId: user.id,
        propertyId: parsedData.propertyId,
        category: parsedData.category,
        description: parsedData.description,
        status: 'OPEN'
      }
    });

    // Simulando Notificação Instantânea para o Proprietário
    console.log(`[CRM TICKETING] Novo chamado ${ticket.id} aberto para ${parsedData.category}`);

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error('Ticket Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const tickets = await prisma.maintenanceTicket.findMany({
      where: { tenantId: user.id },
      include: { property: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
