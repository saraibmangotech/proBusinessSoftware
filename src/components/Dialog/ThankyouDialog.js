import { CancelOutlined } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { FontFamily, Timer } from 'assets';
import Colors from 'assets/Style/Colors';

function ThankyouDialog({ open, onClose, message1, message2 }) {

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { width: '25%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
    >
      <IconButton onClick={() => onClose()} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box sx={{ textAlign: 'center' }}>
        <Timer />
        <Typography variant="h3" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
          {message1}
        </Typography>
        <Typography variant="h6" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
          {message2}
        </Typography>
      </Box>
    </Dialog>
  )
}

export default ThankyouDialog