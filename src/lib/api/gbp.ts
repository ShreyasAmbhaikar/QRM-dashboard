import { decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';

export interface GbpLocationDetails {
  locationId: string;
  name: string;
  primaryCategory: string;
  address: string;
  phone: string;
  websiteUrl: string;
  photoCount: number;
}

export class GbpApiClient {
  private accessToken: string;

  constructor(encryptedAccessToken: string) {
    this.accessToken = decrypt(encryptedAccessToken);
  }

  public async getAccountLocations(): Promise<GbpLocationDetails[]> {
    if (!process.env.GOOGLE_CLIENT_ID) {
      logger.info('GOOGLE_CLIENT_ID missing. Returning simulated GBP location data.');
      return [
        {
          locationId: 'locations/1234567890',
          name: 'Main Storefront',
          primaryCategory: 'Plumber / Emergency Plumbing',
          address: '123 Main St, Chicago, IL 60601',
          phone: '(555) 234-5678',
          websiteUrl: 'https://acmeplumbing.com',
          photoCount: 12,
        },
      ];
    }

    try {
      const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GBP API error: ${response.status}`);
      }

      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      logger.error({ error }, 'Failed to fetch GBP account locations');
      return [];
    }
  }

  public async publishLocalPost(locationId: string, postData: { summary: string; callToAction?: any; media?: any }) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      logger.info({ locationId, postData }, 'Simulated GBP post publication success.');
      return { name: `locations/${locationId}/localPosts/mock-post-99` };
    }

    try {
      const response = await fetch(`https://mybusiness.googleapis.com/v4/${locationId}/localPosts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`GBP Post creation failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error({ error, locationId }, 'Failed to publish post to GBP API');
      throw error;
    }
  }
}
