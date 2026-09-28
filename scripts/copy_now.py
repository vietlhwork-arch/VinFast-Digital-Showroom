import os
import shutil

ROOT = r"d:\LAB_VINUNI\P-101"

src_uploads = os.path.join(ROOT, "static", "uploads")
dst_uploads = os.path.join(ROOT, "frontend", "public", "static", "uploads")

src_vinpng = os.path.join(ROOT, "frontend", "VINpng")
dst_vinpng = os.path.join(ROOT, "frontend", "public", "VINpng")

if os.path.exists(src_uploads):
    shutil.copytree(src_uploads, dst_uploads, dirs_exist_ok=True)
    print(f"✅ Successfully copied {src_uploads} -> {dst_uploads}")

if os.path.exists(src_vinpng):
    shutil.copytree(src_vinpng, dst_vinpng, dirs_exist_ok=True)
    print(f"✅ Successfully copied {src_vinpng} -> {dst_vinpng}")
