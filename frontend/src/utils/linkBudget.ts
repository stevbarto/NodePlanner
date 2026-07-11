import { HW_SPECS } from '../types/node';
import type { HardwareModel } from '../types/node';

// Meshtastic LongFast preset: SF11 BW250 @ 915 MHz
const RX_SENS_DBM = -134.5;
const FREQ_HZ     = 915e6;
const C           = 3e8;

export function maxRangeM(hw: HardwareModel): number {
  const spec   = HW_SPECS[hw];
  const eirp   = spec.txDbm + spec.gainDbi;
  const budget = eirp - RX_SENS_DBM;
  const wl     = C / FREQ_HZ;
  return Math.min((wl / (4 * Math.PI)) * Math.pow(10, budget / 20), 22000);
}