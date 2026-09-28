import os
import urllib.parse
import json
import urllib.request

TOKEN = "vercel_blob_rw_EphwgMKkIqGBoNCq_jpLwnYytDOHG4LwQxdgwK0Qon3LfVn"
ROOT_DIR = r"d:\LAB_VINUNI\P-101"

folders_to_scan = [
    os.path.join(ROOT_DIR, "frontend", "public", "VINpng"),
    os.path.join(ROOT_DIR, "static", "uploads"),
]

uploaded_urls = {}

def upload_file(local_path, blob_pathname):
    url = f"https://blob.vercel-storage.com/{urllib.parse.quote(blob_pathname)}"
    with open(local_path, "rb") as f:
        data = f.read()
    
    size_mb = len(data) / (1024 * 1024)
    print(f"⏳ Uploading {blob_pathname} ({size_mb:.2f} MB)...")
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "x-api-version": "7",
            "Content-Type": "application/octet-stream"
        },
        method="PUT"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            blob_url = res_json.get("url")
            print(f"✅ Success: {blob_url}")
            return blob_url
    except Exception as e:
        print(f"❌ Error uploading {blob_pathname}: {e}")
        return None

for folder in folders_to_scan:
    if not os.path.exists(folder):
        continue
    for root, dirs, files in os.walk(folder):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in [".png", ".jpg", ".jpeg", ".svg", ".webp", ".mp4"]:
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, ROOT_DIR).replace("\\", "/")
                
                # Determine blob pathname
                if rel_p.startswith("static/uploads/"):
                    blob_path = rel_p # e.g. static/uploads/cars/VF3_Eco.jpg
                else:
                    blob_path = rel_p.replace("frontend/public/", "").replace("frontend/", "")
                
                blob_url = upload_file(full_p, blob_path)
                if blob_url:
                    uploaded_urls[rel_p] = blob_url
                    uploaded_urls[blob_path] = blob_url

# Write mapping to JSON
mapping_file = os.path.join(ROOT_DIR, "frontend", "src", "lib", "blob_mapping.json")
with open(mapping_file, "w", encoding="utf-8") as f:
    json.dump(uploaded_urls, f, indent=2, ensure_ascii=False)

print(f"\n🎉 Finished uploading {len(uploaded_urls)} files to Vercel Blob!")
print(f"Mapping saved to {mapping_file}")
