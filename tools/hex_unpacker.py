import sys, os
path = sys.argv[1]
content = bytes.fromhex(sys.argv[2]).decode('utf-8')
os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
open(path, 'w', encoding='utf-8').write(content)
print(f'Wrote {path} ({len(content)} chars)')
