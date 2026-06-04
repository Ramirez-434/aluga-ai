import { notFound } from "next/navigation";
import { ArrowLeft, Share2, MapPin, Bed, Bath, Maximize, Car, PawPrint, Sofa, CheckCircle2, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CostCalculator from "@/components/CostCalculator";
import WhatsAppButton from "@/components/WhatsAppButton";
import SmartSuggestions from "@/components/SmartSuggestions";
import AIPropertyAnalysis from "@/components/AIPropertyAnalysis";
import ShareButton from "@/components/ShareButton";
import ViewCounter from "@/components/ViewCounter";
import ImageGalleryCarousel from "@/components/ImageGalleryCarousel";
import ChatbotTrigger from "@/components/ChatbotTrigger";
import JsonLd from "@/components/seo/JsonLd";
import { PrismaClient } from "@prisma/client";
import type { Metadata } from 'next';

const prisma = new PrismaClient();

// G61: ISR — revalidar a cada 5 minutos (atualiza views sem rebuild completo)
export const revalidate = 300;


// OpenGraph dinâmico para compartilhamento no WhatsApp/Facebook
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, description: true, featuredImage: true, city: true, price: true }
  });

  if (!property) return { title: 'Imóvel não encontrado' };

  return {
    title: `${property.title} | Aluga AI`,
    description: property.description ?? `Excelente oportunidade de locação em ${property.city} por R$ ${property.price.toLocaleString('pt-BR')}.`,
    openGraph: {
      title: property.title,
      description: property.description ?? `Excelente oportunidade de locação em ${property.city}.`,
      images: property.featuredImage ? [{ url: property.featuredImage }] : [],
      url: `https://aluga-ai.com.br/imovel/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: property.description ?? `Excelente oportunidade de locação em ${property.city}.`,
      images: property.featuredImage ? [property.featuredImage] : [],
    }
  };
}

const SPECS = (property: any) => [
  { icon: <Maximize size={18} />, label: "Área Útil",    value: `${property.area}m²` },
  { icon: <Bed size={18} />,      label: "Quartos",      value: property.bedrooms },
  { icon: <Bath size={18} />,     label: "Banheiros",    value: property.bathrooms ?? 1 },
  { icon: <Car size={18} />,      label: "Vagas",        value: property.parkingSpots ?? 1 },
  { icon: <PawPrint size={18} />, label: "Pets",         value: property.petFriendly ? "✅ Aceita" : "❌ Não aceita" },
  { icon: <Sofa size={18} />,     label: "Mobiliado",    value: property.furnished ? "✅ Sim" : "❌ Não" },
];

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch from real database
  const property = await prisma.property.findUnique({ 
    where: { id },
    include: { owner: true, images: { orderBy: { order: 'asc' } } }
  }).catch(() => null);

  if (!property) notFound();

  // Extract images array
  const galleryImages = property.images?.length > 0 
    ? property.images.map(img => img.url) 
    : (property.featuredImage ? [property.featuredImage] : []);


  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            "name": property.title,
            "image": galleryImages,
            "description": property.description ?? `Imóvel para locação em ${property.city}`,
            "offers": {
              "@type": "Offer",
              "url": `https://aluga-ai.com.br/imovel/${property.id}`,
              "priceCurrency": "BRL",
              "price": property.price,
              "availability": property.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          },
          {
            "@type": "RentAction",
            "object": {
              "@type": "RealEstateListing",
              "name": property.title,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": property.address,
                "addressLocality": property.city,
                "addressRegion": "TO",
                "addressCountry": "BR"
              },
              "numberOfRooms": property.bedrooms,
              "floorSize": {
                "@type": "QuantitativeValue",
                "value": property.area,
                "unitCode": "MTK"
              }
            },
            "price": property.price,
            "priceCurrency": "BRL"
          }
        ]
      }} />
      {/* D41: ViewCounter — dispara PATCH silencioso na carga */}
      <ViewCounter propertyId={property.id} />
      <div className="min-h-screen bg-gray-50 dark:bg-[#060810] pb-24">

        {/* Sticky Header com Share nativo (D40) e Breadcrumb (D39) */}
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-500 transition-colors font-medium text-sm">
            <ArrowLeft size={18} />
            <span className="hidden sm:block">Busca</span>
          </Link>
          {/* D39: Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-indigo-500">Início</Link>
            <ChevronRight size={11} />
            <span className="text-gray-500">{property.city}</span>
            <ChevronRight size={11} />
            <span className="text-gray-700 dark:text-gray-300 font-semibold truncate max-w-32">{property.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
              Disponível
            </span>
            {/* D40: Share nativo */}
            <ShareButton title={property.title} />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Fallback Ativo para Imóvel Alugado */}
          {!property.isActive && (
            <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-amber-800 dark:text-amber-300">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-black mb-1">Este imóvel já foi alugado!</h2>
                <p className="text-sm opacity-90">O Aluga AI voa rápido. Mas não se preocupe, nosso Corretor Virtual já está buscando opções similares na região de {property.city} para você.</p>
              </div>
              {/* Trigger proativo da IA */}
              <ChatbotTrigger message={`Vi que a propriedade "${property.title}" em ${property.city} já foi alugada. Pode me mostrar opções parecidas na mesma faixa de preço?`} />
            </div>
          )}

          {/* Hero Image Gallery (F53) */}
          <ImageGalleryCarousel 
            images={galleryImages} 
            title={property.title}
            neighborhood={property.neighborhood}
            city={property.city}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">

              {/* Price strip */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Aluguel mensal</p>
                  <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">R$ {property.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right hidden sm:block space-y-2">
                  {/* D41: Views visíveis */}
                  {(property as any).viewCount > 0 && (
                    <div className="flex items-center gap-1.5 justify-end text-gray-400 text-xs">
                      <Eye size={13} />
                      <span className="font-medium">{(property as any).viewCount} visualizações</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">IA — Análise de Preço</p>
                  <span className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                    ✅ Preço Justo
                  </span>
                </div>
              </div>

              {/* Spec Grid */}
              <section>
                <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">Ficha Técnica</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECS(property).map((spec, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {spec.icon}
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide">{spec.label}</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Description */}
              {property.description && (
                <section>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sobre o Imóvel</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px]">{property.description}</p>
                </section>
              )}

              {/* D35: Análise de IA Real com Gemini */}
              <AIPropertyAnalysis property={property} />

              {/* Neighborhood Map */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Localização</h2>
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-200 dark:bg-white/5 flex items-center justify-center relative border border-gray-100 dark:border-white/8">
                  <iframe
                    title="Mapa"
                    className="w-full h-full"
                    src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                    loading="lazy"
                  />
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">
                {property.isActive ? (
                  <>
                    <CostCalculator property={property as any} />
                    <WhatsAppButton 
                      phoneNumber={property.owner?.phone || "556399999999"} 
                      propertyTitle={property.title}
                      propertyPrice={property.price}
                      propertyId={property.id}
                    />
                    <button className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
                      📅 Agendar Visita
                    </button>
                  </>
                ) : (
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 text-center">
                    <CheckCircle2 size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-bold text-gray-600 dark:text-gray-300">Anúncio Indisponível</p>
                    <p className="text-sm text-gray-400 mt-1">Este imóvel não está mais aceitando propostas no momento.</p>
                  </div>
                )}
                <div className="flex justify-center pt-4 border-t border-gray-100 dark:border-white/10">
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Denunciar este anúncio
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Suggestions */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10">
            <SmartSuggestions title="Outros imóveis que podem te interessar" />
          </div>
        </main>
      </div>
    </>
  );
}
