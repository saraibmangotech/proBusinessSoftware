"use client"

import { useEffect, useState } from "react"
import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material"
import { PrimaryButton } from "components/Buttons"
import Colors from "assets/Style/Colors"
import InputField from "components/Input"
import SelectField from "components/Select"
import { useForm } from "react-hook-form"
import { Debounce2 } from "utils"
import CustomerServices from "services/Customer"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import SimpleDialog from "components/Dialog/SimpleDialog"
import { ErrorToaster } from "components/Toaster"
import { useNavigate } from "react-router-dom"

function ReceptionForm() {
    const navigate = useNavigate()
    const [customerType, setCustomerType] = useState("company")
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [buttonDisabled2, setButtonDisabled2] = useState(true)
    const [buttonDisabled3, setButtonDisabled3] = useState(false)
    const [customers, setCustomers] = useState([])
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [companies, setCompanies] = useState([])
    const [companyDialog, setCompanyDialog] = useState(false)
    const [subCustDisable, setSubCustDisable] = useState(false)
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)

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
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,


        formState: { errors: errors2 },

    } = useForm();

    const onSubmit = async (formData) => {
        setButtonDisabled3(true)
        console.log(formData);
        try {
            let obj = {

                customer_id: selectedCustomer?.id,
                service_category_id: selectedCategory?.id,
                service_category: selectedCategory?.name,
                customer_name: formData?.customerName,
                customer_email: formData?.email,
                mobile: formData?.mobile,
                token_number: formData?.tokenNumber,
                reference: formData?.reference,
                company_id: selectedCompany?.id


            };
            const promise = CustomerServices.CreateReception(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/reception-list')
            }


        } catch (error) {
            ErrorToaster(error);
        }
        finally {
            setButtonDisabled3(false)
        }
    };
    const onSubmit1 = async (formData) => {
        setButtonDisabled3(true)
        console.log(formData);
        try {
            let obj = {
                is_company: customerType == 'individual' ? false : true,
                customer_name: formData?.customerName,
                service_category_id: selectedCategory?.id,
                service_category: selectedCategory?.name,
                customer_id: selectedCustomer?.id,
                email: formData?.email,
                mobile: formData?.mobile,
                token_number: formData?.tokenNumber,
                reference: formData?.reference,
                company_id: selectedCompany?.id


            };
            const promise = CustomerServices.CreateReception(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/reception-list')
            }


        } catch (error) {
            ErrorToaster(error);
        }
        finally {
            setButtonDisabled3(false)
        }
    };
    // *For Get Customer Queue
    const getCustomerQueue = async (id) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getCustomerQueue(params)
            setCustomers(data?.rows)
            if(!id){
                let filter = await data?.rows.find(item => item?.name == 'Walk-In Customer')
                setSelectedCustomer(filter)
            }
            else{
                let filter = await data?.rows.find(item => item?.id == id)
                setSelectedCustomer(filter)
                setValue1('customerName', filter?.name)
                setValue1('email', filter?.email)
                setValue1('mobile', filter?.mobile)
            }
           
        } catch (error) {
            showErrorToast(error)
        }
    }

    const getCategories = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getCategoryList(params)
            setCategories(data?.categories)



        } catch (error) {
            showErrorToast(error)
        }
    }

    const getCustomerDetail = async (phone) => {
        try {
            let params = {
                mobile: phone
            };

            const { data } = await CustomerServices.getCustomerDetail(params);
            let detail = data?.customer
            console.log(detail);

            setValue('customerName', detail?.name)
            setValue('email', detail?.email)
            setValue('mobile', detail?.mobile)



        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    const getCustomerDetail2 = async (phone) => {
        try {
            let params = {
                mobile: phone
            };

            const { data } = await CustomerServices.getCustomerDetail(params);
            let detail = data?.customer
            console.log(detail);
            if (data?.customer) {
                setSelectedCustomer(detail)
                setValue1('customer', detail)
                setValue1('customerName', detail?.name)
                setValue1('email', detail?.email)
                setValue1('mobile', detail?.mobile)
            }
            else {
                let filter = await customers.find(item => item?.name == 'Walk-In Customer')
                console.log(filter);

                setSelectedCustomer(filter)
                setValue1('customer', filter?.name)


            }



        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };

    const getCompanies = async (id) => {
        try {
            let params = {
                customer_id: id ? id : selectedCustomer?.id
            };

            const { data } = await CustomerServices.getCompanies(params);
            setCompanies(data?.companies)




        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    const getTokenValidation = async (value) => {
        try {
            let params = {
                validate: true,
                token_number: value
            };

            const { data } = await CustomerServices.getReceptionDetail(params);
            console.log(data);
            if (data?.token) {
                setButtonDisabled(true)
                showErrorToast('Token Number Already Exist')
            }
            else {
                setButtonDisabled(false)
            }


        } catch (error) {

            console.error("Error fetching location:", error);
        }
    };
    const getTokenValidation2 = async (value) => {
        try {
            let params = {
                validate: true,
                token_number: value
            };

            const { data } = await CustomerServices.getReceptionDetail(params);
            console.log(data);
            if (data?.token) {
                setButtonDisabled2(true)
                showErrorToast('Token Number Already Exist')
            }
            else {
                setButtonDisabled2(false)
            }


        } catch (error) {

            console.error("Error fetching location:", error);
        }
    };

    const CreateCompany = async (formData) => {
        console.log(formData);
        try {
            let obj = {
         
                name: formData?.name,
                mobile:formData?.mobileVal,
                email:formData?.emailVal


            };
            const promise = CustomerServices.addCustomer(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                console.log(response);
                
                getCustomerQueue(response?.data?.id)
                
                setCompanyDialog(false)
            }


        } catch (error) {
            ErrorToaster(error);
        }
    };
    useEffect(() => {
        getCategories()
        getCustomerQueue()
    }, [])

    return (
        <Box m={3} sx={{ backgroundColor: "white", borderRadius: "12px" }}>
            <SimpleDialog
                open={companyDialog}
                onClose={() => setCompanyDialog(false)}
                title={"Create Customer?"}
            >
                <Box component="form" onSubmit={handleSubmit2(CreateCompany)}>
                    <Grid container spacing={2}>

                        <Grid container sx={{ justifyContent: "center" }}>
                            <Grid item xs={12}>
                                <InputField
                                    label={"Name *:"}
                                    size={"small"}
                                    placeholder={" Name"}
                                    error={errors2?.name?.message}
                                    register={register2("name", {
                                        required: "Please enter  name.",
                                    })}
                                />
                            </Grid>
                        
                            <Grid item xs={12}>
                                <InputField
                                    label={"Mobile *:"}
                                    size={"small"}
                                    type={"number"}

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
                                    register={register2("mobileVal", {
                                        required: 'mobile is required',

                                        onChange: (e) => {
                                            console.log("asdas");
                                            if (getValues1("mobile").length == 10) {

                                            }

                                            // Delay the execution of verifyEmail by 2 seconds
                                        },
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <InputField
                                    label={"Email :"}
                                    size={"small"}
                                    placeholder={" Email"}
                                    error={errors2?.emailVal?.message}
                                    register={register2("emailVal", {
                                        required: false,
                                    })}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                sm={6}
                                sx={{
                                    mt: 2,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "25px",
                                }}
                            >
                                <PrimaryButton
                                    bgcolor={Colors.primary}
                                    title="Yes,Confirm"
                                    type="submit"
                                />
                                <PrimaryButton
                                    onClick={() => setCompanyDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px", p: 3, alignItems: "flex-end" }}>
                <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>Create Reception</Typography>
            </Box>

            {customerType == 'individual' ? <Box component={"form"} onSubmit={handleSubmit(onSubmit)}>


                <Box sx={{ p: 3 }}>


                    <Grid container sx={{ gap: "5px 25px" }}>
                        <Grid item xs={2.8}><InputField
                            label={"Mobile *:"}
                            size={'small'}
                            type={'number'}
                            placeholder={"Mobile"}
                            error={errors?.mobile?.message}
                            register={register("mobile", {
                                required:
                                    "Please enter your mobile.",
                                pattern: {
                                    value: /^05[0-9]{8}$/,
                                    message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                },
                                onChange: (e) => {
                                    console.log(e.target.value);
                                    if (e.target.value.length == 10) {
                                        Debounce2(() => getCustomerDetail(e.target.value));
                                    }


                                },

                            })}
                        /></Grid>

                        <Grid item xs={2.8}>
                            <InputField
                                label={"Token Number *:"}
                                size={"small"}
                                placeholder={"Token Number"}
                                error={errors?.tokenNumber?.message}
                                register={register("tokenNumber", {
                                    required: "Enter Token Number"
                                })}
                            />
                        </Grid>

                        <Grid item xs={2.8}>
                            <InputField
                                label={"Customer Name *:"}
                                size={"small"}
                                placeholder={"Customer Name"}
                                error={errors?.customerName?.message}
                                register={register("customerName", {
                                    required: "Please enter customer name.",
                                })}
                            />
                        </Grid>

                        <Grid item xs={2.8}>
                            <InputField
                                label={"Reference :"}
                                size={"small"}
                                placeholder={"Reference"}
                                error={errors?.reference?.message}
                                register={register("reference")}
                            />
                        </Grid>



                        <Grid item xs={2.8}>
                            <InputField
                                label={"Email *:"}
                                size={"small"}
                                type={"email"}
                                placeholder={"Email"}
                                error={errors?.email?.message}
                                register={register("email", {
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email address.",
                                    },

                                })}
                            />
                        </Grid>

                        <Grid container justifyContent={'flex-end'}>
                            <PrimaryButton
                                disabled={buttonDisabled || buttonDisabled3}
                                bgcolor={'#001f3f'}
                                title="Create"
                                type={'submit'}


                            />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
                :
                <Box component={"form"} onSubmit={handleSubmit1(onSubmit1)}>


                    <Box sx={{ p: 3 }}>


                        <Grid container sx={{ gap: "5px 25px" }}>
                            <Grid item xs={2.8}>
                                <InputField
                                    label={"Mobile *:"}
                                    size={'small'}
                                    type={'number'}
                                    placeholder={"Mobile"}
                                    error={errors1?.mobile?.message}
                                    register={register1("mobile", {
                                        required:
                                            "Please enter your mobile.",
                                        pattern: {
                                            value: /^05[0-9]{8}$/,
                                            message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                        },
                                        onChange: (e) => {
                                            console.log(e.target.value);
                                            if (e.target.value.length == 10) {
                                                Debounce2(() => getCustomerDetail2(e.target.value));
                                            }

                                            // Delay the execution of verifyEmail by 2 seconds

                                        },

                                    })}
                                /></Grid>

                            <Grid item xs={2.8}>
                                <InputField
                                    label={"Token Number *:"}
                                    size={"small"}
                                    placeholder={"Token Number"}
                                    error={errors1?.tokenNumber?.message}
                                    register={register1("tokenNumber", {

                                        required: "Enter Token Number"

                                    })}
                                />
                            </Grid>

                            <Grid item xs={2.8}>
                                <InputField
                                    label={"Customer Name *:"}
                                    size={"small"}
                                    placeholder={"Customer Name"}
                                    error={errors1?.customerName?.message}
                                    register={register1("customerName", {
                                        required: "Please enter customer name.",
                                    })}
                                />
                            </Grid>

                            <Grid item xs={2.8}>
                                <InputField
                                    label={"Reference:"}
                                    size={"small"}
                                    placeholder={"Reference"}
                                    error={errors1?.reference?.message}
                                    register={register1("reference")}
                                />
                            </Grid>



                            <Grid item xs={2.8}>
                                <InputField
                                    label={"Email :"}
                                    size={"small"}
                                    type={"email"}
                                    placeholder={"Email"}
                                    error={errors1?.email?.message}
                                    register={register1("email", {
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Please enter a valid email address.",
                                        },
                                    })}
                                />
                            </Grid>

                            <Grid item xs={2.8} >
                                <SelectField
                                    size={'small'}
                                    label={'Customer *:'}

                                    options={customers}
                                    selected={selectedCustomer}
                                    onSelect={(value) => {
                                        setSelectedCustomer(value)
                                        if (value?.name == 'Walk-In Customer') {
                                         
                                            setValue1('customerName', '')
                                            setValue1('email', '')
                                            setValue1('mobile', '')
                                        }
                                        else {
                                            console.log(value);

                                            setValue1('customerName', value?.name)
                                            setValue1('email', value?.email)
                                            setValue1('mobile', value?.mobile)

                                            setSubCustDisable(false)
                                            Debounce2(() => getCompanies(value?.id));
                                        }

                                    }}
                                    error={errors1?.customer?.message}
                                    register={register1("customer")}
                                />
                            </Grid>
                            {/* <Grid item xs={2.8} >
                                <SelectField
                                    size={'small'}
                                    label={'Service Category *:'}

                                    options={categories}
                                    selected={selectedCategory}
                                    onSelect={(value) => {
                                        setSelectedCategory(value)
                                       

                                    }}
                                    error={errors1?.service?.message}
                                    register={register1("service", {
                                        required: 'Please select service.',
                                    })}
                                />
                            </Grid> */}
                           
                            <Grid item xs={2.8} mt={4} >
                                <PrimaryButton

                                    disabled={subCustDisable}
                                   bgcolor={'#001f3f'}
                                    onClick={() => setCompanyDialog(true)}
                                    title="Add Customer"



                                />
                            </Grid>
                            <Grid container justifyContent={'flex-end'}>
                                <PrimaryButton
                                    // disabled={buttonDisabled2}
                                    bgcolor={'#001f3f'}
                                    title="Create"
                                    type={'submit'}


                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Box>}
        </Box>
    )
}

export default ReceptionForm
