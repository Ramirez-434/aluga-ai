'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, X, Send, Sparkles, Building, Bed, Maximize, Trash2, ChevronRight } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'aluga_ai_chat_history';
const LAST_VISIT_KEY = 'aluga_ai_last_visit';

// E44: Chips de sugestão dinâmicos baseados no contexto da última resposta
const SUGGESTION_CHIPS = [
  'Ver mais baratos',
  'Mostrar mobiliados',
  'Pet friendly?',
  'Só em Gurupi',
  'Com 2+ quartos',
  'Próximo ao centro',
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProactive, setShowProactive] = useState(false); // E48
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setFilter, resetFilters } = useFilterStore();
  const pathname = usePathname();

  // Detecta se estamos numa página de imóvel
  const isPropertyPage = pathname?.startsWith('/imovel/');
  const propertyId = isPropertyPage ? pathname.split('/')[2] : undefined;

  const { data: session, status } = useSession();

  // E43: Carregar histórico do localStorage (apenas para fallback offline/anon)
  const savedMessages = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    : [];

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages, append } = useChat({
    initialMessages: savedMessages,
    body: {
      propertyId // Passa o propertyId no body se houver
    }
  });

  // E43: Buscar histórico real do banco se autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/chat/history')
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        })
        .catch(console.error);
    }
  }, [status, setMessages]);

  // E48: Verificar se usuário voltou após 2+ dias
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const now = Date.now();

    if (lastVisit) {
      const diffDays = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
      if (diffDays >= 2 && messages.length === 0) {
        setShowProactive(true);
      }
    }
    localStorage.setItem(LAST_VISIT_KEY, now.toString());
  }, []);

  // E43: Salvar histórico sempre que mensagens mudam (se anônimo)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0 && status !== 'authenticated') {
      // Salvar só as últimas 20 mensagens para não estourar o localStorage
      const toSave = messages.slice(-20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }

    // Scroll automático
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Sincronizar intenção da IA com o Mapa (Zustand)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
      const searchCall = lastMessage.toolInvocations.find(t => t.toolName === 'searchProperties' && t.state === 'call');
      if (searchCall) {
        const args = searchCall.args as any;
        resetFilters();
        if (args.city)        setFilter('city', args.city);
        if (args.minBedrooms) setFilter('minBedrooms', args.minBedrooms);
        if (args.maxPrice)    setFilter('maxPrice', args.maxPrice);
        if (args.petFriendly !== undefined) setFilter('petFriendly', args.petFriendly);
        if (args.furnished !== undefined)   setFilter('furnished', args.furnished);
      }
    }
  }, [messages, setFilter, resetFilters]);

  // E43: Limpar histórico
  const clearHistory = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // E44: Enviar sugestão ao clicar no chip
  const handleChipClick = (chip: string) => {
    append({ role: 'user', content: chip });
  };

  const renderToolInvocation = (toolInvocation: any) => {
    if (toolInvocation.toolName === 'searchProperties') {
      if (toolInvocation.state === 'call') {
        return (
          <div key={toolInvocation.toolCallId} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl text-sm flex items-center gap-2 animate-pulse mt-2">
            <Sparkles size={15} /> Buscando imóveis perfeitos...
          </div>
        );
      }
      if (toolInvocation.state === 'result') {
        const { resultsCount, properties } = toolInvocation.result;
        if (resultsCount === 0) {
          return (
            <div key={toolInvocation.toolCallId} className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl text-sm text-gray-500 dark:text-gray-400 mt-2">
              😔 Nenhum imóvel encontrado com esses filtros.
            </div>
          );
        }
        return (
          <div key={toolInvocation.toolCallId} className="space-y-2.5 mt-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {resultsCount} Imóveis Encontrados
            </p>
            <div className="flex flex-col gap-2.5">
              {properties.map((prop: any) => (
                <a
                  key={prop.id}
                  href={`/imovel/${prop.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 p-2.5 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
                >
                  {prop.featuredImage ? (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img src={prop.featuredImage} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                      <Building className="text-indigo-400" size={20} />
                    </div>
                  )}
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="font-bold text-xs truncate text-gray-900 dark:text-white">{prop.title}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm mt-0.5">
                      R$ {prop.price.toLocaleString('pt-BR')}
                    </p>
                    <div className="flex items-center gap-2.5 text-[10px] text-gray-400 mt-1 font-semibold">
                      <span className="flex items-center gap-1"><Bed size={10}/> {prop.bedrooms} qts</span>
                      <span className="flex items-center gap-1"><Maximize size={10}/> {prop.area}m²</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 self-center shrink-0 group-hover:text-indigo-500 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // E44: Mostrar chips apenas após a última resposta do assistente
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const showChips = lastAssistantMsg && !isLoading;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[400] w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40 hover:scale-110 hover:shadow-indigo-500/60 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={22} />
        {/* E48: Ponto de notificação proativo */}
        {showProactive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-4 sm:right-6 z-[500] w-[calc(100vw-32px)] sm:w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
              <Sparkles size={18} />
              {isPropertyPage && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                </span>
              )}
            </div>
            <div>
              <h3 className="font-black text-sm leading-tight flex items-center gap-1.5">
                Corretor de IA
                {isPropertyPage && (
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-white font-bold tracking-wider">VISÃO ATIVA</span>
                )}
              </h3>
              <p className="text-[10px] text-white/70 font-medium">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* E43: Botão de limpar histórico */}
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Limpar conversa"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gray-50/80 dark:bg-black/40">
          
          {/* E48: Mensagem proativa */}
          {showProactive && messages.length === 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-2xl rounded-bl-sm">
              <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                👋 <strong>Bem-vindo de volta!</strong> Apareceram novos imóveis desde a sua última visita. Quer que eu encontre algo que combine com você?
              </p>
            </div>
          )}

          {messages.length === 0 && !showProactive && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8 space-y-4">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center border border-indigo-200 dark:border-indigo-800/30">
                <MessageSquare size={22} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Olá! Sou o Corretor Virtual.</p>
                <p className="text-xs text-gray-500 mt-1">Descreva o imóvel que você procura:</p>
              </div>
              <div className="flex flex-col gap-2 px-2">
                {[
                  '🐾 Apê pet friendly em Gurupi, 2 quartos',
                  '🛋️ Algo mobiliado até R$ 1.500',
                  '🏛️ Casa em Natividade, barato',
                ].map(sug => (
                  <button
                    key={sug}
                    onClick={() => append({ role: 'user', content: sug })}
                    className="text-xs text-left bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-gray-300 transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs border border-red-200 dark:border-red-900/50">
              <p className="font-bold mb-1">⚠️ Chave de API não configurada</p>
              <p className="opacity-80">Adicione <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">GOOGLE_GENERATIVE_AI_API_KEY</code> no seu <code>.env</code>.</p>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {m.content && (
                <div className={`max-w-[86%] p-3 text-sm shadow-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm leading-relaxed'
                }`}>
                  {m.content}
                </div>
              )}
              {m.toolInvocations?.map(toolInvocation => renderToolInvocation(toolInvocation))}
            </div>
          ))}
          
          {isLoading && !messages[messages.length - 1]?.toolInvocations && (
            <div className="flex items-start">
              <div className="bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 p-3.5 rounded-2xl rounded-bl-sm flex gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {/* E44: Chips de sugestão dinâmicos após resposta */}
          {showChips && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3.5 bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/8 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Descreva o imóvel ideal..."
              className="flex-1 bg-gray-100 dark:bg-white/5 border border-transparent rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-white/10 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all dark:text-white text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="absolute right-2 w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:cursor-not-allowed"
            >
              <Send size={13} className="ml-[2px]" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
