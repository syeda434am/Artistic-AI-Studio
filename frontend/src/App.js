import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ImageEditor from './components/ImageEditor';
import VideoEditor from './components/VideoEditor';
import StyleTransfer from './components/StyleTransfer';
import ObjectDetection from './components/ObjectDetection';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/image-editor" element={<ImageEditor />} />
          <Route path="/video-editor" element={<VideoEditor />} />
          <Route path="/style-transfer" element={<StyleTransfer />} />
          <Route path="/object-detection" element={<ObjectDetection />} />
        </Routes>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            AI Media Processor © {new Date().getFullYear()}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
