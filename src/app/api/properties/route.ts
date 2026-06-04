import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { MOCK_POIS } from '@/data/mockPOIs';

const prisma = new PrismaClient();

// Fórmula de Haversine nativa para performance no Node.js
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

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
    const cursor     = searchParams.get('cursor')      || undefined;
    const limit      = searchParams.get('limit')       ? Number(searchParams.get('limit'))       : 10;

    // BBOX Coordinates (Prioridade sobre city)
    const n = searchParams.get('n') ? Number(searchParams.get('n')) : undefined;
    const s = searchParams.get('s') ? Number(searchParams.get('s')) : undefined;
    const e = searchParams.get('e') ? Number(searchParams.get('e')) : undefined;
    const w = searchParams.get('w') ? Number(searchParams.get('w')) : undefined;

    const hasBounds = n !== undefined && s !== undefined && e !== undefined && w !== undefined;
    const boundsWhere = hasBounds ? {
      lat: { gte: s, lte: n },
      lng: { gte: w, lte: e }
    } : {};

    // Gerar chave de cache baseada nos parâmetros da URL
    const cacheKey = `properties:feed:${req.nextUrl.search || 'default'}`;

    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
    }

    const properties = await prisma.property.findMany({
      take: limit + 1, // +1 para checar se há próxima página
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: {
        isActive: true,
        ...boundsWhere, // Geometria injetada
        ...(minPrice   !== undefined && { price:    { gte: minPrice } }),
        ...(maxPrice   !== undefined && { price:    { lte: maxPrice } }),
        ...(bedrooms   !== undefined && { bedrooms: { gte: bedrooms } }),
        ...(petFriendly !== undefined && { petFriendly }),
        ...(furnished  !== undefined && { furnished }),
        ...((!hasBounds && city !== undefined) ? { city } : {}), // City só é aplicado se BBOX não existir
      },
      orderBy: [
        { isPremium: 'desc' },
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
    });

    let nextCursor: string | null = null;
    if (properties.length > limit) {
      const nextItem = properties.pop();
      nextCursor = nextItem?.id ?? null;
    }

    // Injeção Matemática (Server-Side Haversine)
    const universities = MOCK_POIS.filter(p => p.category === 'university');
    
    const propertiesWithDistance = properties.map(p => {
      let minDistance = Infinity;
      let nearestUni = null;
      for (const uni of universities) {
        const d = getHaversineDistance(p.lat, p.lng, uni.lat, uni.lng);
        if (d < minDistance) {
          minDistance = d;
          nearestUni = { name: uni.name, distance: d };
        }
      }
      return { ...p, nearestUniversity: nearestUni };
    });

    const responsePayload = { properties: propertiesWithDistance, nextCursor };

    if (redis) {
      // Salva no cache com expiração de 60 segundos
      await redis.set(cacheKey, responsePayload, { ex: 60 });
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
