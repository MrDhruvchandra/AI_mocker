import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { InterviewFormData } from '../types';
import { generateQuestions, evaluateAnswer } from '../services/api';
import VideoRecorder from '../components/interview/VideoRecorder';
import SpeechRecognitionComponent from '../components/interview/SpeechRecognition';
import InterviewControls from '../components/interview/InterviewControls';

interface InterviewState {
  currentQuestion: number;
  questions: string[];
  answers: Record<number, string>;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  timeRemaining: number;
  isTimeUp: boolean;
  isRecording: boolean;
}

const Interview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state as InterviewFormData;

  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: 0,
    questions: [],
    answers: {},
    isComplete: false,
    isLoading: true,
    error: null,
    isProcessing: false,
    timeRemaining: formData.duration * 60,
    isTimeUp: false,
    isRecording: false,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questions = await generateQuestions(formData);
        setInterviewState(prev => ({
          ...prev,
          questions,
          isLoading: false,
        }));
      } catch (error) {
        setInterviewState(prev => ({
          ...prev,
          error: 'Failed to generate questions. Please try again.',
          isLoading: false,
        }));
      }
    };

    fetchQuestions();
  }, [formData]);

  useEffect(() => {
    if (interviewState.isLoading || interviewState.isComplete || interviewState.isProcessing || interviewState.isTimeUp) return;

    const timer = setInterval(() => {
      setInterviewState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return {
            ...prev,
            timeRemaining: 0,
            isTimeUp: true
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState.isLoading, interviewState.isComplete, interviewState.isProcessing, interviewState.isTimeUp]);

  const handleAnswerChange = (answer: string) => {
    setInterviewState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [interviewState.currentQuestion]: answer,
      },
    }));
  };

  const handleNext = () => {
    if (interviewState.currentQuestion < interviewState.questions.length - 1) {
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    } else {
      setInterviewState(prev => ({
        ...prev,
        isComplete: true,
      }));
      getFeedbackForAllQuestions();
    }
  };

  const handlePrevious = () => {
    if (interviewState.currentQuestion > 0) {
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  const handleAutoSubmit = () => {
    setInterviewState(prev => ({
      ...prev,
      isComplete: true,
    }));
    getFeedbackForAllQuestions();
  };

  const getFeedbackForAllQuestions = async () => {
    setInterviewState(prev => ({
      ...prev,
      isProcessing: true
    }));

    const feedbackPromises = interviewState.questions.map((question, index) => {
      const answer = interviewState.answers[index] || '';
      return evaluateAnswer(question, answer);
    });

    try {
      const feedbacks = await Promise.all(feedbackPromises);
      const feedbackMap = feedbacks.reduce((acc, feedback, index) => {
        acc[index] = feedback;
        return acc;
      }, {} as Record<number, string>);

      navigate('/results', { 
        state: { 
          ...interviewState, 
          feedback: feedbackMap,
          formData 
        } 
      });
    } catch (error) {
      console.error('Error getting feedback:', error);
      setInterviewState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Failed to get feedback. Please try again.'
      }));
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (interviewState.isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (interviewState.isTimeUp) {
    return (
      <Container maxWidth="md">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}>
          <Typography variant="h4" color="error" gutterBottom>
            Time's Up!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Submitting your answers...
          </Typography>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (interviewState.error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{interviewState.error}</Alert>
        </Box>
      </Container>
    );
  }

  const currentQuestion = interviewState.questions[interviewState.currentQuestion];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <VideoRecorder
            isTimeUp={interviewState.isTimeUp}
            isProcessing={interviewState.isProcessing}
            onRecordingStateChange={(isRecording) => 
              setInterviewState(prev => ({ ...prev, isRecording }))
            }
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <SpeechRecognitionComponent
              isTimeUp={interviewState.isTimeUp}
              isProcessing={interviewState.isProcessing}
              onTranscriptChange={handleAnswerChange}
            />
          </Box>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Typography 
              variant="h4" 
              color={interviewState.timeRemaining <= 60 ? 'error' : 'primary'}
              sx={{ 
                animation: interviewState.timeRemaining <= 60 ? 'pulse 1s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                }
              }}
            >
              {formatTime(interviewState.timeRemaining)}
            </Typography>
          </Box>

          <Typography variant="h5" gutterBottom>
            {currentQuestion}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={interviewState.answers[interviewState.currentQuestion] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            sx={{ mb: 3 }}
            disabled={interviewState.isTimeUp}
          />

          <InterviewControls
            currentQuestion={interviewState.currentQuestion}
            totalQuestions={interviewState.questions.length}
            isProcessing={interviewState.isProcessing}
            isTimeUp={interviewState.isTimeUp}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default Interview; 