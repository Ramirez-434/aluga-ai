'use client';

import { useState, useEffect, useRef } from 'react';
import { Hammer, Sofa, Plus, CheckCircle2, AlertCircle, UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'marketplace'>('tickets');
  const [properties, setProperties] = useState<any[]>([]); // mock or real data
  
  // Ticket State
  const [tickets, setTickets] = useState<any[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Hidráulica');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketProp, setTicketProp] = useState('');

  // Furniture State
  const [furniture, setFurniture] = useState<any[]>([]);
  const [showFurnModal, setShowFurnModal] = useState(false);
  const [furnTitle, setFurnTitle] = useState('');
  const [furnDesc, setFurnDesc] = useState('');
  const [furnPrice, setFurnPrice] = useState('');
  const [furnImg, setFurnImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch tickets
    fetch('/api/tenant/tickets').then(res => res.json()).then(data => {
      if (data.tickets) setTickets(data.tickets);
    });
    // Fetch furniture
    fetch('/api/tenant/furniture').then(res => res.json()).then(data => {
      if (data.furniture) setFurniture(data.furniture);
    });
    
    // Simulating fetched rented property (in a real app, query from user rentals)
    setProperties([{ id: 'cly123', title: 'Apartamento Lumina (102)' }]);
    setTicketProp('cly123');
  }, []);

  const handleOpenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tenant/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: ticketProp, category: ticketCategory, description: ticketDesc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao abrir chamado');
      
      toast.success('Chamado aberto com sucesso!');
      setTickets([data.ticket, ...tickets]);
      setShowTicketModal(false);
      setTicketDesc('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Auditoria 1: Compressão WebP rigorosa < 200kb
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimension 800px
        const MAX_SIZE = 800;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to WebP at 0.7 quality to guarantee < 200kb
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        setFurnImg(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateFurniture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!furnImg) return toast.error('Selecione uma imagem');
    
    try {
      const res = await fetch('/api/tenant/furniture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: furnTitle, description: furnDesc, price: Number(furnPrice) || 0, imageUrl: furnImg })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Móvel listado no Desapego!');
      setFurniture([data.furniture, ...furniture]);
      setShowFurnModal(false);
      setFurnImg(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteFurniture = async (id: string) => {
    try {
      const res = await fetch(`/api/tenant/furniture/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar móvel');
      setFurniture(furniture.filter(f => f.id !== id));
      toast.success('Móvel deletado (Storage limpo)');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Portal do Morador</h1>
        <p className="text-gray-500 font-medium mt-1">Sua central de facilidades exclusivas do Walled Garden.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Hammer size={18} /> Central de Manutenção
        </button>
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Sofa size={18} /> Módulo de Desapego
        </button>
      </div>

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seus Chamados</h2>
            <button onClick={() => setShowTicketModal(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all">
              <Plus size={16} /> Abrir Chamado
            </button>
          </div>
          
          <div className="grid gap-4">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white dark:bg-[#1a1a1a] border border-dashed rounded-3xl">
                Nenhum chamado aberto. Seu imóvel está em perfeitas condições!
              </div>
            ) : (
              tickets.map(t => (
                <div key={t.id} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.status === 'OPEN' ? 'bg-rose-100 text-rose-600' : t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {t.status}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{t.category}</span>
                    </div>
                    <p className="text-sm text-gray-500">{t.description}</p>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MARKETPLACE TAB */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seus Desapegos</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Exclusivo para inquilinos
              </p>
            </div>
            <button onClick={() => setShowFurnModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
              <Plus size={16} /> Anunciar Móvel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {furniture.length === 0 ? (
              <div className="col-span-full p-12 text-center text-gray-400 bg-white dark:bg-[#1a1a1a] border border-dashed rounded-3xl">
                Você ainda não anunciou nenhum móvel.
              </div>
            ) : (
              furniture.map(f => (
                <div key={f.id} className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm relative group">
                  <button onClick={() => handleDeleteFurniture(f.id)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-10">
                    <X size={14} />
                  </button>
                  <div className="h-40 bg-gray-100 dark:bg-white/5 relative">
                    {f.imageUrl ? <img src={f.imageUrl} className="w-full h-full object-cover" alt={f.title} /> : <div className="flex items-center justify-center h-full text-gray-400"><Sofa size={30} /></div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{f.title}</h3>
                    <p className="text-emerald-600 font-black mt-1">
                      {f.price === 0 ? 'DOAÇÃO' : `R$ ${f.price.toLocaleString('pt-BR')}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Abrir Chamado</h3>
            <form onSubmit={handleOpenTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Imóvel</label>
                <select value={ticketProp} onChange={e => setTicketProp(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none">
                  {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none">
                  <option>Hidráulica</option>
                  <option>Elétrica</option>
                  <option>Estrutural</option>
                  <option>Eletrodomésticos</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                <textarea required value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none h-24 resize-none" placeholder="Detalhe o problema..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTicketModal(false)} className="flex-1 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">Enviar Chamado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Furniture Modal */}
      {showFurnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Anunciar Desapego</h3>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1"><AlertCircle size={12} /> A imagem será otimizada em WebP (&lt;200kb)</p>
            
            <form onSubmit={handleCreateFurniture} className="space-y-4">
              {/* Image Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors overflow-hidden relative"
              >
                {furnImg ? (
                  <img src={furnImg} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <UploadCloud size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-500">Toque para anexar foto</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">O que você está vendendo/doando?</label>
                <input required value={furnTitle} onChange={e => setFurnTitle(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none" placeholder="Ex: Geladeira Brastemp 400L" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Preço (Deixe 0 para Doação)</label>
                  <input type="number" required value={furnPrice} onChange={e => setFurnPrice(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none font-bold text-emerald-600" placeholder="R$ 0,00" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFurnModal(false)} className="flex-1 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30">Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
