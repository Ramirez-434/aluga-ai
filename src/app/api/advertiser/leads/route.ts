import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.role !== "ADVERTISER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Buscar todos os leads associados aos imóveis do anunciante logado
    const leads = await prisma.waitlistLead.findMany({
      where: {
        property: {
          ownerId: user.id
        }
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Leads Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
