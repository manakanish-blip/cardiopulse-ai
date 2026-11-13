import os
import urllib.request
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

# 1. Automatically download the dataset if it doesn't exist
os.makedirs("data", exist_ok=True)
csv_path = "data/heart.csv"

if not os.path.exists(csv_path):
    print("Downloading heart disease dataset automatically...")
    url = "https://raw.githubusercontent.com/sharmaroshan/Heart-UCI-Dataset/master/heart.csv"
    urllib.request.urlretrieve(url, csv_path)
    print("Download complete!")

# 2. Load dataset
df = pd.read_csv(csv_path)
X = df.drop("target", axis=1)
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. Build Preprocessing + XGBoost Pipeline
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss"
    ))
])

# 4. Validate & Fit
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(pipeline, X, y, cv=cv, scoring="roc_auc")

pipeline.fit(X_train, y_train)
preds = pipeline.predict(X_test)
probs = pipeline.predict_proba(X_test)[:, 1]

print(f"Test Accuracy: {accuracy_score(y_test, preds):.4f}")
print(f"Test ROC-AUC:  {roc_auc_score(y_test, probs):.4f}")
print(f"5-Fold CV AUC: {cv_scores.mean():.4f}")

# 5. Save model + feature importances
artifact = {
    "pipeline": pipeline,
    "features": list(X.columns),
    "importances": dict(zip(X.columns, pipeline.named_steps["model"].feature_importances_.tolist())),
    "metrics": {
        "accuracy": round(float(accuracy_score(y_test, preds)) * 100, 1),
        "roc_auc": round(float(roc_auc_score(y_test, probs)), 3)
    }
}

joblib.dump(artifact, "heart_pipeline.joblib")
print("Saved heart_pipeline.joblib successfully.")