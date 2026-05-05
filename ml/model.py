# model.py
import os

try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing import image
    has_tf = True
except ImportError:
    has_tf = False

from config import DISEASES, PRODUCT_RECOMMENDATIONS, SEVERITY_RULES, HOME_REMEDIES

class SkinAnalysisModel:
    def __init__(self, model_path=None):
        self.diseases = DISEASES
        self.model = None
        # Always resolve model path relative to this file, not the working directory
        if model_path is None:
            model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model", "skinzy_model.h5")
        if os.path.exists(model_path) and has_tf:
            print(f"✅ Loading model from: {model_path}")
            self.model = tf.keras.models.load_model(model_path)
        else:
            print(f"❌ Model NOT found at: {model_path} | has_tf={has_tf}")
            
    def predict(self, img_path, medical_data=None):
        if medical_data is None or not isinstance(medical_data, dict):
            medical_data = {}
            
        """
        🧩 Step 6: Prediction Flow (MULTI-ISSUE / MULTI-LABEL)
        Image -> Model -> Classes -> Aggregated Result
        """
        if self.model and os.path.exists(img_path) and has_tf:
            # ✅ Real deterministic prediction using the trained model
            img = image.load_img(img_path, target_size=(160, 160))
            img_array = image.img_to_array(img)
            img_array = tf.expand_dims(img_array, 0)
            img_array = img_array / 255.0 # Match training rescale=1./255
            predictions = self.model.predict(img_array, verbose=0)[0]

            # --- Build full ranked list of all classes ---
            all_conditions = []
            for i, prob in enumerate(predictions):
                all_conditions.append({
                    'disease': self.diseases[i],
                    'confidence': float(prob) * 100
                })
            all_conditions.sort(key=lambda x: x['confidence'], reverse=True)

            # --- Primary condition: always the highest confidence class ---
            primary = all_conditions[0]
            detected_conditions = [primary]

            # --- Include a second condition ONLY if it is strongly present ---
            # Rule: 2nd class must have >= 20% confidence AND be >= 60% of top confidence
            if len(all_conditions) > 1:
                second = all_conditions[1]
                if (second['confidence'] >= 20.0 and
                        second['confidence'] >= 0.6 * primary['confidence'] and
                        second['disease'] != 'Normal'):
                    detected_conditions.append(second)

            predicted_classes = [d['disease'] for d in detected_conditions]

        else:
            # ❌ Model unavailable — return a clear error, never random results
            return {
                'error': 'AI model is not available. Please ensure the model file exists and TensorFlow is installed.',
                'Condition': 'Model Unavailable',
                'Confidence': '0.0%',
                'Severity': 'Unknown',
                'Products': [],
                'Advice': 'The AI model could not be loaded. Please contact support.',
                'doctor': 'Recommended',
                'dos': [],
                'donts': [],
                'morning_routine': [],
                'night_routine': [],
                'disease': 'Model Unavailable',
                'condition_level': 'unknown',
                'recommendations': [],
                'diseases': [],
                'is_uncertain': True,
                'remedies': []
            }

        """
        🧩 Step 7: Severity + Recommendation (Logic Part)
        Aggregating rules for ALL detected issues!
        """""
        all_severities = []
        all_advice = []
        all_products = []
        all_dos = []
        all_donts = []
        all_morning = []
        all_night = []
        doctor_required = "Not required"
        
        for p_class in predicted_classes:
            # Dynamically pick a sub-issue if it's available in SEVERITY_RULES
            # ✅ Deterministic: always use the first available sub-issue, never random
            available_sub_issues = [
                k.split('_')[1] for k in sorted(SEVERITY_RULES.keys())
                if k.startswith(f"{p_class}_") and k.split('_')[1] != "None"
            ]
            sub_issue = available_sub_issues[0] if available_sub_issues else "None"
            
            rule_key = f"{p_class}_{sub_issue}"
            severity = "Moderate"
            
            # Fetch directly from CSV mapped rules
            if rule_key in SEVERITY_RULES:
                rule = SEVERITY_RULES[rule_key]
                severity = rule['Severity']
                all_advice.append(rule['Advice'])
                all_dos.append(rule.get('Dos', ''))
                all_donts.append(rule.get('Donts', ''))
                all_morning.append(rule.get('Morning_Routine', ''))
                all_night.append(rule.get('Night_Routine', ''))
                if rule['Doctor_Required'] == 'Recommended':
                    doctor_required = 'Recommended'
            elif f"{p_class}_None" in SEVERITY_RULES: # Fallback
                rule = SEVERITY_RULES[f"{p_class}_None"]
                severity = rule['Severity']
                all_advice.append(rule['Advice'])
                all_dos.append(rule.get('Dos', ''))
                all_donts.append(rule.get('Donts', ''))
                all_morning.append(rule.get('Morning_Routine', ''))
                all_night.append(rule.get('Night_Routine', ''))
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
            
        # Deduplicate and format list strings
        def extract_list(raw_list):
            items = []
            for s in raw_list:
                items.extend([i.strip() for i in s.split(';') if i.strip()])
            return list(set(items))

        dos_list = extract_list(all_dos)
        donts_list = extract_list(all_donts)
        morning_routine = extract_list(all_morning)
        night_routine = extract_list(all_night)
            
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

        # 🧩 Step 8: Industrial Safety Protocol
        # If max confidence is low, flag for human verification
        is_uncertain = True
        if detected_conditions and detected_conditions[0]['confidence'] > 35.0:
            is_uncertain = False

        primary_confidence = f"{detected_conditions[0]['confidence']:.1f}%"
        condition_string = " & ".join(predicted_classes)
        advice_string = " ".join(list(set(all_advice)))

        if is_uncertain:
            advice_string = "🚨 LOW CONFIDENCE: AI is uncertain. This analysis is for educational purposes only. " + advice_string
            doctor_required = 'Recommended' # Force doctor recommendation if uncertain

        # 🧩 Remedies Collection
        remedies_list = []
        for p_class in predicted_classes:
            if p_class in HOME_REMEDIES:
                remedies_list.extend(HOME_REMEDIES[p_class])
        remedies_list = list(set(remedies_list))

        result = {
            'Condition': condition_string,
            'Confidence': primary_confidence,
            'Severity': overall_severity,
            'Products': filtered_products,
            'Advice': advice_string,
            'doctor': doctor_required,
            'dos': dos_list,
            'donts': donts_list,
            'morning_routine': morning_routine,
            'night_routine': night_routine,
            
            'disease': condition_string,
            'condition_level': overall_severity.lower(),
            'recommendations': filtered_products,
            'diseases': predicted_classes,
            'is_uncertain': is_uncertain,
            'remedies': remedies_list
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
