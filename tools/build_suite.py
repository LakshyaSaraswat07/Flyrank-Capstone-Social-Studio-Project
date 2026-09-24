import os, sys

def w(rel_path, content):
    full = os.path.abspath(rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Created: {rel_path}')

