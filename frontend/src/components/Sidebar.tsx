import React from 'react';
import type { MeshNode, HardwareModel } from '../types/node';
import { HW_SPECS } from '../types/node';
import { maxRangeM } from '../utils/linkBudget';

const S: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 256, flexShrink: 0, background: '#12212F',
    borderRight: '1px solid #1E3448', display: 'flex',
    flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, sans-serif',
  },
  head:  { padding: '11px 14px 8px', borderBottom: '1px solid #1E3448' },
  label: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5A7A90', textTransform: 'uppercase', letterSpacing: '0.08em' },
  list:  { flex: 1, overflowY: 'auto', padding: 6 },
  name:  { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500, color: '#C8D8E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sub:   { fontSize: 9, color: '#5A7A90', marginTop: 1 },
  badge: { fontSize: 9, padding: '0 4px', borderRadius: 3, fontFamily: 'JetBrains Mono, monospace', border: '1px solid #7A5519', color: '#E8A838', marginLeft: 'auto', flexShrink: 0 },
  dp:      { padding: '12px 14px', borderTop: '1px solid #1E3448', overflowY: 'auto' },
  dpName:  { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#C8D8E8', marginBottom: 10 },
  metrics: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 },
  mVal:    { fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600 },
  mLbl:    { fontSize: 9, color: '#5A7A90', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 },
  fLbl:    { fontSize: 9, color: '#5A7A90', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3, fontFamily: 'JetBrains Mono, monospace' },
  input:   { width: '100%', background: '#0B1724', border: '1px solid #1E3448', color: '#C8D8E8', padding: '5px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, marginBottom: 8 },
  select:  { width: '100%', background: '#0B1724', border: '1px solid #1E3448', color: '#C8D8E8', padding: '5px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, marginBottom: 8, cursor: 'pointer' },
  btnAmber: { width: '100%', padding: 7, borderRadius: 5, background: 'rgba(232,168,56,0.1)', border: '1px solid #7A5519', color: '#E8A838', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, cursor: 'pointer', marginTop: 4 },
  btnRed:   { width: '100%', padding: 7, borderRadius: 5, background: 'transparent', border: '1px solid #522', color: '#E74C3C', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, cursor: 'pointer', marginTop: 4 },
  btnGhost: { width: '100%', padding: 7, borderRadius: 5, background: 'transparent', border: '1px solid #1E3448', color: '#5A7A90', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, cursor: 'pointer', marginTop: 4 },
};

const row = (sel: boolean): React.CSSProperties => ({
  padding: '8px 10px', borderRadius: 5, cursor: 'pointer',
  border: `1px solid ${sel ? '#48CAE4' : 'transparent'}`,
  background: sel ? 'rgba(72,202,228,0.07)' : 'transparent',
  marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .12s',
});

const dot = (color: string, planned: boolean): React.CSSProperties => ({
  width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
  background: planned ? 'transparent' : color,
  border: planned ? `1.5px dashed ${color}` : 'none',
});

const addBtn = (placing: boolean): React.CSSProperties => ({
  margin: '6px 8px 8px', padding: 7, borderRadius: 5,
  border: `1px dashed ${placing ? '#E8A838' : '#1E3448'}`,
  background: placing ? 'rgba(232,168,56,0.07)' : 'transparent',
  color: placing ? '#E8A838' : '#5A7A90',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
  cursor: 'pointer', width: 'calc(100% - 16px)',
});

const covDot = (id: string, coverage: Record<string, unknown>, hiddenCoverage: Set<string>): React.CSSProperties => ({
  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
  background: id in coverage
    ? hiddenCoverage.has(id) ? '#7A5519' : '#2ECC71'
    : '#1E3448',
  border: '1px solid #1E3448',
});

interface SidebarProps {
  nodes:            MeshNode[];
  selectedId:       string | null;
  placing:          boolean;
  hiddenCoverage:   Set<string>;
  coverage:         Record<string, unknown>;
  onSelect:         (id: string) => void;
  onPlace:          () => void;
  onUpdate:         (id: string, patch: Partial<MeshNode>) => void;
  onRemove:         (id: string) => void;
  onAnalyze:        (node: MeshNode) => void;
  onToggleCoverage: (id: string) => void;
}

export function Sidebar({
  nodes, selectedId, placing, hiddenCoverage, coverage,
  onSelect, onPlace, onUpdate, onRemove, onAnalyze, onToggleCoverage,
}: SidebarProps) {
  const selected = nodes.find(n => n.id === selectedId) ?? null;

  const CoverageToggleButton = () => {
    if (!selected) return null;
    const hasCoverage = selected.id in coverage;
    const isHidden    = hiddenCoverage.has(selected.id);

    if (!hasCoverage) {
      return (
        <button
          style={{ ...S.btnGhost, opacity: 0.4, cursor: 'not-allowed' }}
          disabled
        >
          👁 No Coverage Computed
        </button>
      );
    }

    if (isHidden) {
      return (
        <button
          style={{ ...S.btnGhost, color: '#E8A838', borderColor: '#7A5519' }}
          onClick={() => onToggleCoverage(selected.id)}
        >
          👁 Show Coverage
        </button>
      );
    }

    return (
      <button
        style={{ ...S.btnGhost, color: '#48CAE4', borderColor: '#48CAE4' }}
        onClick={() => onToggleCoverage(selected.id)}
      >
        👁 Hide Coverage
      </button>
    );
  };

  return (
    <div style={S.sidebar}>
      <div style={S.head}><div style={S.label}>Network Nodes</div></div>

      <div style={S.list}>
        {nodes.map(n => (
          <div key={n.id} style={row(n.id === selectedId)} onClick={() => onSelect(n.id)}>
            <div style={dot(n.color, n.planned)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.name}>{n.name}</div>
              <div style={S.sub}>
                {HW_SPECS[n.hw].name} · {(maxRangeM(n.hw) / 1000).toFixed(0)} km max
              </div>
            </div>
            {n.planned && <div style={S.badge}>PLAN</div>}
            <div style={covDot(n.id, coverage, hiddenCoverage)} />
          </div>
        ))}
      </div>

      <button style={addBtn(placing)} onClick={onPlace}>
        {placing ? '× Cancel — click map to place' : '+ Add Planned Node'}
      </button>

      {selected && (
        <div style={S.dp}>
          <div style={S.dpName} title={selected.id}>{selected.name}</div>

          <div style={S.metrics}>
            <div>
              <div style={{ ...S.mVal, color: '#48CAE4' }}>
                {(maxRangeM(selected.hw) / 1000).toFixed(0)} km
              </div>
              <div style={S.mLbl}>Theo. range</div>
            </div>
            <div>
              <div style={{ ...S.mVal, color: '#C8D8E8' }}>
                {HW_SPECS[selected.hw].txDbm} dBm
              </div>
              <div style={S.mLbl}>TX power</div>
            </div>
            <div>
              <div style={{ ...S.mVal, color: '#C8D8E8' }}>{selected.antM} m</div>
              <div style={S.mLbl}>Ant. height</div>
            </div>
            <div>
              <div style={{ ...S.mVal, color: selected.planned ? '#E8A838' : '#2ECC71' }}>
                {selected.planned ? 'Planned' : 'Live'}
              </div>
              <div style={S.mLbl}>Status</div>
            </div>
          </div>

          <div style={S.fLbl}>Name</div>
          <input
            style={S.input}
            value={selected.name}
            onChange={e => onUpdate(selected.id, { name: e.target.value })}
          />

          <div style={S.fLbl}>Hardware</div>
          <select
            style={S.select}
            value={selected.hw}
            onChange={e => onUpdate(selected.id, { hw: e.target.value as HardwareModel })}
          >
            {(Object.keys(HW_SPECS) as HardwareModel[]).map(k => (
              <option key={k} value={k}>{HW_SPECS[k].name}</option>
            ))}
          </select>

          <div style={S.fLbl}>Antenna height (m)</div>
          <input
            style={S.input}
            type="number"
            min={0}
            max={100}
            value={selected.antM}
            onChange={e => onUpdate(selected.id, { antM: +e.target.value })}
          />

          <CoverageToggleButton />

          <button style={S.btnAmber} onClick={() => onAnalyze(selected)}>
            📡 Recompute Coverage
          </button>

          <button style={S.btnRed} onClick={() => onRemove(selected.id)}>
            ✕ Remove Node
          </button>
        </div>
      )}
    </div>
  );
}