// src/utils/logger.ts

/**
 * Motor de Observabilidade - Vigília Silenciosa
 * Despacha erros críticos diretamente para o Webhook do Discord.
 */
export async function logToDiscord(error: Error, contextInfo: Record<string, any> = {}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[SRE] DISCORD_WEBHOOK_URL ausente. O erro ocorreu, mas não pôde ser reportado ao Discord.');
    console.error(error);
    return;
  }

  const payload = {
    embeds: [
      {
        title: `🚨 Alerta Crítico (Erro 500) - Aluga AI`,
        color: 16711680, // Vermelho
        description: `**Mensagem:** ${error.message}`,
        fields: [
          {
            name: 'Contexto',
            value: `\`\`\`json\n${JSON.stringify(contextInfo, null, 2)}\n\`\`\``,
            inline: false,
          },
          {
            name: 'Stack Trace',
            value: `\`\`\`javascript\n${error.stack?.substring(0, 1000)}\n\`\`\``,
            inline: false,
          },
          {
            name: 'Timestamp',
            value: new Date().toISOString(),
            inline: false,
          }
        ],
        footer: {
          text: 'Vigília Silenciosa - Módulo SRE',
        },
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[SRE] Falha ao despachar log para o Discord:', err);
  }
}
