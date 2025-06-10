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
import ReceiptIcon from '@mui/icons-material/Receipt';
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import DataTable from 'components/DataTable';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import DatePicker from 'components/DatePicker';
import FinanceServices from 'services/Finance';
import LedgerModal from 'LedgerTable';
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

function PaymentVouchers() {

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

    const [data, setData] = useState([])
    const [loader2, setLoader2] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)
    const handleOpenModal = () => {
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
    }

    const getGeneralJournalLedgers = async (number) => {
        setModalOpen(true)
        setLoader2(true)
        try {

            let params = {
                page: 1,
                limit: 999999,
                module: 'payment_voucher',
                id: number
            }

            const { data } = await FinanceServices.getGeneralJournalLedgers(params)
            setData(data?.statement?.rows)


        } catch (error) {
            ErrorToaster(error)
        } finally {
            setLoader2(false)
        }
    }

    // *For Get Customer Queue
    const getCustomerQueue = async (page, limit, filter) => {
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
                type: 'payment_voucher',
                from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
                to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',


            }
            params = { ...params, ...Filter }
            const { data } = await CustomerServices.getVouchers(params)
            setCustomerQueue(data?.vouchers?.rows)
            setTotalCount(data?.count)
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
            setLoader(false)
        }
    }



    const downloadExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Payment Vouchers");

        // Set professional header and footer
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18PAYMENT VOUCHERS\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            '&C&"Arial,Regular"&10Period: &D - &T\n' +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N'

        worksheet.headerFooter.oddFooter =
            '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
            '&C&"Arial,Regular"&8This report contains financial data as of ' +
            new Date().toLocaleDateString() +
            '&R&"Arial,Regular"&8Generated by: Finance Department\n' +
            '&C&"Arial,Regular"&8Powered by Premium Business Solutions'

        // Alternative simpler footer format
        worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;

        // Set page setup for professional printing
        worksheet.pageSetup = {
            paperSize: 9, // A4
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.7,
                right: 0.7,
                top: 1.0,
                bottom: 1.0,
                header: 0.3,
                footer: 0.5,
            },
        }

        // Add title section at the top of the worksheet
        const titleRow = worksheet.addRow(["PAYMENT VOUCHERS"])
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        }
        titleRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A1:G1")

        let name = agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC" : 'PREMIUM BUSINESSMAN  SERVICES'
        const companyRow = worksheet.addRow([name])
        companyRow.getCell(1).font = {
            name: "Arial",
            size: 14,
            bold: true,
            color: { argb: "4472C4" },
        }
        companyRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A2:G2")

        const dateRow = worksheet.addRow([
            `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        ])
        dateRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        dateRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A3:G3")

        const dateRow2 = worksheet.addRow([
            (toDate && fromDate) ? `Period:  ${fromDate ? moment(fromDate).format('MM/DD/YYYY') : '-'} To ${toDate ? moment(toDate).format('MM/DD/YYYY') : 'Present'}` : `Period: All `,
        ])
        dateRow2.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        dateRow2.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A4:G4")

        // Add empty row for spacing
        worksheet.addRow([])

        // Define headers based on the columns provided
        const headers = [
            "SR No.",
            "Amount",
            "Cost Center",
            "Payment Mode",
            "Created At",
            "Impact Date",
            "Creator"
        ];

        // Add headers with professional styling
        const headerRow = worksheet.addRow(headers)
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "2F4F4F" }, // Dark slate gray
            }
            cell.font = {
                name: "Arial",
                bold: true,
                color: { argb: "FFFFFF" },
                size: 11,
            }
            cell.alignment = { horizontal: "center", vertical: "middle" }
            cell.border = {
                top: { style: "thin", color: { argb: "000000" } },
                left: { style: "thin", color: { argb: "000000" } },
                bottom: { style: "thin", color: { argb: "000000" } },
                right: { style: "thin", color: { argb: "000000" } },
            }
        })

        // Add data rows
        customerQueue?.forEach((voucher) => {
            const dataRow = worksheet.addRow([
                voucher.voucher_number || '-',
                voucher.amount || '0.00',
                voucher.cost_center || '-',
                voucher.payment_mode || '-',
                voucher.created_at ? moment(voucher.created_at).format("DD/MM/YYYY") : 'N/A',
                voucher.date ? moment(voucher.date).format("DD/MM/YYYY") : 'N/A',
                voucher.creator?.name || '-'
            ]);

            // Style data rows
            dataRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 }
                cell.alignment = {
                    horizontal: colNumber === 2 ? "right" : "left", // Amount column right-aligned
                    vertical: "middle",
                }
                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                }

                // Format amount column
                if (colNumber === 2) {
                    const amount = parseFloat(voucher.amount || '0');
                    cell.numFmt = '#,##0.00';
                    cell.value = amount;
                }
            })
        });

        // Add totals row if there are vouchers
        if (customerQueue?.length > 0) {
            // Calculate total amount
            const totalAmount = customerQueue.reduce((sum, voucher) => {
                return sum + parseFloat(voucher.amount || '0');
            }, 0);

            // Add empty row before totals
            worksheet.addRow([]);

            // Add totals row
            const totalRow = worksheet.addRow([
                "",
                totalAmount.toFixed(2),
                "",
                "Total",
                "",
                "",
                ""
            ]);

            // Style totals row
            totalRow.eachCell((cell, colNumber) => {
                if (colNumber === 2 || colNumber === 4) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "000000" }, // Black
                    }
                    cell.font = {
                        name: "Arial",
                        bold: true,
                        color: { argb: "FFFFFF" },
                        size: 11,
                    }
                    cell.border = {
                        top: { style: "medium", color: { argb: "000000" } },
                        left: { style: "medium", color: { argb: "000000" } },
                        bottom: { style: "medium", color: { argb: "000000" } },
                        right: { style: "medium", color: { argb: "000000" } },
                    }

                    if (colNumber === 2) {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: "right", vertical: "middle" };
                    } else {
                        cell.alignment = { horizontal: "center", vertical: "middle" };
                    }
                }
            });
        }

        // Set column widths
        worksheet.columns = [
            { width: 12 }, // SR No.
            { width: 15 }, // Amount
            { width: 15 }, // Cost Center
            { width: 15 }, // Payment Mode
            { width: 15 }, // Created At
            { width: 15 }, // Impact Date
            { width: 20 }, // Creator
        ];

        // Add workbook properties
        workbook.creator = "Finance Department"
        workbook.lastModifiedBy = "Finance System"
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.lastPrinted = new Date()

        // Set workbook properties
        workbook.properties = {
            title: "Payment Vouchers",
            subject: "Financial Report",
            keywords: "payment vouchers, financial, accounting",
            category: "Financial Reports",
            description: "Payment vouchers report generated from accounting system",
            company: "Your Company Name",
        }

        const poweredByRow = worksheet.addRow([
            `Powered By: MangotechDevs.ae`,
        ])
        poweredByRow.getCell(3).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        poweredByRow.getCell(3).alignment = { horizontal: "center" }
        worksheet.mergeCells(`A${poweredByRow.number}:G${poweredByRow.number}`);

        // Add empty row for spacing
        worksheet.addRow([])

        const download = async () => {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, "Payment_Vouchers.xlsx");
        }
        download();
    };



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
            let params = {
                id: selectedData?.id,
                type: 'payment_voucher'
            }


            const { message } = await CustomerServices.DeleteVoucher(params)

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
            header: "SR No.",
            accessorKey: "voucher_number",



        },
        {
            header: "Amount",
            accessorKey: "amount",


        },
        {
            header: "Cost Center",
            accessorKey: "cost_center",



        },
        {
            header: "Payment Mode",
            accessorKey: "payment_mode",


        },
        {
            header: "Created At",
            accessorKey: 'date', // optional, used for column ID purposes
            accessorFn: (row) => {
                const dateValue = row?.created_at;
                return dateValue ? moment(dateValue).format("DD/MM/YYYY") : "";
            },
            cell: ({ row }) => {
                const dateValue = row?.original?.created_at;
                return (
                    <Box
                        variant="contained"
                        color="primary"
                        sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                    >
                        {dateValue ? moment(dateValue).format("DD/MM/YYYY") : "N/A"}
                    </Box>
                );
            },
        },
        {
            header: "Impact Date",
            accessorKey: 'date', // optional, used for column ID purposes
            accessorFn: (row) => {
                const dateValue = row?.date;
                return dateValue ? moment(dateValue).format("DD/MM/YYYY") : "";
            },
            cell: ({ row }) => {
                const dateValue = row?.original?.date;
                return (
                    <Box
                        variant="contained"
                        color="primary"
                        sx={{ cursor: "pointer", display: "flex", gap: 2 }}
                    >
                        {dateValue ? moment(dateValue).format("DD/MM/YYYY") : "N/A"}
                    </Box>
                );
            },
        },
        {
            header: "Creator",
            accessorKey: "address",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>


                    {row?.original?.creator?.name}

                </Box>
            ),


        },



        {
            header: "Actions",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={() =>


                            getGeneralJournalLedgers(row?.original?.id)
                        }
                        sx={{
                            width: '35px',
                            height: '35px',
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
                    {<Box
                        component={"img"}
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate(`/update-payment-voucher/${row?.original?.id}`);
                            localStorage.setItem("currentUrl", "/update-customer");
                        }}
                        src={Images.editIcon}
                        width={"35px"}
                    ></Box>}
                    <Tooltip title="PDF">
                        <IconButton
                            onClick={() => {
                                window.open(
                                    `${process.env.REACT_APP_INVOICE_GENERATOR}generate-voucher?id=${row?.original?.id}&instance=${process.env.REACT_APP_TYPE}`,
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
                    <Box>

                        {true && <Box sx={{ cursor: 'pointer' }} component={'img'} src={Images.deleteIcon} onClick={() => { setSelectedData(row?.original); setConfirmationDialog(true) }} width={'35px'}></Box>}

                        {/* <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box>  */}
                    </Box>

                </Box>
            ),
        },

    ]



    useEffect(() => {
        getCustomerQueue()
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <LedgerModal
                open={modalOpen}
                onClose={handleCloseModal}
                generalJournalAccounts={data}
                title=" Journal Entries"
                loading={loader2}
            />
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

            <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={12} display={'flex'} mt={2.7} justifyContent={"space-between"} >

                    <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Payment Voucher List</Typography>
                    <Box sx={{display:'flex',justifyContent:'space-between',gap:2}}>
                      
                        {true && <PrimaryButton
                            bgcolor={'#001f3f'}
                            title="Create"
                            onClick={() => { navigate('/create-payment-voucher'); localStorage.setItem("currentUrl", '/create-customer') }}
                            loading={loading}
                        />}
                          <Box >
                            {customerQueue?.length > 0 && (
                               

                                    <PrimaryButton
                                        title={"Export To Excel"}
                                        onClick={() => downloadExcel()}
                                    />
                             
                            )}
                        </Box>
                    </Box>

                </Grid>
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
                                onClick={() => getCustomerQueue(null, null, null)}
                                loading={loading}
                            />
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>



            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default PaymentVouchers;