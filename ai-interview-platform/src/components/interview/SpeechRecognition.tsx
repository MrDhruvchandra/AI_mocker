import React, { useRef, useEffect, useState } from 'react';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// TypeScript declarations for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionProps {
  isTimeUp: boolean;
  isProcessing: boolean;
  onTranscriptChange: (transcript: string) => void;
}

const SpeechRecognitionComponent: React.FC<SpeechRecognitionProps> = ({
  isTimeUp,
  isProcessing,
  onTranscriptChange,
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const createRecognition = (): SpeechRecognition | null => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        onTranscriptChange(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition failed. Please try again.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found. Please ensure your microphone is connected.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access was denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your internet connection and try again.';
            break;
        }

        setIsListening(false);
        setError(errorMessage);
      };

      return recognition;
    } catch (error) {
      console.error('Error creating speech recognition:', error);
      setError('Failed to initialize speech recognition. Please try again.');
      return null;
    }
  };

  const initializeRecognition = async () => {
    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission

      const recognition = createRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        setIsInitialized(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Microphone access was denied. Please allow microphone access and try again.');
      return false;
    }
  };

  useEffect(() => {
    // Initialize speech recognition when component mounts
    initializeRecognition();

    return () => {
      // Cleanup when component unmounts
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, []);

  const toggleListening = async () => {
    if (!isInitialized) {
      const initialized = await initializeRecognition();
      if (!initialized) return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition not initialized. Please try again.');
      return;
    }

    try {
      if (!isListening) {
        if (!navigator.onLine) {
          setError('No internet connection. Please check your network and try again.');
          return;
        }
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
      setError('Failed to toggle speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  return (
    <Box>
      <Tooltip title={isListening ? "Stop Listening" : "Start Voice Input"}>
        <IconButton 
          onClick={toggleListening}
          color={isListening ? "error" : "primary"}
          disabled={isTimeUp || isProcessing}
        >
          {isListening ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
      </Tooltip>
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
          {error}
        </Typography>
      )}
      {isListening && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <FiberManualRecordIcon sx={{ color: 'error.main', fontSize: 16, animation: 'pulse 1s infinite' }} />
          <Typography variant="caption" color="text.secondary">
            Listening...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SpeechRecognitionComponent; 