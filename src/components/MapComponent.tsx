'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, FeatureGroup, useMap, Tooltip, Polygon, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { point, distance } from '@turf/turf';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import L from 'leaflet';
import { MOCK_POIS } from '@/data/mockPOIs';
import { Property } from '@/types/property';
import { useTheme } from 'next-themes';
import { LocateFixed, GraduationCap, Bed, Maximize } from 'lucide-react';
import { UNIVERSITY_ZONES } from '@/data/universityZones';
import { MapSearchBar } from './MapSearchBar';
import { useFilterStore } from '@/store/useFilterStore';

// Fix for default marker icons in react-leaflet
const markerIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerIconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const markerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom price markers
const createPriceIcon = (price: number, isDark: boolean, isNew: boolean = false, isPremium: boolean = false, isHovered: boolean = false) => {
  let formattedPrice;
  if (price >= 1000000) {
    formattedPrice = `R$ ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    formattedPrice = `R$ ${(price / 1000).toFixed(1)}k`;
  } else {
    formattedPrice = `R$ ${price}`;
  }
  
  let bgColor = isDark ? '#1f2937' : '#ffffff';
  let textColor = isDark ? '#ffffff' : '#111827';
  let borderColor = isDark ? '#374151' : '#e5e7eb';
  let extraHtml = isNew ? '<div style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; border: 2px solid white;"></div>' : '';

  if (isPremium) {
    bgColor = 'linear-gradient(to right, #fbbf24, #f59e0b)';
    textColor = '#ffffff';
    borderColor = '#f59e0b';
    extraHtml = '<div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 16px;">👑</div>' + extraHtml;
  }
  
  if (isHovered) {
    bgColor = '#4f46e5';
    textColor = '#ffffff';
    borderColor = '#4f46e5';
  }

  // C32: Pulse ring style se for imóvel novo (<24h)
  let pulseStyle = isNew ? `box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); animation: pulse-ring 2s infinite;` : `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);`;

  if (isPremium) {
    pulseStyle += ` box-shadow: 0 4px 15px rgba(245, 158, 11, 0.5);`;
  }
  if (isHovered) {
    pulseStyle += ` box-shadow: 0 8px 25px rgba(79, 70, 229, 0.6); transform: scale(1.15) translateY(-5px); z-index: 1000;`;
  }

  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div style="background: ${bgColor}; color: ${textColor}; font-weight: bold; padding: 6px 12px; border-radius: 20px; border: 1px solid ${borderColor}; white-space: nowrap; font-size: 14px; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; transform-origin: bottom center; ${pulseStyle}" onmouseover="this.style.transform='scale(1.1)'; this.style.zIndex='1000'; this.style.backgroundColor='#4f46e5'; this.style.color='white';" onmouseout="this.style.transform='${isHovered ? 'scale(1.15) translateY(-5px)' : 'scale(1)'}'; this.style.zIndex='${isHovered ? '1000' : '1'}'; this.style.background='${bgColor}'; this.style.color='${textColor}';">
             ${formattedPrice}
             ${extraHtml}
           </div>
           <style>
            @keyframes pulse-ring {
              0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
              100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
            }
           </style>`,
    iconSize: [80, 32],
    iconAnchor: [40, 16],
  });
};

// C23: IconCreateFunction para o MarkerClusterGroup calcular o preço médio
const createClusterCustomIcon = (cluster: any, isDark: boolean) => {
  const children = cluster.getAllChildMarkers();
  let totalPrice = 0;
  children.forEach((marker: any) => {
    totalPrice += marker.options.price || 0;
  });
  const avgPrice = Math.round(totalPrice / children.length);

  let formattedPrice;
  if (avgPrice >= 1000000) formattedPrice = `R$ ${(avgPrice / 1000000).toFixed(1)}M+`;
  else if (avgPrice >= 1000) formattedPrice = `R$ ${(avgPrice / 1000).toFixed(1)}k+`;
  else formattedPrice = `R$ ${avgPrice}+`;

  // Gradiente baseado no preço (mais caro = vermelho, médio = roxo, barato = azul)
  let bgColorClass = 'bg-blue-600/90';
  if (avgPrice > 3000) bgColorClass = 'bg-rose-600/90';
  else if (avgPrice > 1500) bgColorClass = 'bg-purple-600/90';

  return L.divIcon({
    html: `<div class="${bgColorClass} text-white font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white/20 backdrop-blur-md flex items-center justify-center gap-1 text-sm transition-transform hover:scale-110">
            <span>${formattedPrice}</span>
            <span class="bg-black/20 px-1.5 rounded-full text-[10px]">${children.length}</span>
          </div>`,
    className: 'custom-cluster-icon',
    iconSize: [80, 32],
    iconAnchor: [40, 16],
  });
};

