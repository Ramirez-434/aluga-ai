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

    // Apenas os dados que o Leaflet precisa
    const properties = await prisma.property.findMany({
      where: {
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

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching map properties:", error);
    return NextResponse.json({ error: "Failed to fetch map properties" }, { status: 500 });
  }
}
