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
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ExpandLess, ExpandMore } from "@mui/icons-material"
import FinanceServices from "services/Finance"
import { PrimaryButton } from "components/Buttons"
import { saveAs } from "file-saver"
import { agencyType, CommaSeparator } from "utils"
import { PDFExport } from "@progress/kendo-react-pdf"
import SearchIcon from "@mui/icons-material/Search"
import moment from "moment"
import CustomerServices from "services/Customer"
import { showErrorToast } from "components/NewToaster"
import DatePicker from "components/DatePicker"
import SelectField from "components/Select"
import ExcelJS from "exceljs"

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
  anchorLink: {
    textDecoration: "underline",
    color: Colors.twitter,
    cursor: "pointer",
  },
})

// Helper function to transform data for display and Excel export
const transformDataForDisplay = (data) => {
  return data.map((majorCategory) => {
    const groupedSubcategories = {}

    majorCategory.sub.forEach((subItem) => {
      subItem.accounts.forEach((account) => {
        const subcategoryName = account.account_subcategory || "Uncategorized"

        if (!groupedSubcategories[subcategoryName]) {
          groupedSubcategories[subcategoryName] = {
            name: subcategoryName,
            accounts: [],
            calculated_total: 0,
          }
        }

        let accountBalance = 0
        const credit = Number.parseFloat(account.total_credit) || 0
        const debit = Number.parseFloat(account.total_debit) || 0

        if (Array.isArray(account.childAccounts) && account.childAccounts.length > 0) {
          const childBalance = account.childAccounts.reduce((sum, child) => {
            const cc = Number.parseFloat(child.total_credit) || 0
            const cd = Number.parseFloat(child.total_debit) || 0
            return sum + (child.nature === "debit" ? cd - cc : cc - cd)
          }, 0)
          accountBalance = childBalance
        } else {
          accountBalance = account.nature === "debit" ? debit - credit : credit - debit
        }

        groupedSubcategories[subcategoryName].accounts.push(account)
        groupedSubcategories[subcategoryName].calculated_total += accountBalance
      })
    })

    return {
      ...majorCategory,
      subcategories_grouped: Object.values(groupedSubcategories),
    }
  })
}

