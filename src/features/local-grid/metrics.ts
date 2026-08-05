import { GridPoint, CompetitorListing } from './grid-calculator';

export interface ReviewMetrics {
  rating: number;
  reviewCount: number;
}

export interface CompetitorLeaderboardItem {
  name: string;
  placeId?: string;
  cid?: string;
  rating: number;
  reviewCount: number;
  averageRank: number;
  visibilityScore: number;
  relativeReviewScore: number;
  rankingsByPoint: number[]; // Ranks across all points (1-indexed matching grid points, unranked as 21)
  googleMapsUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

// 1. Visibility Score (Weighted)
// Rank 1 = 20 pts, Rank 2 = 18 pts, Rank 3 = 15 pts, Rank 4-6 = 5 pts, Rank 7-10 = 3 pts, Rank 11-20 = 1 pt, Rank 21+ = 0 pts
export function calculateVisibilityScore(ranks: number[]): number {
  if (ranks.length === 0) return 0;
  
  let totalScore = 0;
  const maxPossible = ranks.length * 20; // 20 points is the max per coordinate (rank 1)

  ranks.forEach((rank) => {
    if (rank === 1) totalScore += 20;
    else if (rank === 2) totalScore += 18;
    else if (rank === 3) totalScore += 15;
    else if (rank >= 4 && rank <= 6) totalScore += 5;
    else if (rank >= 7 && rank <= 10) totalScore += 3;
    else if (rank >= 11 && rank <= 20) totalScore += 1;
  });

  return maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
}

// 2. Average Ranking
// Simple average of all the ranking positions, treating unranked points as 21 (or 51 for deeper crawls)
export function calculateAverageRanking(ranks: number[], unrankedValue = 21): number {
  if (ranks.length === 0) return 0;
  const sum = ranks.reduce((acc, rank) => acc + (rank > 0 && rank <= unrankedValue ? rank : unrankedValue), 0);
  return Number((sum / ranks.length).toFixed(1));
}

// 3. Relative Review Score
// Rating score = min(50, floor(2.285 ^ (r + 0.25)))
// Count score = (c - lc) * (50 / (hc - lc))
// Total = rating + count. Dock 2 points (or 2%) if rating is exactly 5.0
export function calculateRelativeReviewScore(
  target: ReviewMetrics,
  lc: number, // Minimum review count in grid
  hc: number  // Maximum review count in grid
): number {
  // Rating Score (max 50)
  const ratingPower = Math.pow(2.285, target.rating + 0.25);
  const ratingScore = Math.min(50, Math.floor(ratingPower));

  // Review Count Score (max 50)
  const countRange = hc - lc;
  const countScoreRaw = countRange > 0 ? (target.reviewCount - lc) * (50 / countRange) : 0;
  const countScore = Math.min(50, Math.max(0, Math.round(countScoreRaw)));

  // Total Score (max 100)
  let totalScore = ratingScore + countScore;

  // Dock 2% if rating is exactly 5.0 (per Whitespark spec)
  if (target.rating === 5.0) {
    totalScore = Math.max(0, totalScore - 2);
  }

  return totalScore;
}

// 4. Competitor Dominance Leaderboard Calculation
// Processes a grid scan's points, aggregates unique competitors, and computes their respective grid metrics.
export function calculateCompetitorLeaderboard(
  points: GridPoint[],
  targetBusinessDetails?: {
    placeId?: string;
    name?: string;
    domain?: string;
  }
): CompetitorLeaderboardItem[] {
  const competitorMap = new Map<string, {
    name: string;
    placeId?: string;
    cid?: string;
    rating: number;
    reviewCount: number;
    googleMapsUrl?: string;
    address?: string;
    lat?: number;
    lng?: number;
    ranks: number[]; // Ranks per grid point index
  }>();

  const totalPoints = points.length;

  // 1. Gather all unique listings (target + competitors) across all grid points
  points.forEach((point, pointIndex) => {
    const results = point.results || [];
    
    // Add each competitor from this grid point
    results.forEach((item) => {
      // Define a unique key (prefer placeId, then cid, then title)
      const key = item.placeId || item.cid || item.title;
      if (!key) return;

      if (!competitorMap.has(key)) {
        competitorMap.set(key, {
          name: item.title,
          placeId: item.placeId,
          cid: item.cid,
          rating: item.rating || 0.0,
          reviewCount: item.reviewsCount || 0,
          googleMapsUrl: item.googleMapsUrl || (item.cid ? `https://maps.google.com/?cid=${item.cid}` : undefined),
          address: item.address,
          lat: item.lat,
          lng: item.lng,
          ranks: Array(totalPoints).fill(21), // Initialize with unranked value (21)
        });
      }

      // Update rank at this point index
      const comp = competitorMap.get(key)!;
      comp.ranks[pointIndex] = item.rank;
    });
  });

  // Calculate review boundaries (min & max counts) across all unique listings
  const allListings = Array.from(competitorMap.values());
  const reviewCounts = allListings.map(l => l.reviewCount);
  const hc = reviewCounts.length > 0 ? Math.max(...reviewCounts, 1) : 1;
  const lc = reviewCounts.length > 0 ? Math.min(...reviewCounts, 0) : 0;

  // 2. Compute final metrics for each business
  const leaderboard: CompetitorLeaderboardItem[] = allListings.map((comp) => {
    const visibilityScore = calculateVisibilityScore(comp.ranks);
    const averageRank = calculateAverageRanking(comp.ranks);
    const relativeReviewScore = calculateRelativeReviewScore(
      { rating: comp.rating, reviewCount: comp.reviewCount },
      lc,
      hc
    );

    return {
      name: comp.name,
      placeId: comp.placeId,
      cid: comp.cid,
      rating: comp.rating,
      reviewCount: comp.reviewCount,
      averageRank,
      visibilityScore,
      relativeReviewScore,
      rankingsByPoint: comp.ranks,
      googleMapsUrl: comp.googleMapsUrl,
      address: comp.address,
      lat: comp.lat,
      lng: comp.lng,
    };
  });

  // Sort by Visibility Score (descending), then Review Score (descending)
  return leaderboard.sort((a, b) => {
    if (b.visibilityScore !== a.visibilityScore) {
      return b.visibilityScore - a.visibilityScore;
    }
    return b.relativeReviewScore - a.relativeReviewScore;
  });
}
