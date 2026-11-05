const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const outDir = path.join(__dirname, '..', 'public');

async function generate() {
  await sharp(svgPath).resize(192, 192).png().toFile(path.join(outDir, 'icon-192.png'));
  await sharp(svgPath).resize(512, 512).png().toFile(path.join(outDir, 'icon-512.png'));
  await sharp(svgPath).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('PWA icons generated for HDM Bridge');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});