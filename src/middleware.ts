import { NextResponse } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// O NextAuth encapsula o middleware e já chama o callback 'authorized' de authConfig
const { auth } = NextAuth(authConfig);

// Inicializa o Redis apenas se as variáveis de ambiente estiverem presentes
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiter via Upstash (20 req / 1 minuto)
const upstashRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
    })
  : null;

// Fallback em memória para desenvolvimento local
const fallbackRateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkFallbackRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = fallbackRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    fallbackRateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// O export default auth(...) garante que o NextAuth avalie a sessão e os callbacks
export default auth(async (request) => {
  const { pathname } = request.nextUrl;

  // Rate limiting na rota /api/chat
  if (pathname.startsWith('/api/chat')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    
    if (upstashRateLimit) {
      const { success } = await upstashRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Muitas requisições. Aguarde 1 minuto.' }, { status: 429 });
      }
    } else {
      // Fallback
      if (!checkFallbackRateLimit(ip)) {
        return NextResponse.json({ error: 'Muitas requisições. Aguarde 1 minuto.' }, { status: 429 });
      }
    }
  }

  // A proteção da rota /dashboard/admin já é gerenciada pelo callback "authorized" no auth.config.ts
  return NextResponse.next();
});

export const config = {
  // Ignora rotas estáticas e imagens, processando apenas navegações dinâmicas e API
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