function LocateControl() {
  const map = useMap();
  const handleLocate = () => {
    map.locate({ setView: false, maxZoom: 16 }).on("locationfound", function (e) {
      map.flyTo(e.latlng, map.getZoom(), { duration: 1.5 });
    });
  };
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); handleLocate(); }} 
      className="absolute bottom-28 right-4 md:right-6 z-[1000] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
      title="Minha Localização"
    >
      <LocateFixed className="w-5 h-5" />
    </button>
  );
}

interface MapProps {
  properties: Property[];
  onPropertySelect?: (id: string) => void;
  onPolygonFilter?: (propertyIds: string[] | null) => void;
  onBoundsChange?: (bounds: { n: number, s: number, e: number, w: number }) => void;
  onMapInteraction?: () => void;
}

function BoundsListener({ onBoundsChange, onMapInteraction }: { 
  onBoundsChange?: (bounds: { n: number, s: number, e: number, w: number }) => void;
  onMapInteraction?: () => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() });
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() });
      }
    },
    dragend: () => {
      if (onMapInteraction) onMapInteraction();
    }
  });

  useEffect(() => {
    if (onBoundsChange) {
      const b = map.getBounds();
      onBoundsChange({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() });
    }
  }, [map, onBoundsChange]);

  return null;
}

