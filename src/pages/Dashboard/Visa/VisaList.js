import React, { Fragment, useEffect, useRef, useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    tableCellClasses,
    IconButton,
    CircularProgress,
    Chip,
    Grid,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    Checkbox,
    InputAdornment,
} from "@mui/material";
import {
    AllocateIcon,
    CheckIcon,
    EyeIcon,
    FontFamily,
    Images,
    MessageIcon,
    PendingIcon,
    RequestBuyerIdIcon,
} from "assets";
import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router-dom";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import FinanceStatusDialog from "components/Dialog/FinanceStatusDialog";
import AllocateStatusDialog from "components/Dialog/AllocateStatusDialog";
import AllocateDialog from "components/Dialog/AllocateDialog";
import CustomerServices from "services/Customer";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import {
    CleanTypes,
    Debounce,
    encryptData,
    formatPermissionData,
    getFileSize,
    handleDownload,
    handleExportWithComponent,
} from "utils";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addPermission } from "redux/slices/navigationDataSlice";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { PrimaryButton } from "components/Buttons";
import SelectField from "components/Select";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";
import moment from "moment";
import CommissionServices from "services/Commission";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { adjustSectionValue } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import VisaServices from "services/Visa";
import DatePicker from "components/DatePicker";
import SystemServices from "services/System";
import excelFile from "assets/excel/request_format.csv";
import UploadFile from "components/UploadFile";
import instance from "config/axios";
import routes from "services/System/routes";
import toast from "react-hot-toast";
import { useAuth } from "context/UseContext";
import ReceiptIcon from "@mui/icons-material/Receipt";
import UploadFileSingle from "components/UploadFileSingle";
import UploadFile2 from "components/UploadFile2";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: "Public Sans",
        border: "1px solid #EEEEEE",
        padding: "15px",
        textAlign: "left",
        whiteSpace: "nowrap",
        color: "#434343",
        paddingRight: "50px",
        background: "transparent",
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: "Public Sans",

        textWrap: "nowrap",
        padding: "5px !important",
        paddingLeft: "15px !important",

        ".MuiBox-root": {
            display: "flex",
            gap: "6px",
            alignItems: "center",
            justifyContent: "center",
            ".MuiBox-root": {
                cursor: "pointer",
            },
        },
        svg: {
            width: "auto",
            height: "24px",
        },
        ".MuiTypography-root": {
            textTransform: "capitalize",
            fontFamily: FontFamily.NunitoRegular,
            textWrap: "nowrap",
        },
        ".MuiButtonBase-root": {
            padding: "8px",
            width: "28px",
            height: "28px",
        },
    },
}));

const useStyles = makeStyles({
    loaderWrap: {
        display: "flex",
        height: 100,
        "& svg": {
            width: "40px !important",
            height: "40px !important",
        },
    },
});

