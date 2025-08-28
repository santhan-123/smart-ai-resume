    import React from 'react';
    import { IconButton, CircularProgress } from '@mui/material';
    import MicIcon from '@mui/icons-material/Mic';
    import MicOffIcon from '@mui/icons-material/MicOff';

    function MicButton({ isListening, onToggleListening, isLoading }) {
      return (
        <IconButton
          color={isListening ? 'error' : 'primary'}
          onClick={onToggleListening}
          disabled={isLoading}
          aria-label={isListening ? 'stop listening' : 'start listening'}
          sx={{
            ml: 1, // Margin left to separate from text input
            width: 48, // Fixed width for consistent size
            height: 48, // Fixed height
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            isListening ? <MicOffIcon /> : <MicIcon />
          )}
        </IconButton>
      );
    }

    export default MicButton;
    