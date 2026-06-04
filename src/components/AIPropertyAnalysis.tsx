'use client';

import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface AIPropertyAnalysisProps {
  property: {
    id: string;
    title: string;
    city: string;
    neighborhood: string;
    basePrice: number;
    bedrooms: number;
    areaUseful: number;
    petFriendly?: boolean;
    furnished?: boolean;
    description?: string | null;
  };
}

export default function AIPropertyAnalysis({ property }: AIPropertyAnalysisProps) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const prompt = `Você é um corretor imobiliário especialista em Gurupi e Natividade (Tocantins). 
Analise de forma profissional e objetiva o seguinte imóvel para locação e dê uma análise em 2-3 parágrafos sobre seu custo-benefício, pontos fortes e para qual perfil de inquilino ele é ideal.
Seja direto, concreto e use linguagem de um especialista local. Não use listas com marcadores.

Imóvel:
- Título: ${property.title}
- Cidade: ${property.city}, ${property.neighborhood}
- Aluguel: R$ ${property.basePrice.toLocaleString('pt-BR')}/mês
- Quartos: ${property.bedrooms}
- Área: ${property.areaUseful}m²
- Aceita pets: ${property.petFriendly ? 'Sim' : 'Não'}
- Mobiliado: ${property.furnished ? 'Sim' : 'Não'}
${property.description ? `- Descrição: ${property.description}` : ''}`;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (!res.ok) throw new Error();

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let result = '';
        
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          // Parse Vercel AI SDK data stream
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              const text = JSON.parse(line.slice(2));
              result += text;
              setAnalysis(result);
            }
          }
        }
        
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
        // Fallback para análise local se a API falhar
        setAnalysis(
          `Este imóvel em ${property.neighborhood} apresenta excelente custo-benefício para a região de ${property.city}. ` +
          `Com ${property.bedrooms} quarto${property.bedrooms > 1 ? 's' : ''} e ${property.areaUseful}m², ` +
          `está alinhado com o padrão da vizinhança.` +
          (property.petFriendly ? ' O fato de aceitar pets amplia o público interessado, agregando valor de mercado.' : '') +
          (property.furnished ? ' Mobiliado, o imóvel elimina custos iniciais de mudança — ideal para quem busca praticidade.' : '')
        );
      }
    };

    run();
  }, [property]);

  const tags = [
    property.petFriendly && '🐾 Pet Friendly',
    property.furnished && '🛋️ Mobiliado',
    '📍 Localização estratégica',
    property.bedrooms >= 2 && '👥 Ideal para dividir',
  ].filter(Boolean) as string[];

  return (
    <section>
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="bg-gradient-to-r from-indigo-500 to-violet-600 text-transparent bg-clip-text">
          Visão da IA
        </span>
        <Sparkles size={18} className="text-indigo-500 animate-pulse" />
      </h2>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-800/20 relative overflow-hidden">
        
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-200/30 to-transparent dark:from-indigo-600/10 rounded-bl-3xl" />

        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
              <Sparkles size={15} className="animate-spin" />
              Analisando com Gemini...
            </div>
            <div className="h-4 shimmer bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-full" />
            <div className="h-4 shimmer bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-5/6" />
            <div className="h-4 shimmer bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-4/5" />
            <div className="h-4 shimmer bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-full mt-3" />
            <div className="h-4 shimmer bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-3/4" />
          </div>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] relative z-10">
              {analysis}
              {!analysis && <span className="opacity-50">Análise indisponível.</span>}
            </p>

            <div className="flex gap-2 mt-5 flex-wrap relative z-10">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-indigo-100 dark:border-white/10 shadow-sm"
                >
                  <CheckCircle2 size={11} className="text-emerald-500" />
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
