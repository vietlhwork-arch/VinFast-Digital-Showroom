import re

path = 'frontend/src/components/AdminDashboardModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace number input value attributes
pattern = r'value=\{carForm\.([a-zA-Z0-9_]+)\s*\|\|\s*(?:0|2024|270)\}'
def repl(match):
    field = match.group(1)
    return f"value={{renderNumVal(carForm.{field})}}"

new_content = re.sub(pattern, repl, content)

# Replace onChange for number inputs
pattern_change = r'onChange=\{\(e\)\s*=>\s*setCarForm\(\{\s*\.\.\.carForm,\s*([a-zA-Z0-9_]+):\s*Number\(e\.target\.value\)\s*\}\)\}'
def repl_change(match):
    field = match.group(1)
    return f"onChange={{(e) => setCarForm({{ ...carForm, {field}: e.target.value === '' ? '' : Number(e.target.value) }})}}"

new_content = re.sub(pattern_change, repl_change, new_content)

# Replace alert in handleSaveCarSubmit
old_alert = 'alert(`✅ ${successMsgText}`);'
new_modal_trigger = "triggerSuccessModal(editingCar ? 'Cập Nhật Thành Công!' : 'Thêm Mẫu Xe Thành Công!', successMsgText, editingCar ? 'edit' : 'add');"
new_content = new_content.replace(old_alert, new_modal_trigger)

# Replace delete alert
old_del = 'setMsg(`🎉 Đã xóa thành công ${targetType} ${targetName} khỏi PostgreSQL!`);'
new_del = """const delMsg = `Đã xóa thành công ${targetType} ${targetName} khỏi hệ thống!`;
      setMsg(delMsg);
      triggerSuccessModal('Xóa Thành Công!', delMsg, 'delete');"""
new_content = new_content.replace(old_del, new_del)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Successfully updated AdminDashboardModal.tsx script!')
