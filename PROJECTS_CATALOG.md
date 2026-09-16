# Comprehensive Portfolio Master Catalog & Architecture Blueprint
**Prepared for Opus 4.6 Implementation Planning**  
**Workspace Directory:** `C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project`  
**Portfolio Directory:** `C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project\My Portfolio`  
**Total Scanned Entities:** 48 filesystem directories  
**Total Functional Software Projects:** **37 distinct production systems**  
**Confirmed Live Cloud Deployments:** **8 active production applications**  

---

## 1. Executive Summary & Developer Profile

This portfolio documents the engineering work of **Duane Luy (`imdcluy`)**, showcasing a prolific body of **37 distinct, fully functional software systems**. The projects demonstrate deep expertise across full-stack cloud engineering, institutional enterprise systems, pedagogical AI integration, and resilient offline-first/LAN architectures designed for environments with zero or unstable internet connectivity.

### Core Metrics at a Glance:
- **37 Distinct Functional Systems** across 5 specialized domains.
- **8 Live Cloud Production Deployments** on Cloudflare Pages/Workers, Vercel, Netlify, and Google Apps Script.
- **100% Offline-First / Zero-Internet LAN Capabilities** in 14 institutional systems leveraging SQLite in WAL mode, Server-Sent Events, WebSockets, and local router broadcasting.
- **100+ Production Visual Assets On Disk** including 67 high-resolution educational schematics, 13 interactive HTML wireframes, tournament brand banners, and official institutional documents ready for instant portfolio embedding.
- **$0/Month Serverless & Edge Architecture** taking full advantage of Cloudflare Pages/Workers, D1, Supabase free tiers, and static Jamstack pipelines.

---

## 2. Live Cloud Deployments & Access Context (8 Confirmed Sites)

These 8 systems are live in production on the internet and can be directly linked with interactive "Launch Live App" buttons in the portfolio:

