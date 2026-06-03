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
          favoritedBy: true
        }
      }
    }
  });

  if (!user || (user.role !== "ADVERTISER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Aggregate stats
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

  user.properties.forEach(property => {
    totalViews += property.viewCount; // fallback global
    totalFavorites += property.favoritedBy.length;
    
    property.dailyStats.forEach(stat => {
      totalClicks += stat.clicks;
      
      const statDate = new Date(stat.date).toISOString().split('T')[0];
      if (last30DaysStats[statDate] !== undefined) {
        last30DaysStats[statDate].views += stat.views;
        last30DaysStats[statDate].clicks += stat.clicks;
      }
    });
  });

  // Convert map to array for Recharts
  const chartData = Object.entries(last30DaysStats).map(([date, data]) => {
    const [, month, day] = date.split('-');
    return {
      name: `${day}/${month}`,
      views: data.views,
      clicks: data.clicks,
    };
  });

  return NextResponse.json({
    totalProperties: user.properties.length,
    totalViews,
    totalClicks,
    totalFavorites,
    chartData
  });
}
