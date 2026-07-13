import { useMemo } from 'react';
import {
  MapContainer, TileLayer, Marker, Polygon, Circle, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { MeshNode } from '../types/node';
import type { CoverageMap } from '../hooks/useCoverage';
import { maxRangeM } from '../utils/linkBudget';
import { isTerrainAvailable } from '../utils/elevation';

// ── Internal: wires map click events ─────────────────────────────
function ClickHandler({ placing, onClick }: { placing: boolean; onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) { if (placing) onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

// ── Internal: individual draggable node marker ────────────────────
function NodeMarker({
  node, onSelect, onMove,
}: {
  node: MeshNode;
  onSelect: (id: string) => void;
  onMove: (id: string, lat: number, lon: number) => void;
}) {
  const icon = useMemo(() => {
    const ring = node.planned ? '' : `
      <div style="position:absolute;inset:-6px;border-radius:50%;
                  border:1px solid ${node.color};opacity:0;
                  animation:meshring 2.8s ease-out infinite"></div>`;
    const border = node.planned
      ? `border:2px dashed ${node.color}`
      : `border:2px solid ${node.color}`;
    return L.divIcon({
      className: '',
      iconAnchor: [17, 17],
      iconSize:   [34, 52],
      html: `
        <style>
          @keyframes meshring {
            0%   { opacity:.5; transform:scale(.8); }
            100% { opacity:0;  transform:scale(2);  }
          }
        </style>
        <div style="width:34px;height:52px;position:relative">
          <div style="width:32px;height:32px;border-radius:50%;
                      background:rgba(11,23,36,.88);${border};
                      display:flex;align-items:center;justify-content:center;
                      font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,.55);
                      position:relative">
            ${node.planned ? '📡' : '📱'}
            ${ring}
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);
                      font-family:'JetBrains Mono',monospace;font-size:9px;
                      white-space:nowrap;background:rgba(11,23,36,.88);
                      padding:1px 4px;border-radius:3px;
                      border:1px solid rgba(255,255,255,.1);color:${node.color}">
            ${node.name}
          </div>
        </div>`,
    });
  }, [node.color, node.planned, node.name]);

  return (
    <Marker
      position={[node.lat, node.lon]}
      icon={icon}
      draggable
      eventHandlers={{
        click:   () => onSelect(node.id),
        dragend: (e) => { const ll = e.target.getLatLng(); onMove(node.id, ll.lat, ll.lng); },
      }}
    />
  );
}

// ── Public component ──────────────────────────────────────────────
interface MapViewProps {
  nodes:      MeshNode[];
  coverage:   CoverageMap;
  hiddenCoverage: Set<string>;
  selectedId: string | null;
  placing:    boolean;
  onNodeSelect: (id: string) => void;
  onNodeMove:   (id: string, lat: number, lon: number) => void;
  onMapClick:   (lat: number, lon: number) => void;
}

export function MapView({
  nodes, coverage, placing, hiddenCoverage, onNodeSelect, onNodeMove, onMapClick,
}: MapViewProps) {
  return (
    <div style={{ flex: 1, position: 'relative', cursor: placing ? 'crosshair' : 'default' }}>
      <MapContainer
        center={[40.313, -112.012]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* Topo base layer — contours + hillshading */}
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
          maxZoom={17}
        />

        <ClickHandler placing={placing} onClick={onMapClick} />

        {nodes.map(node => (
          <NodeMarker key={node.id} node={node} onSelect={onNodeSelect} onMove={onNodeMove} />
        ))}

        {/* Coverage: viewshed polygon if available, theoretical circle as fallback */}
        {nodes.map(node => {
          const poly = coverage[node.id];
          if (!poly || hiddenCoverage.has(node.id)) return null

          // Terrain coverage polygon
          if (poly.length > 0 && isTerrainAvailable()) {
            return (
              <Polygon
                key={node.id}
                positions={poly}
                pathOptions={{
                  color: node.color, weight: 1.5, opacity: 0.75,
                  fillColor: node.color, fillOpacity: 0.2,
                }}
              />
            );
          }

          // Fallback: theoretical range circle (dashed)
          return (
            <Circle
              key={node.id}
              center={[node.lat, node.lon]}
              radius={maxRangeM(node)}
              pathOptions={{
                color: node.color, weight: 1, opacity: 0.5,
                fillColor: node.color, fillOpacity: 0.07,
                dashArray: '5 5',
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}