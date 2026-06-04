import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Coordenadas Centrais das Universidades
// UnirG: -11.728, -49.066
// UFT: -11.745, -49.048
// Unitins: -11.710, -47.724

const propriedadesMock = [
  // --- POLO UNIRG (Gurupi Centro) ---
  {
    id: "seed-unirg-1",
    title: "Kitnet Estudantil Premium UnirG",
    description: "Kitnet mobiliada de alto padrão, literalmente a 5 minutos a pé do campus central da UnirG. Ar condicionado, internet fibra inclusa e segurança 24h.",
    price: 950.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    area: 35,
    isPremium: true,
    petFriendly: false,
    furnished: true,
    neighborhood: "Setor Sul",
    address: "Rua 5, Setor Sul, Gurupi",
    city: "Gurupi",
    lat: -11.729000, 
    lng: -49.065000, // < 500m da UnirG
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-unirg-2",
    title: "Loft Moderno para Estudantes de Medicina",
    description: "Ambiente silencioso, focado em estudantes que precisam de alta concentração. Armários embutidos e bancada de estudos em mármore.",
    price: 1300.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 1,
    parkingSpots: 1,
    area: 45,
    isPremium: true,
    petFriendly: false,
    furnished: true,
    neighborhood: "Setor Sul",
    address: "Avenida Goiás, Setor Sul, Gurupi",
    city: "Gurupi",
    lat: -11.727500, 
    lng: -49.067000,
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-unirg-3",
    title: "Apê Econômico 2 Quartos",
    description: "Excelente para dividir. Quartos amplos, cozinha americana. Acesso rápido ao transporte universitário.",
    price: 800.00,
    bedrooms: 2,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 1,
    area: 55,
    isPremium: false,
    petFriendly: true,
    furnished: false,
    neighborhood: "Centro",
    address: "Rua 3, Centro, Gurupi",
    city: "Gurupi",
    lat: -11.725000, 
    lng: -49.068000,
    featuredImage: "https://images.unsplash.com/photo-1502672260266-1c1e5240980c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-unirg-4",
    title: "Studio Compacto UnirG",
    description: "Praticidade e economia. Fica na mesma quadra do campus. Lavanderia compartilhada no prédio.",
    price: 650.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    area: 25,
    isPremium: false,
    petFriendly: false,
    furnished: true,
    neighborhood: "Setor Sul",
    address: "Av. Maranhão, Setor Sul, Gurupi",
    city: "Gurupi",
    lat: -11.728500, 
    lng: -49.065500,
    featuredImage: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800"
  },

  // --- POLO UFT (Gurupi Vetor Sul) ---
  {
    id: "seed-uft-1",
    title: "Casa Espaçosa p/ República - UFT",
    description: "Ideal para montagem de repúblicas. 4 quartos grandes, garagem para 3 carros, muro alto e cerca elétrica.",
    price: 1800.00,
    bedrooms: 4,
    bathrooms: 3,
    suites: 1,
    parkingSpots: 3,
    area: 200,
    isPremium: false,
    petFriendly: true,
    furnished: false,
    neighborhood: "Setor Nova Fronteira",
    address: "Rua 20, Nova Fronteira, Gurupi",
    city: "Gurupi",
    lat: -11.748000, 
    lng: -49.049000, // Próximo UFT
    featuredImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-uft-2",
    title: "Edícula Confortável (Fundos)",
    description: "Entrada independente, muito sossego para quem estuda na UFT. Região super residencial e segura.",
    price: 550.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 1,
    area: 40,
    isPremium: false,
    petFriendly: true,
    furnished: false,
    neighborhood: "Setor Nova Fronteira",
    address: "Rua 25, Nova Fronteira, Gurupi",
    city: "Gurupi",
    lat: -11.743000, 
    lng: -49.045000,
    featuredImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-uft-3",
    title: "Apartamento Novo UFT Premium",
    description: "Prédio recém inaugurado. Sacada, área de lazer com piscina. Rota rápida de bike para a UFT.",
    price: 1200.00,
    bedrooms: 2,
    bathrooms: 2,
    suites: 1,
    parkingSpots: 1,
    area: 75,
    isPremium: true,
    petFriendly: false,
    furnished: true,
    neighborhood: "Parque das Acácias",
    address: "Av. principal, Parque das Acácias, Gurupi",
    city: "Gurupi",
    lat: -11.745500, 
    lng: -49.047000,
    featuredImage: "https://images.unsplash.com/photo-1522771731475-6a3f9fdbdb22?auto=format&fit=crop&q=80&w=800"
  },

  // --- POLO UNITINS (Natividade) ---
  {
    id: "seed-unitins-1",
    title: "Casarão Colonial Restaurado (República)",
    description: "História e cultura misturadas. Piso de madeira original, pé direito duplo. Perfeito para grupos grandes da Unitins.",
    price: 2500.00,
    bedrooms: 5,
    bathrooms: 3,
    suites: 0,
    parkingSpots: 0,
    area: 300,
    isPremium: true,
    petFriendly: true,
    furnished: false,
    neighborhood: "Centro Histórico",
    address: "Rua das Pedras, Centro Histórico, Natividade",
    city: "Natividade",
    lat: -11.708000, 
    lng: -47.723000, // Ao lado Unitins
    featuredImage: "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-unitins-2",
    title: "Kitnet Simples Unitins",
    description: "O melhor custo benefício da cidade. A poucos metros da universidade, poupe dinheiro e tempo.",
    price: 450.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    area: 20,
    isPremium: false,
    petFriendly: false,
    furnished: false,
    neighborhood: "Centro Histórico",
    address: "Travessa do Relógio, Natividade",
    city: "Natividade",
    lat: -11.711000, 
    lng: -47.725000,
    featuredImage: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "seed-unitins-3",
    title: "Chácara Recanto Estudantil",
    description: "Para estudantes que gostam de contato com a natureza. Fica a 15 min de bike do campus da Unitins.",
    price: 800.00,
    bedrooms: 2,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 5,
    area: 1500,
    isPremium: false,
    petFriendly: true,
    furnished: false,
    neighborhood: "Zona Rural",
    address: "Estrada do Moinho, Natividade",
    city: "Natividade",
    lat: -11.715000, 
    lng: -47.730000,
    featuredImage: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb65?auto=format&fit=crop&q=80&w=800"
  }
];

