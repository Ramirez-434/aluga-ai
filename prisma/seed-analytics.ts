const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Injetando dados sintéticos para Analytics B2B...");

  const user = await prisma.user.findFirst({
    where: { email: 'admin@aluga.ai' }
  });

  if (!user) {
    console.error("Usuário admin@aluga.ai não encontrado. Rode o seed principal primeiro.");
    return;
  }

  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    take: 5
  });

  if (properties.length === 0) {
    console.error("Nenhum imóvel encontrado para o admin. Rode o seed principal primeiro.");
    return;
  }

  console.log(`Gerando dados para ${properties.length} imóveis...`);

  // Gerar dados para os últimos 30 dias
  for (const property of properties) {
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const views = Math.floor(Math.random() * 50) + 10;
      const clicks = Math.floor(views * (Math.random() * 0.2)); // 0 a 20% de CTR

      await prisma.propertyDailyStat.upsert({
        where: {
          propertyId_date: {
            propertyId: property.id,
            date: date
          }
        },
        update: {
          views: { increment: views },
          clicks: { increment: clicks }
        },
        create: {
          propertyId: property.id,
          date: date,
          views,
          clicks
        }
      });
    }

    // Injetar alguns leads na Fila de Espera
    await prisma.waitlistLead.create({
      data: {
        propertyId: property.id,
        name: `Lead Teste ${property.title.substring(0, 5)}`,
        email: `lead.${property.id.substring(0, 5)}@gmail.com`,
        phone: '556399999999'
      }
    });

    console.log(`✅ Dados injetados para o imóvel: ${property.title}`);
  }

  console.log("🎉 Seed Analytics concluído com sucesso!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
