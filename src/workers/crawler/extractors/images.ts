import { ImageExtractorResult } from '../types';

export function extractImagesFromHtml(html: string): ImageExtractorResult {
  const imgTags = Array.from(html.matchAll(/<img[^>]*>/gi));
  let missingAlt = 0;

  for (const tag of imgTags) {
    if (!tag[0].match(/alt=["'](.*?)["']/i)) {
      missingAlt++;
    }
  }

  return {
    totalImages: imgTags.length,
    missingAltCount: missingAlt,
    largeImagesCount: 0,
  };
}
