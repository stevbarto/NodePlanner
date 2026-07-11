import { useState, useCallback } from 'react';
import type { MeshNode } from '../types/node';
import { preloadTiles, isTerrainAvailable } from '../utils/elevation';
import { computeViewshed } from '../utils/viewshed';
import type { LatLonTuple } from '../utils/viewshed';
import { maxRangeM } from '../utils/linkBudget';

export type CoverageMap = Record<string, LatLonTuple[]>;

export function useCoverage() {
  const [coverage,  setCoverage]  = useState<CoverageMap>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [status,    setStatus]    = useState('');

  const analyzeNode = useCallback(async (node: MeshNode) => {
    setStatus(`Loading terrain for ${node.name}…`);
    await preloadTiles(node.lat, node.lon, 15000);

    if (!isTerrainAvailable()) {
      // Fallback: just store an empty entry; App will draw a range circle instead
      setCoverage(prev => ({ ...prev, [node.id]: [] }));
      setStatus('');
      return;
    }

    setStatus(`Computing viewshed for ${node.name}…`);
    await new Promise(r => setTimeout(r, 10)); // yield so the status renders
    const poly = computeViewshed(node);
    setCoverage(prev => ({ ...prev, [node.id]: poly }));
    setStatus('');
  }, []);

  const analyzeAll = useCallback(async (nodes: MeshNode[]) => {
    setAnalyzing(true);
    for (const node of nodes) {
      await analyzeNode(node);
    }
    setAnalyzing(false);
    setStatus(`✓ ${nodes.length} nodes analyzed`);
    setTimeout(() => setStatus(''), 2500);
  }, [analyzeNode]);

  const clearCoverage  = useCallback(() => setCoverage({}), []);
  const dropCoverage   = useCallback((id: string) =>
    setCoverage(prev => { const n = { ...prev }; delete n[id]; return n; }), []);

  return { coverage, analyzing, status, analyzeNode, analyzeAll, clearCoverage, dropCoverage };
}