"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { leadSchema } from "@/lib/validations";
import type { LeadCreatedResponse, ApiError } from "@/types";

interface FormFields {
  name: string;
  email: string;
  website: string;
}

type FieldErrors = Partial<Record<keyof FormFields, string>>;
type Status = "idle" | "loading" | "success" | "error";

export default function SubmitPage() {
  const [fields, setFields] = useState<FormFields>({ name: "", email: "", website: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setGeneralError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const parsed = leadSchema.safeParse(fields);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as keyof FormFields;
        errors[key] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const errors: FieldErrors = {};
          data.details.forEach((d: { path: string[]; message: string }) => {
            errors[d.path[0] as keyof FormFields] = d.message;
          });
          setFieldErrors(errors);
        } else {
          setGeneralError(data.error || "Something went wrong");
        }
        setStatus("idle");
        return;
      }

      setStatus("success");
      setFields({ name: "", email: "", website: "" });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch {
      setGeneralError("Network error. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Lead Intake
          </h1>
          <p className="text-slate-600 mb-8">
            Submit your information to get started
          </p>

          {status === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Lead submitted successfully!</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          )}

          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={fields.name}
                onChange={handleChange}
                disabled={status === "loading"}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  fieldErrors.name ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="David Banks"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={fields.email}
                onChange={handleChange}
                disabled={status === "loading"}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  fieldErrors.email ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="David@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                Website (optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={fields.website}
                onChange={handleChange}
                disabled={status === "loading"}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  fieldErrors.website ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="https://example.com"
              />
              {fieldErrors.website && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.website}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? "Submitting..." : "Submit Lead"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}