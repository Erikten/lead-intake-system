"use client";

import { useEffect, useState } from "react";
import type { Lead } from "@/types";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showQualifiedOnly, setShowQualifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "createdAt">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    let result = [...leads];

    if (showQualifiedOnly) {
      result = result.filter((lead) => lead.qualified);
    }

    result.sort((a, b) => {
      const aVal = sortBy === "score" ? a.score : new Date(a.createdAt).getTime();
      const bVal = sortBy === "score" ? b.score : new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    setFilteredLeads(result);
  }, [leads, showQualifiedOnly, sortBy, sortOrder]);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLeads(data.leads);
    } catch {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchLeads}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Lead Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                {filteredLeads.length} {showQualifiedOnly ? "qualified" : "total"} leads
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                Add New Lead
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showQualifiedOnly}
                onChange={(e) => setShowQualifiedOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-slate-700">
                Show qualified only
              </span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "score" | "createdAt")}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
              >
                <option value="score">Score</option>
                <option value="createdAt">Date</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-slate-600">
              {showQualifiedOnly
                ? "No qualified leads yet. Try adjusting filters."
                : "No leads yet. Submit your first lead to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{lead.name}</h3>
                    <p className="text-sm text-slate-600">{lead.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lead.qualified
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {lead.qualified ? "Qualified" : "Unqualified"}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  {lead.website && (
                    <p className="text-slate-600">
                      <span className="font-medium">Website:</span>{" "}
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {lead.website}
                      </a>
                    </p>
                  )}
                  {lead.companyName && (
                    <p className="text-slate-600">
                      <span className="font-medium">Company:</span> {lead.companyName}
                    </p>
                  )}
                  {lead.companySize && (
                    <p className="text-slate-600">
                      <span className="font-medium">Size:</span> {lead.companySize}
                    </p>
                  )}
                  {lead.industry && (
                    <p className="text-slate-600">
                      <span className="font-medium">Industry:</span> {lead.industry}
                    </p>
                  )}
                  {lead.country && (
                    <p className="text-slate-600">
                      <span className="font-medium">Country:</span> {lead.country}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Lead Score</span>
                    <span className="text-2xl font-bold text-blue-600">{lead.score}</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Submitted {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}