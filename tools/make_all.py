# Master build script
import os, sys

def w(path, content):
    full = os.path.abspath(path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print('Created: ' + path)

