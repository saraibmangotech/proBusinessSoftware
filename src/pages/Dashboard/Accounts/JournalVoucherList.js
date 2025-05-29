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
import DataTable from 'components/DataTable';

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


    const tableHead = [{ name: 'Created At', key: '' },  { name: 'Cost Center ', key: '' }, { name: 'JV#', key: 'name' }, { name: 'Entry No', key: 'created_at' }, { name: 'Amount', key: 'commission_visa' }, { name: 'Note', key: 'commission_monthly' }, { name: 'User', key: '' }, { name: 'Actions', key: '' }]

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());



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

    const columns = [
          
            {
                id: "created_at",
                header: "Registration Date",
                // Remove accessorKey and fix accessorFn to use row directly
                accessorFn: (row) => moment(row.created_at).format("MM-DD-YYYY"),
                cell: ({ row }) => (
                  <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.created_at).format("MM-DD-YYYY")}
                  </Box>
                ),
              
      
      
          },
          {
            header: "Cost Center",
            accessorKey: "cost_center",
      
      
          },
          {
            header: "JV#",
            accessorKey: "id",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                 JV-{row?.original?.id ?? '-'}
                </Box>
              ),
      
      
          },
          {
            header: "Entry No.",
            accessorKey: "entry_no",
      
      
          },
          {
            header: "Amount",
            accessorKey: "total_amount",
      
      
          },
          {
            header: "Note",
            accessorKey: "notes",
      
      
          },
          {
            header: "User",
            accessorKey: "name",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                 {row?.original?.creator?.name ?? '-'}
                </Box>
              ),
      
      
          },
          // {
          //   header: "Type",
          //   accessorKey: "cost_center",
          //   cell: ({ row }) => (
          //     <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          //       {row?.original?.is_company ? 'Company' : "Individual"}
          //     </Box>
          //   ),
      
          // },
          {
            id: "created_at",
            header: "Registration Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.created_at).format("DD/MM/YYYY"),
            cell: ({ row }) => (
              <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                {moment(row.original.created_at).format("DD/MM/YYYY")}
              </Box>
            ),
          },
      
         
          {
            header: "Actions",
            cell: ({ row }) => (
      
               <Box component={'div'}  sx={{ display: 'flex', gap: '20px', }}>

              
                    <IconButton
                        onClick={() =>

                            navigate('/general-journal-ledger', {
                                state: row?.original?.entry_id
                            })
                        }
                        sx={{
                            width:'35px',
                            height:'35px',
                            bgcolor:
                                Colors.primary,
                            "&:hover": {
                                bgcolor:
                                    Colors.primary,
                            },
                        }}
                    >
                        <EyeIcon />
                    </IconButton>
              
                <Box
                    onClick={() =>
                        navigate(
                            `/journal-voucher-detail/${row?.original?.id}`
                        )
                    }
                >
                   
                        <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/journal-voucher-detail/${row?.original?.id}`)} width={'35px'}></Box>
                    
                </Box>
                {<Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-journal-voucher/${row?.original?.id}`); localStorage.setItem("currentUrl", '/update-customer') }} src={Images.editIcon} width={'35px'} height={'35px'}></Box>}
                <Box>
                
                        <Box component={'img'} src={Images.deleteIcon} onClick={() => { setConfirmationDialog(true); setSelectedVisa(row?.original) }} width={'35px'}></Box>
                    
                </Box>
            </Box>
            ),
          },
      
        ]

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
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
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










  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setFromDate('invalid')
        return
      }
      console.log(newDate, "newDate")
      setFromDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleToDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setToDate('invalid')
        return
      }
      setToDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
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
                <Grid container spacing={2} mb={4} alignItems={'center'}>
                  
                    <Grid item xs={3}>
                        <DatePicker
                            label={"From Date"}
                            disableFuture={true}
                            size="small"
                            value={fromDate}
                            onChange={(date) => handleFromDate(date)}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <DatePicker
                            label={"To Date"}

                            disableFuture={true}
                            size="small"
                            value={toDate}
                            onChange={(date) => handleToDate(date)}
                        />
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
                    <Grid item xs={3} display={'flex'} justifyContent={'flex-end'} mt={2} gap={2} >
                        <PrimaryButton
                            bgcolor={Colors.white}
                            textcolor={Colors.primary}
                            // border={`1px solid ${Colors.primary}`}
                            title="Reset"
                            onClick={() => { getVouchers(); setValue('search', '') }}
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

              
                   {<DataTable loading={loader} data={vouchers} columns={columns} />}
            </Box>

        </Box>
    );
}

export default JournalVoucherList;