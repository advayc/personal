"""Regenerate the Kodak JPEG crop assets used by the writing page.

Run from any directory with Pillow, NumPy, and scikit-image installed.
The interactive PSNR/SSIM charts are rendered by the website component.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from skimage.metrics import peak_signal_noise_ratio, structural_similarity


ASSET_DIR = Path(__file__).resolve().parent
INPUT_PATH = ASSET_DIR / "kodim20.png"
CROP_BOX = (200, 150, 350, 300)
QUALITIES = (95, 75, 50, 30, 10)

image = Image.open(INPUT_PATH).convert("RGB")
image_array = np.asarray(image)
reference_crop = image.crop(CROP_BOX)
reference_crop.save(ASSET_DIR / "kodak-original-crop.png")
original_size = INPUT_PATH.stat().st_size / 1024

print(f"Loaded {INPUT_PATH.name}: {image.width} × {image.height}, {original_size:.1f} KB")
print("Quality | File size (KB) | Ratio | PSNR (dB) | SSIM")

for quality in QUALITIES:
    jpeg_path = ASSET_DIR / f"kodim20_q{quality}.jpg"
    image.save(jpeg_path, "JPEG", quality=quality)
    compressed = Image.open(jpeg_path).convert("RGB")
    compressed_array = np.asarray(compressed)
    compressed_crop = compressed.crop(CROP_BOX)
    compressed_crop.save(ASSET_DIR / f"kodak-jpeg-q{quality}.png")

    # A clean, edge-to-edge side-by-side export with no chart frame or padding.
    comparison = Image.new("RGB", (reference_crop.width * 2, reference_crop.height))
    comparison.paste(reference_crop, (0, 0))
    comparison.paste(compressed_crop, (reference_crop.width, 0))
    comparison.save(ASSET_DIR / f"artifact_zoom_q{quality}.png")

    file_size = jpeg_path.stat().st_size / 1024
    ratio = original_size / file_size
    psnr = peak_signal_noise_ratio(image_array, compressed_array, data_range=255)
    ssim = structural_similarity(image_array, compressed_array, channel_axis=2, data_range=255)
    print(f"{quality:>7} | {file_size:>13.1f} | {ratio:>5.1f}:1 | {psnr:>9.2f} | {ssim:.3f}")
