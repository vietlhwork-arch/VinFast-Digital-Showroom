import os
import shutil

ROOT = r"d:\LAB_VINUNI\P-101"
src = os.path.join(ROOT, "static", "uploads")
dst1 = os.path.join(ROOT, "frontend", "public", "static", "uploads")
dst2 = os.path.join(ROOT, "frontend", "static", "uploads")

shutil.copytree(src, dst1, dirs_exist_ok=True)
shutil.copytree(src, dst2, dirs_exist_ok=True)
print("SUCCESSFULLY COPIED STATIC UPLOADS TO PUBLIC AND FRONTEND!")
