import React, { useState, useEffect } from 'react';
import { TextField, IconButton, InputAdornment, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function MessageInput({ onSendMessage, isLoading, transcript, setTranscript }) { // Destructure setTranscript
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setTranscript(''); // Clear transcript in useSpeech after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', bgcolor: 'background.paper' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        sx={{
          borderRadius: '25px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '25px',
            pr: 1,
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                aria-label="send message"
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

export default MessageInput;