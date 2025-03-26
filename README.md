# ArtisticAI Studio

Transform your media with AI-powered artistic magic

## Overview

ArtisticAI Studio is an innovative web application that brings the power of artificial intelligence to digital media creation. It combines neural style transfer, object detection, and advanced image processing to help users transform their photos and videos into stunning artistic pieces.

🎨 **Live Demo:**
- Frontend: https://artisticai.vercel.app
- API: https://artisticai-api.onrender.com

## Features

- 🖼️ **Neural Style Transfer**
  - Transform photos using famous artistic styles
  - Multiple style options (Starry Night, Kandinsky, Picasso, etc.)
  - Real-time preview

- 🔍 **Smart Object Detection**
  - Identify objects in images
  - Accurate bounding boxes
  - Multiple object categories

- ✨ **Professional Image Editing**
  - Adjust brightness, contrast, saturation
  - Temperature and tint controls
  - Shadow and highlight adjustment

- 🎥 **Video Processing**
  - Apply effects to video content
  - Frame-by-frame processing
  - Maintain video quality

## Tech Stack

- **Frontend:**
  - React
  - React Router
  - Modern UI components
  - Responsive design

- **Backend:**
  - FastAPI
  - PyTorch
  - Neural network models
  - Image processing libraries

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/artisticai.git
cd artisticai
```

2. Start the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Start the frontend:
```bash
cd frontend
npm install
npm start
```

4. Open http://localhost:3000 in your browser

## Free Hosting Setup

1. Frontend (Vercel):
```bash
cd frontend
vercel
```

2. Backend (Render):
- Connect your GitHub repository to Render
- Create a new Web Service using render.yaml configuration
- Deploy automatically with every push

## Project Structure

See [PROJECT_TEMPLATE.md](PROJECT_TEMPLATE.md) for detailed project structure.

## Code Templates

See [CODE_TEMPLATES.md](CODE_TEMPLATES.md) for implementation templates.

## Branding

See [BRANDING.md](BRANDING.md) for brand guidelines and assets.

## License

MIT License - feel free to use for your own projects!

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Support

- Create an issue for bug reports
- Star the repository if you find it useful
- Fork for your own projects
