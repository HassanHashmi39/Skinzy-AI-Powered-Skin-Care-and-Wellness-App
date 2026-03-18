# dataset_setup.py
import os
from PIL import Image
import numpy as np
from config import DISEASES

# 🧩 Step 1: Matching your exact folder structure rule!
def create_training_dataset_structure(base_dir="dataset", images_per_class=10):
    print("🧩 Generating Face Data Placeholders mapped to your Step 1 Directories...\n")

    for subset in ["train", "val"]:
        for disease in DISEASES:
            # We enforce exactly the 5 classes: acne, wrinkles, pigmentation, dark_circles, normal
            # converting them to lowercase for clean Linux paths
            folder_name = disease.lower().replace(" ", "_").replace("/", "_")
            disease_path = os.path.join(base_dir, subset, folder_name)
            
            # Ensure directories exist
            os.makedirs(disease_path, exist_ok=True)
            
            # Generate dummy RGB noise image placeholders representing human faces
            for i in range(images_per_class):
                file_path = os.path.join(disease_path, f"{subset}_dummy_face_{i}.jpg")
                if not os.path.exists(file_path):
                    random_data = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
                    img = Image.fromarray(random_data)
                    img.save(file_path)
            
            print(f"✅ Generated {images_per_class} face images in {disease_path}/")

if __name__ == "__main__":
    create_training_dataset_structure()
    print("\n🚀 SUCCESS! The dataset is filled strictly mimicking Step 1.")
    print("Your Step 4 Pipeline ('Load Dataset -> Normalize -> Train') is now clear to execute!")
    print("Run `python3 train.py` to trigger step 4!")
