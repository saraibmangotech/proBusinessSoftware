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
import { Link, useNavigate, useParams } from "react-router-dom";
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
// import { TableBody, TableHead } from "mui-datatables";

function UpdatePurchaseInvoice() {
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
        const grandTotal = rows?.reduce((acc, item) => acc + parseFloat(item.total), 0);

        console.log(grandTotal); // Output: 100
        setValue1('total', parseFloat((parseFloat(grandTotal) * 0.05) + parseFloat(grandTotal)).toFixed(2))
        setValue1('finalTotal', parseFloat((parseFloat(grandTotal) * 0.05) + parseFloat(grandTotal)).toFixed(2))
        setValue1('balance', parseFloat((parseFloat(grandTotal) * 0.05) + parseFloat(grandTotal)).toFixed(2))
        setValue1('paidamount', 0)
    }, [rows]);
    useEffect(() => {
        console.log(payments, 'paymentspaymentspayments');
        const grandTotal = payments.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        console.log(grandTotal);
        setValue1('balance', parseFloat(getValues1('finalTotal')) - parseFloat(grandTotal))
        setValue1('paidamount', grandTotal)

        // setValue1('total', parseFloat((parseFloat(grandTotal)*0.05)+parseFloat(grandTotal)).toFixed(2))
        // setValue1('finalTotal', parseFloat((parseFloat(grandTotal)*0.05)+parseFloat(grandTotal)).toFixed(2))
    }, [payments]);

    const addItem = (item, quantity, charges, description, ref, total) => {
        console.log(item?.impact_account_id);
    
        // Parse numeric inputs
        const parsedQuantity = parseFloat(quantity);
        const parsedCharges = parseFloat(charges);
        const parsedTotal = parseFloat(total);
    
        // Basic required field validation
        if (!item || quantity === "" || charges === "") {
            showErrorToast("Item, quantity, and charges are required!");
            return;
        }
    
        // Check for negative values
        if (parsedQuantity < 0 || parsedCharges < 0 || parsedTotal < 0) {
            showErrorToast("Quantity, charges, and total must be 0 or greater!");
            return;
        }
    
        // Check for consistent impact account ID
        if (rows.length > 0) {
            let firstImpactAccountId = rows[0].item?.impact_account_id;
            if (!firstImpactAccountId) {
                firstImpactAccountId = rows[0].product?.impact_account_id
            }
            console.log("🚀 ~ addItem ~ firstImpactAccountId:", rows)
            if (item?.impact_account_id !== firstImpactAccountId) {
                showErrorToast("You cannot add items with a different impact account.");
                return;
            }
        }
    
        // Check for duplicate product
        const isDuplicate = rows.some(row => row.product_id === serviceItem?.id);
        if (isDuplicate) {
            showErrorToast("This product has already been added.");
            return;
        }
    
        // Create a new row
        const newRow = {
            product_id: serviceItem?.id,
            item,
            quantity: parsedQuantity,
            charge: parsedCharges,
            description,
            ref,
            total: parsedTotal,
            selectedService: serviceItem
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
    };
    

    const { id } = useParams()
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
    const [services, setServices] = useState([]);
    const [serviceItem, setServiceItem] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detail, setDetail] = useState(null);
    const [holdState, setHoldState] = useState(true);
    const [vendors, setVendors] = useState([])
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [products, setProducts] = useState([])
    // const [fieldsDisabled, setFieldsDisabled] = useState(false)

    //documents array

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };


    const generatePDF = async () => {
        if (!invoiceRef.current) return;

        // Temporarily show the content while generating the PDF
        const invoiceElement = invoiceRef.current;
        invoiceElement.style.display = "block"; // Show the element

        // Capture the content using html2canvas
        const canvas = await html2canvas(invoiceElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // A4 dimensions: 210mm × 297mm
        const pageWidth = 210;
        const pageHeight = 297;

        // Calculate dimensions to fit content on page with margins
        const margin = 14; // 14mm margins
        const contentWidth = pageWidth - (margin * 2);

        // Calculate height while maintaining aspect ratio
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if content would exceed page height and scale if necessary
        const availableHeight = pageHeight - (margin * 2);
        const scale = contentHeight > availableHeight ? availableHeight / contentHeight : 1;

        // Calculate final dimensions
        const finalWidth = contentWidth * scale;
        const finalHeight = contentHeight * scale;

        // Add image to the PDF with margins
        pdf.addImage(imgData, "PNG", margin, margin, finalWidth, finalHeight);

        const blob = pdf.output("blob");

        // Create a blob URL
        const blobUrl = URL.createObjectURL(blob);

        // Open the PDF in a new tab
        window.open(blobUrl);
        navigate('/pre-sales')
        // Restore the content visibility after generating the PDF
        invoiceElement.style.display = "none"; // Hide the element again
    };

    console.log(errors1, 'watch1watch1');

    const submitForm1 = async (formData) => {
        console.log(formData, "objobjj")
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const paymentModesString = payments.map((item) => item.payment_mode).join(", ");

        console.log(paymentModesString); // Output: "Cash, Bank, Card"
        getValues1('total')
        console.log(existingTotal, 'existingTotal');
        console.log(getValues1('finalTotal'), 'existingTotal');
        let newTotal = parseFloat(getValues1('finalTotal'))
        console.log(newTotal, 'existingTotal');
        if (existingTotal <= newTotal) {
            console.log('existingTotalexistingTotalexistingTotal');

            setButtonDisabled(true)
            try {
                const obj = {
                    id: id,
                    vendor_id: selectedVendor?.id,
                    total_charges: subTotal,
                    tax: parseFloat(subTotal) * 0.05,
                    items: rows,
                    purchase_date: moment(date).format('MM-DD-YYYY'),
                    invoice_number: formData?.invoiceNumber,
                    ref_invoice_number: formData?.refInvoiceNumber,
                    invoice_prefix: formData?.invoicePrefix,
                    additional_charges_percentage: formData?.percentage,
                    additional_charges_value: formData?.additionalCharges,
                    paid_amount: existingTotal,
                    total_amount: getValues1('finalTotal'),
                    payment_mode: paymentModesString,
                    payment_status: existingTotal == newTotal ? 'Paid' : 'Partial',
                    is_paid: existingTotal == newTotal ? true : false,
                    payment_methods: payments
                }

                console.log(obj, "objobj")
                if (detail?.is_paid == true) {
                    ErrorToaster("Already paid")
                } else {
                    const promise = CustomerServices.UpdatePurchaseInvoice(obj)
                    const response = await promise
                    showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
                    if (response?.responseCode === 200) {
                        navigate('/purchase-invoices')
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

    const addPayments = (amount, mode, bank, card, code, submit = null) => {
        const total = parseFloat(getValues1("finalTotal")) || 0;


        // Convert amount to number for calculation
        const currentAmount = parseFloat(amount) || 0;

        // Calculate current total of payments
        const existingTotal = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        // Check if new total will exceed
        if (existingTotal + currentAmount > total) {
            showErrorToast("Total payment exceeds the required amount.");
            return;
        }

        // Validation
        if (!amount) {
            showErrorToast("Amount is required");
            return;
        }

        if (parseFloat(amount) == 0) {
            showErrorToast("Amount is 0");
            return;
        }


        if (!mode) {
            showErrorToast("Payment mode is required");
            return;
        }

        if (mode === "Bank" && !bank) {
            showErrorToast("Bank is required for Bank mode");
            return;
        }

        if (mode === "Card" && !card) {
            showErrorToast("Card is required for Card mode");
            return;
        }
        if (mode === "Card" && !code) {
            showErrorToast("Authorization code is required for Card mode");
            return;
        }
        const paymentObj = {
            amount: currentAmount,
            payment_mode: mode,
            account_id: mode === "Bank" ? bank?.account_id : mode === "Card" ? card?.account_id : mode === "Cash" ? 700117 : 700171,
            ref_id: mode === "Bank" ? bank?.id : mode === "Card" ? card?.id : null,
            ref_name: mode === "Bank" ? bank?.name : mode === "Card" ? card?.name : null,

        };

        setPayments((prev) => [...prev, paymentObj]);
        //setValue1('payamount', '')

        setSelectedBank(null)
        setSelectedCard(null)
        setValue1('authCode', '')
        // setValue1("payment", { id: "Cash", name: "Cash" })
        // setSelectedMode({ id: "Cash", name: "Cash" })
    };



    // *For Get Account
    const getReceptionDetail = async (value) => {
        setFieldsDisabled(true);

        try {
            let params =
                value === "token"
                    ? { token_number: getValues1("token") }
                    : { mobile: getValues1("mobileValue") };

            const { data } = await CustomerServices.getReceptionDetail(params);
            if (!data.token) {
                ErrorToaster("Token might be expired or invalid");
                return;

            }
            if (data?.token?.created_at) {
                const tokenDate = moment(data.token.created_at);
                const today = moment().startOf('day');
                if (!tokenDate.isSame(today, 'day')) {
                    ErrorToaster("Token might be expired or invalid");
                    return;
                }
            }
            console.log(data, "dataaa");
            setDetail(data?.token);
            setSelectedCustomer({ id: data?.token?.customer_id, name: data?.token?.customer?.name });
            setValue1("customer", { id: data?.token?.customer_id, name: data?.token?.customer?.name });
            //setValue1("customer", data?.token?.customer_name);
            setValue1("invoice_date", moment().toDate());
            setValue1("mobile", data?.token?.mobile);
            setValue1("ref", data?.token?.reference);
            setValue1("display_customer", data?.token?.customer_name);
            setValue1("email", data?.token?.email);
            setValue1("address", data?.token?.address);
            if (value === "token") {
                setValue1("mobileValue", data?.token?.mobile);
            }
            else {
                setValue1("token", data?.token?.token_number);
            }



            setAccounts(data?.accounts?.rows);

            getServiceItem(data?.token?.service_category?.id);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };

    const getServiceItem = async (id) => {
        console.log(user, 'useruser');

        // setLoader(true)
        try {

            const categoryIds = user?.categories?.map(category => category?.category_id).join(',');
            console.log(categoryIds, "cats");
            let params = {
                page: 1,
                limit: 999999,
                category_id: categoryIds,
            };

            const { data } = await CustomerServices.getServiceItem(params);

            const mappedServices = data?.rows?.map(item => ({
                ...item,
                name: `${item.name} - ${item.name_ar}`,
            }));

            setServices(mappedServices);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
    };
    const getInvoiceNumber = async () => {
        // setLoader(true)
        try {
            const { data } = await CustomerServices.getInvoiceNumber();

            console.log(data);
            setValue1("invoice_no", `SR/${data?.next_invoice_number}`);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            // setLoader(false)
        }
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


    const getAccounts = async (page, limit, filter) => {
        // setLoader(true)
        try {
            let params = {
                page: 1,
                limit: 999999,
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
    // *For Get Account
    const getReceiptDetail = async (state) => {
        setFieldsDisabled(true);
        try {
            let params = {
                token_number: getValues1("token"),
                invoice_date: date,
            };

            const { data } = await CustomerServices.getReceiptDetail(params);
            console.log(data);
            if (data?.receipt) {
                setHoldState(true);

                showErrorToast("Invoice already exist with this token number");
            } else {
                getReceptionDetail("token");
                setHoldState(false);
            }
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
                limit: 999999,
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
    const updateItem = (item2, quantity, charges, description, ref, total) => {

        console.log("Current serviceItem:", serviceItem);

        // Validation
        if (!item2 || !quantity || !charges) {
            showErrorToast("Item, quantity, and charges are required!");
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
            quantity,
            charge: charges,
            description,
            ref,
            total,
            product_id: serviceItem?.id,
            selectedService: item2
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
        reset();
        setServiceItem(null);
        setEditState(false);
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
    useEffect(() => {
        getProducts()
        getCards()
        getBanks()
        getVendors()
        console.log(user, "user");
        getAccounts();
        getTax();
        getCategories();
        getSystemSettings();
        // getServiceItem();
        getInvoiceNumber();
        setSelectedCustomer({ id: "walkin", name: "Walk-in Customer" });
        setValue1("customer", { id: "walkin", name: "Walk-in Customer" });
        setValue1("cost_center", { id: settings?.cost_center, name: settings?.cost_center })
    }, []);

    const getCustomerDetail2 = async (phone) => {
        try {
            let params = {
                mobile: phone,
            };

            const { data } = await CustomerServices.getCustomerDetail(params);
            let detail = data?.customer;
            console.log(detail);
            setValue1("customer", detail?.token?.customer_name);
            setValue1("invoice_date", moment().toDate());
            setValue1("mobile", detail?.token?.mobile);
            setValue1("ref", detail?.token?.reference);
            setValue1("display_customer", detail?.token?.customer_name);
            setValue1("email", detail?.token?.email);
            setValue1("address", detail?.token?.address);

            setAccounts(detail?.accounts?.rows);

            getServiceItem(detail?.token?.service_category?.id);
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    const getData = async () => {
        try {
            let params = {
                id: id
            };

            const { data } = await CustomerServices.getPurchaseInvoiceDetail(params);

            let detail = data?.invoice


            //setCategories(data?.categories)

            console.log(detail);
            const updatedItems = detail?.invoice_items?.map(item => ({
                ...item,
                selectedService: item.product,
                total: parseFloat(item.charge) * parseInt(item.quantity)
            }));
            const grandTotal = updatedItems.reduce((sum, item) => {
                return sum + (parseFloat(item.total) || 0);
            }, 0);

            console.log("Grand Total:", grandTotal.toFixed(2));
            setSubTotal(grandTotal.toFixed(2))
            console.log(updatedItems,"updatedItems");
            setRows(updatedItems)
            setSelectedVendor(detail?.vendor)
            setValue1('vendor', detail?.vendor)
            setValue1('invoiceNumber', detail?.invoice_number)
            setValue1('refInvoiceNumber', detail?.ref_invoice_number)
            console.log(detail?.vendor?.name);

            setValue1('name', detail?.vendor?.name)
            setValue1('mobile', detail?.vendor?.phone)
            setValue1('email', detail?.vendor?.email)
            setValue1('address', detail?.vendor?.address)
            // setCategories(detail?.commission_settings)




        } catch (error) {
            console.error("Error fetching location:", error);
        }
    };
    useEffect(() => {
        getData()
    }, [])

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
                                Update Purchase Invoice
                            </Typography>

                        </Box>

                        <Box sx={{ p: 3, border: '1px solid black', borderRadius: '12px', mb: 2 }}>




                            <Grid container spacing={2} p={2}>
                                <Grid item md={3} sm={5.5} xs={12}>
                                    <DatePicker
                                        label={"Purchase Date "}
                                        value={date}
                                        size={"small"}
                                        disabled={true}
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
                                        disabled={true}
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
                                            required: selectedVendor ? false : 'Vendor is required'
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
                                            required: false
                                        })}
                                        error={errors1?.invoiceNumber?.message}
                                    />
                                </Grid>

                                <Grid item md={3} sm={5.5} xs={12}>
                                    <InputField
                                        label="Ref Invoice Number"
                                        size="small"
                                        placeholder="Invoice Number"
                                        register={register1("refInvoiceNumber", {
                                            required: false
                                        })}
                                        error={errors1?.refInvoiceNumber?.message}
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
                                            pattern: {
                                                value: /^05[0-9]{8}$/,
                                                message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                            },
                                        })}
                                        error={errors1?.mobile?.message}
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
                                    <TableCell sx={{ width: "150px" }}>Qty</TableCell>

                                    <TableCell sx={{ width: "150px" }}> Charges</TableCell>
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
                                            onClick={() => addItem(serviceItem, getValues('quantity'), getValues('charges'), getValues('description'), getValues('ref'), getValues('total'))}
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
                                            onClick={() => updateItem(serviceItem, getValues('quantity'), getValues('charges'), getValues('description'), getValues('ref'), getValues('total'))}
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
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>Total Vat:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>{
                                            parseFloat(parseFloat(subTotal) * 0.05).toFixed(2)}
                                        </Typography> {/* Display the Sub-total */}
                                    </TableCell>
                                </TableRow>
                                {/* Amount Total Row (optional, if needed for the final sum) */}
                                <TableRow>
                                    <TableCell colSpan={7} align="right">
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>Amount Total:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6" sx={{ fontSize: "15px" }}>{
                                            parseFloat(subTotal) +
                                            (parseFloat(subTotal) * 0.05)
                                        }
                                        </Typography> {/* This can be the same as Sub-total */}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={10} align="right">
                                        <Grid container gap={2} justifyContent={"center"}>
                                            <Button
                                                type={'submit'}
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
                                                Update
                                            </Button>
                                            {console.log(selectedCustomer, 'selectedCustomer')
                                            }
                                            {/* {!payButton && <Button
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
                                                                            </Button>} */}

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
                            <Grid item md={3} sm={12} xs={12}>
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
                            </Grid>
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
                                <Grid item md={3} sm={12} xs={12}>
                                    <SelectField
                                        label="Payment Mode"
                                        size="small"
                                        options={[
                                            { id: "Cash", name: "Cash" },
                                            { id: "Bank", name: "Bank" },
                                            { id: "Card", name: "Card" },
                                            { id: "Payment Link", name: "Payment Link" },
                                        ]}
                                        selected={watch1("payment")}
                                        onSelect={(value) => {
                                            setValue1("payment", value)
                                            setSelectedMode(value)
                                        }}
                                        register={register1("payment", {
                                            required: false,
                                        })}
                                        error={errors1?.payment?.message}
                                    />
                                </Grid>
                                {selectedMode?.id == "Bank" && (
                                    <Grid item md={3} sm={12} xs={12}>
                                        <SelectField
                                            label="Banks"
                                            size="small"
                                            options={banks}
                                            selected={selectedBank}
                                            onSelect={(value) => {
                                                setSelectedBank(value)
                                            }}
                                            register={register1("bank", {
                                                required: false,
                                            })}
                                            error={errors1?.bank?.message}
                                        />
                                    </Grid>
                                )}
                                {selectedMode?.id == "Card" && (
                                    <Grid item md={3} sm={12} xs={12}>
                                        <SelectField
                                            label="Card"
                                            size="small"
                                            options={cards}
                                            selected={selectedCard}
                                            onSelect={(value) => {
                                                setSelectedCard(value)
                                            }}
                                            register={register1("card", {
                                                required: false,
                                            })}
                                            error={errors1?.card?.message}
                                        />
                                    </Grid>
                                )}
                                {selectedMode?.id == "Card" && <Grid item md={3} sm={12} xs={12}>
                                    <InputField
                                        label="Authorization Code"
                                        size="small"
                                        placeholder="Authorization Code"
                                        register={register1("remarks", {
                                            required: false,
                                        })}
                                        error={errors1?.remarks?.message}
                                    />
                                </Grid>}
                                <Grid item md={12} sm={12} xs={12}>
                                    <Button
                                        onClick={() => addPayments(getValues1('payamount'), selectedMode?.id, selectedBank, selectedCard, getValues1('remarks'))}

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
                                                <Typography variant="body1"><strong>Mode:</strong> {payment.payment_mode}</Typography>
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

export default UpdatePurchaseInvoice;
