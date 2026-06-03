import { notFound } from "next/navigation";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { ArrowLeft, Share2, MapPin } from "lucide-react";
import Link from "next/link";
import CostCalculator from "@/components/CostCalculator";
import MediaGallery from "@/components/MediaGallery";
import WhatsAppButton from "@/components/WhatsAppButton";
import StreetViewMock from "@/components/StreetViewMock";
import SmartSuggestions from "@/components/SmartSuggestions";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-24">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Voltar à Busca</span>
        </Link>
        <button className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <Share2 size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Badge */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                Preço Justo IA
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Atualizado há 2h</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h1>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin size={18} className="mr-1 text-primary" />
              <span>{property.address}</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Valor do Aluguel</p>
            <p className="text-4xl font-extrabold text-primary">R$ {property.price.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Media Gallery */}
        <MediaGallery property={property} />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Details Section */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Spec Sheet */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ficha Técnica</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Área Útil", value: `${property.area}m²` },
                  { label: "Quartos", value: property.bedrooms },
                  { label: "Banheiros", value: property.bathrooms },
                  { label: "Orientação", value: "Face Norte ☀️" },
                  { label: "Piso", value: "Porcelanato" },
                  { label: "Aquecimento", value: "Gás Natural" },
                  { label: "Pets", value: property.tags.includes("Pet Friendly") ? "Aceita" : "Sob Consulta" },
                  { label: "Vagas", value: property.tags.includes("4 Vagas") ? "4" : "1 a 2" },
                ].map((spec, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{spec.label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{spec.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Description Mock */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">Visão da IA</span>
                ✨
              </h2>
              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Este imóvel em <strong>{property.address}</strong> apresenta uma excelente relação custo-benefício, estando 5% abaixo da média de preço para propriedades com {property.bedrooms} quartos na região. A face norte garante luz natural durante o dia todo, o que pode reduzir a conta de energia em até 15%. Ideal para quem busca proximidade com conveniências, pois há supermercados e transporte público a menos de 5 minutos de caminhada.
                </p>
              </div>
            </section>

            {/* Street View Mock */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Conheça a Vizinhança</h2>
              <StreetViewMock />
            </section>
          </div>

          {/* Sidebar / Sticky Action Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Cost Calculator */}
              <CostCalculator property={property} />

              {/* Action Buttons */}
              <div className="space-y-3">
                <WhatsAppButton phoneNumber="5511999999999" propertyTitle={property.title} />
                <button className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
                  Agendar Visita
                </button>
              </div>

              {/* Micro-UX: Report Listing */}
              <div className="flex justify-center mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                <button className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  Denunciar este anúncio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations at the bottom */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10">
          <SmartSuggestions title="Outras opções com Preço Justo IA" />
        </div>
      </main>
    </div>
  );
}
