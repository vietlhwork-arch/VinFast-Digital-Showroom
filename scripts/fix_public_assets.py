import os
import shutil

ROOT = r"d:\LAB_VINUNI\P-101"

src_uploads = os.path.join(ROOT, "static", "uploads")
dst_uploads = os.path.join(ROOT, "frontend", "public", "static", "uploads")

src_vinpng1 = os.path.join(ROOT, "frontend", "VINpng")
src_vinpng2 = os.path.join(ROOT, "frontend", "public", "VIN png")
dst_vinpng = os.path.join(ROOT, "frontend", "public", "VINpng")
dst_vinpng_space = os.path.join(ROOT, "frontend", "public", "VIN png")

if os.path.exists(src_uploads):
    shutil.copytree(src_uploads, dst_uploads, dirs_exist_ok=True)
    print(f"✅ Copied {src_uploads} -> {dst_uploads}")

if os.path.exists(src_vinpng1):
    shutil.copytree(src_vinpng1, dst_vinpng, dirs_exist_ok=True)
    shutil.copytree(src_vinpng1, dst_vinpng_space, dirs_exist_ok=True)
    print(f"✅ Copied {src_vinpng1} -> {dst_vinpng} and {dst_vinpng_space}")

if os.path.exists(src_vinpng2):
    shutil.copytree(src_vinpng2, dst_vinpng, dirs_exist_ok=True)
    shutil.copytree(src_vinpng2, dst_vinpng_space, dirs_exist_ok=True)
    print(f"✅ Copied {src_vinpng2} -> {dst_vinpng} and {dst_vinpng_space}")
