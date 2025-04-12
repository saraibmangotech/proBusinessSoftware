import React, { Fragment } from 'react';
import { Box, Container, Typography, Grid, Avatar, Card, CardMedia } from '@mui/material';
import { Calender, FontFamily, Images, Target } from 'assets';
import Colors from 'assets/Style/Colors';
import { Done } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, Autoplay } from 'swiper/modules';
import 'swiper/css/bundle';
import { PrimaryButton } from 'components/Buttons';
import Banner from '../Home/shared/Banner';
import { useNavigate } from 'react-router-dom';

function About() {

  const navigate = useNavigate();

  const specialties = [
    { image: <Target />, title: 'Our Mission', description: 'Dedicated to providing the highest service level, fostering enduring relationships, and sustaining excellence in shipping.' },
    { image: <Target />, title: 'Our Vision', description: 'Expand SEA and LAND freight services, emerging as a leading vehicle shipping and logistics company, setting industry standards.' },
    { image: <Target />, title: 'Our Values', description: 'Our commitment is rooted in integrity, adaptability, and a client-centric approach, ensuring the highest ethical standards and service satisfaction.' },
  ]
  const latestNews = [
    { image: Images.latestNew, date: '09', description: 'Inland freight a worthy solution for your business' },
    { image: Images.latestNew, date: '10', description: 'Inland freight a worthy solution for your business' },
    { image: Images.latestNew, date: '11', description: 'Inland freight a worthy solution for your business' },
    { image: Images.latestNew, date: '12', description: 'Inland freight a worthy solution for your business' },
  ]

  const testimonial = [
    { name: 'John Smith', image: Images.client, description: 'Adipiscing orci amet amet, interdum sed lacus at. Nisi semper nisl risus in bibendum vivamus id donec.Aliquam feugiat urna pharetra elementum tristique mi felis sed blandit. Dui ultricies etiam nisl cursus elementum eu nec dolor non metus massa.' },
    { name: 'John Smith', image: Images.client, description: 'Adipiscing orci amet amet, interdum sed lacus at. Nisi semper nisl risus in bibendum vivamus id donec.Aliquam feugiat urna pharetra elementum tristique mi felis sed blandit. Dui ultricies etiam nisl cursus elementum eu nec dolor non metus massa.' },
    { name: 'John Smith', image: Images.client, description: 'Adipiscing orci amet amet, interdum sed lacus at. Nisi semper nisl risus in bibendum vivamus id donec.Aliquam feugiat urna pharetra elementum tristique mi felis sed blandit. Dui ultricies etiam nisl cursus elementum eu nec dolor non metus massa.' },
  ]

  return (
    <Fragment>

      <Banner />

      <Box sx={{ py: { xs: 2, md: 4 }, mt: { xs: 2, md: 4 } }}>
        <Container>
          <Grid container spacing={2} alignItems={'center'} justifyContent={"space-between"}>
            <Grid item xs={12} sm={6} md={6}>
              <Typography variant="h2" sx={{ my: 2 }}>
                We help  you make
                your shipping experience
                seamless and stress-free.
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                Our dedicated team ensures that every step of your journey is simplified, from booking to delivery. We prioritize efficiency, reliability, and customer satisfaction, making your experience with Galaxy Worldwide Shipping seamless and enjoyable.
              </Typography>
              <Box sx={{ display: "flex", mb: 2, justifyContent: 'space-between' }}>
                <Done sx={{ color: Colors.primary, mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                    Streamline customs clearance with Galaxy Worldwide Shipping. Our expert team ensures efficient processing, minimizing delays for a smooth and hassle-free import/export experience.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", mb: 2, justifyContent: 'space-between' }}>
                <Done sx={{ color: Colors.primary, mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                    Enjoy real-time updates on your shipments, enhancing transparency and providing peace of mind throughout the entire shipping journey.                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", mb: 2, justifyContent: 'space-between' }}>
                <Done sx={{ color: Colors.primary, mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                    Experience unparalleled confidence with our highly secured shipment processes, utilizing advanced security measures to meticulously safeguard your valuable cargo throughout its journey.                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 4 }}>
                <PrimaryButton title='Contact Us' onClick={() => navigate('/contact')} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={5.5} sx={{ position: 'relative' }}>
              <Box
                component={'img'}
                src={Images.aboutBanner}
                sx={{ width: 'auto', height: { xs: '400px', md: '550px' } }}
              />
              <Box
                sx={{
                  bgcolor: Colors.primary,
                  width: { xs: '300px', md: '400px' },
                  height: { xs: '250px', md: '350px' },
                  position: 'absolute',
                  top: '60%',
                  right: '-10px',
                  transform: 'translateY(-50%)',
                  zIndex: -1
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ pt: { xs: 3, md: 6 }, pb: { xs: 4, md: 8 }, mt: { xs: 2, md: 4 }, bgcolor: Colors.whiteSmoke }}>
        <Container>
          <Grid container spacing={2} alignItems={'center'} justifyContent={'space-evenly'}>
            {specialties.map((data, index) => (
              <Grid key={index} item xs={12} sm={6} md={3.5}>
                <Box sx={{ bgcolor: Colors.white, textAlign: 'center', p: 3, height: '250px' }}>
                  {data?.image}
                  <Typography variant="body2" sx={{ my: 1, fontFamily: FontFamily.NunitoRegular, fontWeight: 700, textTransform: 'uppercase' }}>
                    {data?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular, textTransform: 'capitalize' }}>
                    {data?.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: 400, py: { xs: 3 }, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.aboutBanner2}
          alt='img'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: '400px',
            left: 0,
            top: 0,
            opacity: '20%',
          }}
        />
        <Box sx={{ mt: 8, width: { xs: '100%', sm: '580px' }, mx: 'auto', position: 'relative', zIndex: 5, textAlign: "center" }}>
          <Typography variant="h2" sx={{ color: Colors.white, textTransform: 'capitalize', mb: 6 }}>
            What Our Clients Say
          </Typography>
          <Box sx={{ py: 3 }}>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, Autoplay]}
              spaceBetween={10}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={true}
              navigation
              // pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              style={{
                height: '100%'
              }}
            >
              {testimonial.map((item, index) => (
                <SwiperSlide style={{ height: '100%' }} key={index}>
                  <Typography variant="body2" sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Avatar alt="John Smith" src={item.image} sx={{ mx: 'auto' }} />
                    <Typography variant="body2" sx={{ color: Colors.white, textTransform: 'capitalize' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: Colors.smokeyGrey }}>
                      Client
                    </Typography>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Box>
      </Box>

      <Box sx={{ py: { xs: 3, md: 5 }, mt: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 4 }}>
          Our Specialties
        </Typography>
        <Box
          component={'img'}
          src={Images.shippingProcess}
          sx={{ width: 'auto', height: { xs: '210px', sm: '350px', md: '550px' } }}
        />
      </Box>

      <Box sx={{ py: { xs: 3, md: 6 }, mt: { xs: 2, md: 4 } }}>
        <Container>
          <Grid container spacing={2} alignItems={'center'} justifyContent={'space-evenly'}>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant="h2" sx={{ textAlign: 'center', mb: 4 }}>
                Our Latest News
              </Typography>
            </Grid>
            {latestNews.map((data, index) => (
              <Grid key={index} item xs={12} sm={6} md={6}>
                <Card sx={{ display: { xs: 'block', md: 'flex' } }}>
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: 280, md: 350 }, objectFit: 'contain' }}
                    image={data.image}
                  />
                  <Box sx={{ p: 2, height: { xs: '200px', md: '250px' }, borderLeft: `1px solid ${Colors.borderIron}` }}>
                    <Calender />
                    <Typography variant="h4">
                      {data.date}
                    </Typography>
                    <Typography variant="body2" sx={{ color: Colors.smokeyGrey, mb: 1 }}>
                      Jan
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                      {data.description}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    </Fragment>
  );
}
export default About;