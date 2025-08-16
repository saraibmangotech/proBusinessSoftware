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
import { PrimaryButton, SwitchButton } from 'components/Buttons';
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
import FinanceServices from 'services/Finance';
import BuildIcon from '@mui/icons-material/Build';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
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

function EmployeeList() {

    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useDispatch();
    const contentRef = useRef(null);
    const [status, setStatus] = useState(null)
    const [statusDialog, setStatusDialog] = useState(false)
    const [statusDialog2, setStatusDialog2] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const [tableLoader, setTableLoader] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [inputError, setInputError] = useState(false)


    const { user } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        formState: { errors: errors2 },
        setValue: setValue2,
        getValues: getValues2,
        reset: reset2,
        watch: watch2
    } = useForm();

    const password = watch2("password")
    const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Token Number.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]
    // *For Update Account Status
    const updateAccountStatus = async (id, status) => {
        const shallowCopy = [...customerQueue];
        let accountIndex = shallowCopy.findIndex(item => item.id == id);

        if (accountIndex != -1) {
            shallowCopy[accountIndex].is_active = status;
        }

        setCustomerQueue(shallowCopy)


        try {
            let obj = {
                user_id: id,
                is_active: status
            }


            const promise = FinanceServices.updateEmployee(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );


            // getAccounts()
        } catch (error) {
            showErrorToast(error)
        }
    }

    const [loader, setLoader] = useState(false);

    const [confirmationDialog, setConfirmationDialog] = useState(false)

    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);



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

            const { data } = await CustomerServices.getEmployees(params)
            setCustomerQueue(data?.employees?.rows)

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
                user_id: selectedData?.user_id,
                adjustment_type: status?.id,
                leave_days: getValues('leave'),
                description: getValues('description')
            };

            const promise = CustomerServices.adjustLeaves(obj);
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
                reset()
            }
        } catch (error) {
            console.log(error);
        }
    };

    const UpdateStatus2 = async () => {
        try {
            let obj = {
                user_id: selectedData?.user_id,
                password: getValues2('password'),

            };

            const promise = CustomerServices.updateEmployeePassword(obj);
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
                setStatusDialog2(false);
                setStatus(null)
                getCustomerQueue();
                reset2()
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
            header: "Employee Code",
            accessorKey: "employee_code",
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.employee_code}
                </Box>
            ),
        },
        {
            header: "Name",
            accessorKey: "user.name", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.name}
                </Box>
            ),
        },
        {
            header: "Phone",
            accessorKey: "user.phone", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.phone}
                </Box>
            ),
        },
        {
            header: "Email",
            accessorKey: "user.email", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.email}
                </Box>
            ),
        },
        {
            header: "Designation",
            accessorKey: "designation", // ✅ already correct
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.designation}
                </Box>
            ),
        },
        {
            header: "Department",
            accessorKey: "department", // ✅ already correct
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.department}
                </Box>
            ),
        },
        {
            header: "Status",
            accessorKey: "is_active", // ✅ change this to allow search/filter on active status
            cell: ({ row }) => (
                <Box className="pdf-hide" sx={{ display: 'flex', justifyContent: 'center' }}>
                    <SwitchButton
                        sx={{
                            '& .MuiButtonBase-root': {
                                width: '28px',
                                height: '28px'
                            }
                        }}
                        isChecked={row?.original?.is_active}
                        setIsChecked={() => updateAccountStatus(row?.original?.id, !row?.original?.is_active)}
                    />
                </Box>
            ),
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Update Password" arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedData(row?.original);
                                setStatusDialog2(true);
                            }}
                        >
                            <VpnKeyIcon sx={{ color: 'black', fontSize: '14px' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Adjust Leaves" arrow>
                        <IconButton
                            onClick={() => {
                                setSelectedData(row?.original);
                                setStatusDialog(true);
                            }}
                        >
                            <BuildIcon sx={{ color: 'black', fontSize: '14px' }} />
                        </IconButton>
                    </Tooltip>

                    <Box
                        component="img"
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate(`/update-employee/${row?.original?.user_id}`);
                            localStorage.setItem("currentUrl", '/update-customer');
                        }}
                        src={Images.editIcon}
                        width="35px"
                    />
                </Box>
            ),
        },
    ];

