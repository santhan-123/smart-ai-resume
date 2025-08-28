import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Typography, Button, Paper, Divider } from '@mui/material';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import AppToolbar from '../components/Toolbar';
import MicButton from '../components/MicButton';
import VoiceControls from '../components/VoiceControls';
import useVoiceStore from '../store/useVoiceStore';
import useChat from '../hooks/useChat';
import ProgressBar from '../components/ProgressBar';
import ResumePreview from '../components/ResumePreview';
import useSpeech from '../hooks/useSpeech';

function Chat() {
  const { messages, isLoading, error, sendUserMessage, startNewChat, resumeData, progress } = useChat();
  const { isListening, transcript, setTranscript, startListening, stopListening, speak } = useSpeech();
  const { speechInputEnabled, speechOutputEnabled } = useVoiceStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!speechOutputEnabled) return;
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'ai') speak(lastMessage.text);
    }
  }, [messages, speak, speechOutputEnabled]);

  const handleSendMessage = useCallback((message) => {
    if (!message) return;
    sendUserMessage(message);
    setTranscript('');
  }, [sendUserMessage, setTranscript]);

  const handleMicToggle = () => {
    if (!speechInputEnabled) return;
    if (isListening) stopListening(); else startListening();
  };

  // Auto-send transcript on voice input end
  useEffect(() => {
    if (speechInputEnabled && transcript) {
      handleSendMessage(transcript);
    }
  }, [transcript, speechInputEnabled, handleSendMessage]);
  
  return (
    <Box sx={{ display:'flex', height:'100vh', bgcolor:'background.default' }}>
      {/* Left / Chat Panel */}
      <Box sx={{ flex:2, display:'flex', flexDirection:'column', minWidth:0, borderRight: (theme)=>`1px solid ${theme.palette.divider}` }}>
        <AppToolbar />
        <VoiceControls />
        <ProgressBar progress={progress} />
        <Container maxWidth={false} sx={{ flexGrow:1, py:1, px:2, overflowY:'auto', display:'flex', flexDirection:'column' }}>
        {messages.length === 0 && !isLoading && !error && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 5 }}>
            Type or speak to begin a new chat.
          </Typography>
        )}
        
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg.text} sender={msg.sender} />
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Thinking...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
        </Container>
        <Box sx={{ bgcolor:'background.paper', borderTop: (theme)=>`1px solid ${theme.palette.divider}`, p:1, display:'flex', alignItems:'center' }}>
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isListening}
          transcript={transcript}
          setTranscript={setTranscript} // Pass setTranscript
        />
        <MicButton
          isListening={isListening}
          onToggleListening={handleMicToggle}
          isLoading={isLoading}
        />
        <Button
          variant="outlined"
          onClick={startNewChat}
          disabled={isLoading}
          sx={{ ml: 1, whiteSpace: 'nowrap' }}
        >
          New Chat
        </Button>
        </Box>
      </Box>
      {/* Right / Preview Panel */}
      <Box sx={{ flex:1.2, display:{ xs:'none', md:'flex'}, flexDirection:'column' }}>
        <Paper square elevation={0} sx={{ p:1, borderBottom:(theme)=>`1px solid ${theme.palette.divider}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography variant="subtitle1" fontWeight={600}>Live Resume Preview</Typography>
          {progress?.completed && <Typography variant="caption" color="success.main">Complete</Typography>}
        </Paper>
        <ResumePreview data={resumeData} />
      </Box>
    </Box>
  );
}

export default Chat;
