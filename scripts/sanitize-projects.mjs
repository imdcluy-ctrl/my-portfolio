import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const projectsPath = path.join(root, 'src', 'data', 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

for (const p of projects) {
  // Add new schema fields
  p.showGithub = false; // Default to false for privacy & institutional confidentiality
  p.githubUrl = p.links?.repo || null;
  p.demoVideoUrl = null;
  p.isConfidential = true;

  // Sanitize accessNotes and links.notes
  if (p.id === 'ched-compliance-management-app') {
    p.accessNotes = 'Guest Inspection Mode: Interactive evaluator sandbox enabled in-app for auditing CMO-79 compliance dials without production database access.';
    if (p.links) p.links.notes = p.accessNotes;
    p.caseStudy.features = p.caseStudy.features.map(f =>
      f.replace('faculty roster credential inspection (19 instructors)', 'faculty roster credential inspection (19 instructor profiles)')
    );
  } else if (p.id === 'flexible-daily-admissions-tracking-web-app') {
    p.accessNotes = 'Interactive Demo Mode: Safe client-side LocalStorage sandbox enabled for instant evaluation without production database access.';
    if (p.links) p.links.notes = p.accessNotes;
  } else if (p.id === 'document-submission-tracker-monitoring') {
    p.accessNotes = 'Institutional Pipeline: Integrated with university Google Workspace and institutional compliance ledger.';
    if (p.links) p.links.notes = p.accessNotes;
    p.caseStudy.features = p.caseStudy.features.map(f =>
      f.replace('passcode-secured Program Chair dashboard (ZPPSU-CT-2026).', 'role-secured Program Chair compliance dashboard.')
    );
  } else if (p.id === 'epdu-palaro-2026-chess-tournament') {
    p.accessNotes = 'Tournament Public Portal: Live Swiss-system pairings, match standings, and athlete verification viewable without login.';
    if (p.links) p.links.notes = p.accessNotes;
    p.caseStudy.features = p.caseStudy.features.map(f =>
      f.replace('arbiter scoring sync. Admin route: /admin/login (palaro2026admin).', 'arbiter scoring sync with offline venue backup.')
    );
  } else if (p.id === 'cpt-palaro-management-system') {
    p.accessNotes = 'Tournament Public Portal: Public athlete verification, live medal standings, and event match schedules viewable without login.';
    if (p.links) p.links.notes = p.accessNotes;
    p.caseStudy.features = p.caseStudy.features.map(f =>
      f.replace('role-based dashboards (admin1234, palaro2026).', 'role-based coordinator and arbiter dashboards.')
    );
  } else if (p.id === 'batasph-civicph') {
    p.accessNotes = 'Civic Legal Portal: Full search across Republic Acts, Supreme Court decisions, and City Ordinances.';
    if (p.links) p.links.notes = p.accessNotes;
    p.isConfidential = false;
  }

  p.walkthroughNotes = p.accessNotes;
}

fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf8');
console.log(`Successfully sanitized and updated ${projects.length} project records in ${projectsPath}`);
