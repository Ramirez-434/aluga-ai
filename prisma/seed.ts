import 'dotenv/config'
import { PrismaClient, PropertyCategory, TransactionType, ConstructionStage } from '@prisma/client'

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
    basePrice: 950.00,
    condominiumFee: 50.00,
    iptuTax: 0,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 0,
    isCoveredParking: false,
    areaUseful: 35,
    areaTotal: 40,
    isPremium: true,
    petFriendly: false,
    furnished: true,
    neighborhood: "Setor Sul",
    address: "Rua 5, Setor Sul, Gurupi",
    city: "Gurupi",
    state: "TO",
    lat: -11.729000, 
    lng: -49.065000,
    featuredImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    category: PropertyCategory.RESIDENTIAL,
    transactionType: [TransactionType.RENT],
    constructionStage: ConstructionStage.READY
  },
  {
    id: "seed-unirg-2",
    title: "Loft Moderno para Estudantes de Medicina",
    description: "Ambiente silencioso, focado em estudantes que precisam de alta concentração. Armários embutidos e bancada de estudos em mármore.",
    basePrice: 1300.00,
    condominiumFee: 150.00,
    iptuTax: 50.00,
    bedrooms: 1,
    bathrooms: 1,
    suites: 1,
    parkingSpots: 1,
    isCoveredParking: true,
    areaUseful: 45,
    areaTotal: 50,
    isPremium: true,
    petFriendly: false,
    furnished: true,
    neighborhood: "Setor Sul",
    address: "Avenida Goiás, Setor Sul, Gurupi",
    city: "Gurupi",
    state: "TO",
    lat: -11.727500, 
    lng: -49.067000,
    featuredImage: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800",
    category: PropertyCategory.RESIDENTIAL,
    transactionType: [TransactionType.RENT],
    constructionStage: ConstructionStage.READY
  },
  {
    id: "seed-unirg-3",
    title: "Apê Econômico 2 Quartos",
    description: "Excelente para dividir. Quartos amplos, cozinha americana. Acesso rápido ao transporte universitário.",
    basePrice: 800.00,
    condominiumFee: 100.00,
    iptuTax: 0,
    bedrooms: 2,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 1,
    isCoveredParking: false,
    areaUseful: 55,
    areaTotal: 60,
    isPremium: false,
    petFriendly: true,
    furnished: false,
    neighborhood: "Centro",
    address: "Rua 3, Centro, Gurupi",
    city: "Gurupi",
    state: "TO",
    lat: -11.725000, 
    lng: -49.068000,
    featuredImage: "https://images.unsplash.com/photo-1502672260266-1c1e5240980c?auto=format&fit=crop&q=80&w=800",
    category: PropertyCategory.RESIDENTIAL,
    transactionType: [TransactionType.RENT],
    constructionStage: ConstructionStage.READY
  },
  // --- IMÓVEIS CORPORATIVOS / COMERCIAIS (Novos) ---
  {
    id: "seed-comercial-1",
    title: "Galpão Logístico Nova Fronteira",
    description: "Galpão com docas para caminhões e pé direito duplo. Trifásico.",
    basePrice: 8500.00,
    condominiumFee: 0,
    iptuTax: 450.00,
    bedrooms: 0,
    bathrooms: 4,
    suites: 0,
    parkingSpots: 10,
    isCoveredParking: true,
    areaUseful: 800,
    areaTotal: 1000,
    isPremium: true,
    petFriendly: false,
    furnished: false,
    neighborhood: "Nova Fronteira",
    address: "Av. Marginal, Nova Fronteira, Gurupi",
    city: "Gurupi",
    state: "TO",
    heavyTraffic: true,
    lat: -11.758000, 
    lng: -49.049000,
    featuredImage: "https://images.unsplash.com/photo-1586528116311-ad8ed745eb33?auto=format&fit=crop&q=80&w=800",
    category: PropertyCategory.INDUSTRIAL,
    transactionType: [TransactionType.RENT, TransactionType.SALE],
    constructionStage: ConstructionStage.READY
  },
  {
    id: "seed-comercial-2",
    title: "Sala Comercial Corporate Center",
    description: "Sala de alto padrão para escritórios e startups.",
    basePrice: 2200.00,
    condominiumFee: 400.00,
    iptuTax: 100.00,
    bedrooms: 0,
    bathrooms: 1,
    suites: 0,
    parkingSpots: 2,
    isCoveredParking: true,
    areaUseful: 60,
    areaTotal: 70,
    isPremium: true,
    petFriendly: false,
    furnished: false,
    neighborhood: "Centro",
    address: "Av. Goiás, Edifício Corporate, Gurupi",
    city: "Gurupi",
    state: "TO",
    heavyTraffic: false,
    lat: -11.723000, 
    lng: -49.062000,
    featuredImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    category: PropertyCategory.COMMERCIAL,
    transactionType: [TransactionType.RENT],
    constructionStage: ConstructionStage.READY
  }
];

async function main() {
  console.log(`[ALUGA AI B2B] Iniciando Operação Fênix (Seed B2B)...`)
  
  const adminEmail = 'mrbat@gmail.com'; 
  
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

  // Criando a Imobiliária Fictícia
  const agency = await prisma.agency.upsert({
    where: { cnpj: '12.345.678/0001-99' },
    update: {},
    create: {
      name: 'Imobiliária Gurupi Prime',
      cnpj: '12.345.678/0001-99',
      logoUrl: 'https://via.placeholder.com/150'
    }
  });

  // Criando Corretor de Elite e vinculando à Imobiliária e ao Admin
  const broker = await prisma.broker.upsert({
    where: { creci: '12345-TO' },
    update: { agencyId: agency.id },
    create: {
      userId: admin.id,
      agencyId: agency.id,
      creci: '12345-TO',
      phone: '+5563999999999'
    }
  });

  console.log(`[ALUGA AI B2B] Agência e Corretor forjados. Corretor CRECI: ${broker.creci}`)

  // Upsert propriedades e gera estatísticas
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const prop of propriedadesMock) {
    const property = await prisma.property.upsert({
      where: { id: prop.id },
      update: {
        ...prop,
        ownerId: admin.id,
        agencyId: agency.id,
        brokerId: broker.id,
        isActive: true
      },
      create: {
        ...prop,
        ownerId: admin.id,
        agencyId: agency.id,
        brokerId: broker.id,
        isActive: true
      },
    });
    console.log(`[ALUGA AI B2B] Injetado Imóvel B2B: ${property.title}`)

    let totalViews = 0;
    for (let i = 0; i <= 30; i++) {
      const targetDate = new Date(today);
      targetDate.setUTCDate(today.getUTCDate() - i);
      targetDate.setUTCHours(0, 0, 0, 0);

      const isWeekend = targetDate.getUTCDay() === 0 || targetDate.getUTCDay() === 6;
      const baseViews = prop.isPremium ? 50 : 20;
      const randomSpike = Math.floor(Math.random() * (isWeekend ? 100 : 40));
      
      const mockViews = baseViews + randomSpike;
      const mockClicks = Math.floor(mockViews * (Math.random() * 0.15 + 0.05));
      
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

    await prisma.property.update({
      where: { id: property.id },
      data: { viewCount: totalViews }
    });
  }

  console.log(`[ALUGA AI B2B] Operação Fênix concluída. A infraestrutura Unicórnio B2B está de pé.`)
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
