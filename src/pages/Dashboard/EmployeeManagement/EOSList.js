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
    TextField,
} from '@mui/material';
import ReceiptIcon from "@mui/icons-material/Receipt";
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import axios from 'axios';
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

function EOSList() {

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
    const [selectedMonth, setSelectedMonth] = useState(dayjs().subtract(1, "month"));


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



    const getCustomerQueue = async (date) => {
        setLoader(true)
        console.log(selectedMonth, 'selectedMonth');


        try {

            let params = {
                month: date ? moment(date).month() + 1 : moment(selectedMonth).month(),
                year: date ? moment(date).year() : moment().year(),
                limit: 999999,



            }

            const { data } = await CustomerServices.getEos(params)
            setCustomerQueue(data?.eos?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            setLoader(false)
        }
    }
  const getImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL("image/png")
      resolve(dataURL)
    }
    img.onerror = reject
    img.src = url
  })
}


const downloadExcel = async (employeeData) => {
  console.log(employeeData, "employeeDataemployeeData")

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Settlement Agreement")

  let logoImageId = null

  if (true) {
    try {
      let logoBase64

      // Handle agencyType logic with Images import
      if (true) {
        const logoUrl = agencyType === "TASHEEL" ? Images.tasheel : Images.aldeed
        if (logoUrl) {
          console.log("[v0] Converting agency logo URL to base64...")
          logoBase64 = await getImageAsBase64(logoUrl)
        }
      }
      // If we have a URL, convert it to base64
      else if (employeeData.logoUrl) {
        console.log("[v0] Converting logo URL to base64...")
        logoBase64 = await getImageAsBase64(employeeData.logoUrl)
      } else {
        // Use existing base64 data
        logoBase64 = employeeData.logoBase64
      }

      // Handle different base64 formats
      let base64Data = logoBase64
      let extension = "png" // default

      // If it's a data URL, extract the base64 part and extension
      if (logoBase64 && logoBase64.startsWith("data:image/")) {
        const matches = logoBase64.match(/data:image\/([a-zA-Z]*);base64,(.*)/)
        if (matches) {
          extension = matches[1]
          base64Data = matches[2]
        }
      }

      if (base64Data) {
        logoImageId = workbook.addImage({
          base64: base64Data,
          extension: extension,
        })
        console.log("[v0] Logo image added to workbook successfully")
      }
    } catch (error) {
      console.log("[v0] Error adding logo image:", error)
      logoImageId = null
    }
  }

  // Page setup
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.7, right: 0.7, top: 1, bottom: 1, header: 0.3, footer: 0.3 },
  }

  const logoRow = worksheet.addRow([""])
  logoRow.height = 80 // Increased height for better logo display
  worksheet.mergeCells("A1:F1")
  logoRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }

  if (logoImageId) {
    try {
      worksheet.addImage(logoImageId, {
        tl: { col: 2, row: 0 }, // Top-left position (column C, row 1)
        ext: { width: 150, height: 50 }, // Logo dimensions
        editAs: "oneCell",
      })
      console.log("[v0] Logo positioned successfully")
    } catch (error) {
      console.log("[v0] Error positioning logo:", error)
    }
  }

  // Company Name and Title - matching image layout
  const companyRow = worksheet.addRow([agencyType[process.env.REACT_APP_TYPE]?.name])
  companyRow.getCell(1).font = { name: "Arial", size: 14, bold: true, color: { argb: "000000" } }
  companyRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells("A2:F2")

  const titleRow = worksheet.addRow(["Settlement Agreement"])
  titleRow.getCell(1).font = { name: "Arial", size: 12, bold: true, color: { argb: "000000" } }
  titleRow.getCell(1).alignment = { horizontal: "center" }
  worksheet.mergeCells("A3:F3")

  worksheet.addRow([]) // spacing

  const employeeDetailsRows = [
    ["Staff:", employeeData?.user?.employee_id || "", "", "Basic Salary:", "", employeeData.user?.employee?.basicSalary || ""],
    [
      "Employee:",
      employeeData.user?.name || "",
      "",
      "Housing Allowance Quarterly 25%:",
      "",
      employeeData.housing_allowance || "",
    ],
    [
      "Designation:",
      employeeData.user?.employee?.designation || "",
      "",
      "Transport:",
      "",
      employeeData.transport_allowance || "",
    ],
    ["Date of Joining:", employeeData.joinDate || "", "", "Other Allowance:", "", employeeData.other_allowance || ""],
    [
      "Date of Resignation:",
      employeeData.user?.employee?.date_of_leaving
        ? new Date(employeeData.user.employee.date_of_leaving).toLocaleDateString("en-GB")
        : "",
      "",
      "Total:",
      "",
      employeeData.salaryPackage || "",
    ],
    [
      "Date of Separation:",
      employeeData.user?.employee?.date_of_leaving
        ? new Date(employeeData.user.employee.date_of_leaving).toLocaleDateString("en-GB")
        : "",
      "",
      "",
      "",
      "",
    ],
  ]

  employeeDetailsRows.forEach((rowData, index) => {
    const row = worksheet.addRow(rowData)

    // Style for labels (columns A, D)
    if (rowData[0]) {
      row.getCell(1).font = { name: "Arial", size: 10, bold: true }
      row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E0E0E0" } }
    }
    if (rowData[3]) {
      row.getCell(4).font = { name: "Arial", size: 10, bold: true }
      row.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E0E0E0" } }
    }

    // Add borders to all cells
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      }
      cell.alignment = { horizontal: "left", vertical: "middle" }
    })
  })

  worksheet.addRow([]) // spacing

  // Salary Section Header
  const salaryHeaderRow = worksheet.addRow(["Salary"])
  salaryHeaderRow.getCell(1).font = { name: "Arial", size: 12, bold: true }
  salaryHeaderRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "808080" } }
  salaryHeaderRow.getCell(1).font.color = { argb: "FFFFFF" }
  worksheet.mergeCells(`A${salaryHeaderRow.number}:F${salaryHeaderRow.number}`)
  salaryHeaderRow.getCell(1).border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  }

  const salaryRows = [
    ["Salary & commission (1st)", "", "", "", "Paid", employeeData.salaryPaid || ""],
    ["Commission (Incentive)", "", "", "", "", employeeData.commission || ""],
    ["Other Allowances", "", "", "", "", employeeData.other_allowance || ""],
    ["Arrear", "", "", "", "", employeeData.arrear || ""],
  ]

  salaryRows.forEach((rowData) => {
    const row = worksheet.addRow(rowData)
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      }
      cell.alignment = { horizontal: "left", vertical: "middle" }
    })
  })

  // Total payment row
  const totalPaymentRow = worksheet.addRow([
    "Total payment",
    "",
    "",
    "",
    "",
    (
      Number.parseFloat(employeeData.commission || 0) +
      Number.parseFloat(employeeData.other_allowance || 0) +
      Number.parseFloat(employeeData.arrear || 0)
    ).toFixed(2),
  ])
  totalPaymentRow.getCell(1).font = { name: "Arial", size: 10, bold: true }
  totalPaymentRow.getCell(6).font = { name: "Arial", size: 10, bold: true }
  totalPaymentRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  worksheet.addRow([]) // spacing

  // Leave Salary Section
  const leaveSalaryHeaderRow = worksheet.addRow(["Leave Salary"])
  leaveSalaryHeaderRow.getCell(1).font = { name: "Arial", size: 12, bold: true }
  leaveSalaryHeaderRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "808080" } }
  leaveSalaryHeaderRow.getCell(1).font.color = { argb: "FFFFFF" }
  worksheet.mergeCells(`A${leaveSalaryHeaderRow.number}:F${leaveSalaryHeaderRow.number}`)
  leaveSalaryHeaderRow.getCell(1).border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  }

  const leaveSalaryRow = worksheet.addRow([
    "Leave Salary",
    "",
    "",
    employeeData.alDay || "15.00",
    "Days",
    employeeData.leaves_encashment || "1,500",
  ])
  leaveSalaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  const totalLeaveSalaryRow = worksheet.addRow([
    "Total Leave Salary Pay",
    "",
    "",
    "",
    "",
    employeeData.leaves_encashment || "1,500",
  ])
  totalLeaveSalaryRow.getCell(1).font = { name: "Arial", size: 10, bold: true }
  totalLeaveSalaryRow.getCell(6).font = { name: "Arial", size: 10, bold: true }
  totalLeaveSalaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  worksheet.addRow([]) // spacing

  // Gratuity Section
  const gratuityHeaderRow = worksheet.addRow(["Gratuity"])
  gratuityHeaderRow.getCell(1).font = { name: "Arial", size: 12, bold: true }
  gratuityHeaderRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "808080" } }
  gratuityHeaderRow.getCell(1).font.color = { argb: "FFFFFF" }
  worksheet.mergeCells(`A${gratuityHeaderRow.number}:F${gratuityHeaderRow.number}`)
  gratuityHeaderRow.getCell(1).border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  }

  const yearsOfService = employeeData.user?.employee?.date_of_joining
    ? ((new Date() - new Date(employeeData.user.employee.date_of_joining)) / (1000 * 60 * 60 * 24 * 365)).toFixed(2)
    : "6.09"

  const gratuityRow = worksheet.addRow(["Gratuity", "", "", yearsOfService, "Years", employeeData.eos || "13,770"])
  gratuityRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  const totalGratuityRow = worksheet.addRow(["Total Gratuity Pay", "", "", "", "", employeeData.eos || "13,770"])
  totalGratuityRow.getCell(1).font = { name: "Arial", size: 10, bold: true }
  totalGratuityRow.getCell(6).font = { name: "Arial", size: 10, bold: true }
  totalGratuityRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  worksheet.addRow([]) // spacing

  const deductionsHeaderRow = worksheet.addRow(["Deductions/Adjustments"])
  deductionsHeaderRow.getCell(1).font = { name: "Arial", size: 12, bold: true }
  deductionsHeaderRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "808080" } }
  deductionsHeaderRow.getCell(1).font.color = { argb: "FFFFFF" }
  worksheet.mergeCells(`A${deductionsHeaderRow.number}:F${deductionsHeaderRow.number}`)
  deductionsHeaderRow.getCell(1).border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  }

  const deductionRow = worksheet.addRow([
    "Less *Late Comings (Deduction)",
    "",
    "",
    "",
    "",
    employeeData.lateComm || "0",
  ])
  deductionRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  const staffAdvanceRow = worksheet.addRow([
    "Staff Advance (Deduction)",
    "",
    "",
    "",
    "",
    employeeData.staffAdvance || "0",
  ])
  staffAdvanceRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
  })

  // Empty rows for additional deductions to match image
  const emptyDeductionRow1 = worksheet.addRow(["", "", "", "", "", ""])
  const emptyDeductionRow2 = worksheet.addRow(["", "", "", "", "", ""])
  const emptyDeductionRow3 = worksheet.addRow(["", "", "", "", "", ""])
  ;[emptyDeductionRow1, emptyDeductionRow2, emptyDeductionRow3].forEach((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      }
    })
    row.height = 25
  })

  const totalDeductions =
    Number.parseFloat(employeeData.staffAdvance || 0) +
    Number.parseFloat(employeeData.lateComm || 0) +
    Number.parseFloat(employeeData.additional || 0) +
    Number.parseFloat(employeeData.salaryDeduction || 0) +
    Number.parseFloat(employeeData.unpaidLeave || 0) +
    Number.parseFloat(employeeData.commissionFinal || 0) +
    Number.parseFloat(employeeData.gpssaEmp || 0)

  const totalDeductionRow = worksheet.addRow(["", "", "", "", "", totalDeductions.toFixed(2)])
  totalDeductionRow.getCell(6).font = { name: "Arial", size: 10, bold: true }
  totalDeductionRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "left", vertical: "middle" }
  })

  worksheet.addRow([]) // spacing

  // NET FINAL PAY - matching image styling
  const netFinalPayRow = worksheet.addRow(["NET FINAL PAY", "", "", "", "", employeeData.netSalary || "15,538"])
  netFinalPayRow.getCell(1).font = { name: "Arial", size: 12, bold: true }
  netFinalPayRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } }
  netFinalPayRow.getCell(1).font.color = { argb: "FFFFFF" }
  netFinalPayRow.getCell(6).font = { name: "Arial", size: 12, bold: true }
  netFinalPayRow.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } }
  netFinalPayRow.getCell(6).font.color = { argb: "FFFFFF" }

  worksheet.mergeCells(`A${netFinalPayRow.number}:E${netFinalPayRow.number}`)
  netFinalPayRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thick", color: { argb: "000000" } },
      left: { style: "thick", color: { argb: "000000" } },
      bottom: { style: "thick", color: { argb: "000000" } },
      right: { style: "thick", color: { argb: "000000" } },
    }
    cell.alignment = { horizontal: "center", vertical: "middle" }
  })

  worksheet.addRow([]) // spacing
  worksheet.addRow([]) // spacing

  // Finance and HR section headers
  const financeHRRow = worksheet.addRow(["",  "Finance", "","", "HR", ""])
  financeHRRow.getCell(3).font = { name: "Arial", size: 11, bold: true }
  financeHRRow.getCell(3).alignment = { horizontal: "center", vertical: "middle" }
  financeHRRow.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D0D0D0" } }
  financeHRRow.getCell(3).border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  }

  financeHRRow.getCell(5).font = { name: "Arial", size: 11, bold: true }
  financeHRRow.getCell(5).alignment = { horizontal: "center", vertical: "middle" }
  financeHRRow.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D0D0D0" } }
  financeHRRow.getCell(5).border = {
    top: { style: "thin", color: { argb: "000000" } },
    left: { style: "thin", color: { argb: "000000" } },
    bottom: { style: "thin", color: { argb: "000000" } },
    right: { style: "thin", color: { argb: "000000" } },
  }

  worksheet.addRow([]) // spacing

  const agreementText = worksheet.addRow([
    "Upon the signing of this Settlement Agreement, the Second Party (Employee) shall hereby acknowledge that the employee agrees to the above calculations with all their employment entitlements from the First Party (Employer) including but not limited to any accrued leave pay or end of service or any other benefits and entitlements as per the contract & Labour Law 2021, and that no such monies are owed to them against the First Party. This calculation is true & binding and supercedes all the calculation that was made earlier.",
  ])
  agreementText.getCell(1).font = { name: "Arial", size: 9 }
  agreementText.getCell(1).alignment = { horizontal: "justify", vertical: "top", wrapText: true }
  worksheet.mergeCells(`A${agreementText.number}:F${agreementText.number}`)
  agreementText.height = 60

  const additionalText1 = worksheet.addRow([
    "It is not, and shall not be represented or construed by the Parties as, an admission of liability or wrongdoing on the part of either Party to this Settlement Agreement or any other person or entity in respect of the performance of either party of their employment relationship.",
  ])
  additionalText1.getCell(1).font = { name: "Arial", size: 9 }
  additionalText1.getCell(1).alignment = { horizontal: "justify", vertical: "top", wrapText: true }
  worksheet.mergeCells(`A${additionalText1.number}:F${additionalText1.number}`)
  additionalText1.height = 40

