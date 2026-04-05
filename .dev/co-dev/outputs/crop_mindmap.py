from PIL import Image

src = r'E:\zuri\mindmap-module-dependencies.png'
img = Image.open(src)
w, h = img.size

# crop top half and bottom half, resize each to 1800px wide
def save_crop(box, name):
    crop = img.crop(box)
    cw, ch = crop.size
    scale = 1800 / cw
    crop = crop.resize((1800, int(ch * scale)), Image.LANCZOS)
    crop.save(rf'E:\zuri\mindmap-{name}.png')

save_crop((0, 0, w, h//2), 'top')
save_crop((0, h//2, w, h), 'bottom')
print('done')
