import subprocess

NB_ID = 'ffe15c2e-73bc-48eb-809b-11c122db0ee5'

result = subprocess.run(
    ['nlm', 'mindmap', 'create', NB_ID, '--confirm'],
    capture_output=True, text=True
)

print('STDOUT:', result.stdout[-800:] if result.stdout else '(empty)')
print('STDERR:', result.stderr[-800:] if result.stderr else '(empty)')
print('Return code:', result.returncode)
