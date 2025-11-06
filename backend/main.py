import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os

# --- 1. Initialize FastAPI App ---
app = FastAPI(
    title="Nebula Lens API",
    description="API for cosmic object classification.",
    version="1.0.0"
)

# --- 2. Configure CORS ---
# This allows your React frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Define the Input Data Model (6 Features) ---
# This MUST match the order from your friend's training script
class CosmicFeatures(BaseModel):
    u: float  # UV filter
    g: float  # Green filter
    r: float  # Red filter
    i: float  # Near-Infrared filter
    z: float  # Infrared filter
    redshift: float

# --- 4. Load The Models AND THE SCALER ---
models_path = "./models/"
try:
    # Load the scaler
    scaler_path = os.path.join(models_path, 'star_classifier_scaler.joblib')
    scaler = joblib.load(scaler_path)
    
    # Load models
    model_svm = joblib.load(os.path.join(models_path, 'model_svm.joblib'))
    model_mlp = joblib.load(os.path.join(models_path, 'model_mlp.joblib'))
    model_knn = joblib.load(os.path.join(models_path, 'model_knn.joblib'))
    model_rf = joblib.load(os.path.join(models_path, 'model_rf.joblib'))
    
    # Store models in a dictionary for easy access
    models = {
        "svm": model_svm,
        "mlp": model_mlp,
        "knn": model_knn,
        "rf": model_rf
    }
    print("Scaler and all models loaded successfully.")

except Exception as e:
    print(f"CRITICAL ERROR loading models or scaler: {e}")
    print(f"Make sure 'star_classifier_scaler.joblib' and all 4 .joblib models are in the '{models_path}' folder.")
    scaler = None
    models = {}

# --- 5. Define the Prediction Endpoint ---
@app.post("/predict")
async def predict(features: CosmicFeatures):
    if not models or not scaler:
        return {"error": "Models or Scaler are not loaded. Check backend server logs."}

    # --- 6. Create Feature Array IN THE CORRECT ORDER ---
    # The order must be: ['u', 'g', 'r', 'i', 'z', 'redshift']
    try:
        input_data = [
            features.u,
            features.g,
            features.r,
            features.i,
            features.z,
            features.redshift
        ]
        
        # Reshape for a single prediction
        input_array = np.array(input_data).reshape(1, -1)
    except Exception as e:
        return {"error": f"Error creating input array: {e}"}


    # --- 7. CRITICAL: Scale the input data ---
    try:
        input_scaled = scaler.transform(input_array)
    except Exception as e:
        return {"error": f"Error during data scaling: {e}"}

    # --- 8. Get Predictions from All Models ---
    predictions = {}
    for model_name, model in models.items():
        try:
            # The model predicts the class string (e.g., "STAR") directly
            prediction_result = model.predict(input_scaled)[0]
            predictions[model_name] = prediction_result
        except Exception as e:
            predictions[model_name] = f"Error: {e}"

    # --- 9. Add Performance Metrics ---
    # !! IMPORTANT: Get the real metrics (Precision, Recall, F1)
    # from your friend by having them modify their script.
    # These are placeholders.
    performance_metrics = {
        "svm": {"accuracy": 0.92, "precision": 0.91, "recall": 0.92, "f1_score": 0.91},
        "mlp": {"accuracy": 0.95, "precision": 0.94, "recall": 0.95, "f1_score": 0.94},
        "knn": {"accuracy": 0.89, "precision": 0.88, "recall": 0.89, "f1_score": 0.88},
        "rf": {"accuracy": 0.97, "precision": 0.97, "recall": 0.97, "f1_score": 0.97}
    }

    # --- 10. Return the Full Response ---
    return {
        "predictions": predictions,
        "performance": performance_metrics,
        "input_features": features.dict()
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Nebula Lens API!"}