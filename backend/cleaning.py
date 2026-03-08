import pandas as pd
import re

def clean_data(df: pd.DataFrame):

    # -----------------------------
    # Clean Weight → KG
    # -----------------------------
    def convert_weight(value):
        if pd.isna(value):
            return 0
        value = str(value).lower()
        number = float(re.findall(r'\d+', value)[0])
        
        if "ton" in value:
            return number * 1000
        elif "lb" in value:
            return number * 0.453592
        else:
            return number

    df["Weight_kg"] = df["Weight"].apply(convert_weight)

    # -----------------------------
    # Clean Distance → KM
    # -----------------------------
    df["Distance_km"] = df["Distance"].str.extract(r'(\d+)').astype(float)

    # -----------------------------
    # Clean Freight Rate → Numeric
    # -----------------------------
    df["Freight_Rate_Clean"] = df["Freight_Rate"].str.extract(r'(\d+)').astype(float)

    # -----------------------------
    # Clean Equipment Type
    # -----------------------------
    df["Equipment_Type"] = df["Equipment_Type"].str.lower().str.strip()

    return df