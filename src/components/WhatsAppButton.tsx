import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  propertyTitle: string;
  propertyPrice?: number;
  propertyId?: string;
}

export default function WhatsAppButton({ phoneNumber, propertyTitle, propertyPrice, propertyId }: WhatsAppButtonProps) {
  const priceStr = propertyPrice ? ` por R$ ${propertyPrice.toLocaleString('pt-BR')}` : '';
  const linkStr = propertyId ? `\n\nLink: https://aluga-ai.com.br/imovel/${propertyId}` : '';
  const message = encodeURIComponent(`Olá! Vi o imóvel "${propertyTitle}"${priceStr} no Aluga AI e gostaria de agendar uma visita.${linkStr}`);
  
  // Format phone number (remove non-digits)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  const url = `https://wa.me/${finalPhone}?text=${message}`;

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
