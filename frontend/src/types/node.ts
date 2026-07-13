export type HardwareModel = 'HELTEC_V3' | 'TBEAM' | 'RAK4631' | 'SENSECAP' | 'GENERIC';

// export const HW_SPECS: Record<HardwareModel, { name: string; txDbm: number; gainDbi: number }> = {
//   HELTEC_V3: { name: 'Heltec V3',         txDbm: 20, gainDbi: 2.15 },
//   TBEAM:     { name: 'T-Beam',            txDbm: 20, gainDbi: 2.15 },
//   RAK4631:   { name: 'RAK4631',           txDbm: 22, gainDbi: 2.15 },
//   SENSECAP:  { name: 'SenseCAP T1000-E',  txDbm: 20, gainDbi: 2.15 },
//   GENERIC:   { name: 'Generic / Custom',  txDbm: 17, gainDbi: 2.15 },
// };

export const HW_SPECS = {
  HELTEC_V3: {
    name: 'Heltec V3',
    txDbm: 20, maxTxDbm: 20,
    gainDbi: 2.15,
    externalAntenna: true,
    notes: 'SMA connector, supports external antenna'
  },
  RAK4631: {
    name: 'RAK4631',
    txDbm: 22, maxTxDbm: 22,
    gainDbi: 2.15,
    externalAntenna: true,
    notes: 'IPEX connector, supports external antenna'
  },
  SENSECAP: {
    name: 'SenseCAP T1000-E',
    txDbm: 20, maxTxDbm: 20,
    gainDbi: 1.5,
    externalAntenna: false,
    notes: 'Internal PCB antenna only, gain fixed ~1.5 dBi'
  },
  TBEAM: {
    name: 'T-Beam',
    txDbm: 20, maxTxDbm: 20,
    gainDbi: 2.15,
    externalAntenna: true,
    notes: 'SMA connector, supports external antenna'
  },
  GENERIC: {
    name: 'Generic / Custom',
    txDbm: 17, maxTxDbm: 30,
    gainDbi: 2.15,
    externalAntenna: true,
    notes: 'Fully user-defined'
  },
}

export type LoraPreset =
  | 'SHORT_FAST'
  | 'SHORT_SLOW'
  | 'MEDIUM_FAST'
  | 'MEDIUM_SLOW'
  | 'LONG_FAST'
  | 'LONG_MODERATE'
  | 'LONG_SLOW'
  | 'VERY_LONG_SLOW';

export const LORA_PRESETS: Record<LoraPreset, { name: string; rxSensDbm: number; note: string }> = {
  SHORT_FAST:      { name: 'ShortFast',      rxSensDbm: -117, note: 'SF7  / BW500 — fastest, shortest range'   },
  SHORT_SLOW:      { name: 'ShortSlow',      rxSensDbm: -120, note: 'SF8  / BW250'                             },
  MEDIUM_FAST:     { name: 'MediumFast',     rxSensDbm: -123, note: 'SF9  / BW250'                             },
  MEDIUM_SLOW:     { name: 'MediumSlow',     rxSensDbm: -126, note: 'SF10 / BW250'                             },
  LONG_FAST:       { name: 'LongFast',       rxSensDbm: -134, note: 'SF11 / BW250 — Meshtastic default'        },
  LONG_MODERATE:   { name: 'LongModerate',   rxSensDbm: -136, note: 'SF11 / BW125'                             },
  LONG_SLOW:       { name: 'LongSlow',       rxSensDbm: -137, note: 'SF12 / BW125 — long range, slow'          },
  VERY_LONG_SLOW:  { name: 'VeryLongSlow',   rxSensDbm: -140, note: 'SF12 / BW62  — maximum range'             },
};

export interface MeshNode {
  id:          string;
  name:        string;
  lat:         number;
  lon:         number;
  altM:        number;        // ground elevation offset (m)
  antM:        number;        // antenna height above ground (m)
  hw:          HardwareModel;
  planned:     boolean;
  color:       string;
  // Radio config — editable per node
  freqMhz:    number;         // 915 US | 868 EU | 433 Asia
  loraPreset: LoraPreset;
  txDbm:      number;         // initialized from HW_SPECS, user-editable
  maxTxDbm:   number;         // initialized from HW_SPECS
  gainDbi:    number;         // antenna gain, user-editable
}
