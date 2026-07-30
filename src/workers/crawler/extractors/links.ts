import { LinkExtractorResult } from '../types';
import { normalizeUrl, isSameDomain } from '../utils/url-utils';

export function extractLinksFromHtml(html: string, baseUrl: string): LinkExtractorResult {
  const hrefMatches = Array.from(html.matchAll(/href=["'](.*?)["']/gi));
  let internalCount = 0;
  let externalCount = 0;

  for (const match of hrefMatches) {
    const rawUrl = match[1];
    if (!rawUrl) continue;
    const norm = normalizeUrl(rawUrl, baseUrl);
    if (!norm) continue;
    if (isSameDomain(norm, baseUrl)) {
      internalCount++;
    } else {
      externalCount++;
    }
  }

  return {
    internalLinksCount: internalCount,
    externalLinksCount: externalCount,
    brokenLinks: [],
  };
}
