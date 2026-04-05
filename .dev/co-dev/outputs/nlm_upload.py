import subprocess
import pathlib

NB_ID = 'ffe15c2e-73bc-48eb-809b-11c122db0ee5'
ROOT = pathlib.Path('E:/zuri')

files = [
    ('PROJECT_MAP.md',   ROOT / 'docs/PROJECT_MAP.md'),
    ('CLAUDE.md',        ROOT / 'CLAUDE.md'),
    ('prisma-schema',    ROOT / 'prisma/schema.prisma'),
    ('FEAT04-INBOX',     ROOT / 'docs/product/specs/FEAT04-INBOX.md'),
    ('FEAT05-CRM',       ROOT / 'docs/product/specs/FEAT05-CRM.md'),
    ('FEAT06-POS',       ROOT / 'docs/product/specs/FEAT06-POS.md'),
    ('FEAT07-ENROLLMENT',ROOT / 'docs/product/specs/FEAT07-ENROLLMENT.md'),
    ('FEAT08-KITCHEN',   ROOT / 'docs/product/specs/FEAT08-KITCHEN.md'),
    ('FEAT09-MARKETING', ROOT / 'docs/product/specs/FEAT09-MARKETING.md'),
    ('FEAT10-DSB',       ROOT / 'docs/product/specs/FEAT10-DSB.md'),
]

for title, path in files:
    if not path.exists():
        print(f'SKIP (not found): {title}')
        continue
    content = path.read_text(encoding='utf-8')
    result = subprocess.run(
        ['nlm', 'source', 'add', NB_ID, '--text', content, '--title', title],
        capture_output=True, text=True
    )
    if result.returncode == 0 or 'Added source' in result.stdout or 'Added source' in result.stderr:
        print(f'OK: {title}')
    else:
        print(f'ERR: {title} — {result.stderr.strip()[:100]}')

print('\nAll done.')
