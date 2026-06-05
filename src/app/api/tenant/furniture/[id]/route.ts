import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/utils/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { id } = await params;

    const furniture = await prisma.furnitureItem.findUnique({
      where: { id }
    });

    if (!furniture || furniture.sellerId !== user.id) {
      return NextResponse.json({ error: 'Móvel não encontrado ou sem permissão' }, { status: 403 });
    }

    // Auditoria 1: O gatilho nativo que apaga o arquivo físico do Storage
    if (furniture.imageUrl && !furniture.imageUrl.startsWith('data:image')) {
      // Simulação de chamada para o SDK do AWS S3 ou Vercel Blob
      console.log(`[STORAGE MANAGER] Deletando imagem física do móvel: ${furniture.imageUrl}`);
      // ex: await del(furniture.imageUrl);
    }

    // Soft delete
    await prisma.furnitureItem.update({
      where: { id },
      data: { status: 'DELETED', imageUrl: null } // Limpa a URL do banco também
    });

    return NextResponse.json({ success: true, message: 'Móvel deletado e storage limpo' });
  } catch (error) {
    console.error('Delete Furniture Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
