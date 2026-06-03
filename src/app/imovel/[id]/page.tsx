import { notFound } from "next/navigation";
import { ArrowLeft, Share2, MapPin, Bed, Bath, Maximize, Car, PawPrint, Sofa, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CostCalculator from "@/components/CostCalculator";
import WhatsAppButton from "@/components/WhatsAppButton";
import SmartSuggestions from "@/components/SmartSuggestions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// JSON-LD Schema Markup for Google Rich Snippets
function PropertyJsonLd({ property }: { property: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? `Imóvel disponível para locação em ${property.city}.`,
    url: `https://aluga-ai.com.br/imovel/${property.id}`,
    image: property.featuredImage ?? "",
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: "TO",
      addressCountry: "BR",
      streetAddress: property.address,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "MTK",
    },
    numberOfRooms: property.bedrooms,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
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
    include: { owner: true }
  }).catch(() => null);

  if (!property) notFound();

  return (
    <>
      <PropertyJsonLd property={property} />
      <div className="min-h-screen bg-gray-50 dark:bg-[#060810] pb-24">

        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">
            <ArrowLeft size={20} />
            <span>Voltar à Busca</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              Disponível
            </span>
            <button className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <Share2 size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero Image */}
          <div className="relative w-full h-[50vh] rounded-3xl overflow-hidden mb-8 bg-gray-200 dark:bg-white/5 shadow-2xl">
            <Image
              src={property.featuredImage ?? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80"}
              alt={property.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white/70 text-sm font-medium mb-1 flex items-center gap-1">
                <MapPin size={14} />
                {property.neighborhood}, {property.city} — TO
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{property.title}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">

              {/* Price strip */}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/8 shadow-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Aluguel mensal</p>
                  <p className="text-4xl font-black text-primary">R$ {property.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400 mb-1">IA — Análise de Preço</p>
                  <span className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
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

              {/* AI Vision */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">Visão da IA</span> ✨
                </h2>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/20">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
                    Este imóvel em <strong>{property.neighborhood}</strong> apresenta excelente custo-benefício para a região de <strong>{property.city}</strong>. 
                    Com {property.bedrooms} quarto{property.bedrooms > 1 ? 's' : ''} e {property.area}m², está alinhado com o padrão da vizinhança.
                    {property.petFriendly && " O fato de aceitar pets amplia o público interessado, agregando valor de mercado."}
                    {property.furnished && " Mobiliado, o imóvel elimina custos iniciais de mudança — ideal para quem busca praticidade."}
                  </p>
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {[
                      property.petFriendly && "🐾 Pet Friendly",
                      property.furnished && "🛋️ Mobiliado",
                      "📍 Localização estratégica",
                    ].filter(Boolean).map(tag => (
                      <span key={tag as string} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10">
                        <CheckCircle2 size={11} className="text-green-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

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
