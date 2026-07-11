import { useState, useCallback } from 'react';
import type { MeshNode, HardwareModel } from '../types/node';

const PALETTE = [
  '#48CAE4', '#2ECC71', '#E8A838', '#E74C3C',
  '#9B59B6', '#F39C12', '#1ABC9C', '#3498DB',
];

const DEFAULTS: MeshNode[] = [
  { id:'n1', name:'EM-Home',     lat:40.3144, lon:-112.0097, altM:20, antM:4, hw:'HELTEC_V3', planned:false, color:PALETTE[0] },
  { id:'n2', name:'Ranger-VH',   lat:40.3210, lon:-112.0155, altM:10, antM:3, hw:'HELTEC_V3', planned:false, color:PALETTE[1] },
  { id:'n3', name:'Water-Tower', lat:40.3085, lon:-112.0210, altM:15, antM:6, hw:'RAK4631',   planned:false, color:PALETTE[2] },
  { id:'n4', name:'SS-Node',     lat:40.3430, lon:-111.9980, altM:5,  antM:2, hw:'SENSECAP',  planned:false, color:PALETTE[3] },
];

export function useNodes() {
  const [nodes, setNodes]       = useState<MeshNode[]>(DEFAULTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addNode = useCallback((lat: number, lon: number): MeshNode => {
    const id = 'p' + Date.now();
    const node: MeshNode = {
      id, lat, lon,
      name: `Plan-${id.slice(-3)}`,
      altM: 5, antM: 3,
      hw: 'HELTEC_V3',
      planned: true,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    };
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

  return { nodes, selectedId, selectedNode, setSelectedId, addNode, updateNode, removeNode };
}