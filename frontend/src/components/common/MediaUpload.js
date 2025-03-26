import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { CloudUpload, PhotoCamera } from '@mui/icons-material';
import Webcam from 'react-webcam';

const MediaUpload = ({ 
  onFileSelect, 
  acceptedFiles = 'image/*,video/*', 
  maxSize = 10485760, // 10MB
  allowCamera = true 
}) => {
  const [showCamera, setShowCamera] = React.useState(false);
  const webcamRef = React.useRef(null);

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles,
    maxSize,
    multiple: false
  });

  const captureFromWebcam = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
          onFileSelect(file);
          setShowCamera(false);
        });
    }
  }, [onFileSelect]);

  if (showCamera) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 720,
            height: 480,
            facingMode: "user"
          }}
          style={{ width: '100%', maxWidth: '720px' }}
        />
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={captureFromWebcam}
            sx={{ mr: 1 }}
          >
            Capture Photo
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setShowCamera(false)}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 
            'Drop your file here' : 
            'Drag & drop your file here, or click to select'
          }
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: {acceptedFiles.replace(/[*]/g, '')}
          <br />
          Maximum file size: {Math.round(maxSize / 1048576)}MB
        </Typography>
      </Paper>
      
      {allowCamera && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={() => setShowCamera(true)}
          >
            Use Camera
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MediaUpload;
