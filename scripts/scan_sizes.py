import os

ROOT = r"d:\LAB_VINUNI\P-101"

def get_dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if not os.path.islink(fp):
                try:
                    total += os.path.getsize(fp)
                except Exception:
                    pass
    return total

print("Scanning folder sizes in MB...")
items = []
for name in os.listdir(ROOT):
    p = os.path.join(ROOT, name)
    if os.path.isdir(p):
        size_mb = get_dir_size(p) / (1024 * 1024)
        items.append((size_mb, name))

items.sort(reverse=True)
for size, name in items:
    print(f"{name}: {size:.2f} MB")
