'use client';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-full bg-gray-100 dark:bg-white/8 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 hover:text-indigo-600 text-gray-600 dark:text-gray-300 transition-all"
      title="Compartilhar imóvel"
    >
      <Share2 size={18} />
    </button>
  );
}
