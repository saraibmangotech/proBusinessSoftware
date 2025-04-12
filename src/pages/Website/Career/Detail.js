import React, { Fragment } from "react";
import { Box, Container, Typography, Grid, createStyles, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import { CalendarToday, Circle, LocationOnOutlined, Mail, Phone } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function CareerDetail() {

  const navigate = useNavigate();

  const fontSize = createStyles({
    fontSize: {
      xs: '36px',
      sm: '48px',
      md: '56px',
      lg: '65px'
    }
  });

  const lists = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Nullam dictum ligula a gravida porta.',
    'Nam pellentesque orci ut odio blandit, sit amet elementum augue venenatis.',
    'Vivamus semper magna suscipit leo malesuada, eu dictum velit varius.',
    'Nulla non enim eu quam rutrum dictum in non urna.',
    'Integer et felis a purus convallis condimentum nec vel eros.',
    'Vestibulum porta libero nec aliquet blandit.',
    'Duis pretium sapien vitae felis tincidunt lobortis vel et urna',
  ]

  return (
    <Fragment>

      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: 450, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.careerBanner}
          alt='banner shade'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: '450px',
            left: 0,
            top: 0,
            opacity: 0.4,
          }}
        />
        <Container>
          <Box sx={{ marginTop: '18%' }}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={8} md={8} sx={{ zIndex: 5 }}>
                <Typography variant="h1" sx={{ ...fontSize, textTransform: 'capitalize' }}>
                  Career
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 4, mt: 4 }}>
        <Container>
          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                <CalendarToday sx={{ fontSize: '16px', verticalAlign: 'sub', mr: 1 }} />
                September 22, 2021
              </Typography>
              <Typography variant="h2" sx={{ mt: 1, mb: 3 }}>
                WordPress Developer
              </Typography>
              <Typography variant="h5" sx={{ my: 1 }}>
                Who Are We Looking For
              </Typography>
              <List>
                {lists.map((list, index) => (
                  <ListItem key={index} sx={{ p: 0, py: 0.5 }}>
                    <ListItemIcon
                      sx={{
                        minWidth: "auto",
                        p: "5px",
                        svg: {
                          height: "10px",
                          width: "10px",
                        },
                      }}
                    >
                      <Circle />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            textTransform: "capitalize",
                            fontFamily: FontFamily.NunitoRegular,
                          }}
                        >
                          {list}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h5" sx={{ my: 1 }}>
                What You Will Be Doing
              </Typography>
              <List>
                {lists.map((list, index) => (
                  <ListItem key={index} sx={{ p: 0, py: 0.5 }}>
                    <ListItemIcon
                      sx={{
                        minWidth: "auto",
                        p: "5px",
                        svg: {
                          height: "10px",
                          width: "10px",
                        },
                      }}
                    >
                      <Circle />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            textTransform: "capitalize",
                            fontFamily: FontFamily.NunitoRegular,
                          }}
                        >
                          {list}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ bgcolor: Colors.whiteSmoke, borderRadius: '10px', p: 5 }}>
                <Typography variant="h5" sx={{ mt: 1, mb: 3 }}>
                  About us
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
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
                <PrimaryButton fullWidth title={"Apply Now"} />
              </Box>
            </Grid>
            <Grid item xs={12} md={12}>
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <PrimaryButton title={"Apply Now"} />
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
            opacity: 0.3,
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

export default CareerDetail;