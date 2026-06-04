export interface RealPOI {
  id: number;
  lat: number;
  lon: number;
  name: string;
  category: 'university' | 'hospital' | 'marketplace' | 'other';
}

export async function fetchRealPOIs(bounds: { n: number; s: number; e: number; w: number }): Promise<RealPOI[]> {
  try {
    // Consulta à Overpass API buscando universidades, faculdades, hospitais e supermercados no raio da tela
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="university"](${bounds.s},${bounds.w},${bounds.n},${bounds.e});
        node["amenity"="college"](${bounds.s},${bounds.w},${bounds.n},${bounds.e});
        node["amenity"="hospital"](${bounds.s},${bounds.w},${bounds.n},${bounds.e});
        node["shop"="supermarket"](${bounds.s},${bounds.w},${bounds.n},${bounds.e});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API Error: ${response.status}`);
    }
    
    const data = await response.json();

    // Transformar a resposta bruta do OSM no nosso tipo limpo
    return data.elements
      .filter((el: any) => el.tags && el.tags.name && el.lat && el.lon)
      .map((el: any) => {
        let category: RealPOI['category'] = 'other';
        if (el.tags.amenity === 'university' || el.tags.amenity === 'college') category = 'university';
        else if (el.tags.amenity === 'hospital') category = 'hospital';
        else if (el.tags.shop === 'supermarket') category = 'marketplace';

        return {
          id: el.id,
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name,
          category,
        };
      });
  } catch (error) {
    console.error('Falha ao buscar POIs no OpenStreetMap:', error);
    return [];
  }
}
