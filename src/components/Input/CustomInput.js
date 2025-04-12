import React from 'react';
import { TextField, InputAdornment, Box, Typography } from '@mui/material';

const CustomTextField = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Year Inside Cost
      </Typography>
      <TextField
        placeholder="Year Inside Cost"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ backgroundColor: '#000', color: '#fff', borderRadius: '10px 0 0 10px', padding: '8px 12px' }}>
              AED
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#f5f5f5',
            '& fieldset': {
              borderColor: '#000',
            },
            '&:hover fieldset': {
              borderColor: '#000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000',
            },
          },
          '& .MuiInputBase-input': {
            padding: '8px',
            fontSize: '14px',
            borderRadius: '0 10px 10px 0',
            backgroundColor: '#fff',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000',
          },
        }}
        fullWidth
      />
    </Box>
  );
};

export default CustomTextField;
