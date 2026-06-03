import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const history = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Pega apenas as últimas 20 mensagens para context
    });

    const messages = history.map(h => ({
      id: h.id,
      role: h.role as 'user' | 'assistant' | 'system',
      content: h.content,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
