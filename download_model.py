
import urllib.request
import sys
import os

url = "https://ml-site.cdn-apple.com/models/sharp/sharp_2572gikvuh.pt"
filename = "sharp_2572gikvuh.pt"

def clean_file():
    if os.path.exists(filename):
        os.remove(filename)

print(f"Downloading {url} to {filename}...")
try:
    clean_file()
    urllib.request.urlretrieve(url, filename)
    print("Download complete.")
    print(f"File size: {os.path.getsize(filename)} bytes")
except Exception as e:
    print(f"Download failed: {e}")
    sys.exit(1)
