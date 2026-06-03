'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, BellRing, History, Settings, LogOut, ArrowLeft, TrendingUp, Building2, MapPin, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const TENANT_LINKS = [
  { href: "/dashboard/tenant",     label: "Meu Radar",          icon: LayoutDashboard },
  { href: "/favoritos",            label: "Favoritos",          icon: Heart },
  { href: "#",                     label: "Hist. de Visitas",   icon: History },
];

const ADVERTISER_LINKS = [
  { href: "/dashboard/advertiser", label: "Meu Hub",            icon: TrendingUp },
];

const ADMIN_LINKS = [
  { href: "/dashboard/admin",              label: "Visão Geral",   icon: Settings },
  { href: "/dashboard/admin/imoveis",      label: "Imóveis",       icon: Building2 },
  { href: "/dashboard/admin/locais",       label: "Locais (POIs)", icon: MapPin },
];

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
        active
          ? 'bg-gradient-to-r from-indigo-600/15 to-violet-600/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {/* F49: Barra lateral colorida no item ativo */}
      {active && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full" />
      )}
      <Icon size={17} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // F50: breadcrumb dinâmico
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/8 flex flex-col sticky top-0 md:h-screen z-10 shrink-0">
        
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <span className="text-white font-black text-sm leading-none">A</span>
          </div>
          <div>
            <span className="font-black text-base tracking-tight">Aluga AI</span>
            <p className="text-[10px] text-gray-400 font-medium -mt-0.5">Painel de Controle</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {/* Inquilino */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Inquilino</p>
            {TENANT_LINKS.map(link => (
              <NavItem key={link.href} {...link} active={pathname === link.href} />
            ))}
          </div>

          {/* Anunciante */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Anunciante</p>
            {ADVERTISER_LINKS.map(link => (
              <NavItem key={link.href} {...link} active={pathname === link.href} />
            ))}
          </div>

          {/* Admin */}
          <div className="space-y-1 pt-4 border-t border-gray-100 dark:border-white/8">
            <p className="px-3 text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Administração</p>
            {ADMIN_LINKS.map(link => (
              <NavItem key={link.href} {...link} active={pathname === link.href || pathname.startsWith(link.href + '/')} />
            ))}
          </div>
        </nav>

        {/* Footer do sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-white/8 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">
            <ArrowLeft size={17} />
            Voltar ao Site
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tema</span>
            <ThemeToggle />
          </div>
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium">
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* F50: Breadcrumb */}
        <div className="px-6 pt-5 pb-1 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-indigo-500 transition-colors">Início</Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight size={12} />
              {i === breadcrumbs.length - 1 ? (
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-indigo-500 transition-colors">{crumb.label}</Link>
              )}
            </span>
          ))}
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
