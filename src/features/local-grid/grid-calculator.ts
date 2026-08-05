export interface CompetitorListing {
  rank: number;
  title: string;
  rating?: number;
  reviewsCount?: number;
  address?: string;
  placeId?: string;
  cid?: string;
  websiteUrl?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface GridPoint {
  lat: number;
  lng: number;
  row: number;
  col: number;
  rank?: number;
  results?: CompetitorListing[];
}

/**
 * Generates local grid coordinates around the center point.
 * In Whitespark and Local Falcon, the distance parameter represents the 
 * spacing between each adjacent node rather than the total grid radius.
 */
export function generateGridPoints(
  center: { lat: number; lng: number },
  gridSize: 3 | 5 | 7,
  nodeDistanceMiles: number
): GridPoint[] {
  const points: GridPoint[] = [];
  const milesPerDegreeLat = 69.0;
  const milesPerDegreeLng = 69.0 * Math.cos((center.lat * Math.PI) / 180);

  const halfSize = Math.floor(gridSize / 2);
  // Node distance is used directly as the step size between adjacent nodes
  const stepMiles = nodeDistanceMiles;

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
