import os

def search_files(directory, query):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.css') or file.endswith('.jsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    for i, line in enumerate(f):
                        if query in line:
                            print(f"{path}:{i+1}: {line.strip()}")

search_files('.', 'vertical-highway')
