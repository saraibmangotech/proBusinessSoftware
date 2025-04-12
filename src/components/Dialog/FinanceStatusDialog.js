import { CancelOutlined, CheckCircle, Circle } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';

function FinanceStatusDialog({ open, onClose, status, updateStatus }) {

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { width: '30%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
    >
      <IconButton onClick={() => onClose()} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
          Finance Status
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-evenly', '.MuiSvgIcon-root': { fontSize: '32px !important' } }}>
          <PrimaryButton
            title={"Pending"}
            onClick={() => updateStatus(false)}
            startIcon={
              status ? (
                <Circle sx={{ color: Colors.greyCloud }} />
              ) : (
                <CheckCircle sx={{ color: Colors.primary }} />
              )
            }
            style={{ backgroundColor: status ? Colors.iron : Colors.charcoalGrey }}
          />
          <PrimaryButton
            title={"Verify"}
            onClick={() => updateStatus(true)}
            startIcon={
              status ? (
                <CheckCircle sx={{ color: Colors.white }} />
              ) : (
                <Circle sx={{ color: Colors.greyCloud }} />
              )
            }
            style={{ backgroundColor: status ? Colors.primary : Colors.iron }}
          />
        </Box>
      </Box>
    </Dialog>
  )
}

export default FinanceStatusDialog