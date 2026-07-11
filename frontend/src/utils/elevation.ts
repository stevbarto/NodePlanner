// AWS Terrarium tiles — free, no API key, CORS-enabled
// Encoding: elevation_m = (R × 256 + G + B / 256) − 32768

const ELEV_Z = 12; // ~28 m/pixel at 40°N — enough for 1–15 km planning
const cache: Record<string, ImageData | null> = {};
let _terrainOK = false;

export const isTerrainAvailable = () => _terrainOK;

function ll2tile(lat: number, lon: number, z: number) {
  const n = 1 << z;
  const latR = (lat * Math.PI) / 180;
  return {
    tx: Math.floor(((lon + 180) / 360) * n),
    ty: Math.floor(
      ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n
    ),
  };
}

function ll2px(lat: number, lon: number, z: number, tx: number, ty: number) {
  const n = 1 << z;
  const latR = (lat * Math.PI) / 180;
  return {
    px: Math.max(0, Math.min(255, Math.floor((((lon + 180) / 360) * n - tx) * 256))),
    py: Math.max(
      0,
      Math.min(
        255,
        Math.floor(
          (((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n - ty) * 256
        )
      )
    ),
  };
}

function loadTile(z: number, x: number, y: number): Promise<ImageData | null> {
  const k = `${z}/${x}/${y}`;
  if (k in cache) return Promise.resolve(cache[k]);
  cache[k] = null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 256;
        cv.getContext('2d')!.drawImage(img, 0, 0);
        cache[k] = cv.getContext('2d')!.getImageData(0, 0, 256, 256);
        _terrainOK = true;
      } catch {
        cache[k] = null;
      }
      resolve(cache[k]);
    };
    img.onerror = () => { cache[k] = null; resolve(null); };
    img.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  });
}

export function elevAt(lat: number, lon: number): number | null {
  const { tx, ty } = ll2tile(lat, lon, ELEV_Z);
  const d = cache[`${ELEV_Z}/${tx}/${ty}`];
  if (!d) return null;
  const { px, py } = ll2px(lat, lon, ELEV_Z, tx, ty);
  const i = (py * 256 + px) * 4;
  return d.data[i] * 256 + d.data[i + 1] + d.data[i + 2] / 256 - 32768;
}

export async function preloadTiles(lat: number, lon: number, radiusM: number): Promise<void> {
  const dLat = radiusM / 111000;
  const dLon = dLat / Math.cos((lat * Math.PI) / 180);
  const tl = ll2tile(lat + dLat, lon - dLon, ELEV_Z);
  const br = ll2tile(lat - dLat, lon + dLon, ELEV_Z);
  const ps: Promise<ImageData | null>[] = [];
  for (let x = tl.tx; x <= br.tx; x++)
    for (let y = tl.ty; y <= br.ty; y++)
      ps.push(loadTile(ELEV_Z, x, y));
  await Promise.all(ps);
}