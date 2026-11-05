// Documentation/asset authoring only. Does not start or exercise the application.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  brandColors,
  accentColors,
  cardColors,
  colors,
  fonts,
  spacing,
} from '../src/shared/theme/tokens';
import { motion, shape, targets } from '../src/shared/theme/motion';
import {
  authHeadingFonts,
  ethiopicFonts,
  readingFonts,
  typeScale,
} from '../src/shared/theme/typography';

const root = resolve(__dirname, '../../..');
const destination = resolve(root, 'docs/design-system');
mkdirSync(destination, { recursive: true });
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const v = parseInt(hex.slice(start, start + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const pairs = [
  ['Ivory on forest', brandColors.onForest, brandColors.forest],
  ['Forest on cream', brandColors.forest, brandColors.canvas],
  ['Forest on sage', brandColors.forest, brandColors.surface],
  ['Secondary text on cream', brandColors.muted, brandColors.canvas],
  ['Body text on cream', colors.ink, brandColors.canvas],
  ['Danger text on cream', colors.danger, brandColors.canvas],
  ['Question text on wheat', colors.ink, cardColors.yellow],
  ['Body text on rose', colors.ink, cardColors.pink],
  ['Control boundary on white', brandColors.controlBorder, colors.white],
] as const;
const contrast = pairs.map(([name, foreground, background]) => {
  const a = luminance(foreground),
    b = luminance(background);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const boundary = name.startsWith('Control boundary');
  return {
    name,
    foreground,
    background,
    ratio: Number(ratio.toFixed(2)),
    threshold: boundary ? 3 : 4.5,
    passes: ratio >= (boundary ? 3 : 4.5),
  };
});
const system = {
  version: '1.0',
  updated: '2026-11-05',
  brandColors,
  accentColors,
  cardColors,
  colors,
  fonts,
  ethiopicFonts,
  readingFonts,
  authHeadingFonts,
  typeScale,
  spacing,
  motion,
  shape,
  targets,
  contrast,
  fontAssets: JSON.parse(
    readFileSync(resolve(root, 'apps/mobile/assets/fonts/SOURCES.json'), 'utf8'),
  ) as unknown,
};
writeFileSync(resolve(destination, 'tokens.json'), JSON.stringify(system, null, 2) + '\n');
const fontFace = (family: string, url: string, weight: number | string) =>
  `@font-face{font-family:'${family}';src:url('${url}') format('truetype');font-weight:${weight};font-display:swap;}`;
const css = [
  fontFace(
    'Poppins',
    '../../apps/mobile/node_modules/@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf',
    400,
  ),
  fontFace(
    'Poppins',
    '../../apps/mobile/node_modules/@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf',
    600,
  ),
  fontFace(
    'Poppins',
    '../../apps/mobile/node_modules/@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf',
    700,
  ),
  fontFace('Source Serif 4', '../../apps/mobile/assets/fonts/SourceSerif4-Regular.ttf', 400),
  fontFace('Abyssinica SIL', '../../apps/mobile/assets/fonts/AbyssinicaSIL-Regular.ttf', 400),
  fontFace('Lexend', 'specimen-fonts/Lexend-Variable.ttf', '100 900'),
  fontFace('Waldba Fantuwua', 'specimen-fonts/WaldbaFantuwua-COLR-UVS.ttf', 400),
  fontFace('Waldba Zelan', 'specimen-fonts/WaldbaZelan-COLR-UVS.ttf', 400),
  fontFace('Waldba Tint', 'specimen-fonts/WaldbaTint-COLR-UVS.ttf', 400),
  fontFace('Brana', 'specimen-fonts/Brana-Regular.ttf', 400),
  fontFace('Goha Tibeb Zemen', 'specimen-fonts/GohaTibebZemen.ttf', 400),
  fontFace('Waldba Jiret', 'specimen-fonts/WaldbaJiret-COLR-UVS.ttf', 400),
  fontFace('Geez Gofa Mono C', 'specimen-fonts/GeezGofaMonoC-Regular.ttf', 400),
  fontFace(
    'Noto Sans Ethiopic',
    '../../apps/mobile/assets/fonts/NotoSansEthiopic-Regular.ttf',
    400,
  ),
  fontFace(
    'Noto Sans Ethiopic',
    '../../apps/mobile/assets/fonts/NotoSansEthiopic-SemiBold.ttf',
    600,
  ),
  fontFace(
    'Noto Serif Ethiopic',
    '../../apps/mobile/assets/fonts/NotoSerifEthiopic-Regular.ttf',
    400,
  ),
  `:root{--forest:${brandColors.forest};--cream:${brandColors.canvas};--sage:${brandColors.surface};--selected:${brandColors.surfaceStrong};--muted:${brandColors.muted};--ink:${colors.ink};--line:${colors.line};--control-border:${brandColors.controlBorder};--wheat:${colors.yellow};--peach:${colors.peach};--rose:${colors.pink};--danger:${colors.danger};--success:${colors.success};}`,
].join('\n');
writeFileSync(resolve(destination, 'theme.css'), css + '\n');
const template = readFileSync(resolve(destination, 'guide.template.html'), 'utf8');
writeFileSync(
  resolve(destination, 'guide.html'),
  template.replace('__SYSTEM_DATA__', JSON.stringify(system).replaceAll('<', '\\u003c')),
);
console.log(
  `Exported design-system tokens, color-pair report, font CSS and guide (${contrast.length} contrast pairs).`,
);
