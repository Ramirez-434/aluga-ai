import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { MOCK_POIS } from '@/data/mockPOIs';

const prisma = new PrismaClient();

// Definimos o LLM (Gemini 1.5 Flash - rápido e excelente para visão)
const model = google('gemini-2.5-flash');

export async function POST(req: NextRequest) {
  const { messages, propertyId } = await req.json();

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY in .env' }), { status: 500 });
  }

  // E43: Pegar o usuário logado para persistir histórico
  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
  const userId = token?.sub as string | undefined;

  // Se o usuário estiver logado, salva a mensagem do usuário no banco
  if (userId) {
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      let contentToSave = lastUserMessage.content || '';
      if (!contentToSave && lastUserMessage.parts) {
        contentToSave = lastUserMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
      }

      await prisma.chatHistory.create({
        data: {
          userId,
          role: 'user',
          content: contentToSave,
        }
      });
    }
  }

  let finalMessages = messages.map((m: any) => ({ role: m.role, content: m.content || '' }));
  let systemInstruction = `Você é o Aluga AI, o Corretor de Imóveis Virtual de elite focado em locação em Gurupi e Natividade (Tocantins).

CONTEXTO GEOGRÁFICO E DISTÂNCIAS (ÍMÃS DE DEMANDA):
- A Engine Espacial do Frontend agora calcula automaticamente a distância linear (usando Turf.js) de todos os imóveis para a Universidade mais próxima e injeta um Micro-Badge no card (ex: "📍 A 1.2km do Campus UnirG").
- Gurupi: A UnirG fica na Região Central / Setor Sul (bairro mais caro, agitado, onde a proximidade a pé vale ouro). A UFT fica no Vetor Sul (Setor Nova Fronteira, mais residencial).
- Natividade: Polo da Unitins. O foco nos arredores da Unitins são kitnets estudantis econômicas.
- Use isso como argumento de venda: Se um imóvel é muito perto do campus, destaque a economia de tempo. Se é mais distante, destaque a tranquilidade ou o preço melhor.

COMO NEGOCIAR E LIDAR COM OBJEÇÕES (MODO CORRETOR EXPERIENTE):
- Se o usuário achar um imóvel caro (ex: kitnet de R$ 850 na UnirG), aja como corretor: "Sim, é um pouco acima da média, mas a economia de combustível, tempo de deslocamento e segurança por morar do lado da faculdade compensam demais em poucos meses!"
- Faça perguntas instigantes para fechar negócio: "Você prefere tranquilidade para estudar (UFT/Nova Fronteira) ou estar perto de tudo (Centro/UnirG)?"

REGRAS DE BUSCA E FERRAMENTAS:
Sempre que o usuário demonstrar intenção de busca (ex: "quero ap de 2 quartos", "tem algo pet friendly?"), VOCÊ DEVE invocar a ferramenta searchProperties com os filtros. 
Após a ferramenta retornar resultados, NÃO liste ou repita os detalhes do imóvel em texto longo. A interface já criará os cards lindamente. Diga apenas algo como: "Encontrei estas excelentes opções que encaixam no seu perfil!"`;

  // E: Multimodal Vision
  if (propertyId) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true }
    });

    if (property) {
      const imagesToProcess = property.images && property.images.length > 0 
        ? property.images.map(img => img.url)
        : (property.featuredImage ? [property.featuredImage] : []);
      
      systemInstruction += `\n\n[SUMARIZAÇÃO VISUAL MULTIMODAL ATIVADA]
O usuário está visualizando a página do imóvel "${property.title}" (R$ ${property.price}, ${property.bedrooms} quartos). As imagens deste imóvel foram anexadas à visão do sistema.
Aja como os 'olhos' do usuário e avalie com extrema precisão o estado de conservação, iluminação, qualidade dos pisos (ex: porcelanato, cerâmica), bancadas (ex: granito, mármore) e armários, baseando-se ESTRITAMENTE no que as imagens mostram. NÃO minta e NÃO invente características que você não possa ver claramente. Se não tiver certeza, diga que pelas fotos não é possível afirmar.`;

      const lastUserMessageIndex = finalMessages.map(m => m.role).lastIndexOf('user');
      if (lastUserMessageIndex !== -1 && imagesToProcess.length > 0) {
        const lastMsg = finalMessages[lastUserMessageIndex];
        
        let textContent = '';
        if (typeof lastMsg.content === 'string') {
          textContent = lastMsg.content;
        } else if (Array.isArray(lastMsg.content)) {
          textContent = lastMsg.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\\n');
        }

        const newContent: any[] = [
          { type: 'text', text: textContent }
        ];

        // Limita a 5 imagens para controle de token/bandwidth
        const limitedImages = imagesToProcess.slice(0, 5);
        
        for (const url of limitedImages) {
          try {
            newContent.push({ type: 'image', image: new URL(url) });
          } catch (e) {
            console.error("Invalid image URL:", url);
          }
        }

        finalMessages[lastUserMessageIndex] = {
          ...lastMsg,
          content: newContent
        };
      }
    }
  }

  const result = streamText({
    model,
    messages: finalMessages as any,
    system: systemInstruction,
    tools: {
      searchProperties: tool({
        description: 'Busca imóveis no banco de dados com base nas preferências do usuário',
        parameters: z.object({
          city: z.string().optional().describe('Cidade do imóvel (ex: Gurupi, Natividade)'),
          minBedrooms: z.number().optional().describe('Quantidade mínima de quartos'),
          maxPrice: z.number().optional().describe('Orçamento máximo mensal em reais'),
          petFriendly: z.boolean().optional().describe('Apenas imóveis que aceitam pets'),
          furnished: z.boolean().optional().describe('Apenas imóveis mobiliados'),
          neighborhood: z.string().optional().describe('Bairro do imóvel'),
        }),
        // @ts-ignore - TS is incorrectly inferring the tool overload without execute
        execute: async (args: any) => {
          const { city, minBedrooms, maxPrice, petFriendly, furnished, neighborhood } = args;
          const whereClause: any = {};
          
          if (city) whereClause.city = { contains: city };
          if (neighborhood) whereClause.neighborhood = { contains: neighborhood };
          if (minBedrooms !== undefined) whereClause.bedrooms = { gte: minBedrooms };
          if (maxPrice !== undefined) whereClause.price = { lte: maxPrice };
          if (petFriendly) whereClause.petFriendly = true;
          if (furnished) whereClause.furnished = true;

          const properties = await prisma.property.findMany({
            where: whereClause,
            take: 3, // Mostramos no máximo 3 propriedades no chat para não poluir
            orderBy: { createdAt: 'desc' },
          });

          return {
            resultsCount: properties.length,
            properties: properties.map(p => ({
              id: p.id,
              title: p.title,
              price: p.price,
              bedrooms: p.bedrooms,
              area: p.area,
              neighborhood: p.neighborhood,
              featuredImage: p.featuredImage
            }))
          };
        },
      }),
      searchPropertiesNearCampus: tool({
        description: 'Busca imóveis localizados fisicamente próximos a uma Universidade usando cálculo geodésico (Haversine)',
        parameters: z.object({
          campusName: z.enum(['Campus UnirG', 'Campus UFT - Gurupi', 'Polo UNITINS']).describe('Nome exato do campus'),
          maxDistanceKm: z.number().optional().default(3).describe('Raio máximo de distância em km'),
        }),
        execute: async ({ campusName, maxDistanceKm }) => {
          const campus = MOCK_POIS.find(p => p.name === campusName);
          if (!campus) return { error: 'Campus não encontrado' };
          
          try {
            // Utilizamos queryRaw para executar a matemática espacial diretamente no banco Postgres
            const properties = await prisma.$queryRaw<any[]>`
              SELECT id, title, price, bedrooms, address, city,
              (6371 * acos(cos(radians(${campus.lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${campus.lng})) + sin(radians(${campus.lat})) * sin(radians(lat)))) AS distance
              FROM "Property"
              WHERE "isActive" = true
              AND (6371 * acos(cos(radians(${campus.lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${campus.lng})) + sin(radians(${campus.lat})) * sin(radians(lat)))) < ${maxDistanceKm}
              ORDER BY distance ASC
              LIMIT 3;
            `;
            
            return properties.map(p => ({
              id: p.id,
              title: p.title,
              price: p.price,
              bedrooms: p.bedrooms,
              address: p.address,
              distanceKm: Number(p.distance).toFixed(1),
              url: `/property/${p.id}`
            }));
          } catch (e) {
            console.error('Erro na busca geoespacial', e);
            return { error: 'Ocorreu um erro no motor geográfico.' };
          }
        }
      })
    },
    onFinish: async ({ text, toolCalls }) => {
      // E43: Persistir a resposta final do AI no banco se o usuário estiver logado
      if (userId && text) {
        await prisma.chatHistory.create({
          data: {
            userId,
            role: 'assistant',
            content: text,
          }
        });
      }
    }
  });
  return result.toTextStreamResponse();
}
