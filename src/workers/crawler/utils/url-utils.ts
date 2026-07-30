export function normalizeUrl(url: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(url, baseUrl);
    parsed.hash = '';
    return parsed.toString();
  } catch (e) {
    return null;
  }
}

export function isSameDomain(url1: string, url2: string): boolean {
  try {
    const host1 = new URL(url1).hostname.replace(/^www\./, '');
    const host2 = new URL(url2).hostname.replace(/^www\./, '');
    return host1 === host2;
  } catch (e) {
    return false;
  }
}
