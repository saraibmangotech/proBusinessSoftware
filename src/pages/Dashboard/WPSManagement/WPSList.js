import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
    FormControl,
    Select,
    MenuItem,
    ListItemText,
    Tooltip,
    Checkbox,
    InputAdornment,
} from '@mui/material';
import { AllocateIcon, CheckIcon, EyeIcon, FontFamily, Images, MessageIcon, PendingIcon, RequestBuyerIdIcon } from 'assets';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import FinanceStatusDialog from 'components/Dialog/FinanceStatusDialog';
import AllocateStatusDialog from 'components/Dialog/AllocateStatusDialog';
import AllocateDialog from 'components/Dialog/AllocateDialog';
import CustomerServices from 'services/Customer';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { CleanTypes, Debounce, encryptData, formatPermissionData, getFileSize, handleDownload, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import CommissionServices from 'services/Commission';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { adjustSectionValue } from '@mui/x-date-pickers/internals/hooks/useField/useField.utils';
import wpsListervices from 'services/Visa';
import DatePicker from 'components/DatePicker';
import SystemServices from 'services/System';
import excelFile from 'assets/excel/request_format.csv'
import UploadFile from 'components/UploadFile';
import instance from 'config/axios';
import routes from 'services/System/routes';
import toast from 'react-hot-toast';
import { useAuth } from 'context/UseContext';
import ReceiptIcon from '@mui/icons-material/Receipt';
import UploadFileSingle from 'components/UploadFileSingle';
import { useStaticPicker } from '@mui/x-date-pickers/internals';



// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,

}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',
        border: '1px solid #EEEEEE',
        padding: '15px',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        color: '#434343',
        paddingRight: '50px',
        background: 'transparent',
        fontWeight: 'bold'

    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',

        textWrap: 'nowrap',
        padding: '5px !important',
        paddingLeft: '15px !important',

        '.MuiBox-root': {
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            '.MuiBox-root': {
                cursor: 'pointer'
            }
        },
        'svg': {
            width: 'auto',
            height: '24px',
        },
        '.MuiTypography-root': {
            textTransform: 'capitalize',
            fontFamily: FontFamily.NunitoRegular,
            textWrap: 'nowrap',
        },
        '.MuiButtonBase-root': {
            padding: '8px',
            width: '28px',
            height: '28px',
        }
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
    }
})

