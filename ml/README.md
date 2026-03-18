
# Skinzy AI Skin Analysis Model

This module contains the AI model for skin analysis, condition level assessment, and product recommendations.

## Features
1. **Skin Disease Detection**: Identifies Acne, Eczema, Psoriasis, Rosacea, Fungal Infection, Dark Circles, Pigmentation, and Healthy Skin.
2. **Condition Assessment**: Categorizes skin into Low, Moderate, or Good condition.
3. **Pakistani Product Recommendations**: Suggests products from local brands like Jenpharm, Vince, Saeed Ghani, CoNatural, and Hemani.

## Setup Instructions

### 1. Install Dependencies
Ensure you have Python 3.9+ installed, then run:
```bash
pip install -r requirements.txt
```

### 2. Run the AI Server
To start the API that the mobile app calls:
```bash
python app.py
```
The server will run on `http://localhost:5005`.

### 3. Training the Model
If you have your own dataset:
1. Organize your dataset into folders (one folder per disease).
2. Run the training script:
```bash
python train.py --data /path/to/your/dataset --epochs 20
```
This will save a `models/skin_model.h5` file.

## Project Structure
- `config.py`: Contains categories, levels, and product data.
- `model.py`: Core logic for prediction and model architecture.
- `app.py`: Flask API to serve the model to the mobile app.
- `train.py`: Script to train the model using transfer learning (MobileNetV2).
