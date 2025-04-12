import React, { Fragment, useEffect, useState } from "react";
import {
    Box,
    Checkbox,
    CircularProgress,
    Dialog,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    tableCellClasses,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    InputLabel,
} from "@mui/material";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import { FontFamily, VccIcon } from "assets";
import Colors from "assets/Style/Colors";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { CircleLoading } from "components/Loaders";
import { CancelOutlined, Edit } from "@mui/icons-material";
import Pagination from "components/Pagination";
import { PrimaryButton } from "components/Buttons";
import { v4 as uuidv4 } from 'uuid';
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import moment from "moment";
import DatePicker from "components/DatePicker";
import { CleanTypes, Debounce, emailRegex, formatPermissionData, getFileSize } from "utils";
import VccServices from "services/Vcc";
import SimpleDialog from "components/Dialog/SimpleDialog";
import SelectField from "components/Select";
import VccPurpose from 'data/Vcc_Purpose';
import Uploading from "components/Uploading";
import instance from "config/axios";
import routes from "services/System/routes";
import UploadFile from "components/UploadFile";
import InputPhone from "components/InputPhone";
import { useNavigate } from "react-router-dom";
import CustomerServices from "services/Customer";
import SystemServices from "services/System";
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from "context/UseContext";
import LockIcon from '@mui/icons-material/Lock';
// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        border: 0,
        textAlign: "center",
        whiteSpace: "nowrap",
        backgroundColor: Colors.primary,
        color: Colors.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        textAlign: "center",
        textWrap: "nowrap",
        padding: '5px !important',

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
        display: 'flex',
        height: 100,
        '& svg': {
            width: '40px !important',
            height: '40px !important'
        }
    },
    anchorLink: {
        textDecoration: 'underline',
        color: Colors.twitter,
        cursor: 'pointer'
    }
})


