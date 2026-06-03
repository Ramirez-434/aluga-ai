import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Left side: Forms */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative overflow-y-auto hidden-scrollbar">
        
        {/* Absolute Header inside left panel */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shadow-lg shadow-primary/30">
              A
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Aluga AI</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm mx-auto mt-12 lg:mt-0">
          {children}
        </div>
      </div>

      {/* Right side: Image branding */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/60 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
          alt="Aluga AI Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-4">O jeito inteligente de morar no Tocantins.</h2>
            <p className="text-xl text-gray-300">Encontre, analise e feche seu próximo aluguel com a precisão da Inteligência Artificial em Natividade e região.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
