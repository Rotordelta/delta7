import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = r"C:\Users\hotwo\.gemini\antigravity\brain\33068c55-313c-4d93-b749-664e5391168f\walkthrough.md"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")
start_line = max(1, len(lines) - 50)
for idx in range(start_line - 1, len(lines)):
    print(f"{idx+1}: {lines[idx]}", end="")
