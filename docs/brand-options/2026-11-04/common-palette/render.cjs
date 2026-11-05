/* Color-role artwork only; this is not an app screenshot or runtime check. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const cache = path.join(root, '.artifacts/brand-font-cache');
fs.mkdirSync(cache, { recursive: true });
const config = path.join(cache, 'fonts.conf');
fs.writeFileSync(config, `<fontconfig><dir>${path.join(root, 'apps/mobile/node_modules/@expo-google-fonts/poppins')}</dir><cachedir>${cache}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = config;
const sharp = require(process.env.SUNDAYSEEDS_SHARP_MODULE || 'sharp');
const tokens = fs.readFileSync(path.join(root, 'apps/mobile/src/shared/theme/tokens.ts'), 'utf8');
const color = name => tokens.match(new RegExp(`${name}: '(#[A-Fa-f0-9]{6})'`))[1];
const forest = color('forest'), ivory = color('onForest'), canvas = color('canvas');
const surface = color('surface'), strong = color('surfaceStrong');
const master = fs.readFileSync(path.join(root, 'apps/mobile/assets/brand/logo.svg'), 'utf8');
const mark = master.match(/<path\b[^>]*\/>/g).join('').replaceAll('#173E32', ivory);
const roles = [
  [forest, 'Forest', 'Actions &amp; navigation'],
  [canvas, 'Cream', 'Page backgrounds'],
  [surface, 'Sage', 'Learning surfaces'],
  [strong, 'Deep sage', 'Selected states'],
];
const swatches = roles.map(([fill, label, use], index) => {
  const x = 48 + index * 248;
  return `<rect x="${x}" y="320" width="224" height="132" rx="12" fill="${fill}" stroke="#D0D8C8"/>
  <text x="${x}" y="486" font-size="20" font-weight="600">${label}</text>
  <text x="${x}" y="512" font-size="13">${use}</text>
  <text x="${x}" y="538" font-size="12" fill="#647261">${fill}</text>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1088" height="736" viewBox="0 0 1088 736">
<rect width="1088" height="736" fill="${canvas}"/>
<g font-family="Poppins, Arial, sans-serif" fill="${forest}">
<text x="48" y="50" font-size="12" letter-spacing="2.6">SUNDAYSEEDS / SHARED COLOR ROLES</text>
<rect x="48" y="84" width="280" height="188" rx="14" fill="${forest}"/>
<svg x="133" y="112" width="110" height="138" viewBox="192 192 640 640">${mark}</svg>
<text x="376" y="139" font-size="38" font-weight="600">Forest-led.</text>
<text x="376" y="181" font-size="21">Warm pages. Quiet learning surfaces.</text>
<text x="376" y="224" font-size="14" fill="#647261">The same seed, controls and color roles across the journey.</text>
${swatches}
<path d="M48 574H1040" stroke="#D0D8C8"/>
<rect x="48" y="603" width="52" height="28" rx="6" fill="#EFEAF4" stroke="#D0D8C8"/>
<rect x="110" y="603" width="52" height="28" rx="6" fill="#F7F0D7" stroke="#D0D8C8"/>
<rect x="172" y="603" width="52" height="28" rx="6" fill="#F5EBDF" stroke="#D0D8C8"/>
<text x="48" y="661" font-size="14">Pastels: small topic and achievement highlights.</text>
<rect x="760" y="601" width="280" height="54" rx="9" fill="${forest}"/>
<text x="900" y="635" text-anchor="middle" fill="${ivory}" font-size="17" font-weight="600">Continue →</text>
<text x="48" y="707" font-size="11" fill="#647261">Color-role study from implemented tokens · not an app capture</text>
</g></svg>`;
fs.writeFileSync(path.join(__dirname, 'palette.svg'), svg);
sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'palette.png')).catch(error => {
  console.error(error); process.exitCode = 1;
});
