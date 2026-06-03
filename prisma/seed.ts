import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const propriedadesMock = [
  {
    id: "seed-prop-1",
    title: "Apartamento Central com Varanda",
    description: "Excelente apartamento no coração da cidade, ideal para estudantes ou casais. Próximo a bancos e supermercados.",
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 1,
    area: 65,
    lat: -11.7294,
    lng: -49.0681, 
    city: "Gurupi",
    neighborhood: "Centro",
    address: "Centro, Gurupi - TO",
    petFriendly: false,
    furnished: true,
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "seed-prop-2",
    title: "Casa Ampla com Quintal",
    description: "Casa recém-reformada, com grande área externa e churrasqueira. Perfeita para famílias.",
    price: 1850,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    parkingSpots: 2,
    area: 120,
    lat: -11.7450,
    lng: -49.0550, 
    city: "Gurupi",
    neighborhood: "Setor Nova Fronteira",
    address: "Setor Nova Fronteira, Gurupi - TO",
    petFriendly: true,
    furnished: false,
    featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "seed-prop-3",
    title: "Kitnet Prática e Econômica",
    description: "Espaço otimizado, excelente para quem busca praticidade. Fica a poucos minutos do campus universitário.",
    price: 750,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    area: 35,
    lat: -11.7350,
    lng: -49.0750, 
    city: "Gurupi",
    neighborhood: "Setor Universitário",
    address: "Setor Universitário, Gurupi - TO",
    petFriendly: true,
    furnished: false,
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "seed-prop-4",
    title: "Casarão Colonial Preservado",
    description: "Charme histórico com infraestrutura modernizada. Pé direito alto e localização turística privilegiada.",
    price: 1500,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    parkingSpots: 1,
    area: 140,
    lat: -11.7100,
    lng: -47.7320, 
    city: "Natividade",
    neighborhood: "Centro Histórico",
    address: "Centro Histórico, Natividade - TO",
    petFriendly: true,
    furnished: true,
    featuredImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60"
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

  // Upsert properties
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
