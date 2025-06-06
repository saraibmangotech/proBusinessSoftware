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
import SearchIcon from "@mui/icons-material/Search";
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


function CreateProductCategory() {
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

  // Watch all form data
  console.log(watch());


  const isFormDataEmpty = (data) => {
    // Check if all form fields are empty
    return Object.values(data).every((value) => {
      // If the value is an object (like companyLogo), check if it's empty
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length === 0;
      }
      // Otherwise, check if the value is an empty string
      return value === "";
    });
  };






  const allowFilesType = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowFilesType2 = [
    'image/png',
    'image/jpg',
    'image/jpeg',

  ];
  const [guarantors, setGuarantors] = useState([])
  const [activeStep, setActiveStep] = React.useState(1);

  // *For Deposit Slip
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [categories, setCategories] = useState([])

  const [emailVerify, setEmailVerify] = useState(false)


  const [center, setCenter] = useState(null)
  const [status, setStatus] = useState(null)

  // *For Stepper Forms Data
  const [stepFormData, setStepFormData] = useState()

  const [selectedType, setSelectedType] = useState(null)
  const [date, setDate] = useState(null)
  const [balanceType, setBalanceType] = useState(null)
  const [fieldsDisabled, setFieldsDisabled] = useState(false)
  const [holdState, setHoldState] = useState(true)
  //documents array






  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };










  const submitForm1 = async (formData) => {
   
    try {
      let obj = {
        name: formData?.name,
        description: formData?.description,
 
      };
      const promise = CustomerServices.CreateProductCategory(obj);

      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate("/product-category-list");
      }


    } catch (error) {
      ErrorToaster(error);
    }
  };


  const getReceiptDetail = async (state) => {
    setFieldsDisabled(true);
    try {
      let params = {
        mobile: getValues1("mobile"),

      };

      const { data } = await CustomerServices.getCustomerDetail(params);
      console.log(data);
      if (data?.customer) {
        setHoldState(true);

        showErrorToast("account already exist with this mobile number");
      } else {
        console.log(data?.receipt);

        setHoldState(false);
      }
    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };




  const getCategories = async (state) => {

    try {
      let params = {


      };

      const { data } = await CustomerServices.getServiceCategories(params);

      setCategories(data?.categories)

    } catch (error) {
      ErrorToaster(error);
    } finally {
      // setLoader(false)
    }
  };
  useEffect(() => {
    getCategories()
  }, [])


  return (
    <>
      <Box sx={{ width: "100%" }}>


      </Box>
      <Box m={3} sx={{ backgroundColor: 'white', borderRadius: "12px" }} >
        {<>

          <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
              <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Create Category</Typography>

            </Box>

            <Box sx={{ p: 3 }}>


              <Grid container gap={2} justifyContent={'space-between'}>
                <Grid container item xs={12} spacing={2} p={2} sx={{ borderRadius: '12px' }}>
                  <Grid item xs={3}>
                    <InputField
                      label={" Name :*"}
                      size={'small'}
                      placeholder={" Name"}
                      error={errors1?.name?.message}
                      register={register1("name", {
                        required: "Please enter your name."
                      })}
                    />
                  </Grid>
               
                  <Grid item xs={3}>
                    <InputField
                      label={" Description :*"}
                      size={'small'}
                      placeholder={" Description"}
                      error={errors1?.description?.message}
                      register={register1("description", {
                        required: 'description is required',
                      })}
                    />
                  </Grid>
                 
                </Grid>

                

                <Grid container justifyContent={'flex-end'}>
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

export default CreateProductCategory;