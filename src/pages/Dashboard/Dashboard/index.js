import React, { Fragment, useEffect, useState } from 'react';
import { Avatar, Box, Card, CardContent, CardMedia, Container, Divider, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { Circle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BuyerRegistrationIcon, CarIcon, DashedBorderIcon, FontFamily, Images, ReceivedBuyerIdIcon, RequestBuyerIdIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import { useAuth } from 'context/UseContext';
import Storage from 'utils/Storage';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CallReceivedOutlinedIcon from '@mui/icons-material/CallReceivedOutlined';
import Paper from '@mui/material/Paper';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SystemServices from 'services/System';
import { showErrorToast } from 'components/NewToaster';
import gifUrl from '../../../assets/Gif/globe.gif'
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import DescriptionIcon from "@mui/icons-material/Description"
import SendIcon from "@mui/icons-material/Send"
import TaskAltIcon from "@mui/icons-material/TaskAlt"

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  boxShadow: 'none',
  borderRadius: 0,
}));


const useStyle = makeStyles({
  step: {
    flex: 1,
    display: 'flex',
    gap: '20px',
    alignItem: 'center',
    justifyContent: 'space-between',
    '& .MuiStepLabel-label': {
      color: `${Colors.charcoalGrey} !important`,
      fontSize: { md: '16px' }
    }
  },
  customDivider: {
    background: `linear-gradient(to right, ${Colors.grey} 50%, ${Colors.yellow} 50%)`, // Replace 'grey' and 'yellow' with your actual color values
    height: 2, // You can adjust the height as needed
  },
})

const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: Colors.iron,
  zIndex: 1,
  color: Colors.charcoalGrey,
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  "svg": {
    width: 'auto',
    height: '25px',
    "path": {
      fill: Colors.smokeyGrey
    },
  },
}));

function CustomStepIcon(props) {

  const { active, completed } = props;

  const icons = {
    1: <BuyerRegistrationIcon />,
    2: <RequestBuyerIdIcon />,
    3: <ReceivedBuyerIdIcon />,
  };

  return (
    <StepIconRoot ownerState={{ completed, active }} className={'icon-wrapper'}>
      {icons[String(props.icon)]}
    </StepIconRoot>
  );
}

