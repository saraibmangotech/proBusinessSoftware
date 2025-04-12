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
import { CleanTypes, Debounce, encryptData, formatPermissionData, getFileSize, handleExportWithComponent } from 'utils';
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

function DraftVisas() {
    const allowFilesType = [

        'text/csv',

    ];
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
    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [statusDialog, setStatusDialog] = useState(false)
    const [paymentDialog, setPaymentDialog] = useState(false)


    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Date', key: 'created_at' }, { name: 'Customer', key: 'created_at' }, { name: 'Visa Quantity', key: 'commission_visa' }, { name: 'Total Amount', key: 'commission_monthly' }, { name: 'Deposit Balance', key: 'customerCount' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [visas, setVisas] = useState([])


    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null)



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

    const handleUpload = async () => {
        setProgress(0);
        let docs = fileDetail
        try {
            const formData = new FormData();
            formData.append("file", file);
            console.log(file);
            let maxSize= 10 * 1024 * 1024
            if (file.size > maxSize){
              showErrorToast('File Size Must Be Less than 10 MB')
            }
            else{

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

    // *For Get Customer Queue
    const getVisaRequestList = async (page, limit, filter) => {
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
                is_draft: true
            }
            params = { ...params, ...Filter }

            const { data } = await VisaServices.getVisaRequestList(params)
            setVisas(data?.rows)
            setTotalCount(data?.count)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    const UpdateStatus = async () => {
        try {
            let obj = {
                status: status.id ? 'approved' : 'rejected',
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
                getVisaRequestList();
            }
        }
        catch (error) {
            console.log(error);
        }
    };

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
            }
            params = { ...params, ...Filter }
            const { data } = await CustomerServices.getCustomerQueue(params)
          
            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }


    const UpdatePaymentStatus = async (formData) => {
        try {
            let obj = {
                payment_date: date,
                payment_type: paymentType?.name,
                visa_id: selectedVisa?.id,
                amount: formData?.amount,
                bank_id: selectedBank?.id,
                description: formData?.description,


            };

            const promise = VisaServices.updatePaymentStatus(obj);
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
                getVisaRequestList();
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
        Debounce(() => getVisaRequestList(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getVisaRequestList(1, '', data));
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
        getVisaRequestList()
        getBanks()
        getCustomerQueue()
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={excelDialog}
                onClose={() => setExcelDialog(false)}
                title={'Upload Excel'}
            >
                <Box component="form" onSubmit={handleSubmit3(UpdateCSV)}>
                    <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <SelectField
                            size={'small'}
                            label={'Select Customer :'}
                        
                            options={customerQueue}
                            selected={selectedCustomer}
                            onSelect={(value) => {
                                setSelectedCustomer(value)
                                
                                setValue3('customer', value)

                            }}
                            error={errors3?.customer?.message}
                            register={register3("customer", {
                                required: 'Please select customer account.',
                            })}
                        />
                    </Grid>
                        {/* <Grid item xs={12} sm={12} display={'flex'} justifyContent={'center'}>
                            <PrimaryButton
                                bgcolor={'#0076bf'}
                                title="Download Template"
                                onClick={() => downloadExcel()}
                                loading={loading}
                            />
                        </Grid> */}
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray, mt: 1 }}>Upload CSV :* </Typography>
                            <UploadFile
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
                                <Box sx={{display:'flex',alignItems:'center',gap:'10px'}}>
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

                                options={[{ id: false, name: 'rejected' }, { id: true, name: 'approved' }]}
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
                        <Grid item xs={12} sm={12}>
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
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <LabelCustomInput label={'Amount : '} StartLabel={'AED'} register={register2("amount", { required: "Enter year inside rate" })} />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                label={"Description :"}
                                size={'small'}
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
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setPaymentDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Draft Visas</Typography>
                <Box sx={{ display: 'flex', gap: '5px' }} >

                 
                    <PrimaryButton
                        bgcolor={'#0076bf'}
                        title="Import Via Excel"
                        onClick={() => setExcelDialog(true)}
                        loading={loading}
                    />

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
                            bgcolor={Colors.white}
                            textcolor={Colors.primary}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => { getVisaRequestList(); setValue('search', '') }}
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
                    {visas && <Box>

                        <Grid container mb={2} >

                        </Grid>



                        {(
                            visas && (
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
                                                    {visas?.map((item, index) => {

                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    border: '1px solid #EEEEEE !important',
                                                                }}
                                                            >

                                                                <Cell style={{ textAlign: 'center' }} className="pdf-table">
                                                                    {item?.customer_id}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {moment(item?.created_at).format("MM-DD-YYYY")}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.customer?.name}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.candidates_count}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.total_visa_charges}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.customer?.deposit_balance}


                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box component={'div'} sx={{ cursor: 'pointer' }} onClick={() => { setStatusDialog(true); setSelectedVisa(item) }}>
                                                                        Draft
                                                                    </Box>


                                                                </Cell>

                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Box>
                                                                        <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/draft-detail/${item?.id}`)} width={'35px'}></Box>

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
                                        onPageSizeChange={(size) => getVisaRequestList(1, size.target.value)}
                                        tableCount={customerQueue?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getVisaRequestList(page, "")}
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

export default DraftVisas;