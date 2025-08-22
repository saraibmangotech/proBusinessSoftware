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
import { agencyType, Debounce, encryptData, formatPermissionData, handleExportWithComponent } from 'utils';
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
import ExcelJS from "exceljs";

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

function AgingReportReceivable() {

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
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());


    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);



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
            

            }

            const { data } = await CustomerServices.getAgingReportReceivable(params)
            setCustomerQueue(data?.customers)

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
            header: "Name",
            accessorKey: "customer_name",
            accessorFn: (row) => row?.customer_name,
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.customer_name}
                </Box>
            ),
        },
       
        {
            header: "1-30",
            accessorKey: "oneToThirty",
            accessorFn: (row) => parseFloat(row?.totals['1-30'] || 0).toFixed(2),
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.totals['1-30'] || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "31-60",
            accessorKey: "thirtyOneToSixty",
            accessorFn: (row) => parseFloat(row?.totals['31-60'] || 0).toFixed(2),
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.totals['31-60'] || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "61-90",
            accessorKey: "sixtyOneToNinety",
            accessorFn: (row) => parseFloat(row?.totals['61-90'] || 0).toFixed(2),
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.totals['61-90'] || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "Over 90",
            accessorKey: "overNinety",
            accessorFn: (row) => parseFloat(row?.totals['91+'] || 0).toFixed(2),
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.totals['91+'] || 0).toFixed(2)}
                </Box>
            ),
        },
        {
            header: "Total",
            accessorKey: "total",
            accessorFn: (row) => parseFloat(row?.totals['overall'] || 0).toFixed(2),
            cell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 2 }}>
                    {parseFloat(row?.original?.totals['overall'] || 0).toFixed(2)}
                </Box>
            ),
        },
    ];


    const downloadCategoryReportExcel = (data) => {
        if (!data || data.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Aging Report Receivable");

        // Header/Footer & Page setup code remains unchanged...

        // --- Add Title Rows ---
        const titleRow = worksheet.addRow(["AGING REPORT RECEIVABLE"]);
        titleRow.font = { name: "Arial", size: 16, bold: true, color: { argb: "2F4F4F" } };
        titleRow.alignment = { horizontal: "center" };
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + columns.length - 1)}1`);

        const companyName =
           agencyType[process.env.REACT_APP_TYPE]?.name

        const companyRow = worksheet.addRow([companyName]);
        companyRow.font = { name: "Arial", size: 14, bold: true, color: { argb: "4472C4" } };
        companyRow.alignment = { horizontal: "center" };
        worksheet.mergeCells(`A2:${String.fromCharCode(65 + columns.length - 1)}2`);

        const dateRow = worksheet.addRow([
            `Report Generated: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`,
        ]);
        dateRow.font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } };
        dateRow.alignment = { horizontal: "center" };
        worksheet.mergeCells(`A3:${String.fromCharCode(65 + columns.length - 1)}3`);

        const periodText = toDate && fromDate
            ? `Period: ${new Date(fromDate).toLocaleDateString('en-GB')} To ${new Date(toDate).toLocaleDateString('en-GB')}`
            : `Period: All`;
        const periodRow = worksheet.addRow([periodText]);
        periodRow.font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } };
        periodRow.alignment = { horizontal: "center" };
        worksheet.mergeCells(`A4:${String.fromCharCode(65 + columns.length - 1)}4`);

        worksheet.addRow([]);

        // --- Create Header Row Dynamically ---
        const headers = columns.map(col => col.header);
        const headerRow = worksheet.addRow(headers);

        headerRow.eachCell(cell => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2F4F4F" } };
            cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFF" }, size: 11 };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // --- Add Data Rows ---
        const totals = new Array(columns.length).fill(0);

        data.forEach(row => {
            const rowData = columns.map((col, index) => {
                let value = col.accessorFn ? col.accessorFn(row) : row[col.accessorKey];
                const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
                if (isNumeric) {
                    totals[index] += parseFloat(value);
                    return parseFloat(value);
                }
                return value;
            });

            const dataRow = worksheet.addRow(rowData);

            dataRow.eachCell((cell, colIndex) => {
                const isNumber = typeof cell.value === "number";
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = {
                    horizontal: isNumber ? "right" : "left",
                    vertical: "middle"
                };
                if (isNumber) cell.numFmt = "#,##0.00";
                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                };
            });
        });

        worksheet.addRow([]);

        // --- Add Total Row ---
        const totalRow = worksheet.addRow(columns.map((col, index) => {
            if (index === 0) return "TOTAL";
            return parseFloat(totals[index]).toFixed(2);
        }));

        totalRow.eachCell((cell, colIndex) => {
            const isNumber = colIndex > 1;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
            cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFF" }, size: 11 };
            cell.alignment = { horizontal: colIndex === 1 ? "left" : "right", vertical: "middle" };
            cell.border = {
                top: { style: "medium" },
                left: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
            };
            if (colIndex > 0) {
                cell.numFmt = "#,##0.00";
            }
        });

        worksheet.addRow([]);
        worksheet.addRow([]);

        const reportRow = worksheet.addRow(["This is electronically generated report"]);
        reportRow.getCell(1).font = { name: "Arial", size: 12, bold: true, color: { argb: "000000" } };
        reportRow.getCell(1).alignment = { horizontal: "center" };
        reportRow.getCell(1).border = {
            top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" },
        };
        worksheet.mergeCells(`A${reportRow.number}:${String.fromCharCode(65 + columns.length - 1)}${reportRow.number}`);

        const poweredByRow = worksheet.addRow(["Powered by MangotechDevs.ae"]);
        poweredByRow.getCell(1).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } };
        poweredByRow.getCell(1).alignment = { horizontal: "center" };
        worksheet.mergeCells(`A${poweredByRow.number}:${String.fromCharCode(65 + columns.length - 1)}${poweredByRow.number}`);

        worksheet.columns = columns.map((col, i) => ({
            width: i === 0 ? 25 : 15
        }));

        workbook.creator = "Finance Department";
        workbook.created = new Date();

        const download = async () => {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(
                blob,`aging_report_receivable.xlsx`
            );
        };

        download();
    };


    useEffect(() => {
        setFromDate(new Date())
        setToDate(new Date())
        getCustomerQueue()
    }, []);

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


            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}> Aging Report Receivable</Typography>

                {customerQueue?.length > 0 &&
                    <Button
                        onClick={() => downloadCategoryReportExcel(customerQueue)}


                        variant="contained"
                        color="primary"
                        sx={{
                            padding: '10px',
                            textTransform: 'capitalize !important',
                            backgroundColor: "#001f3f !important",
                            fontSize: "12px",
                            ":hover": {
                                backgroundColor: "#001f3f !important",
                            },
                        }}
                    >
                        Export to Excel
                    </Button>}

            </Box>




            <Box >


                {<DataTable loading={loader} total={true} csvName={'category_report'} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default AgingReportReceivable;