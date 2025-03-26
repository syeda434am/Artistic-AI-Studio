FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create styles directory and download style images
RUN mkdir -p app/models/styles && \
    cd app/models/styles && \
    curl -o starry_night.jpg https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg && \
    curl -o kandinsky.jpg https://raw.githubusercontent.com/pytorch/examples/master/fast_neural_style/images/style-images/candy.jpg && \
    curl -o picasso.jpg https://raw.githubusercontent.com/pytorch/examples/master/fast_neural_style/images/style-images/mosaic.jpg && \
    curl -o monet.jpg https://raw.githubusercontent.com/pytorch/examples/master/fast_neural_style/images/style-images/rain-princess.jpg && \
    curl -o van_gogh.jpg https://raw.githubusercontent.com/pytorch/examples/master/fast_neural_style/images/style-images/udnie.jpg

# Expose the port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
