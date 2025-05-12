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
import { Link, useNavigate, useParams } from 'react-router-dom';
import SystemServices from 'services/System';
import UploadFileSingle from 'components/UploadFileSingle';
import { Images } from 'assets';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import { addMonths } from 'date-fns';
import { useAuth } from 'context/UseContext';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';


function UpdateBank() {
    const theme = useTheme();
    const { user } = useAuth()
    const navigate = useNavigate()
    const [formChange, setFormChange] = useState(false)
    const [submit, setSubmit] = useState(false)
    const { id } = useParams()

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


    const [emailVerify, setEmailVerify] = useState(false)


    const [center, setCenter] = useState(null)
    const [status, setStatus] = useState(null)

    // *For Stepper Forms Data
    const [stepFormData, setStepFormData] = useState()

    const [selectedType, setSelectedType] = useState(null)
    const [date, setDate] = useState(null)
    const [balanceType, setBalanceType] = useState(null)

    //documents array






    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };










    const submitForm1 = async (formData) => {
        console.log(formData);
        try {
            let obj = {
                id:id,
                name: formData?.name,
                account_title: formData?.title,
                account_number: formData?.accountnumber,
                account_ibn: formData?.ibn,



            };
            const promise = CustomerServices.UpdateBank(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate("/bank-list");
            }


        } catch (error) {
            ErrorToaster(error);
        }
    };


    const getData = async () => {
        try {
            let params = {
                id: id
            };

            const { data } = await CustomerServices.getBankDetail(params);

            console.log(data?.bank);
            setValue1('name',data?.bank?.name)
            setValue1('title',data?.bank?.account_title)
            setValue1('accountnumber',data?.bank?.account_number)
            setValue1('ibn',data?.bank?.account_ibn)


        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    useEffect(() => {
        getData()
    }, [])







    return (
        <>
            <Box sx={{ width: "100%" }}>


            </Box>
            <Box m={3} sx={{ backgroundColor: 'white', borderRadius: "12px" }} >
                {<>

                    <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
                            <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Update Bank</Typography>

                        </Box>

                        <Box sx={{ p: 3 }}>


                            <Grid container sx={{ gap: '5px 25px' }}>
                                <Grid item xs={2.8}>
                                    <InputField
                                        label={" Name :*"}
                                        size={'small'}
                                        placeholder={" Name"}
                                        error={errors1?.name?.message}
                                        register={register1("name", {
                                            required:
                                                "Please enter your name."

                                        })}
                                    /></Grid>


                                <Grid item xs={2.8}><InputField
                                    label={" Account Title :*"}
                                    size={'small'}
                                    placeholder={" Account Title"}
                                    error={errors1?.title?.message}
                                    register={register1("title", {
                                        required:
                                            "Please enter your  title."

                                    })}
                                /></Grid>





                                <Grid item xs={2.8}><InputField
                                    label={"Account Number :*"}
                                    size={'small'}
                                    type={'number'}
                                    placeholder={"Account Number"}
                                    error={errors1?.accountnumber?.message}
                                    register={register1("accountnumber", {
                                        required:
                                            "Please enter your accountnumber."

                                    })}
                                /></Grid>
                                <Grid item xs={2.8}><InputField
                                    label={"Account IBN Number :*"}
                                    size={'small'}
                                    type={'number'}
                                    placeholder={"Account IBN Number"}
                                    error={errors1?.ibn?.message}
                                    register={register1("ibn", {
                                        required:
                                            "Please enter your ibn."

                                    })}
                                /></Grid>





                                <Grid container justifyContent={'flex-end'}>
                                    <PrimaryButton
                                        bgcolor={'#001f3f'}
                                        title="Update"
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

export default UpdateBank;