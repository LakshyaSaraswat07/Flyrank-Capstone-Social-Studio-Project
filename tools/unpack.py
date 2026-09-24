import json, base64, os, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    for p, c in json.load(f).items():
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as out:
            out.write(base64.b64decode(c).decode('utf-8'))
        print(f'Wrote {p}')
