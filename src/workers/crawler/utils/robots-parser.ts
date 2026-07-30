export async function fetchAndParseRobotsTxt(domainUrl: string): Promise<string[]> {
  try {
    const robotsUrl = new URL('/robots.txt', domainUrl).toString();
    const res = await fetch(robotsUrl);
    if (!res.ok) return [];
    const text = await res.text();
    const disallowed: string[] = [];
    const lines = text.split('\n');
    let isUserAgentAll = false;
    for (const line of lines) {
      const clean = line.trim();
      if (clean.toLowerCase().startsWith('user-agent: *')) {
        isUserAgentAll = true;
      } else if (clean.toLowerCase().startsWith('user-agent:')) {
        isUserAgentAll = false;
      } else if (isUserAgentAll && clean.toLowerCase().startsWith('disallow:')) {
        const path = clean.split(':')[1]?.trim();
        if (path) disallowed.push(path);
      }
    }
    return disallowed;
  } catch (e) {
    return [];
  }
}
