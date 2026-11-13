from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI(title="CardioPulse AI API", version="1.0.0")

# Allow React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

artifact = joblib.load("heart_pipeline.joblib")
pipeline = artifact["pipeline"]
feature_names = artifact["features"]

class PatientData(BaseModel):
    age: int = Field(..., ge=18, le=100)
    sex: int = Field(..., ge=0, le=1)
    cp: int = Field(..., ge=0, le=3)
    trestbps: int = Field(..., ge=80, le=220)
    chol: int = Field(..., ge=100, le=600)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: int = Field(..., ge=60, le=220)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=0.0, le=7.0)
    slope: int = Field(..., ge=0, le=2)
    ca: int = Field(..., ge=0, le=4)
    thal: int = Field(..., ge=0, le=3)

@app.get("/health")
def health_check():
    return {"status": "online", "metrics": artifact["metrics"]}

@app.post("/predict")
def predict_risk(data: PatientData):
    input_df = pd.DataFrame([data.model_dump()])[feature_names]
    prob = float(pipeline.predict_proba(input_df)[0][1])
    risk_percent = round(prob * 100, 1)

    if risk_percent < 30:
        tier = "Low Risk"
    elif risk_percent < 65:
        tier = "Moderate Risk"
    else:
        tier = "High Risk"

    drivers = []
    if data.cp > 0:
        drivers.append({"factor": "Atypical / Anginal Chest Pain", "impact": "+High", "value": f"Type {data.cp}"})
    if data.chol > 240:
        drivers.append({"factor": "Elevated Cholesterol", "impact": "+Moderate", "value": f"{data.chol} mg/dL"})
    if data.trestbps > 140:
        drivers.append({"factor": "Hypertension (Resting BP)", "impact": "+Moderate", "value": f"{data.trestbps} mmHg"})
    if data.thalach < 130:
        drivers.append({"factor": "Low Peak Heart Rate", "impact": "+Moderate", "value": f"{data.thalach} bpm"})
    if data.exang == 1:
        drivers.append({"factor": "Exercise-Induced Angina", "impact": "+High", "value": "Present"})
    if data.ca > 0:
        drivers.append({"factor": "Fluoroscopy Colored Vessels", "impact": "+High", "value": f"{data.ca} vessels"})

    if not drivers:
        drivers.append({"factor": "Optimal Baseline Vitals", "impact": "-Protective", "value": "Within range"})

    return {
        "risk_probability": risk_percent,
        "risk_tier": tier,
        "model_confidence": artifact["metrics"]["roc_auc"],
        "key_drivers": drivers[:4]
    }