export interface MetaExtractorResult {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface HeadingsExtractorResult {
  h1: string[];
  h2Count: number;
  h3Count: number;
  hasMultipleH1: boolean;
  hasMissingH1: boolean;
}

export interface ImageExtractorResult {
  totalImages: number;
  missingAltCount: number;
  largeImagesCount: number;
}

export interface LinkExtractorResult {
  internalLinksCount: number;
  externalLinksCount: number;
  brokenLinks: { url: string; status: number }[];
}

export interface SchemaExtractorResult {
  hasJsonLd: boolean;
  schemas: string[];
}

export interface PerformanceExtractorResult {
  domContentLoadedMs: number;
  loadMs: number;
}

export interface PageCrawlResult {
  url: string;
  statusCode: number;
  meta: MetaExtractorResult;
  headings: HeadingsExtractorResult;
  images: ImageExtractorResult;
  links: LinkExtractorResult;
  schema: SchemaExtractorResult;
  performance: PerformanceExtractorResult;
}

export interface CrawlAuditResult {
  domain: string;
  pagesCrawled: number;
  pages: PageCrawlResult[];
  healthScore: number;
  issues: AuditIssue[];
}

export interface AuditIssue {
  id: string;
  severity: 'ERROR' | 'WARNING' | 'NOTICE';
  title: string;
  description: string;
  affectedPagesCount: number;
  recommendation: string;
}
