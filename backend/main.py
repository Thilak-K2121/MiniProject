import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from collections import Counter
import google.generativeai as genai
from dotenv import load_dotenv

# --- 1. Load .env file and configure Gemini ---
load_dotenv()
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
    print("Gemini model (gemini-2.5-flash) configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini: {e}")
    gemini_model = None

# --- 2. Initialize FastAPI App ---
app = FastAPI(
    title="Nebula Lens API",
    description="API for cosmic object classification.",
    version="1.0.0"
)

# --- 3. Configure CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. Define Pydantic Models ---
class CosmicFeatures(BaseModel):
    u: float
    g: float
    r: float
    i: float
    z: float
    redshift: float

class ExplanationRequest(BaseModel):
    object_name: str

class DynamicExplanationRequest(BaseModel):
    inputs: CosmicFeatures
    prediction: str

# --- NEW: Model for Anomaly Analysis ---
class AnomalyAnalysisRequest(BaseModel):
    inputs: CosmicFeatures
    probabilities: dict # This will be the 'predictions' object

# --- 5. Load The Models AND THE SCALER ---
models_path = "./models/"
try:
    scaler_path = os.path.join(models_path, 'star_classifier_scaler.joblib')
    scaler = joblib.load(scaler_path)
    model_svm = joblib.load(os.path.join(models_path, 'model_svm.joblib'))
    model_mlp = joblib.load(os.path.join(models_path, 'model_mlp.joblib'))
    model_knn = joblib.load(os.path.join(models_path, 'model_knn.joblib'))
    model_rf = joblib.load(os.path.join(models_path, 'model_rf.joblib'))
    models = {
        "svm": model_svm, "mlp": model_mlp,
        "knn": model_knn, "rf": model_rf
    }
    print("Scaler and all models loaded successfully.")
    
    feature_names = ['u', 'g', 'r', 'i', 'z', 'redshift']
    rf_importances = models['rf'].feature_importances_
    feature_importance_list = sorted(zip(feature_names, rf_importances), key=lambda x: x[1], reverse=True)
    print(f"Top features loaded: {feature_importance_list}")

except Exception as e:
    print(f"CRITICAL ERROR loading models or scaler: {e}")
    scaler = None
    models = {}
    feature_importance_list = []


# --- 6. /predict endpoint (NOW WITH ANOMALY DETECTION) ---
@app.post("/predict")
async def predict(features: CosmicFeatures):
    if not models or not scaler:
        return {"error": "Models or Scaler are not loaded. Check backend server logs."}
    
    # ... (Scaling logic is unchanged) ...
    try:
        input_data = [features.u, features.g, features.r, features.i, features.z, features.redshift]
        input_array = np.array(input_data).reshape(1, -1)
        input_scaled = scaler.transform(input_array)
    except Exception as e:
        return {"error": f"Error during data scaling: {e}"}

    predictions = {}
    all_confidences = [] # List to store top confidences
    
    for model_name, model in models.items():
        try:
            raw_probabilities = model.predict_proba(input_scaled)[0]
            model_classes = model.classes_
            probabilities = {cls: prob for cls, prob in zip(model_classes, raw_probabilities)}
            main_prediction = max(probabilities, key=probabilities.get)
            top_confidence = probabilities[main_prediction]
            
            all_confidences.append(top_confidence) # Add confidence to list
            
            predictions[model_name] = {
                "prediction": main_prediction,
                "confidence": top_confidence,
                "probabilities": probabilities
            }
        except Exception as e:
            predictions[model_name] = {"prediction": "Error", "confidence": 0, "probabilities": {"Error": f"{e}"}}

    # ... (Model Agreement logic is unchanged) ...
    prediction_list = [result["prediction"] for result in predictions.values() if "Error" not in result["probabilities"]]
    if prediction_list:
        most_common = Counter(prediction_list).most_common(1)[0]
        model_agreement = {"prediction": most_common[0], "count": most_common[1], "total": len(prediction_list)}
    else:
        model_agreement = {"prediction": "Error", "count": 0, "total": 0}

    # --- NEW: Anomaly Logic ---
    ANOMALY_THRESHOLD = 0.60 # 60%
    average_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
    is_anomaly = average_confidence < ANOMALY_THRESHOLD
    
    # ... (Performance Metrics are unchanged) ...
    performance_metrics = {
        "svm": {"accuracy": 0.92, "f1_score": 0.91},
        "mlp": {"accuracy": 0.95, "f1_score": 0.94},
        "knn": {"accuracy": 0.89, "f1_score": 0.88},
        "rf": {"accuracy": 0.97, "f1_score": 0.97}
    }
    
    return {
        "predictions": predictions,
        "performance": performance_metrics,
        "model_agreement": model_agreement,
        "input_features": features.dict(),
        "average_confidence": average_confidence, # <-- NEW
        "is_anomaly": is_anomaly                # <-- NEW
    }


