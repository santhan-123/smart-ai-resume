import React, { useMemo, useState } from 'react';
import Chat from './pages/Chat';
import { ThemeProvider, createTheme, CssBaseline, IconButton, Box, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(()=>createTheme({
    palette:{ mode, primary:{ main: mode==='light' ? '#1565c0' : '#90caf9' }},
    shape:{ borderRadius:10 },
    typography:{ fontFamily: 'Roboto, system-ui, Arial' }
  }),[mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position:'fixed', top:8, right:8, zIndex:2000 }}>
        <Tooltip title="Toggle light/dark mode">
          <IconButton color="inherit" onClick={()=>setMode(m=> m==='light' ? 'dark':'light')} size="small">
            {mode==='light'? <DarkModeIcon fontSize="small"/>:<LightModeIcon fontSize="small"/>}
          </IconButton>
        </Tooltip>
      </Box>
      <Chat />
    </ThemeProvider>
  );
}

export default App;
