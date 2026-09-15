import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/**
 * Domain enumeration for Duane Luy's 37 institutional and software projects.
 */
export const DOMAINS = [
  'institutional',
  'sports',
  'edtech',
  'offline-lan',
  'platforms',
] as const;

export type DomainKey = (typeof DOMAINS)[number];

/**
 * Operational deployment statuses.
 */
export const STATUSES = [
  'live',
  'offline-lan',
  'internal',
  'archived',
] as const;

export type StatusKey = (typeof STATUSES)[number];

/**
 * Portfolio hierarchy tiers.
 */
export const TIERS = [
  'flagship',
  'production',
  'archive',
] as const;

export type TierKey = (typeof TIERS)[number];

/**
 * Strict Zod schema for Duane Luy's Portfolio Project records.
 * Fully harmonizes PROJECT.md § Interface Contracts with PORTFOLIO_IMPLEMENTATION_PLAN.md.
 */
export const projectSchema = z.object({
  // Canonical Identifiers
  id: z.string().min(1).describe('Unique lowercase-kebab identifier (e.g. board-exam-reviewer-gabay)'),
  slug: z.string().min(1).describe('Alias matching id for backwards compatibility and route parameters'),

  // Titles & Names
  title: z.string().min(1).describe('Display title of the project (e.g. Board Exam Reviewer Web App (Gabay))'),
  name: z.string().min(1).describe('Alias matching title for backwards compatibility'),

  // Categorization & Hierarchy
  domain: z.enum(DOMAINS).describe('One of the 5 canonical project domains'),
  domainLabel: z.string().min(1).describe('Human-readable domain label (e.g. EdTech & AI)'),
  status: z.enum(STATUSES).describe('Operational deployment status'),
  statusLabel: z.string().min(1).describe('Human-readable status badge text (e.g. Live Web, Offline LAN)'),
  tier: z.enum(TIERS).default('production').describe('Project tier: flagship, production, or archive'),
  featured: z.boolean().default(false).describe('Flag indicating if project is featured / flagship'),
  bentoOrder: z.number().int().min(1).max(6).nullable().default(null).describe('1-6 for the 6 marquee bento hero tiles, null for all others'),
  bentoTile: z.string().nullable().default(null).describe('A-F tile identifier for desktop bento grid layout (e.g. A, B, C, D, E, F)'),

  // Content & Messaging
  tagline: z.string().max(110).describe('One-line summary for project cards, strictly <= 110 characters'),
  summary: z.string().default('').describe('Comprehensive overview of the system and operational context'),

  // Highlights & Quantitative Metrics
  highlightMetric: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .default(null)
    .describe('Prominent visual metric pill, e.g. { value: "302", label: "Athletes Managed" }'),
  metrics: z
    .object({
      loc: z.number().nullable().default(null),
      tests: z.string().nullable().default(null),
      scale: z.string().nullable().default(null),
    })
    .default({ loc: null, tests: null, scale: null }),

  // Categorized Technology Stack
  stack: z
    .object({
      frontend: z.array(z.string()).default([]),
      backend: z.array(z.string()).default([]),
      data: z.array(z.string()).default([]),
      infra: z.array(z.string()).default([]),
    })
    .default({ frontend: [], backend: [], data: [], infra: [] }),

  // External Links & Local Paths
  links: z
    .object({
      live: z.string().url().nullable().default(null),
      repo: z.string().url().nullable().default(null),
      localPath: z.string().nullable().default(null),
      notes: z.string().nullable().default(null),
    })
    .default({ live: null, repo: null, localPath: null, notes: null }),

  // Access Context & Local Execution
  accessNotes: z.string().nullable().default(null).describe('Credentials, demo accounts, or test user walkthroughs'),
  runCommand: z.string().nullable().default(null).describe('Primary terminal command to launch or test locally'),
  run: z
    .object({
      commands: z.array(z.string()).default([]),
      url: z.string().nullable().default(null),
    })
    .default({ commands: [], url: null }),

  // Deep Case Study Data
  caseStudy: z.object({
    role: z.string().default('Lead Full-Stack Developer & System Architect'),
    problem: z.string().default(''),
    features: z.array(z.string()).min(1).max(8).describe('Key system capabilities, strictly at least 1 feature'),
    architecture: z.string().nullable().default(null),
    screenshots: z.array(z.string()).default([]),
    outcome: z.string().nullable().default(null),
  }),

  // Visual Assets
  hero: z.string().nullable().default(null).describe('Hero image path or null for deterministic SVG PosterFallback'),
  gallery: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().nullable().default(null),
      })
    )
    .default([]),

  // Chronology
  year: z.number().int().default(2026),
});

/**
 * Projects Content Collection definition utilizing Astro 5 Content Layer with file loader.
 */
const projects = defineCollection({
  loader: file('src/data/projects.json'),
  schema: projectSchema,
});

export const collections = { projects };
export type Project = z.infer<typeof projectSchema>;
