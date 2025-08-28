import React from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';

const ProgressBar = ({ progress }) => {
  if (!progress || !progress.totalSteps) return null;
  const value = Math.min(100, Math.round((progress.currentStep / progress.totalSteps) * 100));
  return (
    <Box sx={{ px:2, py:1 }}>
      <Typography variant="caption" sx={{ display:'block', mb:0.5 }}>
        Progress: {progress.currentStep}/{progress.totalSteps} {progress.completed ? '(Completed)' : ''}
      </Typography>
      <LinearProgress variant="determinate" value={value} />
    </Box>
  );
};

export default ProgressBar;
