import tensorflow as tf
import numpy as np
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import io
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
import os

# Define router with prefix and tags
router = APIRouter(prefix="/disease", tags=["Plant Disease"])

# ✅ Plant disease class names
class_names = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# ✅ Load model once when router is imported
MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.keras")
model = tf.keras.models.load_model(MODEL_PATH)

# ✅ Setup Gemini LLM
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.5,
    max_tokens="200"
)

parser = StrOutputParser()

prompt1 = PromptTemplate(
    template="""
        You are an agriculture expert. 
        A farmer's plant or leaf has the disease: {disease}.
        Suggest:
        1. Short description of the disease
        2. Organic remedies
        3. Chemical remedies (if available)
        4. Preventive measures
        Return the answer in simple and matured and respected language and answer should be within 100 words.
        You should return the answer in such a manner:
        ### Disease Name
        ---
        ### Cause
        --- (if any)
        ### Symptoms
        --- (if any)

        ### Organic Remedies
        ---  (if any)

        ### Chemical Remedies
        --- (if any) 

        ### Prevention
        --- (if any)
        and never try highlighting any text using **. so give proper response.
    """,
    input_variables=["disease"]
)

chain1 = prompt1 | gemini_llm | parser

# ✅ Prediction endpoint
@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).resize((128, 128))
        input_arr = tf.keras.preprocessing.image.img_to_array(image)
        input_arr = np.expand_dims(input_arr, axis=0)

        prediction = model.predict(input_arr)
        result_index = np.argmax(prediction)
        confidence = float(prediction[0][result_index])

        if confidence < 0.94:
            result = "an unknown Disease"
        else:
            result = class_names[result_index]

        ai_response = chain1.invoke({"disease": result})

        return {
            "class": result,
            "confidence": confidence,
            "advice": ai_response
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
