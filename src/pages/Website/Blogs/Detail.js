import React, { Fragment } from "react";
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import { FacebookFIcon, FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import { ArrowForwardIos, CalendarToday, Instagram, LocationOnOutlined, Mail, Phone, X, YouTube } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import InputField from "components/Input";

const descriptionStyle = {
  my: 1.8,
  fontFamily: FontFamily.NunitoRegular,
  color: Colors.smokeyGrey
}

const iconBtn = {
  backgroundColor: 'transparent',
  // width: '40px',
  // height: '40px',
  '&:hover': {
    backgroundColor: 'transparent',
  }
}

function BlogDetail() {

  const navigate = useNavigate();

  return (
    <Fragment>

      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: 500, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.blog}
          alt='banner shade'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: '500px',
            left: 0,
            top: 0,
            opacity: '0.4'
          }}
        />
        <Container>
          <Box sx={{ marginTop: '20%' }}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={8} md={8} sx={{ zIndex: 5 }}>
                <Typography variant="h1" sx={{ textTransform: 'capitalize' }}>
                  Our Recent News
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 4, mt: 4 }}>
        <Container>
          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={12} md={7}>
              <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                <CalendarToday sx={{ fontSize: '16px', verticalAlign: 'sub', mr: 1 }} />
                September 22, 2021
              </Typography>
              <Typography variant="h2" sx={{ mt: 1, mb: 3, textTransform: 'capitalize' }}>
                The ability to advise is
                better than competitors
              </Typography>
              <Typography variant="body2" sx={{ ...descriptionStyle }}>
                Bibendum aliquam praesent commodo felis arcu lectus quis fames. Feugiat feugiat a orci mus.
                Ullamcorper tristique nam neque at nam. Egestas at in enim sed mauris nunc dui, dignissim. Potenti mollis
                in gravida leo ut donec mattis consectetur bibendum. Amet platea elementum ut gravida sed odio mattis
                nec pellentesque. Etiam consectetur facilisi risus nisi at lorem. Tincidunt adipiscing aliquam malesuada.
              </Typography>
              <Typography variant="body2" sx={{ ...descriptionStyle }}>
                Nam ac, vitae et pellentesque commodo lectus convallis faucibus porta. At lectus ultrices id nisi in
                adipiscing tempus. Eget nulla ullamcorper nec proin consequat amet nisi posuere.
              </Typography>
              <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ ...descriptionStyle }}>
                  Ut venenatis etiam nunc, tempus urna vel diam.
                  Tellus nisi, ut cursus felis. Amet non amet
                  elementum leo, ac mauris et elit, viverra. Nibh
                  fermentum tellus tincidunt cras. Quis laoreet
                  amet, facilisi suscipit id ultrices nunc varius
                  dignissim. Amet sed.
                </Typography>
                <Typography variant="body2" sx={{ ...descriptionStyle }}>
                  Tincidunt turpis id viverra lectus viverra nulla
                  mauris neque. Hendrerit non leo aliquam
                  bibendum tincidunt vulputate nunc. Mi sagittis,
                  justo est sed sed risus sed. Ut varius sodales non
                  leo neque. Semper nisi ipsum enim neque, nisl sit
                  nisl.
                </Typography>
              </Box>
              <Box sx={{ mt: 2.5, mb: 3.5, position: 'relative' }}>
                <Box
                  component={'img'}
                  src={Images.quotes}
                  sx={{ position: 'absolute', top: '-13px', left: '10px' }}
                />
                <Typography variant="body2" sx={{ color: Colors.black, width: '90%', mx: 'auto', fontFamily: FontFamily.NunitoRegular, position: 'relative', zIndex: 2, fontWeight: 700 }}>
                  Neque rhoncus at id sit feugiat id. Amet ipsum integer gravida donec fames pellentesque. Id
                  tortor nunc, sed ullamcorper in in metus. Fusce pharetra ac eu, amet tellus in.
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ...descriptionStyle }}>
                Mattis tincidunt etiam leo sed. Feugiat amet ipsum hendrerit pellentesque faucibus vitae sed augue. Risus
                et elementum pellentesque elementum, fermentum morbi. Massa eu nisi, mattis velit nunc pellentesque.
                Etiam ipsum fringilla gravida augue elit. Ultrices velit.
              </Typography>
              <Box sx={{ mt: 5 }}>
                <LoadingButton
                  variant="text"
                  sx={{
                    textTransform: "capitalize",
                    fontSize: 20,
                  }}
                >
                  Post Tags
                </LoadingButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ bgcolor: Colors.whiteSmoke, borderRadius: '10px', py: 4, px: 6 }}>
                <Typography variant="h5" sx={{ mt: 1, mb: 2 }}>
                  About us
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, fontFamily: FontFamily.NunitoRegular }}>
                  Ullamcorper tellus non nam
                  quis purus lacus, magna purus.
                </Typography>
                <Box sx={{ my: 1, mb: 3 }}>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocationOnOutlined sx={{ fontSize: '18px', mr: 1, color: Colors.primary }} />
                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.textSecondary }}>
                      United Arab Emirates
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ fontSize: '18px', mr: 1, color: Colors.primary }} />
                    <Typography component={"a"} href={'https://wa.me/+97165102000'} target={'_blank'} variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.textSecondary, transition: '0.3s ease-in-out', '&:hover': { color: Colors.primary } }}>
                      (+971) 6 510 2000
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Mail sx={{ fontSize: '18px', mr: 1, color: Colors.primary }} />
                    <Typography component={"a"} href={'mailto:info@galaxyshipping.com'} variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.textSecondary, transition: '0.3s ease-in-out', '&:hover': { color: Colors.primary } }}>
                      info@galaxyshipping.com
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ mt: 1, mb: 2.5 }}>
                  Categories
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: FontFamily.NunitoRegular }}>
                  <ArrowForwardIos sx={{ color: Colors.primary, fontSize: '14px', mr: 1, verticalAlign: 'middle' }} />
                  Ocean Freight
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: FontFamily.NunitoRegular }}>
                  <ArrowForwardIos sx={{ color: Colors.primary, fontSize: '14px', mr: 1, verticalAlign: 'middle' }} />
                  Air Freight
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontFamily: FontFamily.NunitoRegular }}>
                  <ArrowForwardIos sx={{ color: Colors.primary, fontSize: '14px', mr: 1, verticalAlign: 'middle' }} />
                  Ocean Freight
                </Typography>
                <Typography variant="h5" sx={{ mt: 3, mb: 2.5 }}>
                  Newsletter
                </Typography>
                <InputField
                  label={'E-Mail'}
                  placeholder={'enquiry@gwwshipping.com'}
                  inputStyle={{
                    bgcolor: Colors.water,
                    "& fieldset": {
                      border: 'none',
                    },
                  }}
                />
                <PrimaryButton fullWidth title={"Subscribe"} buttonStyle={{ textTransform: "capitalize" }} />
                <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
                  Follow us
                </Typography>
                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', mt: 3, mb: 2 }}>
                  <Typography component={'a'} href={'https://www.facebook.com/GalaxyWorldWideShipping'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn }}>
                      <FacebookFIcon />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://twitter.com/GWWS_LLC'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn }}>
                      <X sx={{ color: Colors.primary }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://www.instagram.com/GalaxyWorldWideshippingllc'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn }}>
                      <Instagram sx={{ color: Colors.primary }} />
                    </IconButton>
                  </Typography>
                  <Typography component={'a'} href={'https://www.youtube.com/channel/UC_8dvAz4l3v1jSRQdoU8wAA'} target={'_blank'}>
                    <IconButton sx={{ ...iconBtn }}>
                      <YouTube sx={{ color: Colors.primary }} />
                    </IconButton>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: 350, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.questionBg}
          alt='img'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: '350px',
            left: 0,
            top: 0,
            opacity: '20%',
          }}
        />
        <Box sx={{ mt: 13, position: 'relative', zIndex: 5 }}>
          <Container>
            <Grid container spacing={2} alignItems={"center"} justifyContent={"space-between"}>
              <Grid item xs={12} md={6}>
                <Typography variant="h2" sx={{ color: Colors.white, textTransform: 'capitalize' }}>
                  Have any questions?
                </Typography>
                <Typography variant="body2" sx={{ color: Colors.white, mt: 3, mb: 5, pr: 4, height: '80px', fontFamily: FontFamily.NunitoRegular }}>
                  Lacus in turpis tristique ac nulla. Nibh penatibus amet, nullam at
                  ullamcorper justo, nec. Ut eget magna libero ut et augue.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                <PrimaryButton title='Contact Now' onClick={() => navigate('/contact')} />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

    </Fragment>
  )
}

export default BlogDetail;