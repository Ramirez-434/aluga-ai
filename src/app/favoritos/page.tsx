import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import PropertyCard from "@/components/PropertyCard";
import { HeartCrack } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function FavoritesPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  if (!user) {
    redirect("/auth/login");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24">
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-16 flex items-center sticky top-0 z-40">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Meus Favoritos</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <HeartCrack size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Os imóveis que você curtir aparecerão aqui para fácil acesso.
            </p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
            >
              Explorar Imóveis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <PropertyCard key={fav.id} property={fav.property as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
