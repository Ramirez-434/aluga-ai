'use client'; // Error boundaries precisam ser Client Components

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Tenta avisar o backend via rota de log para o Discord
    fetch('/api/sre', {
      method: 'POST',
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context: 'GlobalError Boundary (Root)'
      })
    }).catch(() => console.error('Falha dupla no SRE.'));
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>🚨 Colapso Crítico do Sistema</h2>
          <p>Ocorreu uma falha na base da aplicação.</p>
          <p>Nossos engenheiros já foram notificados via radar.</p>
          <button
            onClick={() => reset()}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
          >
            Tentar Restaurar
          </button>
        </div>
      </body>
    </html>
  );
}
