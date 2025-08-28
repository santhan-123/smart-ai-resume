    import React from 'react';
    import { Box, Typography, Paper } from '@mui/material';

    function ChatBubble({ message, sender }) {
      const isUser = sender === 'user';

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 2, // Margin bottom for spacing between bubbles
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: '20px',
              maxWidth: '70%',
              bgcolor: isUser ? 'primary.light' : 'grey.200',
              color: isUser ? 'white' : 'black',
              border: 'none', // Remove default border
              boxShadow: 1, // Subtle shadow for depth
            }}
          >
            <Typography variant="body1">
              {message}
            </Typography>
          </Paper>
        </Box>
      );
    }

    export default ChatBubble;
    