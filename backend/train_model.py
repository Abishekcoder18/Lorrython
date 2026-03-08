import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import re

# -----------------------------
# Helper Functions
# -----------------------------

def extract_number(value):
    if pd.isna(value):
        return 0
    numbers = re.findall(r'-?\d+\.?\d*', str(value))
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

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv("dirty_logistics_dataset_1000.csv")

# -----------------------------
# Cleaning
# -----------------------------

df["Weight_kg"] = df["Weight"].apply(convert_weight)
df["Distance_km"] = df["Distance"].apply(extract_number)
df["Freight_Rate_Clean"] = df["Freight_Rate"].apply(extract_number)
df["Volume_cbm"] = df["Volume"].apply(extract_number)
df["Temperature_C"] = df["Temperature"].apply(convert_temperature)

df["Shipment_Date"] = pd.to_datetime(df["Shipment_Date"], errors="coerce")
df["Shipment_Month"] = df["Shipment_Date"].dt.month.fillna(1)

df["Equipment_Type"] = df["Equipment_Type"].astype(str).str.lower().str.strip()
df["Service_Level"] = df["Service_Level"].astype(str).str.lower().str.strip()

# -----------------------------
# Encoding
# -----------------------------

equipment_encoder = LabelEncoder()
service_encoder = LabelEncoder()

df["Equipment_Encoded"] = equipment_encoder.fit_transform(df["Equipment_Type"])
df["Service_Encoded"] = service_encoder.fit_transform(df["Service_Level"])

# -----------------------------
# Feature Selection
# -----------------------------

features = [
    "Distance_km",
    "Weight_kg",
    "Volume_cbm",
    "Temperature_C",
    "Shipment_Month",
    "Equipment_Encoded",
    "Service_Encoded"
]

X = df[features]
y = df["Freight_Rate_Clean"]

# -----------------------------
# Train/Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# Scaling
# -----------------------------

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# -----------------------------
# Model Training (Tuned)
# -----------------------------

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=15,
    min_samples_split=5,
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# Evaluation
# -----------------------------

pred = model.predict(X_test)

print("Model Performance:")
print("MAE:", mean_absolute_error(y_test, pred))
print("R2 Score:", r2_score(y_test, pred))

# -----------------------------
# Save Everything
# -----------------------------

joblib.dump(model, "ml_models/freight_model.pkl")
joblib.dump(equipment_encoder, "ml_models/equipment_encoder.pkl")
joblib.dump(service_encoder, "ml_models/service_encoder.pkl")
joblib.dump(scaler, "ml_models/scaler.pkl")

print("✅ Improved model trained and saved successfully!")