const statsData = [
  {
    title: "Total Sales",
    value: "248",
    icon: <PeopleAltIcon />,
    color: "#00c2a8",
    bgColor: "#00c2a8",
  },
  {
    title: "Employee Service Count",
    value: "436",
    icon: <DescriptionIcon />,
    color: "#0066ff",
    bgColor: "#0066ff",
  },
  {
    title: "Sales Category Count",
    value: "123",
    icon: <SendIcon />,
    color: "#8c54ff",
    bgColor: "#8c54ff",
  },
  {
    title: "Quantity",
    value: "$1,264",
    icon: <TaskAltIcon />,
    color: "#ff7a45",
    bgColor: "#ff7a45",
  },
]
function Dashboard() {

  const classes = useStyle();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getStorageItem } = Storage();

  const userJourney = getStorageItem('journey')
  const [renderState, setRenderState] = useState(false)

  // *For Stepper Label
  const [stepperLabel, setStepperLabel] = useState([]);
  const [statsDetail, setStatsDetail] = useState(null)

  const pdfContent = Images?.guidelinePDF;

  const handleDownload = () => {
    // const blob = new Blob([pdfContent], { type: 'application/pdf' });
    // console.log(blob,'blobblobblob');
    // const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = ".." + pdfContent;
    console.log(a.href)
    a.target = "blank"
    a.download = "guideline.pdf";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    //URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (userJourney) {
      const { registration, request, received } = userJourney
      const journey = [
        { label: 'Registration', status: registration?.status, color: registration?.color },
        { label: 'Request For Buyer ID', status: request?.status, color: request?.color },
        { label: 'Buyer ID Received', status: received?.status, color: received?.color }
      ]
      setStepperLabel(journey)
    }
    if (localStorage.getItem('operationsToken')) {
      setRenderState(localStorage.getItem('operationsToken'))
    }
  }, []);
  const getStats = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 1000,
        search: search,
      };
      const { data } = await SystemServices.getStats(params);
      console.log(data);
      setStatsDetail(data)

    } catch (error) {
      showErrorToast(error);
    }
  };
  useEffect(() => {

    getStats()
  }, [])



  return (
    <Fragment>
      <Box sx={{ m: 2, position: 'relative' }}>
      
      <Grid container mt={1} spacing={2}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} >
            <Card
              sx={{
                borderRadius: "16px",
                backgroundColor: stat.bgColor,
                color: "white",
                height: "120px",
                position: "relative",
                overflow: "visible",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        backgroundColor: "white",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                        marginRight: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  {/* <IconButton size="small" sx={{ color: "white" }}>
                  <MoreVertIcon />
                </IconButton> */}
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  opacity: 0.8,
                  height: "60%",
                  width: "40%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ fontSize: 60, transform: "rotate(-15deg)" }}>{stat.icon}</Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
        {/* <Grid container spacing={5} sx={{ position: 'absolute', zIndex: 1 }}  >
          <Grid item component={'div'} onClick={() => {navigate('/visa-list');         localStorage.setItem("currentRoute", 'Visa Requests Management'); }} xs={12} md={4} sx={{ cursor: 'pointer' }} >

            <Item sx={{ borderRadius: '12px !important', p: '15px !important', boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px !important" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  Total Visa Requests
                </Typography>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  <BarChartOutlinedIcon sx={{ fontSize: 40, color: '#1976D2' }} />
                </Typography>
              </Box>
              <Typography sx={{ textAlign: 'left' }} variant="h3" fontWeight="bold" gutterBottom>
                {statsDetail?.visaCount}
              </Typography>


            </Item>
          </Grid>
          <Grid item xs={12} md={4} component={'div'} onClick={() => {navigate('/visa-processing-list');         localStorage.setItem("currentRoute", 'Visa Processing Management')}} sx={{ cursor: 'pointer' }}  >
            <Item sx={{   borderRadius: '12px !important', p: '15px !important', boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px !important" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  Total Candidates
                </Typography>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  <BarChartOutlinedIcon sx={{ fontSize: 40, color:  '#1976D2' }} />
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ textAlign: 'left' }} fontWeight="bold" gutterBottom>
                {statsDetail?.candidateCount}
              </Typography>


            </Item>
          </Grid>
          <Grid item xs={12} md={4} component={'div'} onClick={() => {navigate('/active-visa-list');localStorage.setItem("currentRoute", 'Active Visa List')}} sx={{ cursor: 'pointer' }}>
            <Item sx={{ borderRadius: '12px !important', p: '15px !important', boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px !important" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  Total Active Visas
                </Typography>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  <BarChartOutlinedIcon sx={{ fontSize: 40, color: '#1976D2' }} />
                </Typography>
              </Box>
              <Typography sx={{ textAlign: 'left' }} variant="h3" fontWeight="bold" gutterBottom>
                {statsDetail?.activeCount}
              </Typography>


            </Item>
          </Grid>
          <Grid item xs={12} md={4} component={'div'} onClick={() => {

            navigate(
              `/rejected-visa-list`,
              { state: 'Rejected' }
            )
            localStorage.setItem("currentRoute", 'Rejected Visa List')
          }} sx={{ cursor: 'pointer' }}  >
            <Item sx={{   borderRadius: '12px !important', p: '15px !important', boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px !important" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  Rejected Candidates
                </Typography>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  <BarChartOutlinedIcon sx={{ fontSize: 40, color:  '#1976D2' }} />
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ textAlign: 'left' }} fontWeight="bold" gutterBottom>
                {statsDetail?.rejectedCandidateCount}
              </Typography>


            </Item>
          </Grid>
          <Grid item xs={12} md={4} component={'div'} onClick={() => {navigate(
            `/active-visa-list`,
            { state: 'Near Expiry' }
          )
          localStorage.setItem("currentRoute", 'Active Visa List')}
          } sx={{ cursor: 'pointer' }}>
            <Item sx={{ borderRadius: '12px !important', p: '15px !important', boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px !important" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  Near Expiry Candidates
                </Typography>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  <BarChartOutlinedIcon sx={{ fontSize: 40, color: '#1976D2' }} />
                </Typography>
              </Box>
              <Typography sx={{ textAlign: 'left' }} variant="h3" fontWeight="bold" gutterBottom>
                {statsDetail?.expiredTwoMonthCount}
              </Typography>


            </Item>
          </Grid>
          <Grid item xs={12} md={4} component={'div'} onClick={() => {

            navigate(
              `/active-visa-list`,
              { state: 'Expired' }
            )
            localStorage.setItem("currentRoute", 'Active Visa List')
          }} sx={{ cursor: 'pointer' }}  >
            <Item sx={{   borderRadius: '12px !important', p: '15px !important', boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px !important" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  Expired Candidates
                </Typography>
                <Typography sx={{ textAlign: 'left' }} variant="h6" fontWeight="bold" gutterBottom>
                  <BarChartOutlinedIcon sx={{ fontSize: 40, color:  '#1976D2' }} />
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ textAlign: 'left' }} fontWeight="bold" gutterBottom>
                {statsDetail?.expiredCount}
              </Typography>


            </Item>
          </Grid>
        </Grid> */}
      </Box>
    </Fragment>

  );
}

export default Dashboard;