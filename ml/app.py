
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import SkinAnalysisModel

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize the model
analyzer = SkinAnalysisModel()

@app.route('/analyze', methods=['POST'])
def analyze_skin():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    img = request.files['image']
    
    # 🧩 New: Extract patient medical data if provided
    medical_data_str = request.form.get('medical_data', None)
    medical_data = {}
    if medical_data_str:
        try:
            medical_data = json.loads(medical_data_str)
        except:
            pass

    # Save image using absolute path so it works regardless of working directory
    img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_analysis.jpg")
    img.save(img_path)
    
    # Run AI Analysis safely passing medical profile
    try:
        results = analyzer.predict(img_path, medical_data)
        print(f"Prediction results: {results['Condition']} (Confidence: {results['Confidence']})")
        # os.remove(img_path) # Clean up
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI Server is running 🚀'})

if __name__ == '__main__':
    # Default port for ML server
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
