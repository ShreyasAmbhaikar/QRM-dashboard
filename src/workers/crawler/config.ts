export const CRAWLER_CONFIG = {
  maxPages: 50,
  timeout: 30_000,
  concurrency: 3,
  viewports: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'mobile', width: 375, height: 812 },
  ],
  respectRobotsTxt: true,
  screenshotOnError: true,
};
