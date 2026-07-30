import { SchemaExtractorResult } from '../types';

export function extractSchemaFromHtml(html: string): SchemaExtractorResult {
  const matches = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  const schemas = matches
    .map((m) => m[1]?.trim())
    .filter((s): s is string => !!s);

  return {
    hasJsonLd: schemas.length > 0,
    schemas,
  };
}
