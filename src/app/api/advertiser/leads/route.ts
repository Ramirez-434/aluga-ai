import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/utils/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== 'ADVERTISER' && user.role !== 'ADMIN' && user.role !== 'BROKER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Buscar todos os leads da Fila de Espera para as propriedades cujo dono é o usuário atual
    // Para simplificar, estamos pegando as propriedades onde ownerId == user.id
    // Se o sistema usar a tabela Broker/Agency, a query seria mais complexa.
    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        title: true,
        waitlist: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Flatten a lista de leads
    const leads = properties.flatMap(prop => 
      prop.waitlist.map(lead => ({
        ...lead,
        propertyName: prop.title,
      }))
    );

    // Ordenar do mais recente para o mais antigo
    leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
