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
import { useAuth } from 'context/UseContext';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';

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

function CreateExpCertificate() {
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    // const [handleBlockedNavigation] =
    // useCallbackPrompt(true)
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
    const [selectedItem, setSelectedItem] = useState(null);
    const [newData, setNewData] = useState(null)

    const tableHead = [{ name: 'Select', key: 'created_at' }, { name: ' Name', key: 'commission_monthly' }, { name: 'Basic Salary', key: 'commission_monthly' }, { name: 'Housing Allowance', key: 'commission_monthly' }, { name: 'Transport Allowance', key: 'created_at' }, { name: 'Other Allowance', key: 'created_at' }, { name: 'Total Salary', key: 'commission_monthly' }, { name: 'Visa Status', key: 'commission_monthly' }]


    const allowFilesType = [

        'application/pdf',

    ];


    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [candidates, setCandidates] = useState([]);
    const [certificateDialog, setCertificateDialog] = useState(false)


    // *For setPermissions
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const { user, userLogout } = useAuth();

    const [itemAmount, setItemAmount] = useState()

    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)




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



    const handleRadioChange = (item) => {
        setSelectedItem(item);
    };
    const handleUpload = async (file, docs) => {
        setProgress(0);
        try {
            const formData = new FormData();
            formData.append("document", file);
            console.log(formData);
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
    const getCandidateList = async (page, limit, filter) => {
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
                // customer_id: user?.user_type == 'C' ? user?.customer_id : null,
            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.getEmployees(params)
            setCandidates(data?.employees?.rows)
            setTotalCount(data?.employees?.count)
            // setPermissions(formatPermissionData(data?.permissions))
            // data?.permissions.forEach(e => {
            //   if (e?.route && e?.identifier && e?.permitted) {
            //     dispatch(addPermission(e?.route));
            //   }
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
        Debounce(() => getCandidateList(1, '', data));
    }

    const CreateCertificate = (formData) => {
        setNewData(formData)
        navigate(
            `/exp-certificate-pdf`,
            { state: {...selectedItem,...formData} }
        )

    }
    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getCandidateList(1, '', data));
    }




    useEffect(() => {
        getCandidateList()
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog
                open={certificateDialog}
                onClose={() => setCertificateDialog(false)}
                title={'Create Certificate?'}
            >
                <Box component="form" onSubmit={handleSubmit2(CreateCertificate)}>
                    <Grid container >



                        <Grid item xs={12} sm={12} mt={2}>
                            <InputField
                                label={"Reference No :*"}
                                size={'small'}
                               
                                placeholder={"Reference No"}
                                error={errors2?.reference?.message}
                                register={register2("reference", {
                                    required:
                                        'reference is required.'

                                })}
                            />
                        </Grid>
                    

                        <Grid item xs={12} sm={12} mt={2}>
                            <InputField
                                label={"To :*"}
                                size={'small'}
                               
                                placeholder={"To"}
                                error={errors2?.to?.message}
                                register={register2("to", {
                                    required:
                                        'to is required.'

                                })}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={12} mt={2}>
                            <InputField
                                label={"For :*"}
                                size={'small'}
                               
                                placeholder={"For"}
                                error={errors2?.for?.message}
                                register={register2("for", {
                                    required:
                                        'for is required.'

                                })}
                            />
                        </Grid>
                      
                        <Grid container sx={{ justifyContent: 'center' }}>
                            <Grid item xs={6} sm={6} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: '25px' }}>
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => { setCertificateDialog(false) }} bgcolor={'#FF1F25'} title="No,Cancel" />
                            </Grid>
                        </Grid>

                    </Grid>
                </Box>
            </SimpleDialog>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Create Experience Certificate</Typography>

                <Box sx={{ display: 'flex', gap: '10px' }}>
                    {true && <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Download Experience Certificate"
                        disabled={selectedItem ? false : true}
                        onClick={() => {
                            console.log(selectedItem);
                            setCertificateDialog(true)

                        }}


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
                            bgcolor={Colors.white}
                            textcolor={Colors.primary}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => { getCandidateList(); setValue('search', '') }}
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
                    {candidates && <Box>

                        <Grid container mb={2} >

                        </Grid>



                        {(
                            candidates && (
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
                                                            <Cell style={{ textAlign: cell?.name == 'Select' ? 'center' : 'left', paddingRight: cell?.name == 'Select' ? '15px' : '20px' }} className="pdf-table"
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
                                                    {candidates.map((item, index) => (
                                                        <Row
                                                            key={index}
                                                            sx={{
                                                                border: '1px solid #EEEEEE !important',
                                                            }}
                                                        >
                                                            <Cell style={{ textAlign: 'center', paddingLeft: '0px !important' }} className="pdf-table">
                                                                <input
                                                                    type="radio"
                                                                    checked={selectedItem?.id === item?.id}
                                                                    onChange={() => handleRadioChange(item)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </Cell>

                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.user?.name}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.basic_salary}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.housing_allowance}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.transport_allowance}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {item?.other_allowance}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                {parseFloat(item?.basic_salary || 0) + parseFloat(item?.housing_allowance || 0) + parseFloat(item?.transport_allowance || 0) + parseFloat(item?.other_allowance || 0)}
                                                            </Cell>
                                                            <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                <Box component={'div'} sx={{ cursor: 'pointer', display: 'flex  !important', justifyContent: 'flex-start  !important' }} onClick={() => { setPaymentDialog(true); setSelectedVisa(item) }}>
                                                                    <Box component={'img'} src={item?.visa_status == 'active' ? Images.successIcon : Images.errorIcon} width={'13px'}></Box>
                                                                    {item?.visa_status == 'active' ? 'Active' : 'Inactive'}
                                                                </Box>
                                                            </Cell>
                                                        </Row>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </PDFExport>
                                    {/* ========== Pagination ========== */}
                                    <Pagination
                                        currentPage={currentPage}
                                        pageSize={pageLimit}
                                        onPageSizeChange={(size) => getCandidateList(1, size.target.value)}
                                        tableCount={candidates.length}
                                        totalCount={totalCount}
                                        onPageChange={(page) => getCandidateList(page, "")}
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

export default CreateExpCertificate;