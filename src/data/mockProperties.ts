export type Property = {
  id: string;
  title: string;
  basePrice: number;
  condominiumFee: number | null;
  iptuTax: number | null;
  featuredImage: string;
  bedrooms: number;
  bathrooms: number;
  areaUseful: number;
  areaTotal: number | null;
  address: string;
  lat: number;
  lng: number;
  tags: string[];
  nearestUniversity?: { distance: number; name: string };
  propertyCategory?: 'RESIDENTIAL' | 'COMMERCIAL';
  transactionType?: 'RENT' | 'SALE';
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Casarão Histórico Colonial",
    basePrice: 3500,
    condominiumFee: 0,
    iptuTax: 0,
    featuredImage: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80&w=800",
    bedrooms: 4,
    bathrooms: 2,
    areaUseful: 250,
    areaTotal: null,
    address: "Centro Histórico, Natividade - TO",
    lat: -11.7095,
    lng: -47.7230,
    tags: ["Tombado", "Quintal Amplo", "Ideal para Turismo"],
    propertyCategory: 'RESIDENTIAL',
    transactionType: 'RENT'
  },
  {
    id: "2",
    title: "Chácara Recanto do Sol",
    basePrice: 1800,
    condominiumFee: 0,
    iptuTax: 0,
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    bedrooms: 2,
    bathrooms: 1,
    areaUseful: 1200,
    areaTotal: null,
    address: "Zona Rural, Natividade - TO",
    lat: -11.7150,
    lng: -47.7300,
    tags: ["Área Verde", "Piscina Natural", "Pet Friendly"],
    propertyCategory: 'RESIDENTIAL',
    transactionType: 'RENT'
  },
  {
    id: "3",
    title: "Ponto Comercial Matriz",
    basePrice: 2200,
    condominiumFee: 0,
    iptuTax: 0,
    featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    bedrooms: 0,
    bathrooms: 1,
    areaUseful: 90,
    areaTotal: null,
    address: "Praça da Matriz, Natividade - TO",
    lat: -11.7100,
    lng: -47.7240,
    tags: ["Fluxo de Pedestres", "Esquina"],
    propertyCategory: 'COMMERCIAL',
    transactionType: 'RENT'
  },
  {
    id: "4",
    title: "Casa Aconchegante com Pomar",
    basePrice: 1200,
    condominiumFee: 0,
    iptuTax: 0,
    featuredImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    bedrooms: 3,
    bathrooms: 2,
    areaUseful: 150,
    areaTotal: null,
    address: "Setor Bela Vista, Natividade - TO",
    lat: -11.7050,
    lng: -47.7200,
    tags: ["Árvores Frutíferas", "Vizinhança Tranquila"],
    propertyCategory: 'RESIDENTIAL',
    transactionType: 'RENT'
  },
  {
    id: "5",
    title: "Apto Modernizado no Centro",
    basePrice: 950,
    condominiumFee: 100,
    iptuTax: 50,
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800",
    bedrooms: 1,
    bathrooms: 1,
    areaUseful: 55,
    areaTotal: null,
    address: "Centro, Natividade - TO",
    lat: -11.7080,
    lng: -47.7250,
    tags: ["Recém Reformado", "Próximo a Mercados"],
    propertyCategory: 'RESIDENTIAL',
    transactionType: 'RENT'
  }
];
