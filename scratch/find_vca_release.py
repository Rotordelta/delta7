with open('src/components/Delta7Synth.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'vca' in line.lower() or 'release' in line.lower():
      if 'env' in line.lower() or 'eg' in line.lower() or 'releaseTime' in line:
        print(f"{i+1}: {line.strip()}")
