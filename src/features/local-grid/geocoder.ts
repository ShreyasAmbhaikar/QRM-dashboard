import { logger } from '@/lib/logger';

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export type GeocodeProvider = 'google' | 'nominatim' | 'mapbox';

export async function geocodeAddress(
  address: string,
  provider: GeocodeProvider
): Promise<GeocodeResult> {
  const sanitizedAddress = address.trim();
  if (!sanitizedAddress) {
    throw new Error('Address is required for geocoding');
  }

  logger.info({ address: sanitizedAddress, provider }, 'Starting geocoding request');

  switch (provider) {
    case 'google':
      return await geocodeWithGoogle(sanitizedAddress);
    case 'mapbox':
      return await geocodeWithMapbox(sanitizedAddress);
    case 'nominatim':
    default:
      return await geocodeWithNominatim(sanitizedAddress);
  }
}

// 1. Google Geocoding API
async function geocodeWithGoogle(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey || apiKey === 'mock-maps-key') {
    logger.warn('Google Maps Key missing or mock. Falling back to Nominatim.');
    return await geocodeWithNominatim(address);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK' || !data.results?.[0]) {
      throw new Error(`Google Geocoding API error: ${data.status} - ${data.error_message || 'No results'}`);
    }

    const location = data.results[0].geometry.location;
    return {
      lat: Number(location.lat.toFixed(6)),
      lng: Number(location.lng.toFixed(6)),
    };
  } catch (error) {
    logger.error({ error, address }, 'Google geocoding failed, falling back to Nominatim');
    return await geocodeWithNominatim(address);
  }
}

// 2. Mapbox Geocoding API
async function geocodeWithMapbox(address: string): Promise<GeocodeResult> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token || token.startsWith('pk.eyJ1')) {
    logger.warn('Mapbox Access Token missing or default. Falling back to Nominatim.');
    return await geocodeWithNominatim(address);
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?limit=1&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature || !feature.center) {
      throw new Error('Mapbox Geocoding returned no results');
    }

    // Mapbox center is [longitude, latitude]
    const [lng, lat] = feature.center;
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    };
  } catch (error) {
    logger.error({ error, address }, 'Mapbox geocoding failed, falling back to Nominatim');
    return await geocodeWithNominatim(address);
  }
}

// 3. Nominatim (OpenStreetMap) Geocoding API
// Strict 1-second delay buffer is applied to respect Nominatim TOS and prevent rate limit blocks.
let lastNominatimRequestTime = 0;

async function geocodeWithNominatim(address: string): Promise<GeocodeResult> {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimRequestTime;
  
  if (timeSinceLast < 1000) {
    const delay = 1000 - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  
  lastNominatimRequestTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'QRM-Dashboard/1.0 (contact@quantumreachmedia.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.[0];
    if (!result || !result.lat || !result.lon) {
      throw new Error('Nominatim Geocoding returned no results');
    }

    return {
      lat: Number(parseFloat(result.lat).toFixed(6)),
      lng: Number(parseFloat(result.lon).toFixed(6)),
    };
  } catch (error) {
    logger.error({ error, address }, 'Nominatim geocoding failed');
    throw error;
  }
}
