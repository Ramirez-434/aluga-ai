export type POICategory = 'turismo' | 'escola' | 'farmacia' | 'comercio';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
}

// Base coordinates for Natividade-TO: -11.710, -47.724
// Distributing points realistically around the historical center and main avenues.
export const MOCK_POIS: POI[] = [
  // TURISMO
  { id: "t1", name: "Igreja Matriz de N. Sra. da Natividade", category: "turismo", lat: -11.7095, lng: -47.7242 },
  { id: "t2", name: "Ruínas da Igreja do Rosário dos Pretos", category: "turismo", lat: -11.7110, lng: -47.7238 },
  { id: "t3", name: "Museu Municipal de Natividade", category: "turismo", lat: -11.7102, lng: -47.7250 },
  
  // ESCOLAS
  { id: "e1", name: "Colégio Estadual Dr. Quintiliano da Silva", category: "escola", lat: -11.7085, lng: -47.7260 },
  { id: "e2", name: "Escola Estadual Joaquim Lino Suarte", category: "escola", lat: -11.7130, lng: -47.7220 },
  { id: "e3", name: "Centro Educacional Decisivo", category: "escola", lat: -11.7070, lng: -47.7235 },

  // FARMÁCIAS
  { id: "f1", name: "Drogavita", category: "farmacia", lat: -11.7105, lng: -47.7225 },
  { id: "f2", name: "Drogaria Moura", category: "farmacia", lat: -11.7090, lng: -47.7245 },
  { id: "f3", name: "Farmácia N. Sra. das Graças", category: "farmacia", lat: -11.7120, lng: -47.7255 },

  // COMÉRCIO / SUPERMERCADOS
  { id: "c1", name: "Supermercado Fora de Hora", category: "comercio", lat: -11.7092, lng: -47.7248 },
  { id: "c2", name: "Mercado Central", category: "comercio", lat: -11.7115, lng: -47.7230 },
  { id: "c3", name: "Padaria Pão de Mel", category: "comercio", lat: -11.7108, lng: -47.7215 },
];
