import sys
from PIL import Image, ImageFilter

def remove_white_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Flood fill from the corners to identify the outer white background
    visited = set()
    queue = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    for pt in queue:
        visited.add(pt)

    while queue:
        x, y = queue.pop(0)
        r, g, b, a = pixels[x, y]
        # Set outer white/light grey pixel to transparent
        pixels[x, y] = (r, g, b, 0)

        # Check 4 neighbors
        for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                nr, ng, nb, na = pixels[nx, ny]
                # If neighbor is near white (e.g. RGB all > 230 or difference small with white)
                if nr > 225 and ng > 225 and nb > 225:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
                elif nr > 190 and ng > 190 and nb > 190 and abs(nr-ng) < 25 and abs(ng-nb) < 25:
                    # Also catch anti-aliased greyish-white edge transitions
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Clean up any leftover edge halo by checking alpha transitions
    # Find bounding box of non-transparent area
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    # Save cleanly
    img.save(output_path, "PNG")
    print("Transparent PNG created successfully at:", output_path)

if __name__ == "__main__":
    remove_white_background(
        r"C:\Users\Jonathan\.gemini\antigravity\brain\f5e8e3d1-793c-41d4-9c9d-553e716ce6ee\dog_favicon_1784533196232.jpg",
        r"C:\Users\Jonathan\.gemini\antigravity\scratch\Pet-Web\public\favicon.png"
    )
    # Also copy to src/assets/icons/dog-favicon.png
    img_save = Image.open(r"C:\Users\Jonathan\.gemini\antigravity\scratch\Pet-Web\public\favicon.png")
    img_save.save(r"C:\Users\Jonathan\.gemini\antigravity\scratch\Pet-Web\src\assets\icons\dog-favicon.png", "PNG")
