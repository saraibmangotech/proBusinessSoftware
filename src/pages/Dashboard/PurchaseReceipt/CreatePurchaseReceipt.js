import React, { useEffect, useRef, useState } from "react";
import {
    Avatar,
    Box,
    Checkbox,
    Container,
    FormControlLabel,
    FormLabel,
    Grid,
    IconButton,
    InputLabel,
    Radio,
    RadioGroup,
    Table,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    TableBody,
    TableHead,
    TextField,
    Paper,
} from "@mui/material";
import RegisterContainer from "container/Register";
import { useTheme } from "@mui/material/styles";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useForm } from "react-hook-form";
import UploadFile from "components/UploadFile";
import InputField from "components/Input";
import DatePicker from "components/DatePicker";
import { ErrorToaster } from "components/Toaster";
import { FormControl } from "@mui/base";
import LabelCustomInput from "components/Input/LabelCustomInput";
import SelectField from "components/Select";
import {
    CleanTypes,
    Debounce,
    Debounce2,
    getFileSize,
    handleDownload,
} from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import CustomerServices from "services/Customer";
import CustomerService from "../DashboardPages/CustomerService";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import SystemServices from "services/System";
import UploadFileSingle from "components/UploadFileSingle";
import { Images } from "assets";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import { addMonths } from "date-fns";
import { useAuth } from "context/UseContext";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import axios from "axios";
import UploadIcon from "@mui/icons-material/Upload";
import FinanceServices from "services/Finance";
import SearchIcon from "@mui/icons-material/Search";
// import { TableBody, TableHead } from "mui-datatables";

