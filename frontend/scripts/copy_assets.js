import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(frontendDir, '..');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('🔄 Executing prebuild asset sync...');

// 1. Copy root/static/uploads or frontend/static/uploads -> frontend/public/static/uploads
const srcUploadsRoot = path.join(rootDir, 'static', 'uploads');
const srcUploadsFront = path.join(frontendDir, 'static', 'uploads');
const dstUploads = path.join(frontendDir, 'public', 'static', 'uploads');

if (fs.existsSync(srcUploadsRoot)) {
  copyRecursiveSync(srcUploadsRoot, dstUploads);
  console.log('✅ Synced root static/uploads to frontend/public/static/uploads');
} else if (fs.existsSync(srcUploadsFront)) {
  copyRecursiveSync(srcUploadsFront, dstUploads);
  console.log('✅ Synced frontend static/uploads to frontend/public/static/uploads');
}

// 2. Copy frontend/VINpng -> frontend/public/VINpng
const srcVinPng = path.join(frontendDir, 'VINpng');
if (fs.existsSync(srcVinPng)) {
  copyRecursiveSync(srcVinPng, path.join(frontendDir, 'public', 'VINpng'));
}
console.log('✅ Synced VINpng to frontend/public/VINpng');
