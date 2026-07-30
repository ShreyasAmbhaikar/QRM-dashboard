import { MetaExtractorResult } from '../types';

export function extractMetaFromHtml(html: string): MetaExtractorResult {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i);
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);

  return {
    title: titleMatch?.[1]?.trim(),
    metaDescription: metaDescMatch?.[1]?.trim(),
    canonicalUrl: canonicalMatch?.[1]?.trim(),
    ogTitle: ogTitleMatch?.[1]?.trim(),
    ogDescription: ogDescMatch?.[1]?.trim(),
  };
}
