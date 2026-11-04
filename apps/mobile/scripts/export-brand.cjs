/* Asset authoring only. Supply Sharp externally; no app dependency is required. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SUNDAYSEEDS_SHARP_MODULE || 'sharp');
const destination = path.resolve(__dirname, '../assets/brand');
const master = fs.readFileSync(path.join(destination, 'logo.svg'), 'utf8');
const shape = master.match(/<path\b[^>]*\/>/g)?.join('');
if (!shape) throw new Error('Missing master mark');
const forest = '#173E32';
const ivory = '#F7F3E8';
const recolor = color => shape.replaceAll(forest, color);
const svg = (body, viewBox = '0 0 1024 1024') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="${viewBox}">${body}</svg>`;
const adaptive = color =>
  `<g transform="translate(512 512) scale(0.76) translate(-512 -512)">${recolor(color)}</g>`;

async function png(name, source, size, opaque = false) {
  let renderer = sharp(Buffer.from(source)).resize(size, size);
  if (opaque) renderer = renderer.removeAlpha();
  const result = await renderer.png().toFile(path.join(destination, name));
  console.log(`${name}: ${result.width}x${result.height}, ${result.channels} channels`);
}

async function main() {
  const icon = svg(`<rect width="1024" height="1024" fill="${forest}"/>${recolor(ivory)}`);
  const foreground = svg(adaptive(ivory));
  const monochrome = svg(adaptive('#000000'));
  fs.writeFileSync(path.join(destination, 'app-icon.svg'), icon);
  fs.writeFileSync(path.join(destination, 'adaptive-foreground.svg'), foreground);
  fs.writeFileSync(path.join(destination, 'adaptive-monochrome.svg'), monochrome);
  await png('app-icon.png', icon, 1024, true);
  await png('adaptive-foreground.png', foreground, 1024);
  await png('adaptive-monochrome.png', monochrome, 1024);
  await png('favicon.png', icon, 64, true);
  // Tight mark exports for the splash/wordmark, with the same actual artwork.
  await png('logo.png', svg(recolor(forest), '112 80 800 800'), 704);
  await png('logo-reversed.png', svg(recolor(ivory), '112 80 800 800'), 704);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
