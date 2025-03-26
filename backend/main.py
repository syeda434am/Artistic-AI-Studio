from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
from typing import Optional
from pydantic import BaseModel
import uuid

# Import our processing modules (will create these next)
from app.models.object_detection import detect_objects
from app.models.image_processing import process_image
from app.models.style_transfer import apply_style

app = FastAPI(title="AI Media Processor API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AdjustmentParams(BaseModel):
    saturation: Optional[float] = 1.0
    hue: Optional[float] = 0.0
    brightness: Optional[float] = 1.0
    temperature: Optional[float] = 0.0
    shadow: Optional[float] = 0.0

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    """
    Endpoint for object detection in images/videos
    """
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Perform object detection
        results = detect_objects(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/adjust")
async def adjust(file: UploadFile = File(...), params: AdjustmentParams = Body(...)):
    """
    Endpoint for adjusting image/video properties
    """
    try:
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the image/video
        output_path = process_image(
            file_path,
            saturation=params.saturation,
            hue=params.hue,
            brightness=params.brightness,
            temperature=params.temperature,
            shadow=params.shadow
        )
        
        # Return the processed file
        response = FileResponse(output_path)
        
        # Clean up
        os.remove(file_path)
        os.remove(output_path)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/style-transfer")
async def style_transfer(
    content_file: UploadFile = File(...),
    style_name: str = Body(...)
):
    """
    Endpoint for neural style transfer
    """
    try:
        # Save uploaded file
        content_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{content_file.filename}")
        with open(content_path, "wb") as buffer:
            shutil.copyfileobj(content_file.file, buffer)
        
        # Apply style transfer
        output_path = apply_style(content_path, style_name)
        
        # Return the processed file
        response = FileResponse(output_path)
        
        # Clean up
        os.remove(content_path)
        os.remove(output_path)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
