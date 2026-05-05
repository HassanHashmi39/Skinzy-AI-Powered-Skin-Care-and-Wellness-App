# Skinzy AI Skin Analysis Model (Python/Flask) 🔬

This module is the core AI engine for the **Skinzy** application. It leverages computer vision and deep learning to analyze skin conditions, assess severity, and provide customized recommendations for patients and doctors.

---

## 🚀 Features

- **🛡️ Multi-Disease Detection**: 12+ skin categories supported, including Acne, Eczema, Psoriasis, Rosacea, Psoriasis, and Melanoma.
- **📊 Condition Assessment**: Intelligent categorization into Low, Moderate, or Good health condition.
- **🧪 Transfer Learning**: Uses **MobileNetV2** for high performance on both mobile and desktop (CPU/GPU).
- **🛍️ Verified Recommendations**: Suggests medical-grade and retail products from Pakistani brands (Jenpharm, Saeed Ghani, Vince, etc.).
- **⚡ Flask API**: High-speed REST API that integrates seamlessly with the Skinzy mobile/web app.

---

## 🛠 Tech Stack

- **Python**: 3.9+
- **Flask**: Web framework for API serving.
- **TensorFlow/Keras**: Deep learning engine.
- **OpenCV**: Image preprocessing and augmentation.
- **scikit-learn**: Data handling and class balancing.

---

## 📁 Project Structure

```text
ml/
├── app.py              # Flask API server
├── model.py            # AI model architecture and prediction logic
├── train_pro.py        # Optimized training script (with data augmentation)
├── config.py           # Condition levels, advice, and product data
├── requirements.txt    # Python dependencies
└── dataset/            # Skin disease image dataset
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
cd ml
pip install -r requirements.txt
```

### 2. Run the AI Server
```bash
python app.py
```
Wait for the status: `AI Server is running 🚀` at `http://localhost:5005`.

---

## 🧪 Training & Fine-tuning

### To train the model from scratch:
1.  Add images to `ml/dataset/` in labeled folders.
2.  Run the optimized training script:
    ```bash
    python train_pro.py --epochs 25 --batch_size 32
    ```
3.  The best model weights will be saved in `ml/model/`.

---

## 👨‍💻 Contribution
Developed by the Skinzy Team.
