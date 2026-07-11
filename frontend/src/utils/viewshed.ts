import type { MeshNode } from '../types/node';
import { maxRangeM } from './linkBudget';
import { destPoint } from './geo';
import { elevAt } from './elevation';

export type LatLonTuple = [number, number];

export function computeViewshed(node: MeshNode, radials = 72, steps = 44): LatLonTuple[] {
  const rangeM  = Math.min(maxRangeM(node.hw), 14000);
  const stepM   = rangeM / steps;
  const baseElev = elevAt(node.lat, node.lon) ?? 1380;
  const obsH    = baseElev + node.altM + node.antM;
  const poly: LatLonTuple[] = [];

  for (let i = 0; i < radials; i++) {
    const bear = (i / radials) * 360;
    let maxAngle = -Infinity;
    let lastVis  = destPoint(node.lat, node.lon, stepM * 0.4, bear);

    for (let s = 1; s <= steps; s++) {
      const d   = s * stepM;
      const pt  = destPoint(node.lat, node.lon, d, bear);
      const elev = elevAt(pt.lat, pt.lon) ?? baseElev;

      // Earth curvature + standard atmospheric refraction (k = 1.33)
      const curveM = (d * d) / (2 * 6371000 * 1.33);
      const tgtH   = elev - curveM + 2.0; // 2 m remote antenna height

      const angle = (tgtH - obsH) / d;
      if (angle >= maxAngle) {
        maxAngle = angle;
        lastVis  = pt;
      }
    }
    poly.push([lastVis.lat, lastVis.lon]);
  }

  poly.push(poly[0]); // close the ring
  return poly;
}