import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';


const useStyles = makeStyles((theme) =>
  createStyles({
    desktopVideo: {
      display: 'block',
      [theme.breakpoints.down("sm")]: {
        display: 'none'
      },
    },
    mobileVideo: {
      display: 'none',
      [theme.breakpoints.down("sm")]: {
        display: 'block'
      },
    },
  })
)

function Banner() {

  const classes = useStyles();

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    if (videoRef1.current) {
      videoRef1.current.loop = true; // Enable auto-replay
      videoRef1.current.muted = true; // Mute the video to ensure autoplay
      videoRef1.current.play().catch((error) => {
        // Handle any potential autoplay errors here
      });
    }
    if (videoRef2.current) {
      videoRef2.current.loop = true; // Enable auto-replay
      videoRef2.current.muted = true; // Mute the video to ensure autoplay
      videoRef2.current.play().catch((error) => {
        // Handle any potential autoplay errors here
      });
    }
  }, []);

  return (
    <Box>
      {/* <video className={classes.desktopVideo} ref={videoRef1} style={{ width: '100%', height: '100vh', objectFit: 'cover' }}>
        <source src={LandingVideo} type="video/mp4" />
      </video>
      <video className={classes.mobileVideo} ref={videoRef2} style={{ width: '100%', height: '100vh', objectFit: 'cover' }}>
        <source src={LandingMobileVideo} type="video/mp4" />
      </video> */}
    </Box>
  );
}

export default Banner;