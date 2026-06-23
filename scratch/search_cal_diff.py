import re

path = r"C:\Users\hotwo\.gemini\antigravity\scratch\delta7\scratch\current_diff.txt"

with open(path, "r", encoding="utf-16") as f:
    content = f.read()

# Look for LatencyCalModal.jsx in the diff
matches = [m.start() for m in re.finditer("LatencyCalModal.jsx", content)]
print(f"Found {len(matches)} matches of LatencyCalModal.jsx")
for m in matches:
    start = max(0, m - 100)
    end = min(len(content), m + 1500)
    print(f"\n--- Match at index {m} ---")
    print(content[start:end])
