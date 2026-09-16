import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const projectsPath = path.join(root, 'src', 'data', 'projects.json');
const backupsDir = path.join(root, 'src', 'data', 'backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

function loadProjects() {
  return JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
}

function saveProjects(projects) {
  // Create backup first
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupsDir, `projects-${timestamp}.json`);
  fs.copyFileSync(projectsPath, backupFile);

  // Write new data
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf8');
  console.log(`[STUDIO] Saved ${projects.length} projects to disk. Backup created: ${path.basename(backupFile)}`);
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/projects' && req.method === 'GET') {
    const projects = loadProjects();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: projects.length, data: projects }));
    return;
  }

  if (url.pathname === '/api/projects' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!Array.isArray(payload.data)) {
          throw new Error('Payload data must be an array of projects');
        }
        saveProjects(payload.data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Projects successfully saved to disk!' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/rebuild' && req.method === 'POST') {
    exec('npm run build', { cwd: root }, (err, stdout, stderr) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: stderr || err.message }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Site rebuilt successfully!' }));
      }
    });
    return;
  }

  // Serve Single-Page Studio HTML
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getStudioHtml());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = 3333;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  ZPPSU PORTFOLIO STUDIO (Admin Control Center)`);
  console.log(`  Live URL: http://localhost:${PORT}`);
  console.log(`  Direct file target: ${projectsPath}`);
  console.log(`======================================================\n`);
});

