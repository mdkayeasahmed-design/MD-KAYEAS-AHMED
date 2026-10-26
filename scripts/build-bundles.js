import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

function addFolderToZip(zip, folderPath, rootInZip = '') {
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    if (item === '.git' || item === 'node_modules' || item === '.gradle' || item === 'build') continue;
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);
    const zipPath = rootInZip ? `${rootInZip}/${item}` : item;
    if (stat.isDirectory()) {
      const subZip = zip.folder(item);
      addFolderToZip(subZip, fullPath, '');
    } else {
      zip.file(item, fs.readFileSync(fullPath));
    }
  }
}

async function buildZips() {
  const publicDownloadsDir = path.resolve('./public/downloads');
  if (!fs.existsSync(publicDownloadsDir)) {
    fs.mkdirSync(publicDownloadsDir, { recursive: true });
  }

  // 1. Android Project Zip
  console.log('Packaging Android project...');
  const androidZip = new JSZip();
  const androidRootFolder = androidZip.folder('hpbd-operations-android');
  addFolderToZip(androidRootFolder, path.resolve('./hpbd-android-app'));
  const androidZipBuffer = await androidZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(publicDownloadsDir, 'hpbd-operations-android.zip'), androidZipBuffer);
  console.log('Created public/downloads/hpbd-operations-android.zip');

  // 2. WordPress Bridge Plugin Zip
  console.log('Packaging WordPress bridge plugin...');
  const bridgeZip = new JSZip();
  const bridgeFolder = bridgeZip.folder('hpbd-mobile-bridge');
  addFolderToZip(bridgeFolder, path.resolve('./hpbd-mobile-bridge'));
  const bridgeZipBuffer = await bridgeZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(publicDownloadsDir, 'hpbd-mobile-bridge.zip'), bridgeZipBuffer);
  console.log('Created public/downloads/hpbd-mobile-bridge.zip');
}

buildZips().catch(console.error);
