import sys, json, os
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
for p, h in data.items():
    os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as out:
        out.write(bytes.fromhex(h).decode('utf-8'))
    print(f'Wrote {p}')
