import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import os
import uuid
import numpy as np
from typing import Tuple

class VGG(nn.Module):
    def __init__(self):
        super(VGG, self).__init__()
        # Load pretrained VGG19 model
        vgg = models.vgg19(pretrained=True).features
        self.slice1 = nn.Sequential()
        self.slice2 = nn.Sequential()
        self.slice3 = nn.Sequential()
        self.slice4 = nn.Sequential()
        self.slice5 = nn.Sequential()
        
        for x in range(2):
            self.slice1.add_module(str(x), vgg[x])
        for x in range(2, 7):
            self.slice2.add_module(str(x), vgg[x])
        for x in range(7, 12):
            self.slice3.add_module(str(x), vgg[x])
        for x in range(12, 21):
            self.slice4.add_module(str(x), vgg[x])
        for x in range(21, 30):
            self.slice5.add_module(str(x), vgg[x])
            
        for param in self.parameters():
            param.requires_grad = False

    def forward(self, x):
        h_relu1 = self.slice1(x)
        h_relu2 = self.slice2(h_relu1)
        h_relu3 = self.slice3(h_relu2)
        h_relu4 = self.slice4(h_relu3)
        h_relu5 = self.slice5(h_relu4)
        return [h_relu1, h_relu2, h_relu3, h_relu4, h_relu5]

class StyleTransfer:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.vgg = VGG().to(self.device)
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                              std=[0.229, 0.224, 0.225])
        ])
        
        # Pre-defined styles
        styles_dir = os.path.join(os.path.dirname(__file__), 'styles')
        self.styles = {
            "starry_night": os.path.join(styles_dir, "starry_night.jpg"),
            "kandinsky": os.path.join(styles_dir, "kandinsky.jpg"),
            "picasso": os.path.join(styles_dir, "picasso.jpg"),
            "monet": os.path.join(styles_dir, "monet.jpg"),
            "van_gogh": os.path.join(styles_dir, "van_gogh.jpg")
        }

    def load_image(self, path: str, size: Tuple[int, int] = None) -> torch.Tensor:
        """Load and preprocess image"""
        image = Image.open(path)
        if size:
            image = image.resize(size, Image.LANCZOS)
        image = self.transform(image).unsqueeze(0).to(self.device)
        return image

    def gram_matrix(self, x: torch.Tensor) -> torch.Tensor:
        """Calculate Gram Matrix"""
        b, c, h, w = x.size()
        features = x.view(b, c, h * w)
        gram = torch.bmm(features, features.transpose(1, 2))
        return gram.div(c * h * w)

    def style_loss(self, style_features: list, generated_features: list) -> torch.Tensor:
        """Calculate style loss"""
        loss = 0
        for sf, gf in zip(style_features, generated_features):
            loss += F.mse_loss(self.gram_matrix(gf), self.gram_matrix(sf))
        return loss

    def content_loss(self, content_features: list, generated_features: list) -> torch.Tensor:
        """Calculate content loss"""
        return F.mse_loss(generated_features[2], content_features[2])

    def transfer_style(
        self, 
        content_path: str, 
        style_name: str,
        num_steps: int = 300,
        style_weight: float = 1000000,
        content_weight: float = 1
    ) -> str:
        """
        Apply style transfer to the content image
        Returns: Path to the styled image
        """
        try:
            # Load content image
            content_img = self.load_image(content_path)
            
            # Load style image
            if style_name not in self.styles:
                raise ValueError(f"Style {style_name} not found")
            style_img = self.load_image(self.styles[style_name], content_img.shape[2:])
            
            # Generate features
            content_features = self.vgg(content_img)
            style_features = self.vgg(style_img)
            
            # Initialize generated image
            generated_img = content_img.clone()
            generated_img.requires_grad_(True)
            optimizer = torch.optim.LBFGS([generated_img])
            
            # Style transfer iterations
            for step in range(num_steps):
                def closure():
                    optimizer.zero_grad()
                    generated_features = self.vgg(generated_img)
                    
                    style_score = style_weight * self.style_loss(style_features, generated_features)
                    content_score = content_weight * self.content_loss(content_features, generated_features)
                    
                    loss = style_score + content_score
                    loss.backward()
                    return loss
                
                optimizer.step(closure)
            
            # Save and return result
            output_path = os.path.join(
                os.path.dirname(content_path),
                f"styled_{uuid.uuid4()}.jpg"
            )
            
            # Convert tensor to image and save
            output_img = generated_img.squeeze(0)
            output_img = output_img.cpu().detach().numpy()
            output_img = output_img.transpose(1, 2, 0)
            output_img = output_img * np.array([0.229, 0.224, 0.225]) + np.array([0.485, 0.456, 0.406])
            output_img = np.clip(output_img, 0, 1)
            output_img = (output_img * 255).astype(np.uint8)
            Image.fromarray(output_img).save(output_path)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Error during style transfer: {str(e)}")

# Initialize style transfer model
style_transfer = StyleTransfer()

def apply_style(content_path: str, style_name: str) -> str:
    """
    Wrapper function to apply style transfer
    """
    return style_transfer.transfer_style(content_path, style_name)
