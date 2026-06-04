'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarData {
  name: string;
  views: number;
  clicks: number;
  favoritos: number;
}

export default function PropertyBarChart({ data }: { data: BarData[] }) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Nenhum dado disponível</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          dy={8}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
          cursor={{ fill: 'rgba(99,102,241,0.06)' }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
        <Bar dataKey="views" name="Visualizações" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="clicks" name="Leads WhatsApp" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="favoritos" name="Favoritos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
