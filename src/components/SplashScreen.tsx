import { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Exemplo de hidratação forçada/simulada (3 segundos) ou atrelada a evento externo.
  // Como estamos renderizando a SplashScreen de dentro do page.tsx (que controla o loading),
  // a prop `onFinish` pode ser passada opcionalmente.
  // Para fins visuais, se não for passado `onFinish`, escondemos após 2s.
  useEffect(() => {
    if (onFinish) return; // O componente pai controla o término

    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setIsVisible(false), 500); // 500ms fade-out
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  // Se o pai chamar a prop exposed, podemos expor métodos via useImperativeHandle
  // Mas a abordagem mais simples é o pai apenas não renderizar ou controlar o fade.

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Glow Effect */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full scale-150 animate-pulse"></div>
        
        {/* The generated icon */}
        <img 
          src="/icon-192.png" 
          alt="Aluga AI Logo" 
          className="w-24 h-24 mb-6 z-10 drop-shadow-2xl animate-bounce"
          style={{ animationDuration: '2s' }}
        />
        
        <h1 className="text-3xl font-black text-white tracking-tight z-10">
          ALUGA <span className="text-indigo-500">AI</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2 font-medium z-10 tracking-widest uppercase">
          Masterizando Inteligência...
        </p>

        {/* Loading Spinner */}
        <div className="mt-12 flex gap-2 z-10">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
