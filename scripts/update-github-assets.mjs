import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const token = process.env.GITHUB_TOKEN || '';
const repo = 'B7ByteMe/valorafilm';
const releaseId = '390725541';

async function run() {
  console.log('Checking current assets in release...');
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/${releaseId}/assets`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ValoraFilm-Deploy'
    }
  });

  const assets = await res.json();
  console.log(`Found ${assets.length} existing assets.`);

  for (const asset of assets) {
    console.log(`Deleting old asset ${asset.name} (id: ${asset.id})...`);
    await fetch(`https://api.github.com/repos/${repo}/releases/assets/${asset.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ValoraFilm-Deploy'
      }
    });
    console.log(`Deleted ${asset.name}.`);
  }

  const apkDir = 'D:/AirFlix-main/android/app/build/outputs/apk/release';
  const files = [
    'ValoraFilm-arm64-v8a-v1.0.0.apk'
  ];

  for (const fileName of files) {
    const filePath = path.join(apkDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const stats = fs.statSync(filePath);
    console.log(`Uploading ${fileName} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)...`);

    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${releaseId}/assets?name=${fileName}`;
    const curlCmd = `curl.exe -X POST -H "Authorization: Bearer ${token}" -H "Content-Type: application/vnd.android.package-archive" --data-binary "@${filePath}" "${uploadUrl}"`;
    
    execSync(curlCmd, { stdio: 'inherit' });
    console.log(`Successfully uploaded ${fileName}`);
  }

  console.log('All APKs successfully updated on GitHub Releases!');
}

run().catch(console.error);
