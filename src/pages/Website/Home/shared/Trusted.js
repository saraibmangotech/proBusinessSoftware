import React from "react";
import { Images } from "assets";
import { Box, CardMedia, Typography, Container } from "@mui/material";
import { makeStyles, createStyles } from '@mui/styles';
import Colors from "assets/Style/Colors";
import Marquee from "react-fast-marquee";

const useStyles = makeStyles((theme) =>
  createStyles({
    imgBoxContainer: {
      width: '100%',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: 'auto',
      height: '80px',
      margin: '0px 15px',
      objectFit: 'contain !important',
      [theme.breakpoints.down("md")]: {
        height: '70px',
      },
      [theme.breakpoints.down("sm")]: {
        height: '55px',
      },
    }
  })
)

function Trusted() {

  const classes = useStyles();

  const TrustedImages = [
    {
      img: Images.trustedLogo1
    },
    {
      img: Images.trustedLogo2
    },
    {
      img: Images.trustedLogo3
    },
    {
      img: Images.trustedLogo4
    },
    {
      img: Images.trustedLogo5
    },
    {
      img: Images.trustedLogo6
    },
    {
      img: Images.trustedLogo7
    },
    {
      img: Images.trustedLogo8
    },
    {
      img: Images.trustedLogo9
    },
    {
      img: Images.trustedLogo10
    },
    {
      img: Images.trustedLogo11
    },
  ]

  return (
    <Box sx={{ py: 4, mt: 3 }}>
      <Container>
        <Typography variant='h1' sx={{ color: Colors.black, textAlign: 'center', mb: { xs: 3, md: 5 } }}>
          Trusted By
        </Typography>
        <Box sx={{ py: 3 }}>
          <Marquee>
            {TrustedImages.map((item, index) => (
              <CardMedia
                key={index}
                component={'img'}
                image={item.img}
                className={classes.image}
              />
            ))}
          </Marquee>
        </Box>
      </Container>
    </Box>
  )
}

export default Trusted;