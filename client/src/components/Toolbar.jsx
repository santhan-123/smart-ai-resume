    import React from 'react';
    import { AppBar, Toolbar, Typography, Box } from '@mui/material';

    function AppToolbar() {
      return (
        <AppBar position="static" color="primary">
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                AI Resume Assistant
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      );
    }

    export default AppToolbar;
    