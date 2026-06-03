import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// D41: Incrementar viewCount com Debounce/Batch via Redis
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (redis) {
      // 1. Incrementa no Redis
      const newCount = await redis.incr(`property_views:${id}`);
      
      // 2. Faz flush pro banco a cada 5 views para não gargalar o Postgres
      if (newCount % 5 === 0) {
        await prisma.$transaction([
          prisma.property.update({
            where: { id },
            data: { viewCount: { increment: 5 } },
          }),
          prisma.propertyDailyStat.upsert({
            where: { propertyId_date: { propertyId: id, date: today } },
            update: { views: { increment: 5 } },
            create: { propertyId: id, date: today, views: 5 },
          })
        ]);
      }
    } else {
      // Fallback sem Redis: grava direto no banco (não recomendado em alta escala)
      await prisma.$transaction([
        prisma.property.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        }),
        prisma.propertyDailyStat.upsert({
          where: { propertyId_date: { propertyId: id, date: today } },
          update: { views: { increment: 1 } },
          create: { propertyId: id, date: today, views: 1 },
        })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch {
    // Silently fail — não deve bloquear o carregamento da página
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
