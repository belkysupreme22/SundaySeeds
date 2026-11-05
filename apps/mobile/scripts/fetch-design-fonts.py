"""Fetch original, open-license static font assets; no packages or app execution."""
import hashlib
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[3]
DESTINATION = ROOT / 'apps/mobile/assets/fonts'
ADOBE = 'https://raw.githubusercontent.com/adobe-fonts/source-serif/release/'
NOTO = 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/'
GOFA = 'https://raw.githubusercontent.com/debessay/Geez_monospace_font/9ff60b3c999e6a027b217ea25cfcacf2565b533e/'
ABYSSINICA = 'https://software.sil.org/downloads/r/abyssinica/AbyssinicaSIL-2.300.zip'
ABYSSINICA_FILES = {
    'AbyssinicaSIL-Regular.ttf': 'AbyssinicaSIL-2.300/AbyssinicaSIL-Regular.ttf',
    'OFL-AbyssinicaSIL.txt': 'AbyssinicaSIL-2.300/OFL.txt',
}
FILES = {
    'SourceSerif4-Regular.ttf': ADOBE + 'TTF/SourceSerif4-Regular.ttf',
    'NotoSansEthiopic-Regular.ttf': NOTO + 'hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-Regular.ttf',
    'NotoSansEthiopic-SemiBold.ttf': NOTO + 'hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-SemiBold.ttf',
    'NotoSerifEthiopic-Regular.ttf': NOTO + 'hinted/ttf/NotoSerifEthiopic/NotoSerifEthiopic-Regular.ttf',
    'OFL-SourceSerif4.txt': ADOBE + 'LICENSE.md',
    'OFL-Noto.txt': NOTO + 'LICENSE',
    'GeezGofaMonoC-Regular.ttf': GOFA + 'font/Geez_Gofa_mono_C_200_regular_normal_plain.ttf',
    'OFL-GeezGofaMonoC.txt': GOFA + 'OFL.md',
}

def fetch(url):
    request = Request(url, headers={'User-Agent': 'SundaySeeds-font-asset-authoring'})
    with urlopen(request, timeout=45) as response:
        return response.read()


def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    records = []
    # Fetch/validate everything before writing the asset set.
    downloaded = {name: (fetch(url), {'url': url}) for name, url in FILES.items()}
    gofa_license, gofa_source = downloaded['OFL-GeezGofaMonoC.txt']
    downloaded['OFL-GeezGofaMonoC.txt'] = (
        b'\n'.join(line.rstrip(b' \t') for line in gofa_license.splitlines()) + b'\n',
        {**gofa_source, 'normalizedWhitespace': True},
    )
    with ZipFile(BytesIO(fetch(ABYSSINICA))) as archive:
        for name, member in ABYSSINICA_FILES.items():
            data = archive.read(member)
            source = {'url': ABYSSINICA, 'archiveMember': member}
            if name.endswith('.txt'):
                data = b'\n'.join(line.rstrip(b' \t') for line in data.splitlines()) + b'\n'
                source['lineEndings'] = 'LF'
            downloaded[name] = (data, source)
    for name, (data, source) in downloaded.items():
        if name.endswith('.ttf') and data[:4] not in (b'\x00\x01\x00\x00', b'OTTO'):
            raise RuntimeError(f'{name} is not a supported original static font.')
        if name.endswith('.txt') and b'SIL OPEN FONT LICENSE' not in data.upper():
            raise RuntimeError(f'{name} does not contain the expected license.')
        records.append({'file': name, **source, 'bytes': len(data),
                        'sha256': hashlib.sha256(data).hexdigest()})
    for name, (data, _) in downloaded.items():
        (DESTINATION / name).write_bytes(data)
    (DESTINATION / 'SOURCES.json').write_text(json.dumps(records, indent=2) + '\n')
    print(f'Saved {len(records)} original font/license assets with SHA-256 provenance.')

if __name__ == '__main__':
    main()
