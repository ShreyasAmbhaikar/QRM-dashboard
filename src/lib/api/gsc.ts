import { decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';

export interface GscSearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
}

export class GscApiClient {
  private accessToken: string;

  constructor(encryptedAccessToken: string) {
    this.accessToken = decrypt(encryptedAccessToken);
  }

  public async getSearchAnalytics(siteUrl: string, query: GscSearchAnalyticsQuery) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      logger.info({ siteUrl, query }, 'Simulated GSC search analytics response.');
      return {
        rows: [
          { keys: ['emergency plumber chicago'], clicks: 145, impressions: 1200, ctr: 0.12, position: 2.1 },
          { keys: ['local plumbing agency'], clicks: 92, impressions: 850, ctr: 0.108, position: 3.4 },
        ],
      };
    }

    try {
      const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`GSC API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error({ error, siteUrl }, 'Failed to fetch Search Console analytics');
      return { rows: [] };
    }
  }
}
