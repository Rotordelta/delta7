with open('src/components/Delta7Synth.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'saveSampleToDb' in line or 'loadSample' in line or 'indexed' in line.lower() or 'db' in line.lower():
        if any(term in line for term in ['const', 'function', 'Database', 'Store', 'ObjectStore']):
            print(f"{i+1}: {line.strip()}")
