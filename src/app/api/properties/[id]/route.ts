import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    
    // Deleta do banco (no futuro, pode ser soft delete)
    await prisma.property.delete({
      where: { id }
    });

    // Limpa os caches da home e mapa (G61)
    revalidatePath('/');
    revalidatePath(`/imovel/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar imóvel' }, { status: 500 });
  }
}
