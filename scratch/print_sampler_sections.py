filepath = r"C:\Users\hotwo\.gemini\antigravity\scratch\delta7\src\components\Delta7Synth.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Print lines 10500 to 10610
start_line = 10500
end_line = 10610

for idx in range(start_line - 1, end_line):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")
