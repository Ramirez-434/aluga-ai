'use client';

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, Heart, MapPin, Scale, PawPrint, Sofa } from "lucide-react";
import { Property } from "@/data/mockProperties";
import { useCompareStore } from "@/store/useCompareStore";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const { addProperty, compareList } = useCompareStore();
  const isCompared = compareList.some(p => p.id === property.id);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60`;

  const CardContent = (
    <>
      {/* Image with next/image lazy loading + blur placeholder */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-200 dark:bg-white/5">
        <Image
          src={!imgError && property.featuredImage ? property.featuredImage : fallbackImg}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={() => setImgError(true)}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k="
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Action buttons */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur-md border border-white/20 transition-all duration-200 text-white z-10 hover:scale-110"
          aria-label="Favoritar"
        >
          <Heart size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); addProperty(property); }}
          className={`absolute top-4 right-14 p-2 rounded-full backdrop-blur-md border transition-all duration-200 z-10 hover:scale-110 ${
            isCompared
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/40'
              : 'bg-white/15 hover:bg-white/35 border-white/20 text-white'
          }`}
          title={isCompared ? "Adicionado ao comparador" : "Adicionar ao comparador"}
        >
          <Scale size={18} />
        </button>

        {/* Tags + Badges */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {(property.tags ?? []).slice(0, 2).map(tag => (
            <span key={tag} className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10">
              {tag}
            </span>
          ))}
          {(property as any).petFriendly && (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-green-500/80 text-white backdrop-blur-md">
              <PawPrint size={10} /> Pet
            </span>
          )}
          {(property as any).furnished && (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-indigo-500/80 text-white backdrop-blur-md">
              <Sofa size={10} /> Mobiliado
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug">{property.title}</h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-1">
            <MapPin size={12} className="shrink-0" />
            <span className="line-clamp-1">{property.address || `${(property as any).neighborhood ?? ''}, ${(property as any).city ?? ''}`}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Bed size={14} />
            </div>
            <span className="text-sm font-semibold">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Bath size={14} />
            </div>
            <span className="text-sm font-semibold">{property.bathrooms ?? 1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Maximize size={14} />
            </div>
            <span className="text-sm font-semibold">{property.area}m²</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Aluguel</p>
            <p className="text-xl font-black text-primary leading-none">R$ {property.price.toLocaleString('pt-BR')}</p>
          </div>
          {(property.condo ?? 0) > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Cond + IPTU</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                R$ {(property.condo ?? 0).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const containerClasses = "block group relative rounded-2xl overflow-hidden bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out text-left w-full cursor-pointer";

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
