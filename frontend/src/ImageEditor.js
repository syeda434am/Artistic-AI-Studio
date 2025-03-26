import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Slider,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import MediaUpload from './common/MediaUpload';

const ImageEditor = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adjustments, setAdjustments] = useState({
    saturation: 1.0,
    hue: 0.0,
    brightness: 1.0,
    temperature: 0.0,
    shadow: 0.0,
  });

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setProcessedUrl(null); // Reset processed image when new file is selected
  };

  const handleSliderChange = (name) => (event, newValue) => {
    setAdjustments((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('params', JSON.stringify(adjustments));

    try {
      const response = await axios.post('http://localhost:8000/adjust', formData, {
        responseType: 'blob',
      });

      const processedImageUrl = URL.createObjectURL(response.data);
      setProcessedUrl(processedImageUrl);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error processing image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedUrl) {
      const link = document.createElement('a');
      link.href = processedUrl;
      link.download = `processed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const sliderProps = [
    {
      name: 'saturation',
      label: 'Saturation',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 1,
    },
    {
      name: 'hue',
      label: 'Hue',
      min: -1,
      max: 1,
      step: 0.1,
      defaultValue: 0,
    },
    {
      name: 'brightness',
      label: 'Brightness',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 1,
    },
    {
      name: 'temperature',
      label: 'Temperature',
      min: -1,
      max: 1,
      step: 0.1,
      defaultValue: 0,
    },
    {
      name: 'shadow',
      label: 'Shadow',
      min: -1,
      max: 1,
      step: 0.1,
      defaultValue: 0,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" gutterBottom>
        Image Editor
      </Typography>

      <MediaUpload
        onFileSelect={handleFileSelect}
        acceptedFiles="image/*"
        maxSize={10485760} // 10MB
        allowCamera={true}
      />

      {(previewUrl || processedUrl) && (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Original Image */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              Original Image
            </Typography>
            <img
              src={previewUrl}
              alt="Original"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain',
              }}
            />
          </Paper>

          {/* Processed Image */}
          {processedUrl && (
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Processed Image
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={processedUrl}
                  alt="Processed"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'contain',
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  sx={{ mt: 2 }}
                >
                  Download Processed Image
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {previewUrl && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Image Adjustments
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Adjust the sliders below to modify your image. Changes will be applied when you click the Process Image button.
            </Typography>
            {sliderProps.map((slider) => (
              <Box key={slider.name}>
                <Typography gutterBottom>{slider.label}</Typography>
                <Slider
                  value={adjustments[slider.name]}
                  onChange={handleSliderChange(slider.name)}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  valueLabelDisplay="auto"
                />
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={handleProcess}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Process Image'}
            </Button>
          </Box>
        </Paper>
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

export default ImageEditor;
