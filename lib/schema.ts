import { z } from "zod";

export const RangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  basis: z.enum(["published", "reported", "estimated"]),
});

export const StepSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  who: z.enum(["agent", "you", "provider"]),
  required: z.boolean(),
  source_ids: z.array(z.string()),
});

export const ClaimSchema = z.object({
  text: z.string(),
  level: z.enum(["verified", "observed", "inferred", "unverified"]),
  source_ids: z.array(z.string()),
  quote: z.string().optional(),
});

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  kind: z.enum(["official", "supplemental", "forum"]),
  opened_at: z.string(),
  status: z.enum(["opened", "failed"]),
});

export const TraceLineSchema = z.object({
  label: z.string(),
  state: z.enum(["running", "done", "failed"]),
});

export const GuideSchema = z.object({
  schema_version: z.literal(1),
  slug: z.string(),
  name: z.string(),
  domain: z.string(),
  subtitle: z.string(),
  summary: z.string(),
  status: z.enum(["complete", "partial", "unresolved"]),
  oauth_support: z.enum(["confirmed", "likely", "unclear", "not_found"]),
  own_app: z.object({
    answer: z.enum(["yes", "probably_not", "depends", "not_checked"]),
    basis: z.string(),
  }),
  start_here: z.object({ label: z.string(), url: z.string().url() }).nullable(),
  difficulty: z.enum(["easy", "medium", "hard", "depends", "unknown"]),
  difficulty_reason: z.string(),
  hands_on: RangeSchema.nullable(),
  waiting: RangeSchema.nullable(),
  waiting_note: z.string(),
  needs: z.array(z.string()),
  steps: z.array(StepSchema),
  watch_out: z.array(z.object({ text: z.string(), source_ids: z.array(z.string()) })),
  agent_can: z.array(z.string()),
  you_must: z.array(z.string()),
  claims: z.array(ClaimSchema),
  checks: z.object({
    level: z.enum(["read", "opened", "probed", "attempted"]),
    done: z.array(z.string()),
    not_done: z.array(z.string()),
  }),
  sources: z.array(SourceSchema),
  trace: z.array(TraceLineSchema).optional(),
  generated_at: z.string(),
  generated_by: z.enum(["agent", "agent_reviewed"]),
});

export type Guide = z.infer<typeof GuideSchema>;