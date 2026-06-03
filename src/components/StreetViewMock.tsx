import { Map, Navigation2 } from "lucide-react";

export default function StreetViewMock() {
  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden group border border-gray-200 dark:border-white/10">
      <img 
        src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200" 
        alt="Street View" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 blur-[2px] group-hover:blur-0"
      />
      
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <button className="flex items-center gap-2 bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-110 transition-transform backdrop-blur-md">
          <Navigation2 size={18} className="text-primary" />
          Explorar Rua
        </button>
      </div>

      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10 shadow-lg flex items-center gap-2">
        <Map size={14} className="text-gray-500" />
        <span className="text-xs font-semibold">Google Street View</span>
      </div>
    </div>
  );
}
