/* Static design-reference artwork. This is not a captured app screen. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..'), cache = path.join(root, '.artifacts/system-font-cache');
fs.mkdirSync(cache, { recursive: true });
const config = path.join(cache, 'fonts.conf');
fs.writeFileSync(config, `<fontconfig><dir>${path.join(root, 'apps/mobile/node_modules/@expo-google-fonts/poppins')}</dir><dir>${path.join(root, 'apps/mobile/assets/fonts')}</dir><cachedir>${cache}</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = config;
const sharp = require(process.env.SUNDAYSEEDS_SHARP_MODULE || 'sharp');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens.json'), 'utf8'));
const c = data.brandColors, a = data.accentColors;
const paths = fs.readFileSync(path.join(root, 'apps/mobile/assets/brand/logo.svg'), 'utf8').match(/<path\b[^>]*\/>/g).join('').replaceAll('#173E32', c.onForest);
const swatches = [['Forest',c.forest],['Cream',c.canvas],['Sage',c.surface],['Wheat',a.wheat],['Peach',a.peach],['Rose',a.rose]].map(([name,color],i)=>`<rect x="${48+i*183}" y="250" width="159" height="76" rx="9" fill="${color}" stroke="${data.colors.line}"/><text x="${48+i*183}" y="352" font-size="14" font-weight="600">${name}</text><text x="${48+i*183}" y="374" font-size="12" fill="${c.muted}">${color}</text>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1040" viewBox="0 0 1200 1040">
<rect width="1200" height="1040" fill="${c.canvas}"/>
<g font-family="Poppins, sans-serif" fill="${c.forest}">
<rect width="1200" height="202" fill="${c.forest}"/>
<svg x="46" y="36" width="105" height="136" viewBox="192 192 640 640">${paths}</svg>
<text x="182" y="67" font-size="12" letter-spacing="2.5" fill="${c.surfaceStrong}">SUNDAYSEEDS / DESIGN SYSTEM 1.0</text>
<text x="182" y="115" font-size="32" font-weight="600" fill="${c.onForest}">Rooted in faith. Designed with care.</text>
<text x="182" y="154" font-size="15" fill="${c.surfaceStrong}">A blended palette, clear interfaces and comfortable reading.</text>
${swatches}
<path d="M48 405H1152" stroke="${data.colors.line}"/>
<text x="48" y="445" font-size="20" font-weight="600">Interface role</text>
<text x="48" y="489" font-size="25" font-weight="600">Poppins · English UI</text>
<text x="48" y="525" font-size="18">Noto Sans Ethiopic · Amharic UI</text>
<text x="650" y="445" font-size="20" font-weight="600">Editorial reading role</text>
<text x="650" y="490" font-size="23" font-weight="600">Source Serif 4 · English</text>
<text x="650" y="530" font-size="18">Noto Serif Ethiopic · Amharic</text>
<text x="650" y="565" font-size="12" fill="${c.muted}">Family names here; live font specimens in the guide.</text>
<rect x="48" y="610" width="520" height="218" rx="12" fill="white" stroke="${data.colors.line}"/>
<text x="70" y="648" font-size="18" font-weight="600">Actions and selected sections</text>
<rect x="70" y="675" width="214" height="52" rx="9" fill="${c.forest}"/>
<text x="177" y="708" text-anchor="middle" font-size="15" font-weight="600" fill="${c.onForest}">Continue →</text>
<rect x="302" y="675" width="242" height="52" rx="9" fill="${c.surfaceStrong}" stroke="${c.forest}"/>
<text x="322" y="708" font-size="14">Selected language</text><circle cx="523" cy="701" r="5" fill="${c.forest}"/>
<text x="70" y="770" font-size="14">Forest is always the active-section color.</text>
<text x="70" y="797" font-size="12" fill="${c.muted}">Auth · onboarding · lessons · profile · Settings</text>
<rect x="600" y="610" width="552" height="218" rx="12" fill="${c.surface}" stroke="${data.colors.line}"/>
<text x="622" y="648" font-size="18" font-weight="600">Motion with purpose</text>
<text x="622" y="691" font-size="15">Press: 1dp / opacity .88</text>
<text x="622" y="723" font-size="15">Reveal: 180ms / up to 4dp</text>
<text x="622" y="755" font-size="15">Brand: 2.3 seconds / once</text>
<text x="622" y="797" font-size="12" fill="${c.muted}">Reduced motion, real state and bounded recovery.</text>
<path d="M48 872H1152" stroke="${data.colors.line}"/>
<text x="48" y="916" font-size="18" font-weight="600">One standard across the whole learner journey.</text>
<text x="48" y="951" font-size="14">Color roles · typography · component states · accessibility · motion · screen-by-screen acceptance</text>
<text x="48" y="1002" font-size="11" fill="${c.muted}">Design-reference artwork from system tokens and local font assets · not an app capture or native acceptance result</text>
</g></svg>`;
fs.writeFileSync(path.join(__dirname, 'overview.svg'), svg);
async function main() {
  // Register explicit local faces before SVG rasterization rather than trusting
  // a machine's installed-font fallback when creating the typography specimen.
  for (const [font, file, text] of [
    ['Poppins 15', 'node_modules/@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf', 'Ag'],
    ['Poppins SemiBold 15', 'node_modules/@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf', 'Ag'],
    ['Poppins Bold 15', 'node_modules/@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf', 'Ag'],
    ['Source Serif 4 25', 'assets/fonts/SourceSerif4-Regular.ttf', 'Ag'],
    ['Noto Serif Ethiopic 25', 'assets/fonts/NotoSerifEthiopic-Regular.ttf', 'እምነት'],
  ]) await sharp({text:{font,fontfile:path.join(root,'apps/mobile',file),text,rgba:true}}).png().toBuffer();
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'overview.png'));
}
main().catch(error=>{console.error(error);process.exitCode=1});
