export async function fetchAndParseSitemap(domainUrl: string): Promise<string[]> {
  try {
    const sitemapUrl = new URL('/sitemap.xml', domainUrl).toString();
    const res = await fetch(sitemapUrl);
    if (!res.ok) return [];
    const xml = await res.text();
    const urls: string[] = [];
    const matches = xml.matchAll(/<loc>(.*?)<\/loc>/gi);
    for (const match of matches) {
      if (match[1]) urls.push(match[1].trim());
    }
    return urls;
  } catch (e) {
    return [];
  }
}
