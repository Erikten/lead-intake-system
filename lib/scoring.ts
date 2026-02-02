import type { EnrichmentResult } from "@/types";

const POINTS_HAS_WEBSITE = 10;

const POINTS_SIZE_11_50 = 20;  
const POINTS_SIZE_51_200 = 15;
const POINTS_SIZE_201_PLUS = 10;

const POINTS_TARGET_COUNTRY = 10;
const TARGET_COUNTRIES = new Set(["US", "UK", "CA"]);

const PENALTY_MISSING_FIELD = -5;

const QUALIFICATION_THRESHOLD = 25;

// Helper functions
function companySizePoints(size: string | null | undefined): number {
  if (!size) return PENALTY_MISSING_FIELD;

  const nums = size.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return PENALTY_MISSING_FIELD;

  const lower = nums[0];

  if (lower >= 201) return POINTS_SIZE_201_PLUS;
  if (lower >= 51) return POINTS_SIZE_51_200;
  if (lower >= 11) return POINTS_SIZE_11_50;

  return 0;
}

function countryPoints(country: string | null | undefined): number {
  if (!country) return PENALTY_MISSING_FIELD;
  return TARGET_COUNTRIES.has(country.toUpperCase())
    ? POINTS_TARGET_COUNTRY
    : 0;
}

// Main scoring function
export function calculateScore(
  hasWebsite: boolean,
  enrichment: EnrichmentResult
): { score: number; qualified: boolean } {
  let score = 0;

  if (hasWebsite) score += POINTS_HAS_WEBSITE;

  score += companySizePoints(enrichment.companySize);
  score += countryPoints(enrichment.country);

  if (!enrichment.companyName) score += PENALTY_MISSING_FIELD;
  if (!enrichment.industry) score += PENALTY_MISSING_FIELD;

  score = Math.max(0, score);

  return { score, qualified: score >= QUALIFICATION_THRESHOLD };
}