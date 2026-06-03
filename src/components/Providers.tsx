'use client';

import { SessionProvider } from 'next-auth/react';
import FavoritesSync from './FavoritesSync';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FavoritesSync />
      {children}
    </SessionProvider>
  );
}
