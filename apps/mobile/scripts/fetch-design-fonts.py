"""Fetch original, open-license static font assets; no packages or app execution."""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[3]
DESTINATION = ROOT / 'apps/mobile/assets/fonts'
ADOBE = 'https://raw.githubusercontent.com/adobe-fonts/source-serif/release/'
NOTO = 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/'
FILES = {
    'SourceSerif4-Regular.ttf': ADOBE + 'TTF/SourceSerif4-Regular.ttf',
    'NotoSansEthiopic-Regular.ttf': NOTO + 'hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-Regular.ttf',
    'NotoSansEthiopic-SemiBold.ttf': NOTO + 'hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-SemiBold.ttf',
    'NotoSerifEthiopic-Regular.ttf': NOTO + 'hinted/ttf/NotoSerifEthiopic/NotoSerifEthiopic-Regular.ttf',
    'OFL-SourceSerif4.txt': ADOBE + 'LICENSE.md',
    'OFL-Noto.txt': NOTO + 'LICENSE',
}

def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    records = []
    # Fetch/validate everything before writing the asset set.
    downloaded = {}
    for name, url in FILES.items():
        request = Request(url, headers={'User-Agent': 'SundaySeeds-font-asset-authoring'})
        with urlopen(request, timeout=45) as response:
            data = response.read()
        if name.endswith('.ttf') and data[:4] not in (b'\x00\x01\x00\x00', b'OTTO'):
            raise RuntimeError(f'{name} is not a supported original static font.')
        if name.endswith('.txt') and b'SIL OPEN FONT LICENSE' not in data.upper():
            raise RuntimeError(f'{name} does not contain the expected license.')
        downloaded[name] = data
        records.append({'file': name, 'url': url, 'bytes': len(data),
                        'sha256': hashlib.sha256(data).hexdigest()})
    for name, data in downloaded.items():
        (DESTINATION / name).write_bytes(data)
    (DESTINATION / 'SOURCES.json').write_text(json.dumps(records, indent=2) + '\n')
    print(f'Saved {len(records)} original font/license assets with SHA-256 provenance.')

if __name__ == '__main__':
    main()
