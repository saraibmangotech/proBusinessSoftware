"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  Box,
  TableCell,
  TableRow,
  Typography,
  tableCellClasses,
  Grid,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  useTheme,
} from "@mui/material"
import { FontFamily } from "assets"
import styled from "@emotion/styled"
import { useNavigate } from "react-router-dom"
import Colors from "assets/Style/Colors"
import { ErrorToaster, SuccessToaster } from "components/Toaster"
import CustomerServices from "services/Customer"
import { makeStyles } from "@mui/styles"
import { agencyType, Debounce } from "utils"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import SimpleDialog from "components/Dialog/SimpleDialog"
import { PrimaryButton } from "components/Buttons"
import SelectField from "components/Select"
import SearchIcon from "@mui/icons-material/Search"
import { saveAs } from "file-saver"
import moment from "moment"
import { showErrorToast, showPromiseToast } from "components/NewToaster"
import ConfirmationDialog from "components/Dialog/ConfirmationDialog"
import DatePicker from "components/DatePicker"
import { useAuth } from "context/UseContext"
import ExcelJS from "exceljs"
import "./table.css"
import FinanceServices from "services/Finance"

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}))

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",
    border: "1px solid #EEEEEE",
    padding: "15px",
    textAlign: "left",
    whiteSpace: "nowrap",
    color: "#434343",
    paddingRight: "50px",
    background: "transparent",
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",
    textWrap: "nowrap",
    padding: "5px !important",
    paddingLeft: "15px !important",
    ".MuiBox-root": {
      display: "flex",
      gap: "6px",
      alignItems: "center",
      justifyContent: "center",
      ".MuiBox-root": {
        cursor: "pointer",
      },
    },
    svg: {
      width: "auto",
      height: "24px",
    },
    ".MuiTypography-root": {
      textTransform: "capitalize",
      fontFamily: FontFamily.NunitoRegular,
      textWrap: "nowrap",
    },
    ".MuiButtonBase-root": {
      padding: "8px",
      width: "28px",
      height: "28px",
    },
  },
}))

const useStyles = makeStyles({
  loaderWrap: {
    display: "flex",
    height: 100,
    "& svg": {
      width: "40px !important",
      height: "40px !important",
    },
  },
})

