import { CrawlAuditResult, PageCrawlResult, AuditIssue } from './types';
import { CRAWLER_CONFIG } from './config';
import { extractMetaFromHtml } from './extractors/meta';
import { extractHeadingsFromHtml } from './extractors/headings';
import { extractImagesFromHtml } from './extractors/images';
import { extractLinksFromHtml } from './extractors/links';
import { extractSchemaFromHtml } from './extractors/schema';
import { calculatePagePerformance } from './extractors/performance';
import { fetchAndParseRobotsTxt } from './utils/robots-parser';
import { fetchAndParseSitemap } from './utils/sitemap-parser';
import { logger } from '@/lib/logger';

export async function runSeoAuditCrawl(targetDomainUrl: string): Promise<CrawlAuditResult> {
  const startTime = Date.now();
  logger.info({ targetDomainUrl }, 'Starting Playwright / HTTP SEO audit crawl');

  const normalizedDomain = targetDomainUrl.startsWith('http') ? targetDomainUrl : `https://${targetDomainUrl}`;
  const disallowed = await fetchAndParseRobotsTxt(normalizedDomain);
  const sitemapUrls = await fetchAndParseSitemap(normalizedDomain);

  const crawlQueue = Array.from(new Set([normalizedDomain, ...sitemapUrls])).slice(0, CRAWLER_CONFIG.maxPages);
  const pages: PageCrawlResult[] = [];

  for (const url of crawlQueue) {
    if (disallowed.some((path) => url.includes(path))) {
      continue;
    }

    try {
      const pageStart = Date.now();
      const res = await fetch(url, { headers: { 'User-Agent': 'QRM-SEO-Audit-Bot/1.0' } });
      const html = await res.text();

      const meta = extractMetaFromHtml(html);
      const headings = extractHeadingsFromHtml(html);
      const images = extractImagesFromHtml(html);
      const links = extractLinksFromHtml(html, normalizedDomain);
      const schema = extractSchemaFromHtml(html);
      const performance = calculatePagePerformance(pageStart, pageStart + 250);

      pages.push({
        url,
        statusCode: res.status,
        meta,
        headings,
        images,
        links,
        schema,
        performance,
      });
    } catch (e) {
      logger.warn({ url, error: e }, 'Failed to crawl page');
    }
  }

  const issues = generateAuditIssues(pages);
  const healthScore = calculateHealthScoreFromIssues(issues, pages.length);

  logger.info({ pagesCrawled: pages.length, healthScore }, 'SEO Audit Crawl Completed');

  return {
    domain: normalizedDomain,
    pagesCrawled: pages.length,
    pages,
    healthScore,
    issues,
  };
}

function generateAuditIssues(pages: PageCrawlResult[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const missingTitleCount = pages.filter((p) => !p.meta.title).length;
  if (missingTitleCount > 0) {
    issues.push({
      id: 'missing-title',
      severity: 'ERROR',
      title: 'Missing <title> Tag',
      description: 'Title tags are crucial for search engine ranking and user click-through rates.',
      affectedPagesCount: missingTitleCount,
      recommendation: 'Add a unique, keyword-rich <title> tag (50-60 characters) to every page.',
    });
  }

  const missingMetaDescCount = pages.filter((p) => !p.meta.metaDescription).length;
  if (missingMetaDescCount > 0) {
    issues.push({
      id: 'missing-meta-desc',
      severity: 'WARNING',
      title: 'Missing Meta Description',
      description: 'Meta descriptions summarize page content in search engine snippet previews.',
      affectedPagesCount: missingMetaDescCount,
      recommendation: 'Write a persuasive meta description (120-155 characters) for each page.',
    });
  }

  const missingH1Count = pages.filter((p) => p.headings.hasMissingH1).length;
  if (missingH1Count > 0) {
    issues.push({
      id: 'missing-h1',
      severity: 'ERROR',
      title: 'Missing H1 Heading',
      description: 'H1 headings define the main subject matter of a web page for search crawlers.',
      affectedPagesCount: missingH1Count,
      recommendation: 'Ensure every page contains exactly one clear H1 heading.',
    });
  }

  const missingAltCount = pages.reduce((acc, p) => acc + p.images.missingAltCount, 0);
  if (missingAltCount > 0) {
    issues.push({
      id: 'missing-img-alt',
      severity: 'WARNING',
      title: 'Images Missing ALT Attributes',
      description: 'Alt attributes improve image accessibility and allow images to rank in image search.',
      affectedPagesCount: missingAltCount,
      recommendation: 'Add descriptive ALT text to all informational images.',
    });
  }

  const missingSchemaCount = pages.filter((p) => !p.schema.hasJsonLd).length;
  if (missingSchemaCount > 0) {
    issues.push({
      id: 'missing-schema',
      severity: 'NOTICE',
      title: 'Missing Schema.org JSON-LD Structured Data',
      description: 'Structured data enables rich snippets and Google Knowledge Graph integration.',
      affectedPagesCount: missingSchemaCount,
      recommendation: 'Add relevant Schema.org JSON-LD markup (LocalBusiness, Article, Product).',
    });
  }

  return issues;
}

function calculateHealthScoreFromIssues(issues: AuditIssue[], totalPages: number): number {
  if (totalPages === 0) return 100;
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === 'ERROR') {
      score -= issue.affectedPagesCount * 10;
    } else if (issue.severity === 'WARNING') {
      score -= issue.affectedPagesCount * 5;
    } else if (issue.severity === 'NOTICE') {
      score -= issue.affectedPagesCount * 2;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
