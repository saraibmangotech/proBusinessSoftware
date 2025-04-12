import React, { Fragment, useEffect, useState } from 'react';
import { Avatar, Box, CardMedia, Container, Divider, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { Circle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BuyerRegistrationIcon, CarIcon, DashedBorderIcon, FontFamily, Images, ReceivedBuyerIdIcon, RequestBuyerIdIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import { useAuth } from 'context/UseContext';
import Storage from 'utils/Storage';

const useStyle = makeStyles({
  step: {
    flex: 1,
    display: 'flex',
    gap: '20px',
    alignItem: 'center',
    justifyContent: 'space-between',
    '& .MuiStepLabel-label': {
      color: `${Colors.charcoalGrey} !important`,
      fontSize: { md: '16px' }
    }
  }
})

const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: Colors.iron,
  zIndex: 1,
  color: Colors.charcoalGrey,
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  "svg": {
    width: 'auto',
    height: '25px',
    "path": {
      fill: Colors.smokeyGrey
    },
  },
}));






function GalaxyMotors() {

  const classes = useStyle();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStorageItem } = Storage();

 



  return (
    <Fragment>

      {user?.user_type != "C" &&
         <Box><iframe    src="http://analytics.stg-galaxyworldwide.com/public/dashboard/b932d064-6c7c-4d0b-b313-da5edf3c49aa"    frameborder="0"    width="100%"    height="600"    allowtransparency></iframe> </Box> }


    </Fragment>
  );
}

export default GalaxyMotors;