import { useState, useCallback, useEffect } from 'react';
import type { MeshNode, HardwareModel, LoraPreset } from '../types/node';
import { HW_SPECS } from '../types/node';

const PALETTE = [
  '#48CAE4', '#2ECC71', '#E8A838', '#E74C3C',
  '#9B59B6', '#F39C12', '#1ABC9C', '#3498DB',
];

const STORAGE_KEY = 'nodeplanner-nodes-v1';

function makeNode(
  id: string,
  name: string,
  lat: number,
  lon: number,
  altM: number,
  antM: number,
  hw: HardwareModel,
  planned: boolean,
  color: string,
  freqMhz = 915,
  loraPreset: LoraPreset = 'LONG_FAST',
): MeshNode {
  const spec = HW_SPECS[hw];
  return {
    id, name, lat, lon, altM, antM, hw, planned, color,
    freqMhz, loraPreset,
    txDbm:   spec.txDbm,
    gainDbi: spec.gainDbi,
  };
}

const DEFAULTS: MeshNode[] = [
  makeNode('n1', 'EM-Home',     40.3144, -112.0097, 20, 4, 'HELTEC_V3', false, PALETTE[0]),
  makeNode('n2', 'Ranger-VH',   40.3210, -112.0155, 10, 3, 'HELTEC_V3', false, PALETTE[1]),
  makeNode('n3', 'Water-Tower', 40.3085, -112.0210, 15, 6, 'RAK4631',   false, PALETTE[2]),
  makeNode('n4', 'SS-Node',     40.3430, -111.9980,  5, 2, 'SENSECAP',  false, PALETTE[3]),
];

function loadSaved(): MeshNode[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MeshNode[]) : null;
  } catch {
    return null;
  }
}

function saveSaved(nodes: MeshNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  } catch { /* ignore storage quota errors */ }
}

export function useNodes() {
  // Load from localStorage on first mount, fall back to defaults
  const [nodes, setNodes] = useState<MeshNode[]>(() => loadSaved() ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Persist to localStorage whenever nodes change
  useEffect(() => {
    saveSaved(nodes);
  }, [nodes]);

  const addNode = useCallback((lat: number, lon: number): MeshNode => {
    const id    = 'p' + Date.now();
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const node  = makeNode(id, `Plan-${id.slice(-3)}`, lat, lon, 5, 3, 'HELTEC_V3', true, color);
    setNodes(prev => [...prev, node]);
    setSelectedId(id);
    return node;
  }, []);

  const updateNode = useCallback((id: string, patch: Partial<MeshNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setSelectedId(prev => (prev === id ? null : prev));
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedId) ?? null;

  return {
    nodes, selectedId, selectedNode,
    setSelectedId, addNode, updateNode, removeNode,
  };
}
