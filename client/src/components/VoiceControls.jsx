import React from 'react';
import { Box, FormControlLabel, Switch, Tooltip } from '@mui/material';
import useVoiceStore from '../store/useVoiceStore';

const VoiceControls = () => {
  const { speechInputEnabled, speechOutputEnabled, toggleSpeechInput, toggleSpeechOutput } = useVoiceStore();
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', p: 1 }}>
      <Tooltip title="Enable/disable speaking your answers via microphone">
        <FormControlLabel control={<Switch checked={speechInputEnabled} onChange={toggleSpeechInput} />} label="Voice Input" />
      </Tooltip>
      <Tooltip title="Enable/disable assistant reading responses aloud">
        <FormControlLabel control={<Switch checked={speechOutputEnabled} onChange={toggleSpeechOutput} />} label="Voice Output" />
      </Tooltip>
    </Box>
  );
};

export default VoiceControls;
