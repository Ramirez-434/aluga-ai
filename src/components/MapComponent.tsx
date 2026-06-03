'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, FeatureGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as turf from '@turf/turf';
import L from 'leaflet';
import { MOCK_POIS, POICategory } from '@/data/mockPOIs';
import { Property } from '@/types/property';

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

// Custom pulsing blue marker for properties to look premium
const PremiumIcon = L.divIcon({
  className: 'custom-premium-marker',
  html: `<div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapProps {
  properties: Property[];
  onPropertySelect?: (id: string) => void;
  onPolygonFilter?: (propertyIds: string[] | null) => void;
}

export default function MapComponent({ properties, onPropertySelect, onPolygonFilter }: MapProps) {
  const defaultCenter: [number, number] = [-11.710, -47.724]; // Natividade, TO

  const [activeCategories, setActiveCategories] = useState<POICategory[]>([]);

  const toggleCategory = (cat: POICategory) => {
    setActiveCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const getCategoryColor = (cat: POICategory) => {
    switch (cat) {
      case 'escola': return '#3b82f6'; // blue
      case 'farmacia': return '#ef4444'; // red
      case 'turismo': return '#eab308'; // yellow
      case 'comercio': return '#22c55e'; // green
      default: return '#6b7280';
    }
  };

  const categories: { id: POICategory, label: string }[] = [
    { id: 'escola', label: 'Escolas' },
    { id: 'farmacia', label: 'Farmácias' },
    { id: 'turismo', label: 'Turismo' },
    { id: 'comercio', label: 'Comércio' },
  ];

  const onCreated = (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    
    // Filter properties inside polygon using turf spatial math
    const insideIds = properties.filter(prop => {
      const pt = turf.point([prop.lng, prop.lat]);
      return turf.booleanPointInPolygon(pt, geojson);
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
        {/* Premium CartoDB Positron theme for modern look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

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
        >
          {properties.map(prop => (
            <Marker 
              key={prop.id} 
              position={[prop.lat, prop.lng]} 
              icon={PremiumIcon}
              eventHandlers={{
                click: () => {
                  if (onPropertySelect) onPropertySelect(prop.id);
                }
              }}
            >
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
          ))}
        </MarkerClusterGroup>

        {/* POI Markers */}
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
            <Popup>
              <div className="text-center font-medium shadow-sm">
                <span className="block text-xs uppercase text-gray-400 mb-1">{poi.category}</span>
                {poi.name}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* POI Filter Toggles (Floating UI) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center mb-1">Conveniências</p>
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
        </div>
      </div>
    </div>
  );
}
