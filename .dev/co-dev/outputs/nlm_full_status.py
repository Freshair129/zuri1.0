import subprocess

NB_ID = 'ffe15c2e-73bc-48eb-809b-11c122db0ee5'

# ดู full details ของ studio artifacts
r = subprocess.run(
    ['nlm', 'studio', 'status', NB_ID, '--full', '--json'],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print(r.stdout or r.stderr)
