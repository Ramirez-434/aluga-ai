import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { city, minBedrooms, maxPrice, petFriendly, furnished } = await req.json();

  // Create the saved search
  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      city: city || null,
      minBedrooms: minBedrooms ? parseInt(minBedrooms) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      petFriendly: petFriendly ?? null,
      furnished: furnished ?? null,
    }
  });

  return NextResponse.json({ success: true, savedSearch });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { savedSearches: { orderBy: { createdAt: 'desc' } } }
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ savedSearches: user.savedSearches });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await prisma.savedSearch.deleteMany({
    where: { id, user: { email: session.user.email } }
  });

  return NextResponse.json({ success: true });
}
