import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Definimos o LLM (Gemini 1.5 Flash - rápido e excelente para visão)
const model = google('gemini-1.5-flash');

export async function POST(req: NextRequest) {
  const { messages, propertyId } = await req.json();

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY in .env' }), { status: 500 });
  }

  // E43: Pegar o usuário logado para persistir histórico
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub as string | undefined;

  // Se o usuário estiver logado, salva a mensagem do usuário no banco
  if (userId) {
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      await prisma.chatHistory.create({
        data: {
          userId,
          role: 'user',
          content: lastUserMessage.content,
        }
      });
    }
  }

  let finalMessages = [...messages];
  let systemInstruction = `Você é o Aluga AI, um Corretor de Imóveis Virtual focado em locação em Gurupi e Natividade (Tocantins). 
Sua principal função é encontrar o imóvel perfeito para o usuário pesquisando ativamente na base de dados.
Sempre que o usuário demonstrar intenção de busca (ex: "quero um ap de 2 quartos", "tem algo pet friendly?"), VOCÊ DEVE invocar a ferramenta searchProperties com os filtros apropriados.
Após a chamada da ferramenta retornar os resultados, não repita os detalhes do imóvel em texto, pois a interface já irá renderizar os cards interativos. Apenas diga "Encontrei estas opções perfeitas para você!" ou "Infelizmente não achei algo exatamente assim, mas tente mudar os filtros."`;

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
      
      systemInstruction += `\n\nATENÇÃO: O usuário está visualizando a página do imóvel "${property.title}" (R$ ${property.price}, ${property.bedrooms} quartos). As imagens deste imóvel foram enviadas junto com a última mensagem dele. Você deve "vê-las" para responder perguntas sobre o estado, móveis, iluminação, piso, ou espaço físico do local com extrema precisão, atuando como um corretor que está fisicamente no local. NÃO invente características visuais que não estejam claras nas fotos.`;

      const lastUserMessageIndex = finalMessages.map(m => m.role).lastIndexOf('user');
      if (lastUserMessageIndex !== -1 && imagesToProcess.length > 0) {
        const lastMsg = finalMessages[lastUserMessageIndex];
        
        const newContent: any[] = [
          { type: 'text', text: lastMsg.content }
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
        execute: async ({ city, minBedrooms, maxPrice, petFriendly, furnished, neighborhood }) => {
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
    },
    maxSteps: 5,
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

  return result.toDataStreamResponse();
}
