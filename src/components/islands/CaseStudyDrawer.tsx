import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { ExternalLink, Copy, Check, X, Terminal, ShieldCheck, Play, Lock } from 'lucide-react';

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  name: string;
  tagline: string;
  domain: string;
  domainLabel: string;
  status: string;
  statusLabel: string;
  tier: string;
  featured: boolean;
  highlightMetric?: { value: string; label: string } | null;
  metrics?: { loc: number | null; tests: string | null; scale: string | null };
  stack: {
    frontend?: string[];
    backend?: string[];
    data?: string[];
    infra?: string[];
  };
  links: {
    live?: string | null;
    repo?: string | null;
    notes?: string | null;
  };
  accessNotes?: string | null;
  walkthroughNotes?: string | null;
  runCommand?: string | null;
  showGithub?: boolean;
  githubUrl?: string | null;
  demoVideoUrl?: string | null;
  isConfidential?: boolean;
  caseStudy: {
    role?: string;
    problem?: string;
    features?: string[];
    architecture?: string | null;
    outcome?: string | null;
  };
  hero?: string | null;
}

interface CaseStudyDrawerProps {
  projects: ProjectData[];
}

export default function CaseStudyDrawer({ projects }: CaseStudyDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Global listener for case-study triggers
  useEffect(() => {
    const handleTriggerClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest('.case-study-trigger');
      if (trigger) {
        e.preventDefault();
        const projectId = trigger.getAttribute('data-project');
        if (projectId) {
          setSelectedId(projectId);
          setIsOpen(true);
        }
      }
    };

    document.addEventListener('click', handleTriggerClick);
    return () => document.removeEventListener('click', handleTriggerClick);
  }, []);

  // Synchronize URL parameter when drawer opens/closes
  useEffect(() => {
    if (isOpen && selectedId) {
      const url = new URL(window.location.href);
      url.searchParams.set('project', selectedId);
      window.history.replaceState(null, '', url.toString());
    } else if (!isOpen && selectedId) {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      window.history.replaceState(null, '', url.toString());
    }
  }, [isOpen, selectedId]);

  // Deep-link check on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryProject = params.get('project');
    if (queryProject && projects.some(p => p.id === queryProject || p.slug === queryProject)) {
      setSelectedId(queryProject);
      setIsOpen(true);
    }
  }, [projects]);

  const project = projects.find(p => p.id === selectedId || p.slug === selectedId);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  if (!project) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50" />
          <Drawer.Content className="fixed bottom-0 right-0 z-50 flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)]" />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  const isLive = project.status === 'live' && project.links.live;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction="right"
      dismissible={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity" />
        <Drawer.Content className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl h-full flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)] border-l border-[var(--color-line)] shadow-2xl overflow-hidden focus:outline-none">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)] bg-[var(--color-surface)]/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  project.status === 'live'
                    ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                    : project.status === 'offline-lan'
                    ? 'bg-indigo-500 ring-4 ring-indigo-500/20'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                {project.statusLabel} · {project.domainLabel}
              </span>
            </div>

            <Drawer.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </Drawer.Close>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Title & Tagline */}
            <div>
              <Drawer.Title className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-ink)] leading-tight">
                {project.title}
              </Drawer.Title>
              <Drawer.Description className="mt-2 text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {project.tagline}
              </Drawer.Description>
            </div>

            {/* Primary Action Panel & Governance */}
            <div className="flex flex-wrap items-center gap-3">
              {isLive && (
                <div className="w-full p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Production Deployed
                    </div>
                    <div className="text-xs text-[var(--color-ink-muted)] truncate max-w-xs">
                      {project.links.live}
                    </div>
                  </div>
                  <a
                    href={project.links.live!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <span>Launch Live App</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {project.demoVideoUrl && (
                <a
                  href={project.demoVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  <Play size={14} />
                  <span>Watch Walkthrough Video</span>
                </a>
              )}

              {project.showGithub && (project.githubUrl || project.links.repo) ? (
                <a
                  href={(project.githubUrl || project.links.repo)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-[var(--color-surface-2)] text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-[var(--color-surface)] transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink size={12} />
                </a>
              ) : project.isConfidential ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] border border-[var(--color-line)]">
                  <Lock size={12} className="text-zinc-400" />
                  <span>Institutional Software · Code Private (ZPPSU Governance)</span>
                </div>
              ) : null}
            </div>

            {/* Operational Walkthrough & Safe Access */}
            {(project.walkthroughNotes || project.accessNotes) && (
              <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-line)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Operational Architecture & Walkthrough Context</span>
                </div>
                <p className="text-xs font-mono text-[var(--color-ink)] bg-[var(--color-surface)] p-2.5 rounded-lg border border-[var(--color-line)] break-all leading-relaxed">
                  {project.walkthroughNotes || project.accessNotes}
                </p>
              </div>
            )}

            {/* Local Execution Command */}
            {project.runCommand && (
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <Terminal size={14} />
                    <span>Run on Local Network</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(project.runCommand!, 'run')}
                    className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    {copied === 'run' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied === 'run' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="block text-xs font-mono bg-[var(--color-surface)] text-[var(--color-ink)] p-2.5 rounded-lg border border-[var(--color-line)] overflow-x-auto">
                  {project.runCommand}
                </code>
              </div>
            )}

            {/* Problem & Operational Challenge */}
            {project.caseStudy.problem && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
                  The Operational Challenge
                </h4>
                <p className="text-sm text-[var(--color-ink)] leading-relaxed bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-line)]">
                  {project.caseStudy.problem}
                </p>
              </div>
            )}

            {/* Key Capabilities */}
            {project.caseStudy.features && project.caseStudy.features.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
                  Core Capabilities & Workflows
                </h4>
                <ul className="space-y-2">
                  {project.caseStudy.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--color-ink)] leading-normal">
                      <ShieldCheck size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technology Stack Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)]">
                Engineering & Technology Architecture
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.stack.frontend && project.stack.frontend.length > 0 && (
                  <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line)]">
                    <div className="text-[10px] font-mono text-[var(--color-ink-muted)] mb-1.5 uppercase">Frontend</div>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.frontend.map(t => (
                        <span key={t} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-ink)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.stack.backend && project.stack.backend.length > 0 && (
                  <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line)]">
                    <div className="text-[10px] font-mono text-[var(--color-ink-muted)] mb-1.5 uppercase">Backend / API</div>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.backend.map(t => (
                        <span key={t} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-ink)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.stack.data && project.stack.data.length > 0 && (
                  <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line)]">
                    <div className="text-[10px] font-mono text-[var(--color-ink-muted)] mb-1.5 uppercase">Data & Storage</div>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.data.map(t => (
                        <span key={t} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-ink)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.stack.infra && project.stack.infra.length > 0 && (
                  <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line)]">
                    <div className="text-[10px] font-mono text-[var(--color-ink-muted)] mb-1.5 uppercase">Infrastructure</div>
                    <div className="flex flex-wrap gap-1">
                      {project.stack.infra.map(t => (
                        <span key={t} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-ink)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Footer */}
            {project.highlightMetric && (
              <div className="pt-3 border-t border-[var(--color-line)] flex items-center justify-between text-xs font-mono text-[var(--color-ink-muted)]">
                <span>Metric Highlight:</span>
                <span className="font-semibold text-[var(--color-ink)]">
                  {project.highlightMetric.value} ({project.highlightMetric.label})
                </span>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