function VisaList() {
    const allowFilesType = ["text/csv"];
    const { state } = useLocation()
    const allowFilesType2 = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "application/pdf",
        "application/vnd.ms-excel",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const { user, userLogout } = useAuth();
    console.log(user);
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
        reset,
        formState: { errors: errors2 },
    } = useForm();
    const {
        register: register3,
        handleSubmit: handleSubmit3,
        setValue: setValue3,
        getValues: getValues3,
        formState: { errors: errors3 },
    } = useForm();
    const {
        register: register4,
        handleSubmit: handleSubmit4,
        setValue: setValue4,
        getValues: getValues4,
        formState: { errors: errors4 },
    } = useForm();
    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [statusDialog, setStatusDialog] = useState(false);
    const [paymentDialog, setPaymentDialog] = useState(false);

    const tableHead = [
        { name: "VR ID.", key: "" },
        { name: "Date", key: "created_at" },
        { name: "Customer", key: "created_at" },
        { name: "Visa Quantity", key: "commission_visa" },
        { name: "Total Amount", key: "commission_monthly" },
        { name: "VAT", key: "" },
        { name: "Deposit Consumed", key: "customerCount" },
        { name: "Payment", key: "" },
        { name: "Actions", key: "" },
    ];

    const [visas, setVisas] = useState([]);

    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState("asc");

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([


    ]);

    const getCustomerQueue = async (page, limit, filter) => {
        // setLoader(true)
        try {
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = { ...filters, ...filter }
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            let params = {
                page: 1,
                limit: 1000,
            }
            params = { ...params, ...Filter }
            const { data } = await CustomerServices.getCustomerQueue(params)
            console.log(data?.rows?.length);

            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    // *For setPermissions
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVisa, setSelectedVisa] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [itemAmount, setItemAmount] = useState();
    const [status, setStatus] = useState();
    const [date, setDate] = useState(null);
    const [date2, setDate2] = useState(null);
    const [date3, setDate3] = useState(null);
    const [paymentType, setPaymentType] = useState(null);
    const [banks, setBanks] = useState([]);
    const [excelDialog, setExcelDialog] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);
    const [excel, setExcel] = useState();
    const [proofAdmin, setProofAdmin] = useState(false);

    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [file, setFile] = useState();
    const [filename, setFilename] = useState();
    const [fileDetail, setFileDetail] = useState();
    const [extension, setExtension] = useState();
    const [documents, setDocuments] = useState([])
    const [proofDialog, setProofDialog] = useState(false);
    const [proofDoc, setProofDoc] = useState();
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [selectedCustomer2, setSelectedCustomer2] = useState(null)
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [wpsList, setWpsList] = useState([])
    const [wpsValid, setWpsValid] = useState(false)
    const [customerDetail, setCustomerDetail] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false);

    const getBanks = async (page, limit, filter) => {
        // setLoader(true)
        try {
            const { data } = await SystemServices.getBanks();

            setBanks(data?.banks);
        } catch (error) {
            showErrorToast(error);
        } finally {
            // setLoader(false)
        }
    };

    // *For Upload Document
    const handleUploadDocument = async (e) => {

        try {
            console.log(e.target.files, 'e.target.files');
            if (e.target.files.length > 0) {

                e.preventDefault();
                const file = e.target.files[0];
                let arr = [
                    {
                        name: file?.name,
                        file: "",
                        type: file?.type.split("/")[1],
                        size: getFileSize(file.size),
                        isUpload: false,
                    },
                ];
                if (allowFilesType.includes(file.type)) {
                    setFile(file);
                    setFileDetail(arr);
                    setIsUploading(false)
                    // handleUpload(file, arr);
                    // const path = await handleUpload(file, arr);
                    // console.log('Uploaded file path:', path);
                    // console.log(path, 'pathpathpath');
                    // return path
                } else {
                    showErrorToast(
                        `Only ${CleanTypes(allowFilesType)} formats is supported`
                    );
                }
            }
        } catch (error) {
            showErrorToast(error);
        }

    };
    // *For Upload Document
    const handleUploadDocument2 = async (e) => {
        try {
            e.preventDefault()
            const files = Array.from(e.target.files)
            const maxSize = 10 * 1024 * 1024 // 10 MB
            const allowedTypes = ["image/jpeg", "image/png", "application/pdf"] // Add or modify as needed

            const uploadPromises = files.map(async (file) => {
                if (file.size > maxSize) {
                    showErrorToast(`File ${file.name} is larger than 10 MB`)
                    return null
                }

                if (!allowedTypes.includes(file.type)) {
                    showErrorToast(`File ${file.name} is not of an allowed type`)
                    return null
                }

                const fileInfo = {
                    name: file.name,
                    file: "",
                    type: file.type.split("/")[1],
                    size: getFileSize(file.size),
                    isUpload: false,
                }

                try {
                    const uploadedPath = await handleUpload2(file, [fileInfo])
                    return uploadedPath
                } catch (uploadError) {
                    showErrorToast(`Failed to upload ${file.name}: ${uploadError.message}`)
                    return null
                }
            })

            const uploadedPaths = await Promise.all(uploadPromises)
            const validPaths = uploadedPaths.filter((path) => path !== null)

            if (validPaths.length === 0) {
                showErrorToast("No files were successfully uploaded")
                return ""
            }

            const pathString = validPaths.join(",")
            console.log("Uploaded file paths:", pathString)
            return pathString
        } catch (error) {
            ErrorToaster(error.message || "An error occurred during file upload")
            return ""
        }
    }

    const handleUpload = async () => {
        setProgress(0);
        let docs = fileDetail;
        console.log(selectedCustomer, 'asdasdas');

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("id", selectedCustomer?.id );
            console.log(file);

            let maxSize = 10 * 1024 * 1024; // 10 MB
            if (file.size > maxSize) {
                showErrorToast("File Size Must Be Less than 10 MB");
                return; // Stop execution if file size is too large
            }

            const { data } = await instance.post(routes.uploadCVS, formData, {
                onUploadProgress: (progressEvent) => {
                    const uploadedBytes = progressEvent.loaded;
                    const percentCompleted = Math.round(
                        (uploadedBytes * 100) / progressEvent.total
                    );

                    setProgress(percentCompleted);
                    setUploadedSize(getFileSize(uploadedBytes));
                    console.log(getFileSize(uploadedBytes));
                },
            });

            // Check if the response is successful
            if (data?.responseCode === 200) {

                docs[0].isUpload = true;
                docs[0].file = data?.data?.nations;
                console.log(data, "Upload successful");
                toast.success("Successfully Updated!");
                setExcel(false);

                setExcelDialog(false);
                setFilename('')
                return data?.data?.path;
            } else {
                console.log('asdasasdasdasdasdad');

                // Handle API response error
                setFilename('')
                setExcel(false);
                setExcelDialog(false)

                showErrorToast(data?.message || "An error occurred during upload.");
            }
        } catch (error) {
            // Handle network or other unexpected errors
            console.error("Upload error:", error);
            setFilename('')
            setExcel(false);
            setExcelDialog(false)

            showErrorToast(error.response?.data?.message || "Something went wrong, please try again.");
        }
    };

    const handleUpload2 = async (file, docs) => {
        setProgress(0);
        try {
            const formData = new FormData();
            formData.append("document", file);
            console.log(file);
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

                console.log(data, "asddasasd");
                return data?.data?.path;
            }
        } catch (error) {
            ErrorToaster(error);
        }
    };
    // *For Get Customer Queue
    const getVisaRequestList = async (page, limit, filter) => {
        // setLoader(true)
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = filter ? { ...filters, ...filter } : null;
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: Limit,
                customer_id: user?.user_type == "C" ? user?.customer_id : null,
            };



            params = { ...params, ...Filter };
            console.log(params, 'params');
            const { data } = await VisaServices.getVisaRequestList(params);
            setVisas(data?.rows);
            setTotalCount(data?.count);

            console.log(formatPermissionData(data?.permissions));

            setPermissions(formatPermissionData(data?.permissions));
            setPermissions(formatPermissionData(data?.permissions));
            data?.permissions.forEach((e) => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            });
        } catch (error) {
            showErrorToast(error);
        } finally {
            // setLoader(false)
        }
    };

    const UpdateStatus = async () => {
        try {
            let obj = {
                status: status.id,
                visa_id: selectedVisa?.id,
            };

            const promise = VisaServices.updateStatus(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false);
                getVisaRequestList();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const UpdatePaymentStatus = async (formData) => {
        setButtonDisabled(true)
        let totalAmount = parseFloat((parseFloat(formData?.amount) * 0.05) + parseFloat(formData?.amount)).toFixed(2)
        try {
            let obj = {
                customer_id: selectedVisa?.customer_id,
                payment_date: date,
                payment_type: paymentType?.name,
                visa_id: selectedVisa?.id,
                amount: paymentAmount,
                bank_id: selectedBank?.id,
                description: formData?.description,
            };

            const promise = VisaServices.updatePaymentStatus(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setPaymentDialog(false);
                getVisaRequestList();
                reset();
                setButtonDisabled(false)
            }
        } catch (error) {
            console.log(error);
        }
    };
    const UpdateProof = async (formData) => {
        try {
            let obj = {
                proof_date: date,
                id: selectedVisa?.id,
                proof_document: proofDoc,
                proof_amount: formData?.amount,
            };

            const promise = VisaServices.UpdateProof(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setProofDialog(false);
                getVisaRequestList();
                reset();
                setProofDoc("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setDate("invalid");
                return;
            }
            setDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleDate2 = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setFromDate("invalid");
                return;
            }
            setFromDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };
    const handleDate3 = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setToDate("invalid");
                return;
            }
            setToDate(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };
    // *For Get Customer Queue
    const getWpsCheck = async (page, limit, filter, id) => {
        // setLoader(true)
        try {
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = { ...filters, ...filter }
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            let params = {
                page: Page,
                limit: 1,
                customer_id: user?.user_type == 'C' ? user?.customer_id : selectedCustomer?.id,


            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.checkWPS(params)
            setWpsValid(data?.wpsRequired)
            console.log(data);
            if (data?.wpsRequired) {
                showErrorToast("You have to create WPS first")
            }
            else {
                handleUpload();
            }

            // if (data?.rows?.length > 0) {

            //     let dateMonth = moment(data?.rows[0]?.date).startOf("month");
            //     let currentMonth = moment().startOf("month");

            //     let diff = currentMonth.diff((dateMonth), 'months')
            //     console.log(diff, 'diff');
            //     if (diff <= 1) {
            //         setWpsValid(true)
            //     }
            //     else {
            //         setWpsValid(false)
            //     }
            // }
            // else {
            //     setWpsValid(true)
            // }


        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateCSV = async () => {
        // const today = moment();
        // const tenthOfMonth = moment().startOf('month').add(9, 'days');
        // let valid = false
        // const date = moment(wpsList?.date);
        // const lastMonth = moment().subtract(1, 'months');
        // console.log(customerDetail, 'customerDetailcustomerDetail');
        // console.log(today.isAfter(tenthOfMonth));
        // console.log(moment(customerDetail?.created_at));
        // console.log(wpsList?.date);
        // const createdAt = moment(customerDetail?.created_at).startOf('day');
        // const today2 = moment().startOf('day');

        // const differenceInDays = today2.diff(createdAt, 'days');

        // console.log(`Difference in days: ${differenceInDays}`);


        // console.log(today.isAfter(tenthOfMonth) && !moment(customerDetail?.created_at).isSame(moment(), 'month') && !wpsList?.date);


        // if (today.isAfter(tenthOfMonth) && !date.isSame(lastMonth, 'month') && wpsList?.date) {


        //     console.log("The 10th date of the current month has passed.");
        //     showErrorToast('You have to create WPS first')
        // }
        // else if ((today.isAfter(tenthOfMonth) && !moment(customerDetail?.created_at).isSame(moment(), 'month')) && !wpsList?.date) {
        //     showErrorToast('You have to create WPS first')

        // }
        // else if (differenceInDays > 40) {
        //     showErrorToast('You have to create WPS first')

        // }

        // else {
        //     handleUpload();
        //     console.log("The 10th date of the current month has not passed yet.");
        // }
        getWpsCheck()

    };


    const updateResult = (key, newResult) => {
        console.log(newResult, 'newResult');
        setProofDoc(newResult)


    };

    // *For Handle Filter
    const handleFilter = () => {
        let data = {
            search: getValues("search"),
            payment_status: selectedStatus?.id,
            customer_id: selectedCustomer2?.id,
            from_date: fromDate,
            to_date: toDate,
        };
        Debounce(() => getVisaRequestList(1, "", data));
    };

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort,
        };
        Debounce(() => getVisaRequestList(1, "", data));
    };

    const downloadExcel = () => {
        fetch(excelFile)
            .then((response) => response.blob())
            .then((blob) => {
                console.log(blob);
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "Format.csv"); // Adjust the filename as needed
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch((error) => console.error("Error downloading Excel file:", error));
    };

    // *For Get Customer Detail
    const getCustomerDetail = async (id, type) => {
        try {
            let params = { customer_id: id };
            if (id) {

                const { data } = await CustomerServices.getCustomerDetail(params);
                console.log(data?.details?.security_deposit_scenario);
                getWPSList(1, 1, {}, id)
                setCustomerDetail(data?.details)

            }


        } catch (error) {
            showErrorToast(error);
        }
    };

    // *For Get Customer Queue
    const getWPSList = async (page, limit, filter, id) => {
        // setLoader(true)
        try {

            let params = {
                page: 1,
                limit: 1,
                customer_id: user?.user_type == 'C' ? user?.customer_id : id,


            }


            const { data } = await CustomerServices.getWPSList(params)
            setWpsList(data?.rows[0])
            if (data?.rows?.length > 0) {

                let dateMonth = moment(data?.rows[0]?.date).startOf("month");
                let currentMonth = moment().startOf("month");

                let diff = currentMonth.diff((dateMonth), 'months')
                console.log(diff, 'diff');
                if (diff <= 1) {
                    setWpsValid(true)
                }
                else {
                    setWpsValid(false)
                }
            }
            else {
                setWpsValid(true)
            }


        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    useEffect(() => {

        getBanks();
        getCustomerQueue()
        if (user?.user_type == 'C') {
            console.log(user, 'user');

            setValue3('customer', user)
            setSelectedCustomer(user)
            getCustomerDetail(user?.customer_id)

        }
        if (state) {
            console.log(state);
            let data = {
                approval_status: state,
            };
            getVisaRequestList(1, "", data);

        }
        else {
            getVisaRequestList();
        }

    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={proofDialog}
                onClose={() => {
                    setDocuments([])
                    setProofDialog(false);
                    reset();
                    setProofDoc("");

                }}
                title={"Proof Of Payment"}
            >
                {!proofAdmin ? (
                    <Box component="form" onSubmit={handleSubmit4(UpdateProof)}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography
                                    sx={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color: Colors.gray,
                                        mt: 1,
                                    }}
                                >
                                    Upload Proof :*{" "}
                                </Typography>
                                <UploadFile2
                                    Memo={true}
                                    updateResult={updateResult}
                                    multiple={true}
                                    accept={allowFilesType2}
                                    error={errors4?.proof?.message}
                                    file={proofDoc}
                                    register={register4("proof", {
                                        required: "Please upload  proof   .",
                                        onChange: async (e) => {
                                            const path = await handleUploadDocument2(e);
                                            if (path) {
                                                setProofDoc(path);
                                            }
                                        },
                                    })}
                                />
                                {/* {proofDoc &&
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Box component={'img'} src={Images.uploadXls} width={'50px'}></Box>
                                    <span style={{ color: 'blue' }}>{filename}</span> </Box>} */}
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <LabelCustomInput
                                    label={"Amount : "}
                                    disabled={true}
                                    StartLabel={"AED"}
                                    register={register4("amount", { required: "Enter  amount" })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <DatePicker
                                    label={"Payment Date :"}
                                    value={date}
                                    size={"small"}
                                    error={errors4?.date?.message}
                                    register={register4("date", {
                                        required: "Please enter  date.",
                                    })}
                                    onChange={(date) => {
                                        handleDate(date);
                                        setValue4("date", date);
                                    }}
                                />
                            </Grid>
                            <Grid container sx={{ justifyContent: "center" }}>
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
                                        onClick={() => {
                                            setProofDialog(false);
                                            reset();
                                            setProofDoc("");
                                        }}
                                        bgcolor={"#FF1F25"}
                                        title="No,Cancel"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box>
                        <Grid container spacing={2}>
                            <Grid container>
                                <Typography
                                    sx={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color: Colors.gray,
                                        mt: 1,
                                    }}
                                >
                                    Upload Proof : {" "}
                                </Typography>
                            </Grid>
                            <Grid container>
                                {documents?.map((document, index) => (

                                    <Grid
                                        item
                                        md={6}
                                        lg={6}
                                        sx={{ cursor: "pointer", display: "flex", gap: "5px", alignItems: 'center' }}
                                        component={"div"}
                                        key={index}
                                        onClick={() => {
                                            console.log(process.env.REACT_APP_IMAGE_BASE_URL);
                                            console.log(document.trim())

                                            const fileName = document.trim().split("_").pop()
                                            if (fileName?.includes("doc") || fileName?.includes("xls")) {
                                                handleDownload(document.trim(), fileName || "")
                                            } else {
                                                window.open(process.env.REACT_APP_IMAGE_BASE_URL + document.trim(), "_blank")
                                            }
                                        }}
                                    >
                                        {console.log(documents)}
                                        {document && (
                                            <Box>
                                                <Box component={'img'} src={Images.docIcon} alt="Document Icon" width={35} height={35} />
                                            </Box>
                                        )}
                                        <p
                                            style={{
                                                textAlign: "center",
                                                lineHeight: "20px",
                                                color: "#0F2772",
                                                fontWeight: "bold",
                                                fontSize: "15px",
                                            }}
                                        >
                                            {document.trim().split("_").pop()}
                                        </p>
                                    </Grid>
                                ))}
                            </Grid>




                            <Grid item xs={12} sm={12}>
                                <LabelCustomInput
                                    value={selectedVisa?.proof_amount}
                                    label={"Amount : "}
                                    StartLabel={"AED"}
                                    disabled={true}
                                    register={register4("amount", { required: "Enter  amount" })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <InputField
                                    label={"Date :"}
                                    size={"small"}
                                    disabled={true}
                                    value={moment(selectedVisa?.proof_date).format("MM-DD-YYYY")}
                                    rows={5}
                                    placeholder={"Description"}
                                    error={errors2?.description?.message}
                                    register={register2("description", {
                                        required: false,
                                    })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )
                }
            </SimpleDialog >
            <SimpleDialog
                open={excelDialog}
                onClose={() => setExcelDialog(false)}
                title={"Upload Excel"}
            >
                <Box component="form" onSubmit={handleSubmit3(UpdateCSV)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} display={'flex'} justifyContent={'center'}>
                            <PrimaryButton
                                bgcolor={'#0076bf'}
                                title="Download Template"
                                onClick={() => downloadExcel()}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <SelectField
                                size={'small'}
                                label={'Select Customer :'}

                                options={customerQueue}
                                disabled={user?.user_type == 'C' ? true : false}
                                selected={selectedCustomer}
                                onSelect={(value) => {
                                    setSelectedCustomer(value)
                                    getCustomerDetail(value?.id)
                                    setValue3('customer', value)

                                }}
                                error={errors3?.customer?.message}
                                register={register3("customer", {
                                    required: 'Please select customer account.',
                                })}
                            />
                        </Grid>
                        {selectedCustomer && <Grid item xs={5}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>Upload CSV :* </Typography>
                            <UploadFileSingle
                                Memo={true}
                                accept={allowFilesType}
                                error={errors3?.excel?.message}
                                disabled={isUploading}

                                register={register3("excel", {
                                    required:

                                        "Please upload  excel   ."
                                    ,
                                    onChange: async (e) => {
                                        setIsUploading(true)
                                        handleUploadDocument(e);

                                        const file = e.target.files[0];
                                        console.log(file);
                                        setFilename(file?.name)
                                        setExcel(file)


                                    }
                                })}

                            />
                            {console.log(excel?.name, 'asdasdasdasd')}
                            {excel?.name &&
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Box component={'img'} src={Images.uploadXls} width={'50px'}></Box>
                                    <span style={{ color: 'blue' }}>{filename}</span> </Box>}
                        </Grid>}
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton className='disbaledClass' bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => { setExcelDialog(false); setExcel(false); setSelectedCustomer(null) }} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={[
                                    { id: "Pending", name: "Pending" },
                                    { id: "Approved", name: "Approved" },
                                    { id: "Rejected", name: "Rejected" },
                                ]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value);
                                }}
                                error={errors?.status?.message}
                                register={register("status", {
                                    required: "Please select status.",
                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: "center" }}>
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
                                    onClick={() => setStatusDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={paymentDialog}
                onClose={() => setPaymentDialog(false)}
                title={"Change Payment Status?"}
            >
                <Box component="form" onSubmit={handleSubmit2(UpdatePaymentStatus)}>
                    <Grid container>
                        <Grid item xs={12} sm={12}>
                            <DatePicker
                                label={"Payment Date :"}
                                value={date}
                                size={"small"}
                                error={errors2?.date?.message}
                                register={register2("date", {
                                    required: "Please enter  date.",
                                })}
                                onChange={(date) => {
                                    handleDate(date);
                                    setValue2("date", date);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Payment Type :"}
                                options={[
                                    { id: "cash", name: "Cash" },
                                    { id: "bank", name: "Bank" },
                                ]}
                                selected={paymentType}
                                onSelect={(value) => {
                                    setPaymentType(value);
                                }}
                                error={errors2?.status?.message}
                                register={register2("status", {
                                    required: "Please select status.",
                                })}
                            />
                        </Grid>
                        {/* <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Bank :'}

                                options={banks}
                                selected={selectedBank}
                                onSelect={(value) => {
                                    setSelectedBank(value)


                                }}
                                error={errors2?.banks?.message}
                                register={register2("bank", {
                                    required: 'Please select bank.',
                                })}
                            />
                        </Grid> */}
                        <Grid item xs={12} sm={12}>
                            <LabelCustomInput
                                label={"Amount : "}
                                StartLabel={"AED"}
                                value={paymentAmount}
                                disabled={true}
                                register={register2("amount", {
                                    required: "Enter year inside rate",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} mt={2}>
                            <InputField
                                label={"Description :"}
                                size={"small"}
                                rows={5}
                                multiline={true}
                                placeholder={"Description"}
                                error={errors2?.description?.message}
                                register={register2("description", {
                                    required: false,
                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: "center" }}>
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
                                    disabled={buttonDisabled}
                                    bgcolor={Colors.primary}
                                    title="Yes,Confirm"
                                    type="submit"
                                />
                                <PrimaryButton
                                    onClick={() => setPaymentDialog(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
                    Visa Requests Management
                </Typography>
                <Box sx={{ display: "flex", gap: "5px" }}>
                    {permissions?.create && (
                        <PrimaryButton
                            bgcolor={Colors.buttonBg}
                            title="Create Request"
                            onClick={() => navigate("/create-request")}
                            loading={loading}
                        />
                    )}
                    {permissions?.excel && (
                        <PrimaryButton
                            bgcolor={"#0076bf"}
                            title="Import Via Excel"
                            onClick={() => {
                                setExcelDialog(true); setSelectedCustomer(null)


                                if (user?.user_type == 'C') {
                                    console.log(user, 'user');
                                    console.log(customerQueue, 'customerQueue');
                                    let newUser = customerQueue?.find(item => item?.id === user?.customer_id);

                                    setValue3('customer', newUser)
                                    console.log(newUser, 'customerQueue');
                                    setSelectedCustomer(newUser)
                                    getCustomerDetail(newUser?.id)

                                }
                            }}
                            loading={loading}
                        />
                    )}
                </Box>
            </Box>

            {/* Filters */}
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <InputField
                            label={"Search :"}
                            size={'small'}
                            fullWidth={true}
                            placeholder={"Search"}
                            error={errors?.search?.message}
                            register={register("search")}
                        />
                    </Grid>
                    {user?.user_type != 'C' && <Grid item xs={2} >
                        <SelectField
                            size={'small'}
                            label={'Select Customer :'}

                            options={customerQueue}
                            selected={selectedCustomer2}
                            onSelect={(value) => {
                                setSelectedCustomer2(value)


                            }}
                            error={errors?.customer?.message}
                            register={register("customer")}
                        />
                    </Grid>}
                    <Grid item xs={2} >
                        <SelectField
                            size={'small'}
                            label={'Select Status :'}

                            options={[{ id: 'paid', name: 'Paid' }, { id: 'unpaid', name: 'Unpaid' }]}
                            selected={selectedStatus}
                            onSelect={(value) => {
                                setSelectedStatus(value)


                            }}
                            error={errors?.status?.message}
                            register={register("status")}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <DatePicker
                            label={" From Date  :"}
                            value={fromDate}

                            size={'small'}
                            maxDate={new Date()}
                            error={errors?.fromDate?.message}
                            register={register("fromDate")}
                            onChange={(date) => {
                                handleDate2(date)
                                setValue('fromDate', date)
                            }

                            }
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <DatePicker
                            label={" To Date  :"}
                            value={toDate}
                            maxDate={new Date()}
                            size={'small'}
                            minDate={new Date(fromDate)}
                            error={errors?.toDate?.message}
                            register={register("toDate")}
                            onChange={(date) => {
                                handleDate3(date)
                                setValue('toDate', date)
                            }

                            }
                        />
                    </Grid>

                </Grid>
                <Grid container spacing={2} justifyContent={'flex-end'}>
                    <Grid
                        item
                        xs={2}
                        display={"flex"}
                        justifyContent={"flex-end"}
                        gap={2}
                    >
                        <PrimaryButton
                            bgcolor={"#0076bf"}
                            textcolor={Colors.white}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => {
                                setSelectedCustomer2(null)
                                setToDate(null)
                                setFromDate(null)
                                setSelectedStatus(null)
                                setValue('status', '')
                                setValue("search", "");
                                getVisaRequestList(1, '', null);
                            }}
                            loading={loading}
                        />
                        <PrimaryButton
                            bgcolor={Colors.buttonBg}
                            title="Search"
                            onClick={() => handleFilter()}
                            loading={loading}
                        />
                    </Grid>
                </Grid>

                <Grid item md={11}>
                    {visas && (
                        <Box>
                            <Grid container mb={2}></Grid>

                            {visas && (
                                <Fragment>
                                    <PDFExport
                                        ref={contentRef}
                                        landscape={true}
                                        paperSize="A4"
                                        margin={5}
                                        fileName="Import Customers"
                                    >
                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                maxHeight: "calc(100vh - 200px)",
                                                mt: 5,
                                                backgroundColor: "transparent",
                                                boxShadow: "none !important",
                                                borderRadius: "0px !important",
                                            }}
                                        >
                                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                                <TableHead>
                                                    <Row>
                                                        {tableHead.map((cell, index) => (
                                                            <Cell
                                                                style={{
                                                                    textAlign:
                                                                        cell?.name == "SR No." ? "center" : "left",
                                                                    paddingRight:
                                                                        cell?.name == "SR No." ? "15px" : "50px",
                                                                }}
                                                                className="pdf-table"
                                                                key={index}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display: "flex",
                                                                        alignItems: "flex-end",
                                                                    }}
                                                                >
                                                                    {cell?.name}{" "}
                                                                    {cell?.name == "Date" && (
                                                                        <>
                                                                            &nbsp;
                                                                            <span
                                                                                style={{
                                                                                    height: "20px",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            >
                                                                                <Box
                                                                                    component={"img"}
                                                                                    onClick={() => {
                                                                                        setSort(
                                                                                            sort == "asc" ? "desc" : "asc"
                                                                                        );
                                                                                        handleSort(cell?.key);
                                                                                    }}
                                                                                    src={Images.sortIcon}
                                                                                    width={"18px"}
                                                                                ></Box>
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            </Cell>
                                                        ))}
                                                    </Row>
                                                </TableHead>
                                                <TableBody>
                                                    {visas?.map((item, index) => {
                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    border: "1px solid #EEEEEE !important",
                                                                }}
                                                            >
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {item?.id}
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {moment(item?.created_at).format(
                                                                        "MM-DD-YYYY"
                                                                    )}
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {item?.customer?.name}
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {item?.candidates_count}
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {item?.total_visa_charges}
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {parseFloat(parseFloat(item?.total_visa_charges) * 0.05).toFixed(2)}
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    {item?.total_deposit_charges}
                                                                </Cell>
                                                                {/* <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box component={'div'} sx={{ cursor: 'pointer' }} onClick={() => {
                                                                        if (user?.user_type != 'C' && permissions?.status_update) {
                                                                            setStatusDialog(true); setSelectedVisa(item); setStatus({ id: item?.processing_status, name: item?.processing_status })
                                                                        }
                                                                    }}>
                                                                        <Box component={'img'} src={item?.processing_status == 'Approved' ? Images.successIcon : item?.processing_status == 'Pending' ? Images.pendingIcon : Images.errorIcon} width={'13px'}></Box>
                                                                        {item?.processing_status}
                                                                    </Box>


                                                                </Cell> */}
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    <Box
                                                                        component={"div"}
                                                                        sx={{ cursor: "pointer" }}
                                                                        onClick={() => {
                                                                            if (
                                                                                user?.user_type != "C" &&
                                                                                item?.payment_status != "paid" &&
                                                                                permissions?.payment_status_update
                                                                            ) {
                                                                                setDate(null);
                                                                                setPaymentType(null);
                                                                                setPaymentDialog(true);
                                                                                setSelectedVisa(item);

                                                                                setValue2(
                                                                                    "amount",
                                                                                    parseFloat((parseFloat(item?.total_visa_charges) * 0.05) + parseFloat(item?.total_visa_charges)).toFixed(2)
                                                                                );
                                                                                setPaymentAmount(
                                                                                    parseFloat((parseFloat(item?.total_visa_charges) * 0.05) + parseFloat(item?.total_visa_charges)).toFixed(2)
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            component={"img"}
                                                                            src={
                                                                                item?.payment_status == 'paid'
                                                                                    ? Images.successIcon
                                                                                    : Images.errorIcon
                                                                            }
                                                                            width={"13px"}
                                                                        ></Box>
                                                                        {item?.payment_status == 'paid' ? "Paid" : "Unpaid"}
                                                                    </Box>
                                                                </Cell>
                                                                <Cell
                                                                    style={{ textAlign: "left" }}
                                                                    className="pdf-table"
                                                                >
                                                                    <Box>
                                                                        {permissions?.payment_proof && (
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    console.log(item?.proof_document);

                                                                                    if (item?.proof_document) {

                                                                                        setDocuments(item?.proof_document?.split(",") || [])
                                                                                    }

                                                                                    if (user?.user_type == "C") {
                                                                                        setDate(null);
                                                                                        setPaymentType(null);

                                                                                        setProofDialog(true);
                                                                                        console.log(selectedVisa?.proof_document?.split(","), 'asdasdas');


                                                                                        setValue4(
                                                                                            "amount",
                                                                                            parseFloat((parseFloat(item?.total_visa_charges) * 0.05) + parseFloat(item?.total_visa_charges)).toFixed(2)
                                                                                        );
                                                                                        setSelectedVisa(item);
                                                                                        setProofAdmin(false);
                                                                                        if (item?.proof_document) {
                                                                                            setProofAdmin(true);
                                                                                        }
                                                                                    } else {
                                                                                        if (item?.proof_document) {
                                                                                            setDate(null);
                                                                                            setPaymentType(null);
                                                                                            setProofDialog(true);

                                                                                            setSelectedVisa(item);
                                                                                            setProofAdmin(true);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <ReceiptIcon
                                                                                    sx={{
                                                                                        color: item?.proof_document
                                                                                            ? "#56ba28"
                                                                                            : "",
                                                                                    }}
                                                                                    width={"35px"}
                                                                                />
                                                                            </IconButton>
                                                                        )}
                                                                        {permissions?.details && (
                                                                            <Box
                                                                                component={"img"}
                                                                                src={Images.detailIcon}
                                                                                onClick={() =>
                                                                                    navigate(`/visa-detail/${item?.id}`)
                                                                                }
                                                                                width={"35px"}
                                                                            ></Box>
                                                                        )}
                                                                        {
                                                                            <Box
                                                                                component={"img"}
                                                                                sx={{ cursor: "pointer" }}
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        `/update-request/${item?.id}`
                                                                                    );
                                                                                    localStorage.setItem(
                                                                                        "currentUrl",
                                                                                        "/update-agent"
                                                                                    );
                                                                                }}
                                                                                src={Images.editIcon}
                                                                                width={"35px"}
                                                                            ></Box>
                                                                        }
                                                                        {permissions?.invoice && (
                                                                            <Box
                                                                                component={"img"}
                                                                                onClick={() =>
                                                                                    navigate(`/view-invoice/${item?.id}`)
                                                                                }
                                                                                sx={{ cursor: "pointer" }}
                                                                                src={Images.invoiceIcon}
                                                                                width={"35px"}
                                                                            ></Box>
                                                                        )}
                                                                        {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
                                                                    </Box>
                                                                </Cell>
                                                            </Row>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </PDFExport>
                                    {/* ========== Pagination ========== */}
                                    <Pagination
                                        currentPage={currentPage}
                                        pageSize={pageLimit}
                                        onPageSizeChange={(size) =>
                                            getVisaRequestList(1, size.target.value, filters)
                                        }
                                        tableCount={customerQueue?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getVisaRequestList(page, "", filters)}
                                    />
                                </Fragment>
                            )}

                            {loader && <CircleLoading />}
                        </Box>
                    )}
                </Grid>
            </Box>
        </Box >
    );
}

export default VisaList;
