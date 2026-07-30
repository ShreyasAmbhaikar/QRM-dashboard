export interface GridPoint {
  lat: number;
  lng: number;
  row: number;
  col: number;
  rank?: number;
}

export function generateGridPoints(
  center: { lat: number; lng: number },
  gridSize: 3 | 5 | 7,
  radiusMiles: number
): GridPoint[] {
  const points: GridPoint[] = [];
  const milesPerDegreeLat = 69.0;
  const milesPerDegreeLng = 69.0 * Math.cos((center.lat * Math.PI) / 180);

  const halfSize = Math.floor(gridSize / 2);
  const stepMiles = radiusMiles / (halfSize || 1);

  for (let row = -halfSize; row <= halfSize; row++) {
    for (let col = -halfSize; col <= halfSize; col++) {
      const latOffset = (row * stepMiles) / milesPerDegreeLat;
      const lngOffset = (col * stepMiles) / milesPerDegreeLng;

      points.push({
        lat: Number((center.lat + latOffset).toFixed(6)),
        lng: Number((center.lng + lngOffset).toFixed(6)),
        row: row + halfSize,
        col: col + halfSize,
      });
    }
  }

  return points;
}
