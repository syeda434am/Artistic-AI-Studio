import cv2
import numpy as np
from PIL import Image
import os
from typing import Tuple
import uuid

class ImageProcessor:
    @staticmethod
    def adjust_temperature(image: np.ndarray, temperature: float) -> np.ndarray:
        """
        Adjust the color temperature of the image
        temperature: value between -1 (cooler/blue) and 1 (warmer/yellow)
        """
        # Convert temperature range from [-1, 1] to a multiplier
        if temperature > 0:
            blue_multiplier = 1 - temperature * 0.5
            red_multiplier = 1 + temperature * 0.5
        else:
            blue_multiplier = 1 + abs(temperature) * 0.5
            red_multiplier = 1 - abs(temperature) * 0.5
            
        # Split the image into BGR channels
        b, g, r = cv2.split(image)
        
        # Apply temperature adjustment
        b = cv2.multiply(b, blue_multiplier)
        r = cv2.multiply(r, red_multiplier)
        
        # Merge channels back
        return cv2.merge([b, g, r])

    @staticmethod
    def adjust_shadow(image: np.ndarray, shadow: float) -> np.ndarray:
        """
        Adjust shadows in the image
        shadow: value between -1 (darker shadows) and 1 (lighter shadows)
        """
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Adjust the luminance channel
        l = l.astype(float)
        
        # Create a mask for shadow regions (darker areas)
        shadow_mask = l < 128
        
        # Apply shadow adjustment
        if shadow > 0:
            # Lighten shadows
            l[shadow_mask] += (128 - l[shadow_mask]) * shadow
        else:
            # Darken shadows
            l[shadow_mask] += l[shadow_mask] * shadow
            
        # Ensure values stay within valid range
        l = np.clip(l, 0, 255).astype(np.uint8)
        
        # Merge channels and convert back to BGR
        lab = cv2.merge([l, a, b])
        return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    @staticmethod
    def adjust_image(
        image: np.ndarray,
        saturation: float = 1.0,
        hue: float = 0.0,
        brightness: float = 1.0,
        temperature: float = 0.0,
        shadow: float = 0.0
    ) -> np.ndarray:
        """
        Apply all adjustments to the image
        """
        # Convert BGR to HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV).astype(np.float32)
        
        # Adjust hue
        hsv[:, :, 0] = (hsv[:, :, 0] + hue * 180) % 180
        
        # Adjust saturation
        hsv[:, :, 1] *= saturation
        
        # Adjust brightness
        hsv[:, :, 2] *= brightness
        
        # Clip values to valid ranges
        hsv[:, :, 0] = np.clip(hsv[:, :, 0], 0, 180)
        hsv[:, :, 1] = np.clip(hsv[:, :, 1], 0, 255)
        hsv[:, :, 2] = np.clip(hsv[:, :, 2], 0, 255)
        
        # Convert back to BGR
        image = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
        
        # Apply temperature adjustment
        if temperature != 0:
            image = ImageProcessor.adjust_temperature(image, temperature)
            
        # Apply shadow adjustment
        if shadow != 0:
            image = ImageProcessor.adjust_shadow(image, shadow)
            
        return image

def process_image(
    file_path: str,
    saturation: float = 1.0,
    hue: float = 0.0,
    brightness: float = 1.0,
    temperature: float = 0.0,
    shadow: float = 0.0
) -> str:
    """
    Process an image file with the given adjustments
    Returns: Path to the processed image
    """
    try:
        # Read image
        image = cv2.imread(file_path)
        if image is None:
            raise ValueError("Failed to load image")

        # Apply adjustments
        processed = ImageProcessor.adjust_image(
            image,
            saturation=saturation,
            hue=hue,
            brightness=brightness,
            temperature=temperature,
            shadow=shadow
        )

        # Save processed image
        output_path = os.path.join(
            os.path.dirname(file_path),
            f"processed_{uuid.uuid4()}.jpg"
        )
        cv2.imwrite(output_path, processed)

        return output_path

    except Exception as e:
        raise Exception(f"Error during image processing: {str(e)}")

def process_video(
    file_path: str,
    saturation: float = 1.0,
    hue: float = 0.0,
    brightness: float = 1.0,
    temperature: float = 0.0,
    shadow: float = 0.0
) -> str:
    """
    Process a video file with the given adjustments
    Returns: Path to the processed video
    """
    try:
        # Open video file
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            raise ValueError("Failed to open video file")

        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        # Create output video file
        output_path = os.path.join(
            os.path.dirname(file_path),
            f"processed_{uuid.uuid4()}.mp4"
        )
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        # Process each frame
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Apply adjustments to frame
            processed_frame = ImageProcessor.adjust_image(
                frame,
                saturation=saturation,
                hue=hue,
                brightness=brightness,
                temperature=temperature,
                shadow=shadow
            )

            # Write processed frame
            out.write(processed_frame)

        # Release resources
        cap.release()
        out.release()

        return output_path

    except Exception as e:
        raise Exception(f"Error during video processing: {str(e)}")
