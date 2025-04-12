import React, { Fragment, useState } from 'react';
import { Box, CardMedia, Container, Typography, Grid, Divider, IconButton, FormControl, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { EmailOutlined, FacebookOutlined, Instagram, KeyboardDoubleArrowRight, LinkedIn, LocationOnOutlined, AccessTime, SendOutlined, WhatsApp, X, YouTube } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import Colors from 'assets/Style/Colors';
import { FontFamily, Images } from 'assets';
import { emailRegex } from 'utils/index';
import { ErrorToaster } from 'components/Toaster';

const useStyles = makeStyles({
  mailBox: {
    position: 'absolute',
    top: '50%',
    right: '-35px',
    transform: 'translateY(-50%) skewX(-17deg)',
    height: '58px',
    width: '60px',
    fontSize: '24px',
    color: Colors.white,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: Colors.primary,
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    '&:hover .MuiSvgIcon-root, &:hover .MuiTypography-root': {
      color: Colors.primary,
      transition: '0.3s ease-in-out',
    }
  },
  copyRight: {
    fontFamily: `${FontFamily.NunitoRegular} !important`,
    color: Colors.primary,
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    '&:hover': {
      color: Colors.white
    }
  },
});

const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: Colors.white + '2b', // Change the border color here
    },
    '&:hover fieldset': {
      borderColor: Colors.white + '2b', // Change the border color on hover here
    },
    '&.Mui-focused fieldset': {
      borderColor: Colors.primary, // Change the border color when focused here
    },
    '& input': {
      color: Colors.white, // Change the text color here
      fontSize: '13px',
      fontWeight: 300,
      fontFamily: FontFamily.NunitoRegular
    },
  },
});

