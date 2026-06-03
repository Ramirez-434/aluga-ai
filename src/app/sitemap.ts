import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// G62: Sitemap dinâmico para indexação SEO no Google
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aluga-ai.com.br';

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Páginas dinâmicas de imóveis
  try {
    const properties = await prisma.property.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const propertyPages: MetadataRoute.Sitemap = properties.map(p => ({
      url: `${baseUrl}/imovel/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...propertyPages];
  } catch {
    return staticPages;
  }
}
