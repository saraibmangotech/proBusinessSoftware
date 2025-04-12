import React, { Fragment, useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, InputAdornment, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { FontFamily, } from 'assets';
import Colors from 'assets/Style/Colors';
import InputField from 'components/Input';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import CustomerServices from 'services/Customer';
import { ArrowBack, SendOutlined } from '@mui/icons-material';
import { CircleLoading } from 'components/Loaders';
import { PrimaryButton } from 'components/Buttons';
import moment from 'moment';

function Message() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Get Messages
  const [messages, setMessages] = useState([]);

  // *For Get Messages
  const getMessages = async () => {
    try {
      let params = { customer_id: id }
      const { data } = await CustomerServices.getMessages(params)
      setMessages(data?.messages)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Send Message
  const sendMessage = async (formData) => {
    setLoading(true)
    try {
      if (formData?.message) {
        let obj = {
          customer_id: id,
          message: formData.message
        }
        const { message } = await CustomerServices.sendMessage(obj)
        getMessages()
        reset()
        SuccessToaster(message)
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      setLoader(true)
      getMessages()
    }
  }, [id]);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Box onClick={() => navigate('/customer-queue')} sx={{ mb: 2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          sx={{
            bgcolor: Colors.primary,
            color: Colors.white,
            '&:hover': {
              bgcolor: Colors.primary,
              color: Colors.white
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, ml: 1 }}>
          Back
        </Typography>
      </Box>
      <Box sx={{ my: 1, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
          Messages
        </Typography>

        <Box sx={{ mx: 'auto', width: '80%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column-reverse', height: 250, width: 1, mb: 1, overflow: 'auto', border: `1px solid ${Colors.cloud}`, borderRadius: 1, p: 0.5 }}>
            {loader ? (
              <CircleLoading />
            ) : (
              messages.map((item, index) => (
                <Box sx={{ maxWidth: '80%', my: 1, width: 'fit-content', ml: 'auto', }}>
                  <Typography component={'p'} variant="caption" sx={{ textAlign: 'right', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
                    {moment(item.sent_at).format('DD.MM.YYYY HH:mm a')}
                  </Typography>
                  <Box key={index} sx={{ borderRadius: '4px', bgcolor: Colors.iron, p: 1.5 }}>
                    <Typography variant="body2" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
                      {item.message}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
          <Box component="form" onSubmit={handleSubmit(sendMessage)} >
            <InputField
              placeholder={'Write Message'}
              register={register("message")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type='submit' edge="end" sx={{ '&:hover': { bgcolor: 'transparent' } }} >
                      {loading ? (
                        <CircularProgress size={20} sx={{ color: Colors.white }} />
                      ) : (
                        <SendOutlined color="primary" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>


      </Box>
    </Box>
  );
}

export default Message;