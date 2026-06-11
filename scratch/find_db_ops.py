with open('src/components/Delta7Synth.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'indexedDB' in line.lower() or 'opendb' in line.lower():
        print(f"{i+1}: {line.strip()}")
