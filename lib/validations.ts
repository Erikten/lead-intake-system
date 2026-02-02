import { z } from "zod";

// Lead submission schema
export const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name too long"),
  email: z.string().email("Must be a valid email address"),
  website: z
    .string()
    .url("Must be a valid URL (include https://)")
    .optional()
    .or(z.literal("")), // this treats empty strings as "not provided"
});

export type LeadSchemaType = z.infer<typeof leadSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;