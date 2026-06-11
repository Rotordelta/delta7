with open('src/components/Delta7Synth.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'arpBpm' in line or 'BPM' in line or 'tempo' in line:
        # filter to lines that look like state, input, or calculations
        if any(term in line for term in ['useState', 'slider', 'input', 'Math.', 'step', 'parseFloat', 'parseInt']):
            print(f"{i+1}: {line.strip()}")
