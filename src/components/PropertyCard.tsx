'use client';

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, Heart, MapPin, Scale, PawPrint, Sofa, Share2, Eye } from "lucide-react";
import { Property } from "@/data/mockProperties";
import { useCompareStore } from "@/store/useCompareStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, PanInfo } from "framer-motion";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  avgPrice?: number; // B17: preço médio para comparação
}

// B21: calcula "há quanto tempo" o imóvel foi anunciado
function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7)  return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} sem.`;
  return `Há ${Math.floor(diffDays / 30)} meses`;
}

// B14: imóvel é "novo" se foi criado nos últimos 7 dias
function isNew(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
}

export default function PropertyCard({ property, onClick, avgPrice }: PropertyCardProps) {
  const { addProperty, compareList } = useCompareStore();
  const { favorites, toggleFavorite } = useFavoriteStore();
  const { status } = useSession();
  const router = useRouter();

  const isCompared = compareList.some(p => p.id === property.id);
  const isFavorite = favorites.includes(property.id);
  const [imgError, setImgError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // B17: abaixo da média (preço justo)
  const isBelowAverage = avgPrice && property.price < avgPrice * 0.9;

  // B14: badge novo
  const propertyIsNew = isNew((property as any).createdAt || new Date());

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== 'authenticated') {
      toast.info("Faça login para salvar seus favoritos", {
        action: { label: "Entrar", onClick: () => router.push('/auth/login') }
      });
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    toggleFavorite(property.id);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id })
      });
      toast.success(isFavorite ? "Removido dos favoritos" : "💙 Salvo nos favoritos");
    } catch {
      toggleFavorite(property.id);
      toast.error("Erro ao salvar favorito");
    } finally {
      setIsLiking(false);
    }
  };

  // B20: compartilhar card
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/imovel/${property.id}`;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  // H66: Swipe-to-favorite
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swiped right enough, toggle favorite
      handleFavorite({ stopPropagation: () => {} } as any);
    }
  };

  const fallbackImg = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60`;

  const CardContent = (
    <>
      {/* B13: aspect-video + Imagem com shimmer enquanto carrega */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-white/5">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

        {/* B14: Badge "Novo!" / "Destaque" */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {propertyIsNew && (
            <span className="badge-new animate-in w-fit">NOVO</span>
          )}
          {(property as any).isPremium && (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/30 uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 w-fit">
              <span>👑</span> VIP
            </span>
          )}
        </div>

        {/* Action buttons — top right */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          {/* B20: Compartilhar */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/50 transition-all hover:scale-110"
            title="Compartilhar"
          >
            <Share2 size={15} />
          </button>

          {/* Comparar */}
          <button
            onClick={(e) => { e.stopPropagation(); addProperty(property); }}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 ${
              isCompared
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                : 'bg-black/30 border-white/20 text-white hover:bg-black/50'
            }`}
            title={isCompared ? "No comparador" : "Comparar"}
          >
            <Scale size={15} />
          </button>

          {/* Favoritar */}
          <button
            onClick={handleFavorite}
            disabled={isLiking}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all hover:scale-110 ${
              isFavorite
                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/40'
                : 'bg-black/30 border-white/20 text-white hover:bg-black/50'
            }`}
            aria-label="Favoritar"
          >
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Bottom tags */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap z-10">
          {(property.tags ?? []).slice(0, 1).map(tag => (
            <span key={tag} className="px-2 py-1 text-[10px] font-bold rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/15">
              {tag}
            </span>
          ))}
          {(property as any).petFriendly && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full bg-emerald-500/80 text-white backdrop-blur-sm">
              <PawPrint size={9} /> Pet
            </span>
          )}
          {(property as any).furnished && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full bg-indigo-500/80 text-white backdrop-blur-sm">
              <Sofa size={9} /> Mob.
            </span>
          )}
        </div>

        {/* B21: Tooltip de tempo — canto superior esquerdo se não tiver "NOVO" */}
        {!propertyIsNew && (property as any).createdAt && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-black/40 text-white/90 backdrop-blur-sm border border-white/10">
              {timeAgo((property as any).createdAt)}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug tracking-tight">
            {property.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-1">
            <MapPin size={11} className="shrink-0 text-indigo-400" />
            <span className="line-clamp-1">
              {property.address || `${(property as any).neighborhood ?? ''}, ${(property as any).city ?? ''}`}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Bed size={12} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-bold">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Bath size={12} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-bold">{property.bathrooms ?? 1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Maximize size={12} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-bold">{property.area}m²</span>
          </div>

          {/* B15: views */}
          {(property as any).viewCount > 0 && (
            <div className="flex items-center gap-1 ml-auto text-gray-400">
              <Eye size={11} />
              <span className="text-[10px] font-medium">{(property as any).viewCount}</span>
            </div>
          )}
        </div>

        {/* Price + B17 badge */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Aluguel</p>
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">
              R$ {property.price.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {/* B17: Badge preço abaixo da média */}
            {isBelowAverage && (
              <span className="badge-price-good text-[9px]">💰 Abaixo da média</span>
            )}
            {(property.condo ?? 0) > 0 && (
              <div className="text-right">
                <p className="text-[9px] text-gray-400">Cond + IPTU</p>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  R$ {(property.condo ?? 0).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // B18 + B19: classes com glow e gradiente no hover
  const containerClasses = `group relative overflow-hidden rounded-3xl bg-white dark:bg-[#1a1a1a] border transition-all duration-300 hover:shadow-2xl cursor-pointer
        ${(property as any).isPremium 
          ? 'border-amber-400/50 dark:border-amber-500/30 shadow-amber-500/10 hover:shadow-amber-500/20 hover:border-amber-400' 
          : 'border-gray-100 dark:border-white/5 hover:border-indigo-100 dark:hover:border-white/10 hover:shadow-indigo-500/5 dark:hover:shadow-black/50'
        }
      `;

  const innerCard = (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 0.98 }}
      className={`h-full w-full relative z-10 rounded-3xl overflow-hidden
        ${(property as any).isPremium 
          ? 'bg-amber-50/50 dark:bg-amber-900/10' 
          : 'bg-white dark:bg-[#111]'
        }
      `}
    >
      {CardContent}
    </motion.div>
  );

  const backgroundSwipeActions = (
    <div className="absolute inset-0 bg-red-500 flex items-center px-6 rounded-2xl z-0">
      <Heart className="text-white w-8 h-8 animate-pulse" fill="white" />
    </div>
  );

  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={containerClasses}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        {backgroundSwipeActions}
        {innerCard}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {backgroundSwipeActions}
      <Link href={`/imovel/${property.id}`} className="block h-full w-full">
        {innerCard}
      </Link>
    </div>
  );
}
