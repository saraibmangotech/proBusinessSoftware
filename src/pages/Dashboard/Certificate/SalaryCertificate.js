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
    Button,
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
import DatePicker from 'components/DatePicker';
import VisaServices from 'services/Visa';
import { CloudUpload } from '@mui/icons-material';
import instance from 'config/axios';
import routes from 'services/System/routes';
import UploadFile from 'components/UploadFile';
import UploadFileSingle from 'components/UploadFileSingle';
import { useAuth } from 'context/UseContext';

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

function SalaryCertificate() {
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
        formState: { errors: errors2 },

    } = useForm();
    // *For Deposit Slip
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [slipDetail, setSlipDetail] = useState([]);
    const [slipLink, setSlipLink] = useState("");

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [statusDialog, setStatusDialog] = useState(false)
    const [paymentDialog, setPaymentDialog] = useState(false)
    const [status, setStatus] = useState(null)
    const [payment, setPayment] = useState(null)
    const [selectedVisa, setSelectedVisa] = useState()


    const tableHead = [{ name: 'Date', key: 'created_at' },{ name: ' Name', key: 'name' }, { name: 'Salary Certificate', key: 'created_at' }, { name: 'Signed Date', key: 'commission_monthly' }]


    const allowFilesType = [

        'application/pdf',

    ];

    const [selectedItem, setSelectedItem] = useState()
    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [certificates, setCertificates] = useState([]);



    // *For setPermissions
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);

    const [itemAmount, setItemAmount] = useState()

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [certificate, setCertificate] = useState()
    const { user, userLogout } = useAuth();

    const UpdateCertificate = async (path) => {
        setLoading(true)

        try {
            let obj = {

                id: selectedItem?.id,
                signed_certificate: certificate,
                signed_at: new Date()
            }
            console.log(obj);
            const promise = CustomerServices.UpdateCertificate(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false)
                setCertificate('')
                getCertificate()
            }






        } catch (error) {

        } finally {
            setLoading(false);
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

                handleUpload(file, arr);
                const path = await handleUpload(file, arr);
                console.log('Uploaded file path:', path);
                setSlipLink(path)
                console.log(path, 'pathpathpath');
                return path
            } else {
                ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const handleUpload = async (file, docs) => {
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
                setSlipDetail(docs);
                console.log(data, 'asddasasd');
                return data?.data?.path

            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Get Customer Queue
    const getCertificate = async (page, limit, filter) => {
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
                type:'salary'
            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.getCertificates(params)
            setCertificates(data?.certificates?.rows)
            setTotalCount(data?.certificates?.count)
            // console.log(formatPermissionData(data?.permissions))
            // setPermissions(formatPermissionData(data?.permissions))
            // data?.permissions.forEach(e => {
            //     if (e?.route && e?.identifier && e?.permitted) {
            //         dispatch(addPermission(e?.route));
            //     }
            // })


        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }












    // *For Handle Filter
    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getCertificate(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getCertificate(1, '', data));
    }




    useEffect(() => {
        getCertificate()
    }, []);

    return (
        <Box sx={{ p: 3 }}>

            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={'Upload Sign Salary Certificate?'}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateCertificate)}>
                    <Grid container justifyContent={'center'} >
                        <Grid item >
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Upload Certificate :*</Typography>
                            <UploadFileSingle
                                Memo={true}
                                accept={allowFilesType}
                                error={errors?.certificate?.message}

                                file={certificate}
                                register={register("certificate", {
                                    required: certificate ? false : 'Upload Certificate',
                                    onChange: async (e) => {
                                        const path = await handleUploadDocument(e);
                                        if (path) {
                                            setCertificate(path);
                                        }
                                    }
                                })}
                            />
                        </Grid>

                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton disabled={!certificate} bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog(false)} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Salary Certificate</Typography>

                <Box sx={{ display: 'flex', gap: '10px' }}>
                   {true && <PrimaryButton
                       bgcolor={'#001f3f'}
                        title="Create New"
                        onClick={() => navigate('/create-new-salary-certificate')}


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
                            onClick={() => {  setValue('search', ''); handleFilter()}}
                            loading={loading}
                        />
                        <PrimaryButton
                           bgcolor={'#001f3f'}
                            title="Search"
                            onClick={() => handleFilter()}
                            loading={loading}
                        />
                    </Grid>
                </Grid>

                <Grid item md={11}>
                    {certificates && <Box>

                        <Grid container mb={2} >

                        </Grid>



                        {(
                            certificates && (
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
                                                            <Cell style={{ textAlign: cell?.name == 'Invoice#' ? 'center' : 'left', paddingRight: cell?.name == 'Invoice#' ? '15px' : '50px' }} className="pdf-table"
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
                                                    {certificates.map((item, index) => {

                                                        return (
                                                            <Row
                                                                key={index}
                                                                sx={{
                                                                    border: '1px solid #EEEEEE !important',
                                                                }}
                                                            >

                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {moment(item?.created_at).format('MM-DD-YYYY')}
                                                                </Cell>
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.employee?.name}
                                                                </Cell>
                                                               
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    <Grid
                                                                        item
                                                                        md={6}
                                                                        lg={4}
                                                                        sx={{ cursor: 'pointer', display: 'flex', gap: '5px' }}
                                                                        component={'div'}
                                                                          onClick={() => {
                                                                            console.log(item, 'item');
                                                                            navigate(
                                                                                `/certificate-pdf`,
                                                                                {
                                                                                    state: {
                                                                                        ...item,
                                                                                    
                                                                                      
                                                                                    },
                                                                                }

                                                                            )
                                                                        }}
                                                                        // onClick={() =>  handleDownload(item?.certificate, item?.certificate?.split('_').pop())}
                                                                        key={index}
                                                                    >

                                                                        <Box>
                                                                            <Box component={'img'} src={Images.docIcon} width={'25px'} />
                                                                        </Box>
                                                                        <p style={{ textAlign: 'center', lineHeight: '20px', color: '#0F2772', fontWeight: 'bold', fontSize: '12px' }}>
                                                                            {item?.certificate?.split('_').pop()}
                                                                        </p>
                                                                    </Grid>
                                                                </Cell>
                                                             
                                                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                    {item?.signed_at && moment(item?.created_at).format('MM-DD-YYYY')}
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
                                        onPageSizeChange={(size) => getCertificate(1, size.target.value)}
                                        tableCount={certificates?.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getCertificate(page, "")}
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

export default SalaryCertificate;