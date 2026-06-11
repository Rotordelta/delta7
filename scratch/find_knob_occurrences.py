with open('src/components/Delta7Synth.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

count = 0
for i, line in enumerate(lines):
    if 'Knob' in line:
        print(f"{i+1}: {line.strip()}")
        count += 1
        if count >= 15:
            break