| # | Project Name | Live Production URL | Credentials & Role Context | Hosting & Architecture |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **CHED Compliance Portal** | [https://zppsu-ched-compliance.pages.dev](https://zppsu-ched-compliance.pages.dev) | **Interactive Evaluator Sandbox:** Safe in-app inspector mode for auditing Folders A–H compliance dials without production database access | **Cloudflare Pages** + Cloudflare D1 (`zppsu-ched-db`) + Google Apps Script API + Google Drive |
| **2** | **BatasPh (CivicPH)** | [https://civic-ph.vercel.app](https://civic-ph.vercel.app) | **Public Access:** Legal search, Republic Acts, City Ordinances<br>**Capacitor Android:** `com.civicph.app` (`CivicPH`) | **Vercel** + Next.js 16 + React 19 + Tailwind v4 + Prisma |
| **3** | **Flexible Admissions Tracker** | [https://zppsu-admissions.vercel.app](https://zppsu-admissions.vercel.app)<br>*(Alt: [flexible-daily-admissions-tracking.vercel.app](https://flexible-daily-admissions-tracking.vercel.app))* | **Interactive Demo Mode:** Client-side LocalStorage demo mode for instant evaluation without production database access | **Vercel** + React 19 + Vite 8 + Tailwind v4 + Supabase Auth/DB |
| **4** | **EPDU Palaro 2026 Chess** | [https://epdu-chess-2026.imdcluy.workers.dev](https://epdu-chess-2026.imdcluy.workers.dev) | **Public Tournament Portal:** Live Swiss pairings, match standings, and athlete verification viewable without login | **Cloudflare Workers** + Hono + Cloudflare D1 (SQLite Edge) |
| **5** | **Receipt Submission for PE & NSTP** | [https://ntstp-pe-receipt-submission-tracker.netlify.app/](https://ntstp-pe-receipt-submission-tracker.netlify.app/) | **Public Student Access:** Mobile receipt upload portal with instant image preview and auto-validation | **Netlify** + Supabase Storage & Database |
| **6** | **CPT Palaro Management System** | [https://cpt-palaro.netlify.app](https://cpt-palaro.netlify.app)<br>*(Alt: [comtech-palaro-webapp.netlify.app](https://comtech-palaro-webapp.netlify.app))* | **Public Tournament Portal:** Public athlete verification, live medal standings, and event match schedules viewable without login | **Netlify** + React + Vite + Express + Better-SQLite3 / Supabase |
| **7** | **Document Submission Tracker** | [Live GAS Web App](https://script.google.com/macros/s/AKfycbypRMB1ssxs5f8JZ1kY3xHYpG1tziueKVh_Tr75SGwFBrLb2fECXXwRlKGHuqMPhbfyNQ/exec) | **Institutional Pipeline:** Direct sync to department Google Drive compliance folders | **Google Apps Script** + Google Drive API + Google Sheets DB |
| **8** | **Palaro Submission of Music** | [Live GAS Webhook](https://script.google.com/macros/s/AKfycbzcRiQZuykFxn9JyoSelVM0oCRsNEQz3jmDTe-oX_UMWT9zyxPTQ_yOfWNCTtSiXj9oxg/exec) | **Cultural Events Intake:** Cheerdance, Vocal Solo, Duet, Pop Dance audio file uploads directly to Google Drive | **Google Apps Script** + Responsive HTML5/JS |

---

## 3. Master Catalog of 37 Projects Across 5 Domains

### Domain 1: Institutional University Systems (ZPPSU Suite) — 11 Projects

#### 1. CHED Compliance Management App
- **Directory:** `CHED Compliance Management App`
- **Tech Stack:** Next.js 14.2.15, React 18.3.1, TypeScript, Tailwind CSS 3.4.14, Cloudflare Pages (`@cloudflare/next-on-pages`), Cloudflare D1 (`zppsu-ched-db`), Google Apps Script API
- **Deployment:** Live Cloud ([https://zppsu-ched-compliance.pages.dev](https://zppsu-ched-compliance.pages.dev))
- **Role & Problem Solved:** Built for the **Computer Technology Department Chair** and **CHED Regional Quality Assessment Team (RQAT)** evaluators to audit BIndTech compliance under CMO No. 79.
- **Key Features:** Folders A–H compliance progress dials, PDF document review queue, faculty roster credential inspection (19 instructors), CHED Annex C/D/E automated export, interactive evaluator inspection mode.
- **Run Command:** `npm run dev` (Port 3000)

#### 2. Comtech One Web App
- **Directory:** `Comtech One Web App`
- **Tech Stack:** Hono 4.9.4, Cloudflare Pages/Workers, Cloudflare D1 (SQLite), Cloudflare R2, Drizzle ORM 0.44.2, Tailwind CSS 3.4.17, Vite 6.3.5
- **Deployment:** Cloudflare Pages
- **Visual Assets On Disk:** **13 interactive HTML wireframes** (`wireframe-chunk1-landing.html` to `wireframe-chunk10-qa.html`, `wireframe-curriculum-map.html`, `wireframe-syllabus-framework.html`, `wireframe.html`) + `wireframe.excalidraw`
- **Role & Problem Solved:** Central institutional portal for the BIndTech Computer Technology department.
- **Key Features:** Edge serverless backend, D1 database migrations, curriculum mapping framework, syllabus repository, ready-to-render wireframe showcases.
- **Run Command:** `npm run dev` / `wrangler pages deploy dist`

#### 3. School Directory System
- **Directory:** `School Directory System`
- **Tech Stack:** Next.js 14, React, Tailwind CSS, Supabase SSR, Lucide React
- **Deployment:** Cloud-Ready / Local
- **Role & Problem Solved:** Institutional knowledge hub for students, faculty, and administrative staff.
- **Key Features:** Campus memo circulars, school policy handbooks, university organizational charts, DRRMO 24/7 disaster response & emergency hotlines.
- **Run Command:** `npm run dev` / `run_dev.bat`

#### 4. Student Document-Receipt Tracker
- **Directory:** `Student Document-Receipt Tracker`
- **Tech Stack:** Next.js 16.2.11, React 19.2.4, Tailwind CSS v4, AWS S3 / Cloudflare R2 Presigned URLs (`@aws-sdk/client-s3`), Base UI, Shadcn UI, Playwright 1.61.1
- **Deployment:** Cloud-Native / Local
- **Role & Problem Solved:** High-volume student document ingestion, verification, and receipt tracking.
- **Key Features:** Direct-to-storage presigned uploads, Supabase database synchronization, CSV bulk imports, rigorous end-to-end Playwright tests.
- **Run Command:** `npm run dev -p 8088`

#### 5. Flexible Daily Admissions Tracking Web App
- **Directory:** `Flexible Daily Admissions Tracking Web App`
- **Tech Stack:** React 19.2.6, Vite 8.0.12, Tailwind CSS v4.3.1, Supabase JS 2.108.1, Lucide React
- **Deployment:** Live Cloud ([https://zppsu-admissions.vercel.app](https://zppsu-admissions.vercel.app))
- **Role & Problem Solved:** Executive admissions screening tracker for Program Chairs and Deans.
- **Key Features:** Automated arithmetic validation checks, drag-and-drop roster attachment uploader, executive dashboard with custom SVG trend charts, clearance rate metrics, dual LocalStorage demo / Supabase cloud modes.
- **Run Command:** `npm run dev`

#### 6. Screening_App
- **Directory:** `Screening_App`
- **Tech Stack:** Python, Flask, Jinja2, 19 CSV databases, Speech Synthesis (over 2,300 lines in `app.py`)
- **Deployment:** Local LAN Physical Multi-Station Setup
- **Visual Assets On Disk:** `readme.docx` (3.25 MB with station setup photos), `zppsu_qualified_applicants_ay2026_2027.pdf`, university logos
- **Role & Problem Solved:** Battle-tested physical admissions intake system handling hundreds of applicants on screening days.
- **Key Features:** 5 physical stations: Station 1 (Intake), Station 2 (Timed Essay Writing Desk), Station 3 (Oral Reading Assessment), Station 4 (Speech-synthesized TV Queue Display), Station 5 (Chair Live Monitor & Messenger GC roster compiler).
- **Run Command:** `python app.py` (Port 5000)

#### 7. Screening_App_V2
- **Directory:** `Screening_App_V2`
- **Tech Stack:** Python, Flask, SQLite (WAL mode, `screening.db`, `models.py`), Jinja2
- **Deployment:** Local LAN Station System
- **Role & Problem Solved:** Relational rewrite of the screening engine with ACID transactions and multi-campus context switching.
- **Key Features:** Program realities matrix, relational student tracking, deficiency logging, instantaneous status reporting.
- **Run Command:** `python app.py`

#### 8. Enrollment_App
- **Directory:** `Enrollment_App`
- **Tech Stack:** Python, Flask, CSV, Jinja2, ReportLab, python-docx
- **Deployment:** Local LAN System
- **Visual Assets On Disk:** Pre-compiled report [CPT_Daily_Dashboard.pdf](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Enrollment_App/CPT_Daily_Dashboard.pdf)
- **Role & Problem Solved:** Student advising and section balancing portal.
- **Key Features:** Tracks incoming student standing, back subjects, blue forms, and cashier receipts; automated daily PDF/DOCX transmittal report generation.
- **Run Command:** `python Advising_App.py`

#### 9. Document_Submission_Tracker-Monitoring
- **Directory:** `Document_Submission_Tracker-Monitoring`
- **Tech Stack:** Google Apps Script (`Code.gs`), Google Drive API, Google Sheets DB, HTML5/CSS3/JS
- **Deployment:** Live Cloud ([Live GAS Web App](https://script.google.com/macros/s/AKfycbypRMB1ssxs5f8JZ1kY3xHYpG1tziueKVh_Tr75SGwFBrLb2fECXXwRlKGHuqMPhbfyNQ/exec))
- **Role & Problem Solved:** $0-cost department document submission portal.
- **Key Features:** Direct Google Drive file storage, Google Sheets ledger, faculty upload portal, passcode-secured Program Chair dashboard (`ZPPSU-CT-2026`).

#### 10. NC Tracker
- **Directory:** `NC Tracker`
- **Tech Stack:** Streamlit, Pandas, SQLite, Python
- **Deployment:** Local Desktop Web App
- **Role & Problem Solved:** TESDA National Certificate qualification tracking for BIndTech-CpT students.
- **Key Features:** Monitors CSS NC II, Visual Graphic Design NC III, Technical Drafting NC II, Broadband Installation NC II, and Programming NC III training hours and certification status.
- **Run Command:** `streamlit run app.py`

#### 11. Prospectus Generator
- **Directory:** `Prospectus Generator`
- **Tech Stack:** FastAPI, Jinja2, openpyxl, Playwright PDF rendering, Python
- **Deployment:** Local LAN / PDF Engine
- **Visual Assets On Disk:** Pre-rendered official [CPT Distribution of subjects per term.pdf](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Prospectus%20Generator/CPT%20Distribution%20of%20subjects%20per%20term.pdf) (359 KB)
- **Role & Problem Solved:** Evaluates historical student records against curriculum prerequisites and compiles pixel-perfect official printable prospectus PDFs.
- **Run Command:** `python backend/main.py`

---

### Domain 2: Sports, Tournaments & Campus Events (Palaro Suite) — 6 Projects

#### 12. EPDU Palaro 2026 - Chess Tournament
- **Directory:** `EPDU Palaro 2026 - Chess Tournament`
- **Tech Stack:** Cloudflare Workers, Hono, Cloudflare D1 (SQLite Edge), Drizzle ORM, TypeScript, Vitest
- **Deployment:** Live Cloud ([https://epdu-chess-2026.imdcluy.workers.dev](https://epdu-chess-2026.imdcluy.workers.dev))
- **Role & Problem Solved:** Inter-campus chess tournament platform managing 5 ZPPSU external campuses (Kabasalan, Siay, Malangas, etc.).
- **Key Features:** Online athlete registration, document verification, snapshot JSON export to offline venue LAN server, arbiter scoring sync. Admin route: `/admin/login` (`palaro2026admin`).

#### 13. CPT Palaro Management System
- **Directory:** `CPT Palaro Management System`
- **Tech Stack:** React, Vite, Express, Better-SQLite3 / Supabase, TanStack Query, QR Codes
- **Deployment:** Live Cloud ([https://cpt-palaro.netlify.app](https://cpt-palaro.netlify.app) & [https://comtech-palaro-webapp.netlify.app](https://comtech-palaro-webapp.netlify.app))
- **Visual Assets On Disk:** Official seal `zppsu-header-logo.png` (102 KB)
- **Role & Problem Solved:** Departmental sports fest management system for 302 athletes across 32 sporting and cultural events.
- **Key Features:** Dynamic QR code athlete credentials, coach/arbiter approval queues, public team standings, role-based coordinator and arbiter dashboards.

#### 14. Local Palaro Chess Tournament Management System
- **Directory:** `Local Palaro Chess Tournament Management System`
- **Tech Stack:** Node.js, Express, Better-SQLite3 (`palaro_chess.db`), Server-Sent Events (`sse.js`), Multer, QRCode
- **Deployment:** Standalone Hardware Venue Server
- **Visual Assets On Disk:** Official banner `banner.jpg` (442 KB)
- **Role & Problem Solved:** Standalone organizer laptop server powering venue TV screens and arbiter tablets during live matches without internet.
- **Key Features:** Dynamic TV display modes, automated Swiss pairing generation, real-time board updates via SSE, Wi-Fi QR onboarding.
- **Run Command:** `node server.js` / `start.bat` (Port 3000)

#### 15. Chess Tournament Management System
- **Directory:** `Chess Tournament Management System`
- **Tech Stack:** Node.js, Express, HTML/CSS/JS
- **Deployment:** Local LAN Tool
- **Role & Problem Solved:** Pairing engine and tiebreak calculator.
- **Key Features:** Calculates FIDE-standard Buchholz, Sonneborn-Berger, and Direct Encounter tiebreaks; round-robin and Swiss pairing schedules.
- **Run Command:** `node server.js`

#### 16. Event Attendance Logger
- **Directory:** `Event Attendance Logger`
- **Tech Stack:** Python, FastAPI, SQLite (`aiosqlite`), python-docx, Uvicorn
- **Deployment:** Local LAN Tool
- **Visual Assets On Disk:** Sample output Word transmittal [Loyalty_Week_Physical_Attendance_Roster.docx](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Event%20Attendance%20Logger/Loyalty_Week_Physical_Attendance_Roster.docx)
- **Role & Problem Solved:** Single-user organizer app for campus loyalty weeks and seminars.
- **Key Features:** Event session builder, attendance tracking, team ranking engine, automated `.docx` summary compilation.
- **Run Command:** `uvicorn app.main:app --reload`

#### 17. Palaro Submission of Music
- **Directory:** `palaro submission of music`
- **Tech Stack:** Vanilla HTML5, CSS3, JavaScript, Google Apps Script Webhook
- **Deployment:** Live Cloud ([Live Webhook](https://script.google.com/macros/s/AKfycbzcRiQZuykFxn9JyoSelVM0oCRsNEQz3jmDTe-oX_UMWT9zyxPTQ_yOfWNCTtSiXj9oxg/exec))
- **Visual Assets On Disk:** Tournament banner `assets/banner.jpg` (442 KB)
- **Role & Problem Solved:** Audio submission hub for cultural competitions (Cheerdance, Solo, Duet).
- **Key Features:** Direct Google Drive high-speed audio uploads, competition category tagging, coordinator review dashboard.

---

### Domain 3: Pedagogical AI, EdTech & Academic Reviewers — 8 Projects

#### 18. Board Exam Reviewer Web App (Gabay)
- **Directory:** `Board Exam Reviewer Web App`
- **Tech Stack:** React 19.2.7, Vite 8.1.1, Dexie.js 4.4.4 (IndexedDB), `@google/genai` 2.12.0, Supabase 2.110.7, Vite PWA 1.3.0, Sentry 10.67.0, PostHog 1.404.1
- **Deployment:** Offline-First PWA / Cloud Sync Ready
- **Visual Assets On Disk:** App logo `public/logo.jpg` (118 KB)
- **Role & Problem Solved:** Offline-first reviewer preparing examinees for the Philippine Civil Service Examination (CSE-PPT Professional).
- **Key Features:** 5-tier Leitner spaced repetition box system, automatic leech question detection, 170-item timed mocks, Anxiety Toolkit (Box Breathing & Worry Dump), AI item generation scripts powered by Google Gemini and DeepSeek.
- **Run Command:** `npm run dev`

#### 19. LET Reviewer Web App
- **Directory:** `LET Reviewer WEb App`
- **Tech Stack:** Dual-tier architecture: Frontend React 18.3.0 + Vite 5.4.0 + `vite-plugin-pwa` 0.20.0; Backend Hono 4.6.0 + `@hono/node-server` + PostgreSQL 3.4.0
- **Deployment:** Cloud / Institutional Prototype
- **Role & Problem Solved:** Table of Specifications (TOS) analytics platform for the Philippine Licensure Examination for Teachers (LET).
- **Key Features:** Institutional competency tracking, cohort weakness diagnostics, accreditation-ready readiness reports.

#### 20. AI ESL Tutor
- **Directory:** `Ai ESL Tutor`
- **Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Web Speech API, DeepSeek v4 Pro API
- **Deployment:** AI Web Application
- **Role & Problem Solved:** Task-based conversational ESL coach.
- **Key Features:** 3-step SLA graduated scaffolding (Location → Clue → Recast), Web Speech voice recognition and synthesis, CEFR 5-skill radar diagnostic, spaced review center (1, 3, 7, 14 days), spoken roleplay and written email evaluation.
- **Run Command:** `next dev -p 3080`

#### 21. Learning Module Generator
- **Directory:** `Learning Module Generator`
- **Tech Stack:** Vanilla JS, Vite, Node.js, Express, mammoth, docx builder
- **Deployment:** Local Pedagogical Tool
- **Role & Problem Solved:** Generates Philippine DepEd/CHED self-learning modules from syllabus files.
- **Key Features:** Implements the official **IDEA framework** (Introduction → Development → Engagement → Assimilation), BYOK LLM pipeline, automated DOCX compilation.
- **Run Command:** `npm run dev`

#### 22. OBE Content Generator
- **Directory:** `OBE Content Generator`
- **Tech Stack:** Node.js, Express, CSV parser/stringify
- **Deployment:** Local Tool
- **Role & Problem Solved:** Generates 18-week Outcome-Based Education (OBE) course outlines for BIndTech courses.
- **Run Command:** `npm run dev`

#### 23. OBE Content Generator v2(deepseek)
- **Directory:** `OBE Content Generator v2(deepseek)`
- **Tech Stack:** Express 5.2.1, DeepSeek API, CSV stringify, automated test harness
- **Deployment:** Local AI Generation Studio
- **Role & Problem Solved:** Production syllabus studio generating **264-row structured HYBRID matrices** adhering strictly to ZPPSU institutional formats.
- **Key Features:** Verified with **60 passing automated unit tests** (`npm test`), course outcome alignments (CO1–CO4), 18-week learning plans.
- **Run Command:** `npm run dev`

#### 24. OBE-LP Generator
- **Directory:** `OBE-LP Generator`
- **Tech Stack:** Streamlit, Python, PyMuPDF, python-docx
- **Deployment:** Local Desktop App
- **Visual Assets On Disk:** Official university seal `zppsu_logo.png` (7.2 MB)
- **Role & Problem Solved:** Parses faculty syllabi and compiles standardized institutional weekly Lesson Plans (LPs).
- **Run Command:** `streamlit run app.py`

#### 25. OBE-Syllabus Generator
- **Directory:** `OBE-Syllabus Generator`
- **Tech Stack:** Streamlit, Python, FastAPI, SQLite
- **Deployment:** Local Desktop Web Suite
- **Visual Assets On Disk:** University header logo `assets/main_logo.png`
- **Role & Problem Solved:** Complete relational database archive, visual editor, and batch document exporter for college syllabi.
- **Run Command:** `streamlit run app.py`

---

### Domain 4: Offline LAN Infrastructure & Classroom Utilities — 4 Projects

#### 26. LocalClassroom
- **Directory:** `LocalClassroom`
- **Tech Stack:** Node.js, Express, SQLite (WAL mode, 24MB DB), Socket.io, Puppeteer, Vanilla HTML/CSS/JS
- **Deployment:** Offline Wi-Fi LAN Hub
- **Visual Assets On Disk:** **67 high-resolution educational diagrams** in `public/images/slides/` (PLC circuits, workshop layouts, CSS box models, responsive grids)
- **Role & Problem Solved:** Operates on a local wireless router with zero internet connection to deliver synchronized lectures and track student work.
- **Key Features:** Real-time WebSocket slide synchronization, live in-lecture student polling, digital lab submission dropboxes, local IP discovery, gradebook export.
- **Run Command:** `npm start`

#### 27. Learning Management System (Offline LMS)
- **Directory:** `Learning Management System`
- **Tech Stack:** Python, Flask, SQLAlchemy, SQLite (WAL mode)
- **Deployment:** Router-Hosted Offline LMS (`0.0.0.0:5000`)
- **Role & Problem Solved:** Standalone LMS for computer labs without internet connectivity.
- **Key Features:** Synchronized lecture broadcasts, self-paced student reading modules, interactive quizzes, automated grading.
- **Run Command:** `python app.py`

#### 28. Faculty_Chat
- **Directory:** `Faculty_Chat`
- **Tech Stack:** Python, Flask, HTML5/CSS3
- **Deployment:** Local LAN Chat (Port 5001)
- **Role & Problem Solved:** Ephemeral local chat tool for faculty during meetings and paper grading.
- **Run Command:** `python app.py`

#### 29. LocalMedia
- **Directory:** `LocalMedia`
- **Tech Stack:** Node.js, Express, SQLite, Socket.io, Multer
- **Deployment:** Local LAN Server
- **Role & Problem Solved:** Offline-first campus social feed and media server running in tandem with LocalClassroom.
- **Key Features:** Student user accounts, media sharing, offline photo posts, and course document downloads.
- **Run Command:** `npm start`

---

### Domain 5: Full-Stack Web Applications, Civic Tech & Utilities — 8 Projects

#### 30. BatasPh (CivicPH)
- **Directory:** `BatasPh`
- **Tech Stack:** Next.js 16.1.1, React 19.0.0, Tailwind CSS v4, Prisma 6.11.1, Framer Motion, Zustand, Vaul, Capacitor Android 8.4.1
- **Deployment:** Live Cloud ([https://civic-ph.vercel.app](https://civic-ph.vercel.app)) & Android App (`com.civicph.app`)
- **GitHub:** [imdcluy-ctrl/BatasPh](https://github.com/imdcluy-ctrl/BatasPh.git)
- **Role & Problem Solved:** Free public civic legal repository for Philippine Republic Acts, City Ordinances, and Supreme Court rulings.
- **Key Features:** Automated Python web crawlers, full-text legal search, mobile-responsive reader with dark/light theme, packaged as a native Android APK via Capacitor.
- **Run Command:** `npm run dev`

#### 31. Receipt Submission for PE & NSTP tshirt
- **Directory:** `Receipt Submission for PE & NSTP tshirt`
- **Tech Stack:** Vanilla HTML5, CSS3, JavaScript, Supabase Storage & Database
- **Deployment:** Live Cloud ([https://ntstp-pe-receipt-submission-tracker.netlify.app/](https://ntstp-pe-receipt-submission-tracker.netlify.app/))
- **Role & Problem Solved:** Mobile fee receipt submission portal.
- **Key Features:** Client-side image preview, name format verification, direct Supabase storage bucket sync.

#### 32. Task Manager
- **Directory:** `Task Manager`
- **Tech Stack:** SvelteKit 2.63.0, Svelte 5.56.1, Tailwind CSS v4.3.2, Vite 8.0.16, Dexie 4.4.4 (IndexedDB), Canvas Confetti, Marked, Vite PWA
- **Deployment:** Offline-First PWA
- **Role & Problem Solved:** High-speed distraction-free personal task management PWA.
- **Key Features:** Offline IndexedDB persistence, markdown notes, confetti completion celebrations, installable as desktop/mobile app.
- **Run Command:** `npm run dev`

#### 33. Financial Assistant
- **Directory:** `Financial Assistant`
- **Tech Stack:** Vanilla HTML5, CSS3, JavaScript, Chart.js
- **Deployment:** Client-Side Secure Web App (Zero Telemetry)
- **Role & Problem Solved:** Private personal financial retirement and phased wealth ledger.
- **Key Features:** Master PIN protection screen, dynamic compound interest and retirement runway graphs, complete offline privacy (zero backend), JSON data import/export.
- **Run Command:** Open `index.html` in browser or run `run.bat`

#### 34. Brain Testing for Cognitive Expert
- **Directory:** `Brain Testing for Cognitive Expert`
- **Tech Stack:** Python, Flask, SQLite (WAL mode), HTML5/CSS3
- **Deployment:** Local Health Journal
- **Role & Problem Solved:** Health journaling application compiling AI cognitive testing transcripts (from Google Gemini Gem) for review by neurological specialists.
- **Run Command:** `python app.py` (Port 5000)

#### 35. Lotto Cracker
- **Directory:** `Lotto Cracker`
- **Tech Stack:** Frontend: Vue 3.5.39, Vite 8.1.1, Apache ECharts 6.1.0 (`echarts` + `vue-echarts`), Pinia 3.0.4; Backend: Python, FastAPI, Pandas, SQLite
- **Deployment:** Analytical Web Application
- **Role & Problem Solved:** Statistical probability analyzer and historical trend visualization platform for PCSO Philippine lotto games.
- **Key Features:** Automated draw result scrapers, frequency rankings, Monte Carlo simulation engine, wheeling algorithm generation.
- **Run Command:** `uvicorn backend.main:app --reload` & `npm run dev`

#### 36. Sms-email bulk sender
- **Directory:** `Sms-email bulk sender`
- **Tech Stack:** Node.js, Express, SQLite3, Nodemailer, Multer
- **Deployment:** Local Communication Tool
- **Role & Problem Solved:** Institutional announcement dispatcher.
- **Key Features:** CSV roster upload, template tag interpolation (`{{name}}`, `{{status}}`), batch SMTP email dispatch, retry queues.
- **Run Command:** `npm start` (Port 3001)

#### 37. App Trend Tracker
- **Directory:** `app trend tracker`
- **Tech Stack:** Python, FastAPI, Jinja2, HTML5/CSS3
- **Deployment:** Local Analytical Dashboard
- **Role & Problem Solved:** Niche SaaS market research dashboard analyzing underserved software opportunities and Big Tech retention patterns.
- **Run Command:** `uvicorn main:app --reload`

---

## 4. Complete On-Disk Visual Assets Inventory

Rather than executing slow browser captures for every project, the following rich visual assets already exist on disk and can be immediately linked or embedded into the portfolio presentation:

1. **LocalClassroom (67 High-Resolution Educational Diagrams)**:
   - **Path:** [`LocalClassroom/public/images/slides/`](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/LocalClassroom/public/images/slides/)
   - **Assets:** High-fidelity PNGs covering PLC ladder logic (`fig4_3_boolean_ladder_circuits.png`), 50sqm workshop floorplans (`fig3_1_50sqm_workshop_floorplan.png`), signal flow (`fig1_3_signal_flow.png`), CSS box models (`fig4_1_box_model_layers.png`), responsive grids (`fig5_5_responsive_card_grid_flow.png`), and offline OTG workflows (`fig3_5_offline_otg_workflow.png`).
2. **Comtech One Web App (13 Interactive HTML Wireframes + Excalidraw)**:
   - **Path:** [`Comtech One Web App/`](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Comtech%20One%20Web%20App/)
   - **Assets:** `wireframe-chunk1-landing.html` through `wireframe-chunk10-qa.html`, `wireframe-curriculum-map.html`, `wireframe-syllabus-framework.html`, `wireframe.html`, and `wireframe.excalidraw`. Can be rendered directly in an iframe or snapshotted in standard browser viewports.
3. **Palaro Tournament Brand Assets**:
   - [`CPT Palaro Management System/public/zppsu-header-logo.png`](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/CPT%20Palaro%20Management%20System/public/zppsu-header-logo.png) (102,153 bytes official seal)
   - [`Local Palaro Chess Tournament Management System/banner.jpg`](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Local%20Palaro%20Chess%20Tournament%20Management%20System/banner.jpg) (442,337 bytes official banner)
   - [`palaro submission of music/assets/banner.jpg`](file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/palaro%20submission%20of%20music/assets/banner.jpg) (442,337 bytes)
4. **Institutional Emblems & Logos**:
   - `Screening_App/static/img/main_logo.png` & `ambc_logo.png`
   - `Enrollment_App/static/img/main_logo.png` & `ambc_logo.png`
   - `OBE-LP Generator/zppsu_logo.png` (7.2 MB official university seal)
   - `OBE-Syllabus Generator/assets/main_logo.png`
   - `Board Exam Reviewer Web App/public/logo.jpg` (118 KB Gabay brand logo)
5. **Real Sample Output Documents & Inspection PDFs**:
   - `Screening_App/readme.docx` (3.25 MB guide with embedded photos of all physical intake stations)
   - `Screening_App/zppsu_qualified_applicants_ay2026_2027.pdf`
   - `Prospectus Generator/CPT Distribution of subjects per term.pdf` (359 KB)
   - `Enrollment_App/CPT_Daily_Dashboard.pdf` (22.4 KB)
   - `Event Attendance Logger/Loyalty_Week_Physical_Attendance_Roster.docx` (84.6 KB)

---

## 5. Modern Portfolio Architecture & Research on Best Practices (2026 Standards)

### A. Hosting Platform: Cloudflare Pages (Recommended) vs. Vercel
Based on forensic analysis of current hosting patterns and the developer's ecosystem:
- **Cloudflare Pages (Top Recommendation):**
  - **Zero Cost ($0/mo):** Unlimited bandwidth and unlimited requests on the free tier. (Netlify bandwidth limits were noted as an issue in `CPT Palaro` documentation).
  - **Direct Ecosystem Synergy:** The user already deploys `CHED Compliance`, `Comtech One`, and `EPDU Palaro Chess` on Cloudflare Pages/Workers/D1.
  - **Global Edge Performance:** Sub-50ms latency globally across 300+ edge locations.
- **Vercel (Alternative):**
  - Superb preview deployments, but subject to 100GB/month bandwidth caps on the Hobby tier.

### B. The "Bento Hero + Case Study Drawer" UX Paradigm
Displaying 37 projects linearly causes visual clutter and cognitive fatigue. The modern 2026 standard uses a structured 3-tier hierarchy:
1. **Hero Bento Grid (Top 6 Flagship Projects)**:
   - Highlighting the 6 most impactful systems with rich visual cards:
     1. `Gabay Reviewer` (CSE-PPT Leitner Repetition PWA + Gemini/DeepSeek item generation)
     2. `CHED Compliance Management Portal` (Cloudflare Pages live app)
     3. `EPDU Palaro Chess` (Inter-campus sports tournament platform)
     4. `BatasPh / CivicPH` (Legal intelligence Next.js 16 + Android Capacitor)
     5. `Flexible Daily Admissions Tracker` (Executive admissions dashboard)
     6. `LocalClassroom` (Offline LAN classroom hub with 67 diagrams)
2. **Instant Filterable Catalog (All 37 Projects)**:
   - Filter Tabs: `All (37)`, `Institutional Systems (11)`, `Sports & Tournaments (6)`, `EdTech & AI (8)`, `Offline LAN (4)`, `Full-Stack & Civic (8)`.
   - Secondary Pills: `Live Cloud (8)`, `LAN Offline (14)`, `AI Integrated (4)`.
   - Card Details: Project title, 1-sentence hook, 3 key tech tags, live status badge, and "Explore Case Study" button.
3. **Slide-Out Case Study Drawer ("See More" Deep Context)**:
   - Powered by Radix UI Sheet / Vaul Drawer.
   - Clicking any card slides out a deep-dive drawer containing:
     - Real-world institutional problem & operational context.
     - Live Cloud Demo link (or "Offline LAN Architecture" badge).
     - Test credentials and role access walkthrough (where applicable).
     - Screenshots / architectural diagrams.
     - Complete tech stack pills and terminal run command.

### C. Visual Theme Tokens (Minimalist Dark & Light)
- **Light Theme Palette**:
  - Canvas: `#F8FAFC` (Slate 50)
  - Card Surfaces: `#FFFFFF` (Pure White) with 1px border `#E2E8F0` (Slate 200)
  - Text Primary: `#0F172A` (Slate 900)
  - Text Muted: `#475569` (Slate 600)
  - Accent: `#4F46E5` (Indigo 600) & `#059669` (Emerald 600)
- **Dark Theme Palette**:
  - Canvas: `#09090B` (Zinc 950)
  - Card Surfaces: `#18181B` (Zinc 900) with 1px border `#27272A` (Zinc 800)
  - Text Primary: `#F4F4F5` (Zinc 100)
  - Text Muted: `#A1A1AA` (Zinc 400)
  - Accent: `#818CF8` (Indigo 400) & `#34D399` (Emerald 400)
- **Zero-FOUC Implementation**: Include an inline script in `<head>` inspecting `localStorage.getItem('theme')` and `window.matchMedia('(prefers-color-scheme: dark)')` to apply `dark` class before HTML rendering.

---

## 6. Playwright Automation Blueprint for Remaining Screenshots

For local projects lacking existing diagrams or banners (e.g. `Screening_App_V2`, `Financial Assistant`, `app trend tracker`), a standalone Playwright batch script (`scripts/capture-screenshots.js`) can automate local captures:

```javascript
// scripts/capture-screenshots.js
import { chromium } from 'playwright';

const targets = [
  { name: 'financial-assistant', url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU A.Y. 2026-2027/My Project/Financial Assistant/index.html' },
  { name: 'comtech-wireframe-landing', url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU A.Y. 2026-2027/My Project/Comtech One Web App/wireframe-chunk1-landing.html' },
  { name: 'comtech-curriculum-map', url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU A.Y. 2026-2027/My Project/Comtech One Web App/wireframe-curriculum-map.html' },
];

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const target of targets) {
    console.log(`Capturing ${target.name}...`);
    await page.goto(target.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `public/projects/${target.name}.png`, fullPage: false });
  }

  await browser.close();
  console.log('All automated screenshots captured successfully.');
}
capture();
```

---

## 7. Concrete Handoff Blueprint for Opus 4.6

When Opus 4.6 begins the implementation plan, it should follow these 6 structured phases:

### Phase 1: Project Scaffold & Design System
- Scaffold static Next.js 15 (with `output: 'export'`) or Astro 5 in `My Portfolio`.
- Configure Tailwind CSS v4, Lucide React, and dark/light theme engine with zero-FOUC script.

### Phase 2: Strongly-Typed Data Ingestion
- Create `types/project.ts`:
  ```typescript
  export interface Project {
    id: string;
    title: string;
    tagline: string;
    description: string;
    domain: 'institutional' | 'sports' | 'edtech-ai' | 'lan-offline' | 'fullstack';
    tags: string[];
    isFlagship: boolean;
    isLiveCloud: boolean;
    liveUrl?: string;
    githubUrl?: string;
    credentialsContext?: string;
    architectureNotes: string;
    runCommand?: string;
    images: string[];
  }
  ```
- Generate `data/projects.ts` containing the audited 37 project records.

### Phase 3: Bento Grid Hero & Dynamic Category Filter
- Build the 6-tile flagship Bento Grid.
- Build responsive category tab filtering (`All`, `Institutional`, `Sports`, `EdTech`, `LAN`, `Full-Stack`) with instant state transitions.

### Phase 4: Accessible Slide-Out Case Study Drawer ("See More")
- Implement slide-out drawer (Vaul / Radix Sheet) synced with URL parameters (e.g. `?project=ched-compliance`) for direct sharing.
- Include live demo launch button, test credentials table, screenshot carousel, and architecture breakdown.

### Phase 5: Visual Assets Ingestion & Framing
- Link or copy the 67 diagrams from `LocalClassroom` and wireframe renders into `public/projects/`.
- Apply minimalist browser window mockup frames (clean chrome style without device clutter).

### Phase 6: Cloudflare Pages Deployment
- Configure `wrangler.toml` for static export.
- Commit to GitHub repository and connect to Cloudflare Pages for continuous zero-cost deployment.
