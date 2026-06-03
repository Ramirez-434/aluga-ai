'use client';
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {icon}
      {label}
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export default function LoginPage() {
  const handleSocial = (provider: string) => {
    toast.info(`Login com ${provider}`, {
      description: 'Integração OAuth será configurada em produção.'
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Faça login para acessar o seu painel do Aluga AI.
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="flex gap-3 mb-6">
        <SocialButton
          icon={<GoogleIcon />}
          label="Google"
          onClick={() => handleSocial('Google')}
        />
        <SocialButton
          icon={<AppleIcon />}
          label="Apple"
          onClick={() => handleSocial('Apple')}
        />
      </div>

      {/* Divider */}
      <div className="relative flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        <span className="text-xs font-medium text-gray-400 shrink-0">ou continue com email</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white transition-shadow"
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
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white transition-shadow"
            />
          </div>
        </div>

        <Link
          href="/dashboard/tenant"
          className="w-full py-3.5 mt-2 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
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

      <div className="mt-8 text-center">
        <Link href="/auth/admin" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          Acesso Restrito (Administrador)
        </Link>
      </div>
    </div>
  );
}
