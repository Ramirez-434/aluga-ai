import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// G61: On-Demand ISR — limpa o cache de um imóvel editado instantaneamente
export async function POST(request: NextRequest) {
  try {
    const { id, secret } = await request.json();

    // Verificação de segurança simplificada
    if (secret !== process.env.REVALIDATION_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ message: 'ID do imóvel não informado' }, { status: 400 });
    }

    revalidatePath(`/imovel/${id}`);
    revalidatePath(`/`); // Limpa a home também (mapa)
    
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Erro ao revalidar' }, { status: 500 });
  }
}
