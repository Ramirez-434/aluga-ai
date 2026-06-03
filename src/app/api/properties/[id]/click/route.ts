import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // D41/I50: Incrementa leads diários (cliques no WhatsApp)
    await prisma.propertyDailyStat.upsert({
      where: { propertyId_date: { propertyId: id, date: today } },
      update: { clicks: { increment: 1 } },
      create: { propertyId: id, date: today, clicks: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao rastrear clique:", error);
    // Silently fail para não atrapalhar o usuário
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
