# train.py
import os
import argparse
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

# Avoiding Beginner Mistakes:
# ❌ No validation split (Included in fit)
# ❌ Too many classes (Restricted to 5)

def train_skin_model():
    print("🧩 Step 4 & 5: Training Pipeline")
    
    # 1. Load Dataset
    print("1 -> Loading Dataset...")
    train_dir = "dataset/train"
    val_dir = "dataset/val"

    if not os.path.exists(train_dir):
        print(f"Waiting for dataset directory at {train_dir}")
        print("Please structure your dataset as:")
        print("dataset/train/acne/\ndataset/train/wrinkles/\n...etc")
        return

    # Using rescaling as per Step 5
    train_data = ImageDataGenerator(rescale=1./255)
    
    train = train_data.flow_from_directory(
        train_dir,
        target_size=(224,224),
        batch_size=32,
        class_mode='categorical'
    )

    val_images = sum(len(files) for _, _, files in os.walk(val_dir)) if os.path.exists(val_dir) else 0

    if os.path.exists(val_dir) and val_images > 0:
        val_data = ImageDataGenerator(rescale=1./255)
        val = val_data.flow_from_directory(
            val_dir,
            target_size=(224,224),
            batch_size=32,
            class_mode='categorical'
        )
    else:
        print("⚠️ Warning: Validation directory is empty or missing! Creating automatic 20% split from training data.")
        train_data = ImageDataGenerator(rescale=1./255, validation_split=0.2)
        train = train_data.flow_from_directory(train_dir, target_size=(224,224), batch_size=32, class_mode='categorical', subset='training')
        val = train_data.flow_from_directory(train_dir, target_size=(224,224), batch_size=32, class_mode='categorical', subset='validation')

    # 2. Load Model (Transfer Learning)
    print("2 -> Loading MobileNetV2 Base Model...")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze base model parameters so we only train our layers
    for layer in base_model.layers:
        layer.trainable = False

    # 3. Add Your Layers (Multi-Label Real-World Architecture)
    print(f"3 -> Adding Custom Layers for {len(train.class_indices)} Classes...")
    x = GlobalAveragePooling2D()(base_model.output)
    # Changed from 'softmax' to 'sigmoid' so each disease gets its own independent 0-100% probability score!
    output = Dense(len(train.class_indices), activation='sigmoid')(x) 

    model = Model(inputs=base_model.input, outputs=output)
    # Changed from 'categorical_crossentropy' to 'binary_crossentropy' to allow overlapping diseases!
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # 4. Train Model
    print("4 -> Training Model...")
    model.fit(train, validation_data=val, epochs=10)

    # 5. Save Model
    print("5 -> Saving Model...")
    os.makedirs("model", exist_ok=True)
    model.save("model/skinzy_model.h5")
    print("✅ Model successfully saved to model/skinzy_model.h5")

if __name__ == "__main__":
    train_skin_model()
