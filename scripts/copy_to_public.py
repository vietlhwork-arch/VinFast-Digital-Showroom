import os
import shutil

ROOT = r"d:\LAB_VINUNI\P-101"
src = os.path.join(ROOT, "static", "uploads")
dst = os.path.join(ROOT, "frontend", "public", "static", "uploads")

os.makedirs(dst, exist_ok=True)

for root_dir, dirs, files in os.walk(src):
    rel_path = os.path.relpath(root_dir, src)
    target_dir = os.path.join(dst, rel_path)
    os.makedirs(target_dir, exist_ok=True)
    for f in files:
        s_file = os.path.join(root_dir, f)
        d_file = os.path.join(target_dir, f)
        shutil.copy2(s_file, d_file)
        print(f"Copied: {f} -> {d_file}")

print("DONE COPYING STATIC UPLOADS!")
