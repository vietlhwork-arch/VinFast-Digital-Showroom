import os
import shutil

ROOT = r"d:\LAB_VINUNI\P-101"

src_space = os.path.join(ROOT, "frontend", "public", "VIN png")
dst_nospace = os.path.join(ROOT, "frontend", "public", "VINpng")

if os.path.exists(src_space):
    shutil.copytree(src_space, dst_nospace, dirs_exist_ok=True)
    print(f"✅ Successfully copied {src_space} -> {dst_nospace}")
else:
    print(f"❌ Source {src_space} does not exist!")
