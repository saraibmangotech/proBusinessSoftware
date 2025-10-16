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
import { FontFamily } from "assets"
import Colors from "assets/Style/Colors"
import { CircleLoading } from "components/Loaders"
import { ErrorToaster } from "components/Toaster"
import { makeStyles } from "@mui/styles"
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import FinanceServices from "services/Finance"
import DatePicker from "components/DatePicker"
import SearchIcon from "@mui/icons-material/Search"
import moment from "moment"
import { agencyType, CommaSeparator, Debounce } from "utils"
import { saveAs } from "file-saver"
import { PrimaryButton } from "components/Buttons"
import { PDFExport } from "@progress/kendo-react-pdf"
import CustomerServices from "services/Customer"
import { showErrorToast } from "components/NewToaster"
import ExcelJS from "exceljs"
import SelectField from "components/Select"

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}))

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.Montserrat,
    border: 0,
    padding: "15px",
    textAlign: "center",
    whiteSpace: "nowrap",
    background: `${Colors.secondary} !important`,
    color: Colors.white,
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
  anchorLink: {
    textDecoration: "underline",
    color: Colors.twitter,
    cursor: "pointer",
  },
})

function ProfitLossStatement() {
  const classes = useStyles()
  const contentRef = useRef(null)
  const tableHead = ["Code", "Name", "Major Category", "Sub Category", "Sub Total (AED)", "Final Total (AED)"]
  const [loader, setLoader] = useState(false)
  // *For Profit Loss Statement
  const [profitLossStatement, setProfitLossStatement] = useState([])
  const [filteredProfitLossStatement, setFilteredProfitLossStatement] = useState([])
  // *For Filters
  const [filters, setFilters] = useState("all")
  const [filterData, setFilterData] = useState()
  const [dateFilter, setDateFilter] = useState()
  const [fromDate, setFromDate] = useState()
  const [toDate, setToDate] = useState()
  const [childTabs, setChildTabs] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalAdminExpenses, setTotalAdminExpenses] = useState(0)
  const [costCenters, setCostCenters] = useState([])
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)
  const [adminOpTotal, setAdminOpTotal] = useState(0)
  // *For Collapse
  const [expand, setExpand] = useState([])
  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
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
  const [GrossTotal, setGrossTotal] = useState(0)
  // *For Get Balance Sheet
  const getProfitLossStatement = async (filter) => {
    try {
      const Filter = { ...dateFilter, ...filter }
      setDateFilter(Filter)
      const params = {
        cost_center: selectedCostCenter?.name,
        to_date: toDate ? moment(toDate).format("MM-DD-YYYY") : "",
        from_date: fromDate ? moment(fromDate).format("MM-DD-YYYY") : "",
        ...Filter,
      }
      const { data } = await FinanceServices.getAccountReportsDetail(params)
      setProfitLossStatement(data?.detail.slice(3))
      setFilteredProfitLossStatement(data?.detail.slice(3))
      const myData = data?.detail.slice(3)
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
      console.log(`Corrected Total of all E2 (Indirect Expense) accounts: ${e2Total.toLocaleString()}`)
      console.log(`Expected value: 2,488,381.94`)
      console.log(`Match: ${Math.abs(e2Total - 2488381.94) < 0.01 ? "YES" : "NO"}`)
      const calculateTotal = (data, category) => {
        let total = 0
        data?.forEach((item) => {
          try {
            if (item?.name === category) {
              console.log(item?.name)
              console.log(category)
              processSubItems(item?.sub)
            }
          } catch (error) {
            console.log(error)
          }
        })
        return total.toFixed(2)
        function processSubItems(subItems) {
          subItems?.forEach((subItem) => {
            console.log(subItem, "subItem")
            if (subItem?.accounts) {
              subItem.accounts.forEach((account) => {
                const credit = Number.parseFloat(account.total_credit) || 0
                const debit = Number.parseFloat(account.total_debit) || 0
                total += account.nature === "debit" ? debit - credit : credit - debit
                total += parseFloat(account.opening_balance)
                console.log(total, "revenueTotalrevenueTotalrevenueTotalrevenueTotalrevenueTotalrevenueTotalrevenueTotalrevenueTotal", subItem)
              })
            } else {
              subItem.childAccounts?.forEach((account) => {
                const credit = Number.parseFloat(account.total_credit) || 0
                const debit = Number.parseFloat(account.total_debit) || 0
                total += account.nature === "debit" ? debit - credit : credit - debit
                total += parseFloat(account.opening_balance)

                console.log(total, "revenueTotalrevenueTotalrevenueTotalrevenueTotalrevenueTotalrevenueTotal", subItem)

              })
            }


            // Recursively process child accounts
            if (subItem?.accounts ? subItem?.accounts : subItem?.childAccounts) {
              console.log(subItem?.accounts ? subItem?.accounts : subItem?.childAccounts)
              processSubItems(subItem?.accounts ? subItem?.accounts : subItem?.childAccounts)
            }
          })
        }
      }
      // Usage
      const revenueTotal = calculateTotal(myData, "Revenue")
      const totalEnxpensesVal = calculateTotal(myData, "Expenses")
      const costData = myData.filter((item) => item?.name == "Expenses")
      console.log(costData, "costDatacostData")
      console.log(costData[0]?.sub?.filter((item) => item?.type_number == 1))
      console.log(totalEnxpensesVal, "totalEnxpensesVal")
      console.log(revenueTotal, "revenueTotalrevenueTotalrevenueTotalrevenueTotal")
      setTotalRevenue(revenueTotal)
      setTotalExpenses(totalEnxpensesVal)
      console.log(revenueTotal)
      console.log("Total Revenue:", revenueTotal)
      const calculateAdminOperationalExpensesTotal = (expensesData) => {
        let total = 0
        expensesData?.forEach((category) => {
          if (category.name == "Admin & Operational Expenses") {
            category.sub.forEach((subCategory) => {
              subCategory.accounts.forEach((account) => {
                if (account.nature === "debit") {
                  total += Number.parseFloat(account.total_debit)
                }
              })
              // If there are child accounts, consider their debits as well
              if (subCategory.accounts.childAccounts) {
                subCategory.accounts.childAccounts.forEach((childAccount) => {
                  if (childAccount.nature === "debit") {
                    total += Number.parseFloat(childAccount.total_debit)
                  }
                })
              }
            })
          }
        })
        return total.toFixed(2)
      }
      const totalSales = (data, category) => {
        const total = 0
        data?.forEach((item) => {
          try {
            if (true) {
              processSubitems2(item?.accounts)
            }
          } catch (error) {
            console.log(error)
          }
        })
        return total.toFixed(2)
        function processSubitems2(subItems) {
          console.log(subItems)
          let grandTotal = 0
          for (let i = 0; i < subItems.length; i++) {
            const subItem = subItems[i]
            const accountNature = subItem.nature
            let childTotal = 0
            if (subItem.childAccounts && subItem.childAccounts.length > 0) {
              for (let j = 0; j < subItem.childAccounts.length; j++) {
                const child = subItem.childAccounts[j]
                console.log(child, "child")
                const childCredit = Number.parseFloat(child.total_credit) || 0
                const childDebit = Number.parseFloat(child.total_debit) || 0
                childTotal +=
                  accountNature == "debit"
                    ? Number.parseFloat(childDebit) - Number.parseFloat(childCredit)
                    : Number.parseFloat(childCredit) - Number.parseFloat(childDebit)
              }
            }
            grandTotal += childTotal
            const credit = Number.parseFloat(subItem.total_credit) || 0
            const debit = Number.parseFloat(subItem.total_debit) || 0
            grandTotal +=
              accountNature == "debit"
                ? Number.parseFloat(debit) - Number.parseFloat(credit)
                : Number.parseFloat(credit) - Number.parseFloat(debit)
            console.log(childTotal, "Child total")
          }
          setTotalCost(grandTotal)
          console.log(grandTotal, "grand Total")
        }
      }
      // Usage
      const costSalesTotal = totalSales(costData[0]?.sub?.filter((item) => item?.type_number == 1))
      console.log(costSalesTotal)
      const adminOperationalExpensesTotal = calculateAdminOperationalExpensesTotal(myData)
      setTotalAdminExpenses(adminOperationalExpensesTotal)
      const fil = []
      data?.detail?.forEach((e) => {
        const obj = {
          id: e.id,
          name: e.name,
          sub_accounts: e.sub,
        }
        fil.push(obj)
      })
      setFilterData(fil.slice(3))
      const mydata = fil.slice(3)
    } catch (error) {
      ErrorToaster(error)
    }
  }
  // *For Handle Category Filter
  const handleCategoryFilter = (event, newValue, child) => {
    if (child) {
      const arrayOfArrays = profitLossStatement?.map((item) => item?.sub?.filter((subItem) => subItem?.id == newValue))
      const nonEmptyArrays = arrayOfArrays.filter((arr) => arr.length > 0)
      // Log the result to the console
      setFilteredProfitLossStatement(nonEmptyArrays.flat())
      setFilters(newValue)
    } else {
      setFilters(newValue)
      if (newValue === "all") {
        setFilteredProfitLossStatement(profitLossStatement)
        setChildTabs(profitLossStatement.find((item) => item?.id == newValue)?.sub)
      } else {
        const filterData = profitLossStatement.filter((e) => e.id === newValue)
        setChildTabs(profitLossStatement.find((item) => item?.id == newValue)?.sub)
        setFilteredProfitLossStatement(filterData)
      }
    }
  }
  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getProfitLossStatement(data))
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
  // *For Filter Chart of Account By Search
  const filterBySearch = (search) => {
    const result = []
    for (const item of profitLossStatement) {
      if (item?.sub.length > 0) {
        for (const sub of item?.sub) {
          if (sub?.accounts?.length > 0) {
            for (const acc of sub?.accounts) {
              if (
                acc.account_name?.toLowerCase().includes(search?.toLowerCase()) ||
                acc.account_code?.toLowerCase().includes(search?.toLowerCase())
              ) {
                result.push(item)
              } else {
                if (acc?.childAccounts?.length > 0) {
                  for (const subAcc of acc?.childAccounts) {
                    if (
                      subAcc.account_name?.toLowerCase().includes(search?.toLowerCase()) ||
                      subAcc.account_code?.toLowerCase().includes(search?.toLowerCase())
                    ) {
                      result.push(item)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    setFilteredProfitLossStatement(result)
  }
  const downloadExcel = () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Profit Loss Statement")
    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
      '&C&"Arial,Bold"&18PROFIT LOSS STATEMENT\n' +
      '&C&"Arial,Regular"&12Your MABDE TRADING LLC\n' +
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
    const titleRow = worksheet.addRow(["PROFIT LOSS STATEMENT"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:F1")
    const name =
      agencyType[process.env.REACT_APP_TYPE]?.name
    const companyRow = worksheet.addRow([name])
    companyRow.getCell(1).font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: "4472C4" },
    }
    companyRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A2:F2")
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
    worksheet.mergeCells("A3:F3")
    const dateRow2 = worksheet.addRow([
      toDate && fromDate
        ? `Period:  ${fromDate ? moment(fromDate).format("MM/DD/YYYY") : "-"} To ${toDate ? moment(toDate).format("MM/DD/YYYY") : "Present"}`
        : `Period: All `,
    ])
    dateRow2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    dateRow2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A4:F4")
    // const costCenter = worksheet.addRow([
    //     `Cost Center: ${selectedCostCenter?.name}`,
    // ])
    // costCenter.getCell(1).font = {
    //     name: "Arial",
    //     size: 10,
    //     italic: true,
    //     color: { argb: "666666" },
    // }
    // costCenter.getCell(1).alignment = { horizontal: "center" }
    // worksheet.mergeCells("A5:F5")
    // const system = worksheet.addRow([
    //     `System: ${agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? 'TASHEEL' : 'Al-ADHEED'}`,
    // ])
    // system.getCell(1).font = {
    //     name: "Arial",
    //     size: 10,
    //     italic: true,
    //     color: { argb: "666666" },
    // }
    // system.getCell(1).alignment = { horizontal: "center" }
    // worksheet.mergeCells("A6:F6")
    // Add empty row for spacing
    worksheet.addRow([])
    // Add headers with professional styling
    const headerRow = worksheet.addRow(tableHead)
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
    // Process data and add rows with styling
    filteredProfitLossStatement?.forEach((item) => {
      let GrandTotal = 0
      // Main category row
      const categoryRow = worksheet.addRow([item.name, "", "", "", "", ""])
      categoryRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" }, // Professional blue
      }
      categoryRow.getCell(1).font = {
        name: "Arial",
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      }
      categoryRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
      if (item.sub) {
        item.sub.forEach((subItem) => {
          let Total = 0
          // Subcategory row
          const subCategoryRow = worksheet.addRow([subItem.name, "", "", "", "", ""])
          subCategoryRow.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E6E6FA" }, // Lavender
          }
          subCategoryRow.getCell(1).font = {
            name: "Arial",
            bold: true,
            size: 11,
            color: { argb: "2F4F4F" },
          }
          subCategoryRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
          if (subItem.accounts) {
            subItem.accounts.forEach((account) => {
              let childFinalTotal = 0
              let childTotal = 0
              // const accountOpeningBalance = Number.parseFloat(account?.opening_balance || 0)
              const accountOpeningBalance = Number.parseFloat(0)
              // const adjustedAccountOpeningBalance =
              //   account?.nature === "credit" ? accountOpeningBalance * -1 : accountOpeningBalance
              const adjustedAccountOpeningBalance = 0
              if (account?.childAccounts?.length > 0) {
                const initialValue = { credit: 0, debit: 0 }
                const result = account?.childAccounts?.reduce((accumulator, transaction) => {
                  const credit = isNaN(transaction?.total_credit) ? 0 : transaction?.total_credit
                  const debit = isNaN(transaction?.total_debit) ? 0 : transaction?.total_debit
                  return {
                    credit: Number.parseFloat(accumulator.credit) + Number.parseFloat(credit),
                    debit: Number.parseFloat(accumulator.debit) + Number.parseFloat(debit),
                  }
                }, initialValue)
                const periodDifferenceChildrenSum =
                  account?.nature === "debit"
                    ? Number.parseFloat(result?.debit) - Number.parseFloat(result?.credit)
                    : Number.parseFloat(result?.credit) - Number.parseFloat(result?.debit)
                childTotal = adjustedAccountOpeningBalance + periodDifferenceChildrenSum
              } else {
                const periodDifferenceAccount =
                  account?.nature === "debit"
                    ? Number.parseFloat(account?.total_debit) - Number.parseFloat(account?.total_credit)
                    : Number.parseFloat(account?.total_credit) - Number.parseFloat(account?.total_debit)
                childTotal = adjustedAccountOpeningBalance + periodDifferenceAccount
              }
              Total += Number.parseFloat(childTotal)
              GrandTotal += Number.parseFloat(childTotal)
              // Account row
              const accountRow = worksheet.addRow([
                account.account_code ?? "-",
                account.account_name ?? "-",
                account.account_category ?? "-",
                account.account_subcategory ?? "-",
                "",
                account?.nature === "debit" ? Number.parseFloat(childTotal) : -1 * Number.parseFloat(childTotal),
              ])
              // Style account rows
              accountRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 }
                cell.alignment = {
                  horizontal: colNumber > 4 ? "right" : "left",
                  vertical: "middle",
                }
                cell.border = {
                  top: { style: "hair", color: { argb: "CCCCCC" } },
                  left: { style: "hair", color: { argb: "CCCCCC" } },
                  bottom: { style: "hair", color: { argb: "CCCCCC" } },
                  right: { style: "hair", color: { argb: "CCCCCC" } },
                }
              })
              if (account.childAccounts) {
                account.childAccounts.forEach((child) => {
                  const credit = isNaN(child?.total_credit) ? 0 : child?.total_credit
                  const debit = isNaN(child?.total_debit) ? 0 : child?.total_debit
                  const childPeriodDifference =
                    child?.nature === "debit"
                      ? Number.parseFloat(debit) - Number.parseFloat(credit)
                      : Number.parseFloat(credit) - Number.parseFloat(debit)
                  // const childOpeningBalance = Number.parseFloat(child?.opening_balance || 0)
                  const childOpeningBalance = Number.parseFloat(0)
                  // const adjustedChildOpeningBalance =
                  //   child?.nature === "credit" ? childOpeningBalance * -1 : childOpeningBalance
                  const adjustedChildOpeningBalance = 0

                  const subTotal = (adjustedChildOpeningBalance + childPeriodDifference).toFixed(2)
                  childFinalTotal += Number.parseFloat(subTotal)
                  // Child account row
                  const childRow = worksheet.addRow([
                    child.account_code ?? "-",
                    child.account_name ?? "-",
                    child.account_category ?? "-",
                    child.account_subcategory ?? "-",
                    child?.nature == 'debit' ? Number.parseFloat(subTotal) : -1 * Number.parseFloat(subTotal),
                    "",
                  ])
                  // Style child rows
                  childRow.eachCell((cell, colNumber) => {
                    cell.font = { name: "Arial", size: 9, italic: true }
                    cell.alignment = {
                      horizontal: colNumber > 4 ? "right" : "left",
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
          }
          // Subcategory total row
          if (subItem?.accounts?.length > 0) {
            const subTotalRow = worksheet.addRow([
              `Total of ${subItem?.accounts[0]?.type_code}`,
              "",
              `Total of ${subItem?.name}`,
              "",
              "",
              Number.parseFloat(Total),
            ])
            subTotalRow.eachCell((cell, colNumber) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD700" }, // Gold
              }
              cell.font = {
                name: "Arial",
                bold: true,
                size: 10,
                color: { argb: "2F4F4F" },
              }
              cell.alignment = {
                horizontal: colNumber > 4 ? "right" : "left",
                vertical: "middle",
              }
              cell.border = {
                top: { style: "medium", color: { argb: "000000" } },
                left: { style: "medium", color: { argb: "000000" } },
                bottom: { style: "medium", color: { argb: "000000" } },
                right: { style: "medium", color: { argb: "000000" } },
              }
            })
          }
          // Gross Profit row
          if (subItem?.accounts?.length > 0 && subItem?.accounts[0]?.type_code == "E1") {
            const grossProfitRow = worksheet.addRow([
              "",
              "",
              "Gross Profit",
              "",
              "",
              Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)).toFixed(2),
            ])
            grossProfitRow.eachCell((cell, colNumber) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "90EE90" }, // Light green
              }
              cell.font = {
                name: "Arial",
                bold: true,
                size: 11,
                color: { argb: "2F4F4F" },
              }
              cell.alignment = {
                horizontal: colNumber > 4 ? "right" : "center",
                vertical: "middle",
              }
              cell.border = {
                top: { style: "medium", color: { argb: "000000" } },
                left: { style: "medium", color: { argb: "000000" } },
                bottom: { style: "medium", color: { argb: "000000" } },
                right: { style: "medium", color: { argb: "000000" } },
              }
            })
          }
        })
        // Category total row
        if (item?.sub?.length > 0) {
          const categoryTotalRow = worksheet.addRow([
            "Total",
            "",
            `Total ${item?.name}ss`,
            "",
            "",
            Number.parseFloat(GrandTotal).toFixed(2),
          ])
          categoryTotalRow.eachCell((cell, colNumber) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFA500" }, // Orange
            }
            cell.font = {
              name: "Arial",
              bold: true,
              size: 11,
              color: { argb: "FFFFFF" },
            }
            cell.alignment = {
              horizontal: colNumber > 4 ? "right" : "left",
              vertical: "middle",
            }
            cell.border = {
              top: { style: "medium", color: { argb: "000000" } },
              left: { style: "medium", color: { argb: "000000" } },
              bottom: { style: "medium", color: { argb: "000000" } },
              right: { style: "medium", color: { argb: "000000" } },
            }
          })
        }
      }
    })
    // Net Profit row
    if (filteredProfitLossStatement.length > 0) {
      const netProfitRow = worksheet.addRow([
        "",
        "",
        "Net Profit",
        "",
        "",
        CommaSeparator(
          (
            Number.parseFloat(
              Number.parseFloat(totalRevenue) - Number.parseFloat(totalExpenses),
            )
          ).toFixed(2),
        ),
      ])
      netProfitRow.eachCell((cell, colNumber) => {
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
          horizontal: colNumber > 4 ? "right" : "center",
          vertical: "middle",
        }
        cell.border = {
          top: { style: "thick", color: { argb: "FFFFFF" } },
          left: { style: "thick", color: { argb: "FFFFFF" } },
          bottom: { style: "thick", color: { argb: "FFFFFF" } },
          right: { style: "thick", color: { argb: "FFFFFF" } },
        }
      })
    }
    worksheet.addRow([])
    worksheet.addRow([])
    // Add the electronic generated report text with black border as requested
    const reportRow = worksheet.addRow(["This is electronicallyally generated report"])
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
    const system2 = worksheet.addRow([`Powered By: MangotechDevs.ae`])
    system2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${system2.number}:G${system2.number}`)
    // Set column widths
    worksheet.columns = [{ width: 15 }, { width: 35 }, { width: 20 }, { width: 20 }, { width: 18 }, { width: 18 }]
    // Add workbook properties
    workbook.creator = "Finance Department"
    workbook.lastModifiedBy = "Finance System"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()
    // Set workbook properties
    workbook.properties = {
      title: "Profit Loss Statement",
      subject: "Financial Report",
      keywords: "profit loss, financial, accounting",
      category: "Financial Reports",
      description: "Comprehensive profit loss statement generated from accounting system",
      company: "Your MABDE TRADING LLC",
    }
    // Add empty row for spacing
    worksheet.addRow([])
    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(
        blob,
        toDate && fromDate
          ? `Profit Loss Statement : ${fromDate ? moment(fromDate).format("MM/DD/YYYY") : "-"} To ${toDate ? moment(toDate).format("MM/DD/YYYY") : "Present"}`
          : `Profit Loss Statement : Present `,
      )
    }
    download()
  }
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
  useEffect(() => {
    getProfitLossStatement()
    getCostCenters()
  }, [])
  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mr: 4,
          my: 4,
        }}
      >
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
          Profit OR Loss Statement
        </Typography>
        {profitLossStatement?.length > 0 && (
          <Box
            sx={{
              textAlign: "right",
              p: 4,
              display: "flex",
              gap: 2,
            }}
          >
            {/* <PrimaryButton
              title="Download PDF"
              type="button"
              style={{ backgroundColor: Colors.bluishCyan }}
              onClick={() => handleExportWithComponent(contentRef)}
            /> */}
            <PrimaryButton title={"Export To Excel"} onClick={() => downloadExcel()} />
          </Box>
        )}
      </Box>
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
            onClick={() => getProfitLossStatement(null, null, null)}
          />
        </Grid>
      </Grid>
      {/* Filters */}
      <Grid container spacing={1}>
        {/* <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Search'}
            placeholder={'Search'}
            register={register('search', {
              onChange: (e) => filterBySearch(e.target.value)
            })}
          />
        </Grid> */}
      </Grid>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={12}>
          <Tabs value={filters} onChange={(event, newValue) => handleCategoryFilter(event, newValue, false)}>
            <Tab value="all" label="All" />
            {filterData?.map((item, index) => (
              <Tab key={index} value={item?.id} label={item?.name} />
            ))}
          </Tabs>
          <Tabs value={filters} onChange={(event, newValue) => handleCategoryFilter(event, newValue, true)}>
            {childTabs?.map((item, index) => (
              <Tab key={index} value={item?.id} label={item?.name} />
            ))}
          </Tabs>
        </Grid>
      </Grid>
      {profitLossStatement ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Profit OR Loss Statement">
            <Box className="pdf-show" sx={{ display: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h5"
                  sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}
                >
                  Profit OR Loss Statement
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
                    filteredProfitLossStatement?.length > 0 ? (
                      <>
                        <Fragment>
                          {filteredProfitLossStatement?.map((item, index) => {
                            let GrandTotal = 0
                            return (
                              <Fragment key={index}>
                                <Row>
                                  <Cell colSpan={tableHead?.length}>
                                    <Typography
                                      className="pdf-table"
                                      variant="body2"
                                      sx={{ fontWeight: 700, textAlign: "left" }}
                                    >
                                      {expand.indexOf(item.id) === -1 ? (
                                        <ExpandMore
                                          className="pdf-hide"
                                          sx={{
                                            verticalAlign: "sub",
                                            cursor: "pointer",
                                            opacity: item?.sub?.length > 0 ? 1 : 0,
                                          }}
                                          onClick={() => handleExpand(item.id)}
                                        />
                                      ) : (
                                        <ExpandLess
                                          className="pdf-hide"
                                          sx={{
                                            verticalAlign: "sub",
                                            cursor: "pointer",
                                            transform: "rotate(90deg)",
                                            opacity: item?.sub?.length > 0 ? 1 : 0,
                                          }}
                                          onClick={() => handleExpand(item.id)}
                                        />
                                      )}
                                      {item?.name}
                                    </Typography>
                                  </Cell>
                                </Row>
                                {expand.indexOf(item.id) === -1 && (
                                  <Fragment>
                                    {item?.sub?.map((subItem, i) => {
                                      let Total = 0
                                      return (
                                        <Fragment key={i}>
                                          <Row>
                                            <Cell colSpan={tableHead?.length}>
                                              <Typography
                                                className="pdf-table"
                                                variant="body2"
                                                sx={{ fontWeight: 700, textAlign: "left", ml: 1.5 }}
                                              >
                                                {expand.indexOf(subItem.id) === -1 ? (
                                                  <ExpandMore
                                                    className="pdf-hide"
                                                    sx={{
                                                      verticalAlign: "sub",
                                                      cursor: "pointer",
                                                      opacity: subItem?.accounts?.length > 0 ? 1 : 0,
                                                    }}
                                                    onClick={() => handleExpand(subItem.id)}
                                                  />
                                                ) : (
                                                  <ExpandLess
                                                    className="pdf-hide"
                                                    sx={{
                                                      verticalAlign: "sub",
                                                      cursor: "pointer",
                                                      transform: "rotate(90deg)",
                                                      opacity: subItem?.accounts?.length > 0 ? 1 : 0,
                                                    }}
                                                    onClick={() => handleExpand(subItem.id)}
                                                  />
                                                )}
                                                {subItem?.name}
                                              </Typography>
                                            </Cell>
                                          </Row>
                                          {expand.indexOf(subItem.id) === -1 && (
                                            <Fragment>
                                              {subItem?.accounts?.map((account, j) => {
                                                let childFinalTotal = 0
                                                let childTotal = 0
                                                const accountOpeningBalance = Number.parseFloat(
                                                  0,
                                                )
                                                // const accountOpeningBalance = Number.parseFloat(
                                                //   account?.opening_balance || 0,
                                                // )
                                                // const adjustedAccountOpeningBalance =
                                                //   account?.nature === "credit"
                                                //     ? accountOpeningBalance * -1
                                                //     : accountOpeningBalance
                                                const adjustedAccountOpeningBalance = 0

                                                if (account?.childAccounts?.length > 0) {
                                                  const initialValue = { credit: 0, debit: 0 }
                                                  const result = account?.childAccounts?.reduce(
                                                    (accumulator, transaction) => {
                                                      const credit = isNaN(transaction?.total_credit)
                                                        ? 0
                                                        : transaction?.total_credit
                                                      const debit = isNaN(transaction?.total_debit)
                                                        ? 0
                                                        : transaction?.total_debit
                                                      return {
                                                        credit:
                                                          Number.parseFloat(accumulator.credit) +
                                                          Number.parseFloat(credit),
                                                        debit:
                                                          Number.parseFloat(accumulator.debit) +
                                                          Number.parseFloat(debit),
                                                      }
                                                    },
                                                    initialValue,
                                                  )
                                                  const periodDifferenceChildrenSum =
                                                    account?.nature === "debit"
                                                      ? Number.parseFloat(result?.debit) -
                                                      Number.parseFloat(result?.credit)
                                                      : Number.parseFloat(result?.credit) -
                                                      Number.parseFloat(result?.debit)
                                                  childTotal =
                                                    account?.nature === "debit" ? adjustedAccountOpeningBalance + periodDifferenceChildrenSum : adjustedAccountOpeningBalance - periodDifferenceChildrenSum
                                                } else {
                                                  const periodDifferenceAccount =
                                                    account?.nature === "debit"
                                                      ? Number.parseFloat(account?.total_debit) -
                                                      Number.parseFloat(account?.total_credit)
                                                      : Number.parseFloat(account?.total_credit) -
                                                      Number.parseFloat(account?.total_debit)
                                                  childTotal = account?.nature === "debit" ? adjustedAccountOpeningBalance + periodDifferenceAccount : adjustedAccountOpeningBalance - periodDifferenceAccount
                                                  console.log(account, childTotal, 'childTotalchildTotalNew');

                                                }
                                                Total += Number.parseFloat(childTotal)
                                                GrandTotal += Number.parseFloat(childTotal)
                                                return (
                                                  <Fragment key={j}>
                                                    <Row>
                                                      <Cell
                                                        className={account?.childAccounts ? classes.anchorLink : ""}
                                                        onClick={() => handleExpand(account?.id)}
                                                      >
                                                        <Typography
                                                          className="pdf-table"
                                                          variant="body2"
                                                          sx={{ ml: 3 }}
                                                        >
                                                          {account?.account_code ?? "-"}
                                                        </Typography>
                                                      </Cell>
                                                      <Cell
                                                        className={
                                                          account?.childAccounts
                                                            ? classes.anchorLink + " " + "pdf-table"
                                                            : "pdf-table"
                                                        }
                                                        onClick={() => handleExpand(account?.id)}
                                                      >
                                                        {account?.account_name ?? "-"}
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                        {account?.account_category ?? "-"}
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                        {account?.account_subcategory ?? "-"}
                                                      </Cell>
                                                      <Cell className="pdf-table"></Cell>
                                                      <Cell className="pdf-table">
                                                        {console.log(account, childTotal, 'accountaccountaccount')}
                                                        {account?.nature == 'debit' ? CommaSeparator(Number.parseFloat(childTotal).toFixed(2)) : CommaSeparator(Number.parseFloat(childTotal).toFixed(2))}
                                                      </Cell>
                                                    </Row>
                                                    {expand.indexOf(account.id) !== -1 && (
                                                      <Fragment>
                                                        {account?.childAccounts?.map((child, j) => {
                                                          const credit = isNaN(child?.total_credit)
                                                            ? 0
                                                            : child?.total_credit
                                                          const debit = isNaN(child?.total_debit)
                                                            ? 0
                                                            : child?.total_debit
                                                          const childPeriodDifference =
                                                            child?.nature === "debit"
                                                              ? Number.parseFloat(debit) - Number.parseFloat(credit)
                                                              : Number.parseFloat(credit) - Number.parseFloat(debit)
                                                          // const childOpeningBalance = Number.parseFloat(
                                                          //   child?.opening_balance || 0,
                                                          // )
                                                          const childOpeningBalance = Number.parseFloat(
                                                            0,
                                                          )
                                                          // const adjustedChildOpeningBalance =
                                                          //   child?.nature === "credit"
                                                          //     ? childOpeningBalance * -1
                                                          //     : childOpeningBalance
                                                          const adjustedChildOpeningBalance = 0

                                                          const subTotal = (
                                                            adjustedChildOpeningBalance + childPeriodDifference
                                                          ).toFixed(2)
                                                          childFinalTotal += Number.parseFloat(subTotal)
                                                          return (
                                                            <Fragment key={j}>
                                                              <Row sx={{ bgcolor: "#EEFBEE" }}>
                                                                <Cell>
                                                                  <Typography
                                                                    className="pdf-table"
                                                                    variant="body2"
                                                                    sx={{ ml: 4.5 }}
                                                                  >
                                                                    {child?.account_code ?? "-"}
                                                                  </Typography>
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {child?.account_name ?? "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {child?.account_category ?? "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {child?.account_subcategory ?? "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {CommaSeparator(
                                                                    Number.parseFloat(subTotal).toFixed(2),
                                                                  )}
                                                                </Cell>
                                                                <Cell></Cell>
                                                              </Row>
                                                            </Fragment>
                                                          )
                                                        })}
                                                      </Fragment>
                                                    )}
                                                  </Fragment>
                                                )
                                              })}
                                              {subItem?.accounts?.length > 0 && (
                                                <Fragment>
                                                  <Row>
                                                    <Cell>
                                                      <Typography
                                                        className="pdf-table"
                                                        variant="body2"
                                                        sx={{ fontWeight: 700, ml: 4.5 }}
                                                      >
                                                        Total of {subItem?.accounts[0]?.type_code}
                                                      </Typography>
                                                    </Cell>
                                                    <Cell colSpan={3}>
                                                      <Typography
                                                        className="pdf-table"
                                                        variant="body2"
                                                        sx={{ fontWeight: 700 }}
                                                      >
                                                        Total {subItem?.name}
                                                      </Typography>
                                                    </Cell>
                                                    <Cell></Cell>
                                                    <Cell>
                                                      <Typography
                                                        className="pdf-table"
                                                        variant="body2"
                                                        sx={{ fontWeight: 700 }}
                                                      >
                                                        {CommaSeparator(Number.parseFloat(Total).toFixed(2))}
                                                      </Typography>
                                                    </Cell>
                                                  </Row>
                                                  {filters === "all" && subItem?.accounts[0]?.type_code == "E1" && (
                                                    <Row sx={{ bgcolor: Colors.primary }}>
                                                      <Cell colSpan={5}>
                                                        <Typography
                                                          className="pdf-table"
                                                          variant="body2"
                                                          sx={{ fontWeight: 700, color: Colors.white }}
                                                        >
                                                          Gross Profit
                                                        </Typography>
                                                      </Cell>
                                                      <Cell>
                                                        <Typography
                                                          className="pdf-table"
                                                          variant="body2"
                                                          sx={{ fontWeight: 700, color: Colors.white }}
                                                        >
                                                          {CommaSeparator(
                                                            Number.parseFloat(
                                                              Number.parseFloat(totalRevenue) -
                                                              Number.parseFloat(totalCost),
                                                            ).toFixed(2),
                                                          )}
                                                        </Typography>
                                                      </Cell>
                                                    </Row>
                                                  )}
                                                </Fragment>
                                              )}
                                            </Fragment>
                                          )}
                                        </Fragment>
                                      )
                                    })}
                                    {item?.sub?.length > 0 && (
                                      <Fragment>
                                        <Row sx={{ bgcolor: Colors.bluishCyan }}>
                                          <Cell>
                                            <Typography
                                              className="pdf-table"
                                              variant="body2"
                                              sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}
                                            >
                                              Total
                                            </Typography>
                                          </Cell>
                                          <Cell colSpan={3}>
                                            <Typography
                                              className="pdf-table"
                                              variant="body2"
                                              sx={{ fontWeight: 700, color: Colors.white }}
                                            >
                                              Total {item?.name}
                                            </Typography>
                                          </Cell>
                                          <Cell></Cell>
                                          <Cell>
                                            <Typography
                                              className="pdf-table"
                                              variant="body2"
                                              sx={{ fontWeight: 700, color: Colors.white }}
                                            >
                                              {CommaSeparator(Number.parseFloat(GrandTotal).toFixed(2))}
                                            </Typography>
                                          </Cell>
                                        </Row>
                                      </Fragment>
                                    )}
                                    {filteredProfitLossStatement.length - 1 === index && filters === "all" && (
                                      <Row sx={{ bgcolor: Colors.primary }}>
                                        <Cell colSpan={5}>
                                          <Typography
                                            className="pdf-table"
                                            variant="body2"
                                            sx={{ fontWeight: 700, color: Colors.white }}
                                          >
                                            Net Profit
                                          </Typography>
                                        </Cell>
                                        <Cell>

                                          <Typography
                                            className="pdf-table"
                                            variant="body2"
                                            sx={{ fontWeight: 700, color: Colors.white }}
                                          >
                                            {CommaSeparator(
                                              (
                                                Number.parseFloat(
                                                  Number.parseFloat(totalRevenue) - Number.parseFloat(totalExpenses),
                                                )
                                              ).toFixed(2),
                                            )}
                                          </Typography>
                                        </Cell>
                                      </Row>
                                    )}
                                  </Fragment>
                                )}
                              </Fragment>
                            )
                          })}
                        </Fragment>
                        <Fragment>
                          {filteredProfitLossStatement?.map((item, index) => {
                            let GrandTotal = 0
                            return (
                              <Fragment key={index}>
                                {true && (
                                  <Fragment>
                                    {filteredProfitLossStatement?.map((subItem, i) => {
                                      let Total = 0
                                      return (
                                        <Fragment key={i}>
                                          {true && (
                                            <Fragment>
                                              {subItem?.accounts?.map((account, j) => {
                                                let childFinalTotal = 0
                                                let childTotal = 0
                                                // const accountOpeningBalance = Number.parseFloat(
                                                //   account?.opening_balance || 0,
                                                // )
                                                const accountOpeningBalance = Number.parseFloat(
                                                  0,
                                                )
                                                // const adjustedAccountOpeningBalance =
                                                //   account?.nature === "credit"
                                                //     ? accountOpeningBalance * -1
                                                //     : accountOpeningBalance
                                                const adjustedAccountOpeningBalance = 0
                                                if (account?.childAccounts?.length > 0) {
                                                  const initialValue = { credit: 0, debit: 0 }
                                                  const result = account?.childAccounts?.reduce(
                                                    (accumulator, transaction) => {
                                                      const credit = isNaN(transaction?.total_credit)
                                                        ? 0
                                                        : transaction?.total_credit
                                                      const debit = isNaN(transaction?.total_debit)
                                                        ? 0
                                                        : transaction?.total_debit
                                                      return {
                                                        credit:
                                                          Number.parseFloat(accumulator.credit) +
                                                          Number.parseFloat(credit),
                                                        debit:
                                                          Number.parseFloat(accumulator.debit) +
                                                          Number.parseFloat(debit),
                                                      }
                                                    },
                                                    initialValue,
                                                  )
                                                  const periodDifferenceChildrenSum =
                                                    account?.nature === "debit"
                                                      ? Number.parseFloat(result?.debit) -
                                                      Number.parseFloat(result?.credit)
                                                      : Number.parseFloat(result?.credit) -
                                                      Number.parseFloat(result?.debit)
                                                  childTotal =
                                                    adjustedAccountOpeningBalance + periodDifferenceChildrenSum
                                                } else {
                                                  const periodDifferenceAccount =
                                                    account?.nature === "debit"
                                                      ? Number.parseFloat(account?.total_debit) -
                                                      Number.parseFloat(account?.total_credit)
                                                      : Number.parseFloat(account?.total_credit) -
                                                      Number.parseFloat(account?.total_debit)
                                                  childTotal = adjustedAccountOpeningBalance + periodDifferenceAccount
                                                }
                                                Total += Number.parseFloat(childTotal)
                                                GrandTotal += Number.parseFloat(childTotal)
                                                return (
                                                  <Fragment key={j}>
                                                    <Row>
                                                      <Cell
                                                        className={account?.childAccounts ? classes.anchorLink : ""}
                                                        onClick={() => handleExpand(account?.id)}
                                                      >
                                                        <Typography
                                                          className="pdf-table"
                                                          variant="body2"
                                                          sx={{ ml: 3 }}
                                                        >
                                                          {account?.account_code ?? "-"}
                                                        </Typography>
                                                      </Cell>
                                                      <Cell
                                                        className={
                                                          account?.childAccounts
                                                            ? classes.anchorLink + " " + "pdf-table"
                                                            : "pdf-table"
                                                        }
                                                        onClick={() => handleExpand(account?.id)}
                                                      >
                                                        {account?.account_name ?? "-"}
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                        {account?.account_category ?? "-"}
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                        {account?.account_subcategory ?? "-"}
                                                      </Cell>
                                                      <Cell></Cell>
                                                      <Cell className="pdf-table">
                                                        {CommaSeparator(Number.parseFloat(childTotal).toFixed(2))}
                                                      </Cell>
                                                    </Row>
                                                    {expand.indexOf(account.id) !== -1 && (
                                                      <Fragment>
                                                        {account?.childAccounts?.map((child, j) => {
                                                          const credit = isNaN(child?.total_credit)
                                                            ? 0
                                                            : child?.total_credit
                                                          const debit = isNaN(child?.total_debit)
                                                            ? 0
                                                            : child?.total_debit
                                                          const childPeriodDifference =
                                                            child?.nature === "debit"
                                                              ? Number.parseFloat(debit) - Number.parseFloat(credit)
                                                              : Number.parseFloat(credit) - Number.parseFloat(debit)
                                                          // const childOpeningBalance = Number.parseFloat(
                                                          //   child?.opening_balance || 0,
                                                          // )
                                                          const childOpeningBalance = Number.parseFloat(
                                                            0,
                                                          )
                                                          // const adjustedChildOpeningBalance =
                                                          //   child?.nature === "credit"
                                                          //     ? childOpeningBalance * -1
                                                          //     : childOpeningBalance
                                                          const adjustedChildOpeningBalance = 0

                                                          const subTotal = (
                                                            adjustedChildOpeningBalance + childPeriodDifference
                                                          ).toFixed(2)
                                                          childFinalTotal += Number.parseFloat(subTotal)
                                                          return (
                                                            <Fragment key={j}>
                                                              <Row sx={{ bgcolor: "#EEFBEE" }}>
                                                                <Cell>
                                                                  <Typography
                                                                    className="pdf-table"
                                                                    variant="body2"
                                                                    sx={{ ml: 4.5 }}
                                                                  >
                                                                    {child?.account_code ?? "-"}
                                                                  </Typography>
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {child?.account_name ?? "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {child?.account_category ?? "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {child?.account_subcategory ?? "-"}
                                                                </Cell>
                                                                <Cell className="pdf-table">
                                                                  {CommaSeparator(
                                                                    Number.parseFloat(subTotal).toFixed(2),
                                                                  )}
                                                                </Cell>
                                                                <Cell></Cell>
                                                              </Row>
                                                            </Fragment>
                                                          )
                                                        })}
                                                      </Fragment>
                                                    )}
                                                  </Fragment>
                                                )
                                              })}
                                              {subItem?.accounts?.length > 0 && (
                                                <Fragment>
                                                  <Row>
                                                    <Cell>
                                                      <Typography
                                                        className="pdf-table"
                                                        variant="body2"
                                                        sx={{ fontWeight: 700, ml: 4.5 }}
                                                      >
                                                        Total of {subItem?.accounts[0]?.type_code}
                                                      </Typography>
                                                    </Cell>
                                                    <Cell colSpan={3}>
                                                      <Typography
                                                        className="pdf-table"
                                                        variant="body2"
                                                        sx={{ fontWeight: 700 }}
                                                      >
                                                        Total {subItem?.name}
                                                      </Typography>
                                                    </Cell>
                                                    <Cell></Cell>
                                                    <Cell>
                                                      <Typography
                                                        className="pdf-table"
                                                        variant="body2"
                                                        sx={{ fontWeight: 700 }}
                                                      >
                                                        {CommaSeparator(Number.parseFloat(Total).toFixed(2))}
                                                      </Typography>
                                                    </Cell>
                                                  </Row>
                                                  {filters === "all" && subItem?.name === "Cost of Sales" && (
                                                    <Row sx={{ bgcolor: Colors.primary }}>
                                                      <Cell colSpan={5}>
                                                        <Typography
                                                          className="pdf-table"
                                                          variant="body2"
                                                          sx={{ fontWeight: 700, color: Colors.white }}
                                                        >
                                                          Gross Profitssdasdasda
                                                        </Typography>
                                                      </Cell>
                                                      <Cell>
                                                        <Typography
                                                          className="pdf-table"
                                                          variant="body2"
                                                          sx={{ fontWeight: 700, color: Colors.white }}
                                                        >
                                                          {/* {parseFloat(Total).toFixed(2)}sadsadsda */}
                                                        </Typography>
                                                      </Cell>
                                                    </Row>
                                                  )}
                                                </Fragment>
                                              )}
                                            </Fragment>
                                          )}
                                        </Fragment>
                                      )
                                    })}
                                    {item?.sub?.length > 0 && (
                                      <Fragment>
                                        {/* <Row sx={{ bgcolor: Colors.bluishCyan }}>
                                        <Cell>
                                          <Typography variant="body2" sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}>
                                            Total
                                          </Typography>
                                        </Cell>
                                        <Cell colSpan={3}>
                                          <Typography variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                            Total {item?.name}sda
                                          </Typography>
                                        </Cell>
                                        <Cell>
                                        </Cell>
                                        <Cell>
                                          <Typography variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                            {parseFloat(GrandTotal).toFixed(2)}
                                          </Typography>
                                        </Cell>
                                      </Row> */}
                                      </Fragment>
                                    )}
                                    {/* {filteredProfitLossStatement.length - 1 === index && filters === 'all' &&
                                    <Row sx={{ bgcolor: Colors.primary }}>
                                      <Cell colSpan={5}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                          Net Profit
                                        </Typography>
                                      </Cell>
                                      <Cell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {parseFloat(TotalEquity).toFixed(2)}
                                        </Typography>
                                      </Cell>
                                    </Row>
                                  } */}
                                  </Fragment>
                                )}
                              </Fragment>
                            )
                          })}
                        </Fragment>
                      </>
                    ) : (
                      <Row>
                        <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                          No Data Found
                        </Cell>
                      </Row>
                    )
                  ) : (
                    <Row>
                      <Cell colSpan={tableHead.length + 2} align="center" sx={{ fontWeight: 600 }}>
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

export default ProfitLossStatement
