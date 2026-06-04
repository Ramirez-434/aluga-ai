'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Building, MapPin, DollarSign, Home, Maximize, Loader2, ImagePlus, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import imageCompression from 'browser-image-compression';

export default function EditPropertyForm({ property }: { property: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  type ImageItem = {
    id: string; // local or db id
    url: string; // preview url or db url
    file?: File;
    compressedFile?: File;
    compressInfo?: { original: number; compressed: number };
    isExisting?: boolean;
  };

  const initialImages: ImageItem[] = (property.images && property.images.length > 0) 
    ? property.images.map((img: any) => ({ id: img.id, url: img.url, isExisting: true }))
    : (property.featuredImage ? [{ id: 'featured', url: property.featuredImage, isExisting: true }] : []);

  const [images, setImages] = useState<ImageItem[]>(initialImages);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      const newItems: ImageItem[] = [];
      
      for (const selectedFile of selectedFiles) {
        const id = Math.random().toString(36).substring(7);
        const url = URL.createObjectURL(selectedFile);
        
        let compressedFile = selectedFile;
        let compressInfo = null;

      // G59: Comprimir e converter para WebP antes do upload
        try {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            fileType: 'image/webp',
          };
          compressedFile = await imageCompression(selectedFile, options);
          compressInfo = {
            original: Math.round(selectedFile.size / 1024),
            compressed: Math.round(compressedFile.size / 1024),
          };
        } catch (error) {
          console.error("Compression failed", error);
        }

        newItems.push({
          id,
          url,
          file: selectedFile,
          compressedFile,
          compressInfo: compressInfo ?? undefined,
          isExisting: false
        });
      }
      
      setImages(prev => [...prev, ...newItems]);
    }
  };

  const removeImage = (idToRemove: string) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
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
      const uploadedFilePaths: string[] = [];
      const finalImageUrls: string[] = [];

      toast.info('⚡ Processando imagens...');

      for (const img of images) {
        if (img.isExisting) {
          finalImageUrls.push(img.url);
        } else if (img.compressedFile || img.file) {
          const uploadFile = img.compressedFile ?? img.file!;
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
          const filePath = `imoveis/${fileName}`;
          uploadedFilePaths.push(filePath);

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, uploadFile, { cacheControl: '3600', upsert: false, contentType: 'image/webp' });

          if (uploadError) throw new Error('Falha no upload da imagem.');

          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);
            
          finalImageUrls.push(urlData.publicUrl);
        }
      }
      
      data.images = finalImageUrls as any;

      const response = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Rollback: remover imagens órfãs do bucket
        if (uploadedFilePaths.length > 0) {
          await supabase.storage.from('property-images').remove(uploadedFilePaths);
        }
        throw new Error('Falha ao atualizar imóvel.');
      }

      toast.success('✅ Imóvel atualizado com sucesso!');
      router.push('/dashboard/admin/imoveis');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-24">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-16 flex items-center sticky top-0 z-40">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link href="/dashboard/admin/imoveis" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar</span>
          </Link>
          <h1 className="font-bold text-gray-900 dark:text-white">Editar Imóvel</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <Building className="text-indigo-600" /> Informações Principais
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título do Anúncio</label>
                <input 
                  required name="title" type="text" defaultValue={property.title}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Descrição Detalhada</label>
                <textarea 
                  required name="description" rows={4} defaultValue={property.description}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><DollarSign size={16}/> Valor Mensal (R$)</label>
                  <input 
                    required name="price" type="number" step="0.01" defaultValue={property.price}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-1"><Maximize size={16}/> Área Útil (m²)</label>
                  <input 
                    required name="area" type="number" defaultValue={property.area}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <Home className="text-indigo-600" /> Ficha Técnica
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Quartos</label>
                <input required name="bedrooms" type="number" min="0" defaultValue={property.bedrooms} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Banheiros</label>
                <input required name="bathrooms" type="number" min="1" defaultValue={property.bathrooms} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Vagas</label>
                <input required name="parkingSpots" type="number" min="0" defaultValue={property.parkingSpots} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" name="petFriendly" defaultChecked={property.petFriendly} className="peer sr-only" />
                  <div className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pet Friendly</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" name="furnished" defaultChecked={property.furnished} className="peer sr-only" />
                  <div className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer-checked:bg-indigo-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Mobiliado</span>
              </label>
            </div>
          </section>

          <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
              <MapPin className="text-indigo-600" /> Localização & Mídia
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Cidade</label>
                <select name="city" defaultValue={property.city} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all">
                  <option value="Gurupi">Gurupi</option>
                  <option value="Natividade">Natividade</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bairro</label>
                <input required name="neighborhood" type="text" defaultValue={property.neighborhood} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Endereço Completo</label>
              <input required name="address" type="text" defaultValue={property.address} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center justify-between">
                Galeria de Imagens
                <span className="text-xs text-gray-500 font-normal">{images.length} foto(s)</span>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 group bg-gray-100 dark:bg-white/5">
                    <img 
                      src={img.url} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        Capa
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                        title="Remover imagem"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {/* G59: Badge de compressão (apenas novas) */}
                    {img.compressInfo && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[9px] font-bold">
                        <Zap size={10} className="text-yellow-400" />
                        {img.compressInfo.compressed}KB
                      </div>
                    )}
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl cursor-pointer hover:border-indigo-600 bg-gray-50 dark:bg-white/5 transition-colors group relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <div className="w-10 h-10 mb-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImagePlus size={20} />
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold text-center px-2">Adicionar Foto</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    className="hidden" 
                    onChange={handleImageSelect}
                  />
                </label>
              </div>

            </div>
          </section>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? 'Atualizando Imóvel...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
