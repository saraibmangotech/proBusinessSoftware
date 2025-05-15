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
import { Link, useNavigate, useParams } from 'react-router-dom';
import SystemServices from 'services/System';
import UploadFileSingle from 'components/UploadFileSingle';
import { Images } from 'assets';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import { addMonths } from 'date-fns';
import { useAuth } from 'context/UseContext';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';


function VendorDetail() {
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

    const { id } = useParams()




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
                id: id,
                name: formData?.name,
                phone: formData?.mobile,
                email: formData?.email,
                address: formData?.address,
                business_name: formData?.businessName,
                additional_id: formData?.additionalId,

            };
            const promise = CustomerServices.VendorDetail(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate("/vendor-list");
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
    const getData = async () => {
        try {
            let params = {
                id: id
            };

            const { data } = await CustomerServices.getVendorDetail(params);

            let detail = data?.vendor


            //setCategories(data?.categories)

            console.log(detail);
            // setCategories(detail?.commission_settings)

            setValue1('name', detail?.name)
            setValue1('email', detail?.email)
            setValue1('mobile', detail?.phone)
            setValue1('address', detail?.address)
            setValue1('businessName', detail?.business_name)
            setValue1('additionalId', detail?.additional_id)

        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    useEffect(() => {
        getData()
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
                            <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} > Vendor Detail</Typography>

                        </Box>

                        <Box sx={{ p: 3 }}>


                            <Grid container gap={2} justifyContent={'space-between'}>
                                <Grid container item xs={12} spacing={2} p={2} sx={{ borderRadius: '12px' }}>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={" Name :*"}
                                            size={'small'}
                                            disabled={true}
                                            placeholder={" Name"}
                                            error={errors1?.name?.message}
                                            register={register1("name", {
                                                required: "Please enter your name."
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={"Mobile *:"}
                                            size={"small"}
                                            type={"number"}
                                            disabled={true}
                                            placeholder={"Mobile"}
                                            // InputProps={{
                                            //   endAdornment: (
                                            //     <IconButton
                                            //       onClick={() => {
                                            //         getReceiptDetail();


                                            //       }}
                                            //     >
                                            //       <SearchIcon sx={{ color: "#001f3f" }} />
                                            //     </IconButton>
                                            //   ),
                                            // }}
                                            error={errors1?.mobile?.message}
                                            register={register1("mobile", {
                                                required: 'mobile is required',

                                                onChange: (e) => {
                                                    console.log("asdas");
                                                    if (getValues1("mobile").length == 10) {
                                                        getReceiptDetail()
                                                    }

                                                    // Delay the execution of verifyEmail by 2 seconds
                                                },
                                            })}
                                        />
                                        {/* <Grid item md={1} sm={12} xs={12} mt={2}>
                      <PrimaryButton
                        bgcolor={"#001f3f"}
                        title="Clear"
                        onClick={() => {
                          setFieldsDisabled(false);
                          setValue1("customer", "");
                          setValue1("invoice_date", moment().toDate());
                          setValue1("mobile", "");
                          setValue1("ref", "");
                          setValue1("display_customer", "");
                          setValue1("email", "");
                          setValue1("address", "");

                          setValue1("mobileValue", "");


                         
                        }}
                      // loading={loading}
                      />
                    </Grid> */}
                                    </Grid>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={"Email :*"}
                                            size={"small"}
                                            disabled={true}
                                            placeholder={"Email"}
                                            error={errors1?.email?.message}
                                            register={register1("email", {
                                                required: 'email is required',
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Please enter a valid email address."
                                                },
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={" Address :*"}
                                            size={'small'}
                                            disabled={true}
                                            placeholder={" Address"}
                                            error={errors1?.address?.message}
                                            register={register1("address", {
                                                required: 'address is required',
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={" Business Name :*"}
                                            size={'small'}
                                            disabled={true}
                                            placeholder={" Business Name"}
                                            error={errors1?.businessName?.message}
                                            register={register1("businessName", {
                                                required: 'business name is required',
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={" Additional Id :*"}
                                            size={'small'}
                                            disabled={true}
                                            placeholder={" Additional Id"}
                                            error={errors1?.additionalId?.message}
                                            register={register1("additionalId", {
                                                required: 'additional id name is required',
                                            })}
                                        />
                                    </Grid>
                                </Grid>



                            </Grid>
                        </Box>
                    </Box></>}

            </Box>
        </>
    );
}

export default VendorDetail;