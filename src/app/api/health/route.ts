import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Criamos uma instância dedicada ou usamos a global
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Uma query minúscula apenas para manter o Pool do banco vivo
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "alive", timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
