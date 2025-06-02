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
    Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
import { addMonths, max } from "date-fns";
import { useAuth } from "context/UseContext";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import axios from "axios";
import UploadIcon from "@mui/icons-material/Upload";
import FinanceServices from "services/Finance";
import SearchIcon from "@mui/icons-material/Search";
import Barcode from "react-barcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FPInvoiceServices from "services/FPInvoice";
// import { TableBody, TableHead } from "mui-datatables";

function CreateFixedAssetInvoice() {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedRow, setSelectedRow] = useState(null)
    const [editState, setEditState] = useState(false)
    const [formChange, setFormChange] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [excludeFromSales, setExcludeFromSales] = useState("no");
    const [excludeFromPurchase, setExcludeFromPurchase] = useState("no");
    const [total, setTotal] = useState(0);
    const [subTotal, setSubTotal] = useState(0);
    const [rows, setRows] = useState([]);
    const [invoiceData, setInvoiceData] = useState(null)
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [settings, setSettings] = useState({})
    const [banks, setBanks] = useState([])
    const [selectedBank, setSelectedBank] = useState(null)
    const [payButton, setPayButton] = useState(false)
    const [chargesDisabled, setChargesDisabled] = useState(false)
    const [selectedMode, setSelectedMode] = useState(null)
    const [cards, setCards] = useState([])
    const [selectedCard, setSelectedCard] = useState(null)
    const [payments, setPayments] = useState([])
    const [isVatApplicable, setIsVatApplicable] = useState(true);

    console.log(rows, "data");
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
    console.log(errors1);

    // Watch all form data

    // Watch for changes in the fee-related fields
    const govtFee = watch("govt_fee", 0);
    const centerFee = watch("center_fee", 0);
    const bankCharges = watch("charges", 0);
    const qty = watch("quantity", 1);
    useEffect(() => {
        const feesTotal =
            (parseFloat(govtFee) || 0) +
            (parseFloat(centerFee) || 0) +
            (parseFloat(bankCharges) || 0);
        const finalTotal = feesTotal * (parseFloat(qty) || 1);
        setValue("total", parseFloat(finalTotal).toFixed(2));
    }, [govtFee, centerFee, bankCharges, qty]);
    useEffect(() => {
        console.log(rows, 'rowsrowsrows');
        const grandTotal = rows.reduce((acc, item) => acc + parseFloat(item.total), 0);

        console.log(grandTotal); // Output: 100
        setValue1('total', parseFloat((parseFloat(grandTotal) * 0.05) + parseFloat(grandTotal)).toFixed(2))
        setValue1('finalTotal', parseFloat((parseFloat(grandTotal) * 0.05) + parseFloat(grandTotal)).toFixed(2))
        setValue1('balance', parseFloat((parseFloat(grandTotal) * 0.05) + parseFloat(grandTotal)).toFixed(2))
        setValue1('paidamount', 0)
        // setValue1('depreciation_months', 0)
    }, [rows]);

    useEffect(() => {
        setValue1('depreciation_months', 0)
   
  }, [])


    useEffect(() => {
        console.log(payments, 'paymentspaymentspayments');
        const grandTotal = payments.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        console.log(grandTotal);
        setValue1('balance', parseFloat(getValues1('finalTotal')) - parseFloat(grandTotal))
        setValue1('paidamount', grandTotal)

        // setValue1('total', parseFloat((parseFloat(grandTotal)*0.05)+parseFloat(grandTotal)).toFixed(2))
        // setValue1('finalTotal', parseFloat((parseFloat(grandTotal)*0.05)+parseFloat(grandTotal)).toFixed(2))
    }, [payments]);
    const addItem = (item, cost_center,quantity, charges, description, ref, total) => {
        console.log(item?.impact_account_id);

        // Parse numeric inputs
        const parsedQuantity = parseFloat(quantity);
        const parsedCharges = parseFloat(charges);
        const parsedTotal = parseFloat(total);

        // Basic required field validation
        if (!item  || !cost_center || quantity === "" || charges === "") {
            showErrorToast("Item, quantity,cost center and charges are required!");
            return;
        }

        // Check for negative values
        if (parsedQuantity < 0 || parsedCharges < 0 || parsedTotal < 0) {
            showErrorToast("Quantity, charges, and total must be 0 or greater!");
            return;
        }

        // Check for consistent impact account ID
        if (rows.length > 0) {
            const firstImpactAccountId = rows[0].item?.impact_account_id;
            if (item?.impact_account_id !== firstImpactAccountId) {
                // showErrorToast("You cannot add items with a different impact account.");
                // return;
            }
        }

        // Check for duplicate product
        // const isDuplicate = rows.some(row => row.product_id === serviceItem?.id);
        // if (isDuplicate) {
        //     showErrorToast("This product has already been added.");
        //     return;
        // }

        // Create a new row
        const newRow = {
            product_id: serviceItem?.id,
            item,
            quantity: parsedQuantity,
            charge: parsedCharges,
            description,
            ref,
            total: parsedTotal,
            selectedService: serviceItem,
            cost_center:selectedCostCenter?.name
        };
        console.log(newRow);

        // Update rows and subtotal
        setRows((prevRows) => {
            const updatedRows = [...prevRows, newRow];
            const newSubTotal = updatedRows.reduce(
                (sum, row) => sum + parseFloat(row.total || 0),
                0
            );
            setSubTotal(parseFloat(newSubTotal.toFixed(2)));
            return updatedRows;
        });

        setPayments([]);
        setServiceItem("");
        setSelectedCostCenter('')
        setPayments([]);
        setServiceItem("");
        setSelectedCostCenter('')
        setServiceItem("");
        setSelectedCostCenter('')
        setValue("id", '');
        setValue("item_code", '');
        setValue("govt_fee", '');
        setValue("center_fee", '');
        setValue("charges", '');
        setValue("transaction_id", '');
        setValue("application_id", '');
        setValue("description", '');
        setValue("ref", '');
        setServiceItem(null);
        setValue("quantity", '');
    };

    const getTokenNumber = async () => {
        try {


            const { data } = await CustomerServices.getInvoiceNumberToken({type: "PE"});
            console.log(data);
            setValue1('invoiceNumber', "PE-" + data?.number)

        } catch (error) {
            showErrorToast(error);
        }
    };


    const [activeStep, setActiveStep] = React.useState(1);

    // const [fieldsDisabled, setFieldsDisabled] = useState({
    //   monthlyVisaServiceCharges: false,
    //   vipMedical: false,
    //   extraTyping: true,
    // });
    const [fieldsDisabled, setFieldsDisabled] = useState(false);
    const invoiceRef = useRef(null);
    const [center, setCenter] = useState(null);
    const [status, setStatus] = useState(null);

    // *For Stepper Forms Data
    const [stepFormData, setStepFormData] = useState();
    const [step1FormData, setStep1FormData] = useState();
    const [selectedType, setSelectedType] = useState(null);
    const [date, setDate] = useState(new Date());
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
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [services, setServices] = useState([]);
    const [serviceItem, setServiceItem] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detail, setDetail] = useState(null);
    const [holdState, setHoldState] = useState(true);
    const [vendors, setVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [products, setProducts] = useState([])
    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    // const [fieldsDisabled, setFieldsDisabled] = useState(false)

    //documents array

    const submitForm1 = async (formData) => {
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const paymentModesString = payments.map((item) => item.payment_mode).join(", ");

        getValues1('total')
        let newTotal = parseFloat(getValues1('finalTotal'))
        if (existingTotal <= newTotal) {

            setButtonDisabled(true)
            try {
                const obj = {
                    vendor_id: selectedVendor?.id,
                    vendor_account_id: selectedVendor?.account_id,
                    total_charges: subTotal,
                    tax: parseFloat(subTotal) * 0.05,
                    vat_enabled: isVatApplicable,
                    items: rows,
                    purchase_date: moment(date).format('MM-DD-YYYY'),
                    invoice_number: formData?.invoiceNumber,
                    total_months: formData?.depreciation_months,
                    months_recorded: 0,
                    invoice_type: "Fixed Asset",
                    invoice_prefix: "FA",
                    additional_charges_percentage: formData?.percentage,
                    additional_charges_value: formData?.additionalCharges,
                    paid_amount: existingTotal,
                    total_amount: getValues1('finalTotal'),
                    payment_mode: paymentModesString,
                    payment_status: parseFloat(existingTotal) === 0
                        ? 'Unpaid'
                        : parseFloat(existingTotal) === parseFloat(newTotal)
                            ? 'Paid'
                            : 'Partial',
                    is_paid: existingTotal == newTotal ? true : false,
                    payment_methods: payments
                }

                if (detail?.is_paid == true) {
                    ErrorToaster("Already paid")
                } else {
                    const promise = FPInvoiceServices.createFPInvoice(obj)
                    const response = await promise
                    showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
                    if (response?.responseCode === 200) {
                        navigate('/fixed-assets')
                    }
                }
            } catch (error) {
                ErrorToaster(error)
            } finally {
                setButtonDisabled(false)
            }
        }
        else {

            showErrorToast(`Amount Can not be Exceeded`)
        }
    }


    const addPayments = (amount, account, submit = null) => {
        const total = parseFloat(getValues1("total")) || 0;
        const currentAmount = parseFloat(amount) || 0;
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        if (existingTotal + currentAmount > total) {
            showErrorToast("Total payment exceeds the required amount.");
            return;
        }

        if (!amount) {
            showErrorToast("Amount is required");
            return;
        }

        if (parseFloat(amount) === 0) {
            showErrorToast("Amount is 0");
            return;
        }



        if (!account) {
            showErrorToast("Account is required");
            return;
        }




        const paymentObj = {
            amount: currentAmount,
            payment_mode: account?.name,
            account_id: account?.id



        };

        setPayments((prev) => [...prev, paymentObj]);

        // Reset form fields
        setSelectedBank(null);
        setSelectedCard(null);
        setValue1("payamount", "");
        setValue1("percentage", "");
        setValue1("additionalCharges", "");
        setValue1("remarks", "");
        setValue1("authCode", "");
        // Optionally reset payment mode
        // setValue1("payment", { id: "Cash", name: "Cash" });
        // setSelectedMode({ id: "Cash", name: "Cash" });
    };



    const getSystemSettings = async () => {
        // setLoader(true)
        try {
            const { data } = await CustomerServices.getSystemSettings();

            console.log(data, "settings");
            setSettings(data?.settings)
            setValue1("cost_center", { id: data?.settings?.cost_center, name: data?.settings?.cost_center })

            // setValue1("invoice_no", `DED/${data?.next_invoice_number}`);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };

    const handleServiceSelect = async (value) => {
        console.log(value, "idididid");
        setServiceItem(value);
        if (value) {
            setValue("id", value?.id);
            setValue("item_code", value?.id);
            setValue("quantity", 1);

            setValue("charges", value?.price);
        }
        else {
            setValue("id", '');
            setValue("govt_fee", '');
            setValue("center_fee", '');
            setValue("charges", '');
            setValue("transaction_id", '');
            setValue("application_id", '');
            setValue("ref_no", '');
            setServiceItem(null);
            setValue("quantity", '');
        }

    };



    const getCategories = async () => {
        // setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCategoryList(params);

            setCategories(data?.categories);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };
    const updateItem = (item2,cost_center, quantity, charges, description, ref, total) => {
        console.log("Current serviceItem:", serviceItem);

        // Parse numeric values
        const parsedQuantity = parseFloat(quantity);
        const parsedCharges = parseFloat(charges);
        const parsedTotal = parseFloat(total);

        // Validation
        if (!item2 || !cost_center ||  quantity === "" || charges === "") {
            showErrorToast("Item, quantity,cost center  and charges are required!");
            return;
        }

        // Negative value validation
        if (parsedQuantity < 0 || parsedCharges < 0 || parsedTotal < 0) {
            showErrorToast("Quantity, charges, and total must be 0 or greater!");
            return;
        }

        if (!item2?.id) {
            console.warn("No valid ID found in item2. Skipping update.");
            return;
        }

        // Updated item using current form data and serviceItem
        const updatedItem = {
            id: item2.id, // Ensure ID is retained
            item: item2.item || '',
            quantity: parsedQuantity,
            charge: parsedCharges,
            description,
            ref,
            total: parsedTotal,
            product_id: serviceItem?.id,
            selectedService: item2,
            cost_center:selectedCostCenter?.name
        };

        console.log("Updated item to be saved:", updatedItem);

        setRows((prevItems) => {
            console.log("Previous rows:", prevItems);

            const updatedRows = prevItems.map((item) =>
                item.product_id === item2.id ? updatedItem : item
            );

            console.log("Rows after update:", updatedRows);

            // Calculate new subtotal
            const newSubTotal = updatedRows.reduce((sum, row) => {
                const rowTotal = parseFloat(row.total || 0);
                return sum + (isNaN(rowTotal) ? 0 : rowTotal);
            }, 0);

            setSubTotal(parseFloat(newSubTotal.toFixed(2)));

            return updatedRows;
        });

        console.log("Resetting form and states...");
        //reset();
        setServiceItem(null);
        setSelectedCostCenter(null)
        setPayments([])
        setEditState(false);
        setPayments([]);
        setServiceItem("");
        setSelectedCostCenter('')
        setServiceItem("");
        setSelectedCostCenter('')
        setValue("id", '');
        setValue("item_code", '');
        setValue("govt_fee", '');
        setValue("center_fee", '');
        setValue("charges", '');
        setValue("transaction_id", '');
        setValue("application_id", '');
        setValue("description", '');
        setValue("ref", '');
        setServiceItem(null);
        setValue("quantity", '');
    };



    const getVendors = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getVendors(params)
            setVendors(data?.rows)

        } catch (error) {
            showErrorToast(error)
        }
    }

    const getProducts = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getProducts(params)
            setProducts(data?.rows)

        } catch (error) {
            showErrorToast(error)
        }
    }
    // *For Get Customer Queue
    const getBanks = async (page, limit, filter) => {


        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            const { data } = await CustomerServices.getBanks(params)
            setBanks(data?.banks)
        } catch (error) {
            showErrorToast(error)
        }
    }
    // *For Get Customer Queue
    const getCards = async (page, limit, filter) => {


        try {
            const params = {
                page: 1,
                limit: 999999,
            }

            const { data } = await CustomerServices.getCards(params)
            let cardsData = data?.cards?.map((card) => ({
                ...card,
                name: card.account_name,
            }));
            setCards(
                data?.cards?.map((card) => ({
                    ...card,
                    name: card.account_name,
                })),

            )

            setSelectedCard({ id: cardsData[0]?.id, name: cardsData[0]?.name })
            setValue1("card", { id: cardsData[0]?.id, name: cardsData[0]?.name })


        } catch (error) {
            showErrorToast(error)
        }
    }

    const getAccounts = async (search, accountId) => {
        try {
            let params = {
                page: 1,
                limit: 10000,
                name: search,
                is_disabled: false,
                sub_category: 4

            }
            const { data } = await FinanceServices.getAccountsDropDown(params)
            const updatedAccounts = data?.accounts?.rows?.map(account => ({
                ...account,
                name: ` ${account.account_code} ${account.name}`
            }));
            console.log(updatedAccounts, 'updatedAccountsupdatedAccounts');

            setAccounts(updatedAccounts)
        } catch (error) {
            showErrorToast(error)
        }
    }

    // *For Get Account
    const getChildAccounts = async (accountId) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                primary_account_id: accountId ?? selectedAccount?.id,
            };
            const { data } = await FinanceServices.getAccounts(params);

            if (data?.accounts?.rows?.length > 0) {
                showErrorToast('Cannot use this account because it has child accounts.')
                setSelectedAccount(null)
            }
        } catch (error) {
            showErrorToast(error);
        }
    };
    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters(data?.cost_centers);
        } catch (error) {
            showErrorToast(error);
        }
    };
    useEffect(() => {
        getCostCenters()
        getTokenNumber()
        getProducts()
        getCards()
        getBanks()
        getVendors()
        console.log(user, "user");
        getAccounts();
        getCategories();
        getSystemSettings();
        // getServiceItem();

        setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" });
        setValue1("customer", { id: "walkin", name: "Walk-in Customer" });
        setValue1("cost_center", { id: settings?.cost_center, name: settings?.cost_center })
    }, []);

   
    useEffect(() => {
        const grandTotal = rows.reduce((acc, item) => acc + parseFloat(item.total), 0);
        const grandTotal2 = payments.reduce((acc, item) => acc + parseFloat(item.amount), 0);

        const totalWithVat = isVatApplicable
            ? parseFloat((grandTotal * 0.05) + grandTotal)
            : grandTotal;

        setValue1('total', totalWithVat.toFixed(2));
        setValue1('finalTotal', totalWithVat.toFixed(2));
        setValue1('balance', (totalWithVat - grandTotal2).toFixed(2));
    }, [isVatApplicable, rows, payments]);


    return (
        <>
            <Box m={3} sx={{ backgroundColor: "white", borderRadius: "12px" }}>
                <Box component={"form"} onSubmit={handleSubmit1(submitForm1)}>
                    <Box>
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
                                Create Prepaid Expense
                            </Typography>

                        </Box>

                        <Box sx={{ p: 3, border: '1px solid black', borderRadius: '12px', mb: 2 }}>




                            <Grid container spacing={2} p={2}>
                                <Grid item md={3} sm={5.5} xs={12}>
                                    <DatePicker
                                        label={"Date "}
                                        value={date}
                                        size={"small"}
                                        error={errors1?.paidAt?.message}
                                        register={register1("paidAt", {
                                            required: date ? false : 'Date is required'
                                        })}
                                        onChange={(date) => {
                                            setValue1("paidAt", date)
                                            setDate(new Date(date))

                                        }}
                                    />
                                </Grid>
                                <Grid item md={3} sm={5.5} xs={12}>
                                    <SelectField
                                        size={"small"}
                                        label={"Select Vendor "}

                                        options={vendors}
                                        selected={selectedVendor}
                                        onSelect={(value) => {
                                            setSelectedVendor(value)
                                            setValue1('name', value?.name)
                                            setValue1('mobile', value?.phone)
                                            setValue1('email', value?.email)
                                            setValue1('address', value?.address)
                                        }}
                                        error={errors1?.vendor?.message}
                                        register={register1("vendor", {
                                            required: 'Vendor is required'
                                        })}
                                    />
                                </Grid>

                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="System Invoice Number"
                                        size="small"
                                        placeholder="Invoice Number"
                                        disabled={true}
                                        register={register1("invoiceNumber", {
                                            required: 'invoice Number is required'
                                        })}
                                        error={errors1?.invoiceNumber?.message}
                                    />
                                </Grid>
                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="Depreciation Months"
                                        size="small"
                                        placeholder="Months"
                                        type="number"
                                      
                                        register={register1("depreciation_months", {
                                            required: 'Depreciation Months is required'
                                        })}
                                        error={errors1?.depreciation_months?.message}
                                    />
                                </Grid>


                            </Grid>
                            <Grid container spacing={2} p={2}>
                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="name"
                                        size="small"
                                        placeholder="name"
                                        disabled={true}
                                        register={register1("name")}
                                        error={errors1?.name?.message}
                                    />
                                </Grid>

                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="Mobile"
                                        size="small"
                                        placeholder="Mobile No"
                                        disabled={true}
                                        register={register1("mobile", {

                                        })}

                                    />
                                </Grid>

                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="Email"
                                        size="small"
                                        placeholder="Email"
                                        disabled={true}
                                        register={register1("email")}
                                        error={errors1?.email?.message}
                                    />
                                </Grid>





                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="Address"
                                        size="small"
                                        placeholder="Address"

                                        disabled={true}

                                        register={register1("address")}
                                        error={errors1?.address?.message}
                                    />
                                </Grid>
                            </Grid>


                        </Box>

                    </Box>


                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: "150px" }}>Item Code</TableCell>
                                    <TableCell sx={{ width: "400px" }}>Product</TableCell>
                                    <TableCell sx={{ width: "400px" }}>Cost Center</TableCell>
                                    <TableCell sx={{ width: "150px" }}>Qty</TableCell>

                                    <TableCell sx={{ width: "150px" }}>Charges</TableCell>
                                    <TableCell sx={{ width: "150px" }}>Description</TableCell>
                                    <TableCell sx={{ width: "150px" }}>Ref No</TableCell>
                                    <TableCell sx={{ width: "150px" }}>Total</TableCell>
                                    <TableCell sx={{ width: "150px" }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {<TableRow>
                                    <TableCell sx={{ display: "none" }}>
                                        <InputField
                                            size="small"
                                            disabled={true}
                                            placeholder="Item id"
                                            register={register("id", { required: false })}
                                        />
                                        {errors.id && <span>{errors.id.message}</span>}
                                    </TableCell>
                                    <TableCell>
                                        <InputField
                                            size="small"
                                            disabled={true}
                                            placeholder="Item code"
                                            register={register("item_code", { required: false })}
                                        />
                                        {errors.id && <span>{errors.id.message}</span>}
                                    </TableCell>
                                    <TableCell>
                                        <SelectField
                                            size="small"
                                            options={products}

                                            selected={serviceItem}
                                            onSelect={handleServiceSelect}
                                            //  error={errors?.service?.message}
                                            register={register("service", {
                                                required: false,
                                            })}
                                        />
                                        {errors.service && <span style={{ color: "red" }}>{errors.service.message}</span>}
                                    </TableCell>
                                    <TableCell>
                                        <SelectField
                                            size="small"

                                            options={costCenters}
                                            selected={selectedCostCenter}
                                            onSelect={(value) => {
                                                setSelectedCostCenter(value)

                                            }}
                                            register={register("costcenter", { required: " required" })}


                                        />
                                        {errors.costcenter && <span style={{ color: "red" }}>{errors.costcenter.message}</span>}
                                    </TableCell>
                                    <TableCell>
                                        <InputField
                                            size="small"
                                            disabled={detail?.is_paid}
                                            placeholder="Quantity"
                                            type="number"
                                            register={register("quantity", { required: false })}
                                        />
                                        {errors.quantity && <span style={{ color: "red" }}>{errors.quantity.message}</span>}
                                    </TableCell>

                                    <TableCell>
                                        <InputField
                                            size="small"

                                            placeholder="Charges"

                                            register={register("charges", { required: false })}

                                        />
                                        {errors.charges && <span style={{ color: "red" }}>{errors.charges.message}</span>}

                                    </TableCell>

                                    <TableCell>
                                        <InputField
                                            size="small"
                                            placeholder=" Description"

                                            register={register("description", {
                                                required: false,
                                            })}
                                        />
                                        {errors.descriptions && (
                                            <span style={{ color: "red" }}>
                                                {errors.description.message}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <InputField
                                            size="small"
                                            placeholder=" Ref "

                                            register={register("ref", {
                                                required: settings?.required_ref ? 'Reference no is required' : false,
                                            })}
                                        />
                                        {errors.ref && (
                                            <span style={{ color: "red" }}>
                                                {errors.ref.message}
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <InputField
                                            disabled={true}
                                            style={{ border: "none" }}
                                            size="small"
                                            placeholder=""
                                            register={register("total")}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {(!editState && !detail?.is_paid) && <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => addItem(serviceItem, selectedCostCenter,getValues('quantity'), getValues('charges'), getValues('description'), getValues('ref'), getValues('total'))}
                                            sx={{
                                                textTransform: 'capitalize',
                                                backgroundColor: "#001f3f",
                                                fontSize: "12px",
                                                ":hover": {
                                                    backgroundColor: "#001f3f",
                                                },
                                            }}
                                        >
                                            <AddIcon />
                                        </Button>}
                                        {editState && <> <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => updateItem(serviceItem, selectedCostCenter,getValues('quantity'), getValues('charges'), getValues('description'), getValues('ref'), getValues('total'))}
                                            sx={{
                                                textTransform: 'capitalize',
                                                backgroundColor: "#001f3f",
                                                fontSize: "12px",
                                                ":hover": {
                                                    backgroundColor: "#001f3f",
                                                },
                                            }}
                                        >
                                            Update
                                        </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"

                                                onClick={() => {
                                                    setEditState(false)

                                                    setValue("id", '');
                                                    setValue("item_code", '');
                                                    setValue("govt_fee", '');
                                                    setValue("center_fee", '');
                                                    setValue("charges", '');
                                                    setValue("transaction_id", '');
                                                    setValue("application_id", '');
                                                    setValue("ref_no", '');
                                                    setServiceItem(null);
                                                    setValue("quantity", '');
                                                }}
                                                sx={{
                                                    mt: 2,
                                                    textTransform: 'capitalize',
                                                    backgroundColor: "#001f3f",
                                                    fontSize: "12px",
                                                    ":hover": {
                                                        backgroundColor: "#001f3f",
                                                    },
                                                }}
                                            >
                                                Cancel
                                            </Button></>}
                                    </TableCell>
                                </TableRow>}

                                {rows?.length > 0 && rows?.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ display: "none" }}>{item?.id}</TableCell>
                                        <TableCell>{item?.product_id}</TableCell>
                                        <TableCell>{item?.selectedService?.name}</TableCell>
                                        <TableCell>{item?.cost_center}</TableCell>
                                        <TableCell>{item?.quantity}</TableCell>

                                        <TableCell>{item?.charge}</TableCell>
                                        <TableCell>{item?.description}</TableCell>
                                        <TableCell>{item?.ref}</TableCell>

                                        <TableCell>{item?.total}</TableCell>
                                        <TableCell><Box sx={{ display: 'flex', gap: 1 }}>

                                            {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => {
                                                setSelectedRow(item); setEditState(true)
                                                console.log(item);

                                                setValue("id", item?.product_id);
                                                setValue("item_code", item?.product_id);
                                                setValue("description", item?.description);
                                                setValue("ref", item?.ref);
                                                setValue("charges", item?.charge);

                                                setValue("ref_no", item?.ref_no);
                                                setValue("service", item?.service);
                                                setServiceItem(item?.selectedService);
                                                setValue("quantity", item?.quantity);
                                                console.log(item?.service)
                                                setSelectedCostCenter({id:item?.cost_center,name:item?.cost_center})

                                            }} src={Images.editIcon} width={'35px'}></Box>}
                                            <Box>
                                                {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => {

                                                    let selectedID = item?.id
                                                    setRows(rows?.filter(item2 => item2?.id != item?.id))
                                                    let filteredData = rows?.filter(item2 => item2?.id != item?.id)
                                                    // 👇 Calculate total after updating rows
                                                    const total = filteredData.reduce((sum, item) => {
                                                        // Replace `item.amount` with the correct field to total (e.g., item.price or item.total)
                                                        return sum + (parseFloat(item.total) || 0);
                                                    }, 0);

                                                    console.log("New total after update:", total);

                                                    // You can update a state for total if you have one:
                                                    setSubTotal(total); // <-- Make sure to declare this with useState
                                                }} width={'35px'}></Box>}


                                            </Box>

                                        </Box></TableCell>
                                    </TableRow>
                                ))}

                                <TableRow>
                                    <TableCell colSpan={7} align="right">
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>Sub-total:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>{subTotal}</Typography> {/* Display the Sub-total */}
                                    </TableCell>
                                </TableRow>

                                <TableRow>

                                    <TableCell colSpan={7} align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <Switch
                                                checked={isVatApplicable}
                                                onChange={(e) => setIsVatApplicable(e.target.checked)}
                                                color="primary"
                                            />
                                            <Typography variant="h6" sx={{ fontSize: "15px" }}>Total Vat:</Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                                            {isVatApplicable
                                                ? parseFloat(parseFloat(subTotal) * 0.05).toFixed(2)
                                                : "0.00"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell colSpan={7} align="right">
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>Amount Total:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>
                                            {(
                                                parseFloat(subTotal) +
                                                (isVatApplicable ? parseFloat(subTotal) * 0.05 : 0)
                                            ).toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell colSpan={10} align="right">
                                        <Grid container gap={2} justifyContent={"center"}>
                                            {/* <Button
                                                onClick={() => setPayButton(true)}
                                                disabled={rows?.length == 0}
                                                variant="contained"
                                                sx={{
                                                    textTransform: "capitalize",
                                                    backgroundColor: "#001f3f",
                                                    width: "200px",
                                                    ":hover": {
                                                        backgroundColor: "#001f3f",
                                                    },
                                                }}
                                            >
                                                Pay
                                            </Button> */}
                                            {console.log(selectedCustomer, 'selectedCustomer')
                                            }
                                            {!payButton && <Button
                                                disabled={rows?.length == 0}
                                                type="submit"
                                                variant="contained"
                                                sx={{
                                                    textTransform: "capitalize",
                                                    backgroundColor: "#001f3f",
                                                    width: "200px",
                                                    ":hover": {
                                                        backgroundColor: "#001f3f",
                                                    },
                                                }}
                                            >
                                                Mark As Unpaid
                                            </Button>}
                                            <Button
                                                onClick={() => { setPayButton(false); setPayments([]) }}
                                                variant="contained"
                                                sx={{
                                                    textTransform: "capitalize",
                                                    backgroundColor: "#001f3f",
                                                    width: "200px",
                                                    ":hover": {
                                                        backgroundColor: "#001f3f",
                                                    },
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {payButton && (
                        <Grid container mt={2} spacing={2}>
                            <Grid item md={3} sm={12} xs={12}>
                                <InputField
                                    label="Total Amount"
                                    size="small"
                                    disabled={true}
                                    placeholder="Total Amount"
                                    register={register1("total", {
                                        required: "please enter total .",
                                    })}
                                    error={errors1?.total?.message}
                                />
                            </Grid>
                            {/* <Grid item md={3} sm={12} xs={12}>
                                <InputField
                                    label="Additional Percentage"
                                    size="small"
                                    disabled={payments.length > 0}
                                    placeholder="Additional Percentage"
                                    register={register1("percentage", {
                                        required: false,
                                        onChange: (e) => {
                                            const percentage = parseFloat(e.target.value) || 0;
                                            const totalAmount = parseFloat(getValues1("total")) || 0;

                                            const additionalCharges = (totalAmount * percentage) / 100;

                                            console.log("Additional Charges:", additionalCharges.toFixed(2));

                                            setValue1("additionalCharges", additionalCharges.toFixed(2));
                                            setValue1('finalTotal', parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharges)).toFixed(2))
                                            setValue1('balance', parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharges)).toFixed(2))
                                            setValue1('payamount', parseFloat(parseFloat(getValues1('total')) + parseFloat(additionalCharges)).toFixed(2))
                                        },
                                    })}
                                    error={errors1?.percentage?.message}
                                />
                            </Grid>


                            <Grid item md={3} sm={12} xs={12}>
                                <InputField
                                    label="Additional Charges"
                                    size="small"
                                    disabled={true}
                                    placeholder="Additional Charges"
                                    register={register1("additionalCharges", {
                                        required: false,
                                    })}
                                    error={errors1?.additionalCharges?.message}
                                />
                            </Grid> */}
                            <Grid item md={3} sm={12} xs={12}>
                                <InputField
                                    label="Final Total"
                                    size="small"
                                    disabled={true}
                                    placeholder="Final Total"
                                    register={register1("finalTotal", {
                                        required: "please enter finalTotal .",
                                    })}
                                    error={errors1?.finalTotal?.message}
                                />
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                                <InputField
                                    label="Paid Amount"

                                    disabled={true}
                                    size="small"
                                    placeholder="Enter amount"

                                    register={register1("paidamount", {
                                        required: false,

                                    })}
                                    error={errors1?.paidamount?.message}
                                />
                            </Grid>
                            <Grid item md={3} sm={12} xs={12}>
                                <InputField
                                    label="Balance Amount"
                                    size="small"
                                    disabled={true}
                                    placeholder="Balance Amount"
                                    register={register1("balance", {
                                        required: "please enter balance .",
                                    })}
                                    error={errors1?.balance?.message}
                                />
                            </Grid>


                            <Grid container p={2} spacing={2}>
                                <Grid item md={3} sm={12} xs={12}>
                                    <InputField
                                        label="Amount"
                                        size="small"

                                        placeholder="Amount"
                                        register={register1("payamount", {
                                            required: false,
                                        })}
                                        error={errors1?.payamount?.message}
                                    />
                                </Grid>
                                {(
                                    <Grid item xs={3.8} >
                                        <SelectField
                                            size="small"
                                            options={accounts}
                                            label={'Select Account *:'}
                                            selected={selectedAccount}
                                            onSelect={(value) => {
                                                setSelectedAccount(value)
                                                console.log(value);

                                                getChildAccounts(value?.id)

                                            }}
                                            error={errors?.account?.message}
                                            register={register("account", {
                                                required: false,
                                            })}
                                        />
                                    </Grid>
                                )}
                                <Grid item md={12} sm={12} xs={12}>
                                    <Button
                                        onClick={() =>
                                            addPayments(
                                                getValues1("payamount"),


                                                selectedAccount
                                            )
                                        }

                                        variant="contained"
                                        sx={{
                                            textTransform: "capitalize",
                                            backgroundColor: "#001f3f",
                                            width: "200px",
                                            ":hover": {
                                                backgroundColor: "#001f3f",
                                            },
                                        }}
                                    >
                                        Add New Method
                                    </Button>


                                </Grid>
                                <Typography variant="body1" sx={{ p: 2, fontWeight: 'bold', mt: 2 }} color="initial">

                                    Payment Details
                                </Typography>

                                <Grid container mt={2} p={2}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                                        {payments.map((payment, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: 2,
                                                    width: '30%',
                                                    p: 2,
                                                    mb: 1,
                                                    backgroundColor: '#f9f9f9',
                                                    position: 'relative',
                                                }}
                                            >
                                                <IconButton
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                                    onClick={() => {
                                                        const updatedPayments = payments.filter((_, i) => i !== index);
                                                        setPayments(updatedPayments);
                                                    }}
                                                >
                                                    <DeleteIcon color="error" fontSize="small" />
                                                </IconButton>

                                                <Typography variant="body1"><strong>Amount:</strong> {payment.amount}</Typography>
                                                <Typography variant="body1"><strong>Account Name:</strong> {payment.payment_mode}</Typography>
                                                {payment.mode === 'Bank' && (
                                                    <Typography variant="body1"><strong>Bank:</strong> {payment.bank?.name || payment.bank}</Typography>
                                                )}
                                                {payment.mode === 'Card' && (
                                                    <Typography variant="body1"><strong>Card:</strong> {payment.card?.name || payment.card}</Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid>

                                </Grid>
                            </Grid>
                            <Grid container justifyContent={"flex-end"} mt={2} pr={2}>
                                <Button
                                    type="submit"
                                    disabled={rows?.length == 0 || buttonDisabled}
                                    variant="contained"
                                    sx={{
                                        textTransform: "capitalize",
                                        backgroundColor: "#001f3f",
                                        ":hover": {
                                            backgroundColor: "#001f3f",
                                        },
                                    }}
                                >
                                    Create Receipt
                                </Button>
                            </Grid>
                        </Grid>
                    )}



                </Box>
            </Box>

        </>
    );
}

export default CreateFixedAssetInvoice;
