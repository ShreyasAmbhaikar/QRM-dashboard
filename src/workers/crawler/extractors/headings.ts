import { HeadingsExtractorResult } from '../types';

export function extractHeadingsFromHtml(html: string): HeadingsExtractorResult {
  const h1Matches = Array.from(html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi))
    .map((m) => (m[1] || '').replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  const h2Matches = Array.from(html.matchAll(/<h2[^>]*>/gi));
  const h3Matches = Array.from(html.matchAll(/<h3[^>]*>/gi));

  return {
    h1: h1Matches,
    h2Count: h2Matches.length,
    h3Count: h3Matches.length,
    hasMultipleH1: h1Matches.length > 1,
    hasMissingH1: h1Matches.length === 0,
  };
}
