import re

filepath = r"C:\Users\hotwo\.gemini\antigravity\scratch\delta7\src\components\Delta7Synth.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("\n=== Searching for: fluxOffset ===")
for idx, line in enumerate(lines):
    if "fluxOffset" in line:
        print(f"{idx+1}: {line.strip()}")
