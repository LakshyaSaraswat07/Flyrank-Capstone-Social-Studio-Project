import sys, os, base64

def write_file(rel_path_b64, content_b64):
    rel_path = base64.b64decode(rel_path_b64).decode('utf-8')
    content = base64.b64decode(content_b64).decode('utf-8')
    full_path = os.path.abspath(rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Wrote: {rel_path}')

if __name__ == '__main__':
    write_file(sys.argv[1], sys.argv[2])