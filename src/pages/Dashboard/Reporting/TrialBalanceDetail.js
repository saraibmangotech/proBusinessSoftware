import React, { Fragment, useEffect, useRef, useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    IconButton,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    tableCellClasses,
    CircularProgress,
    Grid,
    Tabs,
    Tab,
} from "@mui/material";
import styled from "@emotion/styled";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster } from "components/Toaster";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

import SearchIcon from "@mui/icons-material/Search";
import FinanceServices from "services/Finance";
import Highlighter from "react-highlight-words";
import InputField from "components/Input";
import { PrimaryButton } from "components/Buttons";
import ExportFinanceServices from "services/ExportFinance";
import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { agencyType, CommaSeparator, handleExportWithComponent } from "utils";
import { PDFExport } from "@progress/kendo-react-pdf";
import moment from "moment";
import SelectField from "components/Select";
import DatePicker from "components/DatePicker";
import CustomerServices from "services/Customer";
import { showErrorToast } from "components/NewToaster";
import ExcelJS from "exceljs";


// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        border: 0,
        padding: "15px",
        textAlign: "center",
        whiteSpace: "nowrap",
        background: Colors.primary,
        color: Colors.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: FontFamily.NunitoRegular,
        textAlign: "center",
        textWrap: "nowrap",
        padding: '5px !important',

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
}));

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
});