function Footer() {

  const classes = useStyles();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const iconBtn = {
    backgroundColor: '#313c44',
    width: '40px',
    height: '40px',
    transition: '0.3s ease-in-out',
  }

  const quickLinks = [
    { title: 'Home', path: '/' },
    { title: 'Services', path: '/services' },
    { title: 'About Us', path: '/about' },
    // { title: 'Blogs', path: '/blogs' },
    { title: 'Quote', path: '/quote' },
    // { title: 'Careers', path: '/careers' },
    { title: 'Contact Us', path: '/contact' },
  ]

  // *For NewsLetter
  const newsLetter = async (formData) => {
    setLoading(true)
    try {
      console.log(formData)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 2000);
    }
  }

  return (
    <Fragment>

      {/* ========== Footer ========== */}
      <CardMedia image={Images.footerBg} sx={{ bgcolor: Colors.secondary, pt: '40px', borderBottom: `1px solid ${Colors.white + '1f'}` }}>
        <Container>
          <Grid container spacing={2} justifyContent={'space-between'}>
            <Grid item xs={12} sm={6} md={4}>
              <Link to="/">
                <Box
                  component="img"
                  src={Images.gifLogo}
                  alt='Galaxy World Wide Shipping'
                  sx={{ height: { xs: '60px', lg: '90px' } }}
                />
              </Link>
              <Box sx={{ mb: 4, mt: 2.5 }}>
                <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey }}>
                  Galaxy Worldwide Shipping company is one of the top Auto Shipping Firms in UAE and the world since 2005. Galaxy provides fast, reliable, and high-quality shipping services. We can import or export your brand new, used or custom made cars, boats, bikes, and trucks from and to UAE and the world.
                </Typography>
                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', mt: 3, mb: 2 }}>
                  <Typography component={'a'} href={'https://wa.me/+97165102000'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn, '&:hover': { bgcolor: Colors.whatsapp } }}>
                      <WhatsApp sx={{ fontSize: '18px', color: Colors.white }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://www.facebook.com/GalaxyWorldWideShipping'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn, '&:hover': { bgcolor: Colors.facebook } }}>
                      <FacebookOutlined sx={{ fontSize: '18px', color: Colors.white }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://www.instagram.com/GalaxyWorldWideshippingllc'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn, '&:hover': { bgcolor: Colors.instagram } }}>
                      <Instagram sx={{ fontSize: '18px', color: Colors.white }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://www.linkedin.com/company/galaxyworldwideshipping'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn, '&:hover': { bgcolor: Colors.linkedin } }}>
                      <LinkedIn sx={{ fontSize: '18px', color: Colors.white }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://twitter.com/GWWS_LLC'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn, '&:hover': { bgcolor: Colors.black } }}>
                      <X sx={{ fontSize: '18px', color: Colors.white }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://www.youtube.com/channel/UC_8dvAz4l3v1jSRQdoU8wAA'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn, '&:hover': { bgcolor: Colors.youtube } }}>
                      <YouTube sx={{ fontSize: '18px', color: Colors.white }} />
                    </IconButton>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ pl: { lg: '30px', md: '0', sm: '0', xs: '0' }, mt: 3 }}>
                <Typography variant="h5" sx={{ color: Colors.white }}>
                  Quick Links
                </Typography>
                <Box className={'heading-divider'} sx={{ mt: 2.5, mb: 3 }} />
                <Box component={"ul"} sx={{ p: 0 }}>
                  {quickLinks.map((item, index) => (
                    <Box key={index} component={"li"} sx={{ listStyle: 'none', pb: 3 }}>
                      <Box component={Link} to={item.path} className={classes.list}>
                        <KeyboardDoubleArrowRight sx={{ color: Colors.grey }} />
                        <Typography variant="body1" sx={{ color: Colors.grey, fontFamily: FontFamily.NunitoRegular }}>
                          {item.title}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" sx={{ color: Colors.white }}>
                  Find Us
                </Typography>
                <Box className={'heading-divider'} sx={{ mt: 2.5, mb: 3 }} />
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailOutlined sx={{ fontSize: '28px', mr: 1.5, color: Colors.primary }} />
                    <Typography component={"a"} href={'mailto:info@galaxyshipping.com'} variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey, transition: '0.3s ease-in-out', '&:hover': { color: Colors.primary } }}>
                      info@galaxyshipping.com
                    </Typography>
                  </Box>
                  <Divider flexItem sx={{ borderBottom: `1px dashed #374148`, my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WhatsApp sx={{ fontSize: '28px', mr: 1.5, color: Colors.primary }} />
                    <Typography component={"a"} href={'https://wa.me/+97165102000'} target={'_blank'} variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey, transition: '0.3s ease-in-out', '&:hover': { color: Colors.primary } }}>
                      (+971) 6 510 2000
                    </Typography>
                  </Box>
                  <Divider flexItem sx={{ borderBottom: `1px dashed #374148`, my: 2 }} />
                  <Box sx={{ display: 'flex' }}>
                    <LocationOnOutlined sx={{ fontSize: '28px', mr: 1.5, color: Colors.primary }} />
                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey }}>
                      Al Ruqa Al Hamra - Near Souk Al Haraj Sharjah | United Arab Emirates
                    </Typography>
                  </Box>
                  <Divider flexItem sx={{ borderBottom: `1px dashed #374148`, my: 2 }} />
                  <Box sx={{ display: 'flex' }}>
                    <AccessTime sx={{ fontSize: '28px', mr: 1.5, color: Colors.primary }} />
                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey }}>
                      Monday to Saturday 09:00AM to 07:00 PM.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h5" sx={{ color: Colors.white }}>
                  Subscribe
                </Typography>
                <Box className={'heading-divider'} sx={{ mt: 2.5, mb: 3 }} />
                <Box component="form" onSubmit={handleSubmit(newsLetter)} sx={{ my: 1.5 }}>
                  <FormControl variant="standard" fullWidth sx={{ my: 1.3, '.MuiFormHelperText-root': { ml: 0 } }} >
                    <CustomTextField
                      type={'email'}
                      placeholder={'Email Address'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton type='submit' edge="end" >
                              {loading ? (
                                <CircularProgress size={20} sx={{ color: Colors.white }} />
                              ) : (
                                <SendOutlined color="primary" sx={{ transform: 'rotate(-38deg)' }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      error={errors?.email?.message}
                      {...register("email", {
                        required: 'Please enter a your email address.',
                        pattern: {
                          value: emailRegex,
                          message: 'Please enter a valid email address.',
                        }
                      })}
                    />
                    {errors?.email?.message && (
                      <Typography sx={{ color: Colors.danger, fontSize: 12, textAlign: 'left' }}>{errors?.email?.message}</Typography>
                    )}
                  </FormControl>
                </Box>
                <Typography variant="h5" sx={{ color: Colors.white, mb: 2 }}>
                  Get The App
                </Typography>
                <Link
                  to="https://play.google.com/store/apps/details?id=com.galaxyshipping "
                  aria-label="play store"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Box
                    component="img"
                    loading="lazy"
                    src={Images.googlePlay}
                    alt={"play store"}
                    sx={{ width: "130px", mr: 1 }}
                  />
                </Link>
                <Link
                  to="https://apps.apple.com/pk/app/gwshipping/id6479711465"
                  aria-label="app store"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Box
                    component="img"
                    loading="lazy"
                    src={Images.appStore}
                    alt={"app store"}
                    sx={{ width: "130px" }}
                  />
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </CardMedia>

      {/* ========== Footer BottomBar ========== */}
      <Box sx={{ bgcolor: Colors.secondary, p: '25px 8px', textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: Colors.grey, fontFamily: FontFamily.NunitoRegular }}>
          © Copyright {moment().format('YYYY')}. All rights reserved.
          <Typography component={'a'} variant="body1" className={classes.copyRight}>
            &nbsp;Galaxy World Wide Shipping
          </Typography>

        </Typography>
      </Box>

    </Fragment>
  );
}

export default Footer;