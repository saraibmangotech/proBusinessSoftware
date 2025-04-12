import React, { Fragment, useEffect, useRef, useState } from "react";
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
    Tooltip,
} from "@mui/material";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import { FontFamily, NotificationIcon, UploadIcon, UploadMemoIcon, VccIcon } from "assets";
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
import { CleanTypes, Debounce, formatPermissionData, getFileSize, handleExportWithComponent } from "utils";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";

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


function GalaxyCustomers() {
    const classes = useStyles();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const tableHead = [
        "Select",
        "Creator",
        "Customer Name",
        "Customer ID",
        "Phone Number",
        "Email",
        "Customer Type",
        "Region",
        "Branch",
        "Action",

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
        reset: reset8,
        control: control8
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


    const [selectedVccPurpose, setSelectedVccPurpose] = useState(null);

    // *For Pagination
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

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
    const getcustomerList = async (page, limit, filter) => {
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
            const { data } = await CustomerServices.getGalaxyCustomerList(params);
            setCustomersList(data?.customers?.rows);
            setSelectAll(false)


            setTotalCount(data?.customers?.count);
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





    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getcustomerList(1, "", data));
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
        const date = moment(item?.vcc_expiry_date).format("MM-DD-YYYY");
        const targetDate = moment(date, "MM-DD-YYYY");
        let daysRemaining = targetDate.diff(moment(), "days");
        if (daysRemaining < 0) {
            daysRemaining = 0;
        }
        switch (colIndex) {
            case 0:
                return (
                    <Checkbox className="pdf-hide"
                        disabled={item?.customerProfile?.customer_type_id == 4 ? true : false}
                        checked={
                            selectedVehicles.findIndex((e) => e === item?.id) !== -1
                        }
                        onChange={() => handleCheck(item)}
                    />
                );
            case 1:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.creator ? item?.creator?.name : 'Self'}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            {/* {item?.name?.length > 17 ? item?.name?.slice(0, 11) + "..." : item?.name} */}
                            {
                                item?.creator ? (item?.creator?.name.length > 17
                                    ? item?.creator?.name?.slice(0, 11) + "..."
                                    : item?.creator?.name) : 'Self'
                            }
                        </Tooltip>
                        <Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
                            {item?.creator ? item?.creator?.name : 'Self'}
                        </Box>
                    </Box>
                )
            case 2:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.name ?? "-"}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            {/* {item?.name?.length > 17 ? item?.name?.slice(0, 11) + "..." : item?.name} */}
                            {
                                item?.name ? (item?.name?.length > 17
                                    ? item?.name?.slice(0, 11) + "..."
                                    : item?.name) : '-'
                            }
                        </Tooltip>
                        <Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
                            {item?.name ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.name ?? "-";
            case 3:
                return item?.id ?? "-";
            case 4:
                return item?.uae_phone ?? "-";
            case 5:
                return (
                    <Box>
                        <Tooltip
                            className="pdf-hide"
                            title={item?.email ?? '-'}
                            arrow
                            placement="top"
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: "offset",
                                            options: {
                                                offset: [10, -2],
                                            },
                                        },
                                    ],
                                },
                            }}
                        >
                            {/* {item?.name?.length > 17 ? item?.name?.slice(0, 11) + "..." : item?.name} */}
                            {
                                item?.email ? (item?.email.length > 20
                                    ? item?.email?.slice(0, 20) + "..."
                                    : item?.email) : '-'
                            }
                        </Tooltip>
                        <Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
                            {item?.email ?? '-'}
                        </Box>
                    </Box>
                )
            // item?.email ?? "-";
            case 6:
                return item?.customerProfile?.is_trusted ? 'Trusted' : 'Regular' ?? "-";
            case 7:
                return item?.business_region ?? "-";
            case 8:
                return item?.branch ? item?.branch?.name : "-";
            case 9:
                return item?.booking?.vin ?? "-";
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
        const uniqueArray = Array.from(new Set(wholeCustomers));

        try {
            let obj = {
                users: uniqueArray,
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
    const ChangeType = async (formData) => {
        setIssueLoading(true)
        try {
            let obj = {
                users: wholeCustomers,
                is_trusted: selectedType?.id


            }

            const { message } = await CustomerServices.ChangeType(obj)
            SuccessToaster(message)
            setTypeDialog(false)
            // window.location.reload()
        } catch (error) {
            ErrorToaster(error)
        } finally {
            setIssueLoading(false)
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

    const downloadExcel = () => {
        const headers = tableHead.filter((item) => item !== "Action");
        const rows = customerList?.map((item) => [
            item?.name ?? "-",
            item?.id ?? "-",
            item?.uae_phone ?? "-",
            item?.email ?? "-",
            item?.customerProfile?.is_trusted ? 'Trusted' : 'Regular' ?? "-",
            item?.business_region ?? "-",
            item?.branch ? item?.branch?.name : "-",
            item?.booking?.vin ?? "-",
        ])

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(new Blob([buf]), "data.xlsx");
    };

    useEffect(() => {
        getcustomerList();
        getBranches()
    }, []);

    return (
        <Box sx={{ m: 4 }}>

            <SimpleDialog open={memoDialog} onClose={() => setMemoDialog(false)} title={'Upload Memo'}>
                <Box component="form" onSubmit={handleSubmit5(CreateMemo)} >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                size={'small'}
                                label={'Title'}
                                placeholder={'Title'}
                                error={errors5?.Title?.message}
                                register={register5("Title", {
                                    required: 'Please enter Title.'
                                })}
                            />
                        </Grid>


                        <Grid item xs={12} sm={12}>
                            <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                                Upload Scanned Copy
                            </Typography>
                            <UploadFile

                                Memo={true}
                                style={{ backgroundColor: "#e7efeb", width: '100%', height: '200px', display: 'flex', flexDirection: 'column-reverse', padding: '20px', border: '1px dashed #aeb1b0', borderRadius: '10px' }}
                                accept={allowFilesType}
                                register={register2("scanned", {
                                    onChange: (e) => handleUploadDocument(e)
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            {documentDetail.length > 0 &&
                                <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                                    Uploaded Files
                                </Typography>
                            }
                            <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                                {documentDetail?.map((item, index) => (
                                    <Uploading key={index} data={item} uploadedSize={uploadedSize} progress={progress} removeDoc={() => removeDoc()} />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'center' }}>
                            <PrimaryButton
                                fullWidth={true}
                                bgcolor={Colors.tableGradient}
                                title="Upload"
                                type='submit'
                                loading={issueLoading}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog open={notificationDialog} onClose={() => setNotificationDialog(false)} title={'Send Notification'}>
                <Box component="form" onSubmit={handleSubmit6(CreateNotifcation)} >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                size={'small'}
                                label={'Title'}
                                placeholder={'Title'}
                                error={errors6?.Title?.message}
                                register={register6("Title", {
                                    required: 'Please enter Title.'
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                size={'small'}
                                label={'Body'}
                                placeholder={'Body'}
                                error={errors6?.Body?.message}
                                multiline={true}
                                rows={4}
                                register={register6("Body", {
                                    required: 'Please enter Body.'
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
            <SimpleDialog open={branchDialog} onClose={() => setBranchDialog(false)} title={'Branch'}>
                <Box component="form" onSubmit={handleSubmit7(ChangeBranch)} >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Branch'}
                                options={branches}
                                addNew={(newValue) => createBranch(newValue)}
                                selected={selectedBranch}
                                onSelect={(value) => setSelectedBranch(value)}
                                error={errors7?.branch?.message}
                                register={register7("branch", {
                                    required: 'Please select  Branch.',
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
            <SimpleDialog open={typeDialog} onClose={() => setTypeDialog(false)} title={'Customer Type'}>
                <Box component="form" onSubmit={handleSubmit8(ChangeType)} >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Csutomer Type'}
                                options={[{ id: true, name: 'Trusted' }, { id: false, name: 'Regular' }]}

                                selected={selectedType}
                                onSelect={(value) => setSelectedType(value)}
                                error={errors8?.type?.message}
                                register={register8("type", {
                                    required: 'Please select type.',
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
                        Galaxy Customers
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={9} display={'flex'} justifyContent={"flex-end"} gap={1}>
                    <PrimaryButton
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Customer Type"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            backgroundColor: "white",
                            color: "#0c6135",
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
                            ':hover': {
                                color: 'white'
                            },
                            path: { fill: "#0c6135" },
                        }}
                        bgcolor={'white'}
                        onClick={() => setTypeDialog(true)}
                    />
                    <PrimaryButton
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Branch"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            backgroundColor: "white",
                            color: "#0c6135",
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
                            ':hover': {
                                color: 'white'
                            },
                            path: { fill: "#0c6135" },
                        }}
                        bgcolor={'white'}
                        onClick={() => setBranchDialog(true)}
                    />
                    <PrimaryButton
                        className="custom-Button"
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Notification"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            backgroundColor: "white",
                            color: "#0c6135",
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
                            ':hover': {
                                color: 'white'
                            },
                            path: { fill: "#0c6135" },
                        }}
                        bgcolor={'white'}
                        startIcon={<NotificationIcon />}
                        onClick={() => setNotificationDialog(true)}
                    />
                    <PrimaryButton
                        className="custom-Button"
                        disabled={selectedVehicles.length > 0 ? false : true}
                        title="Upload Memo"
                        type="button"
                        buttonStyle={{
                            justifyContent: "space-evenly",
                            backgroundColor: "white",
                            color: "#0c6135",
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
                            ':hover': {
                                color: 'white'
                            },

                            path: { fill: "#0c6135" },

                        }}

                        bgcolor={'white'}
                        startIcon={<UploadMemoIcon />}
                        onClick={() => setMemoDialog(true)}
                    />

                </Grid>

            </Grid>

            {/* Filters */}
            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
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
                {customerList?.length > 0 && (
                    <Box sx={{
                        textAlign: "right", p: 4, display: "flex", gap: 2

                    }}>
                        <PrimaryButton
                            title="Download PDF"
                            type="button"
                            style={{ backgroundColor: Colors.bluishCyan }}
                            onClick={() => handleExportWithComponent(contentRef)}
                        />
                        <PrimaryButton
                            title={"Download Excel"}
                            onClick={() => downloadExcel()}
                        />
                    </Box>
                )}

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
                                <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Galaxy Customers' >
                                    <Box className='pdf-show' sx={{ display: 'none' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                                Galaxy Customers
                                            </Typography>
                                            <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                        </Box>
                                    </Box>
                                    <TableContainer
                                        component={Paper}
                                        sx={{
                                            boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                            borderRadius: 2,
                                            maxHeight: "calc(100vh - 330px)",
                                        }}
                                        className='table-box'
                                    >
                                        <Table stickyHeader sx={{ minWidth: 500 }}>
                                            {/* Table Header */}
                                            <TableHead>
                                                <TableRow className='pdf-table'>
                                                    {visibleColumns.map((index) => (
                                                        <Cell className='pdf-table' key={index}>{tableHead[index] == 'Select' ? <Checkbox className="pdf-hide"
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
                                                                            bgcolor: rowIndex % 2 !== 0 && "#EEFBEE",
                                                                        }}
                                                                    >
                                                                        {visibleColumns.map((colIndex) => (
                                                                            <Cell className='pdf-table' key={colIndex}>
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
                                </PDFExport>
                                {/* ========== Pagination ========== */}
                                <Pagination
                                    currentPage={currentPage}
                                    pageSize={pageLimit}
                                    onPageSizeChange={(size) =>
                                        getcustomerList(1, size.target.value)
                                    }
                                    tableCount={customerList?.length}
                                    totalCount={totalCount}
                                    onPageChange={(page) => getcustomerList(page, "")}
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

export default GalaxyCustomers;
