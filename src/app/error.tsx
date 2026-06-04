'use client'; // Error components devem ser Client Components

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Avisar o webhook do Discord
    fetch('/api/sre', {
      method: 'POST',
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context: 'ErrorBoundary (App Router)'
      })
    }).catch(() => console.error('Falha ao acionar webhook SRE.'));
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo saiu do roteiro.</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Nós interceptamos um erro de renderização e já disparamos um alerta para a equipe de SRE.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
