import React, { Fragment } from 'react';
import { Box, Grid, Container, Divider, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { ExpandMore, LocationOnOutlined, MailOutline, WhatsApp } from '@mui/icons-material';
import ComplainForm from '../Home/shared/ComplainForm';

function Contact() {

  const serviceData = [
    { image: <WhatsApp sx={{ fontSize: '34px', color: Colors.primary }} />, title: 'Phone Number', subtitle: '(+971) 6 510 2000', description: 'Sem feugiat tempor sed urna. Viverra bibendum cursus lectus nibh quam fermentum lorem lacus.' },
    { image: <MailOutline sx={{ fontSize: '34px', color: Colors.white }} />, title: 'E-Mail', subtitle: 'info@galaxyshipping.com', description: 'Sem feugiat tempor sed urna. Viverra bibendum cursus lectus nibh quam fermentum lorem lacus.' },
    { image: <LocationOnOutlined sx={{ fontSize: '34px', color: Colors.primary }} />, title: 'Address', subtitle: 'Al Ruqa Al Hamra - Near Souk Al Haraj Sharjah | United Arab Emirates', description: 'Sem feugiat tempor sed urna. Viverra bibendum cursus lectus nibh quam fermentum lorem lacus.' }
  ]

  const offices = [
    { city: 'Head Office', image: Images.officeImage, location: 'https://maps.app.goo.gl/YGe5T29tETqZQp2j7', address: 'Industrial Area 13 - Industrial Area - Sharjah - United Arab Emirates' },
    { city: 'Dubai 1', image: Images.officeImage, location: 'https://maps.app.goo.gl/NL8Yx3mEDyWBrnmo7', address: '779H+PF8 - Port Rashid - Dubai - United Arab Emirates' },
    { city: 'Dubai 2', image: Images.officeImage, location: 'https://maps.app.goo.gl/wJMjB9jZFAEsWj9T7', address: 'DEIRA WARFAGE BERTH # 23 OFFICE # 07 - Dubai - United Arab Emirates' },
    { city: 'Sharjah', image: Images.officeImage, location: 'https://maps.app.goo.gl/j81n9tBpXNbqkfEf8', address: 'Industrial Area 4 - Industrial Area - Sharjah - United Arab Emirates' },
  ]

  return (
    <Fragment>

      <Box component={'a'} href={'https://wa.me/+97165102000'} target={'_blank'} sx={{ position: 'fixed', right: 0, bottom: '20%', zIndex: 99, cursor: 'pointer' }}>
        <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
          <WhatsApp sx={{ fontSize: '38px', color: Colors.white }} />
        </IconButton>
      </Box>

      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: { xs: 300, sm: 400, md: 500 }, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.contactBanner}
          alt='banner shade'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: { xs: '300px', sm: '400px', md: '500px' },
            left: 0,
            top: 0,
            opacity: 0.5,
          }}
        />
        <Container>
          <Box sx={{ marginTop: { xs: '28%', sm: '25%', md: '18%' } }}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={8} md={8} sx={{ zIndex: 5 }}>
                <Typography variant="h1" sx={{ textTransform: 'capitalize' }}>
                  Contact Us
                </Typography>
                <Typography variant="h6" sx={{ color: Colors.white, my: 1, fontFamily: FontFamily.NunitoRegular }}>
                  Unlock Global Horizons with Streamlined Shipping
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 2, md: 4 }, mt: { xs: 2, md: 5 } }}>
        <Container>
          <Grid container spacing={2} alignItems={"center"} justifyContent={"space-between"}>
            <Grid item xs={12} md={12} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ mb: 2 }}>
                How Is The Work&nbsp;
                <Typography component={"span"} variant="h2" sx={{ color: Colors.primary }}>
                  Going
                </Typography>
              </Typography>
            </Grid>
            {serviceData.map((data, index) => (
              <Grid key={index} item xs={12} sm={4} md={4}>
                <Box sx={{ height: '200px', py: 4, px: 3, background: index % 2 !== 0 ? Colors.primaryGradient2 : Colors.softPeach, textAlign: 'center' }}>
                  {data?.image}
                  <Typography variant="subtitle2" sx={{ color: index % 2 !== 0 && Colors.white, my: 1, fontFamily: FontFamily.NunitoRegular, fontWeight: 700, textTransform: 'uppercase' }}>
                    {data?.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: index % 2 !== 0 && Colors.white, mb: 2, fontFamily: FontFamily.NunitoRegular, textTransform: 'capitalize' }}>
                    {data?.subtitle}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ========== Complain Form ========== */}
      <ComplainForm />

      <Box sx={{ py: { xs: 3, md: 6 }, mt: { xs: 2, md: 4 }, bgcolor: Colors.whiteSmoke }}>
        <Container>
          <Typography variant="h2" sx={{ my: 2 }}>
            Offices
          </Typography>
          <Divider sx={{ my: 2, bgcolor: '#CCCCCC' }} />
          <Box sx={{ my: 2 }}>
            {offices.map((data, index) => (
              <Accordion key={index} elevation={0} defaultExpanded={index === 0 ? true : false} sx={{ bgcolor: 'transparent' }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body1">
                    {data.city}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} alignItems={'center'} >
                    <Grid item xs={12} sm={6} md={7} sx={{ textAlign: 'center' }}>
                      <Box
                        component={'img'}
                        src={data.image}
                        sx={{ width: 'auto', height: { xs: '200px', md: '260px' }, borderRadius: '10px' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={5} md={3}>
                      <Box component={'a'} href={data?.location} target={'_blank'} sx={{ display: 'flex', '&:hover': { 'svg': { color: Colors.primary }, '.MuiTypography-root': { color: Colors.primary } } }}>
                        <LocationOnOutlined sx={{ fontSize: '28px', mr: 1.5, color: Colors.textSecondary }} />
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.textSecondary }}>
                          {data.address}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

    </Fragment>
  );
}

export default Contact;