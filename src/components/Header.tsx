'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useFilterStore } from '@/store/useFilterStore';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface HeaderProps {
  propertiesCount?: number;
}

export default function Header({ propertiesCount = 0 }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { filters, setFilter } = useFilterStore();
  const { data: session } = useSession();

  // Header fica "flutuante" ao scrollar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // A busca textual é aplicada via city (busca por cidade)
  // Para busca por texto livre, usamos um campo custom no store
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value.trim().length > 0) {
      setFilter('city', value);
    } else {
      setFilter('city', null);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setFilter('city', null);
  };

  return (
    <header
      className={`flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 transition-all duration-300 min-h-[4rem] pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 ${
        scrolled
          ? 'glass border-b border-white/20 dark:border-white/10 shadow-sm'
          : 'bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-100 dark:border-white/5'
      }`}
    >
      {/* Logo — A8: Gradiente animado */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
          <span className="text-white font-black text-base leading-none animate-hue">A</span>
        </div>
        <h1 className="text-xl font-black tracking-tight hidden sm:block">
          Aluga{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-violet-600 text-transparent bg-clip-text">
            AI
          </span>
        </h1>
      </Link>

      {/* A10: Barra de Busca Global Funcional */}
      <div className="hidden md:flex flex-1 max-w-sm ml-6">
        <div className="relative w-full flex items-center group">
          <Search
            className="absolute left-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            size={17}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Gurupi, Natividade..."
            className="w-full bg-gray-100 dark:bg-white/5 border border-transparent rounded-full py-2.5 pl-10 pr-9 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-white/10 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Toggle Soberano (Residencial/Comercial) - Segmented Control via Framer Motion */}
      <div className="hidden lg:flex items-center p-1 bg-gray-100 dark:bg-black/50 rounded-full border border-gray-200 dark:border-white/10 mx-auto relative shadow-inner">
        {(['RESIDENTIAL', 'COMMERCIAL'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter('propertyCategory', mode)}
            className={`relative px-5 py-1.5 rounded-full text-xs font-bold transition-colors z-10 ${
              filters.propertyCategory === mode
                ? 'text-indigo-600 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {filters.propertyCategory === mode && (
              <motion.div
                layoutId="active-toggle"
                className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-full shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                style={{ zIndex: -1 }}
              />
            )}
            {mode === 'RESIDENTIAL' ? 'Residencial' : 'Comercial'}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />

        {/* A11: Bell com badge */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
          <Bell size={20} />
          {propertiesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black" />
          )}
        </button>

        {/* A12: Avatar do usuário ou link de login */}
        <Link
          href={session ? '/dashboard/tenant' : '/auth/login'}
          className="p-1 rounded-full hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all"
        >
          {session?.user?.image ? (
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-800">
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'Avatar'}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          ) : (
            <UserCircle size={28} className="text-gray-600 dark:text-gray-300" />
          )}
        </Link>
      </div>
    </header>
  );
}
