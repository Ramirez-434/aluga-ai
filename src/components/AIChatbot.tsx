'use client';

import { useState } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Olá! Sou o assistente virtual do Aluga AI. Que tipo de imóvel você procura hoje?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Interessante! Vou aplicar filtros baseados no que você me disse e te recomendar opções no Menu Radar." 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:scale-110 transition-transform flex items-center gap-2 z-[999] ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="font-medium hidden md:block">Ajuda IA</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span className="font-bold">Assistente Aluga AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 h-80 overflow-y-auto flex flex-col gap-3 bg-gray-50 dark:bg-black/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-[#222] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..." 
              className="flex-1 bg-gray-100 dark:bg-white/5 border-transparent rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex shrink-0 items-center justify-center">
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