const downloadEmployeeExcel = () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Employee List")

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
  worksheet.mergeCells("A1:AO1")
const companyName =
      agencyType[process.env.REACT_APP_TYPE]?.name
  const companyRow = worksheet.addRow([
   agencyType[process.env.REACT_APP_TYPE]?.name
  ])
  companyRow.getCell(1).font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: "4472C4" },
  }
  companyRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells("A2:AO2")

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
  worksheet.mergeCells("A3:AO3")

  // Add empty row for spacing
  worksheet.addRow([])

  // Updated headers to include all employee fields
  const headers = [
    "SR No.",
    "Employee Code",
    "User ID",
    "Ref ID",
    "Name",
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Passport Number",
    "Date of Birth",
    "Date of Joining",
    "Probation Period (Months)",
    "Probation End Date",
    "Employment Status",
    "Emirates ID",
    "Shift Start",
    "Shift End",
    "Grace Period (Minutes)",
    "Minimum Required Minutes",
    "Short Time Deduction Type",
    "Personal Time Minutes/Month",
    "Leaves Balance",
    "Leave Allocation/Month",
    "Leave Allocation Start After Probation",
    "Carry Forward Leaves",
    "Pension Applicable",
    "Pension Percentage",
    "Pension Percentage Employer",
    "Eligible for Airfare",
    "Airfare Cycle Years",
    "Next Airfare Due Date",
    "Basic Salary",
    "Housing Allowance",
    "Other Allowance",
    "Transport Allowance",
    "Airfare Amount",
    "Designation",
    "Department",
    "Is Active",
    "Is Overtime Eligible",
    "Has Left Job",
    "Date of Leaving",
    "Leaving Reason",
    "Branch",
    "Visa",
    "Work Permit",
    "IBAN",
    "Routing",
    "Cost Center",
    "Is Local",
    "Shift Type",
    "Shift ID",
    "Leave Approver 1",
    "Leave Approver 2",
    "Gender",
    "Nationality",
    "Emergency Contact Name",
    "Emergency Contact Number",
    "Working Days",
    "User Type ID",
    "Role ID",
    "Machine ID",
    "Picture",
    "Created At",
    "Updated At",
  ]

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
      employee?.employee_code ?? "-",
      employee?.user_id ?? "-",
      employee?.user?.ref_id ?? "-",
      employee?.user?.name ?? "-",
      employee?.first_name ?? "-",
      employee?.last_name ?? "-",
      employee?.user?.phone ?? "-",
      employee?.user?.email ?? "-",
      employee?.passport_number ?? "-",
      employee?.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : "-",
      employee?.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : "-",
      employee?.probation_period_months ?? "-",
      employee?.probation_end_date ? new Date(employee.probation_end_date).toLocaleDateString() : "-",
      employee?.employment_status ?? "-",
      employee?.emirates_id ?? "-",
      employee?.shift_start ?? "-",
      employee?.shift_end ?? "-",
      employee?.grace_period_minutes ?? "-",
      employee?.minimum_required_minutes ?? "-",
      employee?.short_time_deduction_type ?? "-",
      employee?.personal_time_minutes_per_month ?? "-",
      employee?.leaves_balance ?? "-",
      employee?.leave_allocation_per_month ?? "-",
      employee?.leave_allocation_start_after_probation ?? "-",
      employee?.carry_forward_leaves ?? "-",
      employee?.pension_applicable ? "Yes" : "No",
      employee?.pension_percentage ?? "-",
      employee?.pension_percentage_employer ?? "-",
      employee?.eligible_for_airfare ? "Yes" : "No",
      employee?.airfare_cycle_years ?? "-",
      employee?.next_airfare_due_date ? new Date(employee.next_airfare_due_date).toLocaleDateString() : "-",
      employee?.basic_salary ?? "-",
      employee?.housing_allowance ?? "-",
      employee?.other_allowance ?? "-",
      employee?.transport_allowance ?? "-",
      employee?.airfare_amount ?? "-",
      employee?.designation ?? "-",
      employee?.department ?? "-",
      employee?.is_active ? "Active" : "Inactive",
      employee?.is_overtime_eligible ? "Yes" : "No",
      employee?.has_left_job ? "Yes" : "No",
      employee?.date_of_leaving ? new Date(employee.date_of_leaving).toLocaleDateString() : "-",
      employee?.leaving_reason ?? "-",
      employee?.branch ?? "-",
      employee?.visa ?? "-",
      employee?.work_permit ?? "-",
      employee?.iban ?? "-",
      employee?.routing ?? "-",
      employee?.cost_center ?? "-",
      employee?.is_local ? "Yes" : "No",
      employee?.shift_type ?? "-",
      employee?.shift_id ?? "-",
      employee?.leave_approver_1 ?? "-",
      employee?.leave_approver_2 ?? "-",
      employee?.gender ?? "-",
      employee?.nationality ?? "-",
      employee?.emergency_contact_name ?? "-",
      employee?.emergency_contact_number ?? "-",
      employee?.working_days ?? "-",
      employee?.user?.user_type_id ?? "-",
      employee?.user?.role_id ?? "-",
      employee?.user?.machine_id ?? "-",
      employee?.user?.picture ?? "-",
      employee?.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "-",
      employee?.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : "-",
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

      // Highlight status column with different colors (column 40 - Is Active)
      if (colNumber === 40) {
        if (cell.value === "Active") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E8F5E8" }, // Light green for Active
          }
        } else if (cell.value === "Inactive") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE8E8" }, // Light red for Inactive
          }
        }
      }
    })
  })

  // Add summary information
  if (customerQueue.length > 0) {
    // Count active and inactive employees
    const activeCount = customerQueue.filter((emp) => emp?.is_active).length
    const inactiveCount = customerQueue.filter((emp) => !emp?.is_active).length

    // Get unique departments
    const departments = [...new Set(customerQueue.map((emp) => emp?.department).filter(Boolean))]

    // Add empty row before summary
    worksheet.addRow([])

    // Add summary rows
    const summaryRow1 = worksheet.addRow([
      "Summary:",
      "",
      "",
      "",
      "",
      `Total Employees: ${customerQueue.length}`,
      "",
      "",
    ])

    const summaryRow2 = worksheet.addRow(["", "", "", "", "", `Active Employees: ${activeCount}`, "", ""])

    const summaryRow3 = worksheet.addRow(["", "", "", "", "", `Inactive Employees: ${inactiveCount}`, "", ""])

    const summaryRow4 = worksheet.addRow(["", "", "", "", "", `Departments: ${departments.length}`, "", ""])

    // Style summary rows
    ;[summaryRow1, summaryRow2, summaryRow3, summaryRow4].forEach((row) => {
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

  // Set column widths for all the new columns
  worksheet.columns = [
    { width: 8 }, // SR No.
    { width: 15 }, // Employee Code
    { width: 10 }, // User ID
    { width: 12 }, // Ref ID
    { width: 20 }, // Name
    { width: 15 }, // First Name
    { width: 15 }, // Last Name
    { width: 15 }, // Phone
    { width: 25 }, // Email
    { width: 15 }, // Passport Number
    { width: 12 }, // Date of Birth
    { width: 12 }, // Date of Joining
    { width: 12 }, // Probation Period
    { width: 12 }, // Probation End Date
    { width: 15 }, // Employment Status
    { width: 15 }, // Emirates ID
    { width: 12 }, // Shift Start
    { width: 12 }, // Shift End
    { width: 12 }, // Grace Period
    { width: 12 }, // Min Required Minutes
    { width: 15 }, // Short Time Deduction
    { width: 15 }, // Personal Time Minutes
    { width: 12 }, // Leaves Balance
    { width: 15 }, // Leave Allocation
    { width: 20 }, // Leave Allocation Start
    { width: 15 }, // Carry Forward Leaves
    { width: 12 }, // Pension Applicable
    { width: 12 }, // Pension Percentage
    { width: 15 }, // Pension Percentage Employer
    { width: 12 }, // Eligible for Airfare
    { width: 12 }, // Airfare Cycle Years
    { width: 15 }, // Next Airfare Due Date
    { width: 12 }, // Basic Salary
    { width: 12 }, // Housing Allowance
    { width: 12 }, // Other Allowance
    { width: 12 }, // Transport Allowance
    { width: 12 }, // Airfare Amount
    { width: 20 }, // Designation
    { width: 15 }, // Department
    { width: 10 }, // Is Active
    { width: 12 }, // Is Overtime Eligible
    { width: 12 }, // Has Left Job
    { width: 12 }, // Date of Leaving
    { width: 20 }, // Leaving Reason
    { width: 15 }, // Branch
    { width: 15 }, // Visa
    { width: 15 }, // Work Permit
    { width: 20 }, // IBAN
    { width: 15 }, // Routing
    { width: 15 }, // Cost Center
    { width: 10 }, // Is Local
    { width: 12 }, // Shift Type
    { width: 10 }, // Shift ID
    { width: 12 }, // Leave Approver 1
    { width: 12 }, // Leave Approver 2
    { width: 10 }, // Gender
    { width: 15 }, // Nationality
    { width: 20 }, // Emergency Contact Name
    { width: 18 }, // Emergency Contact Number
    { width: 12 }, // Working Days
    { width: 12 }, // User Type ID
    { width: 10 }, // Role ID
    { width: 12 }, // Machine ID
    { width: 15 }, // Picture
    { width: 12 }, // Created At
    { width: 12 }, // Updated At
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
  worksheet.mergeCells(`A${reportRow.number}:AO${reportRow.number}`)

  // Add powered by line
  const poweredByRow = worksheet.addRow(["Powered by : MangotechDevs.ae"])
  poweredByRow.getCell(1).font = {
    name: "Arial",
    size: 10,
    italic: true,
    color: { argb: "666666" },
  }
  poweredByRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells(`A${poweredByRow.number}:AO${poweredByRow.number}`)

  // Add empty row for spacing
  worksheet.addRow([])

  const download = async () => {
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    saveAs(blob, `Employee_List_${moment().format("MM-DD-YYYY")}.xlsx`)
  }
  download()
}


    useEffect(() => {
        getCustomerQueue()
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <SimpleDialog open={statusDialog2} onClose={() => setStatusDialog2(false)} title={"Change Password?"}>
                <Box component="form" onSubmit={handleSubmit2(UpdateStatus2)}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12}>
                            <InputField
                                size="small"
                                label="Password :*"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Your Password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                error={errors2.password?.message || (inputError && "You have entered an invalid email or password.")}
                                register={register2("password", {
                                    required: "Please enter the password.",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <InputField
                                size="small"
                                label="Confirm Password :*"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Enter Your Confirm Password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                error={
                                    errors2.confirmpassword?.message || (inputError && "You have entered an invalid email or password.")
                                }
                                register={register2("confirmpassword", {
                                    required: "Please enter the confirm password.",
                                    validate: (value) => value === password || "Passwords do not match.",
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
                                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                                <PrimaryButton onClick={() => setStatusDialog2(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </SimpleDialog>
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
                                label={"Adjustment Type :"}
                                options={[
                                    { id: "add", name: "Add" },
                                    { id: "subtract", name: "Subtract" },




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
                                label={"Leave Days :"}
                                size={'small'}

                                placeholder={"Leave Days "}
                                error={errors?.leave?.message}
                                register={register("leave", {
                                    required:
                                        "Please enter leave."

                                })}
                            />


                        </Grid>
                        <Grid item xs={12} sm={12}>

                            <InputField
                                label={"Description :"}
                                size={'small'}
                                multiline
                                rows={4}

                                placeholder={"Description "}
                                error={errors?.description?.message}
                                register={register("description", {
                                    required:
                                        "Please enter description."

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
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"Are You Sure?"}
                action={() => {
                    setConfirmationDialog(false);
                    handleDelete()

                }}
            />



            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Employee List</Typography>
                <Box sx={{display:'flex',gap:1}}>
                    {true && <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Download Excel "
                        onClick={() => { downloadEmployeeExcel() }}
                        loading={loading}
                    />}
                    {user?.role_id != 1003 && <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Create "
                        onClick={() => { navigate('/create-employee'); localStorage.setItem("currentUrl", '/create-customer') }}
                        loading={loading}
                    />}
                </Box>

            </Box>

            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default EmployeeList;