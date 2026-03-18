# config.py
import csv
import os

# 🧩 Step 1: Real Dataset Classes Structure (Alphabetical for Keras mappings)
DISEASES = [
    'Acne',
    'Dark Circles',
    'Dermatitis Perioral',
    'Milia',
    'Normal',
    'Pigmentation',
    'Rosacea',
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
                'Doctor_Required': row['Doctor_Required']
            }
    return severity_map

PRODUCT_RECOMMENDATIONS = load_products_from_csv()
SEVERITY_RULES = load_severity_from_csv()
