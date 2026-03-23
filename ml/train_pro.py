
import os
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

def train_skin_model_pro():
    print("🚀 INDUSTRY UPGRADE (Optimized for CPU): Starting Production-Level Pipeline")
    
    # 1. Configuration (Optimized for speed/CPU without losing quality)
    BATCH_SIZE = 64 # Faster on CPU with vectorized ops
    EPOCHS = 5      # Quality over quantity
    IMG_SIZE = (160, 160) # Fast & Reliable
    train_dir = "dataset/train"
    model_save_path = "model/skinzy_model.h5"

    if not os.path.exists(train_dir):
        print(f"❌ Error: Dataset not found at {train_dir}")
        return

    # 2. PRO-GRADE Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20, 
        horizontal_flip=True, 
        zoom_range=0.1, 
        validation_split=0.2
    )

    train_gen = train_datagen.flow_from_directory(
        train_dir, 
        target_size=IMG_SIZE, 
        batch_size=BATCH_SIZE, 
        class_mode='categorical', 
        subset='training'
    )
    val_gen = train_datagen.flow_from_directory(
        train_dir, 
        target_size=IMG_SIZE, 
        batch_size=BATCH_SIZE, 
        class_mode='categorical', 
        subset='validation'
    )

    # 3. Dynamic Class Balancing
    print("⚖️ Calculating Class Weights...")
    from collections import Counter
    counts = Counter(train_gen.classes)
    total = sum(counts.values())
    num_classes = len(train_gen.class_indices)
    
    # Formula: total / (num_classes * count)
    class_weight_dict = {i: total / (num_classes * count) for i, count in counts.items()}
    print(f"✅ Generated weights for {num_classes} classes.")

    # 4. Pro Model: MobileNetV2 + Multi-Layer Head
    print("🏗️ Building MobileNetV2 Pro Head...")
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(160, 160, 3))
    
    # Unfreeze last 20 layers for better precision
    base_model.trainable = True
    for layer in base_model.layers[:-20]:
        layer.trainable = False

    x = GlobalAveragePooling2D()(base_model.output)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.4)(x)
    output = Dense(num_classes, activation='sigmoid')(x)

    model = Model(inputs=base_model.input, outputs=output)
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4), loss='binary_crossentropy', metrics=['accuracy'])

    # 5. Efficiency Callbacks
    callbacks = [
        EarlyStopping(patience=3, restore_best_weights=True),
        ReduceLROnPlateau(factor=0.5, patience=2)
    ]

    # 6. Training Execution
    print(f"🔥 Starting Training Engine for {EPOCHS} Epochs...")
    model.fit(
        train_gen, 
        validation_data=val_gen, 
        epochs=EPOCHS, 
        class_weight=class_weight_dict, 
        callbacks=callbacks
    )

    print(f"\n✅ SUCCESS: Model saved at {model_save_path}")
    model.save(model_save_path)

if __name__ == "__main__":
    train_skin_model_pro()
