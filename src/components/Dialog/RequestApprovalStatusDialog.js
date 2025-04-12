import { CancelOutlined } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';

function RequestApprovalStatusDialog({ open, onClose, updateStatus }) {

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
          Status
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-evenly', '.MuiSvgIcon-root': { fontSize: '32px !important' } }}>
          <PrimaryButton
            title={"Cancel"}
            onClick={() => onClose()}
            style={{ backgroundColor: Colors.iron }}
          />
          <PrimaryButton
            title={"Request"}
            onClick={() => updateStatus()}
            style={{ backgroundColor: Colors.primary }}
          />
        </Box>
      </Box>
    </Dialog>
  )
}

export default RequestApprovalStatusDialog