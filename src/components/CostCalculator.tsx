'use client';

import { useState } from "react";
import { Property } from "@/data/mockProperties";
import { Calculator, ShieldCheck } from "lucide-react";

export default function CostCalculator({ property }: { property: Property }) {
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const insuranceCost = 85; // fixed mock value
  const total = property.price + property.condo + (includeInsurance ? insuranceCost : 0);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-primary" />
        <h3 className="text-xl font-bold">Custo Mensal Real</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
          <span>Aluguel</span>
          <span className="font-medium">R$ {property.price.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
          <span>Condomínio + IPTU</span>
          <span className="font-medium">R$ {property.condo.toLocaleString('pt-BR')}</span>
        </div>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input 
              type="checkbox" 
              checked={includeInsurance}
              onChange={(e) => setIncludeInsurance(e.target.checked)}
              className="rounded text-primary focus:ring-primary bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20"
            />
            <span className="group-hover:text-primary transition-colors flex items-center gap-1">
              Seguro Fiança <ShieldCheck size={14} className="text-green-500" />
            </span>
          </div>
          <span className="font-medium">R$ {insuranceCost}</span>
        </label>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
        <div className="flex justify-between items-end">
          <span className="font-bold text-gray-900 dark:text-white">Total</span>
          <span className="text-3xl font-extrabold text-primary">R$ {total.toLocaleString('pt-BR')}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">Sem surpresas no fim do mês.</p>
      </div>
    </div>
  );
}
