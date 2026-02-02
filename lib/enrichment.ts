import type { EnrichmentResult, AnyMailFinderPerson } from "@/types";

// Enrichment through AnyMail Finder API
// Docs: https://anymailfinder.com/api/
export async function enrichLead(email: string): Promise<EnrichmentResult | null> {
  const apiKey = process.env.ANYMAIL_FINDER_API_KEY;

  if (!apiKey) {
    console.warn("[enrichment] No API key set — skipping real enrichment");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.anymailfinder.com/v5.0/search/person.json?email=${encodeURIComponent(email)}`,
      { headers: { "X-API-KEY": apiKey } }
    );

    if (!res.ok) {
      console.error(`[enrichment] API returned ${res.status} for ${email}`);
      return null;
    }

    const person: AnyMailFinderPerson = await res.json();

    return {
      companyName: person.company ?? undefined,
      companySize: undefined,
      industry: undefined,
      country: undefined,
    };
  } catch (err) {
    console.error("[enrichment] network error:", err);
    return null;
  }
}

// Mock enrichment for development tests
const MOCK_COMPANIES = ["Acme Corp", "Globex Industries", "Initech Solutions", "Umbrella Ltd", "Soylent Tech"];
const MOCK_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const MOCK_INDUSTRIES = ["Technology", "Finance", "Healthcare", "E-commerce", "SaaS", "Consulting"];
const MOCK_COUNTRIES = ["US", "UK", "CA", "AU", "DE", "FR", "IN"];

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export async function mockEnrichLead(email: string): Promise<EnrichmentResult | null> {
  await new Promise((r) => setTimeout(r, 400 + Math.floor(Math.random() * 400)));

  const seed = simpleHash(email);

  if (seed % 5 === 0) {
    console.warn(`[mock] simulated failure for ${email}`);
    return null;
  }

  return {
    companyName: pick(MOCK_COMPANIES, seed),
    companySize: pick(MOCK_SIZES, seed + 1),
    industry: pick(MOCK_INDUSTRIES, seed + 2),
    country: pick(MOCK_COUNTRIES, seed + 3),
  };
}

export async function enrichLeadAuto(email: string): Promise<EnrichmentResult | null> {
  if (process.env.ANYMAIL_FINDER_API_KEY) {
    return enrichLead(email);
  }
  return mockEnrichLead(email);
}