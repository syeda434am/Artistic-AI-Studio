import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from '@mui/material';
import {
  PhotoCamera,
  Videocam,
  Brush,
  SearchOutlined,
} from '@mui/icons-material';

const features = [
  {
    title: 'Image Editor',
    description: 'Adjust image properties like saturation, hue, brightness, temperature, and shadows.',
    icon: <PhotoCamera sx={{ fontSize: 60 }} />,
    path: '/image-editor',
    color: '#1976d2',
  },
  {
    title: 'Video Editor',
    description: 'Apply real-time adjustments to your videos with professional-grade controls.',
    icon: <Videocam sx={{ fontSize: 60 }} />,
    path: '/video-editor',
    color: '#2196f3',
  },
  {
    title: 'Style Transfer',
    description: 'Transform your images using neural style transfer with artistic filters.',
    icon: <Brush sx={{ fontSize: 60 }} />,
    path: '/style-transfer',
    color: '#00acc1',
  },
  {
    title: 'Object Detection',
    description: 'Detect and identify objects in images and videos using AI.',
    icon: <SearchOutlined sx={{ fontSize: 60 }} />,
    path: '/object-detection',
    color: '#0097a7',
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          textAlign: 'center',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="text.primary"
          gutterBottom
        >
          AI Media Processor
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Transform your media with advanced AI-powered tools.
          Adjust, enhance, and stylize your images and videos with professional controls.
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item key={feature.title} xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: feature.color,
                  p: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                {feature.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(feature.path)}
                >
                  Try Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Info Section */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" color="text.primary" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload or capture media, choose your desired adjustments or effects,
          and let our AI-powered tools transform your content in real-time.
          Download your enhanced media in high quality.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
