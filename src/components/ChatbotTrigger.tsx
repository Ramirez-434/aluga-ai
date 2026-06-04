'use client';

import { useEffect } from 'react';

export default function ChatbotTrigger({ message }: { message: string }) {
  useEffect(() => {
    // Dispara o evento global para abrir o AIChatbot e enviar a mensagem inicial
    const event = new CustomEvent('open-chatbot', { detail: { message } });
    window.dispatchEvent(event);
  }, [message]);

  return null;
}
