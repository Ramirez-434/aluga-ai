import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, UserCog } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-200 dark:border-red-500/20">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Portal Restrito</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Esta área é de acesso exclusivo para Operadores do Sistema Administrativo.
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID do Administrador</label>
          <div className="relative">
            <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="admin@aluga.ai"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chave de Segurança</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            />
          </div>
        </div>

        <Link href="/dashboard/admin" className="w-full py-3 mt-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 group">
          Autorizar Acesso
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </form>

      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
        <Link href="/auth/login" className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          Voltar ao Login Público
        </Link>
      </div>
    </div>
  );
}
