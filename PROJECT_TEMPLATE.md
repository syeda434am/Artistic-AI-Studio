# AI Media Processor - Project Template Structure

```
project-root/
│
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   └── models/              # ML Models
│   │       ├── styles/          # Style Transfer Images
│   │       │   ├── starry_night.jpg
│   │       │   ├── kandinsky.jpg
│   │       │   ├── picasso.jpg
│   │       │   ├── monet.jpg
│   │       │   └── van_gogh.jpg
│   │       ├── style_transfer.py    # Neural Style Transfer
│   │       ├── object_detection.py  # Object Detection
│   │       └── image_processing.py  # Image Processing
│   │
│   ├── uploads/                 # Temporary Upload Directory
│   ├── main.py                  # FastAPI Application
│   ├── requirements.txt         # Python Dependencies
│   ├── Dockerfile              # Docker Configuration
│   └── render.yaml             # Render Deployment Config
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── MediaUpload.js   # Shared Upload Component
│   │   │   ├── HomePage.js          # Landing Page
│   │   │   ├── Navbar.js           # Navigation
│   │   │   ├── ObjectDetection.js  # Object Detection UI
│   │   │   ├── StyleTransfer.js    # Style Transfer UI
│   │   │   ├── ImageEditor.js      # Image Processing UI
│   │   │   └── VideoEditor.js      # Video Processing UI
│   │   │
│   │   ├── App.js             # React App Root
│   │   └── index.js           # Entry Point
│   │
│   ├── package.json           # Node Dependencies
│   ├── vercel.json           # Vercel Deployment Config
│   └── .env.production       # Production Environment Variables
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD
│
├── .gitignore               # Git Ignore Rules
└── README.md               # Project Documentation

```

## Key Components

1. Backend Structure
   - FastAPI for REST API
   - Modular ML models in app/models/
   - Separate concerns for different AI features
   - Environment-based configuration
   - Docker and Render.com deployment ready

2. Frontend Structure
   - React components organized by feature
   - Shared components in common/
   - Environment configuration
   - Vercel deployment ready

3. Deployment Configuration
   - GitHub Actions for CI/CD
   - Render.yaml for backend deployment
   - vercel.json for frontend deployment

## Dependencies

1. Backend Dependencies (requirements.txt):
   - fastapi
   - uvicorn
   - python-multipart
   - torch
   - torchvision
   - Pillow
   - numpy

2. Frontend Dependencies (package.json):
   - react
   - react-dom
   - react-router-dom
   - axios (for API calls)
   - material-ui (optional for UI components)

## Development Setup

1. Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

2. Frontend:
```bash
cd frontend
npm install
npm start
```

## Deployment Flow

1. Push to GitHub:
   - Triggers GitHub Actions workflow

2. Automated Deployment:
   - Frontend → Vercel
   - Backend → Render.com

3. Environment Variables:
   - Frontend: REACT_APP_API_URL
   - Backend: PORT, PYTHON_VERSION

## Best Practices

1. Code Organization:
   - Modular components
   - Separation of concerns
   - Reusable utilities

2. Configuration:
   - Environment-based settings
   - Deployment-specific configs
   - Secret management

3. Development:
   - Local development setup
   - Hot reloading
   - Debug configurations

4. Deployment:
   - Automated CI/CD
   - Environment separation
   - Monitoring setup
