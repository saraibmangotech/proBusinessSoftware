"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
} from "@mui/material"
import styled from "@emotion/styled"
import { FontFamily } from "assets" // Assuming FontFamily is defined here
import Colors from "assets/Style/Colors" // Assuming Colors is defined here
import { CircleLoading } from "components/Loaders" // Assuming this component exists
import { ErrorToaster } from "components/Toaster" // Assuming this component exists
import { makeStyles } from "@mui/styles"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import FinanceServices from "services/Finance" // Assuming this service exists
import { PrimaryButton } from "components/Buttons" // Assuming this component exists
import { saveAs } from "file-saver"
import { agencyType, CommaSeparator } from "utils" // Assuming agencyType and CommaSeparator exist
import { PDFExport } from "@progress/kendo-react-pdf"
import SearchIcon from "@mui/icons-material/Search"
import moment from "moment"
import CustomerServices from "services/Customer" // Assuming this service exists
import { showErrorToast } from "components/NewToaster" // Assuming this component exists
import DatePicker from "components/DatePicker" // Assuming this component exists
import InputField from "components/Input" // Assuming this component exists
import SelectField from "components/Select" // Assuming this component exists
import ExcelJS from "exceljs"

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}))

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",
    border: 0,
    padding: "15px",
    textAlign: "center",
    whiteSpace: "nowrap",
    background: Colors.primary,
    color: Colors.white,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",
    textWrap: "nowrap",
    padding: "5px !important",
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
  anchorLink: {
    textDecoration: "underline",
    color: Colors.twitter,
    cursor: "pointer",
  },
})

// Helper function to format amount
const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Update the `calculateAccountTotals` function to correctly handle opening balance, debit, credit, period difference, and final balance, including recursive summation for child accounts.
const calculateAccountTotals = (account) => {
  const opening = Number.parseFloat(account.opening_balance) || 0
  const debit = Number.parseFloat(account.total_debit) || 0
  const credit = Number.parseFloat(account.total_credit) || 0

  // Determine the effective opening balance based on account nature for summation
  let effectiveOpeningBalance = opening
  if (account.nature === "credit") {
    effectiveOpeningBalance = -opening
  }

  let accumulatedTotalDebit = debit
  let accumulatedTotalCredit = credit
  let accumulatedOpeningBalance = 0

  if (Array.isArray(account.childAccounts) && account.childAccounts.length > 0) {
    account.childAccounts.forEach((child) => {
      const childTotals = calculateAccountTotals(child)
      accumulatedOpeningBalance += childTotals.effectiveOpeningBalance
      accumulatedTotalDebit += childTotals.totalDebit
      accumulatedTotalCredit += childTotals.totalCredit
    })
  }

  // Period difference is always (accumulated) Debit - (accumulated) Credit
  const periodDifference = accumulatedTotalDebit - accumulatedTotalCredit

  // Final balance is the effective opening balance + the period difference
  const balance = effectiveOpeningBalance + periodDifference

  return {
    effectiveOpeningBalance: effectiveOpeningBalance, // This is the signed opening balance for display/accumulation
    totalDebit: accumulatedTotalDebit,
    totalCredit: accumulatedTotalCredit,
    periodDifference: periodDifference, // This is the raw debit - credit difference
    balance: balance,
  }
}

// Update the `transformDataForDisplay` function to use the new `calculatedTotals` properties for accumulating totals for subcategories and major categories.
const transformDataForDisplay = (data, searchTerm) => {
  const searchLower = searchTerm ? searchTerm.toLowerCase() : ""

  const filterAccount = (account) => {
    if (!searchTerm) return true
    return (
      account.account_code?.toLowerCase().includes(searchLower) ||
      account.account_name?.toLowerCase().includes(searchLower) ||
      account.account_category?.toLowerCase().includes(searchLower) ||
      account.account_subcategory?.toLowerCase().includes(searchLower)
    )
  }

  const processAccountsRecursively = (accounts) => {
    const processed = []
    accounts.forEach((account) => {
      const childAccountsProcessed = []
      if (Array.isArray(account.childAccounts) && account.childAccounts.length > 0) {
        account.childAccounts.forEach((child) => {
          const childTotals = calculateAccountTotals(child)
          if (filterAccount(child)) {
            childAccountsProcessed.push({
              ...child,
              calculatedTotals: childTotals,
              isChild: true,
            })
          }
        })
      }

      // Calculate totals for the current account (including its children)
      const accountTotals = calculateAccountTotals(account) // This will recursively sum up from children

      // Only include parent account if it matches search or has matching children
      if (filterAccount(account) || childAccountsProcessed.length > 0) {
        processed.push({
          ...account,
          calculatedTotals: accountTotals,
          childAccounts: childAccountsProcessed, // Replace original children with filtered/processed ones
        })
      }
    })
    return processed
  }

  return data
    .map((majorCategory) => {
      const groupedSubcategories = {}
      let majorCategoryOpeningTotal = 0
      let majorCategoryDebitTotal = 0
      let majorCategoryCreditTotal = 0
      let majorCategoryPeriodDiffTotal = 0
      let majorCategoryBalanceTotal = 0

      majorCategory.sub.forEach((subItem) => {
        const filteredAccounts = processAccountsRecursively(subItem.accounts)

        if (filteredAccounts.length > 0) {
          // Group by subcategory type
          filteredAccounts.forEach((account) => {
            const subcategoryName = account.account_subcategory || "Uncategorized"
            if (!groupedSubcategories[subcategoryName]) {
              groupedSubcategories[subcategoryName] = {
                name: subcategoryName,
                accounts: [],
                openingTotal: 0,
                debitTotal: 0,
                creditTotal: 0,
                periodDiffTotal: 0,
                balanceTotal: 0,
              }
            }
            groupedSubcategories[subcategoryName].accounts.push(account)
            groupedSubcategories[subcategoryName].openingTotal += account.calculatedTotals.effectiveOpeningBalance
            groupedSubcategories[subcategoryName].debitTotal += account.calculatedTotals.totalDebit
            groupedSubcategories[subcategoryName].creditTotal += account.calculatedTotals.totalCredit
            groupedSubcategories[subcategoryName].periodDiffTotal += account.calculatedTotals.periodDifference
            groupedSubcategories[subcategoryName].balanceTotal += account.calculatedTotals.balance
          })
        }
      })

      Object.values(groupedSubcategories).forEach((group) => {
        majorCategoryOpeningTotal += group.openingTotal
        majorCategoryDebitTotal += group.debitTotal
        majorCategoryCreditTotal += group.creditTotal
        majorCategoryPeriodDiffTotal += group.periodDiffTotal
        majorCategoryBalanceTotal += group.balanceTotal
      })

      return {
        ...majorCategory,
        subcategories_grouped: Object.values(groupedSubcategories),
        majorCategoryOpeningTotal,
        majorCategoryDebitTotal,
        majorCategoryCreditTotal,
        majorCategoryPeriodDiffTotal,
        majorCategoryBalanceTotal,
      }
    })
    .filter((majorCategory) => majorCategory.subcategories_grouped.length > 0)
}

