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
    Input, Drawer,
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
import { agencyType, CommaSeparator, Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
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
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import DatePicker from 'components/DatePicker';


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

function VatRegister() {

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

    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]


    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);
    const [customerQueue2, setCustomerQueue2] = useState([]);
    const [customTotals, setCustomTotals] = useState({});
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [inputVat, setInputVat] = useState(0)
    const [outputVat, setOutputVat] = useState(0)


    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState(null)



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    // *For Get Customer Queue
    const getCustomerQueue = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',

            }

            const { data } = await CustomerServices.getVatInputReport(params)
            setCustomerQueue(data?.report)


            const totalVat = data?.report?.reduce((sum, item) => sum + (item.totalVat || 0), 0);
            console.log(totalVat.toFixed(2));
            setInputVat(totalVat.toFixed(2))

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }

    const getCustomerQueue2 = async (page, limit, filter) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',

            }

            const { data } = await CustomerServices.getVatReport(params)
            setCustomerQueue2(data?.report)


            const totalVat = data?.report?.reduce((sum, item) => sum + (item.totalVat || 0), 0);
            console.log(totalVat.toFixed(2));
            setOutputVat(totalVat.toFixed(2))
            //   setData(data?.totals)


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
        Debounce(() => getCustomerQueue(1, '', data));
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
        Debounce(() => getCustomerQueue(1, '', data));
    }
    const handleDelete = async (item) => {


        try {
            let params = { reception_id: selectedData?.id }


            const { message } = await CustomerServices.deleteReception(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateStatus = async () => {
        try {
            let obj = {
                customer_id: selectedData?.id,
                is_active: status?.id,
            };

            const promise = CustomerServices.CustomerStatus(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                "Saving...",
                "Added Successfully",
                "Something Went Wrong"
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false);
                setStatus(null)
                getCustomerQueue();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const columns = [
        {
            header: "S.No",
            accessorKey: "serialNo",
            total: false,
            cell: ({ row, table }) => {
                const index = table.getSortedRowModel().rows.findIndex(r => r.id === row.id);
                return index + 1;
            }
        },

        {
            header: "Ledger Name",
            accessorKey: "impactAccountName",
            total: false,
            accessorFn: (row) => row?.impactAccountName,
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.impactAccountName}
                </Box>
            ),
        },

        {
            header: "Total Charges",
            accessorKey: "totalCharges",
            total: true,
            accessorFn: (row) => row?.totalCharges,
            cell: ({ row }) => {
                const value = parseFloat(row?.original?.totalCharges || 0).toFixed(2);
                return (
                    <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                        {value}
                    </Box>
                );
            },
        },
        {
            header: "Input Vat",
            accessorKey: "totalVat",
            total: true,
            accessorFn: (row) => parseFloat(row?.totalVat).toFixed(2),
            cell: ({ row }) => {
                const value = parseFloat(row?.original?.totalVat || 0).toFixed(2);
                return (
                    <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                        {value}
                    </Box>
                );
            },
        }




    ];

    const columns2 = [
        {
            header: "S.No",
            accessorKey: "serialNo",
            total: false,
            cell: ({ row, table }) => {
                const index = table.getSortedRowModel().rows.findIndex(r => r.id === row.id);
                return index + 1;
            }
        },

        {
            header: "Ledger Name",
            accessorKey: "impactAccountName",
            total: false,
            accessorFn: (row) => row?.impactAccountName,
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.impactAccountName}
                </Box>
            ),
        },
        {
            header: "Total Govt. Charges",
            accessorKey: "totalGovtCharges",
            total: true,
            accessorFn: (row) => row?.totalGovtCharges,
            cell: ({ row }) => {
                const value = parseFloat(row?.original?.totalGovtCharges || 0).toFixed(2);
                return (
                    <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                        {value}
                    </Box>
                );
            },
        },
        {
            header: "Total Service Charge",
            accessorKey: "totalServiceCharges",
            total: true,
            accessorFn: (row) => row?.totalServiceCharges,
            cell: ({ row }) => {
                const value = parseFloat(row?.original?.totalServiceCharges || 0).toFixed(2);
                return (
                    <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                        {value}
                    </Box>
                );
            },
        },
        {
            header: "Output Vat",
            accessorKey: "totalVat",
            total: true,
            accessorFn: (row) => row?.totalVat,
            cell: ({ row }) => {
                const value = parseFloat(row?.original?.totalVat || 0).toFixed(2);
                return (
                    <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                        {value}
                    </Box>
                );
            },
        }




    ];

    useEffect(() => {
        setFromDate(new Date())
        setToDate(new Date())
        getCustomerQueue()
        getCustomerQueue2()
    }, []);





    const handleExcelDownload = () => {
        const sectionData = [
            { title: 'VAT Output Register', data: customerQueue2, columns: columns2 },
            { title: 'VAT Input Register', data: customerQueue, columns: columns }
        ];

        const worksheetData = [];

        sectionData.forEach(({ title, data, columns }) => {
            if (!data || data.length === 0) return;

            const totals = {};

            // Section title
            worksheetData.push([title]);
            worksheetData.push([]);

            // Column headers
            const headers = columns.map(col => col.header);
            worksheetData.push(headers);

            // Data rows
            data.forEach((row, index) => {
                const dataRow = columns.map((col) => {
                    if (col.header === "S.No") return index + 1;

                    let value = col.accessorFn ? col.accessorFn(row) : row[col.accessorKey];
                    const isNumeric = typeof value === "number" || !isNaN(parseFloat(value));

                    if (col.accessorKey === "pay_method") {
                        value = value?.split(",").join(" & ");
                    }

                    const excludeFromTotal = [
                        "Receipt Date", "Receipt Time", "Card No.", "Category",
                        "Cashier", "Customer Name", "Inv No.", "Receipt No."
                    ];

                    if (isNumeric && col.header !== "S.No" && !excludeFromTotal.includes(col.header)) {
                        totals[col.header] = (totals[col.header] || 0) + parseFloat(value || 0);
                    }

                    return value ?? '';
                });

                worksheetData.push(dataRow);
            });

            // Section total row
            const totalRow = columns.map((col, i) => {
                if (i === 0) return 'TOTAL';
                const val = totals[col.header];
                return val != null ? val.toFixed(2) : '';
            });

            worksheetData.push(totalRow);
            worksheetData.push([]); // Empty row after section
        });
        // Add Net Payable VAT at the end
        const netVat = parseFloat(outputVat - inputVat).toFixed(2);
        worksheetData.push(["Net Payable VAT:", netVat]);
        // Create Excel file
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "VAT Report");

        XLSX.writeFile(workbook, "vat_output_input_register.xlsx");
    };




    return (
        <Box sx={{ p: 3 }}>

            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false);
                    handleDelete()

                }}
            />
            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
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




            {/* Filters */}

            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={9}>
                    <Grid container spacing={1}>
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

                        <Grid item xs={2} sx={{ marginTop: "30px" }}>
                            <PrimaryButton
                                bgcolor={"#001f3f"}
                                icon={<SearchIcon />}
                                title="Search"
                                sx={{ marginTop: "30px" }}
                                onClick={() => { getCustomerQueue(null, null, null); getCustomerQueue2(null, null, null) }}
                                loading={loading}
                            />
                        </Grid>
                        <Grid item xs={3} sx={{ marginTop: "40px" }}>
                            <Typography sx={{ fontSize: '20', fontWeight: 'bold' }}>Net Vat Payable : {parseFloat(parseFloat(outputVat) - parseFloat(inputVat)).toFixed(2)}</Typography>
                        </Grid>

                    </Grid>
                </Grid>
                <Grid item xs={3} display={'flex'} mt={2.7} justifyContent={'flex-end'}>
                    <Grid item>
                        <PrimaryButton
                            bgcolor={"#001f3f"}
                            title="Download Excel"
                            sx={{ marginTop: "30px" }}
                            onClick={() => handleExcelDownload()}
                            loading={loading}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Vat Output Register</Typography>



            {<DataTable loading={loader} total={true} csv={false} data={customerQueue2} columns={columns2} />}


            <Box >

                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Vat Input Register</Typography>
                {<DataTable loading={loader} total={true} csv={false} data={customerQueue} columns={columns} />}


            </Box>

        </Box>
    );
}

export default VatRegister;