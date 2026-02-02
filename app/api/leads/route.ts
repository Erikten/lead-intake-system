import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";
import { enrichLeadAuto } from "@/lib/enrichment";
import { calculateScore } from "@/lib/scoring";

// This creates a new lead
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.errors.map((e) => ({
          path: e.path.map(String),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  const { name, email, website } = parsed.data;
  const cleanWebsite = website && website.trim() !== "" ? website : null;

  // This Checks for duplicate
  const existing = await prisma.lead.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A lead with this email already exists" },
      { status: 409 }
    );
  }

  // "graceful failure"
  let enrichment = await enrichLeadAuto(email);
  if (!enrichment) {
    enrichment = {};
  }

  const { score, qualified } = calculateScore(!!cleanWebsite, enrichment);

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      website: cleanWebsite,
      companyName: enrichment.companyName ?? null,
      companySize: enrichment.companySize ?? null,
      industry: enrichment.industry ?? null,
      country: enrichment.country ?? null,
      score,
      qualified,
    },
  });

  return NextResponse.json(
    {
      success: true,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        score: lead.score,
        qualified: lead.qualified,
      },
    },
    { status: 201 }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qualifiedOnly = url.searchParams.get("qualified") === "true";
  const sort = url.searchParams.get("sort") === "createdAt" ? "createdAt" : "score";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";

  const leads = await prisma.lead.findMany({
    where: qualifiedOnly ? { qualified: true } : {},
    orderBy: { [sort]: order },
  });

  return NextResponse.json({ leads });
}