import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      properties: {
        include: {
          dailyStats: true,
          favoritedBy: true,
          images: { take: 1, orderBy: { order: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user || (user.role !== "ADVERTISER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Aggregate global stats
  let totalViews = 0;
  let totalClicks = 0;
  let totalFavorites = 0;
  const last30DaysStats: Record<string, { views: number; clicks: number }> = {};

  // Initialize the last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last30DaysStats[dateStr] = { views: 0, clicks: 0 };
  }

  // Per-property stats
  const propertiesStats = user.properties.map(property => {
    let propViews = property.viewCount;
    let propClicks = 0;
    const propFavorites = property.favoritedBy.length;

    property.dailyStats.forEach(stat => {
      propClicks += stat.clicks;
      totalClicks += stat.clicks;

      const statDate = new Date(stat.date).toISOString().split('T')[0];
      if (last30DaysStats[statDate] !== undefined) {
        last30DaysStats[statDate].views += stat.views;
        last30DaysStats[statDate].clicks += stat.clicks;
      }
    });

    totalViews += propViews;
    totalFavorites += propFavorites;

    const ctr = propViews > 0 ? parseFloat(((propClicks / propViews) * 100).toFixed(1)) : 0;
    // Health score: weighted composite metric (0-100)
    const score = Math.min(100, propViews * 0.3 + propClicks * 5 + propFavorites * 8);

    return {
      id: property.id,
      title: property.title,
      price: property.price,
      city: property.city,
      isPremium: property.isPremium,
      featuredImage: property.images[0]?.url ?? property.featuredImage,
      views: propViews,
      clicks: propClicks,
      favorites: propFavorites,
      ctr,
      score: Math.round(score),
    };
  });

  // Sort by score desc for ranking
  propertiesStats.sort((a, b) => b.score - a.score);

  // Convert map to array for Recharts Area Chart
  const chartData = Object.entries(last30DaysStats).map(([date, data]) => {
    const [, month, day] = date.split('-');
    return {
      name: `${day}/${month}`,
      views: data.views,
      clicks: data.clicks,
    };
  });

  // Bar chart data: per-property comparison (top 5)
  const barChartData = propertiesStats.slice(0, 5).map(p => ({
    name: p.title.length > 18 ? p.title.substring(0, 18) + '\u2026' : p.title,
    views: p.views,
    clicks: p.clicks,
    favoritos: p.favorites,
  }));

  return NextResponse.json({
    totalProperties: user.properties.length,
    totalViews,
    totalClicks,
    totalFavorites,
    chartData,
    barChartData,
    propertiesStats,
  });
}
