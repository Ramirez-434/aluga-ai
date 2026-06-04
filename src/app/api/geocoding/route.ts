import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/geocoding?q=termo
// Procura no banco de dados se alguém já pesquisou este termo antes
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    const cached = await prisma.geocodingCache.findUnique({
      where: { query: q.toLowerCase() }
    });

    if (cached) {
      return NextResponse.json({ lat: cached.lat, lng: cached.lng, cached: true });
    }

    return NextResponse.json({ cached: false }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/geocoding
// Salva um novo termo pesquisado pelo cliente no banco de dados
export async function POST(req: NextRequest) {
  try {
    const { query, lat, lng } = await req.json();

    if (!query || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const cached = await prisma.geocodingCache.upsert({
      where: { query: query.toLowerCase() },
      update: { lat, lng },
      create: { query: query.toLowerCase(), lat, lng }
    });

    return NextResponse.json({ success: true, data: cached });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
