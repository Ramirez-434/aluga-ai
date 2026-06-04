import { NextResponse } from 'next/server';
import { logToDiscord } from '@/utils/logger';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Constrói um objeto Error fake apenas para o logger
    const err = new Error(body.message || 'Erro não especificado no Frontend');
    err.stack = body.stack || '';

    await logToDiscord(err, { source: 'Frontend Boundary', context: body.context });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Falha no logger proxy' }, { status: 500 });
  }
}
