// Type contract matching exactly the Prisma schema output
export interface Property {
  id: string;
  title: string;
  description: string | null;
  basePrice: number;
  condominiumFee?: number | null;
  iptuTax?: number | null;
  areaUseful: number;
  areaTotal?: number | null;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'RURAL';
  transactionType: ('RENT' | 'SALE')[];
  heavyTraffic?: boolean | null;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  parkingSpots: number;
  petFriendly: boolean;
  furnished: boolean;
  address: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  featuredImage?: string | null;
  images?: { id: string; url: string; order: number }[];
  viewCount?: number;
  isPremium?: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compat with mockProperties consumers
  tags?: string[];
  condo?: number;
  nearestUniversity?: { distance: number; name: string };
}
