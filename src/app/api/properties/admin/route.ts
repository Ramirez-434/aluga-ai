import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor');
  const limit = 10;
  const search = url.searchParams.get('search') || '';

  const user = await prisma.user.findUnique({ where: { email: token.email as string } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (user.role === 'ADVERTISER') {
      whereClause.ownerId = user.id;
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      take: limit + 1, // Pega um a mais para saber se tem próxima página
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Pula o próprio cursor
      }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        basePrice: true,
        bedrooms: true,
        areaUseful: true,
        address: true,
        featuredImage: true,
        viewCount: true,
      }
    });

    let nextCursor = null;
    if (properties.length > limit) {
      const nextItem = properties.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      properties,
      nextCursor
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar propriedades' }, { status: 500 });
  }
}
