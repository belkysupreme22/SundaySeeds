/* Vector asset authoring. No images, external service or app runtime required. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const masterPath = path.join(root, 'apps/mobile/assets/brand/logo.svg');
const master = fs.readFileSync(masterPath, 'utf8');
const paths = [...master.matchAll(/<path\b[^>]*\/>/g)].map(([tag]) => ({
  id: tag.match(/\sid="([^"]+)"/)[1], d: tag.match(/\sd="([^"]+)"/)[1],
}));
if (!['stem', 'left-leaf', 'right-leaf', 'seed'].every(id => paths.some(p => p.id === id))) {
  throw new Error('Expected the four approved unfolding-seed paths.');
}
const FPS = 60, LAST = 138, CROP = '192 192 640 640';
const point = (x, y) => [x, y];
const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const round = n => Math.round(n * 10000) / 10000;
const clamp = n => Math.max(0, Math.min(1, n));
const phase = (frame, start, end) => clamp((frame - start) / (end - start));
const out = t => 1 - (1 - t) ** 3;
const smooth = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

function parse(d) {
  const tokens = d.match(/[MCZ]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi);
  const result = [];
  let shape, cursor = 0;
  const take = () => point(Number(tokens[cursor++]), Number(tokens[cursor++]));
  while (cursor < tokens.length) {
    const command = tokens[cursor++];
    if (command === 'M') {
      shape = { v: [take()], i: [[0,0]], o: [[0,0]], c: false };
      result.push(shape);
    } else if (command === 'C') {
      const first = take(), second = take(), end = take();
      shape.o[shape.v.length - 1] = subtract(first, shape.v.at(-1));
      shape.v.push(end); shape.i.push(subtract(second, end)); shape.o.push([0,0]);
    } else if (command === 'Z') {
      shape.c = true;
      if (shape.v.length > 1 && shape.v[0].every((value, axis) => value === shape.v.at(-1)[axis])) {
        shape.i[0] = shape.i.at(-1);
        shape.v.pop(); shape.i.pop(); shape.o.pop();
      }
    } else {
      throw new Error(`Unexpected SVG command ${command}; update the authoring parser explicitly.`);
    }
  }
  return result;
}

function deform(shape, transform) {
  const vertices = shape.v.map(transform);
  return {
    v: vertices.map(v => v.map(round)),
    i: shape.i.map((handle, index) => subtract(transform(add(shape.v[index], handle)), vertices[index]).map(round)),
    o: shape.o.map((handle, index) => subtract(transform(add(shape.v[index], handle)), vertices[index]).map(round)),
    c: shape.c,
  };
}

const geometry = Object.fromEntries(paths.map(p => [p.id, parse(p.d)]));
function stemPoint(p, growth) {
  return [513 + (p[0] - 513) * growth + Math.sin((653 - p[1]) / 297 * Math.PI) * 12 * growth * (1 - growth),
    653 + (p[1] - 653) * growth];
}

function frameShape(id, subpath, frame) {
  const shape = geometry[id][subpath];
  if (frame >= 124) return shape;
  if (id === 'seed') {
    if (subpath === 0) {
      const breath = 1 + .022 * Math.sin(Math.PI * phase(frame, 0, 36));
      return deform(shape, p => [490 + (p[0] - 490) * breath, 700 + (p[1] - 700) * breath]);
    }
    const opening = smooth(phase(frame, 10, 40));
    return deform(shape, p => {
      const seam = 469 + (p[1] - 619) * 50 / 172;
      return [seam + (p[0] - seam) * opening, p[1]];
    });
  }
  const growth = smooth(phase(frame, 14, 65));
  if (id === 'stem') return deform(shape, p => stemPoint(p, growth));

  const left = id === 'left-leaf';
  const base = left ? [493,526] : [520,445];
  const tip = left ? [295,313] : [744,249];
  const vector = subtract(tip, base), length = Math.hypot(...vector);
  const axis = vector.map(value => value / length), normal = [-axis[1], axis[0]];
  const progress = phase(frame, left ? 43 : 58, left ? 91 : 108);
  const extension = out(progress), unfurl = smooth(progress);
  const rotation = (left ? .65 : -.75) * (1 - unfurl);
  const attachment = stemPoint(base, growth);
  // A narrow curved bud lengthens, unrolls across its width and bends outward.
  // Handles deform with the blade, so the silhouette changes rather than wiping on.
  return deform(shape, p => {
    const relative = subtract(p, base);
    const along = relative[0] * axis[0] + relative[1] * axis[1];
    const across = relative[0] * normal[0] + relative[1] * normal[1];
    const u = along * extension;
    const v = across * extension * (.1 + .9 * unfurl)
      + Math.sin(Math.PI * clamp(along / length)) * (1 - unfurl) * extension * length * (left ? .4 : -.4);
    const x = axis[0] * u + normal[0] * v, y = axis[1] * u + normal[1] * v;
    const settle = frame > 108 ? Math.sin(Math.PI * phase(frame, 108, 124)) * .012 * (left ? 1 : -1) : 0;
    const angle = rotation + settle;
    return [attachment[0] + x * Math.cos(angle) - y * Math.sin(angle),
      attachment[1] + x * Math.sin(angle) + y * Math.cos(angle)];
  });
}

const times = [...Array.from({length: LAST / 2}, (_, index) => index * 2), LAST];
const frames = times.map(t => Object.fromEntries(paths.map(p => [p.id, geometry[p.id].map((_, sub) => frameShape(p.id, sub, t))])));
const fixed = k => ({ a: 0, k });
function layer(id, index) {
  const shapes = geometry[id].map((_, sub) => ({
    ty: 'sh', nm: `${id} outline ${sub + 1}`,
    ks: { a: 1, k: times.map((time, at) => at === times.length - 1
      ? { t: time, s: [frames[at][id][sub]] }
      : { t: time, s: [frames[at][id][sub]], e: [frames[at+1][id][sub]], i: { x: 1, y: 1 }, o: { x: 0, y: 0 } }) },
  }));
  shapes.push({ty:'fl',nm:'Original forest ink',c:fixed([23/255,62/255,50/255,1]),o:fixed(100),r:2,bm:0});
  return {ddd:0,ind:index,ty:4,nm:id,sr:1,ks:{o:fixed(100),r:fixed(0),p:fixed([-192,-192,0]),a:fixed([0,0,0]),s:fixed([100,100,100])},
    ao:0,shapes,ip:0,op:LAST,st:0,bm:0};
}
const animation = { v:'5.7.4',fr:FPS,ip:0,op:LAST,w:640,h:640,nm:'SundaySeeds — unfolding seed',ddd:0,assets:[],
  layers:['seed','right-leaf','left-leaf','stem'].map((id,index) => layer(id,index+1)),
  markers:[{tm:0,cm:'Closed seed',dr:0},{tm:65,cm:'Stem extended',dr:0},{tm:124,cm:'Final static identity',dr:14}] };
const output = path.join(root,'apps/mobile/assets/animations/unfolding-seed.json');
fs.writeFileSync(output, JSON.stringify(animation));
const definitions = path.join(root,'apps/mobile/src/shared/branding');
fs.mkdirSync(definitions,{recursive:true});
fs.writeFileSync(path.join(definitions,'seedMark.ts'),
  `// Generated from assets/brand/logo.svg by scripts/export-seed-motion.cjs.\nexport const seedViewBox = '${CROP}';\nexport const seedPaths = ${JSON.stringify(paths,null,2)} as const;\n`);

// Asset-only preview frames use the very same exported Lottie control points.
function svgPath(shape) {
  let d = `M${shape.v[0].join(' ')}`;
  for(let index=1;index<shape.v.length;index++) {
    d += `C${add(shape.v[index-1],shape.o[index-1]).join(' ')} ${add(shape.v[index],shape.i[index]).join(' ')} ${shape.v[index].join(' ')}`;
  }
  if(shape.c) d += `C${add(shape.v.at(-1),shape.o.at(-1)).join(' ')} ${add(shape.v[0],shape.i[0]).join(' ')} ${shape.v[0].join(' ')}Z`;
  return d;
}
if(process.argv.includes('--preview')) {
  const preview = path.join(root,'.artifacts/unfolding-seed-frames');
  fs.mkdirSync(preview,{recursive:true});
  for(let at=0;at<times.length;at++) {
    const art = paths.map(p => `<path fill="#173E32" fill-rule="evenodd" d="${frames[at][p.id].map(svgPath).join('')}"/>`).join('');
    fs.writeFileSync(path.join(preview,`${String(times[at]).padStart(3,'0')}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="${CROP}"><rect x="192" y="192" width="640" height="640" fill="#FCFAFF"/>${art}</svg>`);
  }
}
console.log(`Exported ${LAST/FPS}s vector motion (${fs.statSync(output).size} bytes), static paths and optional authoring frames.`);
