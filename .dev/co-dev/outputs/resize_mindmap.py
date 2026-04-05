from PIL import Image

src = r'E:\zuri\mindmap-module-dependencies.png'
dst = r'E:\zuri\mindmap-preview.png'

img = Image.open(src)
print(f'Original size: {img.size}')

# resize to max 1800px wide, keep aspect ratio
max_w = 1800
w, h = img.size
if w > max_w:
    ratio = max_w / w
    img = img.resize((max_w, int(h * ratio)), Image.LANCZOS)

img.save(dst)
print(f'Saved preview: {img.size} → {dst}')