//   const additionalText2 = worksheet.addRow([
//     "Both Parties acknowledge that this Settlement Agreement is in full and final settlement of all claims arising out of the employment relationship between the parties.",
//   ])
//   additionalText2.getCell(1).font = { name: "Arial", size: 9 }
//   additionalText2.getCell(1).alignment = { horizontal: "justify", vertical: "top", wrapText: true }
//   worksheet.mergeCells(`A${additionalText2.number}:F${additionalText2.number}`)
//   additionalText2.height = 40

  worksheet.addRow([]) // spacing

  const acknowledgedRow = worksheet.addRow(["Agreed & Acknowledged by Employee:", "", "", "", "", ""])
  acknowledgedRow.getCell(1).font = { name: "Arial", size: 10, bold: true }
  acknowledgedRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
  acknowledgedRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: "000000" } },
      bottom: { style: "thin", color: { argb: "000000" } },
      right: { style: "thin", color: { argb: "000000" } },
    }
  })
  acknowledgedRow.height = 30

  worksheet.addRow([]) // spacing
  worksheet.addRow([]) // spacing

  // Set column widths to match image proportions
  worksheet.columns = [
    { width: 25 }, // A
    { width: 15 }, // B
    { width: 15 }, // C
    { width: 15 }, // D
    { width: 15 }, // E
    { width: 15 }, // F
  ]

  // Generate and download the file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const fileName = `Settlement_Agreement_${employeeData.employee_id}_${employeeData.employeeName?.replace(/\s+/g, "_") || "Employee"}_${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.xlsx`

  // Using saveAs function (make sure you have file-saver library)
  saveAs(blob, fileName)
}

    const handleSort = (key) => {
        let data = {
            sort_by: key,
            sort_order: sort
        }
        Debounce(() => getCustomerQueue(1, '', data));
    }

    useEffect(() => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        getCustomerQueue(oneMonthAgo);
    }, []);

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
                id: selectedData?.id,
                status: status?.id,

            };

            const promise = CustomerServices.updateEOSStatus(obj);
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
                getCustomerQueue(new Date());
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
            header: "Employee ID",
            accessorKey: "id",
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.employee_id}
                </Box>
            ),
        },
        {
            header: "Employee Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.user?.name}
                </Box>
            ),
        },
        {
            header: "Date Of joining",
            accessorKey: "doj",
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row?.original?.user?.employee?.date_of_joining).format('DD-MM-YYYY')}
                </Box>
            ),
        },
        {
            header: "Date Of Leaving",
            accessorKey: "dov",
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment(row?.original?.user?.employee?.date_of_leaving).format('DD-MM-YYYY')}
                </Box>
            ),
        },
        {
            header: "Month",
            accessorKey: "month", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {moment().month(row?.original?.month - 1).format("MMMM")}
                </Box>
            ),
        },
        {
            header: "Year",
            accessorKey: "year", // ✅ Corrected for search
            cell: ({ row }) => (
                <Box sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
                    {row?.original?.year}
                </Box>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const status = row?.original?.status?.toUpperCase();

                // Define color for each status
                const statusColorMap = {
                    APPROVED: "#4caf50", // green
                    PENDING: "#ff9800",  // orange
                    REJECTED: "#f44336", // red
                };

                return (
                    <Box
                        component={'div'}
                        onClick={() => {
                            setSelectedData(row?.original);
                            if (status === 'PENDING') {
                                setStatusDialog(true);
                            }
                        }}
                        sx={{
                            cursor: "pointer",
                            display: "flex",
                            gap: 2,
                            color: statusColorMap[status] || "black", // fallback to black
                            fontWeight: 600,
                            textTransform: "capitalize"
                        }}
                    >
                        {row?.original?.status}
                    </Box>
                );
            },
        },


        {
            header: "Actions",
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    {true && (
                        <IconButton
                            onClick={() => {
                                downloadExcel(row?.original);
                                localStorage.setItem("currentUrl", "/customer-detail");
                            }}
                            sx={{ cursor: "pointer", mt: 2 }}
                        >
                            <ReceiptIcon sx={{ fontSize: 25 }} />
                        </IconButton>
                    )}
                    {true && <Box component={'img'} sx={{ cursor: "pointer" }} onClick={() => { navigate(`/eos-detail/${row?.original?.id}`); localStorage.setItem("currentUrl", '/customer-detail'); }} src={Images.detailIcon} width={'35px'}></Box>}
                    {row?.original?.status == 'Pending' && <Box
                        component="img"
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            navigate(`/update-eos/${row?.original?.id}`);
                            localStorage.setItem("currentUrl", '/update-customer');
                        }}
                        src={Images.editIcon}
                        width="35px"
                    />}
                </Box>
            ),
        },
    ];






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
                                label={"Status "}
                                options={[
                                    { id: "Pending", name: "Pending" },
                                    { id: "Approved", name: "Approved" },
                                    { id: "Rejected", name: "Rejected" },



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
                <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Final Statement List</Typography>
                {user?.role_id == 6 && <PrimaryButton
                    bgcolor={'#001f3f'}
                    title="Create "
                    onClick={() => { navigate('/create-eos'); localStorage.setItem("currentUrl", '/create-customer') }}
                    loading={loading}
                />}


            </Box>
            <Grid container xs={12} spacing={2}>



                <Grid item xs={6}>
                    <Box sx={{ mb: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                views={['year', 'month']}

                                label="Select Month & Year"
                                minDate={dayjs('2000-01-01')}
                                maxDate={dayjs('2100-12-31')}
                                value={selectedMonth}
                                onChange={(newValue) => {
                                    setSelectedMonth(newValue); console.log(newValue, 'newValuenewValue');
                                    getCustomerQueue(new Date(newValue))
                                }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Box>
                </Grid>

            </Grid>
            {/* Filters */}
            <Box >


                {<DataTable loading={loader} data={customerQueue} columns={columns} />}
            </Box>

        </Box>
    );
}

export default EOSList;