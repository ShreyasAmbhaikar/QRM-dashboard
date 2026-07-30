export interface ProfileData {
  name?: string;
  primaryCategory?: string;
  additionalCategories?: string[];
  address?: string;
  phone?: string;
  hoursSet?: boolean;
  websiteUrl?: string;
  description?: string;
  attributesFilled?: boolean;
  photoCount?: number;
  postCount?: number;
  reviewResponseRate?: number;
}

export function calculateGbpCompletenessScore(profile: ProfileData): {
  totalScore: number;
  breakdown: Array<{ item: string; points: number; maxPoints: number; completed: boolean }>;
} {
  const breakdown = [
    { item: 'Business Name Filled', points: profile.name ? 10 : 0, maxPoints: 10, completed: !!profile.name },
    { item: 'Primary Category Set', points: profile.primaryCategory ? 10 : 0, maxPoints: 10, completed: !!profile.primaryCategory },
    { item: 'Additional Categories (>= 2)', points: (profile.additionalCategories?.length || 0) >= 2 ? 5 : 0, maxPoints: 5, completed: (profile.additionalCategories?.length || 0) >= 2 },
    { item: 'Complete Address', points: profile.address ? 10 : 0, maxPoints: 10, completed: !!profile.address },
    { item: 'Phone Number Added', points: profile.phone ? 5 : 0, maxPoints: 5, completed: !!profile.phone },
    { item: 'Regular Business Hours', points: profile.hoursSet ? 10 : 0, maxPoints: 10, completed: !!profile.hoursSet },
    { item: 'Website Link Verified', points: profile.websiteUrl ? 5 : 0, maxPoints: 5, completed: !!profile.websiteUrl },
    { item: 'Business Description (> 100 chars)', points: (profile.description?.length || 0) > 100 ? 10 : 0, maxPoints: 10, completed: (profile.description?.length || 0) > 100 },
    { item: 'Attributes & Features', points: profile.attributesFilled ? 10 : 0, maxPoints: 10, completed: !!profile.attributesFilled },
    { item: 'Photos Inventory (> 5 photos)', points: (profile.photoCount || 0) >= 5 ? 10 : 0, maxPoints: 10, completed: (profile.photoCount || 0) >= 5 },
    { item: 'Active Posting (> 3 posts)', points: (profile.postCount || 0) >= 3 ? 10 : 0, maxPoints: 10, completed: (profile.postCount || 0) >= 3 },
    { item: 'Review Response Rate (> 50%)', points: (profile.reviewResponseRate || 0) >= 50 ? 5 : 0, maxPoints: 5, completed: (profile.reviewResponseRate || 0) >= 50 },
  ];

  const totalScore = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { totalScore, breakdown };
}
