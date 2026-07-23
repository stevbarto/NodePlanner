export type HardwareModel = 'HELTEC_V3' | 'TBEAM' | 'RAK4631' | 'SENSECAP' | 'HELTEC_V2' | 'TBEAM_S3' | 'GENERIC';

export interface HardwareSpec {
  name:             string;
  txDbm:            number;   // default TX power
  maxTxDbm:         number;   // hardware ceiling
  gainDbi:          number;   // default antenna gain
  externalAntenna:  boolean;  // can user attach external antenna?
  notes:            string;
}

export const HW_SPECS: Record<HardwareModel, HardwareSpec> = {
  HELTEC_V3: {
    name: 'Heltec V3',
    txDbm: 20, maxTxDbm: 20, gainDbi: 2.15,
    externalAntenna: true,
    notes: 'SMA connector — supports external antenna',
  },
  HELTEC_V2: {
    name: 'Heltec V2',
    txDbm: 20, maxTxDbm: 20, gainDbi: 2.15,
    externalAntenna: true,
    notes: 'SMA connector — supports external antenna',
  },
  TBEAM: {
    name: 'T-Beam',
    txDbm: 20, maxTxDbm: 20, gainDbi: 2.15,
    externalAntenna: true,
    notes: 'SMA connector — supports external antenna',
  },
  TBEAM_S3: {
    name: 'T-Beam S3',
    txDbm: 22, maxTxDbm: 22, gainDbi: 2.15,
    externalAntenna: true,
    notes: 'SMA connector — supports external antenna',
  },
  RAK4631: {
    name: 'RAK4631',
    txDbm: 22, maxTxDbm: 22, gainDbi: 2.15,
    externalAntenna: true,
    notes: 'IPEX/SMA connector — supports external antenna',
  },
  SENSECAP: {
    name: 'SenseCAP T1000-E',
    txDbm: 20, maxTxDbm: 20, gainDbi: 1.5,
    externalAntenna: false,
    notes: 'Internal PCB antenna only — gain is fixed by hardware, cannot attach external antenna',
  },
  GENERIC: {
    name: 'Generic / Custom',
    txDbm: 17, maxTxDbm: 30, gainDbi: 2.15,
    externalAntenna: true,
    notes: 'Fully user-defined — no hardware constraints applied',
  },
};

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
  SHORT_FAST:     { name: 'ShortFast',     rxSensDbm: -117, note: 'SF7  / BW500 — fastest, shortest range'    },
  SHORT_SLOW:     { name: 'ShortSlow',     rxSensDbm: -120, note: 'SF8  / BW250'                              },
  MEDIUM_FAST:    { name: 'MediumFast',    rxSensDbm: -123, note: 'SF9  / BW250'                              },
  MEDIUM_SLOW:    { name: 'MediumSlow',    rxSensDbm: -126, note: 'SF10 / BW250'                              },
  LONG_FAST:      { name: 'LongFast',      rxSensDbm: -134, note: 'SF11 / BW250 — Meshtastic default'         },
  LONG_MODERATE:  { name: 'LongModerate',  rxSensDbm: -136, note: 'SF11 / BW125'                              },
  LONG_SLOW:      { name: 'LongSlow',      rxSensDbm: -137, note: 'SF12 / BW125 — long range, slow'           },
  VERY_LONG_SLOW: { name: 'VeryLongSlow',  rxSensDbm: -140, note: 'SF12 / BW62  — maximum range, very slow'   },
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
  freqMhz:    number;
  loraPreset: LoraPreset;
  txDbm:      number;
  gainDbi:    number;
}
