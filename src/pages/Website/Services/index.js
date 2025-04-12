import React, { Fragment, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Divider, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { BuildingIcon, FontFamily, Images, PlaneIcon2, ShipIcon2, TruckIcon2 } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import { ExpandMore, PhoneOutlined } from '@mui/icons-material';

import { Link } from 'react-router-dom';
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

function Service() {

  const classes = useStyles();

  const coreValues = [
    { image: <ShipIcon2 />, title: 'Quality Excellence', description: 'Striving for excellence in every aspect, committed to delivering high-quality outcomes that exceed expectations.' },
    { image: <BuildingIcon />, title: 'Diversity & Inclusion', description: 'Fostering an inclusive environment that celebrates diversity, values each individual, and promotes a sense of belonging.' },
    { image: <PlaneIcon2 />, title: 'Accountability', description: 'Embracing authenticity, taking full responsibility for our commitments, and holding ourselves accountable to the highest standards' },
    { image: <TruckIcon2 />, title: 'Teamwork', description: 'Collaborating seamlessly, we work together to achieve collective success, surpassing expectations through effective communication and mutual support.' },
  ]

  const services = [
    { image: Images.service1, title: 'Warehousing', description: 'Complementing our comprehensive logistics, our UAE-based warehouses are at your service. Explore a wide range of warehousing solutions tailored to safeguard your valuable goods.' },
    { image: Images.service2, title: 'Track & Trace', description: 'Empowering our clients, we offer internet tracking and tracing. Our custom-made tracking solution provides real-time cargo and shipping information for enhanced transparency.' },
    { image: Images.service3, title: 'Car Sales', description: 'Simplify your vehicle transactions. GALAXY WORLDWIDE SHIPPING assists in purchasing brand new or used vehicles, boats, bikes, ATVs, and custom-made cars and trucks, ensuring a seamless experience.' },
    { image: Images.service4, title: 'Ocean Freight', description: 'Specializing in LCL and FCL operations, we provide top-notch ocean freight services. Weekly departures and competitive rates from major ports in the USA and Canada ensure a reliable global shipping experience.' },
    { image: Images.service5, title: 'Customs Clearance', description: 'Swift and comprehensive UAE customs clearance services guarantee the timely delivery of your cargo to its final destination, navigating the complexities of customs regulations seamlessly.' },
    { image: Images.service6, title: 'Auto Shipping', description: 'Effortless global vehicle transport. From any location in the continental US and Canada to overseas destinations, we handle the import/export of brand new, used, or custom vehicles—cars, boats, bikes, and trucks—connecting you to UAE and beyond.' },
    { image: Images.service7, title: 'Customs Brokerage', description: 'Accelerate shipments through customs with our expert Customs brokers. We ensure compliance with all UAE customs regulations for smooth and expedited processes.' },
    { image: Images.service8, title: 'Containerization', description: 'Adhering to industry best practices, our containerization operations guarantee the proper handling and secure transportation of vehicles, preventing unnecessary damage.' },
  ]

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
    <Fragment>

      <Box>
        {/* <video className={classes.desktopVideo} ref={videoRef1} style={{ width: '100%', height: '100vh', objectFit: 'cover' }}>
          <source src={ServiceVideo} type="video/mp4" />
        </video>
        <video className={classes.mobileVideo} ref={videoRef2} style={{ width: '100%', height: '100vh', objectFit: 'cover' }}>
          <source src={ServiceMobileVideo} type="video/mp4" />
        </video> */}
      </Box>

      <Box sx={{ py: { xs: 2, md: 4 }, mt: { xs: 1, md: 3 } }}>
        <Container>
          <Typography variant="h4" sx={{ color: Colors.primary, textAlign: 'center' }}>
            Our Services
          </Typography>
          <Typography variant="h2" sx={{ my: 2, textAlign: 'center' }}>
            Dive into Our Range of Global Logistics Solutions
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular, px: 2, mb: 4 }}>
            Discover a full array of logistics solutions designed to meet your unique requirements. From efficient transportation to effective supply chain management, we've got your global logistics covered. With us, your unique needs are not only met but exceeded, ensuring a logistics experience that goes beyond the ordinary.
          </Typography>
          {services.map((data, index) => (
            <Grid key={index} container spacing={3} justifyContent={'space-between'} sx={{ my: 2 }}>
              <Grid item xs={12} sm={6} md={6} sx={{ order: { sm: index % 2 === 0 ? 0 : 1 } }}>
                <Box sx={{ bgcolor: '#00000005', borderRadius: 2, p: 2.5, height: { xs: '190px', md: '315px' } }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {data?.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.smokeyGrey }}>
                    {data?.description}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={6} sx={{ order: index % 2 === 0 ? 1 : 0 }}>
                <Box
                  component={'img'}
                  src={data?.image}
                  sx={{ height: { xs: '200px', md: '330px' } }}
                />
              </Grid>
            </Grid>
          ))}
        </Container>
      </Box>

      <Box sx={{ py: { xs: 2, md: 4 }, mt: { xs: 3, md: 6 } }}>
        <Container>
          <Grid container spacing={2} alignItems={'center'} justifyContent={'space-between'}>
            <Grid item xs={12} sm={6} md={5.5} sx={{ position: 'relative', textAlign: 'right', order: { xs: 2, md: 1 } }}>
              <Box
                component={'img'}
                src={Images.logistic}
                sx={{
                  width: { xs: '330px', md: '460px' }
                }}
              />
              <Box
                sx={{
                  bgcolor: Colors.primary,
                  width: { xs: '300px', md: '450px' },
                  height: { xs: '300px', md: '400px' },
                  position: 'absolute',
                  top: '60%',
                  left: 0,
                  transform: 'translateY(-50%)',
                  zIndex: -1
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={5.5} sx={{ order: { xs: 1, md: 2 } }}>
              <Typography variant="h3" sx={{ my: 2 }}>
                We provide a full range of
                global logistic solutions.
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                Discover a full array of logistics solutions designed to meet your unique requirements. From efficient transportation to effective supply chain management, we've got your global logistics covered. With us, your unique needs are not only met but exceeded, ensuring a logistics experience that goes beyond the ordinary. Galaxy Worldwide Shipping prioritizes efficiency, ensuring secure and reliable services tailored to your logistics needs. Our commitment is to exceed expectations, making us your trusted global shipping partner.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 2, md: 4 }, mt: { xs: 2, md: 5 } }}>
        <Container>
          <Grid container spacing={2} justifyContent={'space-between'}>
            <Grid item xs={12} sm={5} md={4.5}>
              <Typography variant="h2">
                Our Core Values
              </Typography>
            </Grid>
            <Grid container spacing={2} item md={7.5} alignItems={'center'} justifyContent={'space-between'}>
              {coreValues.map((data, index) => (
                <Grid key={index} item xs={12} sm={6} md={6}>
                  <Box sx={{ display: "flex", my: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ width: '90px', "svg": { width: '80px' } }}>
                      {data?.image}
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: '#D8D8D8', mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ my: 1 }}>
                        {data?.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                        {data?.description}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 3, md: 6 }, mt: { xs: 2, md: 4 }, bgcolor: Colors.whiteSmoke }}>
        <Container>
          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ borderLeft: `2px solid ${Colors.primary}`, pl: 1.5, mb: 1 }}>
                FAQ
              </Typography>
              <Typography variant="h2" sx={{ mt: 3, mb: 4 }}>
                Frequently Asked Questions
              </Typography>
              <Box sx={{ my: 2 }}>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      How Can I Open an Account with GWWS Company?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      To open an account with Galaxy Worldwide Shipping, please visit our account <Typography variant='body2' component={Link} to={'/register'} sx={{ textDecoration: 'underline', color: Colors.primary }}>registration</Typography> page. Follow the simple steps to create your account and gain access to our comprehensive shipping services.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      What Are the Shipping Costs at GWWS?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      For detailed shipping costs, please refer to our shipping rates on the official GWWS website. You can find the information you need by visiting our <Typography variant='body2' component={Link} to={'/quote'} sx={{ textDecoration: 'underline', color: Colors.primary }}>shipping rates</Typography> page.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      How Can I Purchase Cars from Live Auctions with GWWS?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      If you open an account with GWWS, our Customer Service team will supply you with a personalized buyer ID for Copart and IAAI Auctions, making it easy for you to participate
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      Is My Car Insured Against Damage or Fire with GWWS?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      Yes, your vehicle is fully insured with Galaxy Worldwide Shipping. In the unfortunate event of damage or fire, rest assured that your car is comprehensively covered, and you will receive a full refund.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      What Payment Options are Available for Auction Cars with GWWS?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      We offer multiple convenient payment options for auction purchases:
                    </Typography>
                    <Box sx={{ pl: 1, mt: 1 }}>
                      <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                        a.	Bank Wire Transfer
                      </Typography>
                      <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                        b.	Cash in our offices
                      </Typography>
                      <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                        c.	Cash collecting provided service
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      What is a VIN or container number?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      The VIN or Container number consists of 20 characters and numbers mixed approx. It can be found printed on your booking form.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" sx={{ color: '#4D4D4D' }}>
                      What information will you get from shipment and container tracking?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: Colors.cloudyGrey, fontFamily: FontFamily.NunitoRegular }}>
                      Besides providing information on the current location of your freight container, a successful tracking inquiry will allow you to see:
                      Type and size of your container. Estimated date and time of your container's arrival at each milestone. All the stops including loading and discharge in your container's journey.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ position: 'relative', textAlign: 'right' }}>
              <Box
                component={'img'}
                src={Images.faqImage}
                sx={{
                  width: 'auto',
                  height: { xs: '320px', sm: '400px', md: '450px' }
                }}
              />
              <Box
                sx={{
                  bgcolor: Colors.blueWhale,
                  width: { xs: '280px', sm: '350px' },
                  px: { xs: 2, sm: 4 },
                  py: { xs: 2.5, sm: 5 },
                  position: 'absolute',
                  top: { xs: '180px', sm: '220px', md: '280px' },
                  left: { xs: '5px', sm: '10px', md: '-60px' },
                  transform: 'translateY(-50%)',
                  textAlign: 'left',
                  color: Colors.white,
                }}
              >
                <Typography component="span" variant="body2" sx={{ bgcolor: Colors.darkCerulean, borderLeft: `2px solid ${Colors.primary}`, p: 1, pl: 1.5 }}>
                  Let's Talk
                </Typography>
                <Typography variant="subtitle1" sx={{ lineHeight: '22px', fontFamily: FontFamily.NunitoRegular, fontWeight: 300, mt: 2 }}>
                  You need any help? get free consultation
                </Typography>
                <Box sx={{ my: 3, display: 'flex', gap: '10px' }}>
                  <IconButton sx={{ bgcolor: Colors.darkCerulean, width: '50px', height: '50px' }}>
                    <PhoneOutlined sx={{ color: Colors.white }} />
                  </IconButton>
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                      Have Any Questions
                    </Typography>
                    <Typography component={"a"} href={'https://wa.me/+97165102000'} target={'_blank'} variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey, transition: '0.3s ease-in-out', '&:hover': { color: Colors.primary } }}>
                      (+971) 6 510 2000
                    </Typography>
                  </Box>
                </Box>
                <Typography component={"a"} href={'https://wa.me/+97165102000'} target={'_blank'} variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular, color: Colors.grey, transition: '0.3s ease-in-out', '&:hover': { color: Colors.primary } }}>
                  <PrimaryButton title='Send a Message' />
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

    </Fragment>
  );
}
export default Service;