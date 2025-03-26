import React, { useState, useRef } from 'react';
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

const VideoEditor = () => {
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

  const originalVideoRef = useRef(null);
  const processedVideoRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setProcessedUrl(null); // Reset processed video when new file is selected
  };

  const handleSliderChange = (name) => (event, newValue) => {
    setAdjustments((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        setFile(file);
        setProcessedUrl(null);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording. Please check camera permissions.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordedChunks([]);
    }
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

      const processedVideoUrl = URL.createObjectURL(response.data);
      setProcessedUrl(processedVideoUrl);
    } catch (err) {
      setError('Failed to process video. Please try again.');
      console.error('Error processing video:', err);
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

  const handleVideoSync = () => {
    if (originalVideoRef.current && processedVideoRef.current) {
      processedVideoRef.current.currentTime = originalVideoRef.current.currentTime;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="h4" gutterBottom>
        Video Editor
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Record or Upload Video
          </Typography>
          
          {isRecording ? (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={startRecording}
              >
                Start Recording
              </Button>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Or upload an existing video:
          </Typography>

          <MediaUpload
            onFileSelect={handleFileSelect}
            acceptedFiles="video/*"
            maxSize={104857600} // 100MB
            allowCamera={false} // We're handling camera separately
          />
        </Paper>
      </Box>

      {(previewUrl || processedUrl) && (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Original Video */}
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              Original Video
            </Typography>
            <video
              ref={originalVideoRef}
              src={previewUrl}
              controls
              style={{ width: '100%', maxHeight: '400px' }}
              onPlay={() => processedVideoRef.current?.play()}
              onPause={() => processedVideoRef.current?.pause()}
              onTimeUpdate={handleVideoSync}
            />
          </Paper>

          {/* Processed Video */}
          {processedUrl && (
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Processed Video
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <video
                  ref={processedVideoRef}
                  src={processedUrl}
                  controls
                  style={{ width: '100%', maxHeight: '400px' }}
                  onPlay={() => originalVideoRef.current?.play()}
                  onPause={() => originalVideoRef.current?.pause()}
                />
                <Button
                  variant="contained"
                  onClick={handleDownload}
                >
                  Download Processed Video
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {previewUrl && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Video Adjustments
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Adjust the sliders below to modify your video. Changes will be applied when you click the Process Video button.
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
              {loading ? <CircularProgress size={24} /> : 'Process Video'}
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

export default VideoEditor;