function BalanceSheetDetailed() {
  const classes = useStyles()
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const { register } = useForm()

  const tableHead = [
    "Code",
    "Name",
    "Opening Balance (AED)",
    "Total Debit (AED)",
    "Total Credit (AED)",
    "Period Difference (AED)",
    "Balance (AED)",
  ]

  const [loader, setLoader] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalCost, setTotalCost] = useState(0)

  // *For Balance Sheet
  const [balanceSheet, setBalanceSheet] = useState([])
  const [filteredBalanceSheet, setFilteredBalanceSheet] = useState([])
  const [displayData, setDisplayData] = useState([]) // New state for transformed data
  const [childTabs, setChildTabs] = useState([])
  const [costCenters, setCostCenters] = useState([])
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)
  const [capitalTotal, setCapitalTotal] = useState(0)
  const [libalTotal, setLibalTotal] = useState(0)

  // *For Filters
  const [filters, setFilters] = useState("all")
  const [filterData, setFilterData] = useState()

  // *For Collapse
  const [expand, setExpand] = useState([])
  const [fromDate, setFromDate] = useState()
  const [toDate, setToDate] = useState()
  const [adminOpTotal, setAdminOpTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

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

  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      if (newDate == "Invalid Date") {
        setFromDate("invalid")
        return
      }
      setFromDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleToDate = (newDate) => {
    try {
      if (newDate == "Invalid Date") {
        setToDate("invalid")
        return
      }
      setToDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Balance Sheet
  const getBalanceSheet = async () => {
    try {
      setLoader(true) // Start loader
      const params = {
        cost_center: selectedCostCenter?.name,
        to_date: toDate ? moment(toDate).format("MM-DD-YYYY") : "",
        from_date: fromDate ? moment(fromDate).format("MM-DD-YYYY") : "",
      }
      const { data } = await FinanceServices.getAccountReports(params)
      const myData = data?.detail
      setBalanceSheet(myData?.slice(0, -2)) // Keep original for tabs
      setFilteredBalanceSheet(myData?.slice(0, -2)) // Keep original for tabs and initial display data source

      const e2Total = myData
        .flatMap((category) => category.sub || [])
        .flatMap((sub) => sub.accounts || [])
        .filter((account) => account.type_code === "E2")
        .reduce(
          (sum, account) =>
            sum + (Number.parseFloat(account.total_debit || 0) - Number.parseFloat(account.total_credit || 0)),
          0,
        )
      setAdminOpTotal(Number.parseFloat(e2Total))

      const fil = []
      myData?.slice(0, -2).forEach((e) => {
        const obj = {
          id: e.id,
          name: e.name,
          sub_accounts: e.sub,
        }
        fil.push(obj)
      })
      setFilterData(fil)

      const calculateTotal = (dataArray, categoryName) => {
        let total = 0
        const categoryItem = dataArray.find((item) => item?.name === categoryName)
        if (categoryItem) {
          categoryItem.sub?.forEach((subItem) => {
            subItem.accounts?.forEach((account) => {
              const credit = Number.parseFloat(account.total_credit) || 0
              const debit = Number.parseFloat(account.total_debit) || 0
              total += account.nature === "debit" ? debit - credit : credit - debit
              if (account.childAccounts) {
                account.childAccounts.forEach((child) => {
                  const childCredit = Number.parseFloat(child.total_credit) || 0
                  const childDebit = Number.parseFloat(child.total_debit) || 0
                  total += child.nature === "debit" ? childDebit - childCredit : childCredit - childDebit
                })
              }
            })
          })
        }
        return total.toFixed(2)
      }

      const totalSales = (subItems) => {
        let grandTotal = 0
        subItems?.forEach((subItem) => {
          subItem.accounts?.forEach((account) => {
            let accountTotal = 0
            const credit = Number.parseFloat(account.total_credit) || 0
            const debit = Number.parseFloat(account.total_debit) || 0
            accountTotal = account.nature === "debit" ? debit - credit : credit - debit
            if (account.childAccounts && account.childAccounts.length > 0) {
              const childSum = account.childAccounts.reduce((sum, child) => {
                const cc = Number.parseFloat(child.total_credit) || 0
                const cd = Number.parseFloat(child.total_debit) || 0
                return sum + (child.nature === "debit" ? cd - cc : cc - cd)
              }, 0)
              accountTotal = childSum
            }
            grandTotal += accountTotal
          })
        })
        return grandTotal
      }

      const costData = myData.filter((item) => item?.name == "Expenses")
      const costSalesTotal = totalSales(costData[0]?.sub?.filter((item) => item?.type_number == 1))
      setTotalCost(costSalesTotal)
      const revenueTotal = calculateTotal(myData, "Revenue")
      const totalEnxpensesVal = calculateTotal(myData, "Expenses")
      setTotalRevenue(revenueTotal)
      setTotalExpenses(totalEnxpensesVal)
      const LiabilitiesTotal = calculateTotal(myData, "Liabilities")
      const OwnerCapitalTotal = calculateTotal(myData, "Owner Capital")
      setCapitalTotal(OwnerCapitalTotal)
      setLibalTotal(LiabilitiesTotal)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false) // Stop loader
    }
  }

  // Effect to transform data for display whenever filteredBalanceSheet or searchTerm changes
  useEffect(() => {
    setDisplayData(transformDataForDisplay(filteredBalanceSheet, searchTerm))
  }, [filteredBalanceSheet, searchTerm])

  // *For Handle Filter
  const handleFilter = (event, newValue, child) => {
    if (child) {
      const arrayOfArrays = balanceSheet?.map((item) => item?.sub?.filter((subItem) => subItem?.id == newValue))
      const nonEmptyArrays = arrayOfArrays.filter((arr) => arr.length > 0)
      setFilteredBalanceSheet(nonEmptyArrays.flat())
      setFilters(newValue)
    } else {
      setFilters(newValue)
      if (newValue === "all") {
        setFilteredBalanceSheet(balanceSheet)
        setChildTabs([]) // Clear child tabs when "All" is selected
      } else {
        const filterData = balanceSheet.filter((e) => e.id === newValue)
        setChildTabs(balanceSheet.find((item) => item?.id == newValue)?.sub)
        setFilteredBalanceSheet(filterData)
      }
    }
  }

  // *For Handle Expand
  const handleExpand = (id) => {
    try {
      const currentIndex = expand.indexOf(id)
      const newExpand = [...expand]
      if (currentIndex === -1) {
        newExpand.push(id)
      } else {
        newExpand.splice(currentIndex, 1)
      }
      setExpand(newExpand)
    } catch (error) {
      ErrorToaster(error)
    }
  }
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Balance Sheet Summary")

    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18BALANCE SHEET SUMMARY\n' +
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
    const titleRow = worksheet.addRow(["BALANCE SHEET SUMMARY REPORT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:G1")

    const name =
      agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
        ? "PREMIUM BUSINESSMEN SERVICES"
        : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"
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
      `Report Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`,
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
      toDate && fromDate
        ? `Period:  ${fromDate ? new Date(fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Present"}`
        : `Period: All `,
    ])
    dateRow2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A4:G4")

    const costCenter = worksheet.addRow([`Cost Center: ${selectedCostCenter?.name}`])
    costCenter.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    costCenter.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A5:G5")

    const system = worksheet.addRow([
      `System: ${agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "TASHEEL" : "Al-ADHEED"}`,
    ])
    system.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A6:G6")

    // Add empty row for spacing
    worksheet.addRow([])

    // Add headers with professional styling
    const headers = [
      "Account Code",
      "Account Name",
      "Opening Balance",
      "Total Debit",
      "Total Credit",
      "Period Difference",
      "Balance",
    ]
    worksheet.addRow(headers).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "808080" }, // Gray
      }
      cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
    })

    // Grand totals initialization
    let grandOpening = 0,
      grandDebit = 0,
      grandCredit = 0,
      grandDiff = 0,
      grandBalance = 0

    const excelDisplayData = transformDataForDisplay(filteredBalanceSheet, searchTerm)

    excelDisplayData.forEach((majorCategoryItem) => {
      // Main section row (Assets/Liabilities/Equity)
      const sectionRow = worksheet.addRow([majorCategoryItem.name])
      sectionRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }, // Professional blue
      }
      sectionRow.getCell(1).font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      sectionRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
      worksheet.mergeCells(`A${sectionRow.number}:G${sectionRow.number}`)

      majorCategoryItem?.subcategories_grouped?.forEach((groupedSubcategory) => {
        // Subcategory Group Header (e.g., CWIP)
        const subCategoryGroupRow = worksheet.addRow(["", groupedSubcategory.name])
        subCategoryGroupRow.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D3D3D3" }, // Light gray
        }
        subCategoryGroupRow.getCell(2).font = { bold: true }
        worksheet.mergeCells(`B${subCategoryGroupRow.number}:G${subCategoryGroupRow.number}`)

        groupedSubcategory.accounts?.forEach((account) => {
          const accountTotals = account.calculatedTotals
          const row = worksheet.addRow([
            account.account_code,
            account.account_name,
            accountTotals.effectiveOpeningBalance,
            accountTotals.totalDebit,
            accountTotals.totalCredit,
            accountTotals.periodDifference,
            accountTotals.balance,
          ])

          // Format numerical columns as numbers with 4 decimal places
          for (let i = 3; i <= 7; i++) {
            row.getCell(i).numFmt = "#,##0.0000"
          }

          // Style account rows
          row.eachCell((cell, colNumber) => {
            cell.font = { name: "Arial", size: 10 }
            cell.alignment = {
              horizontal: colNumber >= 3 && colNumber <= 7 ? "right" : "left",
              vertical: "middle",
            }
            cell.border = {
              top: { style: "hair", color: { argb: "CCCCCC" } },
              left: { style: "hair", color: { argb: "CCCCCC" } },
              bottom: { style: "hair", color: { argb: "CCCCCC" } },
              right: { style: "hair", color: { argb: "CCCCCC" } },
            }
          })
          // IMPORTANT: No child accounts are added here for the "short" report
        })

        // Subcategory type total row (orange)
        if (groupedSubcategory?.accounts?.length > 0) {
          const totalRow = worksheet.addRow([
            "",
            `${groupedSubcategory.name} Total`,
            groupedSubcategory.openingTotal,
            groupedSubcategory.debitTotal,
            groupedSubcategory.creditTotal,
            groupedSubcategory.periodDiffTotal,
            groupedSubcategory.balanceTotal,
          ])
          // Format numerical columns
          for (let i = 3; i <= 7; i++) {
            totalRow.getCell(i).numFmt = "#,##0.0000"
          }
          totalRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFA500" }, // Orange
            }
            cell.font = { bold: true }
          })
        }
      })

      // Add category total row
      if (majorCategoryItem?.subcategories_grouped?.length > 0) {
        const catTotalRow = worksheet.addRow([
          `${majorCategoryItem.name} Total`,
          "",
          majorCategoryItem.majorCategoryOpeningTotal,
          majorCategoryItem.majorCategoryDebitTotal,
          majorCategoryItem.majorCategoryCreditTotal,
          majorCategoryItem.majorCategoryPeriodDiffTotal,
          majorCategoryItem.majorCategoryBalanceTotal,
        ])
        // Format numerical columns
        for (let i = 3; i <= 7; i++) {
          catTotalRow.getCell(i).numFmt = "#,##0.0000"
        }
        catTotalRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "000080" }, // Navy
          }
          cell.font = { bold: true, color: { argb: "FFFFFF" } }
        })

        // Update grand totals
        grandOpening += majorCategoryItem.majorCategoryOpeningTotal
        grandDebit += majorCategoryItem.majorCategoryDebitTotal
        grandCredit += majorCategoryItem.majorCategoryCreditTotal
        grandDiff += majorCategoryItem.majorCategoryPeriodDiffTotal
        grandBalance += majorCategoryItem.majorCategoryBalanceTotal
      }
    })

    // Add Grand Total row at the end
    const grandTotalRow = worksheet.addRow([
      "Grand Total",
      "",
      grandOpening,
      grandDebit,
      grandCredit,
      grandDiff,
      grandBalance,
    ])
    // Format numerical columns
    for (let i = 3; i <= 7; i++) {
      grandTotalRow.getCell(i).numFmt = "#,##0.0000"
    }
    grandTotalRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "000000" }, // Black
      }
      cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
    })

    // Add empty rows for spacing before footer
    worksheet.addRow([])
    worksheet.addRow([])

    // Retain Profit and Owner Capital + Liabilities + Retain Profit rows (original logic)
    const retainProfitRow = worksheet.addRow([
      "Retain Profit",
      "",
      "",
      "",
      "",
      "",
      CommaSeparator(
        (
          Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
          Number.parseFloat(adminOpTotal)
        ).toFixed(2),
      ),
    ])
    retainProfitRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "000000" }, // Black
      }
      cell.font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      cell.alignment = {
        horizontal: colNumber === 7 ? "right" : "left",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thick", color: { argb: "FFFFFF" } },
        left: { style: "thick", color: { argb: "FFFFFF" } },
        bottom: { style: "thick", color: { argb: "FFFFFF" } },
        right: { style: "thick", color: { argb: "FFFFFF" } },
      }
    })
    worksheet.mergeCells(`A${retainProfitRow.number}:F${retainProfitRow.number}`)

    const grandTotalFinalRow = worksheet.addRow([
      "Owner Capital + Liabilities + Retain Profit",
      "",
      "",
      "",
      "",
      "",
      CommaSeparator(
        Number.parseFloat(
          Number.parseFloat(libalTotal) +
            Number.parseFloat(capitalTotal) +
            (Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
              Number.parseFloat(adminOpTotal)),
        ).toFixed(2),
      ),
    ])
    grandTotalFinalRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "000000" }, // Black
      }
      cell.font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      cell.alignment = {
        horizontal: colNumber === 7 ? "right" : "left",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thick", color: { argb: "FFFFFF" } },
        left: { style: "thick", color: { argb: "FFFFFF" } },
        bottom: { style: "thick", color: { argb: "FFFFFF" } },
        right: { style: "thick", color: { argb: "FFFFFF" } },
      }
    })
    worksheet.mergeCells(`A${grandTotalFinalRow.number}:F${grandTotalFinalRow.number}`)

    // Add the electronic generated report text with black border as requested
    worksheet.addRow([])
    worksheet.addRow([])
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
    worksheet.mergeCells(`A${reportRow.number}:G${reportRow.number}`)

    // Set column widths
    worksheet.columns = [
      { width: 15 },
      { width: 30 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ]

    const system2 = worksheet.addRow([`Powered By: MangotechDevs.ae`])
    system2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${system2.number}:G${system2.number}`)

    // Add empty row for spacing
    worksheet.addRow([])

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(
      blob,
      toDate && fromDate
        ? `Balance Sheet Summary : ${fromDate ? new Date(fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Present"}`
        : `Balance Sheet Summary: Present `,
    )
  }

  const downloadExcelDetailed = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Balance Sheet")

    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18BALANCE SHEET\n' +
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
    const titleRow = worksheet.addRow(["BALANCE SHEET REPORT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:G1")

    const name =
      agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
        ? "PREMIUM BUSINESSMEN SERVICES"
        : "PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC"
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
      `Report Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} at ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`,
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
      toDate && fromDate
        ? `Period:  ${fromDate ? new Date(fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Present"}`
        : `Period: All `,
    ])
    dateRow2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A4:G4")

    const costCenter = worksheet.addRow([`Cost Center: ${selectedCostCenter?.name}`])
    costCenter.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    costCenter.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A5:G5")

    const system = worksheet.addRow([
      `System: ${agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "TASHEEL" : "Al-ADHEED"}`,
    ])
    system.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A6:G6")

    // Add empty row for spacing
    worksheet.addRow([])

    // Add headers with professional styling
    const headers = [
      "Account Code",
      "Account Name",
      "Opening Balance",
      "Total Debit",
      "Total Credit",
      "Period Difference",
      "Balance",
    ]
    worksheet.addRow(headers).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "808080" }, // Gray
      }
      cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
    })

    // Grand totals initialization
    let grandOpening = 0,
      grandDebit = 0,
      grandCredit = 0,
      grandDiff = 0,
      grandBalance = 0

    const excelDisplayData = transformDataForDisplay(filteredBalanceSheet, searchTerm)

    excelDisplayData.forEach((majorCategoryItem) => {
      // Main section row (Assets/Liabilities/Equity)
      const sectionRow = worksheet.addRow([majorCategoryItem.name])
      sectionRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }, // Professional blue
      }
      sectionRow.getCell(1).font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      sectionRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
      worksheet.mergeCells(`A${sectionRow.number}:G${sectionRow.number}`)

      majorCategoryItem?.subcategories_grouped?.forEach((groupedSubcategory) => {
        // Subcategory Group Header (e.g., CWIP)
        const subCategoryGroupRow = worksheet.addRow(["", groupedSubcategory.name])
        subCategoryGroupRow.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D3D3D3" }, // Light gray
        }
        subCategoryGroupRow.getCell(2).font = { bold: true }
        worksheet.mergeCells(`B${subCategoryGroupRow.number}:G${subCategoryGroupRow.number}`)

        groupedSubcategory.accounts?.forEach((account) => {
          const accountTotals = account.calculatedTotals
          const row = worksheet.addRow([
            account.account_code,
            account.account_name,
            accountTotals.effectiveOpeningBalance,
            accountTotals.effectiveTotalDebit,
            accountTotals.effectiveTotalCredit,
            accountTotals.periodDifference,
            accountTotals.balance,
          ])

          // Format numerical columns as numbers with 4 decimal places
          for (let i = 3; i <= 7; i++) {
            row.getCell(i).numFmt = "#,##0.0000"
          }

          // Style account rows
          row.eachCell((cell, colNumber) => {
            cell.font = { name: "Arial", size: 10 }
            cell.alignment = {
              horizontal: colNumber >= 3 && colNumber <= 7 ? "right" : "left",
              vertical: "middle",
            }
            cell.border = {
              top: { style: "hair", color: { argb: "CCCCCC" } },
              left: { style: "hair", color: { argb: "CCCCCC" } },
              bottom: { style: "hair", color: { argb: "CCCCCC" } },
              right: { style: "hair", color: { argb: "CCCCCC" } },
            }
          })

          // Child accounts
          if (Array.isArray(account?.childAccounts) && account.childAccounts.length > 0) {
            account.childAccounts.forEach((child) => {
              const childTotals = child.calculatedTotals
              const childRow = worksheet.addRow([
                child.account_code,
                `-- ${child.account_name}`, // Indent child account name
                childTotals.effectiveOpeningBalance,
                childTotals.effectiveTotalDebit,
                childTotals.effectiveTotalCredit,
                childTotals.periodDifference,
                childTotals.balance,
              ])

              // Format numerical columns
              for (let i = 3; i <= 7; i++) {
                childRow.getCell(i).numFmt = "#,##0.0000"
              }

              // Style child rows
              childRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 9, italic: true }
                cell.alignment = {
                  horizontal: colNumber >= 3 && colNumber <= 7 ? "right" : "left",
                  vertical: "middle",
                }
                cell.border = {
                  top: { style: "hair", color: { argb: "CCCCCC" } },
                  left: { style: "hair", color: { argb: "CCCCCC" } },
                  bottom: { style: "hair", color: { argb: "CCCCCC" } },
                  right: { style: "hair", color: { argb: "CCCCCC" } },
                }
              })
            })
          }
        })

        // Subcategory type total row (orange)
        if (groupedSubcategory?.accounts?.length > 0) {
          const totalRow = worksheet.addRow([
            "",
            `${groupedSubcategory.name} Total`,
            groupedSubcategory.openingTotal,
            groupedSubcategory.debitTotal,
            groupedSubcategory.creditTotal,
            groupedSubcategory.periodDiffTotal,
            groupedSubcategory.balanceTotal,
          ])
          // Format numerical columns
          for (let i = 3; i <= 7; i++) {
            totalRow.getCell(i).numFmt = "#,##0.0000"
          }
          totalRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFA500" }, // Orange
            }
            cell.font = { bold: true }
          })
        }
      })

      // Add category total row
      if (majorCategoryItem?.subcategories_grouped?.length > 0) {
        const catTotalRow = worksheet.addRow([
          `${majorCategoryItem.name} Total`,
          "",
          majorCategoryItem.majorCategoryOpeningTotal,
          majorCategoryItem.majorCategoryDebitTotal,
          majorCategoryItem.majorCategoryCreditTotal,
          majorCategoryItem.majorCategoryPeriodDiffTotal,
          majorCategoryItem.majorCategoryBalanceTotal,
        ])
        // Format numerical columns
        for (let i = 3; i <= 7; i++) {
          catTotalRow.getCell(i).numFmt = "#,##0.0000"
        }
        catTotalRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "000080" }, // Navy
          }
          cell.font = { bold: true, color: { argb: "FFFFFF" } }
        })

        // Update grand totals
        grandOpening += majorCategoryItem.majorCategoryOpeningTotal
        grandDebit += majorCategoryItem.majorCategoryDebitTotal
        grandCredit += majorCategoryItem.majorCategoryCreditTotal
        grandDiff += majorCategoryItem.majorCategoryPeriodDiffTotal
        grandBalance += majorCategoryItem.majorCategoryBalanceTotal
      }
    })

    // Add Grand Total row at the end
    const grandTotalRow = worksheet.addRow([
      "Grand Total",
      "",
      grandOpening,
      grandDebit,
      grandCredit,
      grandDiff,
      grandBalance,
    ])
    // Format numerical columns
    for (let i = 3; i <= 7; i++) {
      grandTotalRow.getCell(i).numFmt = "#,##0.0000"
    }
    grandTotalRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "000000" }, // Black
      }
      cell.font = { bold: true, color: { argb: "FFFFFF" } } // White bold
    })

    // Add empty rows for spacing before footer
    worksheet.addRow([])
    worksheet.addRow([])

    // Retain Profit and Owner Capital + Liabilities + Retain Profit rows (original logic)
    const retainProfitRow = worksheet.addRow([
      "Retain Profit",
      "",
      "",
      "",
      "",
      "",
      CommaSeparator(
        (
          Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
          Number.parseFloat(adminOpTotal)
        ).toFixed(2),
      ),
    ])
    retainProfitRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "000000" }, // Black
      }
      cell.font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      cell.alignment = {
        horizontal: colNumber === 7 ? "right" : "left",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thick", color: { argb: "FFFFFF" } },
        left: { style: "thick", color: { argb: "FFFFFF" } },
        bottom: { style: "thick", color: { argb: "FFFFFF" } },
        right: { style: "thick", color: { argb: "FFFFFF" } },
      }
    })
    worksheet.mergeCells(`A${retainProfitRow.number}:F${retainProfitRow.number}`)

    const grandTotalFinalRow = worksheet.addRow([
      "Owner Capital + Liabilities + Retain Profit",
      "",
      "",
      "",
      "",
      "",
      CommaSeparator(
        Number.parseFloat(
          Number.parseFloat(libalTotal) +
            Number.parseFloat(capitalTotal) +
            (Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
              Number.parseFloat(adminOpTotal)),
        ).toFixed(2),
      ),
    ])
    grandTotalFinalRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "000000" }, // Black
      }
      cell.font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      cell.alignment = {
        horizontal: colNumber === 7 ? "right" : "left",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thick", color: { argb: "FFFFFF" } },
        left: { style: "thick", color: { argb: "FFFFFF" } },
        bottom: { style: "thick", color: { argb: "FFFFFF" } },
        right: { style: "thick", color: { argb: "FFFFFF" } },
      }
    })
    worksheet.mergeCells(`A${grandTotalFinalRow.number}:F${grandTotalFinalRow.number}`)

    // Add the electronic generated report text with black border as requested
    worksheet.addRow([])
    worksheet.addRow([])
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
    worksheet.mergeCells(`A${reportRow.number}:G${reportRow.number}`)

    // Set column widths
    worksheet.columns = [
      { width: 15 },
      { width: 30 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ]

    const system2 = worksheet.addRow([`Powered By: MangotechDevs.ae`])
    system2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${system2.number}:G${system2.number}`)

    // Add empty row for spacing
    worksheet.addRow([])

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(
      blob,
      toDate && fromDate
        ? `Balance Sheet Detailed : ${fromDate ? new Date(fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Present"}`
        : `Balance Sheet Detailed: Present `,
    )
  }

  useEffect(() => {
    getCostCenters()
    getBalanceSheet()
  }, [])

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <SelectField
            size="small"
            label="Select Cost Center"
            options={costCenters}
            selected={selectedCostCenter}
            onSelect={(value) => {
              setSelectedCostCenter(value)
            }}
            register={register("costcenter", { required: "costcenter is required" })}
          />
        </Grid>
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
        <Grid item xs={3} mt={"30px"}>
          <PrimaryButton
            bgcolor={"#001f3f"}
            icon={<SearchIcon />}
            title="Search"
            sx={{ marginTop: "30px" }}
            onClick={() => getBalanceSheet()}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <div className="container">
            <div className="wrapper">
              <InputField
                size={"small"}
                type="text"
                id="text-to-search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mr: 4,
          my: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
          }}
        >
          Balance Sheet
        </Typography>
          {balanceSheet?.length > 0 && (
          <Box sx={{ textAlign: "right", p: 4, display: "flex", gap: 2 }}>
            <PrimaryButton title={"Download Report"} onClick={() => downloadExcel()} />
          </Box>
        )}
        {balanceSheet?.length > 0 && (
          <Box sx={{ textAlign: "right", p: 4, display: "flex", gap: 2 }}>
            <PrimaryButton title={"Download Detailed Report"} onClick={() => downloadExcelDetailed()} />
          </Box>
        )}
      </Box>
      {/* Filters */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={12}>
          <Tabs value={filters} onChange={(event, newValue) => handleFilter(event, newValue, false)}>
            <Tab value="all" label="All" />
            {filterData?.map((item, index) => (
              <Tab key={index} value={item?.id} label={item?.name} />
            ))}
          </Tabs>
          <Tabs value={filters} onChange={(event, newValue) => handleFilter(event, newValue, true)}>
            {childTabs?.map((item, index) => (
              <Tab key={index} value={item?.id} label={item?.name} />
            ))}
          </Tabs>
        </Grid>
      </Grid>
      {displayData ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Balance Sheet">
            <Box className="pdf-show" sx={{ display: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h5"
                  sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}
                >
                  Balance Sheet
                </Typography>
                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey }}>
                  <span>Date: &nbsp;&nbsp;</span>
                  {moment().format("MM-DD-YYYY")}
                </Box>
              </Box>
            </Box>
            {/* ========== Table ========== */}
            <TableContainer
              component={Paper}
              sx={{ boxShadow: "0px 8px 18px 0px #9B9B9B1A", borderRadius: 2, maxHeight: "calc(100vh - 250px)" }}
              className="table-box"
            >
              <Table stickyHeader sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    {tableHead.map((item, index) => (
                      <Cell className="pdf-table" key={index}>
                        {item}
                      </Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!loader ? (
                    displayData?.length > 0 ? (
                      <>
                        {displayData?.map((majorCategoryItem, majorIndex) => {
                          return (
                            <Fragment key={majorIndex}>
                              {/* Major Category Row (e.g., Asset) */}
                              <TableRow
                                className="bg-primary/90 text-primary-foreground font-medium cursor-pointer hover:bg-primary/80"
                                onClick={() => handleExpand(majorCategoryItem.id)}
                              >
                                <TableCell colSpan={tableHead?.length}>
                                  <Typography className="pdf-table" variant="subtitle1" sx={{ textAlign: "left" }}>
                                    {expand.indexOf(majorCategoryItem.id) === -1 ? "▼" : "▶"} {majorCategoryItem?.name}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              {expand.indexOf(majorCategoryItem.id) === -1 && ( // If major category is expanded
                                <Fragment>
                                  {majorCategoryItem?.subcategories_grouped?.map((groupedSubcategory, subIndex) => {
                                    return (
                                      <Fragment key={subIndex}>
                                        {/* Subcategory Group Header (e.g., CWIP) */}
                                        <TableRow
                                          className="bg-secondary text-secondary-foreground font-medium cursor-pointer hover:bg-secondary/90"
                                          onClick={() => handleExpand(groupedSubcategory.name)}
                                        >
                                          <TableCell></TableCell>
                                          <TableCell colSpan={tableHead?.length - 1}>
                                            <Typography
                                              className="pdf-table"
                                              variant="body1"
                                              sx={{ fontWeight: 700, textAlign: "left", ml: 1.5 }}
                                            >
                                              {expand.indexOf(groupedSubcategory.name) === -1 ? "▼" : "▶"}{" "}
                                              {groupedSubcategory.name}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                        {expand.indexOf(groupedSubcategory.name) === -1 && ( // If subcategory group is expanded
                                          <Fragment>
                                            {groupedSubcategory.accounts?.map((account, accIndex) => {
                                              const accountTotals = account.calculatedTotals
                                              return (
                                                <Fragment key={accIndex}>
                                                  {/* Account Row */}
                                                  <TableRow
                                                    className={
                                                      account.isChild
                                                        ? "bg-muted/10 hover:bg-muted/30"
                                                        : "hover:bg-muted/50"
                                                    }
                                                  >
                                                    <TableCell sx={{ pl: 3 }}>{account?.account_code ?? "-"}</TableCell>
                                                    <TableCell>{account?.account_name ?? "-"}</TableCell>
                                                    <TableCell className="text-right">
                                                      {formatAmount(account.calculatedTotals.effectiveOpeningBalance)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                      {formatAmount(account.calculatedTotals.totalDebit)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                      {formatAmount(account.calculatedTotals.totalCredit)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                      {formatAmount(account.calculatedTotals.periodDifference)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                      {formatAmount(account.calculatedTotals.balance)}
                                                    </TableCell>
                                                  </TableRow>
                                                  {expand.indexOf(account.id) !== -1 && ( // If account is expanded, show child accounts
                                                    <Fragment>
                                                      {account?.childAccounts?.map((child, childAccIndex) => {
                                                        const childTotals = child.calculatedTotals
                                                        return (
                                                          <Fragment key={childAccIndex}>
                                                            <Row sx={{ bgcolor: "#EEFBEE" }}>
                                                              <TableCell sx={{ pl: 4.5 }}>
                                                                {child?.account_code ?? "-"}
                                                              </TableCell>
                                                              <TableCell>{child?.account_name ?? "-"}</TableCell>
                                                              <TableCell className="text-right">
                                                                {formatAmount(childTotals.effectiveOpeningBalance)}
                                                              </TableCell>
                                                              <TableCell className="text-right">
                                                                {formatAmount(childTotals.totalDebit)}
                                                              </TableCell>
                                                              <TableCell className="text-right">
                                                                {formatAmount(childTotals.totalCredit)}
                                                              </TableCell>
                                                              <TableCell className="text-right">
                                                                {formatAmount(childTotals.periodDifference)}
                                                              </TableCell>
                                                              <TableCell className="text-right">
                                                                {formatAmount(childTotals.balance)}
                                                              </TableCell>
                                                            </Row>
                                                          </Fragment>
                                                        )
                                                      })}
                                                    </Fragment>
                                                  )}
                                                </Fragment>
                                              )
                                            })}
                                            {/* Subtotal for the grouped subcategory (e.g., Total - CWIP) */}
                                            {groupedSubcategory?.accounts?.length > 0 && (
                                              <Row>
                                                <TableCell>
                                                  <Typography variant="body1" sx={{ fontWeight: 700, ml: 4.5 }}>
                                                    Total of {groupedSubcategory.name}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell></TableCell>
                                                <TableCell className="text-right">
                                                  {formatAmount(groupedSubcategory.openingTotal)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  {formatAmount(groupedSubcategory.debitTotal)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  {formatAmount(groupedSubcategory.creditTotal)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  {formatAmount(groupedSubcategory.periodDiffTotal)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  {formatAmount(groupedSubcategory.balanceTotal)}
                                                </TableCell>
                                              </Row>
                                            )}
                                          </Fragment>
                                        )}
                                      </Fragment>
                                    )
                                  })}
                                  {/* Total for Major Category (e.g., Total Asset) */}
                                  {majorCategoryItem?.subcategories_grouped?.length > 0 && (
                                    <Row
                                      sx={{
                                        bgcolor:
                                          majorCategoryItem?.name === "Asset" ? Colors.primary : Colors.bluishCyan,
                                      }}
                                    >
                                      <TableCell>
                                        <Typography
                                          variant="body1"
                                          sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}
                                        >
                                          Totals
                                        </Typography>
                                      </TableCell>
                                      <TableCell></TableCell>
                                      <TableCell className="text-right">
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {CommaSeparator(
                                            Number.parseFloat(majorCategoryItem.majorCategoryOpeningTotal).toFixed(4),
                                          )}
                                        </Typography>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {CommaSeparator(
                                            Number.parseFloat(majorCategoryItem.majorCategoryDebitTotal).toFixed(4),
                                          )}
                                        </Typography>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {CommaSeparator(
                                            Number.parseFloat(majorCategoryItem.majorCategoryCreditTotal).toFixed(4),
                                          )}
                                        </Typography>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {CommaSeparator(
                                            Number.parseFloat(majorCategoryItem.majorCategoryPeriodDiffTotal).toFixed(
                                              4,
                                            ),
                                          )}
                                        </Typography>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {CommaSeparator(
                                            Number.parseFloat(majorCategoryItem.majorCategoryBalanceTotal).toFixed(4),
                                          )}
                                        </Typography>
                                      </TableCell>
                                    </Row>
                                  )}
                                </Fragment>
                              )}
                            </Fragment>
                          )
                        })}
                        <Row>
                          <TableCell colSpan={tableHead.length}></TableCell>
                        </Row>
                        <Row sx={{ bgcolor: Colors.primary }}>
                          <TableCell colSpan={6}>
                            <Typography
                              className="pdf-table"
                              variant="body1"
                              sx={{ fontWeight: 700, ml: 4.5, color: "white" }}
                            >
                              Retain Profit
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              className="pdf-table"
                              variant="body2"
                              sx={{ fontWeight: 700, color: Colors.white }}
                            >
                              {CommaSeparator(
                                (
                                  Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
                                  Number.parseFloat(adminOpTotal)
                                ).toFixed(2),
                              )}
                            </Typography>
                          </TableCell>
                        </Row>
                        <Row sx={{ bgcolor: Colors.primary }}>
                          <TableCell colSpan={6}>
                            <Typography
                              className="pdf-table"
                              variant="body1"
                              sx={{ fontWeight: 700, ml: 4.5, color: "white" }}
                            >
                              Total Owner Capital + Liabilities + Retain Profit
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: "white" }}>
                              {CommaSeparator(
                                Number.parseFloat(
                                  Number.parseFloat(libalTotal) +
                                    Number.parseFloat(capitalTotal) +
                                    (Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
                                      Number.parseFloat(adminOpTotal)),
                                ).toFixed(2),
                              )}
                            </Typography>
                          </TableCell>
                        </Row>
                      </>
                    ) : (
                      <Row>
                        <Cell colSpan={tableHead.length} align="center" sx={{ fontWeight: 600 }}>
                          No Data Found
                        </Cell>
                      </Row>
                    )
                  ) : (
                    <Row>
                      <Cell colSpan={tableHead.length} align="center" sx={{ fontWeight: 600 }}>
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
        </Fragment>
      ) : (
        <CircleLoading />
      )}
    </Box>
  )
}

export default BalanceSheetDetailed
