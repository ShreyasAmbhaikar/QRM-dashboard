export function calculateSeoHealthScore(issues: any[], pagesCrawled: number): number {
  if (pagesCrawled === 0) return 100;
  let score = 100;

  for (const issue of issues) {
    if (issue.severity === 'ERROR') {
      score -= (issue.affectedPagesCount || 1) * 10;
    } else if (issue.severity === 'WARNING') {
      score -= (issue.affectedPagesCount || 1) * 5;
    } else if (issue.severity === 'NOTICE') {
      score -= (issue.affectedPagesCount || 1) * 2;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
