import base64, sys, os
code = sys.stdin.read()
b64 = base64.b64encode(code.encode('utf-8')).decode('ascii')
os.system(f'node tools/append.cjs tools/build_all.cjs {b64}')
