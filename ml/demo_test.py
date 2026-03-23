
import os
import sys
import json

# Add current directory to path
sys.path.append('.')

from model import SkinAnalysisModel

def demo_analysis():
    print("🚀 Initializing Skinzy AI Analysis Demo...")
    analyzer = SkinAnalysisModel()
    
    test_images = [
        "dataset/test/acne_vulgaris/032839HB.jpg",
        "dataset/test/actinic_keratosis/actinic-keratosis-5FU-10.jpg",
        "dataset/test/psoriasis/08psoriasisAnus.jpg",
        "dataset/test/melasma/00000008.jpg"
    ]
    
    for img_path in test_images:
        print(f"\n--- Analyzing: {img_path} ---")
        if not os.path.exists(img_path):
            print(f"File not found: {img_path}")
            continue
            
        try:
            results = analyzer.predict(img_path)
            print(f"Condition: {results['Condition']}")
            print(f"Confidence: {results['Confidence']}")
            print(f"Severity: {results['Severity']}")
            print(f"Advice: {results['Advice']}")
            print(f"Doctor: {results['doctor']}")
            print("Morning Routine:")
            for step in results['morning_routine']:
                print(f"  • {step}")
            print("Night Routine:")
            for step in results['night_routine']:
                print(f"  • {step}")
            print("Home Remedies:")
            for r in results.get('remedies', []):
                print(f"  • {r}")
            print("Recommended Products:")
            for p in results['recommendations']:
                print(f"  • {p['brand']} {p['name']} ({p['price']})")
                
        except Exception as e:
            print(f"Error during analysis: {e}")

if __name__ == "__main__":
    demo_analysis()
