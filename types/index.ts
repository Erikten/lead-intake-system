export interface LeadInput {
  name: string;
  email: string;
  website?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  website: string | null;
  companyName: string | null;
  companySize: string | null;
  industry: string | null;
  country: string | null;
  score: number;
  qualified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichmentResult {
  companyName?: string;
  companySize?: string;
  industry?: string;
  country?: string;
}

// AnyMail Finder v5
// Docs: https://anymailfinder.com/api/
export interface AnyMailFinderPerson {
  email?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  domain?: string;
  position?: string;
  linkedin?: string;
  twitter?: string;
  phone?: string;
}

export interface LeadCreatedResponse {
  success: true;
  lead: {
    id: string;
    name: string;
    email: string;
    score: number;
    qualified: boolean;
  };
}

export interface ApiError {
  error: string;
  details?: { path: string[]; message: string }[];
}

export interface LeadsListResponse {
  leads: Lead[];
}

// Login body
export interface LoginInput {
  username: string;
  password: string;
}