"""
Script untuk menghapus background dari gambar menggunakan rembg
Install dependencies: pip install rembg pillow
"""

import os
from rembg import remove
from PIL import Image
import glob

def remove_background(input_path, output_path):
    """
    Menghapus background dari gambar dan menyimpan sebagai PNG transparan
    
    Args:
        input_path: Path ke file gambar input (JPG/PNG)
        output_path: Path ke file output (PNG dengan transparan)
    """
    try:
        # Baca gambar
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Hapus background menggunakan rembg
        output_data = remove(input_data)
        
        # Simpan sebagai PNG (format yang mendukung transparansi)
        with open(output_path, 'wb') as output_file:
            output_file.write(output_data)
        
        print(f"Berhasil: {input_path} -> {output_path}")
        return True
    except Exception as e:
        print(f"Error pada {input_path}: {str(e)}")
        return False

def process_all_images():
    """Proses semua gambar di folder images"""
    
    # Daftar folder dan file yang akan diproses
    image_paths = [
        # Avatar di folder avatars
        ("images/avatars/avatar-1.jpg", "images/avatars/avatar-1.png"),
        ("images/avatars/avatar-2.jpg", "images/avatars/avatar-2.png"),
        ("images/avatars/avatar-3.jpg", "images/avatars/avatar-3.png"),
        ("images/avatars/avatar-4.jpg", "images/avatars/avatar-4.png"),
        ("images/avatars/avatar-5.jpg", "images/avatars/avatar-5.png"),
        
        # Hero character
        ("images/hero-character.jpg", "images/hero-character.png"),
        
        # Icons
        ("images/icon-1.jpg", "images/icon-1.png"),
        ("images/icon-2.jpg", "images/icon-2.png"),
        ("images/icon-3.jpg", "images/icon-3.png"),
        ("images/icon-4.jpg", "images/icon-4.png"),
    ]
    
    print("=" * 60)
    print("Menghapus Background dari Gambar")
    print("=" * 60)
    print()
    
    success_count = 0
    total_count = len(image_paths)
    
    for input_path, output_path in image_paths:
        # Cek apakah file input ada
        if not os.path.exists(input_path):
            print(f"File tidak ditemukan: {input_path}")
            continue
        
        # Proses gambar
        if remove_background(input_path, output_path):
            success_count += 1
    
    print()
    print("=" * 60)
    print(f"Selesai! {success_count}/{total_count} gambar berhasil diproses")
    print("=" * 60)
    print()
    print("Catatan:")
    print("- File output disimpan sebagai PNG dengan background transparan")
    print("- File original (JPG) tetap tersimpan")
    print("- Update path di HTML/JS untuk menggunakan file PNG")

if __name__ == "__main__":
    try:
        process_all_images()
    except ImportError:
        print("=" * 60)
        print("ERROR: Library tidak ditemukan!")
        print("=" * 60)
        print()
        print("Silakan install dependencies dengan perintah:")
        print("  pip install rembg pillow")
        print()
        print("Atau jika menggunakan pip3:")
        print("  pip3 install rembg pillow")
        print()
    except Exception as e:
        print(f"Error: {str(e)}")
