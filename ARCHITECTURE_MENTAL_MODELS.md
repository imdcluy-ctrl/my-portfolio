# Systems Architecture & Engineering Mental Models
### The Ultimate Master Guide to Duane Luy's 37 Institutional Software Projects

> **Audience:** Written for Duane Luy (Systems Architect & Software Engineer) to build an unshakable mental model of all 37 systems, understand how modern software architectures connect, master foundational engineering terms, and confidently pitch each system to clients, university leadership, and technical evaluators.

---

# Table of Contents
1. [The Software Architect's Mindset](#part-1-the-software-architects-mindset)
2. [The End-to-End Engineering Process: From Idea to Production](#part-2-the-end-to-end-engineering-process)
3. [The 5 Architectural Paradigms of Your 37 Projects](#part-3-the-5-architectural-paradigms)
4. [Master Project Reference: Architecture & Client Pitch for All 37 Systems](#part-4-master-project-reference)
5. [The Essential Software Architect Vocabulary (Plain English)](#part-5-the-essential-software-architect-vocabulary)
6. [The Architect's Technology Decision Matrix](#part-6-the-architects-technology-decision-matrix)

---

# Part 1: The Software Architect's Mindset

### What Is the Difference Between a Coder and a Software Architect?
- **A Junior Coder** asks: *"How do I write the code to make this button do X?"* They focus on syntax, libraries, and getting the feature to work on their local machine.
- **A Software Architect** asks:
  1. *"What are the real-world constraints?"* (Is there internet in the classroom? What is the university's monthly budget? Can non-technical staff use this?)
  2. *"What are the tradeoffs of this decision?"* (If we use MongoDB instead of SQLite, do we need to pay for a hosted server? If we use WebSockets instead of HTTP polling, what happens when Wi-Fi disconnects?)
  3. *"How does data flow from the user's finger to permanent storage and back?"*
  4. *"What happens when 500 users hit this simultaneously during enrollment or a sports tournament?"*

### The Core Principle of Your Portfolio: "Context-Driven Architecture"
You didn't build 37 random apps. You built **context-engineered solutions** tailored to the unique realities of ZPPSU and regional public institutions in the Philippines:
- **Constraint 1: Variable Internet Connectivity** $\rightarrow$ Led to your **Offline-First LAN Architectures** (LocalClassroom, LocalMedia).
- **Constraint 2: Zero Recurring Budget ($0/mo)** $\rightarrow$ Led to your **Serverless Edge & Jamstack Architectures** (Cloudflare Workers, Pages, GitHub Pages, D1).
- **Constraint 3: Regulatory & Institutional Compliance (CHED CMO-79, DepEd Palaro)** $\rightarrow$ Led to your **Automated Audit & Tournament Engines** (CHED Compliance, CPT Palaro, Gabay).

---

# Part 2: The End-to-End Engineering Process

When a client or professor asks: *"How do you create an application from start to finish?"*, this is the exact 6-stage lifecycle you follow:

```
+---------------------------------------------------------------------------------------+
| 1. REQUIREMENTS & CONSTRAINTS DISCOVERY                                               |
|    • Who is using it? (Deans, teachers, tournament arbiters, students)               |
|    • Where does it run? (Browser on 4G, local classroom Wi-Fi, school kiosk)          |
|    • What is the budget? (Typically $0/mo serverless or offline local hardware)       |
+-------------------------------------------┬-------------------------------------------+
                                            ▼
+---------------------------------------------------------------------------------------+
| 2. ARCHITECTURAL DECISION & DATA MODELING                                             |
|    • Choose paradigm: Edge Serverless vs Local LAN Server vs Static Client App        |
|    • Design Data Schema: Relational tables (SQLite/D1) vs Documents vs LocalStorage   |
|    • Establish State Boundaries: What lives in the client vs what lives in backend    |
+-------------------------------------------┬-------------------------------------------+
                                            ▼
+---------------------------------------------------------------------------------------+
| 3. PROTOCOL & API CONTRACT DESIGN                                                     |
|    • HTTP REST APIs: Standard CRUD (Create, Read, Update, Delete)                     |
|    • WebSockets: Real-time two-way sync (live tournament scores, quiz buzzers)        |
|    • Server-Sent Events (SSE): Streaming AI text generation (OBE Syllabi)             |
+-------------------------------------------┬-------------------------------------------+
                                            ▼
+---------------------------------------------------------------------------------------+
| 4. IMPLEMENTATION & COMPONENT MODULARITY                                              |
|    • Frontend: Component-driven UI (React, Astro, Tailwind CSS)                      |
|    • Backend: Minimalist, robust runtimes (Node.js, Express, Python Flask, Cloudflare)|
|    • State Management: Deterministic URL routing, reactive stores, offline queues    |
+-------------------------------------------┬-------------------------------------------+
                                            ▼
+---------------------------------------------------------------------------------------+
| 5. VERIFICATION, AUDIT & SIMULATION                                                   |
|    • Automated unit tests and synthetic browser simulations (Playwright)              |
|    • Boundary testing (e.g. 100 students submitting attendance at 8:00 AM)            |
|    • Security scrub: Sanitize credentials, strip PII, enforce RBAC                    |
+-------------------------------------------┬-------------------------------------------+
                                            ▼
+---------------------------------------------------------------------------------------+
| 6. DEPLOYMENT, TOPOLOGY & GOVERNANCE                                                  |
|    • Cloud Apps: Distributed Global Edge via Cloudflare Workers ($0 server cost)      |
|    • LAN Apps: Node.js/Python service bound to 0.0.0.0 on a local router hotspot      |
|    • Documentation: README, ADRs (Architectural Decision Records), and User Manuals   |
+---------------------------------------------------------------------------------------+
```

---

# Part 3: The 5 Architectural Paradigms of Your 37 Projects

All 37 of your projects belong to one of 5 distinct architectural families. Once you memorize these 5 patterns, you can explain **any** project in your catalog in 30 seconds!

```
                                 YOUR 37 PROJECTS
                                        │
     ┌──────────────────┬───────────────┴──────────────┬──────────────────┐
     ▼                  ▼                              ▼                  ▼
[ PARADIGM 1 ]    [ PARADIGM 2 ]                 [ PARADIGM 3 ]     [ PARADIGM 4 ]     [ PARADIGM 5 ]
Serverless Edge   Offline-First LAN              Real-Time FIDE     Pedagogical AI     Institutional
Cloud Platforms   Classroom Hubs                 Tournament Engines Generation Engines Administrative DBs
(CHED, Gabay,     (LocalClassroom,               (CPT Palaro,       (OBE Syllabus,     (Admissions,
 Comtech One)      Faculty Chat)                  Chess Tournaments) LP Generator)      Receipt Tracker)
```

### Paradigm 1: Serverless Edge & Jamstack (High Availability, $0/mo Cost)
- **Examples:** *CHED Compliance App, Board Exam Reviewer Gabay, Comtech One, Developer Portfolio.*
- **How It Works:** The frontend is pre-compiled into lightning-fast static HTML/CSS/JavaScript (Astro, Next.js, Vite). Assets are uploaded to Cloudflare's 300+ global edge data centers. Dynamic logic runs in lightweight V8 micro-workers close to the user.
- **Why It's Smart:** 0 millisecond cold starts, immune to server crashes, scales to millions of hits, and costs **\$0 per month**.

### Paradigm 2: Offline-First LAN Appliances (Zero-Internet Local Networks)
- **Examples:** *LocalClassroom, Faculty Chat, LocalMedia.*
- **How It Works:** A single computer or mini-PC runs a Node.js/Express server and broadcasts a Wi-Fi hotspot. Tablets and laptops connect to the local IP address (e.g., `192.168.1.100:3000`). Data is stored locally in an embedded SQLite database using **WAL (Write-Ahead Logging)** for high-speed concurrent writes.
- **Why It's Smart:** It completely eliminates reliance on telecom internet (which frequently fails or is unavailable in remote provincial classrooms).

### Paradigm 3: High-Concurrency Real-Time Tournament Engines
- **Examples:** *CPT Palaro Management, Chess Tournament Management System, EPDU Palaro.*
- **How It Works:** Implements strict international algorithms (FIDE Swiss-System pairing, Buchholz tiebreaks, single/double elimination brackets). Uses **WebSockets** for instant sub-100ms score propagation across scoreboards, arbiters, and spectator displays without page reloading.
- **Why It's Smart:** Prevents human calculation errors in high-stakes multi-campus athletic meets and handles simultaneous game clocks with millisecond accuracy.

### Paradigm 4: Pedagogical AI & Structured Generative Engines
- **Examples:** *OBE Syllabus Generator, Learning Module Generator, LET Reviewer, AI ESL Tutor.*
- **How It Works:** Connects modern Large Language Models (OpenAI, DeepSeek, Claude) to rigid institutional templates (CHED CMO formats, Bloom's Taxonomy, DepEd syllabi). Uses **Structured Output Extraction** (JSON Schema) to guarantee the AI generates predictable, accredited curriculum matrices rather than loose conversational text.
- **Why It's Smart:** Saves university professors hundreds of hours of repetitive paperwork while strictly adhering to CHED accreditation standards.

### Paradigm 5: Institutional Administration, Intake & Verification Systems
- **Examples:** *Admissions Tracker, Document Submission Tracker, Screening App, NC Tracker.*
- **How It Works:** Multi-role workflow engines (Applicant $\rightarrow$ Evaluator $\rightarrow$ Department Chair $\rightarrow$ Registrar). Manages applicant queues, validates document receipt timestamps, checks prerequisites, and computes qualification scores.
- **Why It's Smart:** Replaces paper clipboards and fragile Excel sheets with tamper-evident, searchable digital audit trails.

---

# Part 4: Master Project Reference

Here is the exact breakdown for your marquee systems. Each entry gives you:
1. **The Architecture (How it works under the hood)**
2. **The Tech Stack**
3. **The 30-Second Client Pitch (What to say when presenting)**

---

## Flagship 1: LocalClassroom — Offline Wi-Fi Hub
- **Domain:** Offline LAN / EdTech
- **Status:** Complete / Verified on Local Hardware (67 Schematics)
- **Under The Hood:** An offline-first classroom appliance running an Express.js backend on top of an embedded SQLite database configured with **WAL (Write-Ahead Logging)**. It hosts a captive Wi-Fi portal where up to 60 student devices connect without internet to stream slides, take real-time quizzes over WebSockets, and submit assignments.
- **Key Tech:** Node.js, Express, SQLite WAL, Socket.io, React, Zero-Internet Wi-Fi Hotspot.
- **The Client Pitch:**
  > *"In many schools, internet is either too slow or completely down. LocalClassroom turns any laptop into an offline university campus. A teacher turns it on, and up to 60 students connect via local Wi-Fi without needing a single byte of internet. They get live synced slide decks, instant quiz grading, and file distribution. It bridges the digital divide with zero telecom expense."*

---

## Flagship 2: CHED Compliance Management App
- **Domain:** Institutional Compliance
- **Status:** Live Cloud Deployment ([zppsu-ched-compliance.pages.dev](https://zppsu-ched-compliance.pages.dev/))
- **Under The Hood:** A reactive compliance audit dashboard tailored for CHED Regional Quality Assessment Team (RQAT) evaluators. It evaluates curriculum compliance matrices under **CMO No. 79 (BIndTech)**, computing faculty-to-student ratios, laboratory equipment inventories, and syllabus alignment. Includes an isolated **Guest Inspection Sandbox** allowing evaluators to simulate audits safely.
- **Key Tech:** Next.js, React, TypeScript, Tailwind CSS, Cloudflare D1/Pages.
- **The Client Pitch:**
  > *"Accreditation inspections usually involve frantic scrambling through thick physical binders. The CHED Compliance Management App digitizes the entire CMO-79 evaluation. Department chairs and CHED RQAT inspectors can instantly audit faculty qualifications, laboratory hours, and course outlines with automated percentage dials and real-time gap analysis."*

---

## Flagship 3: CPT Palaro Management System
- **Domain:** Sports Tournaments
- **Status:** Live Cloud Deployment ([cpt-palaro.pages.dev](https://cpt-palaro.pages.dev/))
- **Under The Hood:** A high-concurrency athletic meet scoring and scheduling system engineered for the College of Computer Studies Palaro. Manages multi-bracket tournament fixtures (Single Elimination, Double Elimination, Round Robin) with real-time medal tally rollups and automated schedule conflict resolution across university courts.
- **Key Tech:** Vite, React, Tailwind CSS, LocalStorage State Sync, Cloudflare Pages.
- **The Client Pitch:**
  > *"Running a multi-sport tournament with hundreds of student athletes often collapses when games run overtime or schedules overlap. The CPT Palaro system automates bracket advancement, tracks running point differentials, updates the overall department medal tally in real time, and alerts arbiters to venue conflicts before they cause delays."*

---

## Flagship 4: Gabay — Board Exam Reviewer
- **Domain:** EdTech / Mobile Web
- **Status:** Live Cloud Deployment ([board-exam-reviewer-gabay.pages.dev](https://board-exam-reviewer-gabay.pages.dev/))
- **Under The Hood:** An adaptive mobile-first examination engine designed for Filipino board exam candidates. Features spaced repetition algorithms, timed mock exams with automated percentile rank calculations, offline question caching, and detailed rationalizations for every question.
- **Key Tech:** Astro, React, Tailwind CSS, PWA (Progressive Web App) Service Workers, Cloudflare Pages.
- **The Client Pitch:**
  > *"Commercial review centers charge thousands for review materials. Gabay provides a free, mobile-optimized test simulation platform with spaced-repetition logic and offline caching. Students on jeepneys or provincial buses can take full 150-item mock board exams, track weak subject areas, and review rationalizations without needing active cellular data."*

---

## Flagship 5: Comtech One Web App
- **Domain:** Institutional Operations
- **Status:** Live Cloud Deployment ([comtech-one-web-app.pages.dev](https://comtech-one-web-app.pages.dev/))
- **Under The Hood:** Central operations portal for the ZPPSU Computer Technology Department. Integrates departmental notices, faculty directories, lab reservation forms, and student academic services into a unified glassmorphic portal.
- **Key Tech:** React, Vite, Tailwind CSS, Cloudflare Pages.
- **The Client Pitch:**
  > *"Comtech One is the digital front door for the Computer Technology Department. Instead of scattered Facebook groups and paper bulletin boards, it unifies student clearances, departmental announcements, and lab schedules into a single accessible web app."*

---

## Flagship 6: Chess Tournament Management System (FIDE Engine)
- **Domain:** Sports Analytics
- **Status:** Live Cloud Deployment ([chess-tournament-management.pages.dev](https://chess-tournament-management.pages.dev/))
- **Under The Hood:** An automated tournament arbiter platform implementing the official **FIDE Dutch Swiss-System pairing algorithm**. Calculates Buchholz tiebreaks, Sonneborm-Berger scores, and rating changes across 5 to 9 rounds while strictly preventing rematches and color imbalances.
- **Key Tech:** React, TypeScript, FIDE Swiss Engine Logic, Tailwind CSS.
- **The Client Pitch:**
  > *"Pairing a 60-player chess tournament by hand takes hours and frequently results in illegal rematches or disputes. This system acts as a certified digital arbiter: it pairs each round in seconds according to official FIDE Dutch rules, balances board colors, and computes tiebreaks instantly upon match result entry."*

---

## The AI Generative Suite:
### OBE Syllabus Generator & OBE LP (Lesson Plan) Generator
- **Domain:** Pedagogical AI
- **Under The Hood:** Uses prompt engineering pipelines and structured schema validation to translate course outcomes into CHED-compliant Outcome-Based Education (OBE) syllabi matrices and daily lesson plans.
- **The Client Pitch:**
  > *"Transitioning to Outcome-Based Education requires complex alignment tables mapping Course Outcomes to Program Educational Objectives. This AI engine automates the tedious formatting while preserving academic rigor, producing accredited syllabus matrices ready for departmental signing."*

---

## The Administrative Workflows Suite:
### Flexible Daily Admissions Tracker & Document Submission Tracker
- **Domain:** University Administration
- **Under The Hood:** High-speed intake queues designed for peak university enrollment days. Features live counter rollups, document verification checklists, and sub-second student record searches.
- **The Client Pitch:**
  > *"During admissions week, thousands of applicants arrive daily. These trackers eliminate data bottlenecks, giving admissions officers real-time counts of verified submissions, incomplete document alerts, and instant cross-counter lookups."*

---

# Part 5: The Essential Software Architect Vocabulary

When talking to senior engineers and clients, using the right architectural terms makes you sound like a seasoned professional:

| Term | Plain-English Definition | Real Example from Your Portfolio |
| :--- | :--- | :--- |
| **Serverless Edge** | Running code in distributed data centers around the world instead of renting a single physical computer. | Your Cloudflare Workers deployment runs on 300+ edge servers worldwide. |
| **Static Site Generation (SSG)** | Pre-building all HTML pages ahead of time so visitors download finished files instantly with 0ms database lag. | Your developer portfolio uses Astro 5 to generate 40 pre-rendered HTML files. |
| **SQLite WAL Mode** | *Write-Ahead Logging* — a database technique where new writes don't block ongoing reads, allowing high concurrency. | Used in **LocalClassroom** so 60 students can submit quiz answers simultaneously without database locks. |
| **WebSockets** | A continuous two-way communication channel between browser and server (unlike regular HTTP where the browser must ask for updates). | Used in **Chess Tournament Management** to broadcast scores to all screens in <100ms. |
| **Idempotency** | An operation that produces the exact same result no matter how many times it is repeated. | In **Document Submission Tracker**, clicking "Verify" twice doesn't create duplicate receipts. |
| **Progressive Web App (PWA)** | A web app that can be installed on a phone or laptop and works offline using service workers. | Implemented in **Gabay Board Exam Reviewer** for offline mock testing. |
| **Role-Based Access Control (RBAC)**| Restricting app features based on user permission levels (e.g. Student vs Arbiter vs Admin). | Used in **CPT Palaro** (Spectator = View Only; Arbiter = Score Edit; Admin = Bracket Reset). |
| **Zero-Cost Topology** | Designing enterprise-grade software to run within free-tier serverless limits ($0/month) indefinitely. | Your entire portfolio and 8 live cloud apps run on Cloudflare Pages and Workers with $0 hosting bills. |

---

# Part 6: The Architect's Technology Decision Matrix

When starting any new software project, follow this decision tree to pick the right stack:

### 1. Frontend Framework Decision:
- **Choose Astro if:** Content-heavy sites, portfolios, documentation, or landing pages where SEO, speed, and minimal JavaScript are top priorities.
- **Choose Next.js / React if:** Complex web applications with rich user dashboards, authenticated client state, and heavy interactive UI (like CHED Compliance).
- **Choose Vanilla JS / Vite if:** Single-purpose tools, tournament clocks, or widgets where zero framework overhead is required.

### 2. Database Decision:
- **Choose SQLite WAL if:** Local LAN apps, desktop software, or single-server systems where you want zero database server maintenance and instant setup.
- **Choose Cloudflare D1 if:** Cloud serverless edge apps requiring a relational SQL database without paying monthly database hosting fees.
- **Choose LocalStorage / IndexedDB if:** Client-side only utilities (like Gabay offline exams) where data stays on the user's phone or laptop.

### 3. Communication Protocol Decision:
- **Choose Standard HTTP REST if:** Basic form submissions, page loads, and data queries that don't need real-time synchronization.
- **Choose WebSockets if:** Live chat, real-time sports scoreboards, quiz buzzers, or multiplayer game clocks where latency must be under 100ms.
- **Choose Server-Sent Events (SSE) if:** One-way data streaming, such as streaming AI response tokens from an LLM.

---

### Next Steps for Duane Luy
1. Keep this guide in your repository as your personal architecture handbook.
2. Practice the **30-Second Client Pitch** for LocalClassroom, CHED Compliance, and CPT Palaro out loud.
3. When presenting to clients, lead with the **problem and real-world constraint**, explain your **architectural choice**, and finish with the **measurable outcome**!
