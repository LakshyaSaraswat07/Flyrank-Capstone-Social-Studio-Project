#raster Payload Generator
import os, sys

def w(rel, content):
    full = os.path.abspath(rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as fout:
        fout.write(content.strip() + '\n')
    print(f'Created: ${rel}')

