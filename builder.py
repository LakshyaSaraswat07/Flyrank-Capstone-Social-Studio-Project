import os
import sys

def write_file(rel_path, content):
    full_path = os.path.abspath(rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, w, encoding=utf-8) as f:
        f.write(content)
    print(fCreated: {rel_path})

if __name__ == __main__:
    print(Builder initialized)