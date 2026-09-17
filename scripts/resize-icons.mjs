import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processIcons() {
  const sourcePath = 'assets/adaptive_icon.png';
  if (!fs.existsSync('assets/adaptive_icon.backup.png')) {
    fs.copyFileSync(sourcePath, 'assets/adaptive_icon.backup.png');
    fs.copyFileSync('assets/icon.png', 'assets/icon.backup.png');
  }

  // 1. Trim the source logo to get the exact bounding box of the logo artwork
  const trimmedBuffer = await sharp('assets/adaptive_icon.backup.png').trim().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log('Original trimmed dimensions:', trimmedMeta.width, 'x', trimmedMeta.height);

  // Target size for ~30% reduction:
  // Original height was 691. With ~30% reduction: 691 * 0.7 = ~484px.
  const targetDimension = 480;
  const scale = targetDimension / Math.max(trimmedMeta.width, trimmedMeta.height);
  const newWidth = Math.round(trimmedMeta.width * scale);
  const newHeight = Math.round(trimmedMeta.height * scale);

  console.log(`New logo dimensions: ${newWidth} x ${newHeight} (scaled by ${scale.toFixed(2)})`);

  const resizedLogo = await sharp(trimmedBuffer)
    .resize(newWidth, newHeight, { fit: 'inside' })
    .toBuffer();

  // Create 1000x1000 transparent canvas with resized logo centered for adaptive_icon.png
  const adaptiveIcon1000 = await sharp({
    create: {
      width: 1000,
      height: 1000,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: resizedLogo, gravity: 'center' }])
  .png()
  .toBuffer();

  fs.writeFileSync('assets/adaptive_icon.png', adaptiveIcon1000);

  // Also create assets/icon.png (with black background)
  const icon1000 = await sharp({
    create: {
      width: 1000,
      height: 1000,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
  .composite([{ input: resizedLogo, gravity: 'center' }])
  .png()
  .toBuffer();

  fs.writeFileSync('assets/icon.png', icon1000);
  console.log('Updated assets/adaptive_icon.png and assets/icon.png successfully!');

  // Densities for Android
  const densities = [
    { name: 'mdpi', foreground: 108, icon: 48 },
    { name: 'hdpi', foreground: 162, icon: 72 },
    { name: 'xhdpi', foreground: 216, icon: 96 },
    { name: 'xxhdpi', foreground: 324, icon: 144 },
    { name: 'xxxhdpi', foreground: 432, icon: 192 }
  ];

  for (const d of densities) {
    const dir = path.join('android/app/src/main/res', 'mipmap-' + d.name);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher_foreground.webp (transparent background)
    // In adaptive icon (108dp), safe zone is 66dp (~61%).
    // 48% logo gives the perfect safe-zone margin
    const fgLogoSize = Math.round(d.foreground * 0.48);
    const fgResized = await sharp(trimmedBuffer).resize({ width: fgLogoSize, height: fgLogoSize, fit: 'inside' }).toBuffer();
    
    await sharp({
      create: {
        width: d.foreground,
        height: d.foreground,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: fgResized, gravity: 'center' }])
    .webp({ lossless: true })
    .toFile(path.join(dir, 'ic_launcher_foreground.webp'));

    // ic_launcher.webp (black background, square icon)
    const iconLogoSize = Math.round(d.icon * 0.65);
    const iconResized = await sharp(trimmedBuffer).resize({ width: iconLogoSize, height: iconLogoSize, fit: 'inside' }).toBuffer();

    await sharp({
      create: {
        width: d.icon,
        height: d.icon,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .composite([{ input: iconResized, gravity: 'center' }])
    .webp({ lossless: true })
    .toFile(path.join(dir, 'ic_launcher.webp'));

    // ic_launcher_round.webp (circle icon)
    const radius = d.icon / 2;
    const circleSvg = Buffer.from(
      `<svg width="${d.icon}" height="${d.icon}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#000000"/></svg>`
    );
    
    await sharp(circleSvg)
      .composite([{ input: iconResized, gravity: 'center' }])
      .webp({ lossless: true })
      .toFile(path.join(dir, 'ic_launcher_round.webp'));

    console.log(`Updated mipmap-${d.name} icons.`);
  }

  console.log('All icons generated successfully with 30% reduction!');
}

processIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
