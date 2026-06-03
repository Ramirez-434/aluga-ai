import PropertyCard from "@/components/PropertyCard";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { Bell, Clock, Search, Heart } from "lucide-react";

export default function TenantDashboard() {
  const favorites = MOCK_PROPERTIES.slice(0, 2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Olá, João! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Aqui está o resumo da sua jornada de locação.</p>
      </div>

      {/* Radar Section */}
      <section className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl shrink-0">
          <Bell size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Meu Radar Ativo</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Procurando por: <strong>Casa, Centro Histórico, até R$ 2.000, 2 quartos</strong></p>
          <button className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Editar Radar
          </button>
        </div>
      </section>

      {/* Favorites Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart size={20} className="text-red-500" /> Seus Favoritos
          </h2>
          <button className="text-primary text-sm font-medium hover:underline">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(prop => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* History Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-500" /> Histórico de Visitas
        </h2>
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden max-w-3xl">
          <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Studio Moderno na Vila Madalena</p>
              <p className="text-sm text-gray-500">Visitado em 14 Nov, 15:30</p>
            </div>
            <span className="w-fit px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full">
              Boa Opção
            </span>
          </div>
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Loft Industrial Centro Histórico</p>
              <p className="text-sm text-gray-500">Visitado em 10 Nov, 10:00</p>
            </div>
            <span className="w-fit px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-full">
              Descartado
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
