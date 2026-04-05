import subprocess

NB_ID = 'ffe15c2e-73bc-48eb-809b-11c122db0ee5'

# List studio artifacts (mindmaps, slides, etc.)
result = subprocess.run(
    ['nlm', 'mindmap', '--help'],
    capture_output=True, text=True
)
print('mindmap help:', result.stdout)

# Try listing mindmaps
result2 = subprocess.run(
    ['nlm', 'studio', '--help'],
    capture_output=True, text=True
)
print('studio help:', result2.stdout)
