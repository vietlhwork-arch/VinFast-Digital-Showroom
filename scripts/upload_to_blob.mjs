import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env or .env.local if token not in process.env
let token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  for (const envFile of ['.env', '.env.local', 'frontend/.env', 'frontend/.env.local']) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/BLOB_READ_WRITE_TOKEN=["']?([^"'\r\n]+)/);
      if (match) {
        token = match[1];
        console.log(`ℹ️ Đã tự động đọc BLOB_READ_WRITE_TOKEN từ file ${envFile}`);
        break;
      }
    }
  }
}

if (!token) {
  console.error('\n❌ ERROR: Thiếu BLOB_READ_WRITE_TOKEN!');
  console.log('\nHướng dẫn chạy lệnh:');
  console.log('1. Vào Vercel Dashboard -> Storage -> p-101-blob -> Settings -> Access Tokens');
  console.log('2. Copy mã Token (bắt đầu bằng vercel_blob_rw_...)');
  console.log('3. Chạy lệnh Terminal:');
  console.log('   $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..." ; node scripts/upload_to_blob.mjs\n');
  process.exit(1);
}

// Function to collect all files recursively from target folders
function scanFolder(folderRelPath, fileList = []) {
  const fullPath = path.join(rootDir, folderRelPath);
  if (!fs.existsSync(fullPath)) return fileList;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const relEntryPath = path.join(folderRelPath, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      scanFolder(relEntryPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.mp4'].includes(ext)) {
        // Encode URI path to handle Vietnamese characters safely in URL
        const blobPath = relEntryPath
          .replace(/^frontend\/public\//, '')
          .replace(/^frontend\//, '')
          .replace(/^static\//, '');
        fileList.push({
          localPath: relEntryPath,
          blobPath: blobPath,
        });
      }
    }
  }
  return fileList;
}

const targetFolders = [
  'frontend/public/VINpng',
  'static/uploads',
];

const filesToUpload = [];
targetFolders.forEach((folder) => scanFolder(folder, filesToUpload));

async function uploadFile(localRelPath, blobPath) {
  const fullPath = path.join(rootDir, localRelPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
  const encodedBlobPath = encodeURI(blobPath);
  console.log(`⏳ Đang tải lên Vercel Blob: ${blobPath} (${sizeMB} MB)...`);

  try {
    const response = await fetch(`https://blob.vercel-storage.com/${encodedBlobPath}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'x-api-version': '7',
        'content-type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log(`✅ Tải lên thành công! URL: ${data.url}\n`);
    return { localPath: localRelPath, blobPath, url: data.url };
  } catch (err) {
    console.error(`❌ Lỗi khi tải lên ${blobPath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log(`🚀 Bắt đầu quét & tải toàn bộ ${filesToUpload.length} file ảnh/video local lên Vercel Blob (p-101-blob)...\n`);
  const results = [];

  for (const item of filesToUpload) {
    const res = await uploadFile(item.localPath, item.blobPath);
    if (res) results.push(res);
  }

  console.log('\n🎉 HOÀN THÀNH TẢI LÊN TOÀN BỘ ẢNH LOCAL!');
  console.log('==================================================');
  console.log('Danh sách URL Vercel Blob tương ứng với file local của bạn:');
  results.forEach((r) => {
    console.log(`• ${r.localPath} => ${r.url}`);
  });
  console.log('==================================================');
}

main();
