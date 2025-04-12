import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { FacebookOutlined, Instagram, LinkedIn, X } from '@mui/icons-material';
import Colors from 'assets/Style/Colors';

function SocialLinks() {

  const iconBtn = {
    borderRadius: 0,
    width: '50px',
    height: '70px',
    transition: '0.3s ease-in-out',
  }

  return (
    <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', position: 'fixed', right: 0, top: '20%', zIndex: 99 }}>
      <Typography component={'a'} href={'https://www.facebook.com/GalaxyWorldWideShipping'} target={'_blank'}>
        <IconButton sx={{ ...iconBtn, bgcolor: Colors.facebook2, '&:hover': { bgcolor: Colors.facebook2 } }}>
          <FacebookOutlined sx={{ fontSize: '26px', color: Colors.white }} />
        </IconButton>
      </Typography>
      <Typography component={'a'} href={'https://www.instagram.com/GalaxyWorldWideshippingllc'} target={'_blank'}>
        <IconButton sx={{ ...iconBtn, bgcolor: Colors.instagram2, '&:hover': { bgcolor: Colors.instagram2 } }}>
          <Instagram sx={{ fontSize: '26px', color: Colors.white }} />
        </IconButton>
      </Typography>
      <Typography component={'a'} href={'https://twitter.com/GWWS_LLC'} target={'_blank'}>
        <IconButton sx={{ ...iconBtn, bgcolor: Colors.black, '&:hover': { bgcolor: Colors.black } }}>
          <X sx={{ fontSize: '26px', color: Colors.white }} />
        </IconButton>
      </Typography>
      <Typography component={'a'} href={'https://www.linkedin.com/company/galaxyworldwideshipping'} target={'_blank'}>
        <IconButton sx={{ ...iconBtn, bgcolor: Colors.linkedin2, '&:hover': { bgcolor: Colors.linkedin2 } }}>
          <LinkedIn sx={{ fontSize: '26px', color: Colors.white }} />
        </IconButton>
      </Typography>
    </Box>
  );
}

export default SocialLinks;