function CreatePurchaseReceipt() {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formChange, setFormChange] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [excludeFromSales, setExcludeFromSales] = useState("no");
    const [excludeFromPurchase, setExcludeFromPurchase] = useState("no");
    const [total, setTotal] = useState(0);
    const [subTotal, setSubTotal] = useState(0);
    const [rows, setRows] = useState([]);


    console.log(rows, "data")
    const [items, setItems] = useState([
        {
            itemCode: "",
            itemDescription: "TASHEEL AUTO 19",
            totalCharge: 17.1,
            mbNo: "",
            applicationId: "",
            total: 17.1,
        },
    ]);

    // const addItem = () => {
    //   const newItem = {
    //     itemCode: "",
    //     itemDescription: "",
    //     totalCharge: 0,
    //     mbNo: "",
    //     applicationId: "",
    //     total: 0,
    //   };
    //   setItems([...items, newItem]);
    // };

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm();
    const {
        register: register1,
        handleSubmit: handleSubmit1,
        setValue: setValue1,
        getValues: getValues1,
        control,
        watch: watch1,
        formState: { errors: errors1 },
    } = useForm();

    // Watch all form data

    // Watch for changes in the fee-related fields
    const govtFee = watch('govt_fee', 0);
    const centerFee = watch('center_fee', 0);
    const bankCharges = watch('bank_charges', 0);
    const qty = watch('qty', 1);
    useEffect(() => {
        const discount = watch('discount') || 0;
        const feesTotal = (parseFloat(govtFee) || 0) + (parseFloat(centerFee) || 0) + (parseFloat(bankCharges) || 0);
        const discountedTotal = feesTotal - parseFloat(discount);
        const finalTotal = discountedTotal * (parseFloat(qty) || 1);
        setValue("total", finalTotal > 0 ? finalTotal : 0);
    }, [govtFee, centerFee, bankCharges, qty, watch('discount')]);

    const addItem = (data) => {
        const total = data.total;
        setRows((prevRows) => {
            const updatedRows = [...prevRows, data];
            const newSubTotal = updatedRows.reduce((sum, row) => sum + row.total, 0);
            setSubTotal(newSubTotal);
            return updatedRows;
        });
        reset();
        setServiceItem("")
    };
    const isFormDataEmpty = (data) => {
        // Check if all form fields are empty
        return Object.values(data).every((value) => {
            // If the value is an object (like companyLogo), check if it's empty
            if (typeof value === "object" && value !== null) {
                return Object.keys(value).length === 0;
            }
            // Otherwise, check if the value is an empty string
            return value === "";
        });
    };

    const allowFilesType = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "application/pdf",
        "application/vnd.ms-excel",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowFilesType2 = ["image/png", "image/jpg", "image/jpeg"];
    const [guarantors, setGuarantors] = useState([]);
    const [activeStep, setActiveStep] = React.useState(1);

    // *For Deposit Slip
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [slipDetail, setSlipDetail] = useState([]);

    const [selectedDue, setSelectedDue] = useState({
        id: "Instant",
        name: "Instant",
    });
    const [passport, setPassport] = useState();
    const [allocation, setAllocation] = useState(false);
    const [depositError, setDepositError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailVerify, setEmailVerify] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [fieldsDisabled, setFieldsDisabled] = useState({
        monthlyVisaServiceCharges: false,
        vipMedical: false,
        extraTyping: true,
    });

    const [center, setCenter] = useState(null);
    const [status, setStatus] = useState(null);

    // *For Stepper Forms Data
    const [stepFormData, setStepFormData] = useState();
    const [step1FormData, setStep1FormData] = useState();
    const [selectedType, setSelectedType] = useState(null);
    const [date, setDate] = useState(null);
    const [balanceType, setBalanceType] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const fileInputRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [salesAccount, setSalesAccount] = useState(null);
    const [inventoryAccount, setInventoryAccount] = useState(null);
    const [cogsAccount, setCogsAccount] = useState(null);
    const [adjustmentAccount, setAdjustmentAccount] = useState(null);
    const [assemblyAccount, setAssemblyAccount] = useState(null);
    const [itemType, setItemType] = useState(null);
    const [unit, setUnit] = useState(null);
    const [taxes, setTaxes] = useState([]);
    const [tax, setTax] = useState(null);
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState(null);
    const [governmentAccount, setGovernmnentAccount] = useState(null);
    const [description, setDescription] = useState(null);
    const [ownGovBank, setOwnGovBank] = useState(null);
    const [services, setServices] = useState(null);
    const [serviceItem, setServiceItem] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [detail, setDetail] = useState(null)
    //documents array

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const submitForm1 = async (formData) => {
        console.log(formData);
        try {
            let obj = {
                token_number: formData?.token,
                token_date: date,
                invoice_prefix: "AAD",
                cost_center: formData?.cost_center,
                customer_name: formData?.display_customer,
                reception_id: detail?.id,
                customer_mobile: formData?.mobile,
                customer_email: formData?.email,
                ref: formData?.ref,
                total_amount: subTotal,
                due_date: formData?.due_date,
                payment_method: formData?.payment_method?.id,
                po_number: formData?.po_number,
                payment_status: formData?.payment_status?.id,
                notes: formData?.notes,
                items: rows
            };
            console.log(formData, "formData");
            const promise = CustomerServices.CreateSaleReceipt(obj);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate("/pre-sales");
            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Account
    const getReceptionDetail = async () => {
        try {
            let params = {
                token_number: getValues1("token"),
            };
            const { data } = await CustomerServices.getReceptionDetail(params);
            console.log(data, "dataaa");
            setDetail(data?.token)
            setValue1("customer", data?.token?.customer_name);
            setValue1("invoice_date", moment().toDate());
            setValue1("mobile", data?.token?.mobile);
            setValue1("ref", data?.token?.reference);
            setValue1("display_customer", data?.token?.customer_name);
            setValue1("email", data?.token?.email);
            setValue1("address", data?.token?.address);
            setValue1("trn", data?.token?.trn);
            setValue1("cost_center", data?.token?.cost_center);

            setAccounts(data?.accounts?.rows);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };

    const getServiceItem = async () => {
        // setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 1000,
            };

            const { data } = await CustomerServices.getServiceItem(params);

            setServices(data?.rows);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };
    const handleServiceSelect = async (value) => {
        console.log(value, "idididid");
        setServiceItem(value);
        // setLoader(true)
        try {
            let params = {
                service_id: value?.id,
            };

            const { data } = await CustomerServices.DetailServiceItem(params);
            setValue("item_code", data?.service?.id);
            setValue("govt_fee", data?.service?.bank_service_charge);
            setValue("center_fee", data?.service?.center_fee);
            setValue("bank_charges", data?.service?.bank_service_charge);

            setValue("qty", 1);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };

    const getAccounts = async (page, limit, filter) => {
        // setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 1000,
            };

            const { data } = await FinanceServices.getAccounts(params);
            console.log(data?.accounts?.rows);

            setAccounts(data?.accounts?.rows);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };
    const getTax = async () => {
        // setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 1000,
            };

            const { data } = await FinanceServices.getTax(params);
            console.log(data?.accounts?.rows);

            setTaxes(data?.tax);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };
    const getCategories = async () => {
        // setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 1000,
            };

            const { data } = await CustomerServices.getCategoryList(params);

            setCategories(data?.categories);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };

    useEffect(() => {
        getAccounts();
        getTax();
        getCategories();
        getServiceItem();
    
    }, []);

    return (
        <>
            <Box sx={{ width: "100%" }}></Box>
            <Box m={3} sx={{ backgroundColor: "white", borderRadius: "12px" }}>
                {
                    <>
                        <Box component={"form"} onSubmit={handleSubmit1(submitForm1)}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                    p: 3,
                                    alignItems: "flex-end",
                                }}
                            >
                                <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
                                    Purchase Receipt
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Grid container sx={{ gap: "5px 25px" }}>
                                    

                                    <Grid
                                        item
                                        md={5.5}
                                        sm={12}
                                        xs={12}
                                        sx={{
                                            border: "2px solid black",
                                            p: 2,
                                            borderRadius: "15px",
                                        }}
                                    >
                                        <Grid container sx={{ gap: "5px 25px" }}>
                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Invoice No"
                                                    size="small"
                                                    placeholder="TSL/83540"
                                                    register={register1("invoice_no")}
                                                />
                                            </Grid>
                                            <Grid item xs={5.7}>
                                                <DatePicker
                                                    label={"Invoice Date :*"}
                                                    value={date}
                                                    size={'small'}

                                                    error={errors1?.date?.message}
                                                    register={register1("date", {
                                                        required:
                                                            date ? false :
                                                                "please enter  date."

                                                    })}
                                                    onChange={(date) => {

                                                        setValue1('date', date)
                                                        setDate(new Date(date));

                                                    }

                                                    }
                                                /></Grid>
                                            <Grid item xs={5.7}>
                                                <DatePicker
                                                    label={"Due Date :"}
                                                    size={'small'}
                                                    register={register1("due_date")}
                                                    onChange={(date) => {
                                                        setValue1('due_date', date)
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={5.7}>
                                                <SelectField
                                                    size={'small'}
                                                    label={'Payment Method:'}
                                                    options={[
                                                        { id: "cash", name: "Cash" },
                                                        { id: "bank_transfer", name: "Bank Transfer" },
                                                        { id: "credit_card", name: "Credit Card" },
                                                        { id: "check", name: "Check" }
                                                    ]}
                                                    selected={watch1("payment_method")}
                                                    onSelect={(value) => {
                                                        setValue1("payment_method", value);
                                                    }}
                                                    register={register1("payment_method")}
                                                />
                                            </Grid>

                                            <Grid item xs={5.7} >
                                                <SelectField
                                                    size={'small'}
                                                    label={'Vendors *:'}
                                                    options={[

                                                        { id: "amazon", name: "Amazon" },
                                                        { id: "ebay", name: "eBay" },
                                                        { id: "alibaba", name: "Alibaba" }
                                                    ]}
                                                    selected={selectedCustomer}
                                                    onSelect={(value) => {
                                                        setSelectedCustomer(value);
                                                    }}
                                                    error={errors1?.customer?.message}
                                                    register={register1("customer", {
                                                        required: false,
                                                    })}
                                                />

                                            </Grid>



                                        </Grid>
                                    </Grid>
                                    <Grid
                                        item
                                        md={5.5}
                                        sm={12}
                                        xs={12}
                                        sx={{
                                            border: "2px solid black",
                                            p: 2,
                                            borderRadius: "15px",
                                            mt: { md: 0, sm: 2, xs: 2 },
                                        }}
                                    >
                                        <Grid container sx={{ gap: "5px 25px" }}>
                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Display Customer"
                                                    size="small"
                                                    placeholder="Walk-in Customer"
                                                    register={register1("display_customer", {
                                                        required: 'please enter display name.'
                                                    })}
                                                    error={errors1?.display_customer?.message}
                                                />
                                            </Grid>

                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Mobile"
                                                    size="small"
                                                    placeholder="Mobile No"

                                                    register={register1("mobile", {
                                                        required: 'please enter mobile .'
                                                    })}
                                                    error={errors1?.display_customer?.message}
                                                />
                                            </Grid>

                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Email"
                                                    size="small"
                                                    placeholder="Email"

                                                    register={register1("email", {
                                                        required: 'please enter email .'
                                                    })}
                                                    error={errors1?.email?.message}
                                                />
                                            </Grid>
                                            {/* 
                      <Grid item md={5.7} sm={12} xs={12}>
                        <InputField
                          label="TRN"
                          size="small"
                          placeholder="TRN"


                          register={register1("trn", {
                            required: 'please enter trn .'
                          })}
                          error={errors1?.trn?.message}
                        />
                      </Grid> */}

                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Ref"
                                                    size="small"
                                                    placeholder="Reference"
                                                    register={register1("ref")}
                                                />
                                            </Grid>

                                            {/* <Grid item md={5.7} sm={12} xs={12}>
                        <SelectField
                          label="Cost Center"
                          size="small"
                          options={[{ id: 'Tasheel', name: 'Tasheel' }, { id: 'DED', name: 'DED' }, { id: 'Typing', name: 'Typing' }, { id: 'General', name: 'General' }]}
                          selected={watch1("cost_center")}
                          onSelect={(value) => setValue1("cost_center", value)}

                          register={register1("cost_center", {
                            required: 'please enter cost center .'
                          })}
                          error={errors1?.cost_center?.message}
                        />
                      </Grid> */}
                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Address"
                                                    size="small"
                                                    placeholder="Address"
                                                    multiline
                                                    rows={2}

                                                    register={register1("address", {
                                                        required: 'please enter address .'
                                                    })}
                                                    error={errors1?.address?.message}
                                                />
                                            </Grid>
                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <InputField
                                                    label="Purchase Order #"
                                                    size="small"
                                                    placeholder="PO Number"
                                                    register={register1("po_number")}
                                                />
                                            </Grid>

                                            <Grid item md={5.7} sm={12} xs={12}>
                                                <SelectField
                                                    size={'small'}
                                                    label={'Payment Status:'}
                                                    options={[
                                                        { id: "paid", name: "Paid" },
                                                        { id: "unpaid", name: "Unpaid" },
                                                        { id: "partial", name: "Partially Paid" }
                                                    ]}
                                                    selected={watch1("payment_status")}
                                                    onSelect={(value) => {
                                                        setValue1("payment_status", value);
                                                    }}
                                                    register={register1("payment_status")}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* </Grid> */}
                                    
                                </Grid>
                            </Box>
                        </Box>


                        <form onSubmit={handleSubmit(addItem)}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: "150px" }}>Item Code</TableCell>
                                            <TableCell sx={{ width: "400px" }}>Service</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Qty</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Govt fee</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Center fee</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Bank Charge</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Discount</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Tax</TableCell>

                                            <TableCell sx={{ width: "150px" }}>Total</TableCell>
                                            <TableCell sx={{ width: "150px" }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    disabled={true}
                                                    placeholder="Item code"
                                                    register={register("item_code", { required: "Item code is required" })}
                                                />
                                                {errors.item_code && <span>{errors.item_code.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <SelectField
                                                    size="small"
                                                    options={services}
                                                    selected={serviceItem}
                                                    onSelect={handleServiceSelect}
                                                    //  error={errors?.service?.message}
                                                    register={register("service", {
                                                        required: "Please select a service.",
                                                    })}
                                                />
                                                {errors.service && <span style={{ color: "red" }}>{errors.service.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Quantity"
                                                    type="number"
                                                    register={register("qty", { required: "Quantity is required" })}
                                                />
                                                {errors.qty && <span style={{ color: "red" }}>{errors.qty.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Govt fee"
                                                    type="number"
                                                    register={register("govt_fee", { required: "Govt fee is required" })}
                                                />
                                                {errors.govt_fee && <span style={{ color: "red" }}>{errors.govt_fee.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Center Fee"
                                                    type="number"
                                                    register={register("center_fee", { required: "Center fee is required" })}
                                                />
                                                {errors.center_fee && <span style={{ color: "red" }}>{errors.center_fee.message}</span>}
                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Bank Charges"
                                                    type="number"
                                                    register={register("bank_charges", { required: "Bank charges are required" })}
                                                    disabled
                                                />
                                                {errors.bank_charges && <span style={{ color: "red" }}>{errors.bank_charges.message}</span>}

                                            </TableCell>
                                            <TableCell>
                                                <InputField
                                                    size="small"
                                                    placeholder="Discount"
                                                    type="number"
                                                    register={register("discount")}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <SelectField
                                                    size="small"
                                                    options={taxes || []}
                                                    selected={tax}
                                                    onSelect={(value) => {
                                                        setTax(value);
                                                        setValue("tax", value?.id);
                                                    }}
                                                    register={register("tax")}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <InputField
                                                    disabled={true}
                                                    style={{ border: "none" }}
                                                    size="small"
                                                    placeholder="Narration"
                                                    register={register("total")}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    sx={{
                                                        textTransform: 'capitalize',
                                                        backgroundColor: "rgb(189 155 74)",
                                                        fontSize: "12px",
                                                        ":hover": {
                                                            backgroundColor: "rgb(189 155 74)",
                                                        },
                                                    }}
                                                >
                                                    Add Item
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {rows.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item?.item_code}</TableCell>
                                                <TableCell>{item?.service}</TableCell>
                                                <TableCell>{item?.qty}</TableCell>
                                                <TableCell>{item?.govt_fee}</TableCell>
                                                <TableCell>{item?.center_fee}</TableCell>
                                                <TableCell>{item?.bank_charges}</TableCell>
                                                <TableCell>{item?.discount}</TableCell>
                                                <TableCell>{item?.tax}</TableCell>

                                                <TableCell>{item?.total}</TableCell>

                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={8} align="left">
                                                <InputField
                                                    label="Notes"
                                                    size="small"
                                                    placeholder="Add notes about this purchase"
                                                    multiline
                                                    rows={2}
                                                    register={register1("notes")}
                                                />
                                            </TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Sub-total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{subTotal}</Typography> {/* Display the Sub-total */}
                                            </TableCell>
                                        </TableRow>

                                        {/* Amount Total Row (optional, if needed for the final sum) */}
                                        <TableRow>
                                            <TableCell colSpan={9} align="right">
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>Amount Total:</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" sx={{ fontSize: "15px" }}>{subTotal}</Typography> {/* This can be the same as Sub-total */}
                                            </TableCell>
                                        </TableRow>
                                           <TableRow>
                                                                                    <TableCell colSpan={10} align="center"> {/* adjust colSpan to match total columns */}
                                                                                        <Box sx={{display:'flex',gap:2,justifyContent:'center'}}>
                                                                                        <Button
                                                                                            type="submit"
                                                                                            disabled={rows?.length === 0}
                                                                                            variant="contained"
                                                                                            sx={{
                                                                                                width:'350px',
                                                                                                textTransform: 'capitalize',
                                                                                                backgroundColor: "#bd9b4a",
                                                                                                ":hover": {
                                                                                                    backgroundColor: "rgb(189 155 74)",
                                                                                                },
                                                                                            }}
                                                                                        >
                                                                                            Place Purchase
                                                                                        </Button>
                                                                                        <Button
                                                                                           onClick={()=> navigate('/aldeed-list')}
                                                                                            
                                                                                            variant="contained"
                                                                                            sx={{
                                                                                                width:'350px',
                                                                                                textTransform: 'capitalize',
                                                                                                backgroundColor: "#bd9b4a",
                                                                                                ":hover": {
                                                                                                    backgroundColor: "rgb(189 155 74)",
                                                                                                },
                                                                                            }}
                                                                                        >
                                                                                            Cancel
                                                                                        </Button>
                                                                                        </Box>
                                                                                    </TableCell>
                                                                                </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </form>
                    </>
                }
            </Box>
        </>
    );
}

export default CreatePurchaseReceipt;
