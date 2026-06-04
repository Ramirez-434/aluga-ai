'use client';

import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { X, MapPin, Bed, Bath, Maximize } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import Link from "next/link";

interface PropertySidebarProps {
  propertyId: string | null;
  onClose: () => void;
}

export default function PropertySidebar({ propertyId, onClose }: PropertySidebarProps) {
  if (!propertyId) return null;

  const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
  if (!property) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      
      {/* Sidebar Panel / Bottom Sheet */}
      <div className="fixed md:top-0 md:right-0 bottom-0 left-0 w-full md:max-w-md h-[85vh] md:h-full bg-white dark:bg-[#0a0a0a] shadow-2xl z-[500] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-300 rounded-t-3xl md:rounded-none md:border-l border-gray-200 dark:border-white/10 overflow-hidden">
        
        {/* Mobile Drag Handle (Pill) */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden absolute top-0 z-10">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full"></div>
        </div>
        
        <div className="relative h-64 w-full shrink-0">
          <img src={property.featuredImage} alt={property.title} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-6 md:top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute top-6 md:top-4 right-4 flex gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-green-500 text-white rounded-full shadow-lg">
              Preço Justo IA
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto pb-24 md:pb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h2>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <MapPin size={16} className="mr-1 text-primary" />
            <span>{property.address}</span>
          </div>

          <div className="flex justify-between items-end mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Aluguel</p>
              <p className="text-3xl font-bold text-primary">R$ {property.basePrice.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Cond + IPTU</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">R$ {property.condominiumFee}</p>
            </div>
          </div>

          <div className="flex gap-4 border-y border-gray-100 dark:border-white/10 py-4 mb-6">
            <div className="flex flex-col items-center flex-1">
              <Bed size={20} className="text-gray-400 mb-1" />
              <span className="font-medium text-gray-900 dark:text-white">{property.bedrooms}</span>
              <span className="text-xs text-gray-500">Quartos</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-white/10"></div>
            <div className="flex flex-col items-center flex-1">
              <Bath size={20} className="text-gray-400 mb-1" />
              <span className="font-medium text-gray-900 dark:text-white">{property.bathrooms}</span>
              <span className="text-xs text-gray-500">Banheiros</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-white/10"></div>
            <div className="flex flex-col items-center flex-1">
              <Maximize size={20} className="text-gray-400 mb-1" />
              <span className="font-medium text-gray-900 dark:text-white">{property.areaUseful}m²</span>
              <span className="text-xs text-gray-500">Área Útil</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Diferenciais
            </h3>
            <div className="flex flex-wrap gap-2">
              {property.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] space-y-3 shrink-0">
          <WhatsAppButton phoneNumber="5511999999999" propertyTitle={property.title} />
          <Link href={`/imovel/${property.id}`} className="block w-full text-center py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
            Página Completa do Imóvel
          </Link>
        </div>
      </div>
    </>
  );
}
