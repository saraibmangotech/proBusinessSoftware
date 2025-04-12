import { CancelOutlined, CheckCircle, Circle } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';

function VccStatusDialog({ open, onClose, status, updateStatus }) {

  return (
    <Dialog
      open={open}
      maxWidth={'sm'}
      sx={{ '& .MuiDialog-paper': { width: '100%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
    >
      <IconButton onClick={() => onClose()} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
          Vcc Status
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-evenly', '.MuiSvgIcon-root': { fontSize: '32px !important' } }}>
          <PrimaryButton
            title={"Pending"}
            startIcon={
              <CheckCircle sx={{ color: Colors.primary }} />
            }
            style={{ backgroundColor: Colors.charcoalGrey }}
          />
          <PrimaryButton
            title={"Amount Paid"}
            startIcon={
              <CheckCircle sx={{ color: Colors.white }} />
            }
            style={{ backgroundColor: status === 'amount_paid' ? Colors.bluishCyan : Colors.iron }}
          />
          <PrimaryButton
            title={"Issue"}
            onClick={() => updateStatus()}
            startIcon={
              <CheckCircle sx={{ color: Colors.white }} />
            }
            style={{ backgroundColor: Colors.primary }}
          />
        </Box>
      </Box>
    </Dialog>
  )
}

export default VccStatusDialog