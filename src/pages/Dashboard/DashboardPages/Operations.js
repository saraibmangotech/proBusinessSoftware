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






function Operations() {

  const classes = useStyle();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStorageItem } = Storage();


  var METABASE_SITE_URL = "https://analytics.galaxyshipping.com";
  var METABASE_SECRET_KEY = "ef76f064e132dbd6451c433bf8e9ed4ffde35889dfe6409cc4856c681518037f";

  let iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + localStorage.getItem('operationsToken') + "#bordered=false&titled=true";


  return (
    <Fragment>

      {user?.user_type != "C" &&
        <Box><iframe
          src={iframeUrl}
          frameBorder={0}
          width={'100%'}
          height={600}
          allowTransparency
        />
        </Box>}


    </Fragment>
  );
}

export default Operations;