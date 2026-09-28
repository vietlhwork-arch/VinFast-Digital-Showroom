import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from src.main import app

# Export ASGI app for Vercel Serverless Handler
__all__ = ["app"]
