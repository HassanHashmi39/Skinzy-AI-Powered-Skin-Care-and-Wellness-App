
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import SkinAnalysisModel

app = Flask(__name__)
CORS(app)

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

    # Save image temporarily or process in-memory
    img_path = "temp_analysis.jpg"
    img.save(img_path)
    
    # Run AI Analysis safely passing medical profile
    try:
        results = analyzer.predict(img_path, medical_data)
        # os.remove(img_path) # Clean up
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI Server is running 🚀'})

if __name__ == '__main__':
    # Default port for ML server
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=False)
