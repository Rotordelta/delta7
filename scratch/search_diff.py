import re

path = r"C:\Users\hotwo\.gemini\antigravity\scratch\delta7\scratch\current_diff.txt"

content = None
for encoding in ["utf-16", "utf-8", "latin-1"]:
    try:
        with open(path, "r", encoding=encoding) as f:
            content = f.read()
        print(f"Successfully read with encoding: {encoding}")
        break
    except Exception as e:
        print(f"Failed with {encoding}: {e}")

if content:
    print("Length of diff:", len(content))
    matches = [m.start() for m in re.finditer("playProgramVoice", content)]
    print(f"Found {len(matches)} matches of playProgramVoice")
    for m in matches:
        start = max(0, m - 200)
        end = min(len(content), m + 800)
        print(f"\n--- Match at index {m} ---")
        print(content[start:end])
else:
    print("Could not read file.")
