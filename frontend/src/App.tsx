import { useState, useCallback, useEffect } from 'react'
import { useNodes } from './hooks/useNodes'
import { useCoverage } from './hooks/useCoverage'
import { MapView } from './components/MapView'
import { Sidebar } from './components/Sidebar'
import type { MeshNode } from './types/node'

export default function App() {
  const { nodes, selectedId, setSelectedId, addNode, updateNode, removeNode } = useNodes()
  const { coverage, analyzing, status, analyzeNode, analyzeAll, clearCoverage, dropCoverage } = useCoverage()
  const [placing, setPlacing] = useState(false)
  const [hiddenCoverage, setHiddenCoverage] = useState<Set<string>>(new Set())

  const anyCoverage = nodes.some(n => n.id in coverage)
  const allHidden   = nodes.every(n => hiddenCoverage.has(n.id))

  const toggleAllCoverage = useCallback(() => {
    if (allHidden) {
      setHiddenCoverage(new Set())
    } else {
      setHiddenCoverage(new Set(nodes.map(n => n.id)))
    }
  }, [allHidden, nodes])

  const toggleCoverage = useCallback((id: string) => {
    setHiddenCoverage(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleMapClick = useCallback((lat: number, lon: number) => {
    if (!placing) return
    const node = addNode(lat, lon)
    setPlacing(false)
    analyzeNode(node)
  }, [placing, addNode, analyzeNode])

  const handleNodeMove = useCallback((id: string, lat: number, lon: number) => {
    const node = nodes.find(n => n.id === id)
    if (!node) return
    const moved: MeshNode = { ...node, lat, lon }
    updateNode(id, { lat, lon })
    analyzeNode(moved)
  }, [nodes, updateNode, analyzeNode])

  const handleRemove = useCallback((id: string) => {
    removeNode(id)
    dropCoverage(id)
  }, [removeNode, dropCoverage])

  const handleUpdateNode = useCallback((id: string, patch: Partial<MeshNode>) => {
  updateNode(id, patch)
  // Auto-recompute when radio settings change via dropdown
  const radioKeys: (keyof MeshNode)[] = ['loraPreset', 'freqMhz', 'txDbm', 'gainDbi']
  const hasRadioChange = radioKeys.some(k => k in patch)
  if (hasRadioChange) {
    const node = nodes.find(n => n.id === id)
    if (node) analyzeNode({ ...node, ...patch })
  }
}, [nodes, updateNode, analyzeNode])

  useEffect(() => {
    analyzeAll(nodes)
  }, []) // empty deps — runs once on mount

  // Button style based on state
  const covBtnStyle = !anyCoverage
    ? { ...btnStyle('#5A7A90', '#1E3448'), opacity: 0.4, cursor: 'not-allowed' as const }
    : allHidden
      ? btnStyle('#E8A838', '#7A5519')   // amber = hidden, click to show
      : btnStyle('#48CAE4', '#1E3448')   // cyan = visible, click to hide

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── Header ── */}
      <header style={{
        height: 48, background: '#12212F', borderBottom: '1px solid #1E3448',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: '#E8A838', marginRight: 8 }}>
          📡 NODEPLANNER
        </span>
        <button onClick={() => analyzeAll(nodes)} disabled={analyzing} style={btnStyle('#E8A838', '#7A5519')}>
          {analyzing ? 'Analyzing…' : '📡 Analyze All'}
        </button>
        <button
          style={covBtnStyle}
          disabled={!anyCoverage}
          onClick={toggleAllCoverage}
        >
          {!anyCoverage
            ? '👁 No Coverage Computed'
            : allHidden
              ? '👁 Show All Coverage'
              : '👁 Hide All Coverage'}
        </button>

        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5A7A90', marginLeft: 8 }}>
          {status}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <Stat label="Nodes"   val={nodes.filter(n => !n.planned).length} color="#2ECC71" />
          <Stat label="Planned" val={nodes.filter(n =>  n.planned).length} color="#E8A838" />
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          nodes={nodes}
          selectedId={selectedId}
          placing={placing}
          hiddenCoverage={hiddenCoverage}
          coverage={coverage}
          onSelect={setSelectedId}
          onPlace={() => setPlacing(p => !p)}
          onUpdate={handleUpdateNode}
          onRemove={handleRemove}
          onAnalyze={analyzeNode}
          onToggleCoverage={toggleCoverage}
          onDeselect={() => setSelectedId(null)}
        />
        <MapView
          nodes={nodes}
          coverage={coverage}
          selectedId={selectedId}
          placing={placing}
          hiddenCoverage={hiddenCoverage}
          onNodeSelect={setSelectedId}
          onNodeMove={handleNodeMove}
          onMapClick={handleMapClick}
        />
      </div>

    </div>
  )
}

function btnStyle(color: string, border: string): React.CSSProperties {
  return {
    padding: '5px 11px', borderRadius: 5, border: `1px solid ${border}`,
    background: 'transparent', color, fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11, cursor: 'pointer',
  }
}

function Stat({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color }}>{val}</span>
      <span style={{ fontSize: 9, color: '#5A7A90', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}