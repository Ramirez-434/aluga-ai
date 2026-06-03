'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFavoriteStore } from '@/store/useFavoriteStore';

export default function FavoritesSync() {
  const { status } = useSession();
  const { setFavorites } = useFavoriteStore();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/favorites')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFavorites(data.map(p => p.id));
          }
        })
        .catch(err => console.error('Failed to fetch favorites', err));
    } else if (status === 'unauthenticated') {
      setFavorites([]);
    }
  }, [status, setFavorites]);

  return null;
}