function getStudioHtml() {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>ZPPSU Portfolio Studio — Control Center</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#10b981',
            darkBg: '#09090b',
            darkCard: '#18181b',
            darkBorder: '#27272a',
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #09090b; }
    ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">
  <!-- Top Navigation -->
  <header class="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
        Z
      </div>
      <div>
        <h1 class="font-bold text-sm text-white tracking-tight">ZPPSU Portfolio Studio</h1>
        <p class="text-[11px] text-zinc-400 font-mono">Content & Design Control Center</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <a href="http://localhost:4321" target="_blank" class="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
        ↗ View Live Portfolio
      </a>
      <button onclick="saveAllChanges()" id="saveBtn" class="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-950">
        <span>Save Changes to Disk</span>
      </button>
    </div>
  </header>

  <!-- Notification Toast -->
  <div id="toast" class="fixed bottom-6 right-6 hidden z-50 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono shadow-2xl flex items-center gap-2"></div>

  <!-- Main Content Layout -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Sidebar / Project List -->
    <aside class="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/40">
      <div class="p-4 border-b border-zinc-800 space-y-2">
        <div class="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Systems Catalog</span>
          <span id="projectCountBadge" class="bg-zinc-800 px-2 py-0.5 rounded-full text-[10px]">37</span>
        </div>
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Filter systems..." 
          oninput="renderProjectList()"
          class="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <div class="flex gap-1 overflow-x-auto text-[10px] font-mono pt-1">
          <button onclick="setFilter('all')" class="px-2 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700">All</button>
          <button onclick="setFilter('flagship')" class="px-2 py-1 rounded bg-zinc-800 text-emerald-400 hover:bg-zinc-700">Flagship</button>
          <button onclick="setFilter('live')" class="px-2 py-1 rounded bg-zinc-800 text-emerald-400 hover:bg-zinc-700">Live</button>
          <button onclick="setFilter('lan')" class="px-2 py-1 rounded bg-zinc-800 text-indigo-400 hover:bg-zinc-700">LAN</button>
        </div>
      </div>
      <div id="projectList" class="flex-1 overflow-y-auto p-2 space-y-1">
        <!-- Injected via JS -->
      </div>
    </aside>

    <!-- Project Editor Panel -->
    <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950/20">
      <div id="editorPlaceholder" class="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
        <p>Select a project from the left sidebar to edit its metadata, design, and settings.</p>
      </div>

      <div id="editorContent" class="hidden max-w-4xl mx-auto space-y-8">
        <!-- Header with Project Identity -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div class="flex items-center gap-2">
              <span id="badgeDomain" class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400">Domain</span>
              <span id="badgeStatus" class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">Status</span>
            </div>
            <h2 id="editTitleHeader" class="text-2xl font-extrabold text-white mt-1">Project Title</h2>
            <p id="editIdSub" class="text-xs font-mono text-zinc-500">slug</p>
          </div>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg hover:border-zinc-700">
              <input type="checkbox" id="fieldFeatured" onchange="updateActiveProject()" class="rounded text-emerald-500 focus:ring-emerald-500">
              <span class="text-xs font-medium text-white">Flagship Featured</span>
            </label>
          </div>
        </div>

        <!-- Section 1: Hero & Bento Settings -->
        <div class="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Bento Grid & Flagship Hierarchy
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Bento Priority Order (1-10)</label>
              <input type="number" id="fieldBentoOrder" min="1" max="12" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Metric Pill Value (e.g. 302)</label>
              <input type="text" id="fieldMetricVal" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Metric Pill Label (e.g. Athletes)</label>
              <input type="text" id="fieldMetricLbl" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
          </div>
        </div>

        <!-- Section 2: Core Messaging -->
        <div class="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
            Project Details & Tagline
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Display Title</label>
              <input type="text" id="fieldTitle" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="text-xs font-mono text-zinc-400">Card Tagline (&le; 110 characters)</label>
                <span id="taglineCount" class="text-[10px] font-mono text-zinc-500">0/110</span>
              </div>
              <input type="text" id="fieldTagline" maxlength="110" oninput="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Detailed Summary</label>
              <textarea id="fieldSummary" rows="3" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white leading-relaxed"></textarea>
            </div>
          </div>
        </div>

        <!-- Section 3: Open-Source Governance & Security -->
        <div class="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Open-Source & Institutional Confidentiality
            </h3>
            <span class="text-[11px] font-mono text-zinc-400">Zero-Leak Guard Active</span>
          </div>

          <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div class="space-y-0.5">
              <div class="text-xs font-medium text-white">Show Public GitHub Button</div>
              <div class="text-[11px] text-zinc-500">When OFF, displays "🏢 Institutional Software · Code Private (ZPPSU Governance)"</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="fieldShowGithub" onchange="updateActiveProject()" class="sr-only peer">
              <div class="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">GitHub Repository URL</label>
              <input type="url" id="fieldGithubUrl" placeholder="https://github.com/..." onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Live Cloud Deployment URL</label>
              <input type="url" id="fieldLiveUrl" placeholder="https://..." onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
          </div>
        </div>

        <!-- Section 4: Safe Walkthroughs & Media -->
        <div class="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 class="text-sm font-semibold text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            Media Showcase & Guided Walkthroughs
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Demo Video Link (Loom, YouTube, or MP4)</label>
              <input type="url" id="fieldVideoUrl" placeholder="https://www.youtube.com/watch?v=... or Loom URL" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white">
            </div>
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Safe Walkthrough Notes (No Passwords / Safe Instructions)</label>
              <textarea id="fieldWalkthrough" rows="3" placeholder="e.g. Guest Inspection Mode: Evaluator sandbox enabled in app..." onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white leading-relaxed"></textarea>
            </div>
            <div>
              <label class="block text-xs font-mono text-zinc-400 mb-1">Local Network Command</label>
              <input type="text" id="fieldRunCmd" placeholder="npm start or python server.py" onchange="updateActiveProject()" class="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono">
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>

  <script>
    let projects = [];
    let activeIndex = -1;
    let currentFilter = 'all';

    async function loadData() {
      try {
        const res = await fetch('/api/projects');
        const json = await res.json();
        projects = json.data;
        document.getElementById('projectCountBadge').innerText = projects.length;
        renderProjectList();
        if (projects.length > 0) {
          selectProject(0);
        }
      } catch (err) {
        showToast('Failed to load projects: ' + err.message, true);
      }
    }

    function setFilter(f) {
      currentFilter = f;
      renderProjectList();
    }

    function renderProjectList() {
      const container = document.getElementById('projectList');
      const query = (document.getElementById('searchInput').value || '').toLowerCase();
      
      const filtered = projects.map((p, idx) => ({ p, idx })).filter(({ p }) => {
        if (query && !p.title.toLowerCase().includes(query) && !p.id.toLowerCase().includes(query)) {
          return false;
        }
        if (currentFilter === 'flagship') return p.featured;
        if (currentFilter === 'live') return p.status === 'live';
        if (currentFilter === 'lan') return p.status === 'offline-lan';
        return true;
      });

      container.innerHTML = filtered.map(({ p, idx }) => {
        const isSelected = idx === activeIndex;
        return \`
          <button 
            onclick="selectProject(\${idx})" 
            class="w-full text-left p-3 rounded-xl transition flex flex-col gap-1 \${
              isSelected 
                ? 'bg-emerald-950/40 border border-emerald-700/60 text-white' 
                : 'hover:bg-zinc-900 border border-transparent text-zinc-300'
            }"
          >
            <div class="flex items-center justify-between text-[10px] font-mono">
              <span class="truncate uppercase text-zinc-400">\${p.domain}</span>
              \${p.featured ? '<span class="text-emerald-400 font-bold">★ FLAGSHIP</span>' : ''}
            </div>
            <div class="text-xs font-semibold truncate leading-tight">\${p.title}</div>
            <div class="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span>\${p.status}</span>
              <span>•</span>
              <span>\${p.showGithub ? 'GitHub On' : 'Private'}</span>
            </div>
          </button>
        \`;
      }).join('');
    }

    function selectProject(idx) {
      activeIndex = idx;
      const p = projects[idx];
      renderProjectList();

      document.getElementById('editorPlaceholder').classList.add('hidden');
      document.getElementById('editorContent').classList.remove('hidden');

      // Populate fields
      document.getElementById('badgeDomain').innerText = p.domainLabel || p.domain;
      document.getElementById('badgeStatus').innerText = p.statusLabel || p.status;
      document.getElementById('editTitleHeader').innerText = p.title;
      document.getElementById('editIdSub').innerText = p.id;

      document.getElementById('fieldFeatured').checked = !!p.featured;
      document.getElementById('fieldBentoOrder').value = p.bentoOrder || '';
      document.getElementById('fieldMetricVal').value = p.highlightMetric?.value || '';
      document.getElementById('fieldMetricLbl').value = p.highlightMetric?.label || '';

      document.getElementById('fieldTitle').value = p.title || '';
      document.getElementById('fieldTagline').value = p.tagline || '';
      document.getElementById('taglineCount').innerText = (p.tagline || '').length + '/110';
      document.getElementById('fieldSummary').value = p.summary || '';

      document.getElementById('fieldShowGithub').checked = !!p.showGithub;
      document.getElementById('fieldGithubUrl').value = p.githubUrl || p.links?.repo || '';
      document.getElementById('fieldLiveUrl').value = p.links?.live || '';

      document.getElementById('fieldVideoUrl').value = p.demoVideoUrl || '';
      document.getElementById('fieldWalkthrough').value = p.walkthroughNotes || p.accessNotes || '';
      document.getElementById('fieldRunCmd').value = p.runCommand || '';
    }

    function updateActiveProject() {
      if (activeIndex < 0 || !projects[activeIndex]) return;
      const p = projects[activeIndex];

      p.featured = document.getElementById('fieldFeatured').checked;
      const bOrder = parseInt(document.getElementById('fieldBentoOrder').value, 10);
      p.bentoOrder = isNaN(bOrder) ? null : bOrder;

      const mVal = document.getElementById('fieldMetricVal').value.trim();
      const mLbl = document.getElementById('fieldMetricLbl').value.trim();
      if (mVal && mLbl) {
        p.highlightMetric = { value: mVal, label: mLbl };
      } else {
        p.highlightMetric = null;
      }

      p.title = document.getElementById('fieldTitle').value;
      p.tagline = document.getElementById('fieldTagline').value;
      document.getElementById('taglineCount').innerText = p.tagline.length + '/110';
      p.summary = document.getElementById('fieldSummary').value;

      p.showGithub = document.getElementById('fieldShowGithub').checked;
      p.githubUrl = document.getElementById('fieldGithubUrl').value.trim() || null;
      if (!p.links) p.links = {};
      p.links.live = document.getElementById('fieldLiveUrl').value.trim() || null;
      p.links.repo = p.githubUrl;

      p.demoVideoUrl = document.getElementById('fieldVideoUrl').value.trim() || null;
      p.walkthroughNotes = document.getElementById('fieldWalkthrough').value.trim() || null;
      p.accessNotes = p.walkthroughNotes;
      p.runCommand = document.getElementById('fieldRunCmd').value.trim() || null;

      document.getElementById('editTitleHeader').innerText = p.title;
      renderProjectList();
    }

    async function saveAllChanges() {
      const btn = document.getElementById('saveBtn');
      btn.innerText = 'Saving...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: projects })
        });
        const json = await res.json();
        if (json.success) {
          showToast('Changes saved to disk! Backup created.', false);
        } else {
          showToast('Save failed: ' + json.error, true);
        }
      } catch (err) {
        showToast('Network error saving changes: ' + err.message, true);
      } finally {
        btn.innerText = 'Save Changes to Disk';
        btn.disabled = false;
      }
    }

    function showToast(msg, isError) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-mono shadow-2xl flex items-center gap-2 ' +
        (isError ? 'bg-rose-950/90 border-rose-700 text-rose-200' : 'bg-emerald-950/90 border-emerald-700 text-emerald-200');
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    loadData();
  </script>
</body>
</html>`;
}
