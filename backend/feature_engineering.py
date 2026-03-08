from sklearn.preprocessing import LabelEncoder

def create_features(df):

    encoder = LabelEncoder()
    df["Equipment_Encoded"] = encoder.fit_transform(df["Equipment_Type"])

    X = df[["Distance_km", "Weight_kg", "Equipment_Encoded"]]
    y = df["Freight_Rate_Clean"]

    return X, y, encoder