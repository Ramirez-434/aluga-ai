import { ImageResponse } from 'next/og';

// D42: OG Image dinâmica para cada imóvel — shares bonitos no WhatsApp/Instagram
export const runtime = 'edge';
export const alt = 'Imóvel no Aluga AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: any = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/properties/${id}`);
    if (res.ok) property = await res.json();
  } catch {}

  const title = property?.title || 'Imóvel disponível';
  const price = property?.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : '';
  const city = property?.city || 'Tocantins';
  const bedrooms = property?.bedrooms || '';
  const area = property?.area || '';
  const image = property?.featuredImage;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          position: 'relative',
          fontFamily: 'Inter, sans-serif',
          overflow: 'hidden',
          backgroundColor: '#060810',
        }}
      >
        {/* Imagem de fundo */}
        {image && (
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}

        {/* Overlay gradiente */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(79,70,229,0.7) 0%, rgba(6,8,16,0.95) 70%)',
          }}
        />

        {/* Conteúdo */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 72px',
            width: '100%',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 20,
            }}>A</div>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>Aluga AI</span>
          </div>

          {/* Título e dados */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 99, padding: '6px 16px',
              color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600,
              marginBottom: 20,
            }}>
              📍 {city}, TO
            </div>
            <h1 style={{
              color: 'white', fontSize: 48, fontWeight: 900,
              lineHeight: 1.15, margin: 0, letterSpacing: '-1px',
              maxWidth: 720,
            }}>
              {title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 24 }}>
              {price && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Aluguel</p>
                  <p style={{ color: '#818CF8', fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1 }}>{price}</p>
                </div>
              )}
              {bedrooms && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Quartos</p>
                  <p style={{ color: 'white', fontSize: 28, fontWeight: 900, margin: 0 }}>{bedrooms}</p>
                </div>
              )}
              {area && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Área</p>
                  <p style={{ color: 'white', fontSize: 28, fontWeight: 900, margin: 0 }}>{area}m²</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