function BalanceSheetDetailed() {
  const classes = useStyles()
  const navigate = useNavigate()
  const contentRef = useRef(null)
  const { register } = useForm()
  const tableHead = ["Code", "Name", "Major Category", "Sub Category", "Sub Total (AED)", "Final Total (AED)"]
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
  const TotalEquity = 0

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
  const getBalanceSheet = async (filter) => {
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

  // Effect to transform data for display whenever filteredBalanceSheet changes
  useEffect(() => {
    setDisplayData(transformDataForDisplay(filteredBalanceSheet))
  }, [filteredBalanceSheet])

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

  // *For Filter Chart of Account By Search (kept as is, but might not fully align with new display)
  const filterBySearch = (search) => {
    const result = []
    for (const item of balanceSheet) {
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
    setFilteredBalanceSheet(result)
  }

  const downloadExcel = () => {
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
    const titleRow = worksheet.addRow(["BALANCE SHEET"])
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "2F4F4F" },
    }
    titleRow.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A1:F1") // Merged to F as there are 6 columns

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

    const costCenter = worksheet.addRow([`Cost Center: ${selectedCostCenter?.name}`])
    costCenter.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    costCenter.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells("A5:F5")

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
    worksheet.mergeCells("A6:F6")

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

    // Process data with exact same logic as displayData
    let GrandTotal = 0
    let TotalEquity = 0

    const excelDisplayData = transformDataForDisplay(filteredBalanceSheet)

    excelDisplayData?.forEach((majorCategoryItem) => {
      let majorCategoryTotal = 0

      // Main section row (Assets/Liabilities/Equity)
      const sectionRow = worksheet.addRow([majorCategoryItem.name, "", "", "", "", ""])
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
      worksheet.mergeCells(`A${sectionRow.number}:F${sectionRow.number}`)

      majorCategoryItem?.subcategories_grouped?.forEach((groupedSubcategory) => {
        let subcategoryCalculatedTotal = 0

        // Subcategory Group Header (e.g., CWIP)
        const subCategoryGroupRow = worksheet.addRow([groupedSubcategory.name, "", "", "", "", ""])
        subCategoryGroupRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "E6E6FA" }, // Lavender
        }
        subCategoryGroupRow.getCell(1).font = {
          name: "Arial",
          bold: true,
          size: 11,
          color: { argb: "2F4F4F" },
        }
        subCategoryGroupRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
        worksheet.mergeCells(`A${subCategoryGroupRow.number}:F${subCategoryGroupRow.number}`)

        groupedSubcategory.accounts?.forEach((account) => {
          let accountDisplayTotal =
            account?.nature === "debit"
              ? Number.parseFloat(account?.total_debit || 0) - Number.parseFloat(account?.total_credit || 0)
              : Number.parseFloat(account?.total_credit || 0) - Number.parseFloat(account?.total_debit || 0)
          if (Array.isArray(account?.childAccounts) && account.childAccounts.length > 0) {
            const childSum = account.childAccounts.reduce((sum, child) => {
              const cc = Number.parseFloat(child?.total_credit) || 0
              const cd = Number.parseFloat(child?.total_debit) || 0
              return sum + (child?.nature === "debit" ? cd - cc : cc - cd)
            }, 0)
            accountDisplayTotal = childSum
          }

          subcategoryCalculatedTotal += accountDisplayTotal
          majorCategoryTotal += accountDisplayTotal
          GrandTotal += accountDisplayTotal
          if (
            majorCategoryItem?.name?.toLowerCase().includes("equity") ||
            majorCategoryItem?.name?.toLowerCase().includes("liabilities")
          ) {
            TotalEquity += accountDisplayTotal
          }

          // Account row
          const accountRow = worksheet.addRow([
            account?.account_code ?? "-",
            account?.account_name ?? "-",
            account?.account_category ?? "-",
            account?.account_subcategory ?? "-",
            "", // Sub Total (AED) - empty for parent account
            Number.parseFloat(accountDisplayTotal.toFixed(2)), // Final Total (AED)
          ])
          // Style account rows
          accountRow.eachCell((cell, colNumber) => {
            cell.font = { name: "Arial", size: 10 }
            cell.alignment = {
              horizontal: colNumber === 6 ? "right" : "left", // Final Total column is 6th (index 5)
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
              const childCredit = isNaN(child?.total_credit) ? 0 : Number.parseFloat(child?.total_credit)
              const childDebit = isNaN(child?.total_debit) ? 0 : Number.parseFloat(child?.total_debit)
              const childSubTotal = child?.nature === "debit" ? childDebit - childCredit : childCredit - childDebit

              const childRow = worksheet.addRow([
                child?.account_code ?? "-",
                child?.account_name ?? "-",
                child?.account_category ?? "-",
                child?.account_subcategory ?? "-",
                Number.parseFloat(childSubTotal).toFixed(2), // Sub Total (AED)
                "", // Final Total (AED) - empty for child
              ])
              // Style child rows
              childRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 9, italic: true }
                cell.alignment = {
                  horizontal: colNumber === 5 ? "right" : "left", // Sub Total column is 5th (index 4)
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

        // Subtotal for the grouped subcategory (e.g., Total - CWIP)
        if (groupedSubcategory?.accounts?.length > 0) {
          const subtotalRow = worksheet.addRow([
            `Total - ${groupedSubcategory.name}`,
            "",
            "",
            "",
            "",
            Number.parseFloat(subcategoryCalculatedTotal).toFixed(2),
          ])
          subtotalRow.eachCell((cell, colNumber) => {
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
              horizontal: colNumber === 6 ? "right" : "left",
              vertical: "middle",
            }
            cell.border = {
              top: { style: "medium", color: { argb: "000000" } },
              left: { style: "medium", color: { argb: "000000" } },
              bottom: { style: "medium", color: { argb: "000000" } },
              right: { style: "medium", color: { argb: "000000" } },
            }
          })
          worksheet.mergeCells(`A${subtotalRow.number}:E${subtotalRow.number}`)
        }
      })

      // Section total (Assets / Liabilities / Equity)
      if (majorCategoryItem?.subcategories_grouped?.length > 0) {
        const sectionTotalRow = worksheet.addRow([
          `Total ${majorCategoryItem?.name}`,
          "",
          "",
          "",
          "",
          Number.parseFloat(majorCategoryTotal).toFixed(2),
        ])
        sectionTotalRow.eachCell((cell, colNumber) => {
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
            horizontal: colNumber === 6 ? "right" : "left",
            vertical: "middle",
          }
          cell.border = {
            top: { style: "medium", color: { argb: "000000" } },
            left: { style: "medium", color: { argb: "000000" } },
            bottom: { style: "medium", color: { argb: "000000" } },
            right: { style: "medium", color: { argb: "000000" } },
          }
        })
        worksheet.mergeCells(`A${sectionTotalRow.number}:E${sectionTotalRow.number}`)
      }
    })

    // Grand Total row
    worksheet.addRow([]) // Empty row for spacing
    worksheet.addRow([]) // Empty row for spacing

    const retainProfitRow = worksheet.addRow([
      "Retain Profit",
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
        horizontal: colNumber === 6 ? "right" : "left",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thick", color: { argb: "FFFFFF" } },
        left: { style: "thick", color: { argb: "FFFFFF" } },
        bottom: { style: "thick", color: { argb: "FFFFFF" } },
        right: { style: "thick", color: { argb: "FFFFFF" } },
      }
    })
    worksheet.mergeCells(`A${retainProfitRow.number}:E${retainProfitRow.number}`)

    const grandTotalRow = worksheet.addRow([
      "Owner Capital + Liabilities + Retain Profit",
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
    grandTotalRow.eachCell((cell, colNumber) => {
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
        horizontal: colNumber === 6 ? "right" : "left",
        vertical: "middle",
      }
      cell.border = {
        top: { style: "thick", color: { argb: "FFFFFF" } },
        left: { style: "thick", color: { argb: "FFFFFF" } },
        bottom: { style: "thick", color: { argb: "FFFFFF" } },
        right: { style: "thick", color: { argb: "FFFFFF" } },
      }
    })
    worksheet.mergeCells(`A${grandTotalRow.number}:E${grandTotalRow.number}`)

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
    worksheet.mergeCells(`A${reportRow.number}:F${reportRow.number}`)

    const system2 = worksheet.addRow([`Powered By: MangotechDevs.ae`])
    system2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    }
    system2.getCell(1).alignment = { horizontal: "center" }
    worksheet.mergeCells(`A${system2.number}:F${system2.number}`)

    // Set column widths
    worksheet.columns = [{ width: 15 }, { width: 35 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 18 }]

    // Add workbook properties
    workbook.creator = "Finance Department"
    workbook.lastModifiedBy = "Finance System"
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    // Set workbook properties
    workbook.properties = {
      title: "Balance Sheet",
      subject: "Financial Report",
      keywords: "balance sheet, financial, accounting",
      category: "Financial Reports",
      description: "Comprehensive balance sheet generated from accounting system",
      company: "Your Company Name",
    }

    // Add empty row for spacing
    worksheet.addRow([])

    const download = async () => {
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(
        blob,
        toDate && fromDate
          ? `Balance Sheet : ${fromDate ? moment(fromDate).format("MM/DD/YYYY") : "-"} To ${toDate ? moment(toDate).format("MM/DD/YYYY") : "Present"}`
          : `Balance Sheet: Present `,
      )
    }
    download()
  }

  useEffect(() => {
    getBalanceSheet()
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
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
          Balance Sheet
        </Typography>
        {balanceSheet?.length > 0 && (
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
            onClick={() => getBalanceSheet(null, null, null)}
          />
        </Grid>
      </Grid>
      {/* Filters */}
      {/* <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Search'}
            placeholder={'Search'}
            register={register('search', {
              onChange: (e) => filterBySearch(e.target.value)
            })}
          />
        </Grid>
      </Grid> */}
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
                          let majorCategoryTotal = 0
                          return (
                            <Fragment key={majorIndex}>
                              {/* Major Category Row (e.g., Asset) */}
                              <Row>
                                <Cell className="pdf-table" colSpan={tableHead?.length}>
                                  <Typography className="pdf-table" variant="subtitle1" sx={{ textAlign: "left" }}>
                                    {expand.indexOf(majorCategoryItem.id) === -1 ? (
                                      <ExpandMore
                                        className="pdf-hide"
                                        sx={{
                                          verticalAlign: "sub",
                                          cursor: "pointer",
                                          opacity: majorCategoryItem?.subcategories_grouped?.length > 0 ? 1 : 0,
                                        }}
                                        onClick={() => handleExpand(majorCategoryItem.id)}
                                      />
                                    ) : (
                                      <ExpandLess
                                        className="pdf-hide"
                                        sx={{
                                          verticalAlign: "sub",
                                          cursor: "pointer",
                                          transform: "rotate(90deg)",
                                          opacity: majorCategoryItem?.subcategories_grouped?.length > 0 ? 1 : 0,
                                        }}
                                        onClick={() => handleExpand(majorCategoryItem.id)}
                                      />
                                    )}
                                    {majorCategoryItem?.name}
                                  </Typography>
                                </Cell>
                              </Row>

                              {expand.indexOf(majorCategoryItem.id) === -1 && ( // If major category is expanded
                                <Fragment>
                                  {majorCategoryItem?.subcategories_grouped?.map((groupedSubcategory, subIndex) => {
                                    majorCategoryTotal += groupedSubcategory.calculated_total // Accumulate to major category total

                                    return (
                                      <Fragment key={subIndex}>
                                        {/* Subcategory Group Header (e.g., CWIP) */}
                                        <Row>
                                          <Cell className="pdf-table" colSpan={tableHead?.length}>
                                            <Typography
                                              className="pdf-table"
                                              variant="body1"
                                              sx={{ fontWeight: 700, textAlign: "left", ml: 1.5 }}
                                            >
                                              {expand.indexOf(groupedSubcategory.name) === -1 ? ( // Use subcategory name as ID for expand
                                                <ExpandMore
                                                  className="pdf-hide"
                                                  sx={{
                                                    verticalAlign: "sub",
                                                    cursor: "pointer",
                                                    opacity: groupedSubcategory?.accounts?.length > 0 ? 1 : 0,
                                                  }}
                                                  onClick={() => handleExpand(groupedSubcategory.name)}
                                                />
                                              ) : (
                                                <ExpandLess
                                                  className="pdf-hide"
                                                  sx={{
                                                    verticalAlign: "sub",
                                                    cursor: "pointer",
                                                    transform: "rotate(90deg)",
                                                    opacity: groupedSubcategory?.accounts?.length > 0 ? 1 : 0,
                                                  }}
                                                  onClick={() => handleExpand(groupedSubcategory.name)}
                                                />
                                              )}
                                              {groupedSubcategory.name}
                                            </Typography>
                                          </Cell>
                                        </Row>

                                        {expand.indexOf(groupedSubcategory.name) === -1 && ( // If subcategory group is expanded
                                          <Fragment>
                                            {groupedSubcategory.accounts?.map((account, accIndex) => {
                                              let accountDisplayTotal =
                                                account?.nature === "debit"
                                                  ? Number.parseFloat(account?.total_debit || 0) -
                                                    Number.parseFloat(account?.total_credit || 0)
                                                  : Number.parseFloat(account?.total_credit || 0) -
                                                    Number.parseFloat(account?.total_debit || 0)
                                              if (
                                                Array.isArray(account?.childAccounts) &&
                                                account.childAccounts.length > 0
                                              ) {
                                                const childSum = account.childAccounts.reduce((sum, child) => {
                                                  const cc = Number.parseFloat(child?.total_credit) || 0
                                                  const cd = Number.parseFloat(child?.total_debit) || 0
                                                  return sum + (child?.nature === "debit" ? cd - cc : cc - cd)
                                                }, 0)
                                                accountDisplayTotal = childSum
                                              }

                                              return (
                                                <Fragment key={accIndex}>
                                                  {/* Account Row */}
                                                  <Row>
                                                    <Cell
                                                      className={
                                                        account?.childAccounts
                                                          ? classes.anchorLink + " " + "pdf-table"
                                                          : "pdf-table"
                                                      }
                                                      onClick={() => handleExpand(account?.id)}
                                                    >
                                                      <Typography variant="body1" sx={{ ml: 3 }}>
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
                                                    <Cell className="pdf-table">
                                                      {/* Sub Total (AED) - empty for parent account */}
                                                    </Cell>
                                                    <Cell className="pdf-table">
                                                      {/* Final Total (AED) */}
                                                      {CommaSeparator(
                                                        Number.parseFloat(accountDisplayTotal.toFixed(2)),
                                                      )}
                                                    </Cell>
                                                  </Row>

                                                  {expand.indexOf(account.id) !== -1 && ( // If account is expanded, show child accounts
                                                    <Fragment>
                                                      {account?.childAccounts?.map((child, childAccIndex) => {
                                                        const childCredit = isNaN(child?.total_credit)
                                                          ? 0
                                                          : Number.parseFloat(child?.total_credit)
                                                        const childDebit = isNaN(child?.total_debit)
                                                          ? 0
                                                          : Number.parseFloat(child?.total_debit)
                                                        const childSubTotal =
                                                          child?.nature === "debit"
                                                            ? childDebit - childCredit
                                                            : childCredit - childDebit

                                                        return (
                                                          <Fragment key={childAccIndex}>
                                                            <Row sx={{ bgcolor: "#EEFBEE" }}>
                                                              <Cell className="pdf-table">
                                                                <Typography variant="body1" sx={{ ml: 4.5 }}>
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
                                                                {/* Sub Total (AED) */}
                                                                {CommaSeparator(
                                                                  Number.parseFloat(childSubTotal).toFixed(2),
                                                                )}
                                                              </Cell>
                                                              <Cell className="pdf-table">
                                                                {/* Final Total (AED) - empty for child account */}
                                                              </Cell>
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
                                                <Cell>
                                                  <Typography variant="body1" sx={{ fontWeight: 700, ml: 4.5 }}>
                                                    Total of {groupedSubcategory.name}
                                                  </Typography>
                                                </Cell>
                                                <Cell colSpan={3}>
                                                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    Total {groupedSubcategory.name}
                                                  </Typography>
                                                </Cell>
                                                <Cell></Cell>
                                                <Cell>
                                                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {CommaSeparator(
                                                      Number.parseFloat(groupedSubcategory.calculated_total).toFixed(2),
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
                                  {/* Total for Major Category (e.g., Total Asset) */}
                                  {majorCategoryItem?.subcategories_grouped?.length > 0 && (
                                    <Row
                                      sx={{
                                        bgcolor:
                                          majorCategoryItem?.name === "Asset" ? Colors.primary : Colors.bluishCyan,
                                      }}
                                    >
                                      <Cell>
                                        <Typography
                                          variant="body1"
                                          sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}
                                        >
                                          Totals
                                        </Typography>
                                      </Cell>
                                      <Cell colSpan={3}>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          Total {majorCategoryItem?.name}
                                        </Typography>
                                      </Cell>
                                      <Cell></Cell>
                                      <Cell>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          {CommaSeparator(Number.parseFloat(majorCategoryTotal).toFixed(2))}
                                        </Typography>
                                      </Cell>
                                    </Row>
                                  )}
                                </Fragment>
                              )}
                            </Fragment>
                          )
                        })}
                        <Row>
                          <Cell colSpan={tableHead.length}></Cell>
                        </Row>
                        <Row sx={{ bgcolor: Colors.primary }}>
                          <Cell colSpan={5}>
                            <Typography
                              className="pdf-table"
                              variant="body1"
                              sx={{ fontWeight: 700, ml: 4.5, color: "white" }}
                            >
                              Retain Profit
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
                                  Number.parseFloat(Number.parseFloat(totalRevenue) - Number.parseFloat(totalCost)) -
                                  Number.parseFloat(adminOpTotal)
                                ).toFixed(2),
                              )}
                            </Typography>
                          </Cell>
                        </Row>
                        <Row sx={{ bgcolor: Colors.primary }}>
                          <Cell>
                            <Typography
                              className="pdf-table"
                              variant="body1"
                              sx={{ fontWeight: 700, ml: 4.5, color: "white" }}
                            >
                              Total
                            </Typography>
                          </Cell>
                          <Cell colSpan={3}>
                            <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: "white" }}>
                              Owner Capital + Liabilities + Retain Profit
                            </Typography>
                          </Cell>
                          <Cell></Cell>
                          <Cell>
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
                          </Cell>
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
