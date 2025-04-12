import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Drawer,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import Colors from 'assets/Style/Colors';
import { FontFamily, Images } from 'assets';
import { PrimaryButton } from 'components/Buttons';
import { useAuth } from 'context/UseContext';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';

function Header() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [permission, setPermission] = useState()

  const nav1 = [
    { title: 'Home', path: '/' },
    { title: 'Services', path: '/services' },
    { title: 'About Us', path: '/about' },
    // { title: 'Blogs', path: '/blogs' },
    { title: 'Quote', path: '/quote' },
    // { title: 'Careers', path: '/careers' },
    { title: 'Contact Us', path: '/contact' },
  ]

  const [openDrawer, setOpenDrawer] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [scrollEffect, setScrollEffect] = useState(false);

  const anchor = ["right"]

  const getPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        localStorage.setItem('Permission', true)
        setPermission(true)
      }
      else {
        localStorage.setItem('Permission', false)
        setPermission(false)
      }
    })
  }

  const handleClick = (event) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  // useEffect(() => {
  //   getPermission()
  // }, [])

  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 1) {
      setScrollEffect(true)
    } else {
      setScrollEffect(false)
    }
  }

  window?.addEventListener('scroll', handleScroll);

  const handleDrawerClose = (path) => {
    setOpenDrawer(false)
    setTimeout(() => {
      navigate(path)
    }, 1);
  }

  return (
    <Box className={clsx('header', { 'header--transparent': !scrollEffect })} sx={{ height: { xs: '55px', lg: '75px' } }}>

      <Container maxWidth="xl">

        <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, gap: 4 }}>
            <Box sx={{ mr: 2 }}>
              <Link to={'/'}>
                <Box
                  component="img"
                  src={Images.gifLogo}
                  alt='Galaxy World Wide Shipping'
                  height={70}
                />
              </Link>
            </Box>
            {nav1.map((item, index) => (
              <Link key={index} to={item.path}>
                <Typography variant="body2" sx={{ color: scrollEffect ? Colors.textSecondary : Colors.white, fontFamily: FontFamily.Montserrat, fontWeight: 600, ':hover': { color: Colors.primary } }}>
                  {item.title}
                </Typography>
              </Link>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, gap: 4 }}>
            <Box sx={{ display: 'flex', gap: '10px' }}>
              {user?.token ? (
                <PrimaryButton
                  fullWidth
                  title={'Go To Dashboard'}
                  color={'primary'}
                  onClick={() => navigate('/dashboard')}
                />
              ) : (
                <Fragment>
                  <PrimaryButton
                    fullWidth
                    title={'Galaxy Business Suite'}
                    color={'primary'}
                    aria-owns={anchorEl ? "simple-menu" : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                    onMouseOver={handleClick}
                  />
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    MenuListProps={{ onMouseLeave: handleClose }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '.MuiSvgIcon-root': {
                          width: 20,
                          height: 20,
                          ml: 0.5,
                          mr: 0.5,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <MenuItem onClick={() => navigate('/register')}>Customer Registration</MenuItem>
                    <MenuItem onClick={() => navigate('/login')}>Employee Login</MenuItem>
                  </Menu>
                </Fragment>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 11,
            display: { xs: 'flex', sm: 'flex', md: 'flex', lg: 'none', justifyContent: 'space-between', }
          }}
        >
          <Link to={'/'}>
            <Box
              component="img"
              src={Images.gifLogo}
              alt='Galaxy World Wide Shipping'
              height={50}
            />
          </Link>
          {anchor.map((anchor, index) => (
            <Fragment key={index}>
              <Button onClick={() => setOpenDrawer(true)}>
                {index === 0 && <MenuIcon />}
              </Button>
              <Drawer
                anchor={anchor}
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{
                  style: {
                    width: '80%'
                  }
                }}
              >
                {anchor === 'right' &&
                  <List>
                    <ListItem>
                      <ListItemButton
                        onClick={() => setOpenDrawer(false)}
                        sx={{ justifyContent: 'flex-end' }}
                      >
                        <CloseIcon />
                      </ListItemButton>
                    </ListItem>
                    {nav1.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemButton onClick={() => handleDrawerClose(item.path)}>
                          <ListItemText primary={item.title} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                }
              </Drawer>
            </Fragment>
          ))}
        </Box>

      </Container>

    </Box>
  );
}

export default Header;