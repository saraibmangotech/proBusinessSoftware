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
import { Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
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
import FinanceServices from 'services/Finance';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';

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

function JournalVoucherList() {
    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
        formState: { errors: errors2 },

    } = useForm();
    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [statusDialog, setStatusDialog] = useState(false)
    const [paymentDialog, setPaymentDialog] = useState(false)
    const [status, setStatus] = useState(null)
    const [payment, setPayment] = useState(null)
    const [selectedVisa, setSelectedVisa] = useState()
    const [confirmationDialog, setConfirmationDialog] = useState(false)


    const tableHead = [{ name: 'Created At', key: '' },{ name: 'Impact Date', key: '' }, { name: 'JV#', key: 'name' }, { name: 'Entry No', key: 'created_at' }, { name: 'Amount', key: 'commission_visa' }, { name: 'Note', key: 'commission_monthly' }, { name: 'User', key: '' }, { name: 'Actions', key: '' }]





    const [loader, setLoader] = useState(false);

    const [sort, setSort] = useState('asc')


    // *For Customer Queue
    const [vouchers, setVouchers] = useState([]);



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

    const UpdateStatus = async () => {
        try {
            let obj = {
                id: selectedVisa?.id,
                status: status.id,

            };

            const promise = CustomerServices.UpdateAddOnservice(obj);
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
                getVouchers();
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    const HandleDelete = async () => {
        try {
            let obj = {
                id: selectedVisa?.id,
         

            };

            const promise = CustomerServices.DeleteJournalVoucher(obj);
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
                setConfirmationDialog(false);
                getVouchers()
           
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    const UpdatePaymentStatus = async (formData) => {
        try {
            let obj = {
                id: selectedVisa?.id,
                payment_status: payment?.id,


            };

            const promise = CustomerServices.UpdateAddOnservice(obj);
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
                getVouchers();
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    // *For Get Customer Queue
    const getVouchers = async (page, limit, filter) => {
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

            const { data } = await FinanceServices.getJournalVouchers(params)
            setVouchers(data?.vouchers?.rows)
            setTotalCount(data?.vouchers?.count)
            setPermissions(formatPermissionData(data?.permissions))
            console.log(formatPermissionData(data?.permissions));

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












    // *For Handle Filter
    const handleFilter = () => {
        let data = {
            search: getValues('search')
        }
        Debounce(() => getVouchers(1, '', data));
    }

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getVouchers(1, '', data));
    }




    useEffect(() => {
        getVouchers()
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are you sure?"}
                action={() => {
                    setConfirmationDialog(false);
                    HandleDelete()
                }}
            />
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

                                options={[{ id: 'pending', name: 'Pending' }, { id: 'inprogress', name: 'InProgress' }, { id: 'completed', name: 'Completed' }]}
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
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={'small'}
                                label={'Select Status :'}

                                options={[{ id: 'paid', name: 'Paid' }, { id: 'unpaid', name: 'Unpaid' }]}
                                selected={payment}
                                onSelect={(value) => {
                                    setPayment(value)


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



            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Journal Vouchers</Typography>



            </Box>

            {/* Filters */}
            <Box >
                <Grid container spacing={2} mb={4}>
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
                            onClick={() => { getVouchers(); setValue('search', '') }}
                            loading={loading}
                        />
                        <PrimaryButton
                           bgcolor={'#bd9b4a'}
                            title="Search"
                            onClick={() => handleFilter()}
                            loading={loading}
                        />
                    </Grid>
                </Grid>

                <Grid item md={11}>
                    {vouchers ? (
                        <Fragment>
                            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                                fileName="Journal Vouchers"
                            >
                                <Box className='pdf-show' sx={{ display: 'none' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                            Booked Container
                                        </Typography>
                                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                                    </Box>
                                </Box>
                                {/* ========== Table ========== */}
                                <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 190px)' }} className="table-box">
                                    <Table stickyHeader sx={{ minWidth: 500 }}>
                                        <TableHead>
                                            <TableRow>
                                                {tableHead.map((item, index) => (
                                                    <Cell className='pdf-table' key={index}>{item?.name}</Cell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {!loader ? (
                                                vouchers?.length > 0 ? (
                                                    <Fragment>
                                                        {vouchers.map((item, index) => (
                                                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                                                <Cell className='pdf-table' >
                                                                    {moment(item?.created_at).format(
                                                                        "MM-DD-YYYY"
                                                                    )}
                                                                </Cell >
                                                                <Cell className='pdf-table' >
                                                                    {item?.date ? moment(item?.date).format(
                                                                        "MM-DD-YYYY"
                                                                    ):'N/A'}
                                                                </Cell >
                                                                <Cell className='pdf-table'>
                                                                    JV-{item?.id ?? '-'}
                                                                </Cell>
                                                                <Cell className='pdf-table'>
                                                                    {item?.entry_no ?? '-'}
                                                                </Cell>
                                                                <Cell className='pdf-table'>
                                                                    {item?.total_amount ?? '-'}
                                                                </Cell>
                                                                <Cell className='pdf-table'>
                                                                    <Tooltip
                                                                        className='pdf-hide'
                                                                        title={item?.notes ?? "-"}
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
                                                                        {
                                                                            item?.notes?.length > 12
                                                                                ? item?.notes?.slice(0, 8) + "..." : item?.notes
                                                                        }
                                                                    </Tooltip>
                                                                    <Box
                                                                        component={"div"}
                                                                        className='pdf-show'
                                                                        sx={{ display: "none !important" }}
                                                                    >
                                                                        {item?.notes ?? "-"}
                                                                    </Box>
                                                                </Cell>
                                                                <Cell className='pdf-table'>
                                                                    <Tooltip
                                                                        className='pdf-hide'
                                                                        title={item?.creator?.name ?? "-"}
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
                                                                        {
                                                                            item?.creator?.name?.length > 12
                                                                                ? item?.creator?.name?.slice(0, 8) + "..." : item?.creator?.name
                                                                        }
                                                                        <Box
                                                                            component={"div"}
                                                                            className='pdf-show'
                                                                            sx={{ display: "none !important" }}
                                                                        >
                                                                            {item?.creator?.name ?? "-"}
                                                                        </Box>
                                                                    </Tooltip>
                                                                </Cell>
                                                                <Cell >
                                                                    {true && <Box component={'div'} className='pdf-hide' sx={{ display: 'flex', gap: '20px' ,justifyContent:'space-between'}}>
                                                                        <Box
                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/journal-voucher-detail/${item?.id}`
                                                                                )
                                                                            }
                                                                        >
                                                                            <IconButton
                                                                                sx={{
                                                                                    bgcolor: Colors.primary,
                                                                                    "&:hover": {
                                                                                        bgcolor:
                                                                                            Colors.primary,
                                                                                    },
                                                                                }}
                                                                            >
                                                                                <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/journal-voucher-detail/${item?.id}`)} width={'35px'}></Box>
                                                                            </IconButton>
                                                                        </Box>
                                                                        <Box>
                                                                        <IconButton
                                                                            sx={{
                                                                                bgcolor: Colors.primary,
                                                                                "&:hover": {
                                                                                    bgcolor:
                                                                                        Colors.primary,
                                                                                },
                                                                            }}
                                                                        >
                                                                            <Box component={'img'} src={Images.deleteIcon} onClick={() => {setConfirmationDialog(true); setSelectedVisa(item)}} width={'35px'}></Box>
                                                                        </IconButton>
                                                                        </Box>
                                                                    </Box>}
                                                                </Cell>
                                                            </Row>
                                                        ))}
                                                    </Fragment>
                                                ) : (
                                                    <Row>
                                                        <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                                                            No Data Found
                                                        </Cell>
                                                    </Row>
                                                )) : (
                                                <Row>
                                                    <Cell colSpan={tableHead.length + 2} align="center" sx={{ fontWeight: 600 }}>
                                                        <Box className={classes.loaderWrap}>
                                                            <CircularProgress />
                                                        </Box>
                                                    </Cell>
                                                </Row>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </PDFExport>
                            {/* ========== Pagination ========== */}
                            <Pagination
                                currentPage={currentPage}
                                pageSize={pageLimit}
                                onPageSizeChange={(size) => getVouchers(1, size.target.value)}
                                tableCount={vouchers?.length}
                                totalCount={totalCount}
                                onPageChange={(page) => getVouchers(page, '')}
                            />

                        </Fragment>
                    ) : (
                        <CircleLoading />
                    )}





                </Grid>
            </Box>

        </Box>
    );
}

export default JournalVoucherList;