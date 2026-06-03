import Link from "next/link";
import { LayoutDashboard, Heart, BellRing, History, Settings, LogOut, ArrowLeft, TrendingUp, Building2, MapPin } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 flex flex-col sticky top-0 md:h-screen z-10 shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Painel</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Inquilino</p>
            <Link href="/dashboard/tenant" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <LayoutDashboard size={18} />
              Meu Radar
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Heart size={18} />
              Favoritos
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <History size={18} />
              Histórico de Visitas
            </a>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anunciante</p>
            <Link href="/dashboard/advertiser" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <TrendingUp size={18} />
              Meu Hub
            </Link>
          </div>

          <div className="space-y-1 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
            <p className="px-3 text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Administração</p>
            <Link href="/dashboard/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Settings size={18} />
              Visão Geral
            </Link>
            <Link href="/dashboard/admin/imoveis" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <Building2 size={18} />
              Imóveis
            </Link>
            <Link href="/dashboard/admin/locais" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
              <MapPin size={18} />
              Locais (POIs)
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tema IA</span>
            <ThemeToggle />
          </div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            Sair
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
