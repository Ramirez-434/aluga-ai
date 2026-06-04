export type Property = {
  id: string;
  title: string;
  price: number;
  condo: number;
  featuredImage: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  lat: number;
  lng: number;
  tags: string[];
  nearestUniversity?: { distance: number; name: string };
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Casarão Histórico Colonial",
    price: 3500,
    condo: 0,
    featuredImage: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80&w=800",
    bedrooms: 4,
    bathrooms: 2,
    area: 250,
    address: "Centro Histórico, Natividade - TO",
    lat: -11.7095,
    lng: -47.7230,
    tags: ["Tombado", "Quintal Amplo", "Ideal para Turismo"]
  },
  {
    id: "2",
    title: "Chácara Recanto do Sol",
    price: 1800,
    condo: 0,
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    bedrooms: 2,
    bathrooms: 1,
    area: 1200,
    address: "Zona Rural, Natividade - TO",
    lat: -11.7150,
    lng: -47.7300,
    tags: ["Área Verde", "Piscina Natural", "Pet Friendly"]
  },
  {
    id: "3",
    title: "Ponto Comercial Matriz",
    price: 2200,
    condo: 0,
    featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    bedrooms: 0,
    bathrooms: 1,
    area: 90,
    address: "Praça da Matriz, Natividade - TO",
    lat: -11.7100,
    lng: -47.7240,
    tags: ["Fluxo de Pedestres", "Esquina"]
  },
  {
    id: "4",
    title: "Casa Aconchegante com Pomar",
    price: 1200,
    condo: 0,
    featuredImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    address: "Setor Bela Vista, Natividade - TO",
    lat: -11.7050,
    lng: -47.7200,
    tags: ["Árvores Frutíferas", "Vizinhança Tranquila"]
  },
  {
    id: "5",
    title: "Apto Modernizado no Centro",
    price: 950,
    condo: 100,
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800",
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    address: "Centro, Natividade - TO",
    lat: -11.7080,
    lng: -47.7250,
    tags: ["Recém Reformado", "Próximo a Mercados"]
  }
];
