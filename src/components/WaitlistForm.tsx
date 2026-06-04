'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, BellRing, User, Mail, Phone } from 'lucide-react';

export default function WaitlistForm({ propertyId }: { propertyId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/properties/${propertyId}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Falha ao registrar fila de espera');
      
      setIsSuccess(true);
      toast.success('Você entrou na fila de espera!');
    } catch (error) {
      toast.error('Erro ao entrar na fila de espera. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-center">
        <BellRing size={32} className="mx-auto mb-3 text-emerald-500" />
        <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Você está na fila!</h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mt-1">Avisaremos você assim que este imóvel ficar disponível.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Fila de Espera</h3>
        <p className="text-xs text-gray-500 mt-1">Seja o primeiro a saber quando este imóvel vagar.</p>
      </div>

      <div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            required name="name" type="text" placeholder="Seu Nome"
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>
      </div>
      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            required name="email" type="email" placeholder="Seu E-mail"
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>
      </div>
      <div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            name="phone" type="tel" placeholder="WhatsApp (Opcional)"
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-4 mt-2 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <BellRing size={18} />}
        {isLoading ? 'Registrando...' : 'Me avise quando vagar'}
      </button>
    </form>
  );
}
