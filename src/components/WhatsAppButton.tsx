import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  propertyTitle: string;
}

export default function WhatsAppButton({ phoneNumber, propertyTitle }: WhatsAppButtonProps) {
  const message = encodeURIComponent(`Olá! Tenho interesse no imóvel "${propertyTitle}" publicado no Aluga AI.`);
  const url = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold transition-colors shadow-lg shadow-green-500/30"
    >
      <MessageCircle size={20} />
      Falar no WhatsApp
    </a>
  );
}
