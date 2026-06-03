import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { property: true },
  });

  return NextResponse.json(favorites.map(f => f.property));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await req.json();
  if (!propertyId) return NextResponse.json({ error: "Property ID required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        propertyId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Unique constraint violation means it's already favorited
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { propertyId } = await req.json();
  if (!propertyId) return NextResponse.json({ error: "Property ID required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      propertyId,
    },
  });

  return NextResponse.json({ success: true });
}
