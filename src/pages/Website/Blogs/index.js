import React, { Fragment } from "react";
import { Box, Container, Typography, Grid, Card, CardActionArea, CardContent, CardMedia } from '@mui/material';
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import { useNavigate } from "react-router-dom";
import { CalendarToday } from "@mui/icons-material";

const shadowBox = {
  bgcolor: 'transparent',
  width: '100%',
  height: '100%',
  position: 'absolute',
  left: '0px',
  top: '0px',
  opacity: '1',
  boxShadow: 'rgba(0, 0, 0, 0.1) 0rem 0.25rem 0.375rem -0.0625rem, rgba(0, 0, 0, 0.06) 0rem 0.125rem 0.25rem -0.0625rem',
  transform: 'scale(0.94)',
  filter: 'blur(12px)',
  borderRadius: 4,
}

const blogTextStyle = {
  '-webkit-line-clamp': '6',
  '-webkit-box-orient': 'vertical',
  display: '-webkit-box',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-all',
  color: Colors.smokeyGrey,
  fontFamily: FontFamily.NunitoRegular,
  mb: 2
}

function Blogs() {

  const navigate = useNavigate();

  const blogs = [
    { image: Images.serviceBanner, title: 'Lorem ipsum dolor, sit amet', description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus cumque odio repellat dolorem molestiae ipsam, architecto praesentium nostrum porro nesciunt corrupti, non iusto debitis labore velit officia aliquam maiores veritatis dolore totam, laudantium omnis quis tempore? Est reiciendis mollitia sed voluptate vero, odio vitae, porro autem consequatur numquam excepturi possimus.' },
    { image: Images.serviceBanner, title: 'Lorem ipsum dolor, sit amet', description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus cumque odio repellat dolorem molestiae ipsam, architecto praesentium nostrum porro nesciunt corrupti, non iusto debitis labore velit officia aliquam maiores veritatis dolore totam, laudantium omnis quis tempore? Est reiciendis mollitia sed voluptate vero, odio vitae, porro autem consequatur numquam excepturi possimus.' },
    { image: Images.serviceBanner, title: 'Lorem ipsum dolor, sit amet', description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Temporibus cumque odio repellat dolorem molestiae ipsam, architecto praesentium nostrum porro nesciunt corrupti, non iusto debitis labore velit officia aliquam maiores veritatis dolore totam, laudantium omnis quis tempore? Est reiciendis mollitia sed voluptate vero, odio vitae, porro autem consequatur numquam excepturi possimus.' },
  ]

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
                  Blogs
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 5, mt: 7, mb: 4 }}>
        <Container>
          <Grid container spacing={2} justifyContent={'space-between'}>
            {blogs.map((data, i) => (
              <Grid key={i} item xs={12} md={3.8}>
                <Card sx={{ borderRadius: 4, overflow: 'visible', boxShadow: 'rgba(0, 0, 0, 0.1) 0rem 0.25rem 0.375rem -0.0625rem, rgba(0, 0, 0, 0.06) 0rem 0.125rem 0.25rem -0.0625rem' }}>
                  <CardActionArea sx={{ '.MuiCardActionArea-focusHighlight': { bgcolor: 'transparent' } }}>
                    <Box
                      sx={{
                        position: 'relative',
                        mx: '16px',
                        mt: '-34px',
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/blog/${i + 1}`)}
                    >
                      <CardMedia
                        component="img"
                        height="220"
                        image={data.image}
                        sx={{
                          borderRadius: 4,
                          position: 'relative',
                          zIndex: 1,
                          boxShadow: 'rgba(0, 0, 0, 0.1) 0rem 0.25rem 0.375rem -0.0625rem, rgba(0, 0, 0, 0.06) 0rem 0.125rem 0.25rem -0.0625rem'
                        }}
                      />
                      <Box
                        sx={{
                          ...shadowBox,
                          background: `url(${data.image}) 0% 0% / cover transparent`,
                        }}
                      />
                    </Box>
                    <CardContent sx={{ py: 3 }}>
                      <Typography variant="caption" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                        <CalendarToday sx={{ fontSize: '16px', verticalAlign: 'sub', mr: 1 }} />
                        September 22, 2021
                      </Typography>
                      <Typography gutterBottom variant="h5">
                        {data.title}
                      </Typography>
                      <Typography variant="body2" sx={{ ...blogTextStyle }}>
                        {data.description}
                      </Typography>
                      <PrimaryButton
                        title={'Read Full Article'}
                        onClick={() => navigate(`/blog/${i + 1}`)}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    </Fragment>
  )
}

export default Blogs;