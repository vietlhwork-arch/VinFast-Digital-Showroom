import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('⏳ Đang saothép ảnh local sang frontend/public...');

// 1. Copy static/uploads -> frontend/public/static/uploads
const srcUploads = path.join(rootDir, 'static', 'uploads');
const dstUploads = path.join(rootDir, 'frontend', 'public', 'static', 'uploads');
if (fs.existsSync(srcUploads)) {
  copyRecursiveSync(srcUploads, dstUploads);
  console.log('✅ Đã sao chép static/uploads sang frontend/public/static/uploads');
}

// 2. Copy frontend/VINpng -> frontend/public/VINpng
const srcVinPng = path.join(rootDir, 'frontend', 'VINpng');
const dstVinPng = path.join(rootDir, 'frontend', 'public', 'VINpng');
if (fs.existsSync(srcVinPng)) {
  copyRecursiveSync(srcVinPng, dstVinPng);
  console.log('✅ Đã sao chép frontend/VINpng sang frontend/public/VINpng');
}

console.log('🎉 Hoàn tất sao chép toàn bộ ảnh local vào public!');
