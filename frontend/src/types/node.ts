export type HardwareModel = 'HELTEC_V3' | 'TBEAM' | 'RAK4631' | 'SENSECAP' | 'GENERIC';

export const HW_SPECS: Record<HardwareModel, { name: string; txDbm: number; gainDbi: number }> = {
  HELTEC_V3: { name: 'Heltec V3',         txDbm: 20, gainDbi: 2.15 },
  TBEAM:     { name: 'T-Beam',            txDbm: 20, gainDbi: 2.15 },
  RAK4631:   { name: 'RAK4631',           txDbm: 22, gainDbi: 2.15 },
  SENSECAP:  { name: 'SenseCAP T1000-E',  txDbm: 20, gainDbi: 2.15 },
  GENERIC:   { name: 'Generic LoRa',      txDbm: 17, gainDbi: 2.15 },
};

export interface MeshNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altM: number;   // ground elevation offset (m)
  antM: number;   // antenna height above ground (m)
  hw: HardwareModel;
  planned: boolean;
  color: string;
}