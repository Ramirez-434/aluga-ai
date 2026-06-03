'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Building, MapPin, DollarSign, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Map checkboxes to booleans
    data.petFriendly = (formData.get('petFriendly') === 'on') as any;
    data.furnished = (formData.get('furnished') === 'on') as any;

    try {
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Falha ao cadastrar');

      toast.success('Imóvel cadastrado com sucesso!');
      router.push('/dashboard/admin/imoveis');
      router.refresh();
    } catch (error) {
      toast.error('Ocorreu um erro ao cadastrar o imóvel.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-16 flex items-center sticky top-0 z-40">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link href="/dashboard/admin/imoveis" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar</span>
          </Link>
          <h1 className="font-bold text-gray-900 dark:text-white">Novo Imóvel</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sessão 1: Informações Básicas */}
          <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <Building className="text-primary" /> Informações Principais
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título do Anúncio</label>
                <input 
                  required name="title" type="text" placeholder="Ex: Apartamento 2 Quartos no Centro"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Descrição Detalhada</label>
                <textarea 
                  required name="description" rows={4} placeholder="Descreva os diferenciais do imóvel..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><DollarSign size={16}/> Valor Mensal (R$)</label>
                  <input 
                    required name="price" type="number" step="0.01" placeholder="Ex: 1500"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><Maximize size={16}/> Área Útil (m²)</label>
                  <input 
                    required name="area" type="number" placeholder="Ex: 65"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sessão 2: Especificações */}
          <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <Home className="text-primary" /> Ficha Técnica
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Quartos</label>
                <input required name="bedrooms" type="number" min="0" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Banheiros</label>
                <input required name="bathrooms" type="number" min="1" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Vagas</label>
                <input required name="parkingSpots" type="number" min="0" defaultValue="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" name="petFriendly" className="peer sr-only" />
                  <div className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pet Friendly</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" name="furnished" className="peer sr-only" />
                  <div className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer-checked:bg-indigo-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Mobiliado</span>
              </label>
            </div>
          </section>

          {/* Sessão 3: Localização e Mídia */}
          <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <MapPin className="text-primary" /> Localização & Mídia
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Cidade</label>
                <select name="city" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all">
                  <option value="Gurupi">Gurupi</option>
                  <option value="Natividade">Natividade</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bairro</label>
                <input required name="neighborhood" type="text" placeholder="Ex: Centro" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Endereço Completo</label>
              <input required name="address" type="text" placeholder="Rua, Número, Complemento" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">URL da Imagem de Destaque</label>
              <div className="flex gap-4">
                <input 
                  required name="featuredImage" type="url" 
                  placeholder="https://images.unsplash.com/photo-..." 
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary outline-none transition-all" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Upload size={12} /> Cole o link direto de uma imagem. O upload para S3 será implementado no futuro.
              </p>
              
              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4 relative w-full h-48 rounded-xl overflow-hidden bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Submit Action */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isLoading ? 'Cadastrando...' : 'Publicar Imóvel'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
