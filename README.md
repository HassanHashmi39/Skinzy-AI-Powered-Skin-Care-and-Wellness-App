# Skinzy (AI-Powered Skin Care & Wellness App) ✨

Skinzy is a comprehensive, full-stack AI-driven application designed to revolutionize skin health. By combining advanced computer vision with personalized medical history, Skinzy provides professional-grade skin analysis, condition tracking, and localized product recommendations for Pakistani skin types.

---

## 🚀 Key Features

### 📋 For Patients
- **AI Skin Analysis**: Advanced disease detection (Acne, Eczema, Rosacea, etc.) using TensorFlow and MobileNetV2.
- **Personalized Action Plans**: Automated morning and night routines based on AI findings.
- **History Tracking**: Visual progress logs of your skin's health over time.
- **Smart Recommendations**: Product suggestions from top local brands (Jenpharm, Saeed Ghani, Vince, etc.) tailored to your condition.
- **Real-time Chat**: Secure messaging with dermatologists for professional advice.
- **Appointment Booking**: Seamlessly book and manage consultations with skin specialists.

### 🩺 For Doctors
- **Patient Dashboard**: Comprehensive view of patient history and AI analysis results.
- **Appointment Management**: Track and manage upcoming consultations.
- **Secure Communication**: Built-in chat system for remote diagnosis and support.

---

## 🛠 Tech Stack

- **Frontend**: [Expo](https://expo.dev) / React Native (Native iOS/Android & Web)
- **Backend API**: Node.js, Express, MongoDB
- **AI/ML Server**: Python, Flask, TensorFlow (MobileNetV2), OpenCV
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Hooks & Context API
- **Styling**: NativeWind (Tailwind CSS for React Native)

---

## 📂 Project Structure

```text
SkinzyApp/
├── app/                # React Native (Expo Router) Frontend
├── backend/            # Node.js + Express API
├── ml/                 # Python Flask AI Server & ML Model
├── components/         # Reusable UI Components
├── utils/              # API helpers and general utilities
├── hooks/              # Custom React hooks
└── constants/          # App-wide constants and styles
```

---

## ⚙️ Installation & Setup

### 1. Prerequisite
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 2. Global Dependencies
```bash
npm install -g expo-cli
```

### 3. Backend Setup
```bash
cd backend
npm install
# Create a .env file (refer to backend/README.md)
npm run dev
```

### 4. AI Server Setup
```bash
cd ml
pip install -r requirements.txt
python app.py
```

### 5. Frontend Setup
```bash
npm install
# To run on Web:
npm run web
# To run on Mobile (requires Expo Go app):
npm start
```

---

## 🧪 Training the AI Model
If you're interested in refining the model:
1. Ensure your dataset is in the `ml/dataset` directory.
2. Run `python ml/train_pro.py` for an optimized training pipeline.

---

## 🌐 Deployment Recommendation
For a free, full-stack deployment:
- **Frontend**: [Netlify](https://www.netlify.com/)
- **Backend**: [Render](https://render.com/) or [Koyeb](https://www.koyeb.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **AI Server**: [Hugging Face Spaces](https://huggingface.co/spaces) (Docker/Flask CPU)

---

## 👨‍💻 Contributors
Developed with ❤️ by the Skinzy Team.
