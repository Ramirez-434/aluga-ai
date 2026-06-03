'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Home, Key } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<'tenant' | 'advertiser'>('tenant');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Criar nova conta</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Junte-se à revolução do aluguel com Inteligência Artificial.
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">Qual o seu objetivo?</label>
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => setRole('tenant')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              role === 'tenant' 
                ? 'border-primary bg-blue-50 dark:bg-blue-900/10' 
                : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
            }`}
          >
            <Key size={24} className={role === 'tenant' ? 'text-primary' : 'text-gray-400'} />
            <p className={`font-bold mt-2 ${role === 'tenant' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Quero Alugar</p>
            <p className="text-xs text-gray-500 mt-1">Busco um imóvel ideal.</p>
          </button>

          <button 
            type="button"
            onClick={() => setRole('advertiser')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              role === 'advertiser' 
                ? 'border-primary bg-blue-50 dark:bg-blue-900/10' 
                : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
            }`}
          >
            <Home size={24} className={role === 'advertiser' ? 'text-primary' : 'text-gray-400'} />
            <p className={`font-bold mt-2 ${role === 'advertiser' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Quero Anunciar</p>
            <p className="text-xs text-gray-500 mt-1">Tenho imóveis para locação.</p>
          </button>
        </div>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="João da Silva"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" 
              placeholder="seu@email.com"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
        </div>

        <Link 
          href={role === 'tenant' ? '/dashboard/tenant' : '/dashboard/advertiser'} 
          className="w-full py-3 mt-6 bg-gray-900 border border-transparent dark:bg-white dark:text-black hover:bg-black dark:hover:bg-gray-200 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          Finalizar Cadastro
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="font-bold text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
