import pandas as pd
import re
from rapidfuzz import process, fuzz

# ----------------------------------
# MASTER DATA (Hybrid Approach)
# ----------------------------------

MASTER_CITIES = [
    "Chennai","Mumbai","Delhi","Bangalore","Hyderabad",
    "Kolkata","Pune","Ahmedabad","Jaipur","Surat",
    "Lucknow","Kanpur","Nagpur","Indore","Bhopal",
    "Patna","Ranchi","Chandigarh","Coimbatore","Madurai",
    "Trichy","Hosur","Cochi","Visakhapatnam","Vijayawada",
    "Raipur","Guwahati","Noida","Gurgaon","Varanasi"
]

MASTER_EQUIPMENT = ["FTL", "LTL", "REEFER", "FLATBED", "DRY VAN"]

# ----------------------------------
# 1️⃣ Schema Validation
# ----------------------------------

def validate_schema(df):
    required_columns = [
        "source", "destination", "shipment_date",
        "weight", "volume", "equipment_type",
        "carrier_name", "freight_rate",
        "shipment_id", "service_level",
        "temperature", "pickup_date",
        "loading_dock_type", "shipment_status",
        "vin", "payment_terms",
        "commodity_type", "distance",
        "driver_id"
    ]
    
    # 🚀 Smarter validation - check each column individually for clearer error messages
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")
    
    return df

# ----------------------------------
# 2️⃣ Unit Normalization
# ----------------------------------

def extract_number(value):
    if pd.isna(value):
        return 0
    
    # 🔥 FIX: Remove commas first to handle numbers like "3,091" correctly
    value = str(value).replace(",", "")
    
    numbers = re.findall(r'-?\d+\.?\d*', value)
    return float(numbers[0]) if numbers else 0

def convert_weight(value):
    value = str(value).lower()
    number = extract_number(value)
    if "ton" in value:
        return number * 1000
    elif "lb" in value:
        return number * 0.453592
    return number

def convert_temperature(value):
    value = str(value).replace("Â", "").lower()
    if "f" in value:
        number = extract_number(value)
        return (number - 32) * 5/9
    elif "c" in value:
        return extract_number(value)
    elif "frozen" in value:
        return -5
    elif "ambient" in value or "room" in value:
        return 25
    return 25

def normalize_units(df):
    df["weight_kg"] = df["weight"].apply(convert_weight)
    df["volume_cbm"] = df["volume"].apply(extract_number)
    df["distance_km"] = df["distance"].apply(extract_number)
    df["temperature_c"] = df["temperature"].apply(convert_temperature)
    df["freight_rate_clean"] = df["freight_rate"].apply(extract_number)
    return df

# ----------------------------------
# 3️⃣ Text Normalization
# ----------------------------------

def normalize_text_fields(df):
    text_columns = [
        "carrier_name", "service_level",
        "loading_dock_type", "shipment_status",
        "payment_terms", "commodity_type"
    ]
    
    for col in text_columns:
        df[col] = df[col].astype(str).str.lower().str.strip()
    
    # Fix encoding artifacts like Â
    df["temperature"] = (
        df["temperature"]
        .astype(str)
        .str.replace("Â", "", regex=False)
        .str.strip()
    )
    
    df["vin"] = df["vin"].astype(str).str.upper().str.replace(" ", "", regex=False)
    df["driver_id"] = df["driver_id"].astype(str).str.upper().str.replace(" ", "", regex=False)
    
    return df

# ----------------------------------
# 4️⃣ Fuzzy Location Normalization
# ----------------------------------

def fuzzy_match_city(value):
    if pd.isna(value):
        return None

    value_clean = str(value).strip().lower()

    # Lowercase master list for comparison
    master_lower = [city.lower() for city in MASTER_CITIES]

    match, score, _ = process.extractOne(
        value_clean,
        master_lower,
        scorer=fuzz.WRatio
    )

    if score >= 70:  # 70 is safe and strong
        # Return properly capitalized city from original MASTER_CITIES
        return MASTER_CITIES[master_lower.index(match)]

    return value.title().strip()

def normalize_locations(df):
    df["source"] = df["source"].apply(fuzzy_match_city)
    df["destination"] = df["destination"].apply(fuzzy_match_city)
    return df

# ----------------------------------
# 5️⃣ Equipment Normalization
# ----------------------------------

def normalize_equipment(df):
    def match_equipment(value):
        if pd.isna(value):
            return None
        
        match, score, _ = process.extractOne(
            value.upper(),
            MASTER_EQUIPMENT,
            scorer=fuzz.WRatio
        )
        
        if score >= 70:
            return match
        
        return value.upper().strip()
    
    df["equipment_type"] = df["equipment_type"].apply(match_equipment)
    return df

# ----------------------------------
# 6️⃣ Duplicate Removal
# ----------------------------------

def remove_duplicates(df):
    df = df.drop_duplicates(subset=["shipment_id"])
    return df

# ----------------------------------
# 7️⃣ Data Quality Score
# ----------------------------------

def data_quality_score(df):
    score = []
    
    for _, row in df.iterrows():
        s = 0
        if row["source"] in MASTER_CITIES:
            s += 10
        if row["destination"] in MASTER_CITIES:
            s += 10
        if row["weight_kg"] > 0:
            s += 10
        if row["distance_km"] > 0:
            s += 10
        if row["equipment_type"] in MASTER_EQUIPMENT:
            s += 10
        score.append(s)
    
    df["data_quality_score"] = score
    return df

# ----------------------------------
# 8️⃣ MASTER CLEANING FUNCTION
# ----------------------------------

def clean_shipment_data(df):
    df = validate_schema(df)
    df = normalize_units(df)
    df = normalize_text_fields(df)
    df = normalize_locations(df)
    df = normalize_equipment(df)
    df = remove_duplicates(df)
    df = data_quality_score(df)
    
    return df