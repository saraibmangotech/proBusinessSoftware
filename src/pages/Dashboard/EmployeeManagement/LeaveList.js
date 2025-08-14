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
import ExcelJS from "exceljs";
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

function LeaveList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [status2, setStatus2] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [statusDialog2, setStatusDialog2] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const { user } = useAuth()
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



    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeData, setEmployeeData] = useState(null)



    // *For Filters
    const [filters, setFilters] = useState({});

    // *For Permissions
    const [permissions, setPermissions] = useState();

    const [loading, setLoading] = useState(false)
    const [sort, setSort] = useState('desc')

    // *For Get Customer Queue

    const downloadEmployeeExcel = () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Leave List")

        // Set professional header and footer
        worksheet.headerFooter.oddHeader =
            '&C&"Arial,Bold"&18EMPLOYEE LIST\n' +
            '&C&"Arial,Regular"&12Your Company Name\n' +
            '&C&"Arial,Regular"&10Period: &D - &T\n' +
            '&L&"Arial,Regular"&8Generated on: ' +
            new Date().toLocaleDateString() +
            "\n" +
            '&R&"Arial,Regular"&8Page &P of &N'

        worksheet.headerFooter.oddFooter =
            '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
            '&C&"Arial,Regular"&8This report contains employee data as of ' +
            new Date().toLocaleDateString() +
            '&R&"Arial,Regular"&8Generated by: HR Department\n' +
            '&C&"Arial,Regular"&8Powered by Premium Business Solutions'

        worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter

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
        const titleRow = worksheet.addRow(["EMPLOYEE LIST"])
        titleRow.getCell(1).font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "2F4F4F" },
        }
        titleRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A1:H1")

        const companyRow = worksheet.addRow([agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
            ? "PREMIUM BUSINESSMEN SERVICES"
            : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"])
        companyRow.getCell(1).font = {
            name: "Arial",
            size: 14,
            bold: true,
            color: { argb: "4472C4" },
        }
        companyRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A2:H2")

        const dateRow = worksheet.addRow([
            `Report Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`,
        ])
        dateRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        dateRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells("A3:H3")

        // Add empty row for spacing
        worksheet.addRow([])

        const headers = ["SR No.", "Name", "Requested Date", "Start Date", "End Date", "Total Days", "Type", "Status"]

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

        customerQueue.forEach((employee, index) => {
            const dataRow = worksheet.addRow([
                index + 1, // SR No.
                `${employee?.employee?.name ?? "-"}-${employee?.employee?.employee_id ?? ""}`, // Name with employee ID
                moment(employee?.created_at).format("DD/MM/YYYY"), // Requested Date
                moment(employee?.start_date).format("DD/MM/YYYY"), // Start Date
                moment(employee?.end_date).format("DD/MM/YYYY"), // End Date
                employee?.type === "Personal Time" ? `${employee?.requested_minutes} (Minutes)` : (employee?.total_days ?? "-"), // Total Days
                employee?.is_halfday ? `${employee?.type} (HalfDay)` : (employee?.type ?? "-"), // Type
                employee?.status ?? "-", // Status
            ])

            // Style data rows
            dataRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 }
                cell.alignment = {
                    horizontal: "left",
                    vertical: "middle",
                }
                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                }

                if (colNumber === 8) {
                    // Status column
                    const status = cell.value?.toLowerCase()
                    if (status === "approved") {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "E8F5E8" }, // Light green for Approved
                        }
                    } else if (status === "rejected") {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFE8E8" }, // Light red for Rejected
                        }
                    } else if (status === "pending") {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFF3CD" }, // Light yellow for Pending
                        }
                    } else if (status === "partial") {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "ADD8E6" }, // Light blue for Partial
                        }
                    }
                }
            })
        })

        if (customerQueue.length > 0) {
            // Count different status types
            const approvedCount = customerQueue.filter((emp) => emp?.status?.toLowerCase() === "approved").length
            const pendingCount = customerQueue.filter((emp) => emp?.status?.toLowerCase() === "pending").length
            const rejectedCount = customerQueue.filter((emp) => emp?.status?.toLowerCase() === "rejected").length
            const partialCount = customerQueue.filter((emp) => emp?.status?.toLowerCase() === "partial").length

            // Get unique leave types
            const leaveTypes = [...new Set(customerQueue.map((emp) => emp?.type).filter(Boolean))]

            // Add empty row before summary
            worksheet.addRow([])

            // Add summary rows
            const summaryRow1 = worksheet.addRow(["Summary:", "", "", "", "", `Total Requests: ${customerQueue.length}`, "", ""])

            const summaryRow2 = worksheet.addRow(["", "", "", "", "", `Approved: ${approvedCount}`, "", ""])

            const summaryRow3 = worksheet.addRow(["", "", "", "", "", `Pending: ${pendingCount}`, "", ""])

            const summaryRow4 = worksheet.addRow(["", "", "", "", "", `Rejected: ${rejectedCount}`, "", ""])

            const summaryRow5 = worksheet.addRow(["", "", "", "", "", `Partial: ${partialCount}`, "", ""])

            const summaryRow6 = worksheet.addRow(["", "", "", "", "", `Leave Types: ${leaveTypes.length}`, "", ""])

                // Style summary rows
                ;[summaryRow1, summaryRow2, summaryRow3, summaryRow4, summaryRow5, summaryRow6].forEach((row) => {
                    row.eachCell((cell, colNumber) => {
                        if (colNumber === 1 || colNumber === 6) {
                            cell.font = {
                                name: "Arial",
                                bold: colNumber === 1,
                                size: 10,
                                color: { argb: "2F4F4F" },
                            }
                        }
                    })
                })
        }

        worksheet.columns = [
            { width: 8 }, // SR No.
            { width: 25 }, // Name
            { width: 15 }, // Requested Date
            { width: 15 }, // Start Date
            { width: 15 }, // End Date
            { width: 15 }, // Total Days
            { width: 20 }, // Type
            { width: 12 }, // Status
        ]

        // Add workbook properties
        workbook.creator = "HR Department"
        workbook.lastModifiedBy = "HR System"
        workbook.created = new Date()
        workbook.modified = new Date()
        workbook.lastPrinted = new Date()

        // Set workbook properties
        workbook.properties = {
            title: "Employee List",
            subject: "HR Report",
            keywords: "employee list, staff, human resources, personnel",
            category: "HR Reports",
            description: "Employee list report generated from HR system",
            company: "Your Company Name",
        }

        // Add empty rows for spacing before footer
        worksheet.addRow([])
        worksheet.addRow([])

        // Add the electronically generated report text with black border
        const reportRow = worksheet.addRow(["This is electronically generated report"])
        reportRow.getCell(1).font = {
            name: "Arial",
            size: 12,
            bold: false,
            color: { argb: "000000" },
        }
        reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
        reportRow.getCell(1).border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
        }
        worksheet.mergeCells(`A${reportRow.number}:H${reportRow.number}`)

        // Add powered by line
        const poweredByRow = worksheet.addRow(["Powered by : MangotechDevs.ae"])
        poweredByRow.getCell(1).font = {
            name: "Arial",
            size: 10,
            italic: true,
            color: { argb: "666666" },
        }
        poweredByRow.getCell(1).alignment = { horizontal: "center" }
        worksheet.mergeCells(`A${poweredByRow.number}:H${poweredByRow.number}`)

        // Add empty row for spacing
        worksheet.addRow([])

        const download = async () => {
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            saveAs(blob, `Leave_List_${moment().format("MM-DD-YYYY")}.xlsx`)
        }
        download()
    }

    const getCustomerQueue = async (value) => {
        setLoader(true)

        try {

            let params = {
                page: 1,
                limit: 999999,
                status: value?.id


            }

            const { data } = await CustomerServices.getLeaves(params)
            setCustomerQueue(data?.leaveRequests?.rows)

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


            const { message } = await CustomerServices.deleteLeave(params)

            SuccessToaster(message);
            getCustomerQueue()
        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    const getEmployeeDetail = async (id, newData) => {


        try {
            let params = { user_id: id }


            const { data } = await CustomerServices.getLeaveDetail(params)
            const status = newData?.status?.toLowerCase();
            const type = newData?.type?.toLowerCase();

            if ((status?.toLowerCase() === 'pending' || status?.toLowerCase() == 'partial') && (newData?.user_id != user?.id)) {
                setStatusDialog(true);
            }

            console.log(data, 'datadatadata');
            let leaves = data?.leaves
            setEmployeeData(data?.employee)
            if (newData?.type == 'Bereavement') {
                if (newData?.additional_type == 'Spouse') {
                    let leaveBalance = Math.floor(leaves?.bereavement_leave_spouse)
                    let appliedDays = parseFloat(newData?.total_days)
                    let approvedDays = appliedDays > leaveBalance ?
                        leaveBalance :
                        appliedDays
                    console.log(appliedDays, 'appliedDays');
                    setValue('leaves', leaveBalance)
                    setValue('applied', appliedDays)
                    setValue('approved',
                        approvedDays)
                    setValue('balanced',
                        leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                    setValue('absent',
                        appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
                }
                else {
                    let leaveBalance = Math.floor(leaves?.bereavement_leave_other)
                    let appliedDays = parseFloat(newData?.total_days)
                    let approvedDays = appliedDays > leaveBalance ?
                        leaveBalance :
                        appliedDays
                    console.log(leaveBalance, 'leaveBalance');
                    setValue('leaves', leaveBalance)
                    setValue('applied', appliedDays)
                    setValue('approved',
                        approvedDays)
                    setValue('balanced',
                        leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                    setValue('absent',
                        appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
                }

            }
            else if (newData?.type == 'Annual') {
                console.log(data, 'leavesleaves');
                if (newData?.is_halfday) {

                    let leaveBalance = parseFloat(leaves?.annual_leave_balance)
                    let appliedDays = parseFloat(newData?.total_days)
                    let approvedDays = appliedDays > leaveBalance ?
                        leaveBalance :
                        appliedDays
                    console.log(appliedDays, 'appliedDays');
                    setValue('leaves', leaveBalance)
                    setValue('applied', 0.5)
                    setValue('approved',
                        0.5)
                    setValue('balanced',
                        leaveBalance - appliedDays < 0 ? 0 : leaveBalance - 0.5)
                    setValue('absent',
                        appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
                }
                else {

                    let leaveBalance = parseFloat(leaves?.annual_leave_balance)
                    let appliedDays = parseFloat(newData?.total_days)
                    let approvedDays = appliedDays > leaveBalance ?
                        leaveBalance :
                        appliedDays
                    console.log(appliedDays, 'appliedDays');
                    setValue('leaves', leaveBalance)
                    setValue('applied', appliedDays)
                    setValue('approved',
                        approvedDays)
                    setValue('balanced',
                        leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                    setValue('absent',
                        appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
                }

            }

            else if (newData?.type == 'Sick') {
                console.log(leaves, 'leavesleaves');

                console.log(newData, 'leavesleaves');
                let leaveBalance = parseFloat(leaves?.sick_leave_full_balance || 0) + parseFloat(leaves?.sick_leave_half_balance || 0) + parseFloat(leaves?.sick_leave_unpaid_balance || 0)
                let appliedDays = parseFloat(newData?.total_days)
                let approvedDays = appliedDays > leaveBalance ?
                    leaveBalance :
                    appliedDays
                console.log(appliedDays, 'appliedDays');
                setValue('leaves', leaveBalance)
                setValue('applied', appliedDays)
                setValue('approved',
                    approvedDays)
                setValue('balanced',
                    leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                setValue('absent',
                    appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
            }
            else if (newData?.type == 'Maternity') {
                console.log(data, 'leavesleaves');

                let leaveBalance = parseFloat(leaves?.maternity_leave_full_balance || 0) + parseFloat(leaves?.maternity_leave_half_balance || 0) + parseFloat(leaves?.maternity_leave_unpaid_balance || 0)
                let appliedDays = parseFloat(newData?.total_days)
                let approvedDays = appliedDays > leaveBalance ?
                    leaveBalance :
                    appliedDays
                console.log(appliedDays, 'appliedDays');
                setValue('leaves', leaveBalance)
                setValue('applied', appliedDays)
                setValue('approved',
                    approvedDays)
                setValue('balanced',
                    leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                setValue('absent',
                    appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
            }
            else if (newData?.type == 'Paternal') {
                console.log(data, 'leavesleaves');

                let leaveBalance = parseFloat(leaves?.parental_leave || 0)
                let appliedDays = parseFloat(newData?.total_days)
                let approvedDays = appliedDays > leaveBalance ?
                    leaveBalance :
                    appliedDays
                console.log(appliedDays, 'appliedDays');
                setValue('leaves', leaveBalance)
                setValue('applied', appliedDays)
                setValue('approved',
                    approvedDays)
                setValue('balanced',
                    leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                setValue('absent',
                    appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
            }
            else if (newData?.type == 'Personal Time') {
                console.log(leaves, 'leavesleaves');
                setValue('requested_mint', newData?.requested_minutes)
                setValue('balanceMint', leaves?.personal_time_balance)
                let leaveBalance = parseFloat(leaves?.annual_leave_balance)
                let appliedDays = parseFloat(newData?.total_days)
                let approvedDays = appliedDays > leaveBalance ?
                    leaveBalance :
                    appliedDays
                console.log(appliedDays, 'appliedDays');
                setValue('leaves', leaveBalance)
                setValue('applied', appliedDays)
                setValue('approved',
                    approvedDays)
                setValue('balanced',
                    leaveBalance - appliedDays < 0 ? 0 : leaveBalance - appliedDays)
                setValue('absent',
                    appliedDays - leaveBalance < 0 ? 0 : appliedDays - leaveBalance)
            }

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    const UpdateStatus = async () => {
        let appliedDays = parseFloat(selectedData?.total_days)
        let approvedDays = Math.floor(customerQueue?.leaves_balance)
        console.log(customerQueue, 'customerQueue');

        console.log(appliedDays, 'appliedDays');
        console.log(approvedDays, 'appliedDays');
        try {
            let obj = {
                id: selectedData?.id,
                status: status?.id,
                hr_statement: getValues('statement'),
                user_id: selectedData?.user_id,
                approved_days: selectedData?.is_halfday ? 0.5 : getValues('approved'),
                requested_minutes: getValues('requested_mint'),
                absent_days: selectedData?.is_halfday ? 0 : getValues('applied') - getValues('approved'),
                balance_after: selectedData?.is_halfday ? Math.floor(getValues('balanced')) - 0.5 : Math.floor(getValues('balanced')) - getValues('approved'),
            };
            console.log(obj, 'obj');

            const promise = CustomerServices.LeaveStatus(obj);
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
            accessorKey: "id",


        },
        {
            header: "Name",
            accessorKey: "name",
            accessorFn: (row) => row?.employee?.name,
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.employee?.name}-{row?.original?.employee?.employee_id}
                </Box>
            ),


        },
        {
            id: "created_at",
            header: "Requested Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.created_at).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.created_at).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            id: "start_date",
            header: "Start Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.start_date).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.start_date).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            id: "end_date",
            header: "End Date",
            // Remove accessorKey and fix accessorFn to use row directly
            accessorFn: (row) => moment(row.end_date).format("DD/MM/YYYY"),
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row.original.end_date).format("DD/MM/YYYY")}
                </Box>
            ),
        },
        {
            header: "Total Days",
            accessorKey: "total_days",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.type == 'Personal Time' ? row?.original?.requested_minutes + ' ' + '(Minutes)' : row?.original?.total_days}
                </Box>
            ),


        },
        {
            header: "Type",
            accessorKey: "type",
            cell: ({ row }) => (
                <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.is_halfday ? row?.original?.type + ' ' + '(HalfDay)' : row?.original?.type}
                </Box>
            ),


        },
        {
            header: "Document",
            accessorKey: "document",
            cell: ({ row }) => {
                const { document: file, name } = row.original;
                const extension = file?.split('.').pop().toLowerCase();

                const getIcon = () => {
                    if (['png', 'jpg', 'jpeg'].includes(extension)) return Images.uploadImage;
                    if (extension === 'pdf') return Images.uploadPDF;
                    if (['xls', 'xlsx'].includes(extension)) return Images.uploadXls;
                    return Images.docIcon;
                };

                return file ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            component="img"
                            src={getIcon()}
                            alt="file icon"
                            width="50px"
                            sx={{ cursor: 'pointer' }}
                            onClick={() =>
                                window.open(
                                    `${process.env.REACT_APP_IMAGE_BASE_URL}${file}`,
                                    '_blank'
                                )
                            }
                        />
                        <p
                            onClick={() =>
                                window.open(
                                    `${process.env.REACT_APP_IMAGE_BASE_URL}${file}`,
                                    '_blank'
                                )
                            }
                            style={{
                                color: 'blue',
                                width: '80px',
                                cursor: 'pointer',
                                margin: 0,
                            }}
                        >
                            {name || 'Document'}
                        </p>
                    </Box>
                ) : null;
            },
        }
        ,
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const status = row?.original?.status?.toLowerCase();

                const getChipProps = (status) => {
                    switch (status) {
                        case "approved":
                            return { label: "Approved", color: "success" };
                        case "rejected":
                            return { label: "Rejected", color: "error" };
                        case "pending":
                            return { label: "Pending", color: "warning" };
                        case "partial":
                            return {
                                label: "Partial",
                                sx: {
                                    backgroundColor: "#ADD8E6", // Light blue
                                    color: "white",
                                    fontWeight: "bold"
                                }
                            };
                        default:
                            return { label: status || "Unknown", color: "default" };
                    }
                };

                const chipProps = getChipProps(status);

                return (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Chip
                            {...chipProps}
                            sx={{
                                textTransform: "capitalize",
                                cursor: "pointer",
                                ...chipProps.sx, // merge custom styles for partial
                            }}
                            onClick={async () => {
                                setSelectedData(row?.original);
                                await getEmployeeDetail(row?.original?.user_id, row?.original);
                            }}
                        />
                    </Box>
                );
            },
        },




        {
            header: "Actions",
            cell: ({ row }) => (

                <Box sx={{ display: 'flex', gap: 1 }}>

                    {row?.original?.status?.toLowerCase() == 'pending' && <Box
                        component={'img'}
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate(`/update-leave/${row?.original?.id}`, {
                                state: row?.original
                            });
                        }}
                        src={Images.editIcon}
                        width={'35px'}
                    />}

                    <Box>


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
                                label={"Select Status "}
                                options={

                                    [
                                        { id: 'Pending', name: "Pending" },
                                        { id: 'Approved', name: "Approved" },
                                        { id: 'Rejected', name: "Rejected" },
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
                        {selectedData?.type != 'Personal Time' ? <Grid container m={1} spacing={2}>
                            <Grid item xs={12} sm={12}>

                                <InputField
                                    label={"Employee Leaves :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Employee Leaves "}
                                    error={errors?.leaves?.message}
                                    register={register("leaves", {
                                        required:
                                            "Please enter leaves."

                                    })}
                                />


                            </Grid>
                            <Grid item xs={6} sm={6}>

                                <InputField
                                    label={"Applied Days :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Applied Days "}
                                    error={errors?.applied?.message}
                                    register={register("applied", {
                                        required:
                                            "Please enter applied."

                                    })}
                                />


                            </Grid>
                            <Grid item xs={6} sm={6}>

                                <InputField
                                    label={"Approved Days :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Approved Days "}
                                    error={errors?.approved?.message}
                                    register={register("approved", {
                                        required:
                                            "Please enter approved."

                                    })}
                                />


                            </Grid>
                            <Grid item xs={6} sm={6}>

                                <InputField
                                    label={"Absent Days :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Absent Days "}
                                    error={errors?.absent?.message}
                                    register={register("absent", {
                                        required:
                                            "Please enter absent."

                                    })}
                                />


                            </Grid>
                            <Grid item xs={6} sm={6}>

                                <InputField
                                    label={"Balanced Days :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Balanced Days "}
                                    error={errors?.balanced?.message}
                                    register={register("balanced", {
                                        required:
                                            "Please enter balanced."

                                    })}
                                />


                            </Grid>
                        </Grid> : <>
                            <Grid item xs={6} sm={6}>

                                <InputField
                                    label={"Balanced :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Balanced "}
                                    error={errors?.balanceMint?.message}
                                    register={register("balanceMint", {
                                        required:
                                            "Please enter balanceMint."

                                    })}
                                />


                            </Grid>
                            <Grid item xs={6} sm={6}>

                                <InputField
                                    label={"Requested Minutes :"}
                                    size={'small'}
                                    disabled={true}
                                    placeholder={"Requested Minutes "}
                                    error={errors?.requested_mint?.message}
                                    register={register("requested_mint", {
                                        required:
                                            "Please enter requested_mint."

                                    })}
                                />


                            </Grid></>}
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"HR Statement :*"}
                                size={'small'}
                                multiline
                                rows={4}
                                placeholder={"HR Statement "}
                                error={errors?.statement?.message}
                                register={register("statement", {
                                    required:
                                        "Please enter statement."

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
            <SimpleDialog
                open={statusDialog2}
                onClose={() => setStatusDialog2(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status "}
                                options={

                                    [
                                        { id: 'Pending', name: "Pending" },
                                        { id: 'Approved', name: "Approved" },
                                        { id: 'Rejected', name: "Rejected" },
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
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"Employee Leaves :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Employee Leaves "}
                                error={errors?.leaves?.message}
                                register={register("leaves", {
                                    required:
                                        "Please enter leaves."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Applied Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Applied Days "}
                                error={errors?.applied?.message}
                                register={register("applied", {
                                    required:
                                        "Please enter applied."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Approved Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Approved Days "}
                                error={errors?.approved?.message}
                                register={register("approved", {
                                    required:
                                        "Please enter approved."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Absent Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Absent Days "}
                                error={errors?.absent?.message}
                                register={register("absent", {
                                    required:
                                        "Please enter absent."

                                })}
                            />


                        </Grid>
                        <Grid item xs={6} sm={6}>

                            <InputField
                                label={"Balanced Days :"}
                                size={'small'}
                                disabled={true}
                                placeholder={"Balanced Days "}
                                error={errors?.balanced?.message}
                                register={register("balanced", {
                                    required:
                                        "Please enter balanced."

                                })}
                            />


                        </Grid>
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"HR Statement :*"}
                                size={'small'}
                                multiline
                                rows={4}
                                placeholder={"HR Statement "}
                                error={errors?.statement?.message}
                                register={register("statement", {
                                    required:
                                        "Please enter statement."

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
                                    onClick={() => setStatusDialog2(false)}
                                    bgcolor={"#FF1F25"}
                                    title="No,Cancel"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Leave List</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {true && <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Download Excel"
                        onClick={() => { downloadEmployeeExcel() }}
                        loading={loading}
                    />}
                    {true && <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Create "
                        onClick={() => { navigate('/create-leave'); localStorage.setItem("currentUrl", '/create-customer') }}
                        loading={loading}
                    />}
                </Box>
            </Box>

            {/* Filters */}
            <Box >
                <Grid container>
                    <Grid item xs={3} sm={3}>
                        <SelectField
                            size={"small"}
                            label={"Select Status "}
                            options={

                                [
                                    { id: 'Pending', name: "Pending" },
                                     { id: 'Partial', name: "Partial" },
                                    { id: 'Approved', name: "Approved" },
                                    { id: 'Rejected', name: "Rejected" },
                                ]}
                            selected={status2}
                            onSelect={(value) => {
                                setStatus2(value);
                                getCustomerQueue(value)
                            }}
                            error={errors?.status?.message}
                            register={register("status", {
                                required: "Please select status.",
                            })}
                        />
                    </Grid>
                </Grid>
                {<DataTable loading={loader} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default LeaveList;