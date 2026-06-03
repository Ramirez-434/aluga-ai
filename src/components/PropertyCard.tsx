'use client';

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, Heart, MapPin, Scale } from "lucide-react";
import { Property } from "@/data/mockProperties";
import { useCompareStore } from "@/store/useCompareStore";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const { addProperty, compareList } = useCompareStore();
  const isCompared = compareList.some(p => p.id === property.id);

  const CardContent = (
    <>
      <div className="relative h-64 w-full">
        <img 
          src={property.featuredImage} 
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-colors text-white z-10"
        >
          <Heart size={20} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); addProperty(property); }} 
          className={`absolute top-4 right-14 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${isCompared ? 'bg-primary text-white' : 'bg-white/20 hover:bg-white/40 text-white'}`}
          title={isCompared ? "Adicionado ao comparador" : "Adicionar ao comparador"}
        >
          <Scale size={20} />
        </button>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-black/60 text-white backdrop-blur-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{property.title}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="flex gap-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Bed size={16} />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span className="text-sm font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize size={16} />
              <span className="text-sm font-medium">{property.area}m²</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Aluguel</p>
            <p className="text-2xl font-bold text-primary">R$ {property.price.toLocaleString('pt-BR')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total cond + IPTU</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">R$ {property.condo.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </>
  );

  const containerClasses = "block group relative rounded-2xl overflow-hidden bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 text-left w-full";

  if (onClick) {
    return (
      <div 
        onClick={onClick} 
        className={containerClasses}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={`/imovel/${property.id}`} className={containerClasses}>
      {CardContent}
    </Link>
  );
}
