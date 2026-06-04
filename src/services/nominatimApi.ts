export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

export async function searchLocation(query: string): Promise<NominatimResult[]> {
  try {
    // 0. Removemos o hardcode de string em favor do Bounding Box matemático
    const searchQuery = query.trim();

    // 1. Tenta pegar do nosso Cache Cooperativo (API local)
    try {
      const cacheRes = await fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery)}`);
      if (cacheRes.ok) {
        const cachedData = await cacheRes.json();
        if (cachedData.cached) {
          return [{
            place_id: 0, // Fake ID
            lat: String(cachedData.lat),
            lon: String(cachedData.lng),
            display_name: `${searchQuery} (Resultados Imediatos via Cache ⚡)`,
            type: 'cache',
            importance: 1
          }];
        }
      }
    } catch (cacheErr) {
      console.warn('Cache API não respondeu, buscando Nominatim...', cacheErr);
    }
      
    // 2. Cache Miss -> Busca no OSM direto pelo IP do Cliente
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('format', 'json');
    url.searchParams.append('addressdetails', '1');
    url.searchParams.append('limit', '5');
    
    // Injetamos a "Cerca Virtual" (Geofencing Estrito) no Sul do Tocantins
    // viewbox: <min_lon>,<max_lat>,<max_lon>,<min_lat> (left, top, right, bottom)
    url.searchParams.append('viewbox', '-50.5,-10.5,-46.5,-12.5');
    url.searchParams.append('bounded', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
        // A API pública exige um User-Agent identificável
        'User-Agent': 'AlugaAI/2.0 (app@aluga.ai)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API Error: ${response.status}`);
    }
    
    const results: NominatimResult[] = await response.json();

    // 3. Salva no nosso Cache Cooperativo para o próximo usuário (em background)
    if (results.length > 0) {
      fetch('/api/geocoding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon)
        })
      }).catch(e => console.warn('Erro ao salvar no cache cooperativo', e));
    }

    return results;
  } catch (error) {
    console.error('Falha na geocodificação:', error);
    return [];
  }
}