async function main() {
  console.log(`[ALUGA AI] Iniciando Operação Matriz (Seed Absoluto)...`)
  
  // 1. Forjamos o Anunciante Supremo. 
  // Alterado para associar todos os dados simulados ao email base da apresentação.
  const adminEmail = 'mrbat@gmail.com'; // Fallback / Base
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      role: 'ADMIN',
      emailVerified: new Date(), 
    }, 
    create: {
      email: adminEmail,
      name: 'Sr. Anunciante Supremo',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  // Também forjamos o admin@aluga.ai padrão
  const secondaryAdmin = await prisma.user.upsert({
    where: { email: 'admin@aluga.ai' },
    update: { 
      role: 'ADMIN',
      emailVerified: new Date(), 
    },
    create: {
      email: 'admin@aluga.ai',
      name: 'Sistema Admin',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log(`[ALUGA AI] Conta Mestra sincronizada: ${admin.id}`)

  // Upsert propriedades e gera estatísticas da Máquina do Tempo (30 dias)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const prop of propriedadesMock) {
    const property = await prisma.property.upsert({
      where: { id: prop.id },
      update: {
        ...prop,
        ownerId: admin.id, 
        isActive: true
      },
      create: {
        ...prop,
        ownerId: admin.id,
        isActive: true
      },
    });
    console.log(`[ALUGA AI] Injetado Imóvel: ${property.title}`)

    // Máquina do Tempo: 30 dias de Analytics
    let totalViews = 0;
    for (let i = 0; i <= 30; i++) {
      const targetDate = new Date(today);
      targetDate.setUTCDate(today.getUTCDate() - i);
      targetDate.setUTCHours(0, 0, 0, 0);

      // Lógica Estocástica (Mais acessos no fim de semana)
      const isWeekend = targetDate.getUTCDay() === 0 || targetDate.getUTCDay() === 6;
      const baseViews = prop.isPremium ? 50 : 20;
      const randomSpike = Math.floor(Math.random() * (isWeekend ? 100 : 40));
      
      const mockViews = baseViews + randomSpike;
      const mockClicks = Math.floor(mockViews * (Math.random() * 0.15 + 0.05)); // 5% a 20% CTR
      
      totalViews += mockViews;

      await prisma.propertyDailyStat.upsert({
        where: {
          propertyId_date: {
            propertyId: property.id,
            date: targetDate,
          }
        },
        update: { views: mockViews, clicks: mockClicks },
        create: {
          propertyId: property.id,
          date: targetDate,
          views: mockViews,
          clicks: mockClicks,
        }
      });
    }

    // Sincroniza o ViewCount global para refletir o total de 30 dias simulados
    await prisma.property.update({
      where: { id: property.id },
      data: { viewCount: totalViews }
    });
  }

  console.log(`[ALUGA AI] O Passado foi forjado com sucesso. A Matriz está pronta.`)
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
