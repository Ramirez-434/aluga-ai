'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import FavoritesSync from './FavoritesSync';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <FavoritesSync />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
