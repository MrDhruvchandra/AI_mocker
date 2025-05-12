import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { InterviewFormData } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InterviewFormData>({
    topic: '',
    experience: '',
    duration: 30,
    difficulty: 'intermediate',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      navigate('/interview', { state: formData });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            AI Interview Platform
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Get ready for your next interview with AI-powered practice
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Experience Level"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Duration (minutes)</InputLabel>
                    <Select
                      value={formData.duration}
                      label="Duration"
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      disabled={isSubmitting}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={45}>45 minutes</MenuItem>
                      <MenuItem value={60}>60 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={formData.difficulty}
                      label="Difficulty"
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                       
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Starting Interview...' : 'Start Interview'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 