import torch
import torchvision
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Union

class ObjectDetector:
    def __init__(self):
        # Load pre-trained model
        self.model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
        self.model.eval()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        
        # COCO dataset class labels
        self.CLASSES = [
            '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
            'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'N/A', 'stop sign',
            'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
            'elephant', 'bear', 'zebra', 'giraffe', 'N/A', 'backpack', 'umbrella', 'N/A', 'N/A',
            'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'N/A', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl',
            'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
            'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'N/A', 'dining table',
            'N/A', 'N/A', 'toilet', 'N/A', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 
            'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'N/A', 'book',
            'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ]

    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """Preprocess image for model input"""
        image = Image.open(image_path).convert('RGB')
        image_tensor = torchvision.transforms.functional.to_tensor(image)
        return image_tensor.unsqueeze(0).to(self.device)

    def detect(self, image_path: str, confidence_threshold: float = 0.5) -> List[Dict[str, Union[str, float, List[float]]]]:
        """
        Detect objects in the image
        Returns: List of dictionaries containing class, confidence, and bounding box
        """
        # Load and preprocess image
        image_tensor = self.preprocess_image(image_path)
        
        with torch.no_grad():
            predictions = self.model(image_tensor)

        # Process predictions
        results = []
        for pred in predictions:
            boxes = pred['boxes'].cpu().numpy()
            scores = pred['scores'].cpu().numpy()
            labels = pred['labels'].cpu().numpy()

            # Filter predictions based on confidence threshold
            mask = scores >= confidence_threshold
            boxes = boxes[mask]
            scores = scores[mask]
            labels = labels[mask]

            for box, score, label in zip(boxes, scores, labels):
                results.append({
                    'class': self.CLASSES[label],
                    'confidence': float(score),
                    'bbox': box.tolist()  # [x1, y1, x2, y2]
                })

        return results

# Initialize detector
detector = ObjectDetector()

def detect_objects(file_path: str) -> List[Dict[str, Union[str, float, List[float]]]]:
    """
    Wrapper function to detect objects in an image
    """
    try:
        return detector.detect(file_path)
    except Exception as e:
        raise Exception(f"Error during object detection: {str(e)}")
