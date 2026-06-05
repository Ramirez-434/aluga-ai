import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/utils/prisma';
import { z } from 'zod';

const FurnitureSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const parsedData = FurnitureSchema.parse(body);

    const furniture = await prisma.furnitureItem.create({
      data: {
        sellerId: user.id,
        title: parsedData.title,
        description: parsedData.description || '',
        price: parsedData.price,
        imageUrl: parsedData.imageUrl,
        status: 'AVAILABLE'
      }
    });

    return NextResponse.json({ success: true, furniture }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const furniture = await prisma.furnitureItem.findMany({
      where: { sellerId: user.id, status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ furniture });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
