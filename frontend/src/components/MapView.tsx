import { useMemo } from 'react';
import {
  MapContainer, TileLayer, Marker, Polygon, Circle, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { MeshNode } from '../types/node';
import type { CoverageMap } from '../hooks/useCoverage';
import { maxRangeM } from '../utils/linkBudget';
import { isTerrainAvailable } from '../utils/elevation';

// ── Click handler ─────────────────────────────────────────────
function ClickHandler({
  placing, onClick,
}: {
  placing: boolean;
  onClick: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) { if (placing) onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

// ── Node marker ───────────────────────────────────────────────
function NodeMarker({
  node, isSelected, onSelect, onMove,
}: {
  node:       MeshNode;
  isSelected: boolean;
  onSelect:   (id: string) => void;
  onMove:     (id: string, lat: number, lon: number) => void;
}) {
  const icon = useMemo(() => {
    const borderWidth = isSelected ? '3px' : '2px';
    const borderStyle = node.planned ? 'dashed' : 'solid';
    const glow = isSelected
      ? `0 0 0 2px ${node.color}, 0 2px 14px rgba(0,0,0,0.8)`
      : '0 2px 10px rgba(0,0,0,0.55)';
    const ringAnim = isSelected
      ? 'meshring 1.4s ease-out infinite'
      : 'meshring 2.8s ease-out infinite';
    const ringBorder = isSelected ? '2px' : '1px';
    const labelBg    = isSelected ? node.color : 'rgba(11,23,36,.88)';
    const labelColor = isSelected ? '#0B1724' : node.color;

    return L.divIcon({
      className: '',
      iconAnchor: [17, 17],
      iconSize:   [34, 52],
      html: `
        <style>
          @keyframes meshring {
            0%   { opacity:.6; transform:scale(.8);  }
            100% { opacity:0;  transform:scale(2.2); }
          }
        </style>
        <div style="width:34px;height:52px;position:relative">
          <div style="
            width:32px;height:32px;border-radius:50%;
            background:rgba(11,23,36,.88);
            border:${borderWidth} ${borderStyle} ${node.color};
            display:flex;align-items:center;justify-content:center;
            font-size:13px;box-shadow:${glow};position:relative;
          ">
            ${node.planned ? '📡' : '📱'}
            <div style="
              position:absolute;inset:-6px;border-radius:50%;
              border:${ringBorder} solid ${node.color};
              opacity:0;animation:${ringAnim};
            "></div>
          </div>
          <div style="
            position:absolute;bottom:0;left:50%;transform:translateX(-50%);
            font-family:'JetBrains Mono',monospace;font-size:9px;white-space:nowrap;
            background:${labelBg};color:${labelColor};font-weight:${isSelected ? 600 : 400};
            padding:1px 5px;border-radius:3px;
            border:1px solid rgba(255,255,255,.1);
            transition:all .15s;
          ">
            ${node.name}
          </div>
        </div>`,
    });
  }, [node.color, node.planned, node.name, isSelected]);

  return (
    <Marker
      position={[node.lat, node.lon]}
      icon={icon}
      draggable
      eventHandlers={{
        click:   () => onSelect(node.id),
        dragend: (e) => {
          const ll = e.target.getLatLng();
          onMove(node.id, ll.lat, ll.lng);
        },
      }}
    />
  );
}

// ── Public component ──────────────────────────────────────────
interface MapViewProps {
  nodes:        MeshNode[];
  coverage:     CoverageMap;
  selectedId:   string | null;
  placing:      boolean;
  hiddenCoverage: Set<string>;
  analyzing: boolean;
  onNodeSelect: (id: string) => void;
  onNodeMove:   (id: string, lat: number, lon: number) => void;
  onMapClick:   (lat: number, lon: number) => void;
}

export function MapView({
  nodes, coverage, selectedId, placing, hiddenCoverage, analyzing,
  onNodeSelect, onNodeMove, onMapClick,
}: MapViewProps) {
  return (
    <div style={{ flex: 1, position: 'relative', cursor: placing ? 'crosshair' : 'default' }}>
      {analyzing && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(18,33,47,0.93)',
          border: '1px solid #1E3448', borderRadius: 20,
          padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#5A7A90',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            border: '2px solid #1E3448', borderTopColor: '#48CAE4',
            animation: 'spin 0.7s linear infinite', flexShrink: 0,
          }} />
          Loading terrain & computing coverage…
        </div>
      )}
      <MapContainer
        center={[40.313, -112.012]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
          maxZoom={17}
        />

        <ClickHandler placing={placing} onClick={onMapClick} />

        {/* Coverage polygons — render unselected first, selected on top */}
        {[false, true].map(renderSelected =>
          nodes.map(node => {
            const isSelected = node.id === selectedId;
            if (isSelected !== renderSelected) return null;
            const poly = coverage[node.id];
            if (!poly || hiddenCoverage.has(node.id)) return null;

            if (poly.length > 0 && isTerrainAvailable()) {
              return (
                <Polygon
                  key={node.id}
                  positions={poly}
                  pathOptions={{
                    color:       node.color,
                    weight:      isSelected ? 2.5 : 1.5,
                    opacity:     isSelected ? 1.0 : 0.6,
                    fillColor:   node.color,
                    fillOpacity: isSelected ? 0.35 : 0.15,
                  }}
                />
              );
            }

            return (
              <Circle
                key={node.id}
                center={[node.lat, node.lon]}
                radius={maxRangeM(node)}
                pathOptions={{
                  color:       node.color,
                  weight:      isSelected ? 2 : 1,
                  opacity:     isSelected ? 0.9 : 0.5,
                  fillColor:   node.color,
                  fillOpacity: isSelected ? 0.15 : 0.07,
                  dashArray:   '5 5',
                }}
              />
            );
          })
        )}

        {/* Node markers */}
        {nodes.map(node => (
          <NodeMarker
            key={node.id}
            node={node}
            isSelected={node.id === selectedId}
            onSelect={onNodeSelect}
            onMove={onNodeMove}
          />
        ))}

      </MapContainer>
    </div>
  );
}
