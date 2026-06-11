with open('src/components/Delta7Synth.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '.vertical-highway' in line or 'vertical-highway' in line:
        if i > 12000: # We know styles are at the bottom of the file
            print(f"{i+1}: {line.strip()}")
