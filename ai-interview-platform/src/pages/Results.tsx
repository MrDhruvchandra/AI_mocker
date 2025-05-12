import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { InterviewFormData } from '../types';

interface InterviewState {
  questions: string[];
  answers: Record<number, string>;
  feedback: Record<number, string>;
  formData: InterviewFormData;
}

const Results: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions, answers, feedback, formData } = location.state as InterviewState;

  const handleRestart = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Interview Results
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Topic: {formData.topic} | Experience: {formData.experience} | Duration: {formData.duration} minutes
          </Typography>

          <List>
            {questions.map((question, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        Question {index + 1}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" component="div" gutterBottom>
                          {question}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Your Answer:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {answers[index] || 'No answer provided'}
                        </Typography>
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Feedback:
                          </Typography>
                          {feedback[index] || 'No feedback available'}
                        </Alert>
                      </Box>
                    }
                  />
                </ListItem>
                {index < questions.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleRestart}
              size="large"
            >
              Start New Interview
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Results; 