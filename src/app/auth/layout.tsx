import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import PageTransition from "@/components/PageTransition";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#060810]">
      {/* Left side: Forms */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center px-8 sm:px-12 md:px-16 py-12 relative overflow-y-auto">
        
        {/* Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-base group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/30">
              A
            </div>
            <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white">
              Aluga <span className="bg-gradient-to-r from-indigo-500 to-violet-600 text-transparent bg-clip-text">AI</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm mx-auto mt-16 lg:mt-0">
          <PageTransition>
            {children}
          </PageTransition>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400">
          © 2025 Aluga AI · Tocantins
        </p>
      </div>

      {/* Right side: Branding premium */}
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden bg-[#060810]">
        {/* Imagem de fundo */}
        <Image
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=2000"
          alt="Aluga AI — Morar no Tocantins"
          fill
          sizes="58vw"
          className="object-cover opacity-40"
          priority
        />

        {/* Overlay gradiente duplo */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-violet-900/40 to-[#060810]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-transparent to-transparent" />

        {/* Conteúdo flutuante */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-14">
          {/* Stats no topo */}
          <div className="flex items-center gap-8">
            {[
              { num: '500+', label: 'Imóveis' },
              { num: '2',    label: 'Cidades' },
              { num: 'IA',   label: 'Powered' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-white">{stat.num}</p>
                <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Headline no fundo */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping-slow" />
              <span className="text-white/80 text-xs font-semibold">Disponível agora em Gurupi e Natividade</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              O jeito{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 text-transparent bg-clip-text">
                inteligente
              </span>{' '}
              de morar no Tocantins.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Encontre, analise e feche seu próximo aluguel com a precisão da Inteligência Artificial.
            </p>

            {/* Depoimento */}
            <div className="mt-8 flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shrink-0 flex items-center justify-center text-white font-bold text-sm">
                J
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium leading-snug">
                  "Encontrei meu apartamento em 10 minutos usando o Corretor Virtual!"
                </p>
                <p className="text-white/40 text-xs mt-0.5">João Paulo · Estudante UNIRG</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
