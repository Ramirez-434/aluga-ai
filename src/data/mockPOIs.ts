export type POICategory = 'university' | 'hospital' | 'marketplace' | 'other';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number; // Export name is lng instead of lon, but we can handle it
}

export const MOCK_POIS: POI[] = [
  // Universidades (Gurupi & Natividade)
  { id: "u1", name: "Campus UnirG", category: "university", lat: -11.7250, lng: -49.0660 },
  { id: "u2", name: "Campus UFT - Gurupi", category: "university", lat: -11.7450, lng: -49.0550 },
  { id: "u3", name: "Polo UNITINS", category: "university", lat: -11.7102, lng: -47.7250 },
  
  // Hospitais
  { id: "h1", name: "Hospital Regional de Gurupi", category: "hospital", lat: -11.7285, lng: -49.0670 },
  { id: "h2", name: "Hospital Unimed", category: "hospital", lat: -11.7300, lng: -49.0600 },
  { id: "h3", name: "Hospital Municipal de Natividade", category: "hospital", lat: -11.7150, lng: -47.7200 },

  // Supermercados
  { id: "s1", name: "Supermercado Beira Rio", category: "marketplace", lat: -11.7240, lng: -49.0650 },
  { id: "s2", name: "Atacadão", category: "marketplace", lat: -11.7500, lng: -49.0700 },
  { id: "s3", name: "Mercado Central (Natividade)", category: "marketplace", lat: -11.7110, lng: -47.7238 }
];
