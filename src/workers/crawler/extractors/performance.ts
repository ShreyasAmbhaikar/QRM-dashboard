import { PerformanceExtractorResult } from '../types';

export function calculatePagePerformance(startTimeMs: number, domContentLoadedTimeMs: number): PerformanceExtractorResult {
  return {
    domContentLoadedMs: Math.max(0, domContentLoadedTimeMs - startTimeMs),
    loadMs: Math.max(0, Date.now() - startTimeMs),
  };
}
