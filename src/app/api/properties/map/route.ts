import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Parse optional query string filters
    const minPrice   = searchParams.get('minPrice')    ? Number(searchParams.get('minPrice'))    : undefined;
    const maxPrice   = searchParams.get('maxPrice')    ? Number(searchParams.get('maxPrice'))    : undefined;
    const bedrooms   = searchParams.get('bedrooms')    ? Number(searchParams.get('bedrooms'))    : undefined;
    const petFriendly = searchParams.get('petFriendly') === 'true'  ? true
                      : searchParams.get('petFriendly') === 'false' ? false
                      : undefined;
    const furnished  = searchParams.get('furnished')   === 'true'  ? true
                      : searchParams.get('furnished')   === 'false' ? false
                      : undefined;
    const city       = searchParams.get('city')        || undefined;
    
    // BBOX Coordinates
    const n = searchParams.get('n') ? Number(searchParams.get('n')) : undefined;
    const s = searchParams.get('s') ? Number(searchParams.get('s')) : undefined;
    const e = searchParams.get('e') ? Number(searchParams.get('e')) : undefined;
    const w = searchParams.get('w') ? Number(searchParams.get('w')) : undefined;

    // Gerar chave de cache baseada nos parâmetros da URL
    const cacheKey = `properties:map:${req.nextUrl.search || 'default'}`;

    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
    }

    const boundsWhere = (n !== undefined && s !== undefined && e !== undefined && w !== undefined) ? {
      lat: { gte: s, lte: n },
      lng: { gte: w, lte: e }
    } : {};

    // Apenas os dados que o Leaflet precisa
    const properties = await prisma.property.findMany({
      where: {
        isActive: true,
        ...boundsWhere,
        ...(minPrice   !== undefined && { price:    { gte: minPrice } }),
        ...(maxPrice   !== undefined && { price:    { lte: maxPrice } }),
        ...(bedrooms   !== undefined && { bedrooms: { gte: bedrooms } }),
        ...(petFriendly !== undefined && { petFriendly }),
        ...(furnished  !== undefined && { furnished }),
        ...(city       !== undefined && { city }),
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        price: true,
        isPremium: true,
        createdAt: true,
        title: true,
        bedrooms: true,
        area: true,
        featuredImage: true,
      },
    });

    if (redis) {
      // Salva no cache com expiração de 60 segundos
      await redis.set(cacheKey, properties, { ex: 60 });
    }

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching map properties:", error);
    return NextResponse.json({ error: "Failed to fetch map properties" }, { status: 500 });
  }
}
