import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Faça login para acessar o seu painel do Aluga AI.
        </p>
      </div>

      <form className="space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <a href="#" className="text-xs font-semibold text-primary hover:underline">Esqueceu a senha?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
        </div>

        <Link href="/dashboard/tenant" className="w-full py-3 mt-6 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 group">
          Entrar na Conta
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ainda não tem uma conta?{' '}
          <Link href="/auth/register" className="font-bold text-primary hover:underline">
            Crie sua conta aqui
          </Link>
        </p>
      </div>

      <div className="mt-12 text-center">
        <Link href="/auth/admin" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          Acesso Restrito (Administrador)
        </Link>
      </div>
    </div>
  );
}
