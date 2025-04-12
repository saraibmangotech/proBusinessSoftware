import React from "react";
import { Box, Typography, Container, Grid } from "@mui/material";
import { makeStyles, createStyles } from '@mui/styles';
import Colors from "assets/Style/Colors";
import 'swiper/css/bundle';
import InputField from "components/Input";
import { PrimaryButton } from "components/Buttons";

const useStyles = makeStyles(() =>
  createStyles({
    formContainerItem: {
      paddingInline: '15px',
      width: '100%',
    },
  })
)

function ComplainForm() {

  const classes = useStyles();

  return (
    <Box sx={{ py: { xs: '35px', md: '50px' } }}>
      <Container>
        <Grid container spacing={2}>
          <Grid item md={6}>
            <Typography variant='h1' sx={{ color: Colors.textSecondary }}>
              Reach out to us
            </Typography>
            <Typography variant='h1' sx={{ color: Colors.textSecondary }}>
              for any&nbsp;
              <Typography component={'span'} variant='h1' sx={{ color: Colors.primary }}>
                Inquiries
              </Typography>
            </Typography>
          </Grid>
          <Grid container spacing={1} item md={6}>
            <Grid item md={6} className={classes.formContainerItem}>
              <InputField
                label={'First Name'}
                placeholder={'Bilal'}
                inputStyle={{
                  bgcolor: Colors.water,
                  "& fieldset": {
                    border: 'none',
                  },
                }}
                style={{ m: 0 }}
              />
            </Grid>
            <Grid item md={6} className={classes.formContainerItem}>
              <InputField
                label={'Last Name'}
                placeholder={'Asghar'}
                inputStyle={{
                  bgcolor: Colors.water,
                  "& fieldset": {
                    border: 'none',
                  },
                }}
                style={{ m: 0 }}
              />
            </Grid>
            <Grid item md={12} className={classes.formContainerItem}>
              <InputField
                type={'number'}
                label={'Your Phone'}
                placeholder={'(123) 456 7890'}
                inputStyle={{
                  bgcolor: Colors.water,
                  "& fieldset": {
                    border: 'none',
                  },
                }}
                style={{ m: 0 }}
              />
            </Grid>
            <Grid item md={12} className={classes.formContainerItem}>
              <InputField
                label={'Your Message'}
                multiline
                rows='4'
                inputStyle={{
                  bgcolor: Colors.water,
                  "& fieldset": {
                    border: 'none',
                  },
                }}
                style={{ m: 0 }}
              />
            </Grid>
            <Grid item md={12} className={classes.formContainerItem}>
              <Box sx={{ mt: '15px' }}>
                <PrimaryButton title='Send a Message' />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default ComplainForm;