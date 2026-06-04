import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const propriedadesMock = [
  // --- POLO GURUPI ---
  {
    id: "seed-real-1",
    title: "Kitnet Estudantil Premium - UnirG",
    description: "Ideal para universitários. A 5 minutos a pé do campus da UnirG.",
    price: 850.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    area: 35,
    isPremium: true,
    petFriendly: false,
    furnished: true,
    neighborhood: "Setor Sul",
    address: "Setor Sul, Gurupi",
    city: "Gurupi",
    lat: -11.730100, // Região Central / UnirG
    lng: -49.066000,
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-real-2",
    title: "Casa 3 Quartos - Próximo à UFT",
    description: "Ampla casa no setor Nova Fronteira, rota rápida para o campus da UFT.",
    price: 1500.00,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    parkingSpots: 2,
    area: 120,
    isPremium: false,
    petFriendly: true,
    furnished: false,
    neighborhood: "Setor Nova Fronteira",
    address: "Nova Fronteira, Gurupi",
    city: "Gurupi",
    lat: -11.751000, // Vetor Sul / UFT
    lng: -49.048000,
    featuredImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-real-3",
    title: "Apartamento Executivo - Centro",
    description: "Mobiliado, ar condicionado e sacada. Perto da rodoviária e comércios.",
    price: 2200.00,
    bedrooms: 2,
    bathrooms: 2,
    suites: 1,
    parkingSpots: 1,
    area: 75,
    isPremium: true,
    petFriendly: true,
    furnished: true,
    neighborhood: "Centro",
    address: "Centro, Gurupi",
    city: "Gurupi",
    lat: -11.725000, // Centro Expandido
    lng: -49.068000,
    featuredImage: "https://images.unsplash.com/photo-1502672260266-1c1de24244ec?auto=format&fit=crop&q=80&w=800"
  },

  // --- POLO NATIVIDADE ---
  {
    id: "seed-real-4",
    title: "Kitnet Econômica Unitins",
    description: "Espaço compacto e silencioso, ideal para focar nos estudos. Perto do campus.",
    price: 600.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    area: 30,
    isPremium: false,
    petFriendly: false,
    furnished: false,
    neighborhood: "Setor Universitário",
    address: "Arredores Unitins, Natividade",
    city: "Natividade",
    lat: -11.708500, // Arredores Unitins
    lng: -47.722000,
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-real-5",
    title: "Casa Histórica Reformada",
    description: "Fachada colonial preservada com interior moderno e internet fibra ótica.",
    price: 1200.00,
    bedrooms: 2,
    bathrooms: 2,
    suites: 0,
    parkingSpots: 0,
    area: 90,
    isPremium: true,
    petFriendly: true,
    furnished: true,
    neighborhood: "Centro Histórico",
    address: "Centro Histórico, Natividade",
    city: "Natividade",
    lat: -11.705000, // Centro Histórico
    lng: -47.725000,
    featuredImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800"
  }
];

async function main() {
  console.log(`Start seeding ...`)
  
  // Create an admin user for ownership
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aluga.ai' },
    update: {},
    create: {
      email: 'admin@aluga.ai',
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  console.log(`Created admin user with id: ${admin.id}`)

  // Upsert properties and generate daily stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const prop of propriedadesMock) {
    const property = await prisma.property.upsert({
      where: { id: prop.id },
      update: {
        ...prop,
        ownerId: admin.id,
      },
      create: {
        ...prop,
        ownerId: admin.id,
      },
    });
    console.log(`Created/Updated property with id: ${property.id}`)

    // Generate 14 days of mock data for PropertyDailyStat
    for (let i = 0; i <= 14; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);

      // Random views between 10 and 150
      const mockViews = Math.floor(Math.random() * 140) + 10;
      // Clicks are usually 5-20% of views
      const mockClicks = Math.floor(mockViews * (Math.random() * 0.15 + 0.05));

      await prisma.propertyDailyStat.upsert({
        where: {
          propertyId_date: {
            propertyId: property.id,
            date: targetDate,
          }
        },
        update: {
          views: mockViews,
          clicks: mockClicks,
        },
        create: {
          propertyId: property.id,
          date: targetDate,
          views: mockViews,
          clicks: mockClicks,
        }
      });
    }
  }

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
