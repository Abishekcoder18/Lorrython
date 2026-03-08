import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def build_lane_intelligence(df):

    # -----------------------------
    # 1️⃣ Create Structured Lane ID
    # -----------------------------
    df["lane_id"] = (
        df["source"] + "_" +
        df["destination"] + "_" +
        df["equipment_type"] + "_" +
        df["service_level"]
    )

    # -----------------------------
    # 2️⃣ AI Clustering on Shipment Patterns
    # -----------------------------
    clustering_features = [
        "distance_km",
        "weight_kg",
        "volume_cbm",
        "predicted_freight_rate",
        "temperature_c"
    ]

    X = df[clustering_features].fillna(0)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=5, random_state=42)
    df["lane_cluster"] = kmeans.fit_predict(X_scaled)

    # -----------------------------
    # 3️⃣ Lane Benchmark Metrics
    # -----------------------------
    lane_summary = df.groupby("lane_id").agg({
        "shipment_id": "count",
        "freight_rate_clean": "mean",
        "predicted_freight_rate": "mean",
        "distance_km": "mean",
        "data_quality_score": "mean"
    }).reset_index()

    lane_summary.rename(columns={
        "shipment_id": "lane_volume",
        "freight_rate_clean": "avg_actual_rate",
        "predicted_freight_rate": "avg_predicted_rate",
        "distance_km": "avg_distance_km",
        "data_quality_score": "avg_data_quality"
    }, inplace=True)

    # -----------------------------
    # 4️⃣ AI Outlier Detection
    # -----------------------------
    df["rate_deviation"] = (
        df["freight_rate_clean"] - df["predicted_freight_rate"]
    )

    df["overpricing_flag"] = (
        abs(df["rate_deviation"]) >
        (df["predicted_freight_rate"] * 0.25)
    )

    # -----------------------------
    # 5️⃣ RFQ-Ready Dataset
    # -----------------------------
    rfq_dataset = lane_summary.copy()

    rfq_dataset["recommended_rate"] = rfq_dataset["avg_predicted_rate"]
    rfq_dataset["cost_saving_opportunity"] = (
        rfq_dataset["avg_actual_rate"] -
        rfq_dataset["avg_predicted_rate"]
    )

    return df, lane_summary, rfq_dataset