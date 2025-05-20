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
import  XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from "utils";
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
                    totalDebit: totalDebit.toFixed(2),
                    totalCredit: totalCredit.toFixed(2),
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
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Trial Balance");
      
        const headers = [
          "Account Code",
          "Account Name",
          "Opening Balance",
          "Total Debit",
          "Total Credit",
          "Period Difference",
          "Balance",
        ];
      
        worksheet.addRow(headers).eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '808080' }, // Gray
          };
          cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // White bold
        });
      
        // Grand totals initialization
        let grandOpening = 0,
            grandDebit = 0,
            grandCredit = 0,
            grandDiff = 0,
            grandBalance = 0;
      
        filteredBalanceSheet.forEach(category => {
          const catRow = worksheet.addRow([category.name]);
          catRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' }, // Blue
          };
          catRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      
          category.sub?.forEach(subCategory => {
            const subCatRow = worksheet.addRow(["", subCategory.name]);
            subCatRow.getCell(2).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D3D3D3' }, // Light gray
            };
            subCatRow.getCell(2).font = { bold: true };
      
            const subcategoryTypeGroups = {};
      
            subCategory.accounts?.forEach(account => {
              const subType = account.account_subcategory || "Uncategorized";
              if (!subcategoryTypeGroups[subType]) subcategoryTypeGroups[subType] = [];
      
              const debit = parseFloat(account.total_debit) || 0;
              const credit = parseFloat(account.total_credit) || 0;
              const opening = parseFloat(account.opening_balance) || 0;
              const periodDiff = account.nature === "debit" ? debit - credit : credit - debit;
              const closingBalance = opening + periodDiff;
      
              subcategoryTypeGroups[subType].push([
                account.account_code,
                account.account_name,
                opening,
                debit,
                credit,
                periodDiff,
                closingBalance,
              ]);
            });
      
            Object.entries(subcategoryTypeGroups).forEach(([subType, rows]) => {
              const subTypeRow = worksheet.addRow(["", `Subcategory: ${subType}`]);
              subTypeRow.getCell(2).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'A9A9A9' }, // Dark gray
              };
              subTypeRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFF' } };
      
              let totalOpening = 0, totalDebit = 0, totalCredit = 0, totalDiff = 0, totalBalance = 0;
      
              rows.forEach(data => {
                const [code, name, opn, deb, cred, diff, bal] = data;
                worksheet.addRow([
                  code,
                  name,
                  opn.toFixed(2),
                  deb.toFixed(2),
                  cred.toFixed(2),
                  diff.toFixed(2),
                  bal.toFixed(2),
                ]);
                totalOpening += opn;
                totalDebit += deb;
                totalCredit += cred;
                totalDiff += diff;
                totalBalance += bal;
              });
      
              // Subcategory total row (orange)
              const totalRow = worksheet.addRow([
                "",
                `${subType} Total`,
                totalOpening.toFixed(2),
                totalDebit.toFixed(2),
                totalCredit.toFixed(2),
                totalDiff.toFixed(2),
                totalBalance.toFixed(2),
              ]);
      
              totalRow.eachCell(cell => {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFA500' }, // Orange
                };
                cell.font = { bold: true };
              });
      
              // Update grand totals
              grandOpening += totalOpening;
              grandDebit += totalDebit;
              grandCredit += totalCredit;
              grandDiff += totalDiff;
              grandBalance += totalBalance;
            });
          });
        });
      
        // Add Grand Total row at the end
        const grandTotalRow = worksheet.addRow([
          "Grand Total",
          "",
          '',
          parseFloat(allDebit).toFixed(2),
          parseFloat(allCredit).toFixed(2),
          '',
          '',
        ]);
      
        grandTotalRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '000000' }, // Black
          };
          cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // White bold
        });
      
        // Set column widths
        worksheet.columns = [
          { width: 15 },
          { width: 30 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
        ];
      
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "TrialBalance.xlsx");
      };
      
      
      const downloadExcel2 = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Trial Balance");
      
        const headers = [
          "Account Code",
          "Account Name",
          "Opening Balance",
          "Total Debit",
          "Total Credit",
          "Period Difference",
          "Balance",
        ];
      
        worksheet.addRow(headers).eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '808080' },
          };
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        });
      
        let grandOpening = 0, grandDebit = 0, grandCredit = 0, grandDiff = 0, grandBalance = 0;
      
        filteredBalanceSheet.forEach(category => {
          const catRow = worksheet.addRow([category.name]);
          catRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' },
          };
          catRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      
          category.sub?.forEach(subCategory => {
            let totalOpening = 0, totalDebit = 0, totalCredit = 0, totalDiff = 0, totalBalance = 0;
      
            subCategory.accounts?.forEach(account => {
              const debit = parseFloat(account.total_debit) || 0;
              const credit = parseFloat(account.total_credit) || 0;
              const opening = parseFloat(account.opening_balance) || 0;
              const periodDiff = account.nature === "debit" ? debit - credit : credit - debit;
              const closingBalance = opening + periodDiff;
      
              totalOpening += opening;
              totalDebit += debit;
              totalCredit += credit;
              totalDiff += periodDiff;
              totalBalance += closingBalance;
            });
      
            // Show only subcategory (parent account) with total of its children
            const summaryRow = worksheet.addRow([
              "", // No account code for subCategory
              subCategory.name,
              totalOpening.toFixed(2),
              totalDebit.toFixed(2),
              totalCredit.toFixed(2),
              totalDiff.toFixed(2),
              totalBalance.toFixed(2),
            ]);
            summaryRow.getCell(2).font = { bold: true };
      
            // Update grand totals
            grandOpening += totalOpening;
            grandDebit += totalDebit;
            grandCredit += totalCredit;
            grandDiff += totalDiff;
            grandBalance += totalBalance;
          });
        });
      
        const grandTotalRow = worksheet.addRow([
          "Grand Total",
          "",
          grandOpening.toFixed(2),
          grandDebit.toFixed(2),
          grandCredit.toFixed(2),
          grandDiff.toFixed(2),
          grandBalance.toFixed(2),
        ]);
      
        grandTotalRow.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '000000' },
          };
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        });
      
        worksheet.columns = [
          { width: 15 },
          { width: 30 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
        ];
      
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "TrialBalance.xlsx");
      };
      
    

    






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
                limit: 1000,
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
                            title={"Export To Excel"}
                            onClick={() => downloadExcel()}
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

                                                                                                                <TableCell className="text-right">{parseFloat(account.opening_balance) || 0.0}</TableCell>
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
                                                                                                                            : parseFloat(account.total_credit) - parseFloat(account.total_debit)
                                                                                                                    ).toFixed(2)}
                                                                                                                </TableCell>

                                                                                                                <TableCell className="text-right">
                                                                                                                    {parseFloat(
                                                                                                                        parseFloat(parseFloat(account.opening_balance) || 0.0) +
                                                                                                                        (account.nature === "debit"
                                                                                                                            ? parseFloat(account.total_debit) - parseFloat(account.total_credit)
                                                                                                                            : parseFloat(account.total_credit) - parseFloat(account.total_debit))
                                                                                                                    ).toFixed(2)}
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
                                                                                                <TableCell>{formatAmount(group?.openingBalanceTotal)}</TableCell>
                                                                                                <TableCell className="text-right">{formatAmount(group.debitTotal)}</TableCell>
                                                                                                <TableCell className="text-right">{formatAmount(group.creditTotal)}</TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                    {formatAmount(group.periodDiffTotal)}
                                                                                                </TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                    {parseFloat(parseFloat(group.periodDiffTotal)+parseFloat(group?.openingBalanceTotal)).toFixed(2)}
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
                                                    {CommaSeparator(parseFloat(allDebit).toFixed(2))}
                                                </Typography>
                                            </Cell>
                                            <Cell>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                                    {CommaSeparator(parseFloat(allCredit).toFixed(2))}
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
