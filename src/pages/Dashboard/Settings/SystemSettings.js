import React, { useEffect, useState } from 'react';
import { Box, Checkbox, Container, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Typography } from '@mui/material';
import RegisterContainer from 'container/Register'
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { PrimaryButton } from 'components/Buttons';
import Colors from 'assets/Style/Colors';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller, useForm } from 'react-hook-form';
import UploadFile from 'components/UploadFile';
import InputField from 'components/Input';
import DatePicker from 'components/DatePicker';
import { ErrorToaster } from 'components/Toaster';
import { FormControl } from '@mui/base';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import SelectField from 'components/Select';
import { CleanTypes, Debounce2, getFileSize, handleDownload } from 'utils';
import instance from 'config/axios';
import routes from 'services/System/routes';
import CustomerServices from 'services/Customer';
import CustomerService from '../DashboardPages/CustomerService';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import moment from 'moment';
import { Link, useNavigate } from 'react-router-dom';
import SystemServices from 'services/System';
import UploadFileSingle from 'components/UploadFileSingle';
import { Images } from 'assets';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import { addMonths } from 'date-fns';
import { useAuth } from 'context/UseContext';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';


function SystemSettings() {
  const theme = useTheme();
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formChange, setFormChange] = useState(false)
  const [submit, setSubmit] = useState(false)

  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    getValues: getValues1,
    watch,
    formState: { errors: errors1 },

  } = useForm();

  const [date, setDate] = useState(null);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await SystemServices.getSettings();
        if (response?.responseCode === 200) {
          const settings = response?.data?.settings;
          setDate(settings?.account_closing_date ? new Date(settings.account_closing_date) : null);
          setValue1("account_closing_date", settings?.account_closing_date ? new Date(settings.account_closing_date) : null);
        }
      } catch (error) {
        ErrorToaster(error);
      }
    };

    fetchSystemSettings();
  }, []);

  
  const submitForm1 = async (formData) => {
    console.log(formData);
    try {
      let obj = {
        account_closing_date: formData?.account_closing_date,  

      };
      const promise = SystemServices.UpdateSettings(obj);

      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );
      const response = await promise;
      

      
    } catch (error) {
      ErrorToaster(error);
    }
  };


  return (
    <>
      <Box sx={{ width: "100%" }}>


      </Box>
      <Box m={3} sx={{backgroundColor:'white',borderRadius:"12px"}} >
        {<>

          <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >System Settings</Typography>

            </Box>

            <Box sx={{ p: 3 }}>


              <Grid container sx={{ gap: '5px 25px' }}>
                <Grid item xs={2.8}>
                <DatePicker
                        label={"Accounting Closing Date :"}
                        value={date}
                        size={"small"}
                        error={errors1?.account_closing_date?.message}
                        register={register1("account_closing_date", {
                          required: date ? false : "please enter  date.",
                        })}
                        maxDate={new Date()}
                        onChange={(date) => {
                          setValue1("account_closing_date", date);
                          setDate(new Date(date));
                        }}
                      />
                  
                  
                  </Grid>
             
              
               
                

               
                <Grid  container justifyContent={'flex-end'}>
                <PrimaryButton 
                 bgcolor={'#001f3f'}
                  title="Submit"
                  type={'submit'}
                  

                />
                </Grid>
              </Grid>
            </Box>
          </Box></>}

      </Box>
    </>
  );
}

export default SystemSettings;