function MyCustomers() {
    const classes = useStyles();
    const navigate = useNavigate();
    const { user, userLogout } = useAuth();
    const tableHead = [

        "Customer Name",
        "Customer ID",
        "Phone Number",
        "Email",
        "Action"


    ];

    const [visibleColumns, setVisibleColumns] = useState([
        ...Array(tableHead?.length).keys(),
    ]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
        setValue: setValue2,
        reset: reset2,
    } = useForm();
    const {
        register: register3,
        handleSubmit: handleSubmit3,
        formState: { errors: errors3 },
        reset: reset3,
    } = useForm();
    const {
        register: register4,
        handleSubmit: handleSubmit4,
        formState: { errors: errors4 },
        reset: reset4,
    } = useForm();
    const {
        register: register5,
        handleSubmit: handleSubmit5,
        formState: { errors: errors5 },
        reset: reset5,
        control: control5
    } = useForm();
    const {
        register: register6,
        handleSubmit: handleSubmit6,
        formState: { errors: errors6 },
        reset: reset6,
        control: control6
    } = useForm();
    const {
        register: register7,
        handleSubmit: handleSubmit7,
        formState: { errors: errors7 },
        reset: reset7,
        control: control7
    } = useForm();
    const {
        register: register8,
        handleSubmit: handleSubmit8,
        formState: { errors: errors8 },
        control = { control8 },
        reset: reset8,
        control: control8,
        setValue: setValue8,
        getValues: getValues8
    } = useForm();

    // *For Upload File types
    const allowFilesType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']

    const [loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);

    // *For Dialog Box
    const [vccDeclareDialog, setVccDeclareDialog] = useState(false);
    const [vccVatChargesDialog, setVccVatChargesDialog] = useState(false);

    // *For Vehicle List
    const [customerList, setCustomersList] = useState();
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [vccDetail, setVccDetail] = useState();
    const [purposeDialog, setPurposeDialog] = useState(false);
    const [issueLoading, setIssueLoading] = useState(false);

    // *For Countries
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const [vccId, setVccId] = useState();

    // *For Booking Id
    const [bookingId, setBookingId] = useState();

    // *For Customer  Id
    const [customerId, setCustomerId] = useState()

    // *For Customer  phone
    const [customerPhone, setCustomerPhone] = useState()

    const [vin, setVin] = useState()
    // *For Dialog
    const [memoDialog, setMemoDialog] = useState(false);
    const [notificationDialog, setNotificationDialog] = useState(false)
    const [branchDialog, setBranchDialog] = useState(false)
    const [typeDialog, setTypeDialog] = useState(false)

    const [selectedCustomer, setSelectedCustomer] = useState(null)


    const [selectedVccPurpose, setSelectedVccPurpose] = useState(null);

    const [permissionDialog, setPermissionDialog] = useState(false)


    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [vcc, setVcc] = useState(false)
    const [vehicleInvoice, setVehicleInvoice] = useState(false)
    const [shippingInvoice, setShippingInvoice] = useState(false)

    // *For Uploaded Documents
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [documentDetail, setDocumentDetail] = useState([]);
    const [documentLink, setDocumentLink] = useState('')

    const [wholeCustomers, setWholeCustomers] = useState([])

    const [branches, setBranches] = useState([])
    const [selectedBranch, setSelectedBranch] = useState(null)
    const [selectedType, setSelectedType] = useState(null)

    const [declarationDialog, setDeclarationDialog] = useState(false);
    const [customerLoading, setCustomerLoading] = useState(false)

    const [selectAll, setSelectAll] = useState(false)
    const [vccDeposit, setVccDeposit] = useState();

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Handle Date
    const [vccDate, setVccDate] = useState();
    const [vccExpDate, setVccExpDate] = useState();

    // *For Permissions
    const [permissions, setPermissions] = useState();

    // *For Handle Date
    const handleVccDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setVccDate("invalid");
                return;
            }
            setVccDate(newDate);
            setValue("vccDate", newDate);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleVccExpDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setVccExpDate("invalid");
                return;
            }
            setVccExpDate(newDate);
            setValue("vccExpDate", newDate);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Countries
    const getCountries = async () => {
        try {
            const { data } = await SystemServices.getCountries()
            setCountries(data?.nations.rows)
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Get Vcc Vehicle List
    const getBranches = async () => {
        setLoader(true);
        try {


            const { data } = await SystemServices.getBranches();
            setBranches(data?.branches)
            console.log(data, 'data');
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };

    // *For Get Vcc Vehicle List
    const getSubCustomerList = async (page, limit, filter) => {
        setLoader(true);
        try {
            const Page = page ? page : currentPage;
            const Limit = limit ? limit : pageLimit;
            const Filter = { ...filters, ...filter };
            setCurrentPage(Page);
            setPageLimit(Limit);
            setFilters(Filter);
            let params = {
                page: Page,
                limit: Limit,
            };
            params = { ...params, ...Filter };
            console.log(params);
            const { data } = await CustomerServices.getSubCustomerList(params);
            setCustomersList(data?.users?.rows);
            setSelectAll(false)


            setTotalCount(data?.users?.count);
            setPermissions(formatPermissionData(data?.permissions));
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoader(false);
        }
    };
    const handleAllCheck = (value) => {
        console.log(wholeCustomers, 'customerListcustomerList');
        setSelectAll(!selectAll)
        const shallowCopy = [...selectedVehicles];
        if (value) {
            const customerList2 = customerList.map(data => data?.id);
            setWholeCustomers([...selectedVehicles, ...customerList2]);
            console.log([...selectedVehicles, ...customerList2])
            console.log(customerList2);

            setSelectedVehicles(customerList2)
        }
        else {
            console.log(wholeCustomers, 'wholeCustomerswholeCustomers');
            const filteredArray = wholeCustomers.filter(item => !selectedVehicles.includes(item));
            setSelectedVehicles(filteredArray)
        }

    }




    const getSubCustomerPermissions = async (id) => {
        try {
            let params = {
                customer_id: id,

            }
            const { data } = await SystemServices.getSubCustomerPermissions(params)
            console.log(data?.permissions);
            if (data?.permissions) {
                setVcc(data?.permissions?.vcc)
                setVehicleInvoice(data?.permissions?.vehicle_invoice)
                setShippingInvoice(data?.permissions?.shipping_invoice)

                setPermissionDialog(true)
            }
            else {
                setVcc(false)
                setVehicleInvoice(false)
                setShippingInvoice(false)

                setPermissionDialog(true)
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }
    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getSubCustomerList(1, "", data));
    };

    // *For Select and DeSelect Vehicles
    const handleCheck = (data) => {
        console.log(data, 'data');

        try {
            const shallowCopy = [...selectedVehicles];
            const currentIndex = selectedVehicles.findIndex(
                (e) => e === data?.id
            );
            if (currentIndex === -1) {
                shallowCopy.push(data?.id); // Only store the id directly in the array
            } else {
                shallowCopy.splice(currentIndex, 1);
            }
            console.log(shallowCopy, 'shallowCopyshallowCopy');
            setWholeCustomers([...selectedVehicles, ...shallowCopy]);
            setSelectedVehicles(shallowCopy);
        } catch (error) {
            ErrorToaster(error);
        }
    };



    // *For Handle Close Vcc Dialog
    const handleCloseVccDialog = () => {
        reset();
        handleVccDate();
        handleVccExpDate();
    };



    const handleColumnChange = (event) => {
        const selectedColumns = event.target.value;
        // Sort the selected columns to maintain the correct order
        const sortedColumns = selectedColumns.sort((a, b) => a - b);
        setVisibleColumns(sortedColumns);
    };

    const renderCellContent = (colIndex, item, isActive) => {
        console.log(item);
        const date = moment(item?.vcc_expiry_date).format("MM-DD-YYYY");
        const targetDate = moment(date, "MM-DD-YYYY");
        let daysRemaining = targetDate.diff(moment(), "days");
        if (daysRemaining < 0) {
            daysRemaining = 0;
        }
        switch (colIndex) {

            case 0:
                return item?.name ?? "-";
            case 1:
                return "SC-" + item?.id ?? "-";
            case 2:
                return item?.uae_phone ?? "-";
            case 3:
                return item?.email ?? "-";
            case 4:
                return <Box     sx={{cursor:'pointer'}} onClick={() => {

                    setSelectedCustomer(item?.id)
                    setBookingId(item?.id)
                    getSubCustomerPermissions(item?.id)

                }}>
           
                    <IconButton sx={{ bgcolor: Colors.bluishCyan, '&:hover': { bgcolor: Colors.bluishCyan } }}>
                        <LockIcon sx={{ color: Colors.white, height: '16px !important' }} />
                    </IconButton>
                    <Typography variant="body2">
                        Set Permissions
                    </Typography>
                </Box>
                    ;


            default:
                return "-";
        }
    };

    const handleUpload = async (file, docs) => {
        setProgress(0)
        try {
            const formData = new FormData();
            formData.append('document', file);
            const { data } = await instance.post(routes.uploadDocuments, formData, {
                onUploadProgress: (progressEvent) => {
                    const uploadedBytes = progressEvent.loaded;
                    const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

                    setProgress(percentCompleted);
                    setUploadedSize(getFileSize(uploadedBytes))
                },
            });
            if (data) {
                docs[0].isUpload = true
                docs[0].file = data?.data?.nations
                setDocumentDetail(docs)
                setDocumentLink(data?.data?.nations)
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Upload Document
    const handleUploadDocument = async (e) => {
        try {
            e.preventDefault();
            const file = e.target.files[0]
            let arr = [{
                id: uuidv4(),
                name: file?.name,
                file: '',
                type: file?.type.split('/')[1],
                size: getFileSize(file.size),
                isUpload: false
            }]
            if (allowFilesType.includes(file.type)) {
                setDocumentDetail(arr)
                handleUpload(file, arr)
            } else {
                ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }
    // *For Remove Uploaded Document
    const removeDoc = () => {
        try {
            setDocumentDetail([])
            setDocumentLink('')
            setValue2('scanned', '')
        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Create Make
    const createBranch = async (name) => {
        try {
            let obj = {
                name: name,
            };
            const { data } = await SystemServices.createBranch(obj);
            getBranches();
            console.log(data);
            setSelectedBranch(data?.branch);
            setValue("branch", data?.branch?.name);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Issue Vcc
    const CreateMemo = async (formData) => {
        setIssueLoading(true)
        try {
            let obj = {
                users: wholeCustomers,
                title: formData?.Title,
                document: documentLink

            }

            const { message } = await CustomerServices.CreateMemo(obj)
            SuccessToaster(message)
            setMemoDialog(false)
            window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setIssueLoading(false)
        }
    }
    // *For Issue Vcc
    const ChangeBranch = async (formData) => {
        setIssueLoading(true)
        try {
            let obj = {
                users: wholeCustomers,
                branch_id: selectedBranch?.id


            }

            const { message } = await CustomerServices.ChangeBranch(obj)
            SuccessToaster(message)
            setMemoDialog(false)
            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setIssueLoading(false)
        }
    }

    // *For Issue Vcc
    const CreateSubCustomer = async (formData) => {
        setIssueLoading(true)
        console.log(user);
        try {
            let obj = {
                name: getValues8('customerName'),
                uae_phone: formData?.uaeMobile,
                email: getValues8('email'),
                nationality_id: selectedCountry?.id,
                picture: "",
                business_region: "import"


            }
            console.log(obj);
            const { message } = await CustomerServices.CreateSubCustomer(obj)
            SuccessToaster(message)
            setTypeDialog(false)
            getSubCustomerList()
            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setIssueLoading(false)
        }
    }
    // *For Issue Vcc
    const ApplyPermissions = async (formData) => {

        setCustomerLoading(true)
        try {
            let obj = {
                customer_id: selectedCustomer,
                vcc: vcc,
                vehicle_invoice: vehicleInvoice,
                shipping_invoice: shippingInvoice
            }


            const { message } = await SystemServices.ApplyPermissions(obj)
            SuccessToaster(message)
            getSubCustomerList()
            setPermissionDialog(false)

            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setCustomerLoading(false)

        }
    }
    // *For Issue Vcc
    const CreateNotifcation = async (formData) => {
        setIssueLoading(true)
        try {
            let obj = {
                users: wholeCustomers,
                notificationTitle: formData?.Title,
                notificationBody: formData?.Body,
                document: documentLink

            }

            const { message } = await CustomerServices.CreateNotifcation(obj)
            SuccessToaster(message)
            setMemoDialog(false)
            window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setIssueLoading(false)
        }
    }

    useEffect(() => {
        getSubCustomerList();
        getBranches()
        getCountries()
    }, []);

    return (
        <Box sx={{ m: 4 }}>

            <SimpleDialog open={permissionDialog} onClose={() => setPermissionDialog(false)} title={'Permissions'}>
                <Box component="form" onSubmit={handleSubmit4(ApplyPermissions)} >
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12}>
                            <Box>
                                <Checkbox

                                    checked={
                                        vcc
                                    }
                                    onChange={() => setVcc(!vcc)}

                                />
                                Do you want to show the &nbsp;&nbsp;
                                Vehicle Invoice?
                            </Box>
                            <Box>
                                <Checkbox

                                    checked={
                                        vehicleInvoice
                                    }
                                    onChange={() => setVehicleInvoice(!vehicleInvoice)}

                                />
                                Do you want to show the &nbsp;&nbsp;
                                Shipping Invoice?
                            </Box>
                            <Box>
                                <Checkbox

                                    checked={
                                        shippingInvoice
                                    }

                                    onChange={() => setShippingInvoice(!shippingInvoice)}
                                />
                                Do you want to show the &nbsp;&nbsp;
                                Receive Exit Paper?
                            </Box>


                        </Grid>

                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <PrimaryButton
                                fullWidth={true}
                                title="Submit"
                                type='submit'
                                loading={customerLoading}

                            />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog open={typeDialog} onClose={() => setTypeDialog(false)} title={'Create Customer'}>
                <Box component="form" onSubmit={handleSubmit8(CreateSubCustomer)} >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                size={"small"}
                                custom={{ color: '#323B4B' }}
                                label={"Customer Name"}
                                placeholder={"Customer Name"}
                                error={errors8?.customerName?.message}
                                register={register8("customerName", {
                                    required: "Please enter customer name.",
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <InputPhone
                                height={'42px'}
                                label={"Whatsapp Number"}
                                name={"uaeMobile"}

                                disableDropdown={false}
                                countryCodeEditable={true}
                                control={control8}
                                error={errors8?.uaeMobile?.message}
                                rules={{
                                    required: "Please enter your whatsapp number.",
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                label={"Email"}
                                size={'small'}
                                type={"email"}
                                custom={{ color: '#323B4B' }}
                                placeholder={"Email Address"}
                                error={errors8?.email?.message}
                                register={register8("email", {
                                    required: "Please enter your email.",
                                    pattern: {
                                        value: emailRegex,
                                        message: "Please enter a valid email.",
                                    },
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                label={"Nationality"}
                                size={'small'}
                                custom={{ color: '#323B4B' }}
                                options={countries}
                                selected={selectedCountry}
                                onSelect={(value) => setSelectedCountry(value)}
                                error={errors8?.nationality?.message}
                                register={register8("nationality", {
                                    required: "Please select nationality.",
                                })}
                            />
                        </Grid>


                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <PrimaryButton
                                fullWidth={true}
                                title="Submit"
                                type='submit'
                                loading={issueLoading}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>



            <Grid container spacing={1} justifyContent={'space-between'} alignItems={'center'}>
                <Grid item xs={12} sm={3}>
                    <Typography
                        variant="h5"
                        sx={{
                            color: Colors.charcoalGrey,
                            fontFamily: FontFamily.NunitoRegular,
                            mb: 4,
                            mt: 2
                        }}
                    >
                        My Customers
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={9} display={'flex'} justifyContent={"flex-end"} gap={1}>
                    <PrimaryButton

                        title="Create Customer"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            path: { fill: Colors.white },
                        }}
                        startIcon={<PersonIcon />}

                        onClick={() => setTypeDialog(true)}
                    />
                    {/* <PrimaryButton
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Branch"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            path: { fill: Colors.white },
                        }}

                        onClick={() => setBranchDialog(true)}
                    /> */}
                    {/* <PrimaryButton
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Notification"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            path: { fill: Colors.white },
                        }}

                        onClick={() => setNotificationDialog(true)}
                    /> */}
                    {/* <PrimaryButton
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Memo"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            path: { fill: Colors.white },
                        }}

                        onClick={() => setMemoDialog(true)}
                    /> */}

                </Grid>

            </Grid>

            {/* Filters */}
            <Grid container spacing={1}>
                <Grid item xs={12} sm={3}>
                    <InputField
                        size={"small"}
                        label={"Search"}
                        placeholder={"Search"}
                        register={register2("search", {
                            onChange: (e) => handleFilter({ search: e.target.value }),
                        })}
                    />
                </Grid>

            </Grid>



            <Grid item md={11}>
                {customerList && (
                    <Box>
                        <Grid container mb={2}>
                            <Grid item xs={5}>
                                <FormControl>
                                    <InputLabel>Columns</InputLabel>
                                    <Select
                                        size={"small"}
                                        multiple
                                        value={visibleColumns}
                                        label={"Columns"}
                                        onChange={handleColumnChange}
                                        renderValue={() => "Show/Hide"}
                                    >
                                        {tableHead.map((column, index) => {
                                            if (column !== "Select" && column !== "Status") {
                                                return (
                                                    <MenuItem key={index} value={index}>
                                                        <Checkbox
                                                            checked={visibleColumns.includes(index)}
                                                        />
                                                        <ListItemText primary={column} />
                                                    </MenuItem>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {customerList && (
                            <Fragment>
                                <TableContainer
                                    component={Paper}
                                    sx={{
                                        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                        borderRadius: 2,
                                        maxHeight: "calc(100vh - 330px)",
                                    }}
                                >
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        {/* Table Header */}
                                        <TableHead>
                                            <TableRow>
                                                {visibleColumns.map((index) => (
                                                    <Cell key={index}>{tableHead[index] == 'Select' ? <Checkbox
                                                        sx={{ color: 'white !important' }}
                                                        checked={selectAll}
                                                        onChange={() => handleAllCheck(!selectAll)}
                                                    /> : tableHead[index]}</Cell>
                                                ))}
                                            </TableRow>
                                        </TableHead>

                                        {/* Table Body */}
                                        <TableBody>
                                            {!loader ? (
                                                customerList?.length > 0 ? (
                                                    <Fragment>
                                                        {customerList?.map((item, rowIndex) => {
                                                            const isActive = true;
                                                            return (
                                                                <Row
                                                                    key={rowIndex}
                                                                    sx={{
                                                                        bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                                                    }}
                                                                >
                                                                    {visibleColumns.map((colIndex) => (
                                                                        <Cell key={colIndex}>
                                                                            {renderCellContent(
                                                                                colIndex,
                                                                                item,
                                                                                isActive
                                                                            )}
                                                                        </Cell>
                                                                    ))}
                                                                </Row>
                                                            );
                                                        })}
                                                    </Fragment>
                                                ) : (
                                                    <Row>
                                                        <Cell
                                                            colSpan={tableHead.length + 1}
                                                            align="center"
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            No Data Found
                                                        </Cell>
                                                    </Row>
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={visibleColumns?.length + 2}
                                                        align="center"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        <Box className={classes.loaderWrap}>
                                                            <CircularProgress />
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* ========== Pagination ========== */}
                                <Pagination
                                    currentPage={currentPage}
                                    pageSize={pageLimit}
                                    onPageSizeChange={(size) =>
                                        getSubCustomerList(1, size.target.value)
                                    }
                                    tableCount={customerList?.length}
                                    totalCount={totalCount}
                                    onPageChange={(page) => getSubCustomerList(page, "")}
                                />
                            </Fragment>
                        )}

                        {loader && <CircleLoading />}
                    </Box>
                )}
            </Grid>
        </Box>
    );
}

export default MyCustomers;
