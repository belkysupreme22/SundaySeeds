// Proposal artwork only. Uses the existing bundled rasterizer; installs nothing.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('/Users/beamlak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const out = __dirname;
const forest = '#173E32', ivory = '#F7F3E8', muted = '#69776A';
const concepts = [
  {
    id: 'a-living-word', letter: 'A', title: 'The living word',
    line1: 'An open book becomes a growing seed.',
    line2: 'A quiet, grounded symbol for faith taking root.',
    mark: `<path fill="currentColor" fill-rule="evenodd" d="M484 459V414C397 371 406 263 512 184C618 263 627 371 540 414V459C621 410 722 403 824 430V732C706 711 606 738 512 806C418 738 318 711 200 732V430C302 403 403 410 484 459ZM512 267C472 309 462 350 512 379C562 350 552 309 512 267ZM484 521C413 471 331 455 256 475V671C340 667 419 690 484 731V521ZM540 521V731C605 690 684 667 768 671V475C693 455 611 471 540 521Z"/>`,
  },
  {
    id: 'b-sunday-light', letter: 'B', title: 'Sunday light',
    line1: 'A new morning above an unfolding page.',
    line2: 'Open, hopeful and instantly legible at a glance.',
    mark: `<path fill="currentColor" fill-rule="evenodd" d="M484 184H540V278H484ZM261 287L301 247L368 314L328 354ZM656 314L723 247L763 287L696 354ZM304 502C304 387 397 294 512 294C627 294 720 387 720 502H599C599 442 560 402 512 370C464 402 425 442 425 502H304ZM200 534C321 502 422 532 512 597C602 532 703 502 824 534V754C710 733 609 757 512 824C415 757 314 733 200 754V534ZM484 645C420 598 337 572 256 580V694C344 693 416 717 484 756V645ZM540 645V756C608 717 680 693 768 694V580C687 572 604 598 540 645Z"/>`,
  },
  {
    id: 'c-seed-script', letter: 'C', title: 'Seed script',
    line1: 'A confident S with seed-shaped inner spaces.',
    line2: 'A compact signature with a warm, human rhythm.',
    mark: `<path fill="currentColor" d="M770 284L672 400C631 345 579 316 518 316C456 316 414 337 400 369C455 365 506 380 570 402L604 416C715 463 776 534 776 642C776 769 674 848 520 848C395 848 299 795 232 730L332 620C379 681 443 713 507 713C571 713 611 689 624 655C566 658 509 640 450 616L416 602C306 556 248 489 248 382C248 264 352 176 508 176C620 176 707 218 770 284Z"/>`,
  },
];
function symbol(c, fg=forest, bg=ivory) {
  return `<g style="color:${fg};--paper:${bg}">${c.mark}</g>`;
}
function svg(c, fg, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><title>SundaySeeds — ${c.title} logo concept</title><desc>Original editable vector proposal. Flat square canvas; platform applies its own icon mask.</desc><rect width="1024" height="1024" fill="${bg}"/>${symbol(c,fg,bg)}</svg>`;
}
async function main() {
  for (const c of concepts) {
    for (const [suffix, fg, bg] of [['',forest,ivory],['-dark',ivory,forest]]) {
      const source = svg(c,fg,bg);
      fs.writeFileSync(path.join(out,c.id+suffix+'.svg'),source+'\n');
      await sharp(Buffer.from(source)).png().toFile(path.join(out,c.id+suffix+'.png'));
    }
  }
  const columns = concepts.map((c,i)=> {
    const x = 72+i*568;
    let samples='';
    for(const [j,sz] of [24,48].entries()) {
      const sx=x+32+j*106;
      samples+=`<svg x="${sx}" y="1090" width="${sz}" height="${sz}" viewBox="0 0 1024 1024">${symbol(c)}</svg><text x="${sx}" y="1161" class="small">${sz} px</text>`;
      samples+=`<svg x="${sx+264}" y="1090" width="${sz}" height="${sz}" viewBox="0 0 1024 1024">${symbol(c,ivory,forest)}</svg><text x="${sx+264}" y="1161" class="small reverse">${sz} px</text>`;
    }
    return `<text x="${x}" y="260" class="concept">${c.letter} / ${c.title}</text><rect x="${x}" y="300" width="520" height="520" fill="${ivory}"/><svg x="${x}" y="300" width="520" height="520" viewBox="0 0 1024 1024">${symbol(c)}</svg><text x="${x+260}" y="895" class="wordmark" text-anchor="middle">SundaySeeds</text><text x="${x}" y="961" class="body">${c.line1}</text><text x="${x}" y="994" class="body">${c.line2}</text><rect x="${x}" y="1045" width="256" height="146" fill="${ivory}"/><rect x="${x+264}" y="1045" width="256" height="146" fill="${forest}"/>${samples}`;
  }).join('');
  const board=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1380" viewBox="0 0 1800 1380"><style>text{font-family:Arial,Helvetica,sans-serif;fill:${forest}}.eyebrow{font-size:19px;letter-spacing:3px;font-weight:700}.title{font-size:60px;letter-spacing:-2px;font-weight:700}.intro{font-size:23px;fill:${muted}}.concept{font-size:27px;font-weight:700}.wordmark{font-size:53px;font-weight:700;letter-spacing:-2px}.body{font-size:21px;fill:${muted}}.small{font-size:16px;fill:${muted}}.reverse{fill:${ivory}}</style><rect width="1800" height="1380" fill="#FFFFFF"/><text x="72" y="66" class="eyebrow">SUNDAYSEEDS / BRAND EXPLORATIONS / 03 NOV 2026</text><text x="72" y="145" class="title">Small beginnings. A clear identity.</text><text x="72" y="192" class="intro">Three original vector directions · one-ink marks · concept typography</text>${columns}<line x1="72" x2="1728" y1="1240" y2="1240" stroke="#D8DDD6"/><text x="72" y="1290" class="body">1024 × 1024 editable masters · warm ivory / deep forest · square artwork ready for platform masking</text><text x="72" y="1326" class="small">Proposal artwork only. Wordmarks use system sans-serif for comparison; final typography and native app validation remain pending.</text></svg>`;
  fs.writeFileSync(path.join(out,'comparison-board.svg'),board+'\n');
  await sharp(Buffer.from(board)).png().toFile(path.join(out,'comparison-board.png'));
}
main().catch(e=>{ console.error(e); process.exitCode=1; });
