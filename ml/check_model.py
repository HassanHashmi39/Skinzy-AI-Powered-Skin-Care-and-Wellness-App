
import tensorflow as tf
import os

model_path = os.path.join("ml", "model", "skinzy_model.h5")
if os.path.exists(model_path):
    model = tf.keras.models.load_model(model_path)
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
else:
    print("Model not found")
