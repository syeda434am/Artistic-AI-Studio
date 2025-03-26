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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import MediaUpload from './common/MediaUpload';

const AVAILABLE_STYLES = [
  { id: 'starry_night', name: 'Starry Night - Van Gogh' },
  { id: 'kandinsky', name: 'Composition VII - Kandinsky' },
  { id: 'picasso', name: 'The Old Guitarist - Picasso' },
  { id: 'monet', name: 'Water Lilies - Monet' },
  { id: 'van_gogh', name: 'The Cafe Terrace - Van Gogh' },
];

const StyleTransfer = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setProcessedUrl(null); // Reset processed image when new file is selected
  };

  const handleStyleChange = (event) => {
    setSelectedStyle(event.target.value);
  };

  const handleProcess = async () => {
    if (!file || !selectedStyle) {
      setError('Please select both an image and a style');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('content_file', file);
    formData.append('style_name', selectedStyle);

    try {
      const response = await axios.post(
        'http://localhost:8000/style-transfer',
        formData,
        {
          responseType: 'blob',
        }
      );

      const processedImageUrl = URL.createObjectURL(response.data);
      setProcessedUrl(processedImageUrl);
    } catch (err) {
      setError('Failed to process style transfer. Please try again.');
      console.error('Error processing style transfer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedUrl) {
      const link = document.createElement('a');
      link.href = processedUrl;
      link.download = `styled_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" gutterBottom>
        Neural Style Transfer
      </Typography>

      <MediaUpload
        onFileSelect={handleFileSelect}
        acceptedFiles="image/*"
        maxSize={10485760} // 10MB
        allowCamera={true}
      />

      {previewUrl && (
        <FormControl fullWidth>
          <InputLabel id="style-select-label">Select Style</InputLabel>
          <Select
            labelId="style-select-label"
            value={selectedStyle}
            label="Select Style"
            onChange={handleStyleChange}
          >
            {AVAILABLE_STYLES.map((style) => (
              <MenuItem key={style.id} value={style.id}>
                {style.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {(previewUrl || processedUrl) && (
        <Grid container spacing={4}>
          {/* Original Image */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
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
          </Grid>

          {/* Processed Image */}
          {processedUrl && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Styled Image
                </Typography>
                <img
                  src={processedUrl}
                  alt="Styled"
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
                  Download Styled Image
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {previewUrl && selectedStyle && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleProcess}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Apply Style Transfer'
            )}
          </Button>
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

export default StyleTransfer;
