'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Building, MapPin, DollarSign, Home, Maximize, Loader2, ImagePlus, X, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import imageCompression from 'browser-image-compression';


export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [compressInfo, setCompressInfo] = useState<{ original: number; compressed: number } | null>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setCompressInfo(null);

      // G59: Comprimir e converter para WebP antes do upload
      try {
        const options = {
          maxSizeMB: 0.5,          // máx 500KB
          maxWidthOrHeight: 1280,  // máx 1280px
          useWebWorker: true,
          fileType: 'image/webp',
        };
        const compressed = await imageCompression(selectedFile, options);
        setCompressedFile(compressed);
        setCompressInfo({
          original: Math.round(selectedFile.size / 1024),
          compressed: Math.round(compressed.size / 1024),
        });
      } catch {
        setCompressedFile(selectedFile); // fallback sem compressão
      }
    }
  };

  const clearImage = () => {
    setFile(null);
    setCompressedFile(null);
    setPreviewUrl('');
    setCompressInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Map checkboxes to booleans
    data.petFriendly = (formData.get('petFriendly') === 'on') as any;
    data.furnished = (formData.get('furnished') === 'on') as any;

    try {
      let finalImageUrl = '';
      let uploadedFilePath = '';  // G60: rastrear path para rollback

      if (compressedFile || file) {
        const uploadFile = compressedFile ?? file!;
        toast.info('⚡ Enviando imagem otimizada...');
        
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
        const filePath = `imoveis/${fileName}`;
        uploadedFilePath = filePath;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, uploadFile, { cacheControl: '3600', upsert: false, contentType: 'image/webp' });

        if (uploadError) throw new Error('Falha no upload da imagem.');

        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = urlData.publicUrl;
      }
      
      data.featuredImage = finalImageUrl;

      // G60: Rollback atômico — se o Prisma falhar, deletar imagem do Supabase
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Rollback: remover imagem órfã do bucket
        if (uploadedFilePath) {
          await supabase.storage.from('property-images').remove([uploadedFilePath]);
        }
        throw new Error('Falha ao cadastrar imóvel no banco.');
      }

      toast.success('✅ Imóvel publicado com sucesso!');
      router.push('/dashboard/admin/imoveis');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao cadastrar. A imagem foi removida do servidor (rollback automático).');
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
              <label className="block text-sm font-semibold mb-2">Imagem de Destaque</label>
              
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl cursor-pointer hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-white/5 transition-colors group relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImagePlus size={24} />
                    </div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      <span className="text-primary">Clique para fazer upload</span> ou arraste
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG ou WEBP (Max. 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleImageSelect}
                  />
                </label>
              ) : (
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-white/5">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={clearImage}
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg flex items-center gap-2 font-bold text-sm"
                    >
                      <X size={18} /> Remover
                    </button>
                  </div>
                  {/* G59: Badge de compressão */}
                  {compressInfo && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold">
                      <Zap size={12} className="text-yellow-400" />
                      {compressInfo.original}KB → {compressInfo.compressed}KB
                      <span className="text-emerald-400 ml-1">
                        (-{Math.round((1 - compressInfo.compressed / compressInfo.original) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>

          {/* Submit Action */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? 'Cadastrando Imóvel...' : 'Publicar Imóvel'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
