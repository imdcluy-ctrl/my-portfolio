import fs from 'node:fs';
import path from 'node:path';

const projectsPath = path.resolve('src/data/projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

// Cloud links verified from C:\Users\ACER\OneDrive\Desktop\My Apps\Cloud App Links
const cloudUpdates = {
  'cpt-palaro-management-system': {
    liveUrl: 'https://cpt-palaro-management-sys.pages.dev/',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'board-exam-reviewer-gabay': {
    liveUrl: 'https://gabay-reviewer.vercel.app/dashboard',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'comtech-one-web-app': {
    liveUrl: 'https://comtech-one.pages.dev/',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'palaro-submission-of-music': {
    liveUrl: 'https://ancient-wind-0de7.imdcluy.workers.dev/',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'ched-compliance-management-app': {
    liveUrl: 'https://zppsu-ched-compliance.pages.dev/',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'epdu-palaro-2026-chess-tournament': {
    liveUrl: 'https://epdu-chess-2026.imdcluy.workers.dev/',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'receipt-submission-pe-nstp': {
    liveUrl: 'https://ntstp-pe-receipt-submission-tracker.netlify.app/',
    status: 'live',
    statusLabel: 'Live Cloud'
  },
  'document-submission-tracker-monitoring': {
    liveUrl: 'https://script.google.com/macros/s/AKfycbypRMB1ssxs5f8JZ1kY3xHYpG1tziueKVh_Tr75SGwFBrLb2fECXXwRlKGHuqMPhbfyNQ/exec',
    status: 'live',
    statusLabel: 'Live Cloud'
  }
};

// The user's exact 10 flagship systems in order
const flagshipSlugs = [
  'cpt-palaro-management-system',
  'board-exam-reviewer-gabay',
  'localclassroom',
  'ched-compliance-management-app',
  'epdu-palaro-2026-chess-tournament',
  'enrollment-app',
  'screening-app',
  'prospectus-generator',
  'obe-syllabus-generator',
  'obe-lp-generator'
];

for (const p of projects) {
  // Apply cloud links
  if (cloudUpdates[p.id]) {
    p.links.live = cloudUpdates[p.id].liveUrl;
    p.status = cloudUpdates[p.id].status;
    p.statusLabel = cloudUpdates[p.id].statusLabel;
  }

  // Update flagship designation
  const flagshipIndex = flagshipSlugs.indexOf(p.id);
  if (flagshipIndex !== -1) {
    p.featured = true;
    p.tier = 'flagship';
    p.bentoOrder = flagshipIndex + 1;
    p.bentoTile = String.fromCharCode(65 + flagshipIndex); // A through J
  } else {
    p.featured = false;
    p.tier = 'production';
    p.bentoOrder = null;
    p.bentoTile = null;
  }

  // Deep feature enrichment for Localclassroom
  if (p.id === 'localclassroom') {
    p.summary = 'Complete offline Learning Management System (LMS) and real-time classroom orchestration tool designed for off-grid education over a local Wi-Fi hotspot with zero internet dependency.';
    p.tagline = 'Offline-first LMS & real-time lecture delivery engine operating over a local Wi-Fi hotspot with 0 internet.';
    p.caseStudy.problem = 'In off-grid and bandwidth-constrained campus environments, students lack internet access for modern digital learning platforms. LocalClassroom turns any instructor laptop into a zero-internet Wi-Fi server hosting synchronized slides, live quizzes, assignment turn-ins, and file libraries.';
    p.caseStudy.features = [
      'Multi-Course & Section Isolation: BCP112, BCP211, BCP311, and IOM courses with section-filtered portals',
      'Real-Time WebSocket Slide Broadcast: Synchronizes instructor slides across student mobile screens in real time',
      'Interactive Live MCQ Polling: Real-time vote graphing with screen locking on answer reveal',
      'Time-Bound Coursework & Extension Engine: Strict submission windows with individual late-pass grant overrides',
      'Sandboxed In-Browser Code Inspector: Safely previews student HTML/JS uploads with XSS containment',
      'Offline Shared Library Drive: High-speed local Wi-Fi distribution of large APKs, PDFs, and course binaries',
      'Automated Local IP Discovery: Auto-detects hotspot IP and provides QR connection onboarding',
      '67 High-Resolution Technical Schematics: Comprehensive visual library for PLC ladder logic, CSS box model, and safety layouts'
    ];
    p.hero = '/projects/localclassroom/fig1_1_plc_vs_relay_panel.png';
  }

  // Ensure other flagships have good tags & hero
  if (p.id === 'board-exam-reviewer-gabay') {
    p.hero = '/projects/board-exam-reviewer-gabay/logo.jpg';
  }
  if (p.id === 'cpt-palaro-management-system') {
    p.hero = '/brand/zppsu-logo.png';
  }
  if (p.id === 'enrollment-app') {
    p.title = 'Pre-Enrollment & Student Advising Web App';
    p.hero = '/projects/enrollment-app/logo.png';
  }
  if (p.id === 'screening-app') {
    p.title = 'Admissions Screening Web App';
    p.hero = '/projects/screening-app/logo.png';
  }
}

fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf-8');
console.log('Successfully updated projects.json with all cloud links and the 10 user-designated flagship systems!');
