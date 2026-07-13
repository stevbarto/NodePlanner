import type { MeshNode, LoraPreset } from '../types/node';
import { LORA_PRESETS } from '../types/node';

const C = 3e8;

// Free-space path loss range from full link budget.
// Now uses per-node frequency, LoRa preset sensitivity,
// and user-editable TX power + antenna gain.
export function maxRangeM(node: MeshNode): number {
  const rxSens    = LORA_PRESETS[node.loraPreset].rxSensDbm;
  const freqHz    = node.freqMhz * 1e6;
  const eirp      = node.txDbm + node.gainDbi;
  const FADE_MARGIN_DB = 25; // realistic loss: foliage, cable, polarization
  const budget    = eirp - rxSens - FADE_MARGIN_DB;
  const wl        = C / freqHz;
  return Math.min((wl / (4 * Math.PI)) * Math.pow(10, budget / 20), 80000);
}

// Expose preset list for UI use
export type { LoraPreset };