function ConsolidatedSupplierPayables() {
  const navigate = useNavigate()
  const classes = useStyles()
  const dispatch = useDispatch()
  const contentRef = useRef(null)
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
  } = useForm()
  const [TotalBalance, setTotalBalance] = useState(0)
  const Balance = TotalBalance

  const tableHead = ["Type", "#", "Date", "Due Date", "Total Amount", "Total Paid", "Balance", "Status"]

  // Add a new function to calculate grand totals
  const calculateGrandTotals = (data) => {
    let grandTotalAmount = 0
    let grandTotalPaid = 0
    let grandTotalUnpaid = 0

    // Only count actual transaction rows, not headers or totals
    data.forEach((row) => {
      if (!row.isVendorHeader && !row.isTotal && !row.isOpeningBalance) {
        grandTotalAmount += Number.parseFloat(row.total_amount || 0)
        grandTotalPaid += Number.parseFloat(row.paid_amount || 0)
        grandTotalUnpaid += Number.parseFloat(row.unpaid_amount || 0)
      }
    })

    return {
      totalAmount: grandTotalAmount,
      totalPaid: grandTotalPaid,
      totalUnpaid: grandTotalUnpaid,
    }
  }

  const [loader, setLoader] = useState(false)
  const [confirmationDialog, setConfirmationDialog] = useState(false)
  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([])
  const theme = useTheme()
  const [totalCount, setTotalCount] = useState(0)
  const [pageLimit, setPageLimit] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [fromDate, setFromDate] = useState()
  const [toDate, setToDate] = useState()
  const [selectedUser, setSelectedUser] = useState([])
  const [users, setUsers] = useState([])
  const { user } = useAuth()
  const [fieldDisabled, setFieldDisabled] = useState(false)
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)
  const [costCenters, setCostCenters] = useState([])
  const [closingBal, setClosingBal] = useState(0)

  // *For Filters
  const [filters, setFilters] = useState({})

  // *For Permissions
  const [permissions, setPermissions] = useState()
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState("desc")

 const prepareExcelData = (data) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(" Consolidated Supplier  Payable")

    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18SUPPLIER CONSOLIDATED STATEMENT\n' +
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

    worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter

    worksheet.pageSetup = {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.7, right: 0.7, top: 1.0, bottom: 1.0, header: 0.3, footer: 0.5 },
    }

    worksheet.addRow(["CONSOLIDATED SUPPLIER PAYABLE"]).getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    worksheet.mergeCells("A1:H1")

    const company =
      agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
        ? "PREMIUM BUSINESSMEN SERVICES"
        : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"

    worksheet.addRow([company]).getCell(1).font = { name: "Arial", size: 14, bold: true, color: { argb: "4472C4" } }
    worksheet.mergeCells("A2:H2")

    worksheet.addRow([
      `Report Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`,
    ])
    worksheet.mergeCells("A3:H3")

    worksheet.addRow([])
    worksheet.addRow(["Print Out Date:", moment().format("MM/DD/YYYY HH:mm")])
    worksheet.addRow([
      "Fiscal Year:",
      `${moment().startOf("year").format("MM/DD/YYYY")} - ${moment().endOf("year").format("MM/DD/YYYY")} (Active)`,
    ])
    worksheet.addRow(["Period:", `${moment(fromDate).format("MM/DD/YYYY")} - ${moment(toDate).format("MM/DD/YYYY")}`])
    worksheet.addRow(["Supplier:", selectedUser ? "Selected Suppliers" : "All"])
    worksheet.addRow(["Currency:", "AED"])
    worksheet.addRow([])

    if (selectedUser && selectedUser.length > 0) {
      worksheet.addRow(["Selected Suppliers:"]).getCell(1).font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "2F4F4F" },
      }
      selectedUser.forEach((supplier) => worksheet.addRow([`   • ${supplier.name || supplier}`]))
      worksheet.addRow([])
    }

    const headers = ["Type", "#", "Date", "Due Date", "Total Amount", "Total Paid", "Balance", "Status"]
    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2F4F4F" } }
      cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFF" }, size: 11 }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
    })

    data.forEach((row) => {
      let dataRow
      if (row.isVendorHeader) {
        dataRow = worksheet.addRow([row.vendor_name])
        dataRow.getCell(1).font = { name: "Arial", size: 11, bold: true, color: { argb: "2F4F4F" } }
        dataRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E8E8E8" } }
        worksheet.mergeCells(`A${dataRow.number}:H${dataRow.number}`)
        return
      }

      if (row.isOpeningBalance) {
        dataRow = worksheet.addRow([
          "",
          "",
          "",
          "Opening Balance",
          0,
          0,
          Number.parseFloat(row.runningBalance || 0),
          "",
        ])
        dataRow.getCell(4).font = { name: "Arial", size: 10, bold: true }
        ;[5, 6, 7].forEach((i) => {
          dataRow.getCell(i).numFmt = "#,##0.00"
          dataRow.getCell(i).alignment = { horizontal: "right" }
        })
        return
      }

      if (row.isTotal) {
        dataRow = worksheet.addRow([
          "Total",
          "",
          "",
          "",
          Number(row.totalAmount || 0),
          Number(row.totalPaid || 0),
          Number(row.totalUnpaid || 0),
          "",
        ])
        dataRow.eachCell((cell, i) => {
          if (i === 1 || i >= 5) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } }
            cell.font = { name: "Arial", bold: true, size: 10 }
            if (i >= 5 && i <= 7) {
              cell.numFmt = "#,##0.00"
              cell.alignment = { horizontal: "right" }
            }
          }
        })
        return
      }

      const type = row.type || "Invoice"
      const number = row.invoice_number || "-"
      const date = row.purchase_date ? moment(row.purchase_date).format("YYYY-MM-DD") : ""
      const dueDate = row.purchase_date ? moment(row.purchase_date).format("YYYY-MM-DD") : ""

      dataRow = worksheet.addRow([
        type,
        number,
        date,
        dueDate,
        Number(row?.total_amount || 0),
        Number(row?.paid_amount || 0),
        Number(row?.unpaid_amount || 0),
        row?.status || "",
      ])

      dataRow.eachCell((cell, col) => {
        cell.font = { name: "Arial", size: 10 }
        cell.alignment = { horizontal: col >= 5 && col <= 7 ? "right" : "left", vertical: "middle" }
        cell.border = {
          top: { style: "hair" },
          left: { style: "hair" },
          bottom: { style: "hair" },
          right: { style: "hair" },
        }
        if (col >= 5 && col <= 7) cell.numFmt = "#,##0.00"
      })
    })

    if (data.length > 0) {
      const grandTotals = calculateGrandTotals(data)

      const grandTotalRow = worksheet.addRow([
        "Grand Total",
        "",
        "",
        "",
        grandTotals.totalAmount,
        grandTotals.totalPaid,
        grandTotals.totalUnpaid,
        "",
      ])

      grandTotalRow.eachCell((cell, col) => {
        if (col === 1 || (col >= 5 && col <= 7)) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } }
          cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFF" }, size: 11 }
          cell.border = {
            top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" },
          }
          if (col >= 5 && col <= 7) {
            cell.numFmt = "#,##0.00"
            cell.alignment = { horizontal: "right", vertical: "middle" }
          } else {
            cell.alignment = { horizontal: "center", vertical: "middle" }
          }
        }
      })
    }

    worksheet.columns = [
      { width: 15 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
    ]

    workbook.creator = "Finance Department"
    workbook.lastModifiedBy = "Finance System"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    workbook.properties = {
      title: " Consolidated Supplier  Payable",
      subject: "Financial Report",
      keywords: "supplier statement, financial, accounting",
      category: "Financial Reports",
      description: "Supplier consolidated statement generated from accounting system",
      company: "Your Company Name",
    }

    worksheet.addRow([])
    worksheet.addRow([])

    const reportRow = worksheet.addRow(["This is electronically generated report"])
    reportRow.getCell(1).font = { name: "Arial", size: 12, color: { argb: "000000" } }
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
    reportRow.getCell(1).border = {
      top: { style: "medium" },
      left: { style: "medium" },
      bottom: { style: "medium" },
      right: { style: "medium" },
    }
    worksheet.mergeCells(`A${reportRow.number}:H${reportRow.number}`)

    const poweredByRow = worksheet.addRow(["Powered by : MangotechDevs.ae"])
    poweredByRow.getCell(1).font = { name: "Arial", size: 10, italic: true, color: { argb: "666666" } }
    poweredByRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${poweredByRow.number}:H${poweredByRow.number}`)

    worksheet.addRow([])

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob, "Consolidated_Supplier_Payable.xlsx")
    }

    download()
  }

  const headers = [
    { label: "Type", key: "Type" },
    { label: "#", key: "#" },
    { label: "Date", key: "Date" },
    { label: "Due Date", key: "Due Date" },
    { label: "Total Amount", key: "Total Amount" },
    { label: "Total Paid", key: "Total Paid" },
    { label: "Balance", key: "Balance" },
    { label: "Status", key: "Status" },
  ]

  const columns = [
    {
      header: "Type",
      accessorKey: "type_name",
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{
            cursor: "pointer",
            display: "flex",
            gap: 2,
            fontWeight: row?.original?.isVendorHeader ? "bold" : "normal",
            backgroundColor: row?.original?.isVendorHeader ? "#f5f5f5" : "transparent",
            color: row?.original?.isTotal ? "#1976d2" : "inherit",
          }}
        >
          {row?.original?.isVendorHeader ? row?.original?.vendor_name : row?.original?.type || "Invoice"}
        </Box>
      ),
    },
    {
      header: "#",
      accessorKey: "invoice_number",
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.invoice_number || "-"}
        </Box>
      ),
    },
    {
      id: "purchase_date",
      header: "Date",
      accessorFn: (row) => (row.purchase_date ? moment(row.purchase_date).format("YYYY-MM-DD") : ""),
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row.original.purchase_date ? moment(row.original.purchase_date).format("YYYY-MM-DD") : ""}
        </Box>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "due_date",
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row.original.purchase_date ? moment(row.original.purchase_date).format("YYYY-MM-DD") : ""}
        </Box>
      ),
    },
    {
      header: "Charges",
      accessorKey: "debit",
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {Number.parseFloat(row?.original?.debit || 0).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Credits",
      accessorKey: "credit",
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {Number.parseFloat(row?.original?.credit || 0).toFixed(2)}
        </Box>
      ),
    },
    {
      header: "Allocated",
      accessorKey: "allocated",
      cell: ({ row }) => (
        <Box variant="contained" color="primary" sx={{ cursor: "pointer", display: "flex", gap: 2 }}>
          {row?.original?.allocated || "0.00"}
        </Box>
      ),
    },
    {
      header: "Balance",
      accessorKey: "runningBalance",
      cell: ({ row }) => (
        <Box
          sx={{
            cursor: "pointer",
            display: "flex",
            gap: 2,
            fontWeight: 500,
            color: Number.parseFloat(row.original.runningBalance || 0) >= 0 ? "green" : "red",
          }}
        >
          {row.original.runningBalance || "0.00"}
        </Box>
      ),
    },
  ]

  const getCostCenters = async () => {
    try {
      const params = {
        page: 1,
        limit: 999999,
      }
      const { data } = await CustomerServices.getCostCenters(params)
      setCostCenters([{ id: "All", name: "All" }, ...(data?.cost_centers || [])])
      setSelectedCostCenter({ id: "All", name: "All" })
    } catch (error) {
      showErrorToast(error)
    }
  }

  // *For Get Customer Queue
   const getCustomerQueue = async (page, limit, filter) => {
    if (true) {
      setLoader(true)
      try {
        const params = {
          page: 1,
          limit: 999999,
          from_date: fromDate ? moment(fromDate).format("MM-DD-YYYY") : "",
          to_date: toDate ? moment(toDate).format("MM-DD-YYYY") : "",
          vendors: selectedUser.map((user) => user.id).join(","),
          account_id: 700111,
          type: "supplier",
        }

          const { data } = await FinanceServices.getConsolidatedSupplierPayables(params)

        // Process the data to create the table rows
        const processedData = processStatementsData(data?.vendors || [])
        console.log(processedData, "processedData")

        setCustomerQueue(processedData)
        setTotalCount(data?.vendors?.reduce((total, vendor) => total + (vendor.invoices?.length || 0), 0))
        setTotalBalance(data?.overall_unpaid || 0)
      } catch (error) {
        showErrorToast(error)
      } finally {
        setLoader(false)
      }
    } else {
      showErrorToast("Select User")
    }
  }

  // Process statements data to create table rows
  const processStatementsData = (vendors) => {
    const result = []
    let overallRunningBalance = 0

    vendors.forEach((vendor) => {
      if (vendor.vendor_name) {
        // Add vendor header
        result.push({
          isVendorHeader: true,
          id: `header-${vendor.vendor_id}`,
          vendor_name: vendor.vendor_name,
          vendor_id: vendor.vendor_id,
        })

        // Add opening balance row (assuming 0 for now)
        result.push({
          type: "",
          id: `opening-${vendor.vendor_id}`,
          isOpeningBalance: true,
          vendor_id: vendor.vendor_id,
          debit: 0.0,
          credit: 0.0,
          allocated: 0.0,
          runningBalance: overallRunningBalance.toFixed(2),
        })

        // Add invoice entries if available
        let totalAmount = 0
        let totalPaid = 0
        let totalUnpaid = 0
        let totalDebit = 0
        let totalCredit = 0
        let runningBalance = overallRunningBalance

        if (vendor.invoices && vendor.invoices.length > 0) {
          vendor.invoices.forEach((invoice) => {
            const amount = Number.parseFloat(invoice.total_amount || 0)
            const paid = Number.parseFloat(invoice.paid_amount || 0)
            const unpaid = Number.parseFloat(invoice.unpaid_amount || 0)
            const status = unpaid > 0 ? "Unpaid" : "Paid"
            const debit = Number.parseFloat(invoice.unpaid_amount || 0)
            const credit = Number.parseFloat(invoice.paid_amount || 0)

            runningBalance = Number.parseFloat((runningBalance + debit - credit).toFixed(2))
            totalDebit += debit
            totalCredit += credit
            totalAmount += amount
            totalPaid += paid
            totalUnpaid += unpaid

            result.push({
              id: invoice.invoice_id,
              type: "Invoice",
              invoice_number: invoice.invoice_number,
              purchase_date: invoice.purchase_date,
              total_amount: amount,
              paid_amount: paid,
              unpaid_amount: unpaid,
              status: status,
              debit: debit,
              credit: credit,
              allocated: debit.toFixed(2),
              runningBalance: runningBalance.toFixed(2),
            })
          })
        }

        // Add total row for this vendor with new fields:
        result.push({
          id: `total-${vendor.vendor_id}`,
          isTotal: true,
          totalAmount: totalAmount,
          totalPaid: totalPaid,
          totalUnpaid: totalUnpaid,
          debit: totalDebit,
          credit: totalCredit,
          allocated: "0.00",
          runningBalance: runningBalance.toFixed(2),
        })

        overallRunningBalance = runningBalance
      }
    })

    return result
  }

  useEffect(() => {
    getCustomerQueue(1, 999999, {})
  }, [fromDate, toDate])

  const getUsers = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = filter ? { ...filters, ...filter } : null
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: 1,
        limit: 999999,
      }
      params = { ...params, ...Filter }
      const { data } = await CustomerServices.getVendors(params)
      setUsers(data?.rows)
    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }

  const handleSort = (key) => {
    const data = {
      sort_by: key,
      sort_order: sort,
    }
    Debounce(() => getCustomerQueue(1, "", data))
  }

  // *For Handle Filter
  const handleFilter = () => {
    const data = {
      search: getValues("search"),
    }
    Debounce(() => getCustomerQueue(1, "", data))
  }

  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setFromDate("invalid")
        return
      }
      console.log(newDate, "newDate")
      setFromDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const [personName, setPersonName] = React.useState([])
  const ITEM_HEIGHT = 48
  const ITEM_PADDING_TOP = 8
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  }

  const handleChange = (event) => {
    const {
      target: { value },
    } = event
    // value will be an array of objects
    setSelectedUser(typeof value === "string" ? [] : value)
  }

  const getStyles = (user, selectedUsers, theme) => ({
    fontWeight: selectedUsers.some((u) => u.id === user.id)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  })

  const handleToDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setToDate("invalid")
        return
      }
      setToDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleDelete = async (item) => {
    try {
      const params = { reception_id: selectedData?.id }
      const { message } = await CustomerServices.deleteReception(params)
      SuccessToaster(message)
      getCustomerQueue()
    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }

  const UpdateStatus = async () => {
    try {
      const obj = {
        customer_id: selectedData?.id,
        is_active: status?.id,
      }
      const promise = CustomerServices.CustomerStatus(obj)
      console.log(promise)
      showPromiseToast(promise, "Saving...", "Added Successfully", "Something Went Wrong")
      // Await the promise and then check its response
      const response = await promise
      if (response?.responseCode === 200) {
        setStatusDialog(false)
        setStatus(null)
        getCustomerQueue()
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUsers()
    // setFromDate(new Date())
    // setToDate(new Date())
    getCustomerQueue()
    getCostCenters()
  }, [])

  useEffect(() => {
    if (user?.role_id != 1000 && user?.role_id != 1001) {
      setFieldDisabled(true)
      setSelectedUser(user)
    }
  }, [user])

  return (
    <Box sx={{ p: 3 }}>
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are You Sure?"}
        action={() => {
          setConfirmationDialog(false)
          handleDelete()
        }}
      />

      <SimpleDialog open={statusDialog} onClose={() => setStatusDialog(false)} title={"Change Status?"}>
        <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Select Status :"}
                options={[
                  { id: false, name: "Disabled" },
                  { id: true, name: "Enabled" },
                ]}
                selected={status}
                onSelect={(value) => {
                  setStatus(value)
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
                <PrimaryButton bgcolor={Colors.primary} title="Yes,Confirm" type="submit" />
                <PrimaryButton onClick={() => setStatusDialog(false)} bgcolor={"#FF1F25"} title="No,Cancel" />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}> Consolidated Supplier  Payable</Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={1} justifyContent={"space-between"} alignItems={"center"}>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={2.5}>
              <InputLabel id="demo-multiple-name-label" sx={{ fontWeight: "bold", color: "#434343" }}>
                Select Suppliers
              </InputLabel>
              <FormControl fullWidth size="small" sx={{ pt: 1 }}>
                <Select
                  multiple
                  value={selectedUser}
                  onChange={handleChange}
                  input={<OutlinedInput label="Name" />}
                  MenuProps={MenuProps}
                  slotProps={{
                    input: {
                      sx: {
                        border: `2px solid ${Colors.primary}`,
                        borderRadius: "8px",
                      },
                    },
                  }}
                  renderValue={(selected) => selected.map((user) => user.name).join(", ")}
                  sx={{
                    "&.MuiFormControl-root": {
                      "&.MuiSelect-select": {
                        borderRadius: "8px",
                      },
                    },
                    "&.MuiInputBase-root": {
                      borderRadius: "8px",
                    },
                  }}
                >
                  {users?.map((user) => (
                    <MenuItem key={user.id} value={user} style={getStyles(user, selectedUser, theme)}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2.5}>
              <DatePicker
                label={"From Date"}
                disableFuture={true}
                size="small"
                value={fromDate}
                onChange={(date) => handleFromDate(date)}
              />
            </Grid>
            <Grid item xs={2.5}>
              <DatePicker
                label={"To Date"}
                disableFuture={true}
                size="small"
                value={toDate}
                onChange={(date) => handleToDate(date)}
              />
            </Grid>
            <Grid item xs={1} sx={{ marginTop: "30px" }}>
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
        <Grid item xs={4} display={"flex"} mt={2.7} justifyContent={"flex-end"}></Grid>
      </Grid>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <PrimaryButton title={"Download Excel"} onClick={() => prepareExcelData(customerQueue)} />
        </Box>
        <div className="table-container">
          <table className="financial-table">
            <thead>
              <tr>
                {tableHead.map((item, index) => (
                  <th key={index} className="pdf-table">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loader ? (
                <tr>
                  <td colSpan={tableHead.length} align="center">
                    <div className="loader-wrap">
                      <div className="spinner"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : customerQueue?.length > 0 ? (
                customerQueue.map((row, index) => {
                  // Vendor Header Row
                  if (row.isVendorHeader) {
                    return (
                      <tr key={row.id} className="account-header">
                        <td colSpan={7} className="account-name">
                          {row.vendor_name}
                        </td>
                      </tr>
                    )
                  }

                  // Opening Balance Row
                  if (row.isOpeningBalance) {
                    return (
                      <tr key={row.id} className="opening-balance-row">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="number-cell">0.00</td>
                        <td className="number-cell">0.00</td>
                        <td className="number-cell">{Number.parseFloat(row.runningBalance || 0).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    )
                  }

                  // Total Row
                  if (row.isTotal) {
                    return (
                      <tr key={row.id} className="total-row">
                        <td className="bold">Total</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="number-cell bold">{Number.parseFloat(row.totalAmount || 0).toFixed(2)}</td>
                        <td className="number-cell bold">{Number.parseFloat(row.totalPaid || 0).toFixed(2)}</td>
                        <td className="number-cell bold">{Number.parseFloat(row.totalUnpaid || 0).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    )
                  }

                  // Regular Transaction Row
                  return (
                    <tr key={row.id || index} className="transaction-row">
                      <td>{row.type || "Invoice"}</td>
                      <td>{row.invoice_number || "-"}</td>
                      <td>{row.purchase_date ? moment(row.purchase_date).format("YYYY-MM-DD") : ""}</td>
                      <td>{row.purchase_date ? moment(row.purchase_date).format("YYYY-MM-DD") : ""}</td>
                      <td className="number-cell">{Number.parseFloat(row?.total_amount || 0).toFixed(2)}</td>
                      <td className="number-cell">{Number.parseFloat(row?.paid_amount || 0).toFixed(2)}</td>
                      <td className="number-cell">{Number.parseFloat(row?.unpaid_amount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${row.status === "Paid" ? "status-paid" : "status-unpaid"}`}>
                          {row.status || "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={tableHead.length} align="center" className="no-data">
                    No Data Found
                  </td>
                </tr>
              )}
              {!loader && customerQueue?.length > 0 && (
                <tr className="grand-total-row">
                  <td colSpan={4} className="bold">
                    Grand Total
                  </td>
                  <td className="number-cell bold">{calculateGrandTotals(customerQueue).totalAmount.toFixed(2)}</td>
                  <td className="number-cell bold">{calculateGrandTotals(customerQueue).totalPaid.toFixed(2)}</td>
                  <td className="number-cell bold">{calculateGrandTotals(customerQueue).totalUnpaid.toFixed(2)}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Box>
    </Box>
  )
}

export default ConsolidatedSupplierPayables
