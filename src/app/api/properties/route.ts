import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const properties = await prisma.property.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        ...(minPrice   !== undefined && { price:    { gte: minPrice } }),
        ...(maxPrice   !== undefined && { price:    { lte: maxPrice } }),
        ...(bedrooms   !== undefined && { bedrooms: { gte: bedrooms } }),
        ...(petFriendly !== undefined && { petFriendly }),
        ...(furnished  !== undefined && { furnished }),
        ...(city       !== undefined && { city }),
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

    return NextResponse.json({ properties, nextCursor });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
