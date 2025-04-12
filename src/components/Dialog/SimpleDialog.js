import { CancelOutlined } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';

function SimpleDialog({ open, onClose, title, children, width }) {

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { width: width ? width : { xs: '90%', sm: '80%', md: '40%' }, height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 }, fontFamily: 'Public Sans' } }}
    >
      <IconButton onClick={() =>  onClose()} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box sx={{display:'flex',justifyContent:'center'}}>
      <Box component={'img'} src={Images.questionIcon} width={'50px'} sx={{textAlign:'center'}} ></Box>
      </Box>
      <Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: 'Public Sans', mt: 1, mb: 2.5 }}>
        {title}
      </Typography>
      {children}
    </Dialog>
  )
}

export default SimpleDialog