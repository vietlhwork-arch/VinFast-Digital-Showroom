import os
import shutil

print("[START] Cleaning up backend folder...")

os.makedirs("data", exist_ok=True)
os.makedirs("static/uploads", exist_ok=True)

# Copy static uploads
if os.path.exists("backend/static/uploads"):
    shutil.copytree("backend/static/uploads", "static/uploads", dirs_exist_ok=True)
    print("[1/3] Copied backend/static/uploads to static/uploads")

# Copy vinfast.db if exists
if os.path.exists("backend/vinfast.db"):
    shutil.copy2("backend/vinfast.db", "data/vinfast.db")
    print("[2/3] Copied backend/vinfast.db to data/vinfast.db")

# Delete backend directory
if os.path.exists("backend"):
    shutil.rmtree("backend")
    print("[3/3] Removed backend folder")

print("[SUCCESS] All files moved to root / data / static directories! Backend folder deleted.")
