import os, shutil

def sync_folders():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    src_esc_1 = os.path.join(project_root, "static", "uploads", "escooters")
    dst_mot_1 = os.path.join(project_root, "static", "uploads", "motorbikes")
    
    src_esc_2 = os.path.join(project_root, "frontend", "public", "static", "uploads", "escooters")
    dst_mot_2 = os.path.join(project_root, "frontend", "public", "static", "uploads", "motorbikes")
    
    os.makedirs(dst_mot_1, exist_ok=True)
    os.makedirs(dst_mot_2, exist_ok=True)
    
    # Copy all files to motorbikes
    for s_dir, d_dir in [(src_esc_1, dst_mot_1), (src_esc_2, dst_mot_2)]:
        if os.path.exists(s_dir):
            for item in os.listdir(s_dir):
                s_path = os.path.join(s_dir, item)
                d_path = os.path.join(d_dir, item)
                if os.path.isfile(s_path):
                    shutil.copy2(s_path, d_path)
            # Remove legacy escooters folder
            try:
                shutil.rmtree(s_dir)
                print(f"Removed legacy folder {s_dir}")
            except Exception as e:
                print(f"Notice removing {s_dir}: {e}")

    print("✅ Successfully consolidated escooters -> motorbikes static folders!")

if __name__ == "__main__":
    sync_folders()
