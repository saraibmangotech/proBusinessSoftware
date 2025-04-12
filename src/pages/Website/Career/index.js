import React, { Fragment } from "react";
import { Box, Container, Typography, Grid, createStyles, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import { Circle, LocationOn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function Career() {

  const navigate = useNavigate();

  const fontSize = createStyles({
    fontSize: {
      xs: '36px',
      sm: '48px',
      md: '56px',
      lg: '65px'
    }
  });

  const jobs = [
    { title: 'HR & Admin', tags: ['Galaxy', 'Admin', 'UAE'], type: 'urgent', location: 'Abu Dhabi, UAE' },
    { title: 'Technical support', tags: ['Galaxy', 'Technical support', 'UAE'], type: 'full time', location: 'Abu Dhabi, UAE' },
    { title: 'Engineer', tags: ['Galaxy', 'Engineer', 'UAE'], type: 'part time', location: 'Abu Dhabi, UAE' },
    { title: 'WordPress Developer', tags: ['Galaxy', 'WordPress', 'Designer', 'UAE'], type: 'full time', location: 'Abu Dhabi, UAE' },
    { title: 'WordPress Developer', tags: ['Galaxy', 'WordPress', 'Designer', 'UAE'], type: 'urgent', location: 'Abu Dhabi, UAE' },
  ]

  return (
    <Fragment>
      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: 700, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.careerBanner}
          alt='banner shade'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: '700px',
            left: 0,
            top: 0,
          }}
        />
        <Container>

        </Container>
      </Box>

      <Box sx={{ py: 4, mt: 4 }}>
        <Container>

          <Typography variant="h2" sx={{ textTransform: 'capitalize', color: Colors.primary }}>
            Explore Boundless Opportunities Join Galaxy Worldwide Shipping
          </Typography>
          <Typography variant="h6" sx={{ my: 1, mb: 4, fontFamily: FontFamily.NunitoRegular }}>
            Where your career journey meets global horizons.
          </Typography>

          <Typography variant="h2" sx={{ textAlign: 'center', mb: 3 }}>
            View Job Opening
          </Typography>

          {jobs.map((job, i) => (
            <Box key={i} sx={{ bgcolor: Colors.flashWhite, py: 3, px: 4, my: 2, borderRadius: '10px' }}>
              <Grid container spacing={2} alignItems={"center"} justifyContent={"space-between"}>
                <Grid item xs={5} sm={5} md={5} lg={5}>
                  <PrimaryButton
                    title={job.type}
                    bgcolor={job.type === 'urgent' ? Colors.urgent : job.type === 'full time' ? Colors.fullTime : Colors.partTime}
                    buttonStyle={{
                      minWidth: "100px",
                      textTransform: 'uppercase'
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    {job?.title}
                  </Typography>
                  <List sx={{ display: 'flex' }}>
                    {job.tags.map((tag, index) => (
                      <ListItem key={index} sx={{ p: 0, width: '80px' }}>
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
                              {tag}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4}>
                  <Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
                    <LocationOn sx={{ fontSize: '18px', verticalAlign: 'sub', mr: 1 }} />
                    Location
                  </Typography>
                  <Typography variant="subtitle2">
                    {job?.location}
                  </Typography>
                </Grid>
                <Grid item xs={3} sm={3} md={3} lg={3} sx={{ textAlign: 'center' }}>
                  <PrimaryButton
                    title={'Apply Now'}
                    onClick={() => navigate(`/career/${i + 1}`)}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

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

export default Career;