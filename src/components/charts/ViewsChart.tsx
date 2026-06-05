'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatData {
  date: string;
  views: number;
  clicks: number;
}

interface ViewsChartProps {
  data: StatData[];
}

export function ViewsChart({ data }: ViewsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 font-medium text-sm">
        Dados insuficientes para gerar o gráfico.
      </div>
    );
  }

  // Ordena os dados por data antes de plotar
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Formata os dados para o gráfico
  const chartData = sortedData.map(d => ({
    name: format(new Date(d.date), 'dd MMM', { locale: ptBR }),
    Visualizações: d.views,
    Leads: d.clicks
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-white/5" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 11 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '12px 16px',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
          itemStyle={{ padding: '2px 0' }}
        />
        <Area
          type="monotone"
          dataKey="Visualizações"
          stroke="#4f46e5"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorViews)"
          activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
        />
        <Area
          type="monotone"
          dataKey="Leads"
          stroke="#10b981"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorLeads)"
          activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
