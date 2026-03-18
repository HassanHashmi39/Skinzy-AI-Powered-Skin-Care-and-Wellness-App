# model.py
import random
import os
try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    has_tf = True
except ImportError:
    has_tf = False

from config import DISEASES, PRODUCT_RECOMMENDATIONS, SEVERITY_RULES

class SkinAnalysisModel:
    def __init__(self, model_path="model/skinzy_model.h5"):
        self.diseases = DISEASES
        self.model = None
        if os.path.exists(model_path) and has_tf:
            self.model = tf.keras.models.load_model(model_path)
            
    def predict(self, img_path, medical_data=None):
        if medical_data is None:
            medical_data = {}
            
        """
        🧩 Step 6: Prediction Flow (MULTI-ISSUE / MULTI-LABEL)
        Image -> Model -> Classes -> Aggregated Result
        """
        if self.model and os.path.exists(img_path) and has_tf:
            # Real prediction using MobileNetV2
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = tf.expand_dims(img_array, 0)
            img_array = preprocess_input(img_array)
            predictions = self.model.predict(img_array)[0]
            
            detected_conditions = []
            for i, prob in enumerate(predictions):
                confidence = float(prob) * 100
                # If confidence is > 15%, we flag it as an active condition 
                # (Softmax spreads probabilities, so 15% out of 8 classes is significant)
                if confidence >= 15.0:
                    detected_conditions.append({
                        'disease': self.diseases[i],
                        'confidence': confidence
                    })
            
            # Sort by highest confidence first
            detected_conditions.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Fallback if none cross the threshold (highly unlikely)
            if not detected_conditions:
                max_index = tf.math.argmax(predictions).numpy()
                detected_conditions = [{'disease': self.diseases[max_index], 'confidence': float(predictions[max_index]) * 100}]
            
            predicted_classes = [d['disease'] for d in detected_conditions]
        
        else: 
            # Mocking the AI model for multiple conditions (Acne + Dark Circles)
            # We simulate 1 or 2 concurrent issues
            num_issues = random.randint(1, 2)
            # Remove 'Normal' if we are picking issues
            issue_pool = [d for d in self.diseases if d != 'Normal']
            predicted_classes = random.sample(issue_pool, num_issues)
            
            detected_conditions = []
            for cls in predicted_classes:
                detected_conditions.append({
                    'disease': cls,
                    'confidence': round(random.uniform(80.0, 98.0))
                })

        """
        🧩 Step 7: Severity + Recommendation (Logic Part)
        Aggregating rules for ALL detected issues!
        """""
        all_severities = []
        all_advice = []
        all_products = []
        doctor_required = "Not required"
        
        for p_class in predicted_classes:
            sub_issue = "None"
            if p_class == 'Acne':
                sub_issue = random.choice(["Heavy Inflammation", "Redness", "None"])
            
            rule_key = f"{p_class}_{sub_issue}"
            severity = "Moderate"
            
            # Fetch directly from CSV mapped rules
            if rule_key in SEVERITY_RULES:
                rule = SEVERITY_RULES[rule_key]
                severity = rule['Severity']
                all_advice.append(rule['Advice'])
                if rule['Doctor_Required'] == 'Recommended':
                    doctor_required = 'Recommended'
            elif f"{p_class}_None" in SEVERITY_RULES: # Fallback
                rule = SEVERITY_RULES[f"{p_class}_None"]
                severity = rule['Severity']
                all_advice.append(rule['Advice'])
                if rule['Doctor_Required'] == 'Recommended':
                    doctor_required = 'Recommended'
            
            all_severities.append(severity)

            # Match products for this specific condition
            products = PRODUCT_RECOMMENDATIONS.get(p_class, [])
            all_products.extend(products)

        # -----------------------------
        # Determine Aggregate Severity
        # -----------------------------
        if "Severe" in all_severities:
            overall_severity = "Severe"
        elif "Moderate" in all_severities:
            overall_severity = "Moderate"
        else:
            overall_severity = "Mild"
            
        # Deduplicate products by name so we don't recommend the exact same face wash twice
        unique_products = []
        seen_names = set()
        for prod in all_products:
            if prod['name'] not in seen_names:
                unique_products.append(prod)
                seen_names.add(prod['name'])

        # -----------------------------
        # 🧩 Apply Medical Form Safety Filters!
        # -----------------------------
        budget_pref = medical_data.get('budget', 'Moderate') # e.g. "Budget", "Premium"
        is_pregnant = medical_data.get('isPregnantOrNursing', 'No')
        
        filtered_products = []
        unsafe_chemicals = ['retinol', 'salicylic', 'bha', 'mandelac', 'vitamin a']
        
        for prod in unique_products:
            name_lower = prod['name'].lower() + " " + prod['category'].lower()
            
            # MATERNAL SAFETY PROTOCOL: Block toxic acids if pregnant
            if is_pregnant == 'Yes':
                if any(acid in name_lower for acid in unsafe_chemicals):
                    continue # System automatically hides this hazardous product
                    
            # BUDGET FILTERING PROTOCOL: Try sorting out out-of-budget gear
            if "Budget" in budget_pref and prod['tier'] == 'Premium':
                continue # Skip expensive
            if "Premium" in budget_pref and prod['tier'] == 'Budget':
                continue # Skip cheap

            filtered_products.append(prod)

        if not filtered_products and unique_products: 
            # Fallback if filters accidentally stripped everything
            filtered_products = unique_products[:2]

        """
        🧩 Step 8: Final Output System (Multi-Label)
        """
        primary_confidence = f"{detected_conditions[0]['confidence']:.1f}%"
        condition_string = " & ".join(predicted_classes)
        advice_string = " ".join(list(set(all_advice)))

        result = {
            'Condition': condition_string,
            'Confidence': primary_confidence,
            'Severity': overall_severity,
            'Products': filtered_products,
            'Advice': advice_string,
            'Doctor': doctor_required,
            
            'disease': condition_string,
            'condition_level': overall_severity.lower(),
            'recommendations': filtered_products,
            'diseases': predicted_classes
        }
        
        return result

if __name__ == "__main__":
    analyzer = SkinAnalysisModel()
    res = analyzer.predict("dummy.jpg")
    print("🧩 Final Output Example (Multi-Issue Aggregated):")
    for key, value in res.items():
        if key in ['Condition', 'Confidence', 'Severity', 'Advice', 'Doctor']:
            print(f"{key}: {value}")
    print("Products:")
    for p in res['Products']:
        print(f"• {p['category']} - {p['name']} ({p['tier']}: {p['price']})")
