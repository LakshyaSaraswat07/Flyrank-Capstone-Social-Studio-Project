import os

def w(path, content):
    full = os.path.abspath(path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as out:
        out.write(content.strip() + '\n')
    print('Wrote: ' + path)

print('Builder initialized')
