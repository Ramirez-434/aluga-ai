import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/auth';
import { logToDiscord } from '@/utils/logger';
import { MOCK_POIS } from '@/data/mockPOIs';
import { prisma } from '@/utils/prisma';

const model = google('gemini-2.5-flash');

export async function POST(req: NextRequest) {
  const { messages, propertyId, mapBounds, propertyCategory } = await req.json();

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
  let systemInstruction = `Você é o Aluga AI, o Corretor de Imóveis Virtual de elite focado no mercado do Tocantins (Gurupi, Natividade, etc).

MODO DE OPERAÇÃO ATUAL: ${propertyCategory === 'COMMERCIAL' ? 'B2B / COMERCIAL' : 'B2C / RESIDENTIAL'}

${propertyCategory === 'COMMERCIAL' 
  ? `CONTEXTO CORPORATIVO E LOGÍSTICO (B2B):
- O foco absoluto é ROI (Retorno sobre Investimento), Custo Total de Ocupação e Logística.
- A engine espacial avalia a proximidade com vias de tráfego pesado (heavyTraffic).
- Se o usuário busca galpões, armazéns ou pontos comerciais, destaque a facilidade de carga/descarga e o fluxo de pessoas na região.
- Seja objetivo e focado em negócios.` 
  : `CONTEXTO GEOGRÁFICO E DISTÂNCIAS (ÍMÃS DE DEMANDA RESIDENCIAL):
- A Engine Espacial do Frontend agora calcula automaticamente a distância linear (usando Turf.js) de todos os imóveis para a Universidade mais próxima ou POIs vitais (hospitais, mercados).
- Gurupi: A UnirG fica na Região Central / Setor Sul (bairro mais caro, agitado). A UFT fica no Vetor Sul (Setor Nova Fronteira, mais residencial).
- Natividade: Polo da Unitins. Foco em repúblicas, kitnets e famílias.
- Use isso como argumento de venda: Se é perto do campus, destaque a economia de tempo. Se é mais distante, destaque a tranquilidade ou preço.`}

COMO NEGOCIAR E LIDAR COM OBJEÇÕES (MODO CORRETOR EXPERIENTE):
- Justifique preços acima da média utilizando os dados contextuais (ex: se for comercial, fluxo de clientes; se for residencial, economia de combustível/perto do campus).
- Faça perguntas instigantes para fechar negócio.

REGRAS DE BUSCA E FERRAMENTAS:
Sempre que o usuário demonstrar intenção de busca, VOCÊ DEVE invocar a ferramenta searchProperties com os filtros. 
Para buscas contextuais de proximidade no mapa (vias pesadas, universidades), use searchSpatialPriority.
Após a ferramenta retornar resultados, NÃO liste os detalhes em texto longo. A interface já criará os cards lindamente. Diga apenas algo como: "Encontrei estas excelentes opções que encaixam no seu perfil!"`;

  // E: Visão Espacial (BBOX)
  if (mapBounds) {
    systemInstruction += `\n\n[VISÃO ESPACIAL ATIVADA]
O usuário está visualizando o mapa delimitado pelas coordenadas geográficas (BBOX):
Norte: ${mapBounds.n}, Sul: ${mapBounds.s}, Leste: ${mapBounds.e}, Oeste: ${mapBounds.w}.
Se o usuário perguntar "O que tem nesta região?", "O que tem por aqui?" ou perguntas sobre o bairro atual, USE a ferramenta summarizeArea para ler os imóveis deste exato local no banco de dados e dar uma resposta altamente analítica.`;
  }

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
O usuário está visualizando a página do imóvel "${property.title}" (R$ ${property.basePrice}, ${property.bedrooms} quartos). As imagens deste imóvel foram anexadas à visão do sistema.
Aja como os 'olhos' do usuário e avalie com extrema precisão o estado de conservação, iluminação, qualidade dos pisos (ex: porcelanato, cerâmica), bancadas (ex: granito, mármore) e armários, baseando-se ESTRITAMENTE no que as imagens mostram. NÃO minta e NÃO invente características que você não possa ver claramente. Se não tiver certeza, diga que pelas fotos não é possível afirmar.`;

      const lastUserMessageIndex = finalMessages.map((m: any) => m.role).lastIndexOf('user');
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
          if (maxPrice !== undefined) whereClause.basePrice = { lte: maxPrice };
          if (petFriendly) whereClause.petFriendly = true;
          if (furnished) whereClause.furnished = true;
          if (propertyCategory) whereClause.category = propertyCategory;

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
              price: p.basePrice,
              bedrooms: p.bedrooms,
              area: p.areaUseful,
              neighborhood: p.neighborhood,
              featuredImage: p.featuredImage
            }))
          };
        },
      }),
      searchSpatialPriority: tool({
        description: 'Busca imóveis no banco usando inteligência espacial pura. Se estiver no modo COMERCIAL, foca em vias de tráfego pesado (heavyTraffic = true). Se no modo RESIDENCIAL, calcula a proximidade geodésica (Haversine) com um Campus Universitário ou Centro de Saúde.',
        parameters: z.object({
          targetType: z.enum(['UNIVERSITY', 'HOSPITAL', 'HEAVY_TRAFFIC']).describe('O alvo espacial da busca. HEAVY_TRAFFIC (padrão comercial), UNIVERSITY/HOSPITAL (padrão residencial).'),
          poiName: z.string().optional().describe('Se for UNIVERSITY ou HOSPITAL, o nome do local (ex: "Campus UnirG", "Hospital Regional"). Ignorado se for HEAVY_TRAFFIC.'),
          maxDistanceKm: z.number().optional().default(3).describe('Raio máximo de busca (em km) para pontos de interesse.')
        }),
        // @ts-ignore
        execute: async ({ targetType, poiName, maxDistanceKm }: { targetType: string; poiName?: string; maxDistanceKm: number }) => {
          try {
            if (targetType === 'HEAVY_TRAFFIC') {
              const properties = await prisma.property.findMany({
                where: {
                  isActive: true,
                  category: 'COMMERCIAL',
                  heavyTraffic: true,
                },
                take: 3,
                orderBy: { basePrice: 'desc' }
              });
              
              return properties.map(p => ({
                id: p.id,
                title: p.title,
                price: p.basePrice,
                city: p.city,
                advantage: 'Localizado em via de fluxo intenso/pesado (Alta Exposição ou Logística)'
              }));
            } else {
              // Haversine Search para Universidades e Hospitais
              const poi = MOCK_POIS.find(p => p.name === poiName || (poiName && p.name.includes(poiName)));
              if (!poi) return { error: 'Ponto de interesse (POI) não encontrado no banco de coordenadas.' };
              
              const properties = await prisma.$queryRaw<any[]>`
                SELECT id, title, "basePrice", bedrooms, address, city, category,
                (6371 * acos(cos(radians(${poi.lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${poi.lng})) + sin(radians(${poi.lat})) * sin(radians(lat)))) AS distance
                FROM "Property"
                WHERE "isActive" = true
                AND category = 'RESIDENTIAL'
                AND (6371 * acos(cos(radians(${poi.lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${poi.lng})) + sin(radians(${poi.lat})) * sin(radians(lat)))) < ${maxDistanceKm}
                ORDER BY distance ASC
                LIMIT 3;
              `;
              
              return properties.map(p => ({
                id: p.id,
                title: p.title,
                price: p.basePrice,
                bedrooms: p.bedrooms,
                address: p.address,
                distanceKm: Number(p.distance).toFixed(1),
                poiReference: poi.name
              }));
            }
          } catch (e) {
            console.error('Erro na busca espacial RAG', e);
            return { error: 'Ocorreu um erro na engine espacial.' };
          }
        }
      }),
      summarizeArea: tool({
        description: 'Lê os imóveis que estão na área que o usuário está visualizando agora (usando as coordenadas BBOX) e resume a região.',
        parameters: z.object({
          requestSummary: z.boolean().describe('Sempre true ao chamar esta ferramenta')
        }),
        // @ts-ignore
        execute: async () => {
          if (!mapBounds) {
            return { error: 'O usuário não está visualizando nenhuma área específica no momento.' };
          }
          
          try {
            // 1. Agregação segura (Não explode tokens)
            const stats = await prisma.property.aggregate({
              where: {
                isActive: true,
                lat: { lte: mapBounds.n, gte: mapBounds.s },
                lng: { lte: mapBounds.e, gte: mapBounds.w },
              },
              _avg: { basePrice: true },
              _count: { id: true }
            });
            
            // 2. Amostragem rigorosa (Take 5)
            const topProperties = await prisma.property.findMany({
              where: {
                isActive: true,
                lat: { lte: mapBounds.n, gte: mapBounds.s },
                lng: { lte: mapBounds.e, gte: mapBounds.w },
              },
              take: 5,
              select: { title: true, basePrice: true, city: true, neighborhood: true }
            });
            
            return {
              totalProperties: stats._count?.id || 0,
              averagePrice: stats._avg?.basePrice ? Math.round(stats._avg.basePrice) : 0,
              topProperties
            };
          } catch (e) {
            return { error: 'Erro ao analisar a região geolocalizada.' };
          }
        }
      }),
      getPropertyDetails: tool({
        description: 'Recupera detalhes profundos (FAQ) de um imóvel específico para responder perguntas como "Aceita pet?", "Tem garagem?", "Descrição completa".',
        parameters: z.object({
          id: z.string().optional().describe('ID do imóvel. Se omitido, usará o imóvel que o usuário está vendo na tela no momento.')
        }),
        // @ts-ignore
        execute: async ({ id }: { id?: string }) => {
          // Trava de Segurança do Ponteiro Nulo
          const targetId = id || propertyId;
          if (!targetId) {
            return { error: 'Aviso: O usuário não selecionou nenhum imóvel no momento. Peça para ele clicar em um imóvel no mapa ou na lista antes de perguntar detalhes.' };
          }
          
          const property = await prisma.property.findUnique({
            where: { id: targetId },
            select: {
              title: true, basePrice: true, description: true, petFriendly: true, furnished: true,
              bathrooms: true, bedrooms: true, areaUseful: true, parkingSpots: true, city: true, neighborhood: true
            }
          });
          
          if (!property) return { error: 'Imóvel não encontrado no banco de dados.' };
          return property;
        }
      })
    },
    onFinish: async ({ text, toolCalls }) => {
      // E43: Persistir a resposta final do AI no banco se o usuário estiver logado
      if (userId && text) {
        try {
          await prisma.chatHistory.create({
            data: { userId, role: 'assistant', content: text }
          });
        } catch (e: any) {
          await logToDiscord(e, { source: 'ChatHistory Create', userId });
        }
      }
    },
    onError: ({ error }) => {
      // Captura quedas durante o Streaming (Timeout, Rate Limit, etc)
      logToDiscord(error as Error, { source: 'Streaming AI SDK', userId });
    }
  });

  return result.toTextStreamResponse();
}
