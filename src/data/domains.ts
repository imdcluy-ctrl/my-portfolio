import type { DomainKey, StatusKey } from '../content.config';

export interface DomainMeta {
  id: DomainKey;
  label: string;          // Full display title
  short: string;          // Compact tab label
  description: string;    // Domain narrative summary
  icon: string;           // Lucide React icon name
  accent: {
    bg: string;           // Pill / badge background
    text: string;         // Text color class
    border: string;       // Border color class
    dot: string;          // Indicator dot color class
  };
}

export interface DomainTab {
  id: 'all' | DomainKey;
  label: string;
  short: string;
  icon: string;
  count: number;
}

/**
 * Domain metadata definition for the 5 specialized engineering domains.
 * Note: Domain counts are NOT hardcoded here; they are computed dynamically at build time.
 */
export const DOMAIN_META: Record<DomainKey, DomainMeta> = {
  'institutional': {
    id: 'institutional',
    label: 'Institutional Systems',
    short: 'Institutional',
    description: 'Enterprise academic workflows, CHED CMO 79 audit portals, and departmental admissions trackers',
    icon: 'Building2',
    accent: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
  },
  'sports': {
    id: 'sports',
    label: 'Sports & Tournaments',
    short: 'Sports',
    description: 'Tournament management platforms, live match pairings, and campus athletic event coordination',
    icon: 'Trophy',
    accent: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      dot: 'bg-amber-500',
    },
  },
  'edtech': {
    id: 'edtech',
    label: 'EdTech & Pedagogical AI',
    short: 'EdTech',
    description: 'Offline Leitner exam reviewers, AI learning modules, and outcome-based syllabus generators',
    icon: 'GraduationCap',
    accent: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/20',
      text: 'text-sky-700 dark:text-sky-400',
      border: 'border-sky-500/20 dark:border-sky-500/30',
      dot: 'bg-sky-500',
    },
  },
  'offline-lan': {
    id: 'offline-lan',
    label: 'Offline LAN Infrastructure',
    short: 'Offline LAN',
    description: 'Zero-internet classroom hubs, local Wi-Fi router sync, and hardware-resilient utilities',
    icon: 'WifiOff',
    accent: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-500/20 dark:border-indigo-500/30',
      dot: 'bg-indigo-500',
    },
  },
  'platforms': {
    id: 'platforms',
    label: 'Full-Stack Platforms & Tools',
    short: 'Platforms',
    description: 'Civic tech, public legal search, financial utilities, and cross-platform desktop/mobile apps',
    icon: 'Layers',
    accent: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-500/20 dark:border-purple-500/30',
      dot: 'bg-purple-500',
    },
  },
} as const;

/**
 * Status metadata and visual styling tokens.
 */
export const STATUS_META: Record<StatusKey, { label: string; badgeClass: string; dotClass: string }> = {
  'live': {
    label: 'Live Web',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-500 animate-pulse',
  },
  'offline-lan': {
    label: 'Offline LAN',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    dotClass: 'bg-indigo-500',
  },
  'internal': {
    label: 'Internal Tool',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-500',
  },
  'archived': {
    label: 'Archived',
    badgeClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
    dotClass: 'bg-zinc-500',
  },
};

/**
 * Type-agnostic extractor supporting Astro CollectionEntry, Project, or partial project shapes.
 */
type ProjectLike = { data: { domain: string } } | { domain: string };

function extractDomain(item: ProjectLike): string {
  if (item && typeof item === 'object') {
    if ('data' in item && item.data && typeof item.data.domain === 'string') {
      return item.data.domain;
    }
    if ('domain' in item && typeof item.domain === 'string') {
      return item.domain;
    }
  }
  return '';
}

/**
 * Computes dynamic project counts per domain at build time from the provided project collection.
 * Guarantee: Zero-drift synchronization with the actual projects data source.
 */
export function getDomainCounts(projects: ProjectLike[]): Record<DomainKey, number> {
  const counts: Record<DomainKey, number> = {
    'institutional': 0,
    'sports': 0,
    'edtech': 0,
    'offline-lan': 0,
    'platforms': 0,
  };

  for (const project of projects) {
    const domain = extractDomain(project) as DomainKey;
    if (domain in counts) {
      counts[domain]++;
    }
  }

  return counts;
}

/**
 * Resolves the complete list of filter tabs including the 'all' tab with dynamic project counts.
 * Consumed directly by DomainFilter.tsx and server-rendered components.
 */
export function getDomainTabs(projects: ProjectLike[]): DomainTab[] {
  const counts = getDomainCounts(projects);
  const total = projects.length;

  const allTab: DomainTab = {
    id: 'all',
    label: 'All Projects',
    short: 'All',
    icon: 'LayoutGrid',
    count: total,
  };

  const domainTabs: DomainTab[] = (Object.keys(DOMAIN_META) as DomainKey[]).map((key) => {
    const meta = DOMAIN_META[key];
    return {
      id: key,
      label: meta.label,
      short: meta.short,
      icon: meta.icon,
      count: counts[key] ?? 0,
    };
  });

  return [allTab, ...domainTabs];
}

/**
 * Safe accessor for single domain metadata.
 */
export function getDomainMeta(key: DomainKey): DomainMeta {
  return DOMAIN_META[key];
}