export default function MapComponent({ properties, onPropertySelect, onPolygonFilter, onBoundsChange, onMapInteraction }: MapProps) {
  const defaultCenter: [number, number] = [-11.726, -49.068]; // Gurupi, TO

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hoveredPropertyId = useFilterStore(state => state.hoveredPropertyId);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [showUniversities, setShowUniversities] = useState(true);
  
  const [mapBounds, setMapBounds] = useState<{ n: number, s: number, e: number, w: number } | null>(null);

  // Efeito para buscar POIs reais removido em favor do dataset estático (MOCK_POIS) para proteger contra banimento e latência.


  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // C30: Rota entre imóvel selecionado e universidade mais próxima
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'university': return '#4f46e5'; // indigo
      case 'hospital': return '#ef4444'; // red
      case 'marketplace': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  };

  const categories = [
    { id: 'university', label: 'Universidades' },
    { id: 'hospital', label: 'Hospitais' },
    { id: 'marketplace', label: 'Supermercados' },
  ];

  const handleBoundsChange = useCallback((bounds: { n: number, s: number, e: number, w: number }) => {
    setMapBounds(bounds);
    if (onBoundsChange) {
      onBoundsChange(bounds);
    }
  }, [onBoundsChange]);

  const onCreated = (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    
    // Filter properties inside polygon using turf spatial math
    const insideIds = properties.filter(prop => {
      const pt = point([prop.lng, prop.lat]);
      return booleanPointInPolygon(pt, geojson);
    }).map(p => p.id);
    
    if (onPolygonFilter) {
      onPolygonFilter(insideIds);
    }
  };

  const onDeleted = () => {
    if (onPolygonFilter) {
      onPolygonFilter(null);
    }
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
          {/* Map tiles depending on theme */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className={isDark ? "dark-map-tiles" : ""}
          />
          
          <MapSearchBar />
          <BoundsListener onBoundsChange={handleBoundsChange} onMapInteraction={onMapInteraction} />
        
        <LocateControl />

        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e1e100',
                  message: '<strong>Erro:</strong> Você não pode cruzar as linhas!'
                },
                shapeOptions: {
                  color: '#3b82f6', // Primary blue
                  fillOpacity: 0.2
                }
              }
            }}
          />
        </FeatureGroup>
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          iconCreateFunction={(cluster: any) => createClusterCustomIcon(cluster, isDark)}
        >
          {properties.map(prop => {
            const isNew = Date.now() - new Date(prop.createdAt || Date.now()).getTime() < 86400000;
            return (
            <Marker 
              key={prop.id} 
              position={[prop.lat, prop.lng]} 
              icon={createPriceIcon(prop.price, isDark, isNew, (prop as any).isPremium, hoveredPropertyId === prop.id)}
              //@ts-ignore
              price={prop.price} // Passando propriedade customizada para o cluster calcular a média
              eventHandlers={{
                click: () => {
                  setSelectedPropId(prop.id);
                  if (onPropertySelect) onPropertySelect(prop.id);
                }
              }}
              zIndexOffset={hoveredPropertyId === prop.id ? 1000 : 0}
            >
              {/* Hover Preview (Item 3) */}
              <Tooltip 
                direction="top" 
                offset={[0, -20]} 
                opacity={1}
                className="custom-hover-tooltip"
              >
                <div className="flex w-52 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-none">
                  {prop.featuredImage && (
                    <img 
                      src={prop.featuredImage} 
                      alt="" 
                      className="w-20 h-20 object-cover"
                    />
                  )}
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-[11px] text-gray-900 dark:text-white line-clamp-1 leading-tight">{prop.title}</h4>
                    <p className="text-primary font-bold text-sm">R$ {prop.price.toLocaleString('pt-BR')}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        <span>{prop.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-3 h-3" />
                        <span>{prop.area}m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>

              <Popup className="premium-popup">
                <div className="p-1 min-w-[200px]">
                  <img 
                    src={prop.featuredImage ?? ''} 
                    alt={prop.title} 
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h4 className="font-bold text-sm mb-1 line-clamp-1">{prop.title}</h4>
                  <p className="text-primary font-bold">R$ {prop.price.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-500">{prop.bedrooms} Quartos • {prop.area}m²</p>
                </div>
              </Popup>
            </Marker>
            );
          })}
        </MarkerClusterGroup>

          {/* Real POI Markers (agora usando MOCK_POIS para zero latência) */}
          {MOCK_POIS.filter(poi => activeCategories.includes(poi.category)).map(poi => (
            <CircleMarker
              key={poi.id}
              center={[poi.lat, poi.lng]}
              pathOptions={{ 
                color: getCategoryColor(poi.category), 
                fillColor: getCategoryColor(poi.category), 
                fillOpacity: 0.8,
                weight: 2
              }}
              radius={6}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <span className="font-semibold">{poi.name}</span>
                <span className="block text-xs opacity-80 capitalize">{poi.category}</span>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* University Zones (Item 22) */}
        {showUniversities && UNIVERSITY_ZONES.map(zone => (
          <Polygon 
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Tooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-xs font-bold" opacity={0.8}>
              <span style={{ color: zone.color, textShadow: '0px 0px 3px white' }}>{zone.name}</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* C30: Rota do imóvel selecionado para a universidade mais próxima */}
        {selectedPropId && (() => {
          const prop = properties.find(p => p.id === selectedPropId);
          if (!prop) return null;
          
          let minDistance = Infinity;
          let nearestUni: [number, number] | null = null;
          let uniName = "Campus";

          const universities = MOCK_POIS.filter(p => p.category === 'university');
          for (const uni of universities) {
            const distKm = distance(point([prop.lng, prop.lat]), point([uni.lng, uni.lat]), { units: 'kilometers' });
            if (distKm < minDistance) {
              minDistance = distKm;
              nearestUni = [uni.lat, uni.lng];
              uniName = uni.name;
            }
          }

          if (!nearestUni) return null;

          return (
            <Polygon 
              positions={[[prop.lat, prop.lng], nearestUni]}
              pathOptions={{ color: '#4f46e5', weight: 4, dashArray: '10, 10' }}
            >
               <Tooltip direction="auto" permanent>Rota p/ {uniName} ({minDistance < 1 ? `${Math.round(minDistance * 1000)}m` : `${minDistance.toFixed(1)}km`})</Tooltip>
            </Polygon>
          );
        })()}

      </MapContainer>

      {/* POI Filter Toggles (Floating UI) */}
      <div className="absolute top-4 right-4 z-[1010] flex flex-col gap-2 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center mb-1 flex items-center justify-center gap-1">
          Conveniências
        </p>
        <div className="flex flex-col gap-2">
          {categories.map(c => {
            const isActive = activeCategories.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={(e) => { e.stopPropagation(); toggleCategory(c.id); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(c.id) }}></span>
                {c.label}
              </button>
            );
          })}
          
          <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-1"></div>
          
          <button
            onClick={(e) => { e.stopPropagation(); setShowUniversities(!showUniversities); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showUniversities 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-500/20' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Polos Universitários
          </button>
        </div>
      </div>
      
      {/* Global styles for custom tooltip to override Leaflet defaults */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-hover-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .custom-hover-tooltip::before {
          display: none !important; /* Hide the default little arrow */
        }
      `}} />
    </div>
  );
}
