import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MediaUpload from './common/MediaUpload';

const ObjectDetection = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setDetectionResults(null); // Reset results when new file is selected
  };

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/detect', formData);
      setDetectionResults(response.data.results);
    } catch (err) {
      setError('Failed to process detection. Please try again.');
      console.error('Error detecting objects:', err);
    } finally {
      setLoading(false);
    }
  };

  const drawDetections = (canvas, img, detections) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw bounding boxes and labels
    detections.forEach(detection => {
      const [x1, y1, x2, y2] = detection.bbox;
      const width = x2 - x1;
      const height = y2 - y1;
      
      // Scale coordinates to canvas size
      const scaleX = canvas.width / img.naturalWidth;
      const scaleY = canvas.height / img.naturalHeight;
      
      // Draw rectangle
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x1 * scaleX,
        y1 * scaleY,
        width * scaleX,
        height * scaleY
      );
      
      // Draw label
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${detection.class} ${Math.round(detection.confidence * 100)}%`,
        x1 * scaleX,
        y1 * scaleY - 5
      );
    });
  };

  const renderDetectionResults = () => {
    if (!detectionResults) return null;

    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Detection Results
        </Typography>
        <List>
          {detectionResults.map((result, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={`${result.class} (${Math.round(result.confidence * 100)}% confidence)`}
                  secondary={`Bounding Box: [${result.bbox.map(n => Math.round(n)).join(', ')}]`}
                />
              </ListItem>
              {index < detectionResults.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" gutterBottom>
        Object Detection
      </Typography>

      <MediaUpload
        onFileSelect={handleFileSelect}
        acceptedFiles="image/*,video/*"
        maxSize={104857600} // 100MB
        allowCamera={true}
      />

      {previewUrl && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            {file.type.startsWith('image/') ? (
              <Box sx={{ position: 'relative' }}>
                <canvas
                  ref={canvas => {
                    if (canvas && detectionResults) {
                      const img = new Image();
                      img.onload = () => {
                        // Set canvas size to match display size
                        const maxWidth = 800;
                        const maxHeight = 600;
                        const ratio = Math.min(
                          maxWidth / img.naturalWidth,
                          maxHeight / img.naturalHeight
                        );
                        canvas.width = img.naturalWidth * ratio;
                        canvas.height = img.naturalHeight * ratio;
                        drawDetections(canvas, img, detectionResults);
                      };
                      img.src = previewUrl;
                    }
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    height: 'auto',
                  }}
                />
                {!detectionResults && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxWidth: '800px',
                      height: 'auto',
                    }}
                  />
                )}
              </Box>
            ) : (
              <video
                src={previewUrl}
                controls
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  height: 'auto',
                }}
              />
            )}
          </Paper>

          <Button
            variant="contained"
            onClick={handleDetect}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Detect Objects'}
          </Button>

          {renderDetectionResults()}
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ObjectDetection;
