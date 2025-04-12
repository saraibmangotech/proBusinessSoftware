import React from 'react';
import { Box, Container } from '@mui/material';
import Colors from 'assets/Style/Colors';
import RegisterContainer from 'container/Register'
import { Fragment } from 'react';

function Register() {

  return (
    <Fragment>

      <Box sx={{ py: 9, bgcolor: Colors.milkWhite }}>
        <Container>

          <RegisterContainer />

        </Container>
      </Box>

    </Fragment>
  );
}

export default Register;