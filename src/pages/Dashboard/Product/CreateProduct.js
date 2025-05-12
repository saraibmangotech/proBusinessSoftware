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
import FinanceServices from 'services/Finance';


function CreateProduct() {
    const theme = useTheme();
    const { user } = useAuth()
    const navigate = useNavigate()
    const [formChange, setFormChange] = useState(false)
    const [submit, setSubmit] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState(null)

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

    const [selectedCategory, setSelectedCategory] = useState(null)
    //documents array






    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };










    const submitForm1 = async (formData) => {

        try {
            let obj = {
                category_id: selectedCategory?.id,
                name: formData?.name,
                price: formData?.price,
                sku: formData?.sku,
                unit: formData?.unit,
                description: formData?.description,
                impact_account_id: selectedAccount?.id


            };
            const promise = CustomerServices.CreateProduct(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate("/product-list");
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

            const { data } = await CustomerServices.getProductCategory(params);

            setCategories(data?.rows)

        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };
    // *For Get Account
    const getAccounts = async (search, accountId) => {
        try {
            let params = {
                page: 1,
                limit: 10000,
                name: search,
                is_disabled: false

            }
            const { data } = await FinanceServices.getAccountsDropDown(params)
            const updatedAccounts = data?.accounts?.rows?.map(account => ({
                ...account,
                name: ` ${account.account_code} ${account.name}`
            }));
            console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

            setAccounts(updatedAccounts)
            getSettings(updatedAccounts)
        } catch (error) {
            showErrorToast(error)
        }
    }

    const getSettings = async (accountsArray) => {
        try {
            let params = {
                page: 1,
                limit: 10000,


            }
            const { data } = await SystemServices.getSettings(params)
            console.log(data, 'datadata');
            const filtered = accountsArray?.find(item => item?.id === data?.settings?.inventory);
            console.log(filtered, 'filtered results');
            setSelectedAccount(filtered)



        } catch (error) {
            showErrorToast(error)
        }
    }
    useEffect(() => {

        getAccounts()
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
                            <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Create Product</Typography>

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
                                        <SelectField
                                            size="small"
                                            label="Select Category"
                                            options={categories}
                                            selected={selectedCategory}
                                            onSelect={(value) => {
                                                setSelectedCategory(value)

                                            }}
                                            register={register("category", { required: "category is required" })}
                                            error={errors?.category?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <SelectField
                                            size="small"
                                            label="Select Impact Account"
                                            options={accounts}
                                            selected={selectedAccount}
                                            onSelect={(value) => {
                                                setSelectedAccount(value)

                                            }}
                                            register={register("account", { required: "account is required" })}
                                            error={errors?.account?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <InputField
                                            label={" Price :*"}
                                            size={'small'}
                                            placeholder={" Price"}
                                            error={errors1?.price?.message}
                                            register={register1("price", {
                                                required: 'price is required',
                                            })}
                                        />
                                    </Grid>

                                    <Grid item xs={3}>
                                        <InputField
                                            label={" SKU :*"}
                                            size={'small'}
                                            placeholder={" SKU"}
                                            error={errors1?.sku?.message}
                                            register={register1("sku", {
                                                required: false
                                            })}
                                        />
                                    </Grid>

                                    <Grid item xs={3}>
                                        <InputField
                                            label={" Unit :*"}
                                            size={'small'}
                                            placeholder={" Unit"}
                                            error={errors1?.unit?.message}
                                            register={register1("unit", {
                                                required: 'unit is required',
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
                                                required: false,
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

export default CreateProduct;