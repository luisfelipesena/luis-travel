#!/usr/bin/env python3
"""Generate logo assets from SVG files."""

import subprocess
import sys

def install_deps():
    """Install required dependencies."""
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cairosvg", "Pillow", "-q"])

try:
    import cairosvg
    from PIL import Image
    import io
except ImportError:
    print("Installing dependencies...")
    install_deps()
    import cairosvg
    from PIL import Image
    import io

from pathlib import Path

PUBLIC_DIR = Path(__file__).parent.parent / "public"

def svg_to_png(svg_path: Path, output_path: Path, size: int):
    """Convert SVG to PNG at specified size."""
    png_data = cairosvg.svg2png(
        url=str(svg_path),
        output_width=size,
        output_height=size
    )
    with open(output_path, "wb") as f:
        f.write(png_data)
    print(f"Created: {output_path.name} ({size}x{size})")

def create_favicon(icon_svg: Path, output_path: Path):
    """Create favicon.ico with multiple sizes."""
    sizes = [16, 32, 48]
    images = []

    for size in sizes:
        png_data = cairosvg.svg2png(
            url=str(icon_svg),
            output_width=size,
            output_height=size
        )
        img = Image.open(io.BytesIO(png_data))
        images.append(img)

    images[0].save(
        output_path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:]
    )
    print(f"Created: {output_path.name} (16x16, 32x32, 48x48)")

def main():
    icon_svg = PUBLIC_DIR / "luis-travel-icon.svg"
    logo_svg = PUBLIC_DIR / "luis-travel-logo.svg"

    if not icon_svg.exists():
        print(f"Error: {icon_svg} not found")
        return 1

    # Generate PWA icons from icon SVG
    svg_to_png(icon_svg, PUBLIC_DIR / "logo192.png", 192)
    svg_to_png(icon_svg, PUBLIC_DIR / "logo512.png", 512)

    # Generate favicon
    create_favicon(icon_svg, PUBLIC_DIR / "favicon.ico")

    # Generate icon PNG for inline use
    svg_to_png(icon_svg, PUBLIC_DIR / "luis-travel-icon.png", 200)

    # Generate logo PNG for header use
    if logo_svg.exists():
        png_data = cairosvg.svg2png(
            url=str(logo_svg),
            output_width=400,
            output_height=120
        )
        output_path = PUBLIC_DIR / "luis-travel-logo.png"
        with open(output_path, "wb") as f:
            f.write(png_data)
        print(f"Created: {output_path.name} (400x120)")

    print("\nAll logo assets generated successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