# --- 7. "Astro-Pedia" Endpoint (Unchanged) ---
@app.post("/get-explanation")
# ... (code is identical to before) ...
async def get_explanation(request: ExplanationRequest):
    if not gemini_model:
        return {"error": "Gemini model is not configured. Check API key."}
    object_name = request.object_name
    prompt = f"In a single, concise paragraph, explain what a '{object_name}' is in the context of astronomy."
    try:
        response = gemini_model.generate_content(prompt)
        return {"explanation": response.text}
    except Exception as e:
        return {"error": f"Error generating explanation: {e}"}

# --- 8. "Dynamic XAI" Endpoint (Unchanged) ---
@app.post("/dynamic-explanation")
# ... (code is identical to before) ...
async def dynamic_explanation(request: DynamicExplanationRequest):
    if not gemini_model:
        return {"error": "Gemini model is not configured. Check API key."}
    try:
        inputs = request.inputs.dict()
        prediction = request.prediction
        top_feature_1_name = feature_importance_list[0][0]
        top_feature_2_name = feature_importance_list[1][0]
        top_feature_1_val = inputs[top_feature_1_name]
        top_feature_2_val = inputs[top_feature_2_name]
        
        prompt = f"""
        Act as an expert astrophysicist.
        My machine learning model predicted an object is a '{prediction}'.
        Explain in a simple, concise paragraph *why* this prediction makes sense, based on these key inputs:
        
        - The most important feature, '{top_feature_1_name}', had a value of {top_feature_1_val}.
        - The second most important feature, '{top_feature_2_name}', had a value of {top_feature_2_val}.

        Start your explanation with "This prediction makes sense because..." and do not use markdown.
        """
        response = gemini_model.generate_content(prompt)
        return {"explanation": response.text}
    except Exception as e:
        return {"error": f"Error generating dynamic explanation: {e}"}

# --- 9. NEW: Anomaly Analysis Endpoint ---
@app.post("/analyze-anomaly")
async def analyze_anomaly(request: AnomalyAnalysisRequest):
    if not gemini_model:
        return {"error": "Gemini model is not configured. Check API key."}

    try:
        inputs = request.inputs.dict()
        
        # Build a string of all the confusing probabilities
        prob_summary = ""
        for model_name, data in request.probabilities.items():
            prob_summary += f"- {model_name} prediction: {data['prediction']} (Confidence: {(data['confidence'] * 100):.1f}%)\n"

        # This is the advanced prompt
        prompt = f"""
        Act as an expert astrophysicist and data scientist.
        My machine learning models are 'confused' by a set of astronomical data. The average confidence is very low, suggesting this is an anomaly.

        Here is the user's input data:
        {inputs}

        Here are the confusing probabilities from my four models:
        {prob_summary}

        Please provide a brief, one-paragraph hypothesis for *why* the models are confused.
        - What could this object be?
        - Is it a rare hybrid object (like an obscured quasar or a star-forming galaxy)?
        - Or does the input data seem contradictory (e.g., high redshift but colors of a nearby star)?
        - Start your analysis with "This is an unusual object..."
        """
        
        response = gemini_model.generate_content(prompt)
        return {"explanation": response.text}
        
    except Exception as e:
        return {"error": f"Error generating anomaly analysis: {e}"}

# --- 10. Root Endpoint (Unchanged) ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Nebula Lens API!"}