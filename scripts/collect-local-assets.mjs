import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = "C:\\Users\\ACER\\OneDrive\\Desktop\\ZPPSU A.Y. 2026-2027\\My Project";
const targetPublic = path.resolve('public');

console.log('Collecting on-disk assets from:', sourceRoot);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const copyPlan = [
  {
    srcDir: path.join(sourceRoot, 'LocalClassroom', 'public', 'images', 'slides'),
    destDir: path.join(targetPublic, 'projects', 'localclassroom'),
    filter: (file) => file.endsWith('.png') || file.endsWith('.jpg')
  },
  {
    srcDir: path.join(sourceRoot, 'Local Palaro Chess Tournament Management System'),
    destDir: path.join(targetPublic, 'projects', 'local-palaro-chess-tournament-management-system'),
    filter: (file) => file.endsWith('.png') || file.endsWith('.jpg')
  },
  {
    srcDir: path.join(sourceRoot, 'palaro submission of music', 'assets'),
    destDir: path.join(targetPublic, 'projects', 'palaro-submission-of-music'),
    filter: (file) => file.endsWith('.png') || file.endsWith('.jpg')
  },
  {
    srcFile: path.join(sourceRoot, 'CPT Palaro Management System', 'public', 'zppsu-header-logo.png'),
    destFile: path.join(targetPublic, 'brand', 'zppsu-logo.png')
  },
  {
    srcFile: path.join(sourceRoot, 'Board Exam Reviewer Web App', 'public', 'logo.jpg'),
    destFile: path.join(targetPublic, 'projects', 'board-exam-reviewer-gabay', 'logo.jpg')
  },
  {
    srcFile: path.join(sourceRoot, 'Screening_App', 'static', 'img', 'main_logo.png'),
    destFile: path.join(targetPublic, 'projects', 'screening-app', 'logo.png')
  },
  {
    srcFile: path.join(sourceRoot, 'Enrollment_App', 'static', 'img', 'main_logo.png'),
    destFile: path.join(targetPublic, 'projects', 'enrollment-app', 'logo.png')
  }
];

let copiedCount = 0;

for (const item of copyPlan) {
  if (item.srcFile && item.destFile) {
    if (fs.existsSync(item.srcFile)) {
      ensureDir(path.dirname(item.destFile));
      fs.copyFileSync(item.srcFile, item.destFile);
      copiedCount++;
      console.log(`Copied: ${path.basename(item.srcFile)} -> ${item.destFile}`);
    }
  } else if (item.srcDir && item.destDir) {
    if (fs.existsSync(item.srcDir)) {
      ensureDir(item.destDir);
      const files = fs.readdirSync(item.srcDir);
      for (const file of files) {
        if (!item.filter || item.filter(file)) {
          const sPath = path.join(item.srcDir, file);
          const stat = fs.statSync(sPath);
          if (stat.isFile() && stat.size <= 5 * 1024 * 1024) {
            fs.copyFileSync(sPath, path.join(item.destDir, file));
            copiedCount++;
          }
        }
      }
      console.log(`Copied directory assets from: ${path.basename(item.srcDir)}`);
    }
  }
}

console.log(`Successfully collected ${copiedCount} assets into public/`);
