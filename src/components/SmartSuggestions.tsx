import { Sparkles, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { MOCK_PROPERTIES } from "@/data/mockProperties";

export default function SmartSuggestions({ title = "Sugestões IA para você" }: { title?: string }) {
  // Mock smart sorting by reversing the list
  const suggestions = [...MOCK_PROPERTIES].reverse();

  return (
    <section className="mt-12 mb-8 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Sparkles className="text-primary animate-pulse" size={24} />
          {title}
        </h2>
        <button className="text-sm font-semibold text-primary flex items-center hover:underline">
          Ver todas <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 snap-x snap-mandatory no-scrollbar">
        {suggestions.map(prop => (
          <div key={prop.id} className="min-w-[300px] md:min-w-[380px] snap-start shrink-0">
            <PropertyCard property={prop} />
          </div>
        ))}
      </div>
    </section>
  );
}
