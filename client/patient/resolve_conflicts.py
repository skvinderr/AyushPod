import os
import re

files_with_conflicts = [
    "src/store/useAvatar.ts",
    "src/avatar/AvatarController.tsx",
    "src/app/page.tsx",
    "src/app/layout.tsx",
    "src/app/consent/page.tsx",
    "src/app/complaint/page.tsx",
    "src/app/api/tts/route.ts"
]

for filepath in files_with_conflicts:
    full_path = os.path.join(r"c:\Users\rudra\Ayush AABB\AyushPod\client\patient", filepath)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Regex to match conflict markers and keep the THEIRS block
    new_content = re.sub(
        r"<<<<<<< HEAD\n(?:.*?\n)*?=======\n((?:.*?\n)*?)>>>>>>> [a-f0-9a-zA-Z]+\n?",
        r"\1",
        content
    )
    
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"Resolved conflicts in {filepath}")
