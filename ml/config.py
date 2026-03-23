# config.py
import csv
import os

# 🧩 Step 1: Real Dataset Classes Structure (Alphabetical for Keras mappings)
DISEASES = [
    'Acne Vulgaris',
    'Actinic Keratosis',
    'Basal Cell Carcinoma',
    'Bullous Disease',
    'Cellulitis',
    'Comedones',
    'Contact Dermatitis',
    'Cystic Acne',
    'Dark Circles',
    'Eczema (Atopic Dermatitis)',
    'Enlarged Pores',
    'Exanthems and Drug Eruptions',
    'Folliculitis',
    'Freckles',
    'Fungal Acne',
    'Fungal Infection (Tinea Faciei)',
    'Herpes Simplex (Cold Sores)',
    'Hormonal Acne',
    'Impetigo',
    'Keratosis Pilaris',
    'Lentigines',
    'Lupus',
    'Melanoma',
    'Melasma',
    'Milia',
    'Normal',
    'Perioral Dermatitis',
    'Post-Inflammatory Hyperpigmentation (PIH)',
    'Psoriasis',
    'Rosacea',
    'Sebaceous Hyperplasia',
    'Seborrheic Dermatitis',
    'Seborrheic Keratosis',
    'Skin Tags',
    'Squamous Cell Carcinoma',
    'Systemic Disease',
    'Urticaria',
    'Vascular Tumors',
    'Vasculitis',
    'Vitiligo',
    'Warts',
    'Wrinkles'
]


# 🧩 Load directly from the CSV metadata mapped to Step 1 & 7
def load_products_from_csv():
    filepath = os.path.join(os.path.dirname(__file__), 'metadata', 'products.csv')
    products_map = {}
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found!")
        return products_map
        
    with open(filepath, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            cond = row['Condition']
            if cond not in products_map:
                products_map[cond] = []
            products_map[cond].append({
                'category': row['Category'],
                'name': row['Name'],
                'brand': row['Brand'],
                'price': row['Price'],
                'tier': row['Tier']
            })
    return products_map

def load_severity_from_csv():
    filepath = os.path.join(os.path.dirname(__file__), 'metadata', 'severity.csv')
    severity_map = {}
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found!")
        return severity_map
        
    with open(filepath, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            cond = row['Condition']
            key = f"{cond}_{row['Sub_Issue']}"
            severity_map[key] = {
                'Severity': row['Severity'],
                'Advice': row['Advice'],
                'Doctor_Required': row['Doctor_Required'],
                'Dos': row.get('Dos', ''),
                'Donts': row.get('Donts', ''),
                'Morning_Routine': row.get('Morning_Routine', ''),
                'Night_Routine': row.get('Night_Routine', '')
            }
    return severity_map

def load_remedies_from_csv():
    filepath = os.path.join(os.path.dirname(__file__), 'metadata', 'remedies.csv')
    remedies_map = {}
    if not os.path.exists(filepath):
        return remedies_map
    with open(filepath, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            remedies_map[row['Condition']] = [row['Remedy_1'], row['Remedy_2'], row['Remedy_3']]
    return remedies_map

PRODUCT_RECOMMENDATIONS = load_products_from_csv()
SEVERITY_RULES = load_severity_from_csv()
HOME_REMEDIES = load_remedies_from_csv()