function TrialBalanceDetailed() {
    const classes = useStyles();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const { register } = useForm();

    const [expandedCategories, setExpandedCategories] = useState({})

    const tableHead = [
        "Code",
        "Name",

        "Opening Balance",
        "Total Debit (AED)",
        "Total Credit (AED)",
        "Period Difference (AED)",
        "Balance (AED)",

    ];

    const [loader, setLoader] = useState(false);

    // *For Balance Sheet
    const [balanceSheet, setBalanceSheet] = useState([]);
    const [filteredBalanceSheet, setFilteredBalanceSheet] = useState([]);

    const [textValue, setTextValue] = useState("");

    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState("all");
    const [filterData, setFilterData] = useState();

    const [childTabs, setChildTabs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("")
    const [allDebit, setAllDebit] = useState(0)
    const [allCredit, setAllCredit] = useState(0)

    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)

    // *For Collapse
    const [expand, setExpand] = useState([]);



    const filterData2 = (item) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()

        // Check if the account code, name, category, or subcategory contains the search term
        return (
            item.account_code?.toLowerCase().includes(searchLower) ||
            item.account_name?.toLowerCase().includes(searchLower) ||
            item.account_category?.toLowerCase().includes(searchLower) ||
            item.account_subcategory?.toLowerCase().includes(searchLower)
        )
    }

    let TotalEquity = 0;
    const toggleCategory = (categoryId) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }))
    }

    const toggleSubCategory = (subCategoryId) => {
        console.log(subCategoryId, 'subCategoryIdsubCategoryId')
        setExpandedCategories((prev) => ({
            ...prev,
            [`sub_${subCategoryId}`]: !prev[`sub_${subCategoryId}`],
        }))
    }

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    // *For Get Balance Sheet
    const getBalanceSheet = async (filter) => {
        try {
            let params = {
                cost_center: selectedCostCenter?.name,
                from_date: moment(fromDate).format('MM-DD-YYYY'),
                to_date: moment(toDate).format('MM-DD-YYYY'),
            }
            const { data } = await FinanceServices.getAccountReportsDetail(params);
            console.log(data?.detail, 'data?.detail');

            setBalanceSheet(data?.detail);
            setFilteredBalanceSheet(data?.detail);
            console.log(data?.detail, "data?.detail");
            const fil = [];
            data?.detail.forEach((e) => {
                let obj = {
                    id: e.id,
                    name: e.name,
                    sub_accounts: e.sub,
                };
                fil.push(obj);
            });
            setFilterData(fil);
            const calculateTotalForAllCategories = (data) => {
                let totalDebit = 0;
                let totalCredit = 0;

                const processAccounts = (accounts) => {
                    accounts.forEach((account) => {
                        const credit = parseFloat(account.total_credit) || 0;
                        const debit = parseFloat(account.total_debit) || 0;


                        totalDebit += debit


                        totalCredit += credit


                        console.log(debit, 'Debit', account.nature);
                        console.log(credit, 'credit', account.nature);
                        console.log(totalDebit, 'totalDebit', account.nature);
                        console.log(totalCredit, 'totalCredit', account.nature);
                        if (account.childAccounts && Array.isArray(account.childAccounts)) {
                            processAccounts(account.childAccounts);
                        }
                    });
                };

                data.forEach((category) => {
                    if (category.sub && Array.isArray(category.sub)) {
                        category.sub.forEach((subItem) => {
                            if (subItem.accounts && Array.isArray(subItem.accounts)) {
                                processAccounts(subItem.accounts);
                            }
                        });
                    }
                });

                return {
                    totalDebit: totalDebit.toFixed(4),
                    totalCredit: totalCredit.toFixed(4),
                };
            };

            // Example usage
            const myData = [
                // ... (your array of objects)
            ];

            const totalForAllCategories = calculateTotalForAllCategories(data?.detail);
            setAllDebit(totalForAllCategories.totalDebit)
            setAllCredit(totalForAllCategories.totalCredit)
            console.log('Total Debit for All Categories:', totalForAllCategories.totalDebit);
            console.log('Total Credit for All Categories:', totalForAllCategories.totalCredit);




        } catch (error) {
            ErrorToaster(error);
        }
    };

    function scrollToHighlightedElement() {
        // Find the element with the class 'highlighted'
        const highlightedElement = document.querySelector('.highlighted');

        // Log the highlighted element to the console (for debugging purposes)
        console.log(highlightedElement);

        if (highlightedElement) {
            // Find the child element you want to scroll to (replace 'childClassName' with the actual class name of the child element)
            const childElement = highlightedElement.querySelector('span');
            console.log(childElement);
            console.log(childElement.querySelector('.highlighted'));
            if (childElement) {
                // Scroll the child element into view with smooth behavior and centered alignment
                childElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // *For Handle Filter
    const handleFilter = (event, newValue, child) => {
        if (child) {
            console.log(newValue, "newValue");
            console.log(balanceSheet);
            console.log(
                balanceSheet?.map((item) =>
                    item?.sub?.filter((subItem) => subItem?.id == newValue)
                ),
                "sdasadsda"
            );
            const arrayOfArrays = balanceSheet?.map((item) =>
                item?.sub?.filter((subItem) => subItem?.id == newValue)
            );
            const nonEmptyArrays = arrayOfArrays.filter((arr) => arr.length > 0);

            // Log the result to the console
            console.log(nonEmptyArrays.flat());
            setFilteredBalanceSheet(nonEmptyArrays.flat());

            setFilters(newValue);
        } else {
            setFilters(newValue);
            if (newValue === "all") {
                setFilteredBalanceSheet(balanceSheet);
                setChildTabs(balanceSheet.find((item) => item?.id == newValue)?.sub);
            } else {
                const filterData = balanceSheet.filter((e) => e.id === newValue);
                setChildTabs(balanceSheet.find((item) => item?.id == newValue)?.sub);
                setFilteredBalanceSheet(filterData);
            }
        }
    };

    // *For Handle Expand
    const handleExpand = (id) => {
        try {
            const currentIndex = expand.indexOf(id);
            const newExpand = [...expand];

            if (currentIndex === -1) {
                newExpand.push(id);
            } else {
                newExpand.splice(currentIndex, 1);
            }

            setExpand(newExpand);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const Search = () => {
        let textToSearch = document.getElementById("text-to-search").value;
        setTextValue(textToSearch);

        scrollToHighlightedElement();
    };

    // *For Filter Chart of Account By Search
    const filterBySearch = (search) => {
        const result = [];

        for (const item of balanceSheet) {
            if (item?.sub.length > 0) {
                for (const sub of item?.sub) {
                    if (sub?.accounts?.length > 0) {
                        for (const acc of sub?.accounts) {
                            if (
                                acc.account_name
                                    ?.toLowerCase()
                                    ?.includes(search?.toLowerCase()) ||
                                acc.account_code?.toLowerCase()?.includes(search?.toLowerCase())
                            ) {
                                result.push(item);
                            } else {
                                if (acc?.childAccounts?.length > 0) {
                                    for (const subAcc of acc?.childAccounts) {
                                        if (
                                            subAcc.account_name
                                                ?.toLowerCase()
                                                ?.includes(search?.toLowerCase()) ||
                                            subAcc.account_code
                                                ?.toLowerCase()
                                                ?.includes(search?.toLowerCase())
                                        ) {
                                            result.push(item);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        setFilteredBalanceSheet(result);
    };




   
    
    const downloadExcel = async () => {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Trial Balance")
      // Set professional header and footer
      worksheet.headerFooter.oddHeader =
        '&C&"Arial,Bold"&18TRIAL BALANCE REPORT\n' +
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
          footer: 0.3,
        },
      }
    
      // Add title section at the top of the worksheet
      const titleRow = worksheet.addRow(["TRIAL BALANCE REPORT"])
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
        `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
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
          ? `Period:  ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
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
    
      const filterData2 = () => true
    
      filteredBalanceSheet.forEach((category) => {
        const catRow = worksheet.addRow([category.name])
        catRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" }, // Blue
        }
        catRow.getCell(1).font = { bold: true, color: { argb: "FFFFFF" } }
        worksheet.mergeCells(`A${catRow.number}:G${catRow.number}`)
    
        // Category totals
        let categoryDebit = 0
        let categoryCredit = 0
        let categoryOpening = 0
        let categoryDiff = 0
        let categoryBalance = 0
    
        category.sub?.forEach((subCategory) => {
          const subCatRow = worksheet.addRow(["", subCategory.name])
          subCatRow.getCell(2).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D3D3D3" }, // Light gray
          }
          subCatRow.getCell(2).font = { bold: true }
          worksheet.mergeCells(`B${subCatRow.number}:G${subCatRow.number}`)
    
          // Subcategory totals
          let subCategoryDebit = 0
          let subCategoryCredit = 0
          let subCategoryOpening = 0
          let subCategoryDiff = 0
          let subCategoryBalance = 0
    
          const subcategoryTypeGroups = {}
    
          subCategory.accounts?.filter(filterData2).forEach((account) => {
            const subType = account.account_subcategory || "Uncategorized"
            if (!subcategoryTypeGroups[subType]) subcategoryTypeGroups[subType] = []
    
            // Calculate totals including child accounts
            let debit = Number.parseFloat(account.total_debit) || 0
            let credit = Number.parseFloat(account.total_credit) || 0
            let opening = account?.nature == 'credit' ?  -1 *  (Number.parseFloat(account.opening_balance) || 0) : (Number.parseFloat(account.opening_balance) || 0)
    
            if (Array.isArray(account.childAccounts)) {
              account.childAccounts.filter(filterData2).forEach((child) => {
                debit += Number.parseFloat(child.total_debit) || 0
                credit += Number.parseFloat(child.total_credit) || 0
                opening += child?.nature == 'credit' ?  -1 *  (Number.parseFloat(child.opening_balance) || 0) : (Number.parseFloat(child.opening_balance) || 0)
    
                // Process nested child accounts if any
                if (Array.isArray(child.childAccounts)) {
                  child.childAccounts.filter(filterData2).forEach((grandchild) => {
                    debit += Number.parseFloat(grandchild.total_debit) || 0
                    credit += Number.parseFloat(grandchild.total_credit) || 0
                    opening += grandchild?.nature == 'credit' ?  -1 *  (Number.parseFloat(grandchild.opening_balance) || 0) : (Number.parseFloat(grandchild.opening_balance) || 0)
                  })
                }
              })
            }
    
            // Change this line:
            // const periodDiff = account.nature === "debit" ? debit - credit : credit - debit
    
            // To this:
            const periodDiff = debit - credit
    
            const closingBalance =  opening + periodDiff
    
            subcategoryTypeGroups[subType].push({
              code: account.account_code,
              name: account.account_name,
              opening: opening,
              debit: debit,
              credit: credit,
              diff: periodDiff,
              balance: closingBalance,
              nature: account.nature,
            })
          })
    
          Object.entries(subcategoryTypeGroups).forEach(([subType, accounts]) => {
            const subTypeRow = worksheet.addRow(["", `Subcategory: ${subType}`])
            subTypeRow.getCell(2).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "A9A9A9" }, // Dark gray
            }
            subTypeRow.getCell(2).font = { bold: true, color: { argb: "FFFFFF" } }
            worksheet.mergeCells(`B${subTypeRow.number}:G${subTypeRow.number}`)
    
            let totalOpening = 0,
              totalDebit = 0,
              totalCredit = 0,
              totalDiff = 0,
              totalBalance = 0
    
            accounts.forEach((account) => {
              worksheet.addRow([
                account.code,
                account.name,
                account.opening.toFixed(4),
                account.debit.toFixed(4),
                account.credit.toFixed(4),
                account.diff.toFixed(4),
                account.balance.toFixed(4),
              ])
    
              totalOpening += account.opening
              totalDebit += account.debit
              totalCredit += account.credit
              totalDiff += account.diff
              totalBalance += account.balance
            })
    
            // Subcategory type total row (orange)
            const totalRow = worksheet.addRow([
              "",
              `${subType} Total`,
              totalOpening.toFixed(4),
              totalDebit.toFixed(4),
              totalCredit.toFixed(4),
              totalDiff.toFixed(4),
              totalBalance.toFixed(4),
            ])
    
            totalRow.eachCell((cell) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFA500" }, // Orange
              }
              cell.font = { bold: true }
            })
    
            // Update subcategory totals
            subCategoryDebit += totalDebit
            subCategoryCredit += totalCredit
            subCategoryOpening += totalOpening
            subCategoryDiff += totalDiff
            subCategoryBalance += totalBalance
          })
    
          // Add subcategory total row
          const subCatTotalRow = worksheet.addRow([
            "",
            `${subCategory.name} Total`,
            subCategoryOpening.toFixed(4),
            subCategoryDebit.toFixed(4),
            subCategoryCredit.toFixed(4),
            subCategoryDiff.toFixed(4),
            subCategoryBalance.toFixed(4),
          ])
    
          subCatTotalRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "4682B4" }, // Steel Blue
            }
            cell.font = { bold: true, color: { argb: "FFFFFF" } }
          })
    
          // Update category totals
          categoryDebit += subCategoryDebit
          categoryCredit += subCategoryCredit
          categoryOpening += subCategoryOpening
          categoryDiff += subCategoryDiff
          categoryBalance += subCategoryBalance
        })
    
        // Add category total row
        const catTotalRow = worksheet.addRow([
          `${category.name} Total`,
          "",
          categoryOpening.toFixed(4),
          categoryDebit.toFixed(4),
          categoryCredit.toFixed(4),
          categoryDiff.toFixed(4),
          categoryBalance.toFixed(4),
        ])
    
        catTotalRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "000080" }, // Navy
          }
          cell.font = { bold: true, color: { argb: "FFFFFF" } }
        })
    
        // Update grand totals
        grandOpening += categoryOpening
        grandDebit += categoryDebit
        grandCredit += categoryCredit
        grandDiff += categoryDiff
        grandBalance += categoryBalance
      })
    
      // Add Grand Total row at the end
      const grandTotalRow = worksheet.addRow([
        "Grand Total",
        "",
        grandOpening.toFixed(4),
        grandDebit.toFixed(4),
        grandCredit.toFixed(4),
        grandDiff.toFixed(4),
        grandBalance.toFixed(4),
      ])
    
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
          ? `Trial Balance : ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
          : `Trial Balance: Present `,
      )
    }
    
      



      const downloadExcel2 = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Trial Balance")
      
        worksheet.headerFooter.oddHeader =
          '&C&"Arial,Bold"&18TRIAL BALANCE REPORT\n' +
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
            footer: 0.3,
          },
        }
      
        // Add title section at the top of the worksheet
        const titleRow = worksheet.addRow(["TRIAL BALANCE REPORT"])
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
          `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
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
            ? `Period:  ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
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
      
        filteredBalanceSheet.forEach((category) => {
          const catRow = worksheet.addRow([category.name])
          catRow.getCell(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4472C4" },
          }
          catRow.getCell(1).font = { bold: true, color: { argb: "FFFFFF" } }
      
          category.sub?.forEach((subCategory) => {
            const subCatRow = worksheet.addRow(["", subCategory.name])
            subCatRow.getCell(2).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "D3D3D3" },
            }
            subCatRow.getCell(2).font = { bold: true }
      
            const subcategoryTypeGroups = {}
      
            // Function to recursively process all child accounts
            const processAccountRecursively = (account, subType, subcategoryTypeGroups, level = 0) => {
              const debit = Number.parseFloat(account.total_debit) || 0
              const credit = Number.parseFloat(account.total_credit) || 0
              const opening = account?.nature == 'credit' ?  -1 *  (Number.parseFloat(account.opening_balance) || 0) : (Number.parseFloat(account.opening_balance) || 0)
              const periodDiff = account.nature === "debit" ? debit - credit : -1 * (credit - debit)
              const closingBalance = opening + periodDiff
      
              const indent = level > 0 ? "--".repeat(level) + " " : ""
      
              subcategoryTypeGroups[subType].push([
                account.account_code,
                `${indent}${account.account_name}`,
                opening,
                debit,
                credit,
                periodDiff,
                closingBalance,
              ])
      
              // Recursively process child accounts
              if (account.childAccounts && account.childAccounts.length > 0) {
                account.childAccounts.forEach((child) => {
                  processAccountRecursively(child, subType, subcategoryTypeGroups, level + 1)
                })
              }
            }
      
            subCategory.accounts?.forEach((account) => {
              const subType = account.account_subcategory || "Uncategorized"
              if (!subcategoryTypeGroups[subType]) subcategoryTypeGroups[subType] = []
      
              // Process the main account and all its nested children
              processAccountRecursively(account, subType, subcategoryTypeGroups, 0)
            })
      
            Object.entries(subcategoryTypeGroups).forEach(([subType, rows]) => {
              const subTypeRow = worksheet.addRow(["", `Subcategory: ${subType}`])
              subTypeRow.getCell(2).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "A9A9A9" },
              }
              subTypeRow.getCell(2).font = { bold: true, color: { argb: "FFFFFF" } }
      
              let totalOpening = 0,
                totalDebit = 0,
                totalCredit = 0,
                totalDiff = 0,
                totalBalance = 0
      
              rows.forEach((data) => {
                const [code, name, opn, deb, cred, diff, bal] = data
                worksheet.addRow([
                  code,
                  name,
                  opn.toFixed(4),
                  deb.toFixed(4),
                  cred.toFixed(4),
                  diff.toFixed(4),
                  bal.toFixed(4),
                ])
                totalOpening += opn
                totalDebit += deb
                totalCredit += cred
                totalDiff += diff
                totalBalance += bal
              })
      
              const totalRow = worksheet.addRow([
                "",
                `${subType} Total`,
                totalOpening.toFixed(4),
                totalDebit.toFixed(4),
                totalCredit.toFixed(4),
                totalDiff.toFixed(4),
                totalBalance.toFixed(4),
              ])
      
              totalRow.eachCell((cell) => {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFA500" },
                }
                cell.font = { bold: true }
              })
      
              grandOpening += totalOpening
              grandDebit += totalDebit
              grandCredit += totalCredit
              grandDiff += totalDiff
              grandBalance += totalBalance
            })
          })
        })
      
        // Add Grand Total row at the end
        const grandTotalRow = worksheet.addRow([
          "Grand Total",
          "",
          grandOpening.toFixed(4),
          grandDebit.toFixed(4),
          grandCredit.toFixed(4),
          grandDiff.toFixed(4),
          grandBalance.toFixed(4),
        ])
      
        grandTotalRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "000000" },
          }
          cell.font = { bold: true, color: { argb: "FFFFFF" } }
        })
                 // Add empty rows for spacing before footer
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
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        saveAs(
          blob,
          toDate && fromDate
            ? `Trial Balance Detailed : ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "-"} To ${toDate ? new Date(toDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : "Present"}`
            : `Trial Balance Detailed: Present `,
        )
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
    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters([{ id: 'All', name: 'All' }, ...(data?.cost_centers || [])]);
            setSelectedCostCenter({ id: 'All', name: 'All' })

        } catch (error) {
            showErrorToast(error);
        }
    };


    useEffect(() => {
        getCostCenters()
        getBalanceSheet();
    }, []);

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
                <Grid item xs={3} mt={'30px'}>

                    <PrimaryButton
                        bgcolor={"#001f3f"}
                        icon={<SearchIcon />}
                        title="Search"
                        sx={{ marginTop: "30px" }}
                        onClick={() => getBalanceSheet(null, null, null)}

                    />

                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid item xs={3}>
                    <div class="container">
                        <div class="wrapper">
                            <InputField
                                size={"small"}
                                type="text"
                                id="text-to-search"
                                placeholder="Search"
                                register={register("search", {
                                    onChange: (e) => Search(),
                                })}
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
                    Trial Balance
                </Typography>
                {balanceSheet?.length > 0 && (
                    <Box sx={{
                        textAlign: "right", p: 4, display: "flex", gap: 2

                    }}>
                        {/* <PrimaryButton
                            title="Download PDF"
                            type="button"
                            style={{ backgroundColor: Colors.bluishCyan }}
                            onClick={() => handleExportWithComponent(contentRef)}
                        /> */}
                        <PrimaryButton
                            title={"Download Report"}
                            onClick={() => downloadExcel()}
                        />
                        <PrimaryButton
                            title={"Download Detailed Report"}
                            onClick={() => downloadExcel2()}
                        />
                    </Box>
                )}
            </Box>

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
                    <Tabs
                        value={filters}
                        onChange={(event, newValue) => handleFilter(event, newValue, false)}
                    >
                        <Tab value="all" label="All" />
                        {filterData?.map((item, index) => (
                            <Tab key={index} value={item?.id} label={item?.name} />
                        ))}
                    </Tabs>
                    <Tabs
                        value={filters}
                        onChange={(event, newValue) => handleFilter(event, newValue, true)}
                    >
                        {childTabs?.map((item, index) => (
                            <Tab key={index} value={item?.id} label={item?.name} />
                        ))}
                    </Tabs>
                </Grid>
            </Grid>

            {balanceSheet ? (
                <Fragment>
                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                        fileName="Trial Balance"
                    >
                        <Box className='pdf-show' sx={{ display: 'none' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                    Trial Balance
                                </Typography>
                                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                            </Box>
                        </Box>
                        {/* ========== Table ========== */}
                        <TableContainer
                            id="paragraph"
                            component={Paper}
                            sx={{
                                boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                                borderRadius: 2,

                            }}
                            className="table-box"
                        >
                            <Table stickyHeader sx={{ minWidth: 500 }}>
                                <TableHead>
                                    <TableRow>
                                        {tableHead.map((item, index) => (
                                            <Cell className="pdf-table" key={index}>{item}</Cell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!loader ? (
                                        filteredBalanceSheet?.length > 0 ? (
                                            <>

                                                <Fragment>

                                                    {filteredBalanceSheet.map((category) => (
                                                        <React.Fragment key={category.id}>
                                                            {/* Category Row */}
                                                            <TableRow
                                                                className="bg-primary/90 text-primary-foreground font-medium cursor-pointer hover:bg-primary/80"
                                                                onClick={() => toggleCategory(category.id)}
                                                            >
                                                                <TableCell colSpan={7}>
                                                                    {expandedCategories[category.id] ? "▼" : "▶"} {category.name}
                                                                </TableCell>
                                                            </TableRow>

                                                            {/* Sub-categories and accounts */}
                                                            {expandedCategories[category.id] &&
                                                                category.sub.map((subCategory) => {
                                                                    // Calculate subcategory totals
                                                                    let subCategoryDebit = 0
                                                                    let subCategoryCredit = 0

                                                                    subCategory?.accounts?.forEach((account) => {
                                                                        const debit = Number.parseFloat(account.total_debit) || 0
                                                                        const credit = Number.parseFloat(account.total_credit) || 0

                                                                        subCategoryDebit += debit

                                                                        subCategoryCredit += credit

                                                                        console.log(subCategoryDebit, 'debitdebitdebitdebit');

                                                                        // Process child accounts if any
                                                                        if (account.childAccounts) {
                                                                            account.childAccounts.forEach((childAccount) => {
                                                                                const childDebit = Number.parseFloat(childAccount.total_debit) || 0
                                                                                const childCredit = Number.parseFloat(childAccount.total_credit) || 0


                                                                                subCategoryDebit += childDebit

                                                                                subCategoryCredit += childCredit

                                                                            })
                                                                        }

                                                                        console.log(subCategoryDebit, 'debitdebitdebitdebit');
                                                                    })

                                                                    return (
                                                                        <React.Fragment key={subCategory.id}>
                                                                            {/* Sub-category Header Row */}
                                                                            {/* <TableRow
                                                                                className="bg-secondary text-secondary-foreground font-medium cursor-pointer hover:bg-secondary/90"
                                                                                onClick={() => toggleSubCategory(subCategory.id)}
                                                                            >
                                                                                <TableCell></TableCell>
                                                                                <TableCell>
                                                                                    {expandedCategories[`sub_${subCategory.id}`] ? "▼" : "▶"} {subCategory.name}
                                                                                </TableCell>

                                                                                <TableCell>0</TableCell>
                                                                                <TableCell className="text-right">{formatAmount(subCategoryDebit)}</TableCell>
                                                                                <TableCell className="text-right">{formatAmount(subCategoryCredit)}</TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {formatAmount(subCategoryDebit - subCategoryCredit)}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {formatAmount(subCategoryDebit - subCategoryCredit)}
                                                                                </TableCell>
                                                                            </TableRow> */}

                                                                            {/* Accounts under this subcategory */}
                                                                            {true &&
                                                                                (() => {
                                                                                    // Group accounts by subcategory type
                                                                                    const subcategoryTypeGroups = {}

                                                                                    subCategory?.accounts?.filter(filterData2).forEach((account) => {
                                                                                        console.log(account)
                                                                                        const subcategoryType = account.account_subcategory || "Uncategorized"

                                                                                        if (!subcategoryTypeGroups[subcategoryType]) {
                                                                                            subcategoryTypeGroups[subcategoryType] = {
                                                                                                accounts: [],
                                                                                                debitTotal: 0,
                                                                                                creditTotal: 0,
                                                                                                openingBalanceTotal: 0,
                                                                                                periodDiffTotal: 0
                                                                                            }
                                                                                        }

                                                                                        const debit = Number.parseFloat(account.total_debit) || 0
                                                                                        const credit = Number.parseFloat(account.total_credit) || 0
                                                                                        let netAmount = 0

                                                                                        netAmount = debit
                                                                                        let diff = account?.nature === "debit" ? debit - credit : credit - debit
                                                                                        subcategoryTypeGroups[subcategoryType].periodDiffTotal += diff
                                                                                        subcategoryTypeGroups[subcategoryType].openingBalanceTotal += parseFloat(account.opening_balance) || 0
                                                                                        subcategoryTypeGroups[subcategoryType].debitTotal += netAmount

                                                                                        netAmount = credit
                                                                                        subcategoryTypeGroups[subcategoryType].creditTotal += netAmount


                                                                                        subcategoryTypeGroups[subcategoryType].accounts.push({
                                                                                            ...account,
                                                                                            netAmount,
                                                                                        })

                                                                                        // Process child accounts if any
                                                                                        if (account.childAccounts) {
                                                                                            account.childAccounts.filter(filterData2).forEach((childAccount) => {
                                                                                                const childDebit = Number.parseFloat(childAccount.total_debit) || 0
                                                                                                const childCredit = Number.parseFloat(childAccount.total_credit) || 0
                                                                                                let childNetAmount = 0
                                                                                                let diff = account?.nature === "debit" ? debit - credit : credit - debit
                                                                                                subcategoryTypeGroups[subcategoryType].periodDiffTotal += diff
                                                                                                if (childAccount.nature === "debit") {
                                                                                                    subcategoryTypeGroups[subcategoryType].openingBalanceTotal += parseFloat(account.opening_balance) || 0
                                                                                                    childNetAmount = childDebit
                                                                                                    subcategoryTypeGroups[subcategoryType].debitTotal += childNetAmount
                                                                                                } else {
                                                                                                    subcategoryTypeGroups[subcategoryType].openingBalanceTotal += parseFloat(account.opening_balance) || 0
                                                                                                    childNetAmount = childCredit
                                                                                                    subcategoryTypeGroups[subcategoryType].creditTotal += childNetAmount
                                                                                                }

                                                                                                subcategoryTypeGroups[subcategoryType].accounts.push({
                                                                                                    ...childAccount,
                                                                                                    netAmount: childNetAmount,
                                                                                                    isChild: true,
                                                                                                })
                                                                                            })
                                                                                        }
                                                                                    })

                                                                                    // Render each subcategory type group
                                                                                    return Object.entries(subcategoryTypeGroups).map(([subcategoryType, group]) => (
                                                                                        <React.Fragment key={`${subCategory.id}-${subcategoryType}`}>
                                                                                            {/* Subcategory Type Header */}
                                                                                            <TableRow className="bg-muted/70 font-medium">

                                                                                                <TableCell className="pl-6" style={{ fontWeight: 'bold' }} colspan={7} >{subcategoryType}</TableCell>

                                                                                            </TableRow>

                                                                                            {/* Accounts in this subcategory type */}
                                                                                            {
                                                                                                group.accounts.map((account) => {
                                                                                                    let totalBalance = 0;
                                                                                                    totalBalance = +account.opening_balance;
                                                                                                    return (
                                                                                                        <React.Fragment key={account.id}>
                                                                                                            <TableRow
                                                                                                                className={
                                                                                                                    account.isChild ? "bg-muted/10 hover:bg-muted/30" : "hover:bg-muted/50"
                                                                                                                }
                                                                                                            >
                                                                                                                <TableCell>{account.account_code}</TableCell>
                                                                                                                <TableCell className={account.isChild ? "pl-10" : "pl-6"}>
                                                                                                                    {account.account_name}
                                                                                                                </TableCell>

                                                                                                                <TableCell className="text-right">{account.opening_balance ? -1 * parseFloat(account.opening_balance) || 0.0 : parseFloat(account.opening_balance) || 0.0}</TableCell>
                                                                                                                <TableCell className="text-right">
                                                                                                                    {formatAmount(account.total_debit)}
                                                                                                                </TableCell>
                                                                                                                <TableCell className="text-right">
                                                                                                                    {formatAmount(account.total_credit)}
                                                                                                                </TableCell>
                                                                                                                <TableCell className="text-right">
                                                                                                                    {parseFloat(
                                                                                                                        account.nature === "debit"
                                                                                                                            ? parseFloat(account.total_debit) - parseFloat(account.total_credit)
                                                                                                                            : -1 * (parseFloat(account.total_credit) - parseFloat(account.total_debit))
                                                                                                                    ).toFixed(4)}
                                                                                                                </TableCell>

                                                                                                                <TableCell className="text-right">
                                                                                                                    {parseFloat(
                                                                                                                        parseFloat(parseFloat(account.opening_balance) || 0.0) +
                                                                                                                        (account.nature === "debit"
                                                                                                                            ? parseFloat(account.total_debit) - parseFloat(account.total_credit)
                                                                                                                            : -1 * (parseFloat(account.total_credit) - parseFloat(account.total_debit)))
                                                                                                                    ).toFixed(4)}
                                                                                                                </TableCell>
                                                                                                            </TableRow>
                                                                                                        </React.Fragment>
                                                                                                    );
                                                                                                })
                                                                                            }


                                                                                            {/* Subcategory Type Total */}
                                                                                            <TableRow className="bg-muted/30 font-medium">

                                                                                                <TableCell className="pl-6" style={{ fontWeight: 'bold' }}>Total - {subcategoryType}</TableCell>

                                                                                                <TableCell></TableCell>
                                                                                                <TableCell>{group?.openingBalanceTotal ? formatAmount(-1 * parseFloat(group?.openingBalanceTotal)) : formatAmount(parseFloat(group?.openingBalanceTotal))}</TableCell>
                                                                                                <TableCell className="text-right">{formatAmount(group.debitTotal)}</TableCell>
                                                                                                <TableCell className="text-right">{formatAmount(group.creditTotal)}</TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                    {formatAmount(group.periodDiffTotal)}
                                                                                                </TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                    {parseFloat(parseFloat(group.periodDiffTotal) + parseFloat(group?.openingBalanceTotal)).toFixed(4)}
                                                                                                </TableCell>
                                                                                            </TableRow>
                                                                                        </React.Fragment>
                                                                                    ))
                                                                                })()}

                                                                            {/* Sub-category Total Row */}
                                                                            {/* {true && (
                                                                                <TableRow className="bg-muted font-medium">
                                                                                    <TableCell></TableCell>
                                                                                    <TableCell className="pl-6">Total - {subCategory.name}</TableCell>
                                                                                    <TableCell></TableCell>
                                                                                    <TableCell></TableCell>
                                                                                    <TableCell className="text-right">{formatAmount(subCategoryDebit)}</TableCell>
                                                                                    <TableCell className="text-right">{formatAmount(subCategoryCredit)}</TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        {formatAmount(subCategoryDebit - subCategoryCredit)}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )} */}
                                                                        </React.Fragment>
                                                                    )
                                                                })}
                                                        </React.Fragment>
                                                    ))}

                                                </Fragment>

                                            </>
                                        ) : (
                                            <Row>
                                                <Cell
                                                    colSpan={tableHead.length + 1}
                                                    align="center"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    No Data Found
                                                </Cell>
                                            </Row>
                                        )
                                    ) : (
                                        <Row>
                                            <Cell
                                                colSpan={tableHead.length + 2}
                                                align="center"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                <Box className={classes.loaderWrap}>
                                                    <CircularProgress />
                                                </Box>
                                            </Cell>
                                        </Row>
                                    )}


                                    <Fragment>
                                        {filters == 'all' && <Row sx={{ bgcolor: Colors.primary }}>



                                            <Cell colSpan={3}>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                                    Total
                                                </Typography>
                                            </Cell>
                                            <Cell>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                                    {CommaSeparator(parseFloat(allDebit).toFixed(4))}
                                                </Typography>
                                            </Cell>
                                            <Cell>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                                    {CommaSeparator(parseFloat(allCredit).toFixed(4))}
                                                </Typography>
                                            </Cell>
                                            <Cell colSpan={2} >

                                            </Cell>
                                        </Row>}
                                    </Fragment>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </PDFExport>
                </Fragment>
            ) : (
                <CircleLoading />
            )
            }
        </Box >
    );
}

export default TrialBalanceDetailed;
