'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSession } from 'next-auth/react';
import { BellRing, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateRadarButton() {
  const { filters } = useFilterStore();
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<'idle' | 'success' | 'error'>('idle');

  // Verifica se há filtros ativos
  useEffect(() => {
    const hasActiveFilters = 
      filters.city || 
      filters.minBedrooms > 0 || 
      filters.maxPrice < 10000 || 
      filters.petFriendly || 
      filters.furnished;

    if (hasActiveFilters && status === 'authenticated') {
      setIsVisible(true);
      setStatusMsg('idle'); // Reset if filters change
    } else {
      setIsVisible(false);
    }
  }, [filters, status]);

  // Listener para o trigger global de criar radar (acionado pelo EmptyStateRadar)
  useEffect(() => {
    const handleTrigger = () => {
      if (isVisible && !isSubmitting && statusMsg !== 'success') {
        handleCreateRadar();
      }
    };
    window.addEventListener('trigger-radar', handleTrigger);
    return () => window.removeEventListener('trigger-radar', handleTrigger);
  }, [isVisible, isSubmitting, statusMsg]);

  const handleCreateRadar = async () => {
    setIsSubmitting(true);
    try {
      // 1. Tentar inscrever no Web Push primeiro
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          // Enviar subscription pro backend (se for nova)
          await fetch('/api/push/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // 2. Salvar o Radar (SavedSearch) na API
      const res = await fetch('/api/radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: filters.city || null,
          minBedrooms: filters.minBedrooms > 0 ? filters.minBedrooms : null,
          maxPrice: filters.maxPrice < 10000 ? filters.maxPrice : null,
          petFriendly: filters.petFriendly || null,
          furnished: filters.furnished || null,
        }),
      });

      if (res.ok) {
        setStatusMsg('success');
        setTimeout(() => setIsVisible(false), 3000); // Esconde após sucesso
      } else {
        setStatusMsg('error');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-sm"
        >
          <div className="bg-gray-900/90 dark:bg-black/90 backdrop-blur-lg border border-gray-800 dark:border-white/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-white font-bold text-sm leading-tight flex items-center gap-2">
                <BellRing size={16} className="text-indigo-400" />
                Modo Radar
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Avise-me sobre novos imóveis com esta busca.</p>
            </div>
            
            <button
              onClick={handleCreateRadar}
              disabled={isSubmitting || statusMsg === 'success'}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Salvando</>
              ) : statusMsg === 'success' ? (
                <><CheckCircle2 size={16} className="text-emerald-300" /> Radar Ativo</>
              ) : statusMsg === 'error' ? (
                <><AlertCircle size={16} className="text-red-300" /> Erro</>
              ) : (
                'Criar Alerta'
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
