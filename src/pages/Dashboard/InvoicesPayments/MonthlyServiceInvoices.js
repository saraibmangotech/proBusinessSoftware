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
import VisaServices from 'services/Visa';
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
import InvoiceServices from 'services/Invoicing';
import { id } from 'date-fns/locale';



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

function MonthlyServiceInvoices() {
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
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const { user, userLogout } = useAuth();
    console.log(user);
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
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

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Date', key: 'created_at' }, { name: 'Customer', key: 'created_at' }, { name: 'Month-Year', key: 'commission_visa' }, { name: 'Total Amount', key: 'commission_monthly' }, { name: 'Tax', key: 'customerCount' }, { name: 'Payment', key: '' }, { name: 'Actions', key: '' }]


    const [invoices, setInvoices] = useState([])


    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([{ id: 1, name: 'asdasd' }, { id: 1, name: 'asdasd' }]);



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
    const [proofAdmin, setProofAdmin] = useState(false)

    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [file, setFile] = useState()
    const [filename, setFilename] = useState()
    const [fileDetail, setFileDetail] = useState()
    const [extension, setExtension] = useState()
    const [proofDialog, setProofDialog] = useState(false)
    const [proofDoc, setProofDoc] = useState()

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
    // *For Get Customer Queue
    const getMonthlyServiceInvoices = async (page, limit, filter) => {
        // setLoader(true)
        console.log(filter, 'sadasda');

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
                customer_id: user?.user_type == 'C' ? user?.customer_id : null,


            }
            params = { ...params, ...Filter }
            console.log(params, 'sadasda');

            const { data } = await InvoiceServices.getMonthlyServiceInvoices(params)
            setInvoices(data?.rows)
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
                status: status.id,
                visa_id: selectedVisa?.id
            };

            const promise = VisaServices.updateStatus(obj);
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
                getMonthlyServiceInvoices();
            }
        }
        catch (error) {
            console.log(error);
        }
    };


    const UpdatePaymentStatus = async (formData) => {
        try {
            let obj = {
                payment_date: date,
                payment_type: paymentType?.name,
                invoice_id: selectedVisa?.id,
                customer_id: selectedVisa?.customer_id,
                amount: formData?.amount,
                bank_id: selectedBank?.id,
                reference: 'monthly_invoice',
                description: formData?.description,


            };

            const promise = InvoiceServices.updatePaymentStatus(obj);
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
                getMonthlyServiceInvoices();
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

            const promise = VisaServices.UpdateProof(obj);
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
                getMonthlyServiceInvoices();
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
    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getMonthlyServiceInvoices(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getMonthlyServiceInvoices(1, '', data));
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
        getMonthlyServiceInvoices()
        getBanks()

    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={proofDialog}
                onClose={() => setProofDialog(false)}
                title={'Proof Of Payment'}
            >
                {!proofAdmin ? <Box component="form" onSubmit={handleSubmit4(UpdateProof)}>
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
                </Box> :
                    <Box >
                        <Grid container spacing={2}>


                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>Upload Proof :* </Typography>

                            <Grid
                                item
                                md={6}
                                lg={4}
                                sx={{ cursor: 'pointer', display: 'flex', gap: '5px' }}
                                component={'div'}

                                onClick={() => handleDownload(selectedVisa?.proof_document, selectedVisa?.proof_document?.split('_').pop())}

                            >

                                {selectedVisa?.proof_document && <Box>
                                    <Box component={'img'} src={Images.docIcon} width={'35px'} />
                                </Box>}
                                <p style={{ textAlign: 'center', lineHeight: '20px', color: '#0F2772', fontWeight: 'bold', fontSize: '15px' }}>
                                    {selectedVisa?.proof_document?.split('_').pop()}
                                </p>
                            </Grid>

                            <Grid item xs={12} sm={12}>
                                <LabelCustomInput value={selectedVisa?.proof_amount} label={'Amount : '} StartLabel={'AED'} disabled={true} register={register4("amount", { required: "Enter  amount" })} />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <InputField
                                    label={"Date :"}
                                    size={'small'}
                                    disabled={true}
                                    value={moment(selectedVisa?.proof_date).format('MM-DD-YYYY')}
                                    rows={5}
                                    placeholder={"Description"}
                                    error={errors2?.description?.message}
                                    register={register2("description", {
                                        required:
                                            false

                                    })}
                                />
                            </Grid>


                        </Grid>
                    </Box>}
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

                                options={[{ id: 'Pending', name: 'Pending' }, { id: 'Approved', name: 'Approved' }, { id: "Rejected", name: 'Rejected' }]}
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
                title={'Change Payment Status?'}
            >
                <Box component="form" onSubmit={handleSubmit2(UpdatePaymentStatus)}>
                    <Grid container >
                        <Grid item xs={12} sm={12}>
                            <DatePicker
                                label={"Payment Date :"}
                                value={date}

                                size={'small'}
                                error={errors2?.date?.message}
                                register={register2("date", {
                                    required:

                                        "Please enter  date."

                                })}
                                onChange={(date) => {
                                    handleDate(date)
                                    setValue2('date', date)


                                }

                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Payment Type :'}

                                options={[{ id: 'cash', name: 'Cash' }, { id: 'bank', name: 'Bank' }, { id: 'cheque', name: 'Cheque' }]}
                                selected={paymentType}
                                onSelect={(value) => {
                                    setPaymentType(value)


                                }}
                                error={errors2?.status?.message}
                                register={register2("status", {
                                    required: 'Please select status.',
                                })}
                            />
                        </Grid>
                        {/* {paymentType?.id == 'bank' && <Grid item xs={12} sm={12}>
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
                        </Grid>} */}
                        <Grid item xs={12} sm={12}>
                            <LabelCustomInput label={'Amount : '} StartLabel={'AED'} disabled={true} register={register2("amount", { required: "Enter year inside rate" })} />
                        </Grid>
                        <Grid item xs={12} sm={12} mt={2}>
                            <InputField
                                label={"Description :"}
                                size={'small'}
                                rows={5}
                                multiline={true}
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
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => { setPaymentDialog(false) }} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Monthly Invoices</Typography>
                <Box sx={{ display: 'flex', gap: '5px' }} >

                    {permissions?.create && <PrimaryButton
                        bgcolor={Colors.buttonBg}
                        title="Create Invoice"
                        onClick={() => navigate('/create-monthly-invoice')}
                        loading={loading}
                    />}


                </Box>

            </Box>

            {/* Filters */}
            <Box >
                <Grid container spacing={2}>
                    <Grid item xs={6} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'Search'} placeholder={'Search'} register={register("search")} />
                    </Grid>
                    {/* <Grid item xs={3} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Customers'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Commission'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'2px solid #FAFAFA'} StartLabel={'By Date'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid> */}
                    <Grid item xs={6} display={'flex'} justifyContent={'flex-end'} gap={2} >
                        <PrimaryButton
                            bgcolor={"#0076bf"}
                            textcolor={Colors.white}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => {
                                setValue('search', '');

                                handleFilter()
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
                    {invoices && <Box>

                        <Grid container mb={2} >

                        </Grid>



                        {(
                            invoices && (
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
                                                            <Cell style={{ textAlign: cell?.name == 'SR No.' ? 'center' : 'left', paddingRight: cell?.name == 'SR No.' ? '15px' : '50px' }} className="pdf-table"
                                                                key={index}

                                                            >
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                                                    {cell?.name} {cell?.name == 'Date' && <>&nbsp;<span style={{ height: '20px', cursor: 'pointer' }}><Box component={'img'} onClick={() => { setSort(sort == 'asc' ? 'desc' : 'asc'); handleSort(cell?.key) }} src={Images.sortIcon} width={'18px'}></Box></span></>}
                                                                </Box>
                                                            </Cell>
                                                        ))}
                                                    </Row>
                                                </TableHead>
                                                <TableBody>
                                                    {invoices?.map((item, index) => {

                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    border: '1px solid #EEEEEE !important',
                                                                }}
                                                            >

                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.id}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {moment(item?.created_at).format("MM-DD-YYYY")}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.customer?.name}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.month_year}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.total_amount}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.tax}


                                                                </Cell>

                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box component={'div'} sx={{ cursor: 'pointer' }} onClick={() => {
                                                                        if (user?.user_type != 'C') {
                                                                            if (permissions?.payment && item?.payment_status?.toLowerCase() == 'unpaid') {
                                                                                setValue2('amount', parseFloat(parseFloat(item?.total_amount) + parseFloat(item?.total_amount) * 0.05).toFixed(2))
                                                                                setPaymentDialog(true); setSelectedVisa(item)
                                                                            }
                                                                        }
                                                                    }}>
                                                                        <Box component={'img'} src={item?.payment_status == 'paid' ? Images.successIcon : Images.errorIcon} width={'13px'}></Box>
                                                                        {item?.payment_status == 'paid' ? 'Paid' : 'Unpaid'}
                                                                    </Box>
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box>
                                                                        {/* {<IconButton onClick={() => {
                                                                            if (user?.user_type == 'C') {

                                                                                setProofDialog(true); setSelectedVisa(item)
                                                                                setProofAdmin(false)
                                                                            }
                                                                            else {
                                                                                setProofDialog(true)
                                                                                setSelectedVisa(item)
                                                                                setProofAdmin(true)
                                                                            }

                                                                        }}><ReceiptIcon sx={{ color: item?.proof_document ? '#56ba28' : '' }} width={'35px'} /></IconButton>}
                                                                        <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/visa-detail/${item?.id}`)} width={'35px'}></Box> */}
                                                                        {permissions?.view_invoice && <Box component={'img'} onClick={() => {
                                                                            if (item?.total_amount > 0) {
                                                                                navigate(`/monthly-invoice/${item?.id}`)
                                                                            }
                                                                            else {
                                                                                showErrorToast('Amount can not be 0')
                                                                            }
                                                                        }} sx={{ cursor: "pointer" }} src={Images.invoiceIcon} width={'35px'}></Box>}
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
                                        onPageSizeChange={(size) => getMonthlyServiceInvoices(1, size.target.value)}
                                        tableCount={customerQueue?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getMonthlyServiceInvoices(page, "")}
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

export default MonthlyServiceInvoices;