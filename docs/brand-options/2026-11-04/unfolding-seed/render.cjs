/* Identity artwork authoring only; supply Sharp externally. No app dependency. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const fontDirectory = path.join(root, 'apps/mobile/node_modules/@expo-google-fonts/poppins');
const fontCache = path.join(root, '.artifacts/brand-font-cache');
fs.mkdirSync(fontCache, { recursive: true });
const fontConfig = path.join(fontCache, 'fonts.conf');
fs.writeFileSync(fontConfig, `<fontconfig><dir>${fontDirectory}</dir><cachedir>${fontCache}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = fontConfig;
const sharp = require(process.env.SUNDAYSEEDS_SHARP_MODULE || 'sharp');
const master = fs.readFileSync(path.join(__dirname, 'mark.svg'), 'utf8');
const paths = master.match(/<path\b[^>]*\/>/g).join('');
const forest = '#173E32', ivory = '#F7F3E8', paper = '#FCFAFF';
const mark = (x, y, width, height, color = forest, crop = '240 200 540 640') =>
  `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${crop}">${paths.replaceAll(forest, color)}</svg>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><title>SundaySeeds unfolding seed — static icon proposal</title><rect width="1024" height="1024" fill="${forest}"/><g transform="translate(-28 -20) scale(1.055)">${paths.replaceAll(forest, ivory)}</g></svg>`;
const iconAt = (x, y, size) => icon.replace('width="1024" height="1024"', `x="${x}" y="${y}" width="${size}" height="${size}"`);
const mini = iconAt;
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840">
<rect width="1200" height="840" fill="${paper}"/>
<g font-family="Poppins, Avenir Next, Arial, sans-serif" fill="${forest}">
<text x="64" y="55" font-size="12" letter-spacing="2.6">SUNDAYSEEDS / IDENTITY STUDY 01</text>
<text x="64" y="100" font-size="29" font-weight="600">The unfolding seed</text>
<path d="M64 125H1136" stroke="#E3DFE9"/>
${mark(230, 162, 360, 390)}
<text x="410" y="644" text-anchor="middle" font-size="15" fill="#6B726B">Grow in faith. One little step.</text>
<text x="954" y="183" text-anchor="middle" font-size="11" letter-spacing="2" fill="#6B726B">STATIC APP ICON</text>
<defs><clipPath id="icon-mask"><rect x="834" y="210" width="240" height="240" rx="54"/></clipPath></defs>
<g clip-path="url(#icon-mask)">${iconAt(834,210,240)}</g>
<text x="954" y="480" text-anchor="middle" font-size="11" fill="#6B726B">Illustrative mask · static symbol</text>
${mini(851, 551, 24)}${mini(914, 543, 40)}${mini(987, 531, 64)}
<text x="863" y="610" text-anchor="middle" font-size="11" fill="#6B726B">24px</text>
<text x="934" y="610" text-anchor="middle" font-size="11" fill="#6B726B">40px</text>
<text x="1019" y="610" text-anchor="middle" font-size="11" fill="#6B726B">64px</text>
<path d="M64 708H1136" stroke="#E3DFE9"/>
<text x="64" y="752" font-size="17">A seed opens. Two leaves unfurl. The mark comes to rest.</text>
<text x="64" y="786" font-size="12" fill="#6B726B">Finished-shape proposal · motion and app integration follow visual review</text>
</g></svg>`;

async function main() {
  fs.writeFileSync(path.join(__dirname, 'icon-concept.svg'), icon);
  fs.writeFileSync(path.join(__dirname, 'board.svg'), board);
  await sharp(Buffer.from(master)).resize(512,512).flatten({background:paper}).png().toFile(path.join(__dirname,'mark-preview.png'));
  await sharp(Buffer.from(icon)).resize(512,512).removeAlpha().png().toFile(path.join(__dirname,'icon-concept.png'));
  const fontfile = path.join(root,'apps/mobile/node_modules/@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf');
  const wordmark = await sharp({text:{text:`<span foreground="${forest}">SundaySeeds</span>`,font:'Poppins Bold 46',fontfile,rgba:true,dpi:72}}).png().toBuffer({resolveWithObject:true});
  await sharp(Buffer.from(board)).composite([{input:wordmark.data,left:Math.round(410-wordmark.info.width/2),top:574}]).png().toFile(path.join(__dirname,'board.png'));
}
main().catch(error => { console.error(error); process.exitCode=1; });
