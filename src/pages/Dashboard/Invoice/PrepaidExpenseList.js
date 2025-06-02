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
import { Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addPermission } from 'redux/slices/navigationDataSlice';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import SelectField from 'components/Select';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import DatePicker from 'components/DatePicker';
import FPInvoiceServices from 'services/FPInvoice';

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

function PrepaidExpenses() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [tableData, setTableData] = useState([]);



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());

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


    const getData = async (page, limit, filter) => {
        setLoader(true)

        try {
            const Page = page ? page : currentPage
            const Limit = limit ? limit : pageLimit
            const Filter = filter ? { ...filters, ...filter } : null;
            setCurrentPage(Page)
            setPageLimit(Limit)
            setFilters(Filter)
            let params = {
                page: 1,
                limit: 999999,
                type: "Prepaid Expense",
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',


            }

            const { data } = await FPInvoiceServices.getFPInvoiceList(params)
            console.log(data);

            setTableData(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }







    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getData(1, '', data));
    }



   
    const columns = [
        {
            header: "System #",
            accessorKey: "invoice_number",


        },
        {
            header: "Amortization Months",
            accessorKey: "total_months",


        },
        {
            header: "Months Recorded",
            accessorKey: "months_recorded",


        },
        {
            header: " Date",


            accessorFn: (row) => row?.purchase_date ? moment(row?.purchase_date).format("DD/MM/YYYY") : '',
            cell: ({ row }) => (
                <Box
                    variant="contained"
                    color="primary"
                    sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                >
                    {row?.original?.purchase_date ? moment(row?.original?.purchase_date).format("DD/MM/YYYY") : ''}
                </Box>
            ),
            total: false,
        },
        {
            header: "Vendor Name",
            accessorKey: "name",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {row?.original?.vendor?.name}

                </Box>
            ),


        },
        {
            header: "Total Charges",
            accessorKey: "total_charges",
            cell: ({ row }) => (
                <Box>{parseFloat(row?.original?.total_charges || 0).toFixed(2)}</Box>
            ),
        },
        {
            header: "Tax",
            accessorKey: "tax",
            cell: ({ row }) => (
                <Box>{row?.original?.vat_enabled ? parseFloat(row?.original?.tax || 0).toFixed(2) : parseFloat(0).toFixed(2)}</Box>
            ),
        },
        // {
        //     header: "Paid",
        //     accessorKey: "paid_amount",
        //     cell: ({ row }) => (
        //         <Box>{parseFloat(row?.original?.paid_amount || 0).toFixed(2)}</Box>
        //     ),
        // },


        // {
        //     header: "Balance",
        //     accessorKey: "total_amount",
        //     cell: ({ row }) => (

        //         <Box sx={{ display: 'flex', gap: 1 }}>
        //             {(parseFloat(row?.original?.total_amount) - parseFloat(row?.original?.paid_amount)).toFixed(2)}

        //         </Box>
        //     ),


        // },
        // {
        //     header: "Payment Status",
        //     accessorKey: "total_amount",
        //     cell: ({ row }) => (

        //         <Box sx={{ display: 'flex', gap: 1 }}>
        //             {parseFloat(row?.original?.total_amount) == parseFloat(row?.original?.paid_amount) ? 'Paid' : parseFloat(row?.original?.paid_amount) > 0 ? "Partial Paid" : 'Unpaid'}

        //         </Box>
        //     ),


        // },


        {
            header: "Actions",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '300px' }}>
                    <Box>
                        {row?.original?.paid_amount == 0 && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/update-purchase-invoice/${row?.original?.id}`); localStorage.setItem("currentUrl", '/update-customer') }} src={Images.editIcon} width={'35px'}></Box>}
                    </Box>


                    {/* <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="View Receipts"
                        onClick={() => {
                            localStorage.setItem("currentUrl", '/create-customer');
                            navigate('/fp-payment-history', {
                                state: { id: row?.original?.id }, // Replace 123 with your actual ID
                            });
                        }}
                        loading={loading}
                    /> */}



                    <Tooltip title="Invoice">
                        <IconButton
                            onClick={() => {
                                window.open(
                                    `${process.env.REACT_APP_INVOICE_GENERATOR}generate-fp-invoice?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
                                    '_blank'
                                );
                            }}
                            sx={{
                                backgroundColor: "#f9f9f9",
                                borderRadius: 2,
                                border: "1px solid #eee",
                                width: 35,
                                height: 35,
                            }}
                        >
                            <ReceiptIcon color="black" fontSize="10px" />
                        </IconButton>
                    </Tooltip>

                </Box>
            ),
        },

    ]



    useEffect(() => {
        getData()
    }, []);

    return (
        <Box sx={{ p: 3 }}>

            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false);

                }}
            />
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={

                                    [
                                        { id: false, name: "Disabled" },
                                        { id: true, name: "Enabled" },

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Prepaid Expenses</Typography>
              


            </Box>
            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={8}>
                    <Grid container spacing={1}>
                        <Grid item xs={5}>
                            <DatePicker
                                label={"From Date"}
                                disableFuture={true}
                                size="small"
                                value={fromDate}
                                onChange={(date) => handleFromDate(date)}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <DatePicker
                                label={"To Date"}

                                disableFuture={true}
                                size="small"
                                value={toDate}
                                onChange={(date) => handleToDate(date)}
                            />
                        </Grid>

                        <Grid item xs={2} sx={{ marginTop: "30px" }}>
                            <PrimaryButton
                                bgcolor={"#001f3f"}
                                icon={<SearchIcon />}
                                title="Search"
                                sx={{ marginTop: "30px" }}
                                onClick={() => getData(null, null, null)}
                                loading={loading}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={4} display={'flex'} mt={2.7} justifyContent={'flex-end'}>
                    <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Create"

                        onClick={() => {
                            navigate("/create-prepaid-expense");
                            localStorage.setItem("currentUrl", "/create-prepaid-expense");
                        }}
                        loading={loading}
                    />
                </Grid>
            </Grid>
          

            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={tableData} columns={columns} />}
            </Box>

        </Box>
    );
}

export default PrepaidExpenses;