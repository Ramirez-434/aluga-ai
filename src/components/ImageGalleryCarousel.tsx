'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Maximize2, X } from 'lucide-react';

interface ImageGalleryCarouselProps {
  images: string[];
  title: string;
  neighborhood: string;
  city: string;
}

export default function ImageGalleryCarousel({ images, title, neighborhood, city }: ImageGalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallback se não houver imagens
  const validImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80"];

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="relative w-full h-[50vh] rounded-3xl overflow-hidden mb-8 bg-gray-200 dark:bg-white/5 shadow-2xl group">
        <AnimatePresence initial={false} custom={currentIndex}>
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={validImages[currentIndex]}
              alt={`${title} - Foto ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-10">
          <p className="text-white/80 text-sm font-medium mb-1 flex items-center gap-1">
            <MapPin size={14} />
            {neighborhood}, {city} — TO
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">{title}</h1>
        </div>

        {/* Carousel Controls */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 border border-white/20 z-20"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 border border-white/20 z-20"
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 z-20">
              {currentIndex + 1} / {validImages.length}
            </div>
          </>
        )}

        <button
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 border border-white/20 z-20"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50"
            >
              <X size={24} />
            </button>

            {validImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto flex items-center justify-center p-4">
              <Image
                src={validImages[currentIndex]}
                alt={`${title} - Foto ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                quality={100}
              />
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full border border-white/20">
              {currentIndex + 1} de {validImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
