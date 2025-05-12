import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface VideoRecorderProps {
  isTimeUp: boolean;
  isProcessing: boolean;
  onRecordingStateChange: (isRecording: boolean) => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isTimeUp,
  isProcessing,
  onRecordingStateChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    const initializeVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          console.log('Recording stopped, video blob:', blob);
        };

      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeVideo();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let recordingTimer: NodeJS.Timeout;
    if (isRecording) {
      recordingTimer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (!isRecording) {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      onRecordingStateChange(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ 
        position: 'relative', 
        width: '200px', 
        height: '150px', 
        margin: '0 auto 20px',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {isRecording && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <FiberManualRecordIcon sx={{ color: 'error.main', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'white' }}>
              {formatRecordingTime(recordingTime)}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
          <IconButton 
            onClick={toggleRecording}
            color={isRecording ? "error" : "primary"}
            disabled={isTimeUp || isProcessing}
          >
            {isRecording ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default VideoRecorder; 