'use client';

import { useEffect } from 'react';

// D41: Incrementa viewCount silenciosamente quando a página é carregada
export default function ViewCounter({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    // Dispara uma única vez por sessão (evita múltiplos hits por refresh)
    const key = `viewed_${propertyId}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, '1');
    fetch(`/api/properties/${propertyId}/view`, { method: 'PATCH' }).catch(() => {});
  }, [propertyId]);

  return null; // Componente invisível
}
