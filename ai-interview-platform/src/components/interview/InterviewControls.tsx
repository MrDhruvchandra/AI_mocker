import React from 'react';
import { Box, Button, Typography, LinearProgress } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

interface InterviewControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  isProcessing: boolean;
  isTimeUp: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  currentQuestion,
  totalQuestions,
  isProcessing,
  isTimeUp,
  onPrevious,
  onNext,
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Question {currentQuestion + 1} of {totalQuestions}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onPrevious}
          size="large"
          disabled={currentQuestion === 0 || isProcessing || isTimeUp}
        >
          Previous Question
        </Button>

        <Button
          variant="contained"
          onClick={onNext}
          size="large"
          disabled={isProcessing || isTimeUp}
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isProcessing 
            ? 'Processing...'
            : currentQuestion === totalQuestions - 1
              ? 'Finish Interview'
              : 'Next Question'}
        </Button>
      </Box>
    </Box>
  );
};

export default InterviewControls; 