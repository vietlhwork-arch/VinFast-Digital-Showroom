import re

file_path = "frontend/src/components/AdminDashboardModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace TabType
content = content.replace("type TabType = 'users' | 'cars' | 'escooters' | 'quotes' | 'bookings';", "type TabType = 'users' | 'cars' | 'motorbikes' | 'quotes' | 'bookings';")
# Replace state
content = content.replace("const [escooters, setEscooters] = useState<any[]>([]);", "const [motorbikes, setMotorbikes] = useState<any[]>([]);")
content = content.replace("setEscooters(sList || []);", "setMotorbikes(sList || []);")
# Replace tab ID
content = content.replace("activeTab === 'escooters'", "activeTab === 'motorbikes'")
content = content.replace("id: 'escooters'", "id: 'motorbikes'")
content = content.replace("isScooterTab = activeTab === 'escooters'", "isScooterTab = activeTab === 'motorbikes'")
content = content.replace("type: 'escooter'", "type: 'motorbike'")
content = content.replace("type === 'escooter'", "type === 'motorbike'")
content = content.replace("{escooters.length}", "{motorbikes.length}")
content = content.replace("{escooters", "{motorbikes")
content = content.replace("setEscooters((prev)", "setMotorbikes((prev)")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Refactored escooters -> motorbikes in AdminDashboardModal.tsx")
