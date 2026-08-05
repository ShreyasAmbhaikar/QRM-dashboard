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
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'mock-google-client-id') {
      logger.info('Using simulated GBP location data.');
      return [
        {
          locationId: 'locations/chicago-plumbing',
          name: 'Chicago Emergency Plumbers',
          primaryCategory: 'Plumber',
          address: '123 Main St, Chicago, IL 60601',
          phone: '(312) 555-0192',
          websiteUrl: 'https://chicagoemergencyplumbing.com',
          photoCount: 12,
        },
        {
          locationId: 'locations/dallas-dental',
          name: 'Apex Dental Care Dallas',
          primaryCategory: 'Dentist',
          address: '456 Oak Ave, Dallas, TX 75201',
          phone: '(214) 555-0143',
          websiteUrl: 'https://apexdentaldallas.com',
          photoCount: 8,
        },
        {
          locationId: 'locations/boston-hvac',
          name: 'Metro HVAC Solutions Boston',
          primaryCategory: 'HVAC Contractor',
          address: '789 Pine Rd, Boston, MA 02108',
          phone: '(617) 555-0177',
          websiteUrl: 'https://metrohvacboston.com',
          photoCount: 15,
        },
        {
          locationId: 'locations/seattle-law',
          name: 'Summit Law Group Seattle',
          primaryCategory: 'Law Firm',
          address: '101 Broadway, Seattle, WA 98101',
          phone: '(206) 555-0155',
          websiteUrl: 'https://summitlawseattle.com',
          photoCount: 5,
        },
        {
          locationId: 'locations/houston-pizza',
          name: 'All-Star Pizza Houston',
          primaryCategory: 'Pizza Restaurant',
          address: '202 Elm St, Houston, TX 77002',
          phone: '(713) 555-0188',
          websiteUrl: 'https://allstarpizzahouston.com',
          photoCount: 22,
        },
      ];
    }

    try {
      const allLocations: GbpLocationDetails[] = [];

      // 1. Try getting accounts from Account Management API
      const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        const accounts = accountsData.accounts || [];

        for (const account of accounts) {
          const locationsResponse = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress,categories,phoneNumbers,websiteUri&pageSize=100`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            const locations = locationsData.locations || [];
            for (const loc of locations) {
              allLocations.push(this.formatLocation(loc));
            }
          }
        }
      }

      // 2. Fallback to wildcard '-' account query for personal Google Accounts
      if (allLocations.length === 0) {
        const fallbackResponse = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations?readMask=name,title,storefrontAddress,categories,phoneNumbers,websiteUri&pageSize=100`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!fallbackResponse.ok) {
          const errText = await fallbackResponse.text();
          throw new Error(`Google Business Profile API returned status ${fallbackResponse.status}: ${errText}`);
        }

        const fallbackData = await fallbackResponse.json();
        const locations = fallbackData.locations || [];
        for (const loc of locations) {
          allLocations.push(this.formatLocation(loc));
        }
      }

      return allLocations;
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch real GBP locations');
      throw new Error(error.message || 'Google Business Profile API request failed.');
    }
  }

  private formatLocation(loc: any): GbpLocationDetails {
    const addressObj = loc.storefrontAddress;
    const addressStr = addressObj
      ? `${addressObj.addressLines?.join(', ') || ''}, ${addressObj.locality || ''}, ${addressObj.administrativeArea || ''} ${addressObj.postalCode || ''}`.trim()
      : 'No Address';

    return {
      locationId: loc.name,
      name: loc.title || 'Unnamed Location',
      primaryCategory: loc.categories?.primaryCategory?.displayName || 'Business',
      address: addressStr,
      phone: loc.phoneNumbers?.primaryPhone || 'No Phone',
      websiteUrl: loc.websiteUri || '',
      photoCount: 0,
    };
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