function WPSList() {
    const allowFilesType = [

        'text/csv',

    ];
    const allowFilesType2 = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/msword',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const { user, userLogout } = useAuth();
    console.log(user);
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const {
        register: register1,
        handleSubmit: handleSubmit1,
        setValue: setValue1,
        formState: { errors: errors1 },

    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
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
    const [statusDialog, setStatusDialog] = useState(false)
    const [paymentDialog, setPaymentDialog] = useState(false)

    const tableHead = [{ name: 'Created At', key: '' }, { name: 'WPS Date', key: '' }, { name: 'Customer', key: 'created_at' }, { name: 'Description', key: 'created_at' }, { name: 'Document', key: 'commission_visa' }, { name: 'Is Approved', key: 'commission_monthly' }]



    const [wpsList, setWpsList] = useState([])


    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



    // *For setPermissions
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVisa, setSelectedVisa] = useState(null)

    const [itemAmount, setItemAmount] = useState()
    const [status, setStatus] = useState()
    const [date, setDate] = useState(null)
    const [paymentType, setPaymentType] = useState(null)
    const [banks, setBanks] = useState([])
    const [excelDialog, setExcelDialog] = useState(false)
    const [selectedBank, setSelectedBank] = useState(null)
    const [excel, setExcel] = useState()

    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [file, setFile] = useState()
    const [filename, setFilename] = useState()
    const [fileDetail, setFileDetail] = useState()
    const [extension, setExtension] = useState()
    const [proofDialog, setProofDialog] = useState(false)
    const [proofDoc, setProofDoc] = useState()
    const [wpsDoc, setWpsDoc] = useState()
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [customerDetail, setCustomerDetail] = useState(null)
    const [latestWps, setLatestWps] = useState(null)
    const [wpsMonth, setWpsMonth] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)

    const getBanks = async (page, limit, filter) => {
        // setLoader(true)
        try {





            const { data } = await SystemServices.getBanks()

            setBanks(data?.banks)
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
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
                page: Page,
                limit: Limit,
                customer_id: user?.user_type == 'C' ? user?.customer_id : null
            }
            params = { ...params, ...Filter }
            const { data } = await CustomerServices.getCustomerQueue(params)
            if (user?.user_type == 'C') {
                console.log(customerQueue);
                let currentUser = data?.rows?.find(item => item?.id == user?.customer_id)
                console.log(currentUser);
                setSelectedCustomer(currentUser)
                setValue1('customer', currentUser)

            }
            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    // *For Upload Document
    const handleUploadDocument = async (e) => {
        try {
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

                setFile(file)
                setFileDetail(arr)
                // handleUpload(file, arr);
                // const path = await handleUpload(file, arr);
                // console.log('Uploaded file path:', path);
                // console.log(path, 'pathpathpath');
                // return path
            } else {
                showErrorToast(`Only ${CleanTypes(allowFilesType)} formats is supported`);
            }
        } catch (error) {
            showErrorToast(error);
        }
    };
    // *For Upload Document
    const handleUploadDocument2 = async (e) => {
        try {
            e.preventDefault();
            let path = "";
            console.log(e.target.files.length, "length")
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                let arr = [
                    {
                        name: file?.name,
                        file: "",
                        type: file?.type.split("/")[1],
                        size: getFileSize(file.size),
                        isUpload: false,
                    },
                ];
                let maxSize = 10 * 1024 * 1024
                if (file.size > maxSize) {
                    showErrorToast('File Size Must Be Less than 10 MB')
                }
                else {

                    const uploadedPath = await handleUpload2(file, arr);
                    if (path) {
                        path += "," + uploadedPath
                    }
                    else {
                        path = uploadedPath
                    }
                }


            }
            console.log(path, "path")
            return path;
            // if (allowFilesType.includes(file.type)) {


            //   return path
            // } else {
            //   ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
            // }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleUpload = async () => {
        setProgress(0);
        let docs = fileDetail
        try {
            const formData = new FormData();
            formData.append("file", file);
            console.log(file);
            let maxSize = 10 * 1024 * 1024
            if (file.size > maxSize) {
                showErrorToast('File Size Must Be Less than 10 MB')
            }
            else {

                const { data } = await instance.post(routes.uploadCVS, formData, {
                    onUploadProgress: (progressEvent) => {
                        const uploadedBytes = progressEvent.loaded;
                        const percentCompleted = Math.round(
                            (uploadedBytes * 100) / progressEvent.total
                        );

                        setProgress(percentCompleted);
                        console.log(getFileSize(uploadedBytes));
                        setUploadedSize(getFileSize(uploadedBytes));
                        toast.success(' Successfully Updated!')

                        setExcelDialog(false)
                    },
                });
                if (data) {
                    docs[0].isUpload = true;
                    docs[0].file = data?.data?.nations;

                    console.log(data, 'asddasasd');
                    return data?.data?.path

                }
            }
        } catch (error) {
            showErrorToast(error);
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

                console.log(data, 'asddasasd');
                return data?.data?.path

            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Customer Detail
    const getCustomerDetail = async () => {
        try {
            let params = { customer_id: user?.user_type == 'C' ? user?.customer_id : selectedCustomer?.id };
            const { data } = await CustomerServices.getCustomerDetail(params);
            console.log(data.details);


            setCustomerDetail(data?.details)

        } catch (error) {
            showErrorToast(error);
        }
    };
    // *For Get Customer Queue
    const getWPSList = async (page, limit, filter) => {
        // setLoader(true)
        try {
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = { ...filters, ...filter }
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            console.log(selectedCustomer);

            let params = {
                page: Page,
                limit: Limit,
                customer_id: user?.user_type == 'C' ? user?.customer_id : selectedCustomer?.id,


            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.getWPSList(params)
            setWpsList(data?.rows)
            setLatestWps(data?.rows[0])
            setTotalCount(data?.count)
            console.log(formatPermissionData(data?.permissions))
            setPermissions(formatPermissionData(data?.permissions))
            data?.permissions.forEach(e => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            })

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    const UpdateStatus = async () => {
        try {
            let obj = {
                is_approved: status.id == 'Approved' ? true : status.id == 'Rejected' ? false : null,
                id: selectedVisa?.id,
                customer_id: selectedVisa?.customer_id

            };

            const promise = CustomerServices.UpdateWPStatus(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false);
                getWPSList();
            }
        }
        catch (error) {
            console.log(error);
        }
    };


    const CreateWPS = async (formData) => {
        console.log(selectedVisa);

        try {
            let obj = {
                customer_id: user?.customer_id,
                customer_name: user?.name,
                description: getValues2('description'),
                document: wpsDoc,
                date: moment(wpsMonth, "MMMM-YYYY").add(10, "day")


            };
            console.log(obj);

            const promise = CustomerServices.CreateWPS(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setPaymentDialog(false);
                setProofDoc('')
                getWPSList();
                setValue2('description','')
                setWpsDoc(null)
            }
        }
        catch (error) {
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

            const promise = wpsListervices.UpdateProof(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setProofDialog(false);
                getWPSList();
                setValue2('description', '')
            }
        }
        catch (error) {
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



    const UpdateCSV = async () => {
        handleUpload()
    }


    // *For Handle Filter
    const handleFilter = (data) => {

        Debounce(() => getWPSList(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getWPSList(1, '', data));
    }

    const downloadExcel = () => {
        fetch(excelFile)
            .then(response => response.blob())
            .then(blob => {
                console.log(blob);
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'filename.csv'); // Adjust the filename as needed
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch(error => console.error('Error downloading Excel file:', error));
    };


    useEffect(() => {
        getWPSList()
        getBanks()
        getCustomerQueue()
        if (selectedCustomer || user?.customer_id) {

            getCustomerDetail()
        }

    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={proofDialog}
                onClose={() => setProofDialog(false)}
                title={'Proof Of Payment'}
            >
                <Box component="form" onSubmit={handleSubmit4(UpdateProof)}>
                    <Grid container spacing={2}>

                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>Upload Proof :* </Typography>
                            <UploadFileSingle
                                Memo={true}
                                accept={allowFilesType2}
                                error={errors4?.proof?.message}
                                file={proofDoc}
                                register={register4("proof", {
                                    required:

                                        "Please upload  proof   ."
                                    ,
                                    onChange: async (e) => {
                                        const path = await handleUploadDocument2(e);
                                        if (path) {
                                            setProofDoc(path);
                                        }
                                    }
                                })}

                            />
                            {filename &&
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Box component={'img'} src={Images.uploadXls} width={'50px'}></Box>
                                    <span style={{ color: 'blue' }}>{filename}</span> </Box>}
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <LabelCustomInput label={'Amount : '} StartLabel={'AED'} register={register4("amount", { required: "Enter  amount" })} />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <DatePicker
                                label={"Payment Date :"}
                                value={date}

                                size={'small'}
                                error={errors4?.date?.message}
                                register={register4("date", {
                                    required:

                                        "Please enter  date."

                                })}
                                onChange={(date) => {
                                    handleDate(date)
                                    setValue4('date', date)


                                }

                                }
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setProofDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={excelDialog}
                onClose={() => setExcelDialog(false)}
                title={'Upload Excel'}
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
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>Upload CSV :* </Typography>
                            <UploadFileSingle
                                Memo={true}
                                accept={allowFilesType}
                                error={errors3?.excel?.message}
                                file={excel}
                                register={register3("excel", {
                                    required:

                                        "Please upload  excel   ."
                                    ,
                                    onChange: async (e) => {
                                        handleUploadDocument(e);

                                        const file = e.target.files[0];
                                        console.log(file);
                                        setFilename(file?.name)



                                    }
                                })}

                            />
                            {filename &&
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Box component={'img'} src={Images.uploadXls} width={'50px'}></Box>
                                    <span style={{ color: 'blue' }}>{filename}</span> </Box>}
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setExcelDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={'Change Status?'}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Select Status :'}

                                options={[{ id: 'Approved', name: 'Approved' }, { id: 'Rejected', name: 'Rejected' }]}
                                selected={status}
                                onSelect={(value) => {
                                    setStatus(value)


                                }}
                                error={errors?.status?.message}
                                register={register("status", {
                                    required: 'Please select status.',
                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>
            <SimpleDialog
                open={paymentDialog}
                onClose={() => setPaymentDialog(false)}
                title={'Create WPS?'}
            >
                <Box component="form" onSubmit={handleSubmit2(CreateWPS)}>
                    <Grid container >
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>Upload Document :* </Typography>
                            <UploadFileSingle
                                Memo={true}
                                accept={allowFilesType2}
                                error={errors2?.wpsDoc?.message}
                                file={wpsDoc}
                                className={'validationClass'}
                                register={register2("wpsDoc", {
                                    required:

                                        "Please upload  document.  ."
                                    ,
                                    onChange: async (e) => {
                                        const path = await handleUploadDocument2(e);
                                        if (path) {
                                            setWpsDoc(path);
                                        }
                                    }
                                })}

                            />

                        </Grid>
                        <Grid item xs={12} sm={12} mb={2.5}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>WPS Month : </Typography>
                            {wpsMonth}
                        </Grid>



                        <Grid item xs={12} sm={12}>
                            <InputField
                                label={"Description :"}
                                size={'small'}
                                multiline={true}
                                rows={5}
                                placeholder={"Description"}
                                error={errors2?.description?.message}
                                register={register2("description", {
                                    required:
                                        false

                                })}
                            />
                        </Grid>
                        <Grid container sx={{ justifyContent: 'center' }}>


                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton disabled={moment(wpsMonth, 'MMMM-YYYY').diff(moment().startOf("month"), "months") >= 0 ? true : false} bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setPaymentDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>WPS Management</Typography>
                <Box sx={{ display: 'flex', gap: '5px' }} >

                    {user?.user_type == 'C' && <PrimaryButton
                       bgcolor={'#001f3f'}
                        title="Create WPS"
                        onClick={() => {
                            setWpsDoc(null)
                            setValue2('description', '')
                            console.log(customerDetail);
                            let pendingStatus = wpsList.some((item => item?.is_approved == null));
                            console.log(pendingStatus, 'wpsList');
                            if (pendingStatus && !customerDetail?.bypass_requirements) {
                                showErrorToast('You have Pending WPS')
                            }
                            else {

                                if (customerDetail?.created_at) {
                                    const createdAtMonth = moment(customerDetail.created_at).month();
                                    const currentMonth = moment().month();
                                    console.log(createdAtMonth);
                                    console.log(currentMonth);
                                    if (createdAtMonth === currentMonth && !customerDetail?.bypass_requirements) {
                                        showErrorToast("You can create WPS next month");

                                    }

                                    else if (latestWps?.date && latestWps?.is_approved == true) {
                                        setWpsMonth(moment(latestWps?.date).add(1, 'months').format("MMMM-YYYY"))
                                        setPaymentDialog(true);
                                    }
                                    else if (latestWps?.date && latestWps?.is_approved == false) {
                                        setWpsMonth(moment(latestWps?.date).format("MMMM-YYYY"))
                                        setPaymentDialog(true);
                                    }
                                    else {
                                        setWpsMonth(moment(customerDetail?.created_at).format("MMMM-YYYY"))
                                        setPaymentDialog(true);
                                    }
                                } else {
                                    console.log("No created_at date available");
                                }
                            }

                        }}
                        loading={loading}
                    />}


                </Box>

            </Box>
            {user?.user_type != 'C' && <Grid container  >

                <Grid item xs={4} >
                    <SelectField
                        size={'small'}
                        label={'Select Customer :'}

                        options={customerQueue}
                        selected={selectedCustomer}
                        onSelect={(value) => {
                            setSelectedCustomer(value)
                            handleFilter({ customer_id: value?.id })
                            setValue1('customer', value)

                        }}
                        error={errors1?.customer?.message}
                        register={register1("customer", {
                            required: 'Please select customer account.',
                        })}
                    />
                </Grid>



            </Grid>}

            <Box >


                <Grid item md={11}>
                    {wpsList && <Box>

                        <Grid container mb={2} >

                        </Grid>



                        {(
                            wpsList && (
                                <Fragment>
                                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Import Customers' >

                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                maxHeight: 'calc(100vh - 200px)', mt: 5, backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

                                            }}

                                        >
                                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                                <TableHead>

                                                    <Row>
                                                        {tableHead.map((cell, index) => (
                                                            <Cell style={{ textAlign: cell?.name == 'Date' ? 'center' : 'left', paddingRight: cell?.name == 'Date' ? '15px' : '50px' }} className="pdf-table"
                                                                key={index}

                                                            >
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-end', textAlign: 'center' }}>
                                                                    {cell?.name}
                                                                </Box>
                                                            </Cell>
                                                        ))}
                                                    </Row>
                                                </TableHead>
                                                <TableBody>
                                                    {wpsList?.map((item, index) => {

                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    border: '1px solid #EEEEEE !important',
                                                                }}
                                                            >

                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {moment(item?.created_at).format("MM-DD-YYYY")}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {moment(item?.date).format("MMMM-YYYY")}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.customer?.name}

                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.description}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <>


                                                                        {item?.document && <Grid
                                                                            item
                                                                            md={6}
                                                                            lg={4}
                                                                            sx={{ cursor: 'pointer', display: 'flex', gap: '5px' }}
                                                                            component={'div'}
                                                                            onClick={() => {
                                                                                if (item?.document?.split('_').pop().includes('doc') || item?.document?.split('_').pop().includes('xls')) {

                                                                                    handleDownload(item?.document, item?.document?.split('_').pop());
                                                                                }
                                                                                else {

                                                                                    window.open(process.env.REACT_APP_IMAGE_BASE_URL + item?.document, '_blank');
                                                                                }
                                                                            }}
                                                                            // onClick={() => handleDownload(item?.document, item?.document?.split('_').pop())}
                                                                            key={index}
                                                                        >

                                                                            <Box>
                                                                                <Box component={'img'} src={Images.docIcon} width={'25px'} />
                                                                            </Box>
                                                                            <p style={{ textAlign: 'center', lineHeight: '20px', color: '#0F2772', fontWeight: 'bold', fontSize: '12px' }}>
                                                                                {item?.document?.split('_').pop()}
                                                                            </p>
                                                                        </Grid>}
                                                                    </>
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box component={'div'} sx={{ display: 'flex !important', justifyContent: 'flex-start !important', cursor: 'pointer' }} onClick={() => {
                                                                        console.log(user);
                                                                        if (user?.user_type != 'C' && item?.is_approved == null) {
                                                                            if (permissions?.status) {
                                                                                setStatus(null)

                                                                                setStatusDialog(true); setSelectedVisa(item)
                                                                            }

                                                                        }
                                                                    }}>
                                                                        <Box component={'img'} src={item?.is_approved ? Images.successIcon : item?.is_approved == null ? Images.pendingIcon : Images.errorIcon} width={'13px'}></Box>
                                                                        {item?.is_approved ? 'Approved' : item?.is_approved == null ? 'Pending' : 'Rejected'}
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
                                        onPageSizeChange={(size) => getWPSList(1, size.target.value)}
                                        tableCount={customerQueue?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getWPSList(page, "")}
                                    />

                                </Fragment>
                            )
                        )}


                        {loader && <CircleLoading />}


                    </Box>}





                </Grid>
            </Box>

        </Box>
    );
}

export default WPSList;