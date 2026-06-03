'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User, SlidersHorizontal } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';

const navItems = [
  { href: '/',                  icon: Home,            label: 'Início' },
  { href: '/busca',             icon: Search,          label: 'Buscar' },
  { href: '/favoritos',         icon: Heart,           label: 'Salvos' },
  { href: '/dashboard/tenant',  icon: User,            label: 'Perfil' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { hasActiveFilters, setDrawerOpen } = useFilterStore();

  // Hide on auth pages and admin
  if (pathname.startsWith('/auth') || pathname.startsWith('/dashboard/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className={`relative p-1 ${isActive ? 'bg-primary/10 rounded-lg' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {label === 'Salvos' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-primary' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Filter button — only on home */}
        {pathname === '/' && (
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-200 ${
              hasActiveFilters ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <div className={`relative p-1 ${hasActiveFilters ? 'bg-primary/10 rounded-lg' : ''}`}>
              <SlidersHorizontal size={22} strokeWidth={hasActiveFilters ? 2.5 : 1.8} />
              {hasActiveFilters && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
            <span className={`text-[10px] font-semibold tracking-wide ${hasActiveFilters ? 'text-primary' : ''}`}>
              Filtros
            </span>
          </button>
        )}
      </div>

      {/* Safe area spacer for notched phones */}
      <div className="h-safe-area-inset-bottom bg-white/95 dark:bg-[#0a0a0a]/95" />
    </nav>
  );
}
