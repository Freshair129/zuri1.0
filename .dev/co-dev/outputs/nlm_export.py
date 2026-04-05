import subprocess

NB_ID = 'ffe15c2e-73bc-48eb-809b-11c122db0ee5'
MM_ID = '296812bc-fe81-4a13-bde4-8cd07c2559a5'

# ลอง export commands ต่างๆ
cmds = [
    ['nlm', 'mindmap', '--help'],
    ['nlm', 'studio', 'status', '--help'],
    ['nlm', 'report', '--help'],
]

for cmd in cmds:
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(f"\n=== {' '.join(cmd)} ===")
    print(r.stdout or r.stderr)
