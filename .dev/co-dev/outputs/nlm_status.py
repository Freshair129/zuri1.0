import subprocess

NB_ID = 'ffe15c2e-73bc-48eb-809b-11c122db0ee5'

result = subprocess.run(
    ['nlm', 'studio', 'status', NB_ID],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print('STDOUT:', result.stdout)
print('STDERR (tail):', result.stderr[-300:] if result.stderr else '(empty)')
