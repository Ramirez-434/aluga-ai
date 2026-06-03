// Type contract matching exactly the Prisma schema output
export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  area: number;
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
  featuredImage: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compat with mockProperties consumers
  tags?: string[];
  condo?: number;
}
