import re

filepath = r"C:\Users\hotwo\.gemini\antigravity\scratch\delta7\src\components\Delta7Synth.jsx"

targets = [
    "handlePadGridMouseDown",
    "handlePadGridTouchStart",
    "playProgramVoice",
    "liveRecTargetSlot",
    "isHandover"
]

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for target in targets:
    print(f"\n=== Searching for: {target} ===")
    matches = 0
    for idx, line in enumerate(lines):
        if target in line:
            print(f"{idx+1}: {line.strip()}")
            matches += 1
            if matches >= 30:
                print("... truncated matches")
                break
