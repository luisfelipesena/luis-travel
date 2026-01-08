#!/usr/bin/env node
/**
 * Generate logo assets from SVG files
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

async function svgToPng(svgPath, outputPath, size) {
  const svg = readFileSync(svgPath);
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`Created: ${outputPath.split('/').pop()} (${size}x${size})`);
}

async function createFavicon(svgPath, outputPath) {
  const svg = readFileSync(svgPath);
  // Create 32x32 PNG for favicon (sharp doesn't do ICO, but modern browsers accept PNG)
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(outputPath.replace('.ico', '.png'));

  // For ICO, we'll create a 32x32 version
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svg).resize(16, 16).png().toBuffer();

  // Write as PNG since ICO requires special handling
  writeFileSync(outputPath.replace('.ico', '-32.png'), png32);
  writeFileSync(outputPath.replace('.ico', '-16.png'), png16);
  console.log(`Created: favicon PNGs (16x16, 32x32)`);
}

async function main() {
  const iconSvg = join(PUBLIC_DIR, 'luis-travel-icon.svg');
  const logoSvg = join(PUBLIC_DIR, 'luis-travel-logo.svg');

  try {
    // Generate PWA icons
    await svgToPng(iconSvg, join(PUBLIC_DIR, 'logo192.png'), 192);
    await svgToPng(iconSvg, join(PUBLIC_DIR, 'logo512.png'), 512);

    // Generate icon PNG for inline use
    await svgToPng(iconSvg, join(PUBLIC_DIR, 'luis-travel-icon.png'), 200);

    // Generate favicon
    await createFavicon(iconSvg, join(PUBLIC_DIR, 'favicon.ico'));

    // Generate logo PNG
    const logoSvgContent = readFileSync(logoSvg);
    await sharp(logoSvgContent)
      .resize(400, 120)
      .png()
      .toFile(join(PUBLIC_DIR, 'luis-travel-logo.png'));
    console.log(`Created: luis-travel-logo.png (400x120)`);

    console.log('\nAll logo assets generated successfully!');
  } catch (error) {
    console.error('Error generating logos:', error.message);
    process.exit(1);
  }
}

main();
