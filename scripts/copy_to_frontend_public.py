import os
import shutil

ROOT = r"d:\LAB_VINUNI\P-101"

src_uploads = os.path.join(ROOT, "static", "uploads")
dst_uploads = os.path.join(ROOT, "frontend", "public", "static", "uploads")

if os.path.exists(src_uploads):
    shutil.copytree(src_uploads, dst_uploads, dirs_exist_ok=True)
    print(f"✅ Successfully copied {src_uploads} -> {dst_uploads}")
    files = os.listdir(dst_uploads)
    print("Direct subfolders in dst:", files)
    cars_dir = os.path.join(dst_uploads, "cars")
    if os.path.exists(cars_dir):
        print(f"Cars inside dst: {len(os.listdir(cars_dir))} files found!")
