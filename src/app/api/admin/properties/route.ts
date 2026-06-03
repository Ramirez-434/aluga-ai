import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Uncomment to enforce roles if needed in production
  // if (user.role !== "ADMIN" && user.role !== "ADVERTISER") {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  const body = await req.json();

  try {
    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price),
        area: parseFloat(body.area),
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms || "1"),
        parkingSpots: parseInt(body.parkingSpots || "0"),
        petFriendly: Boolean(body.petFriendly),
        furnished: Boolean(body.furnished),
        address: body.address,
        city: body.city || "Gurupi",
        neighborhood: body.neighborhood,
        lat: parseFloat(body.lat || "-11.726"),
        lng: parseFloat(body.lng || "-49.068"),
        featuredImage: body.featuredImage || null,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ success: true, property });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
