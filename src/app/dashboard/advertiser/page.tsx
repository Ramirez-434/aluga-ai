import { BarChart3, Users, Eye, UploadCloud, MessageSquare } from "lucide-react";

export default function AdvertiserDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Painel do Anunciante</h1>
        <p className="text-gray-500 dark:text-gray-400">Acompanhe a performance dos seus imóveis e leads.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Visualizações", value: "1.248", icon: Eye, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Leads (WhatsApp)", value: "34", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
          { label: "Taxa de Conversão", value: "2.7%", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
        ].map((metric, i) => (
          <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{metric.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${metric.bg} ${metric.color}`}>
              <metric.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CRM Pipeline */}
        <div className="xl:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-gray-500" /> Pipeline de Interessados
          </h2>
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 min-h-[300px]">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Novos (2)</h4>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-grab">
                    <p className="font-bold text-sm dark:text-white">Carlos S.</p>
                    <p className="text-xs text-gray-500">Centro Histórico • R$ 3.5k</p>
                  </div>
                  <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-grab">
                    <p className="font-bold text-sm dark:text-white">Maria F.</p>
                    <p className="text-xs text-gray-500">Bela Vista • R$ 1.2k</p>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 min-h-[300px]">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Em Negociação (1)</h4>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-lg border border-primary dark:border-primary shadow-sm cursor-grab relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <p className="font-bold text-sm dark:text-white">Roberto A.</p>
                    <p className="text-xs text-gray-500">Matriz • R$ 2.2k</p>
                    <span className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold rounded">Proposta Enviada</span>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 min-h-[300px] opacity-60">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Fechados (0)</h4>
                <div className="flex items-center justify-center h-full text-xs text-gray-400 text-center font-medium border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                  Arraste cards para cá
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Hub */}
        <div className="xl:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UploadCloud size={20} className="text-gray-500" /> Novo Imóvel
          </h2>
          <div className="bg-white dark:bg-[#111] border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-primary dark:hover:border-primary transition-colors rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group h-[300px]">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Arraste fotos ou clique</h4>
            <p className="text-sm text-gray-500">A IA estruturará o anúncio inteiro a partir das fotos. (JPG, PNG)</p>
            <button className="mt-6 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-full hover:scale-105 transition-transform text-sm">
              Selecionar Arquivos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
