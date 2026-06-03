'use client';

import { Property } from "@/data/mockProperties";
import { Grid, Image as ImageIcon, Play, View } from "lucide-react";

export default function MediaGallery({ property }: { property: Property }) {
  // Since we only have one featured image, we'll mock a gallery by varying the unsplash URL slightly
  const gallery = [
    property.featuredImage,
    property.featuredImage.replace('w=800', 'w=801'),
    property.featuredImage.replace('w=800', 'w=802'),
    property.featuredImage.replace('w=800', 'w=803'),
    property.featuredImage.replace('w=800', 'w=804'),
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden group">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px]">
        {/* Main large image */}
        <div className="md:col-span-2 md:row-span-2 relative overflow-hidden">
          <img 
            src={gallery[0]} 
            alt="Foto Principal" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
        
        {/* Smaller grid images */}
        <div className="hidden md:block relative overflow-hidden">
          <img src={gallery[1]} alt="Foto 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="hidden md:block relative overflow-hidden">
          <img src={gallery[2]} alt="Foto 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="hidden md:block relative overflow-hidden">
          <img src={gallery[3]} alt="Foto 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="hidden md:block relative overflow-hidden">
          <img src={gallery[4]} alt="Foto 5" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] cursor-pointer hover:bg-black/50 transition-colors">
            <span className="text-white font-bold text-lg">+12 Fotos</span>
          </div>
        </div>
      </div>

      {/* Action floating bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-medium text-sm">
          <Grid size={16} /> Fotos
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium text-sm">
          <Play size={16} /> Vídeo
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium text-sm">
          <View size={16} /> Tour 360°
        </button>
      </div>
    </div>
  );
}
