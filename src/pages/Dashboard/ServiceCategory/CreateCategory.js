import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Checkbox, Container, FormControlLabel, FormLabel, Grid, IconButton, InputLabel, Radio, RadioGroup, Typography } from '@mui/material';
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
import axios from 'axios';
import UploadIcon from "@mui/icons-material/Upload";
import FinanceServices from 'services/Finance';


function CreateCategory() {
    const theme = useTheme();
    const { user } = useAuth()
    const navigate = useNavigate()
    const [formChange, setFormChange] = useState(false)
    const [submit, setSubmit] = useState(false)
    const [excludeFromSales, setExcludeFromSales] = useState('no');
    const [excludeFromPurchase, setExcludeFromPurchase] = useState('no');

    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const {
        register: register1,
        handleSubmit: handleSubmit1,
        setValue: setValue1,
        getValues: getValues1,
        control,
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


    const [selectedDue, setSelectedDue] = useState({ id: 'Instant', name: 'Instant' })
    const [passport, setPassport] = useState()
    const [allocation, setAllocation] = useState(false)
    const [depositError, setDepositError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [emailVerify, setEmailVerify] = useState(false)
    const [isUploading, setIsUploading] = useState(false);
    const [loader, setLoader] = useState(false)
    const [fieldsDisabled, setFieldsDisabled] = useState({
        monthlyVisaServiceCharges: false,
        vipMedical: false,
        extraTyping: true,
    });

    const [center, setCenter] = useState(null)
    const [status, setStatus] = useState(null)

    // *For Stepper Forms Data
    const [stepFormData, setStepFormData] = useState()
    const [step1FormData, setStep1FormData] = useState();
    const [selectedType, setSelectedType] = useState(null)
    const [date, setDate] = useState(null)
    const [balanceType, setBalanceType] = useState(null)
    const [imageURL, setImageURL] = useState(null)
    const fileInputRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [accounts, setAccounts] = useState([])
    const [salesAccount, setSalesAccount] = useState(null)
    const [inventoryAccount, setInventoryAccount] = useState(null)
    const [cogsAccount, setCogsAccount] = useState(null)
    const [adjustmentAccount, setAdjustmentAccount] = useState(null)
    const [assemblyAccount, setAssemblyAccount] = useState(null)
    const [itemType, setItemType] = useState(null)
    const [unit, setUnit] = useState(null)
    const [taxes, setTaxes] = useState([])
    const [tax, setTax] = useState(null)
    //documents array


    const handleImageClick = () => {
        fileInputRef.current.click();
    };




    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };




    const handleUpload = async (file, docs) => {
        setProgress(0);
        try {
            const formData = new FormData();
            formData.append("document", file);
            console.log(file.size);
            console.log(getFileSize(file.size))
            const { data } = await instance.post(routes.uploadDocuments, formData, {
                onUploadProgress: (progressEvent) => {
                    const uploadedBytes = progressEvent.loaded;
                    const percentCompleted = Math.round(
                        (uploadedBytes * 100) / progressEvent.total
                    );

                    setProgress(percentCompleted);
                    console.log(getFileSize(uploadedBytes));
                    setUploadedSize(getFileSize(uploadedBytes));
                },
            });
            if (data) {
                docs[0].isUpload = true;
                docs[0].file = data?.data?.nations;
                setSlipDetail(docs);
                console.log(data, 'asddasasd');
                return data?.data?.path

            }
        } catch (error) {
            ErrorToaster(error);
        }
    };
    const submitForm = async (formData) => {
        console.log(formData);
        try {
            let obj = {
                name: formData?.companyName,

                phone: formData?.mobile,
                email: formData?.email,
                address: formData?.businessAddress,
                website: formData?.businessWebsite,
                cp_name: formData?.personName,
                cp_mobile: formData?.phone,

            };

            setStepFormData(obj);
            handleNext()
        } catch (error) {
            ErrorToaster(error);
        }
    };



    console.log(watch());


    const submitForm1 = async (formData) => {
        console.log(formData);
        try {
            let obj = {
                name: formData?.name,
                name_ar: formData?.arabic,
                logo: imageURL,
                item_tax_type: tax?.name,
                item_type: itemType?.id,
                unit_of_measure: unit?.id,
                exclude_from_sales: excludeFromSales,
                exclude_from_purchase: excludeFromPurchase,
                sales_account_id: salesAccount?.id,
                inventory_account_id: inventoryAccount?.id,
                cogs_account_id: cogsAccount?.id,
                inventory_adjustment_account_id: adjustmentAccount?.id,
                item_assembly_costs_account_id: assemblyAccount?.id,
                cost_center: center?.id


            };
            const promise = CustomerServices.CreateCategory(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate("/category-list");
            }


        } catch (error) {
            ErrorToaster(error);
        }
    };
    const handleFileChange = async (e) => {
        try {
            const file = e.target.files[0];
            if (file) {
                setValue1("image", file, { shouldValidate: true }); // Set value and trigger validation
            }
            const formData = new FormData();
            formData.append("document", e.target.files[0]);

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/system/uploadDocuments`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log(response?.data?.data?.path);

            setImageURL(response?.data?.data?.path);


        } catch (error) {
            console.log(error);

        }
    };


    // *For Get Account
    const getAccounts = async (page, limit, filter) => {
        // setLoader(true)
        try {

            let params = {
                page: 1,
                limit: 1000,

            }

            const { data } = await FinanceServices.getAccounts(params)
            console.log(data?.accounts?.rows);

            setAccounts(data?.accounts?.rows)



        } catch (error) {
            ErrorToaster(error)
        } finally {
            // setLoader(false)
        }
    }
    const getTax = async () => {
        // setLoader(true)
        try {

            let params = {
                page: 1,
                limit: 1000,


            }

            const { data } = await FinanceServices.getTax(params)
            console.log(data?.accounts?.rows);

            setTaxes(data?.tax)



        } catch (error) {
            ErrorToaster(error)
        } finally {
            // setLoader(false)
        }
    }

    const verifyEmail = async (value) => {
        let Myemail = getValues1('email')
        if (Myemail) {

            try {
                let obj = {
                    email: Myemail.toLowerCase(),
                    validate: true


                };

                console.log(obj);

                const { status } = await CustomerServices.addCustomer(obj);

                console.log(status);
                if (status) {
                    setEmailVerify(true)
                }


            } catch (error) {
                console.log(error);
                setEmailVerify(false)
                showErrorToast(error)
            }
        }
    };

    useEffect(() => {
        getAccounts()
        getTax()
    }, [])



    return (
        <>
            <Box sx={{ width: "100%" }}>


            </Box>
            <Box m={3} sx={{ backgroundColor: 'white', borderRadius: "12px" }} >
                {<>

                    <Box component={'form'} onSubmit={handleSubmit1(submitForm1)}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', p: 3, alignItems: 'flex-end' }}>
                            <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Create Service Category</Typography>

                        </Box>

                        <Box sx={{ p: 3 }}>

                            <Grid item xs={10} mb={2}>
                                <InputLabel sx={{
                                    textTransform: "capitalize", textAlign: 'left', fontWeight: 700, display: 'block',

                                    fontSize: "14px",
                                    color: "#333",
                                    marginBottom: "4px",
                                }}>

                                    Logo :*
                                </InputLabel>

                                <Controller
                                    name="image"
                                    control={control}
                                    rules={{ required: " picture is required" }}
                                    render={() => (
                                        <Box
                                            component={"div"}
                                            onMouseEnter={() => setHovered(true)}
                                            onMouseLeave={() => setHovered(false)}
                                            sx={{
                                                position: "relative",
                                                width: 75,
                                                height: 75,
                                                mt: 2,
                                            }}
                                        >
                                            <Avatar
                                                src={'https://pro.mangotech-api.com' + imageURL}
                                                alt="L"
                                                sx={{
                                                    position: "relative",
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: "50%",
                                                    fontSize: 24,
                                                    backgroundColor: imageURL ? "" : "#0EA5EA",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    objectFit: "cover",
                                                    textTransform: "capitalize",
                                                }}
                                                onClick={handleImageClick}
                                            />

                                            {hovered && <IconButton
                                                sx={{
                                                    position: "absolute",
                                                    top: "0",
                                                    left: "0",
                                                    width: "100%",
                                                    padding: "9px 15px",
                                                    color: "white",
                                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                    borderRadius: "50%",
                                                    display: "block",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                                    },
                                                }}
                                                onClick={handleImageClick}
                                            >
                                                <UploadIcon />
                                                <Box sx={{ fontSize: "12px" }}>Upload Image</Box>
                                            </IconButton>}

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: "none" }}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                        </Box>
                                    )}
                                />

                                {(errors1.image && !imageURL) && (
                                    <Typography sx={{ color: "red", fontSize: "12px", mt: 1 }}>
                                        {errors1.image.message}
                                    </Typography>
                                )}
                            </Grid>
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


                                <Grid item xs={2.8}>
                                    <InputField
                                        label={"Arabic Name :*"}
                                        size={"small"}
                                        placeholder={"Arabic Name"}
                                        error={errors1?.arabic?.message}
                                        register={register1("arabic", {
                                            required: "Please enter your arabic.",
                                            onChange: (e) => {
                                                console.log('asdas');



                                            },


                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8}>
                                    <FormControl component="fieldset">
                                        <InputLabel sx={{ textTransform: "capitalize", textAlign: 'left', fontWeight: 700, color: Colors.gray }}>


                                            Exclude from Sales
                                        </InputLabel>
                                        <RadioGroup
                                            row
                                            value={excludeFromSales}
                                            onChange={(e) => setExcludeFromSales(e.target.value)}
                                        >
                                            <FormControlLabel value={true} control={<Radio />} label="Yes" />
                                            <FormControlLabel value={false} control={<Radio />} label="No" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                                {/* Radio Button: Exclude from Purchase */}
                                <Grid item xs={2.8}>
                                    <FormControl component="fieldset">
                                        <InputLabel sx={{ textTransform: "capitalize", textAlign: 'left', fontWeight: 700, color: Colors.gray }}>


                                            Exclude from Purchase
                                        </InputLabel>
                                        <RadioGroup
                                            row
                                            value={excludeFromPurchase}
                                            onChange={(e) => setExcludeFromPurchase(e.target.value)}
                                        >
                                               <FormControlLabel value={true} control={<Radio />} label="Yes" />
                                               <FormControlLabel value={false} control={<Radio />} label="No" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Tax Type *:'}

                                        options={taxes}
                                        selected={tax}
                                        onSelect={(value) => {
                                            setTax(value)


                                        }}
                                        error={errors1?.tax?.message}
                                        register={register1("tax", {
                                            required: 'Please select tax .',
                                        })}
                                    />
                                </Grid>



                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Sales Account *:'}

                                        options={accounts}
                                        selected={salesAccount}
                                        onSelect={(value) => {
                                            setSalesAccount(value)


                                        }}
                                        error={errors1?.sales?.message}
                                        register={register1("sales", {
                                            required: 'Please select sales account.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Inventory Account *:'}

                                        options={accounts}
                                        selected={inventoryAccount}
                                        onSelect={(value) => {
                                            setInventoryAccount(value)


                                        }}
                                        error={errors1?.inventory?.message}
                                        register={register1("inventory", {
                                            required: 'Please select inventory account.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Cogs Account *:'}

                                        options={accounts}
                                        selected={cogsAccount}
                                        onSelect={(value) => {
                                            setCogsAccount(value)


                                        }}
                                        error={errors1?.cogs?.message}
                                        register={register1("cogs", {
                                            required: 'Please select cogs account.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Inventory Adjustment Account *:'}

                                        options={accounts}
                                        selected={adjustmentAccount}
                                        onSelect={(value) => {
                                            setAdjustmentAccount(value)


                                        }}
                                        error={errors1?.adjustment?.message}
                                        register={register1("adjustment", {
                                            required: 'Please select adjustment account.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Item Assembly Cost Account *:'}

                                        options={accounts}
                                        selected={assemblyAccount}
                                        onSelect={(value) => {
                                            setAssemblyAccount(value)


                                        }}
                                        error={errors1?.assembly?.message}
                                        register={register1("assembly", {
                                            required: 'Please select assembly account.',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Cost Center *:'}

                                        options={[{ id: 'Tasheel', name: 'Tasheel' }, { id: 'DED', name: 'DED' }, { id: 'Typing', name: 'Typing' }, { id: 'General', name: 'General' }]}
                                        selected={center}
                                        onSelect={(value) => {
                                            setCenter(value)


                                        }}
                                        error={errors1?.center?.message}
                                        register={register1("center", {
                                            required: 'Please select center .',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Item Type *:'}

                                        options={[{ id: 'Manufactured', name: 'Manufactured' }, { id: 'Service/Consumable', name: 'Service/Consumable' }, { id: 'Purchased', name: 'Purchased' }]}
                                        selected={itemType}
                                        onSelect={(value) => {
                                            setItemType(value)


                                        }}
                                        error={errors1?.type?.message}
                                        register={register1("type", {
                                            required: 'Please select type .',
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={2.8} >
                                    <SelectField
                                        size={'small'}
                                        label={'Unit *:'}

                                        options={[{ id: 'Each', name: 'Each' }, { id: 'Hours', name: 'Hours' }]}
                                        selected={unit}
                                        onSelect={(value) => {
                                            setUnit(value)


                                        }}
                                        error={errors1?.unit?.message}
                                        register={register1("unit", {
                                            required: 'Please select unit .',
                                        })}
                                    />
                                </Grid>




                                <Grid container justifyContent={'flex-end'}>
                                    <PrimaryButton
                                       bgcolor={'#bd9b4a'}
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

export default CreateCategory;