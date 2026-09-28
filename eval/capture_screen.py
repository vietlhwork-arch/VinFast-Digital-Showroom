"""Desktop & Window Screenshot Utility.
Captures the real physical Windows desktop screen (like pressing PrintScreen)
by attaching to the active user window station (winsta0\\default).
"""

import ctypes
import sys
from datetime import datetime
from pathlib import Path
from PIL import ImageGrab

sys.stdout.reconfigure(encoding='utf-8')

def capture_desktop(output_path: str | Path | None = None) -> Path:
    """Capture the entire physical Windows screen and save as PNG."""
    user32 = ctypes.windll.user32

    # Attach to active user window station and desktop
    hwinsta = user32.OpenWindowStationW('winsta0', False, 0x0000037F)
    if hwinsta:
        user32.SetProcessWindowStation(hwinsta)

    hdesk = user32.OpenDesktopW('default', 0, False, 0x000001FF)
    if hdesk:
        user32.SetThreadDesktop(hdesk)

    # Capture physical display
    img = ImageGrab.grab(all_screens=True)

    if output_path is None:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_dir = Path("eval/reports/screenshots")
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"screenshot_{ts}.png"
    else:
        out_file = Path(output_path)
        out_file.parent.mkdir(parents=True, exist_ok=True)

    img.save(out_file)
    print(f"📸 Captured real desktop screen ({img.size[0]}x{img.size[1]}): {out_file.resolve()}")
    return out_file

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    capture_desktop(path)
