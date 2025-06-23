import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Grid, Tabs, Tab } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import FinanceServices from 'services/Finance';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { PrimaryButton } from 'components/Buttons';
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { agencyType, handleExportWithComponent } from 'utils';
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
import SelectField from 'components/Select';
import CustomerServices from 'services/Customer';
import { showErrorToast } from 'components/NewToaster';
import ExcelJS from "exceljs";

// *For Table Style
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
    },
    anchorLink: {
        textDecoration: 'underline',
        color: Colors.twitter,
        cursor: 'pointer'
    }
})

function ChartOfAccount() {

    const classes = useStyles();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const [childFilter, setChildFilter] = useState('');

    const { register } = useForm();

    const tableHead = ['Code', 'Name', 'Major Category', 'Sub Category', 'Balance (AED)', 'Actions']

    const [loader, setLoader] = useState(false);

    // *For Chart of Account
    const [chartOfAccount, setChartOfAccount] = useState();
    const [filteredCOA, setFilteredCOA] = useState();

    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState('all');
    const [filterData, setFilterData] = useState();

    const [childTabs, setChildTabs] = useState([])

    // *For Collapse
    const [expand, setExpand] = useState([]);

    // *For Get Chart Account
    const getChartOfAccount = async (filter) => {
        try {
            let params = {
                cost_center: selectedCostCenter?.name
            }
            const { data } = await FinanceServices.getChartOfAccount(params)
            console.log(data);
            setChartOfAccount(data?.COA)
            setFilteredCOA(data?.COA)

            const fil = []
            data?.COA?.forEach(e => {
                let obj = {
                    id: e.id,
                    name: e.name,
                    sub_accounts: e.sub
                }
                fil.push(obj)
            })
            setFilterData(fil)
        } catch (error) {

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

    // *For Handle Filter
    const handleFilter = (event, newValue, child) => {

        if (child) {


            const arrayOfArrays = chartOfAccount?.map(item => item?.sub?.filter(subItem => subItem?.id == newValue))
            const nonEmptyArrays = arrayOfArrays.filter(arr => arr.length > 0);

            // Log the result to the console

            setFilteredCOA(nonEmptyArrays.flat())

            setFilters(newValue);
        }
        else {
            setFilters(newValue);
            if (newValue === 'all') {

                setChildTabs(chartOfAccount.find(item => item?.id == newValue)?.sub)
                setFilteredCOA(chartOfAccount)
            } else {

                setChildTabs(chartOfAccount.find(item => item?.id == newValue)?.sub)
                const filterData = chartOfAccount.filter(e => e.id === newValue)

                setFilteredCOA(filterData)
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
            ErrorToaster(error)
        }
    }

    // *For Filter Chart of Account By Search
    const filterBySearch = (search) => {
        const result = [];

        for (const item of chartOfAccount) {
            if (item?.sub.length > 0) {
                for (const sub of item?.sub) {
                    if (sub?.accounts?.length > 0) {
                        for (const acc of sub?.accounts) {
                            if (acc.account_name?.toLowerCase().includes(search?.toLowerCase())) {
                                result.push(item);
                            } else {
                                if (acc?.childAccounts?.length > 0) {
                                    for (const subAcc of acc?.childAccounts) {
                                        if (subAcc.account_name?.toLowerCase().includes(search?.toLowerCase())) {
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

        setFilteredCOA(result)
    }



const downloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Chart of Accounts");
    
    // Set professional header and footer
    worksheet.headerFooter.oddHeader =
        '&C&"Arial,Bold"&18CHART OF ACCOUNTS\n' +
        '&C&"Arial,Regular"&12Your Company Name\n' +
        '&C&"Arial,Regular"&10Period: &D - &T\n' +
        '&L&"Arial,Regular"&8Generated on: ' +
        new Date().toLocaleDateString() +
        "\n" +
        '&R&"Arial,Regular"&8Page &P of &N';

    worksheet.headerFooter.oddFooter =
        '&L&"Arial,Regular"&8Confidential - Internal Use Only' +
        '&C&"Arial,Regular"&8This report contains financial data as of ' +
        new Date().toLocaleDateString() +
        '&R&"Arial,Regular"&8Generated by: Finance Department\n' +
        '&C&"Arial,Regular"&8Powered by Premium Business Solutions';

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
    };

    // Add title section at the top of the worksheet
    const titleRow = worksheet.addRow(["CHART OF ACCOUNTS"]);
    titleRow.getCell(1).font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "2F4F4F" },
    };
    titleRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A1:F1");
    
    let name = agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "PREMIUM BUSINESSMEN SERVICES" : 'PREMIUM PROFESSIONAL GOVERNMENT SERVICES LLC';
    const companyRow = worksheet.addRow([name]);
    companyRow.getCell(1).font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: { argb: "4472C4" },
    };
    companyRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A2:F2");

    const dateRow = worksheet.addRow([
        `Report Generated: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} at ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}`,
    ]);
    dateRow.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    dateRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A3:F3");

    const costCenter = worksheet.addRow([
        `Cost Center: ${selectedCostCenter?.name}`,
    ]);
    costCenter.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    costCenter.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A4:F4");

    const system = worksheet.addRow([
        `System: ${agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? 'TASHEEL' : 'Al-ADHEED'}`,
    ]);
    system.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "666666" },
    };
    system.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A5:F5");

    // Add empty row for spacing
    worksheet.addRow([]);

    // Define headers and data separately (exact same logic)
    const headers = tableHead.filter((item) => item !== "Actions");

    // Add headers with professional styling
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "2F4F4F" }, // Dark slate gray
        };
        cell.font = {
            name: "Arial",
            bold: true,
            color: { argb: "FFFFFF" },
            size: 11,
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin", color: { argb: "000000" } },
            left: { style: "thin", color: { argb: "000000" } },
            bottom: { style: "thin", color: { argb: "000000" } },
            right: { style: "thin", color: { argb: "000000" } },
        };
    });

    // Extract values from objects and create an array for each row (exact same logic)
    chartOfAccount?.forEach((item, index) => {
        // Main category row
        const categoryRow = worksheet.addRow([
            item.name,
            "",
            "",
            "",
            "",
            "",
        ]);
        categoryRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' }, // Professional blue
        };
        categoryRow.getCell(1).font = {
            name: "Arial",
            bold: true,
            color: { argb: "FFFFFF" },
            size: 12,
        };
        categoryRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

        item?.sub?.forEach((subItem, i) => {
            // Subcategory row
            const subCategoryRow = worksheet.addRow([
                subItem?.name,
                "",
                "",
                "",
                "",
                "",
            ]);
            subCategoryRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E6E6FA' }, // Lavender
            };
            subCategoryRow.getCell(1).font = {
                name: "Arial",
                bold: true,
                size: 11,
                color: { argb: "2F4F4F" },
            };
            subCategoryRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

            subItem?.accounts?.forEach((account, j) => {
                let Balance = 0;
                let Total = 0;
                if (account?.childAccounts?.length > 0) {
                    const initialValue = { "credit": 0, "debit": 0 };

                    const result = account?.childAccounts?.reduce((accumulator, transaction) => {
                        const credit = isNaN(transaction?.total_credit) ? 0 : transaction?.total_credit;
                        const debit = isNaN(transaction?.total_debit) ? 0 : transaction?.total_debit;
                        return {
                            "credit": parseFloat(accumulator.credit) + parseFloat(credit),
                            "debit": parseFloat(accumulator.debit) + parseFloat(debit),
                        };
                    }, initialValue);
                    Balance = account?.nature === 'debit'
                        ? parseFloat(result?.debit) - parseFloat(result?.credit)
                        : parseFloat(result?.credit) - parseFloat(result?.debit);

                }
                else {
                    Total = account?.nature === 'debit'
                        ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit)
                        : parseFloat(account?.total_credit) - parseFloat(account?.total_debit);
                }

                // Account row - FIXED: Use numbers instead of strings
                const accountRow = worksheet.addRow([
                    account?.account_code ?? '-',
                    account?.account_name ?? '-',
                    account?.account_category ?? '-',
                    account?.account_subcategory ?? '-',
                    account?.childAccounts ? Balance : Total // Use number directly, not .toFixed(2)
                ]);

                // Style account rows
                accountRow.eachCell((cell, colNumber) => {
                    cell.font = { name: "Arial", size: 10 };
                    cell.alignment = {
                        horizontal: colNumber > 4 ? "right" : "left", // Balance column is right-aligned
                        vertical: "middle",
                    };
                    cell.border = {
                        top: { style: "hair", color: { argb: "CCCCCC" } },
                        left: { style: "hair", color: { argb: "CCCCCC" } },
                        bottom: { style: "hair", color: { argb: "CCCCCC" } },
                        right: { style: "hair", color: { argb: "CCCCCC" } },
                    };

                    // Format balance column as number
                    if (colNumber === 5 && typeof cell.value === 'number') {
                        cell.numFmt = "#,##0.00";
                    }
                });

                account?.childAccounts?.forEach((child, j) => {
                    let ChildBalance = 0;
                    ChildBalance = child?.nature === 'debit'
                        ? parseFloat(child?.total_debit) - parseFloat(child?.total_credit)
                        : parseFloat(child?.total_credit) - parseFloat(child?.total_debit);
                    
                    // Child account row - FIXED: Use numbers instead of strings
                    const childRow = worksheet.addRow([
                        child?.account_code ?? '-',
                        child?.account_name ?? '-',
                        child?.account_category ?? '-',
                        child?.account_subcategory ?? '-',
                        ChildBalance // Use number directly, not .toFixed(2)
                    ]);

                    // Style child rows
                    childRow.eachCell((cell, colNumber) => {
                        cell.font = { name: "Arial", size: 9, italic: true };
                        cell.alignment = {
                            horizontal: colNumber > 4 ? "right" : "left", // Balance column is right-aligned
                            vertical: "middle",
                        };
                        cell.border = {
                            top: { style: "hair", color: { argb: "CCCCCC" } },
                            left: { style: "hair", color: { argb: "CCCCCC" } },
                            bottom: { style: "hair", color: { argb: "CCCCCC" } },
                            right: { style: "hair", color: { argb: "CCCCCC" } },
                        };

                        // Format balance column as number
                        if (colNumber === 5 && typeof cell.value === 'number') {
                            cell.numFmt = "#,##0.00";
                        }
                    });
                });
            });
        });

        item?.accounts?.forEach((account, j) => {
            let Balance = 0;
            let Total = 0;
            if (account?.childAccounts?.length > 0) {
                const initialValue = { "credit": 0, "debit": 0 };

                const result = account?.childAccounts?.reduce((accumulator, transaction) => {
                    const credit = isNaN(transaction?.total_credit) ? 0 : transaction?.total_credit;
                    const debit = isNaN(transaction?.total_debit) ? 0 : transaction?.total_debit;
                    return {
                        "credit": parseFloat(accumulator.credit) + parseFloat(credit),
                        "debit": parseFloat(accumulator.debit) + parseFloat(debit),
                    };
                }, initialValue);
                Balance = account?.nature === 'debit'
                    ? parseFloat(result?.debit) - parseFloat(result?.credit)
                    : parseFloat(result?.credit) - parseFloat(result?.debit);

            }
            else {
                Total = account?.nature === 'debit'
                    ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit)
                    : parseFloat(account?.total_credit) - parseFloat(account?.total_debit);
            }

            // Direct account row (without subcategory) - FIXED: Use numbers instead of strings
            const directAccountRow = worksheet.addRow([
                account?.account_code ?? '-',
                account?.account_name ?? '-',
                account?.account_category ?? '-',
                account?.account_subcategory ?? '-',
                account?.childAccounts ? Balance : Total // Use number directly, not .toFixed(2)
            ]);

            // Style direct account rows
            directAccountRow.eachCell((cell, colNumber) => {
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = {
                    horizontal: colNumber > 4 ? "right" : "left", // Balance column is right-aligned
                    vertical: "middle",
                };
                cell.border = {
                    top: { style: "hair", color: { argb: "CCCCCC" } },
                    left: { style: "hair", color: { argb: "CCCCCC" } },
                    bottom: { style: "hair", color: { argb: "CCCCCC" } },
                    right: { style: "hair", color: { argb: "CCCCCC" } },
                };

                // Format balance column as number
                if (colNumber === 5 && typeof cell.value === 'number') {
                    cell.numFmt = "#,##0.00";
                }
            });

            account?.childAccounts?.forEach((child, j) => {
                let ChildBalance = 0;
                ChildBalance = child?.nature === 'debit'
                    ? parseFloat(child?.total_debit) - parseFloat(child?.total_credit)
                    : parseFloat(child?.total_credit) - parseFloat(child?.total_debit);
                
                // Direct child account row - FIXED: Use numbers instead of strings
                const directChildRow = worksheet.addRow([
                    child?.account_code ?? '-',
                    child?.account_name ?? '-',
                    child?.account_category ?? '-',
                    child?.account_subcategory ?? '-',
                    ChildBalance // Use number directly, not .toFixed(2)
                ]);

                // Style direct child rows
                directChildRow.eachCell((cell, colNumber) => {
                    cell.font = { name: "Arial", size: 9, italic: true };
                    cell.alignment = {
                        horizontal: colNumber > 4 ? "right" : "left", // Balance column is right-aligned
                        vertical: "middle",
                    };
                    cell.border = {
                        top: { style: "hair", color: { argb: "CCCCCC" } },
                        left: { style: "hair", color: { argb: "CCCCCC" } },
                        bottom: { style: "hair", color: { argb: "CCCCCC" } },
                        right: { style: "hair", color: { argb: "CCCCCC" } },
                    };

                    // Format balance column as number
                    if (colNumber === 5 && typeof cell.value === 'number') {
                        cell.numFmt = "#,##0.00";
                    }
                });
            });
        });
    });

    worksheet.addRow([]);
    worksheet.addRow([]);

    // Add the electronic generated report text with black border as requested
    const reportRow = worksheet.addRow(["This is electronically generated report"]);
    reportRow.getCell(1).font = {
      name: "Arial",
      size: 12,
      bold: false,
      color: { argb: "000000" },
    };
    reportRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    reportRow.getCell(1).border = {
      top: { style: "medium", color: { argb: "000000" } },
      left: { style: "medium", color: { argb: "000000" } },
      bottom: { style: "medium", color: { argb: "000000" } },
      right: { style: "medium", color: { argb: "000000" } },
    };
    worksheet.mergeCells(`A${reportRow.number}:F${reportRow.number}`);

    const system2 = worksheet.addRow([`Powered By: MangotechDevs.ae`]);
    system2.getCell(1).font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "666666" },
    };
    system2.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells(`A${system2.number}:F${system2.number}`);

    // Set column widths
    worksheet.columns = [
        { width: 15 },
        { width: 35 },
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 18 },
    ];

    // Add workbook properties
    workbook.creator = "Finance Department";
    workbook.lastModifiedBy = "Finance System";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Set workbook properties
    workbook.properties = {
        title: "Chart of Accounts",
        subject: "Financial Report",
        keywords: "chart of accounts, financial, accounting",
        category: "Financial Reports",
        description: "Comprehensive chart of accounts generated from accounting system",
        company: "Your Company Name",
    };
    
    // Add empty row for spacing
    worksheet.addRow([]);
    const download = async () => {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "Chart_Of_Accounts.xlsx");
    };
    download();
};

    const tabStyle = (selected) => ({
        backgroundColor: selected ? '#0076BF' : 'inherit',
        color: selected ? '#fff !important' : 'inherit',
    });


    useEffect(() => {
        getChartOfAccount()
        getCostCenters()
    }, []);

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
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: 'Public Sans' }}>
                    Chart of Accounts
                </Typography>

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
                        register={register("costcenter", { required: "costcenter is required" })}

                    />
                </Grid>
                <Grid item xs={3} mt={'30px'}>

                    <PrimaryButton
                        bgcolor={"#001f3f"}
                        icon={<SearchIcon />}
                        title="Search"
                        sx={{ marginTop: "30px" }}
                        onClick={() => getChartOfAccount(null, null, null)}

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
                <Grid item xs={8} sm={8}>
                    <Tabs value={filters} onChange={(event, newValue) => handleFilter(event, newValue, false)}>
                        <Tab value="all" label="All" sx={tabStyle(filters === 'all')} />
                        {filterData?.map((item, index) => (
                            <Tab
                                key={index}
                                value={item?.id}
                                label={item?.name}
                                sx={tabStyle(filters === item?.id)}
                            />
                        ))}
                    </Tabs>
                    <Tabs value={childFilter} onChange={(event, newValue) => handleFilter(event, newValue, true)}>
                        {childTabs?.map((item, index) => (
                            <Tab
                                key={index}
                                value={item?.id}
                                label={item?.name}
                                sx={tabStyle(childFilter === item?.id)}
                            />
                        ))}
                    </Tabs>


                </Grid>
                <Grid item xs={4} sm={4}>
                    {chartOfAccount?.length > 0 && (
                        <Box sx={{
                            display: "flex", gap: 2, justifyContent: 'flex-end'

                        }}>

                            <PrimaryButton
                                title={"Export To Excel"}
                                onClick={() => downloadExcel()}
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>

            {chartOfAccount ? (
                <Fragment>
                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}  >
                        <Box className='pdf-show' sx={{ display: 'none' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: 'Public Sans', mb: 2 }}>
                                    Chart Of Account
                                </Typography>
                                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                            </Box>
                        </Box>
                        {/* ========== Table ========== */}
                        <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 250px)' }} className='table-box'>
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
                                        filteredCOA?.length > 0 ? (
                                            <>
                                                <Fragment>
                                                    {filteredCOA?.map((item, index) => (
                                                        <Fragment key={index}>
                                                            <Row>
                                                                <Cell colSpan={tableHead?.length}>
                                                                    <Typography className="pdf-table" variant="subtitle1" sx={{ textAlign: 'left' }}>
                                                                        {expand.indexOf(item.id) === -1 ? (
                                                                            <ExpandMore className="pdf-hide" sx={{ verticalAlign: 'sub', cursor: 'pointer', opacity: item?.sub?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(item.id)} />
                                                                        ) : (
                                                                            <ExpandLess className="pdf-hide" sx={{ verticalAlign: 'sub', cursor: 'pointer', transform: 'rotate(90deg)', opacity: item?.sub?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(item.id)} />
                                                                        )}
                                                                        {item?.name}
                                                                    </Typography>
                                                                </Cell>
                                                            </Row>
                                                            {expand.indexOf(item.id) === -1 &&
                                                                <Fragment>
                                                                    {item?.sub?.map((subItem, i) => (
                                                                        <Fragment key={i}>
                                                                            <Row>
                                                                                <Cell colSpan={tableHead?.length}>
                                                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, textAlign: 'left', ml: 1.5 }}>
                                                                                        {expand.indexOf(subItem.id) === -1 ? (
                                                                                            <ExpandMore className="pdf-hide" sx={{ verticalAlign: 'sub', cursor: 'pointer', opacity: subItem?.accounts?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(subItem.id)} />
                                                                                        ) : (
                                                                                            <ExpandLess className="pdf-hide" sx={{ verticalAlign: 'sub', cursor: 'pointer', transform: 'rotate(90deg)', opacity: subItem?.accounts?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(subItem.id)} />
                                                                                        )}
                                                                                        {subItem?.name}
                                                                                    </Typography>
                                                                                </Cell>
                                                                            </Row>
                                                                            {expand.indexOf(subItem.id) === -1 &&
                                                                                <Fragment>
                                                                                    {subItem?.accounts?.map((account, j) => {
                                                                                        let Balance = 0
                                                                                        let Total = 0
                                                                                        if (account?.childAccounts?.length > 0) {
                                                                                            const initialValue = { "credit": 0, "debit": 0 };

                                                                                            const result = account?.childAccounts?.reduce((accumulator, transaction) => {
                                                                                                const credit = isNaN(transaction?.total_credit) ? 0 : transaction?.total_credit
                                                                                                const debit = isNaN(transaction?.total_debit) ? 0 : transaction?.total_debit
                                                                                                return {
                                                                                                    "credit": parseFloat(accumulator.credit) + parseFloat(credit),
                                                                                                    "debit": parseFloat(accumulator.debit) + parseFloat(debit),
                                                                                                };
                                                                                            }, initialValue);
                                                                                            Balance = account?.nature === 'debit' ? parseFloat(result?.debit) - parseFloat(result?.credit) : parseFloat(result?.credit) - parseFloat(result?.debit)

                                                                                        }
                                                                                        else {



                                                                                            Total = account?.nature === 'debit' ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit) : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)

                                                                                        }
                                                                                        return (
                                                                                            <Fragment key={j}>
                                                                                                <Row>
                                                                                                    <Cell className={account?.childAccounts ? classes.anchorLink : ''} onClick={() => handleExpand(account?.id)}>
                                                                                                        <Typography className="pdf-table" variant="body1" sx={{ ml: 3 }}>
                                                                                                            {account?.account_code ?? '-'}
                                                                                                        </Typography>
                                                                                                    </Cell>
                                                                                                    <Cell className={account?.childAccounts ? classes.anchorLink + " " + "pdf-table" : 'pdf-table'} onClick={() => handleExpand(account?.id)}>
                                                                                                        {account?.account_name ?? '-'}
                                                                                                    </Cell>

                                                                                                    <Cell className="pdf-table">
                                                                                                        {account?.account_category ?? '-'}
                                                                                                    </Cell>
                                                                                                    <Cell className="pdf-table">
                                                                                                        {account?.account_subcategory ?? '-'}
                                                                                                    </Cell>
                                                                                                    <Cell className="pdf-table">
                                                                                                        {account?.childAccounts ? Balance.toFixed(2) : Total.toFixed(2)}
                                                                                                    </Cell>
                                                                                                    <Cell>
                                                                                                        {!account?.childAccounts &&
                                                                                                            <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                                                                                                <Box onClick={() => {
  const url = `/account-ledger/${account?.id}`;
  const state = {
    accountName: account?.account_name,
    nature: account?.nature,
    cost_center: selectedCostCenter,
  };
  const encodedState = encodeURIComponent(JSON.stringify(state));
  window.open(`${url}?state=${encodedState}`, '_blank');
}}
>
                                                                                                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                                                                                                        <Box component={'img'} src={Images.ledgerIcon} sx={{ height: '16px', objectFit: 'contain' }} />
                                                                                                                    </IconButton>
                                                                                                                    <Typography variant="body2">
                                                                                                                        View
                                                                                                                    </Typography>
                                                                                                                </Box>
                                                                                                            </Box>
                                                                                                        }
                                                                                                    </Cell>
                                                                                                </Row>
                                                                                                {expand.indexOf(account.id) !== -1 &&
                                                                                                    <Fragment>
                                                                                                        {account?.childAccounts?.map((child, j) => {
                                                                                                            let ChildBalance = 0

                                                                                                            ChildBalance = child?.nature === 'debit' ? parseFloat(child?.total_debit) - parseFloat(child?.total_credit) : parseFloat(child?.total_credit) - parseFloat(child?.total_debit)
                                                                                                            return (
                                                                                                                <Fragment key={j}>
                                                                                                                    <Row sx={{ bgcolor: '#EEFBEE' }}>
                                                                                                                        <Cell>
                                                                                                                            <Typography className="pdf-table" variant="body1" sx={{ ml: 4.5 }}>
                                                                                                                                {child?.account_code ?? '-'}
                                                                                                                            </Typography>
                                                                                                                        </Cell>
                                                                                                                        <Cell className="pdf-table">
                                                                                                                            {child?.account_name ?? '-'}
                                                                                                                        </Cell>

                                                                                                                        <Cell className="pdf-table">
                                                                                                                            {child?.account_category ?? '-'}
                                                                                                                        </Cell>
                                                                                                                        <Cell className="pdf-table">
                                                                                                                            {child?.account_subcategory ?? '-'}
                                                                                                                        </Cell>
                                                                                                                        <Cell className="pdf-table">
                                                                                                                            {ChildBalance.toFixed(2)}
                                                                                                                        </Cell>
                                                                                                                        <Cell>
                                                                                                                            <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                                                                                                                <Box onClick={() => {
  const url = `/account-ledger/${account?.id}`;
  const state = {
    accountName: account?.account_name,
    nature: account?.nature,
    cost_center: selectedCostCenter,
  };
  const encodedState = encodeURIComponent(JSON.stringify(state));
  window.open(`${url}?state=${encodedState}`, '_blank');
}}
>
                                                                                                                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                                                                                                                        <Box component={'img'} src={Images.ledgerIcon} sx={{ height: '16px', objectFit: 'contain' }} />
                                                                                                                                    </IconButton>
                                                                                                                                    <Typography variant="body2">
                                                                                                                                        View
                                                                                                                                    </Typography>
                                                                                                                                </Box>
                                                                                                                            </Box>
                                                                                                                        </Cell>
                                                                                                                    </Row>
                                                                                                                </Fragment>
                                                                                                            )
                                                                                                        })}
                                                                                                    </Fragment>
                                                                                                }
                                                                                            </Fragment>
                                                                                        )
                                                                                    })}
                                                                                </Fragment>
                                                                            }
                                                                        </Fragment>
                                                                    ))}
                                                                </Fragment>
                                                            }
                                                        </Fragment>
                                                    ))}
                                                </Fragment>
                                                <Fragment>

                                                    {filteredCOA?.map((item, index) => (

                                                        <Fragment key={index}>


                                                            {true &&
                                                                <Fragment>
                                                                    {item?.accounts?.map((account, j) => {
                                                                        let Balance = 0
                                                                        let Total = 0
                                                                        if (account?.childAccounts?.length > 0) {
                                                                            const initialValue = { "credit": 0, "debit": 0 };

                                                                            const result = account?.childAccounts?.reduce((accumulator, transaction) => {
                                                                                const credit = isNaN(transaction?.total_credit) ? 0 : transaction?.total_credit
                                                                                const debit = isNaN(transaction?.total_debit) ? 0 : transaction?.total_debit
                                                                                return {
                                                                                    "credit": parseFloat(accumulator.credit) + parseFloat(credit),
                                                                                    "debit": parseFloat(accumulator.debit) + parseFloat(debit),
                                                                                };
                                                                            }, initialValue);
                                                                            Balance = account?.nature === 'debit' ? parseFloat(result?.debit) - parseFloat(result?.credit) : parseFloat(result?.credit) - parseFloat(result?.debit)

                                                                        }
                                                                        else {

                                                                            Total = account?.nature === 'debit' ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit) : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)
                                                                        }
                                                                        return (
                                                                            <Fragment key={j}>
                                                                                <Row>
                                                                                    <Cell className={account?.childAccounts ? classes.anchorLink : ''} onClick={() => handleExpand(account?.id)}>
                                                                                        <Typography className="pdf-table" variant="body1" sx={{ ml: 3 }}>
                                                                                            {account?.account_code ?? '-'}
                                                                                        </Typography>
                                                                                    </Cell>
                                                                                    <Cell className={account?.childAccounts ? classes.anchorLink + " " + 'pdf-table' : 'pdf-table'} onClick={() => handleExpand(account?.id)}>
                                                                                        {account?.account_name ?? '-'}
                                                                                    </Cell>

                                                                                    <Cell className="pdf-table">
                                                                                        {account?.account_category ?? '-'}
                                                                                    </Cell>
                                                                                    <Cell className="pdf-table">
                                                                                        {account?.account_subcategory ?? '-'}
                                                                                    </Cell>
                                                                                    <Cell className="pdf-table">
                                                                                        {account?.childAccounts ? Balance.toFixed(2) : Total.toFixed(2)}
                                                                                    </Cell>
                                                                                    <Cell>
                                                                                        {!account?.childAccounts &&
                                                                                            <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                                                                                <Box onClick={() => {
  const url = `/account-ledger/${account?.id}`;
  const state = {
    accountName: account?.account_name,
    nature: account?.nature,
    cost_center: selectedCostCenter,
  };
  const encodedState = encodeURIComponent(JSON.stringify(state));
  window.open(`${url}?state=${encodedState}`, '_blank');
}}
>
                                                                                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                                                                                        <Box component={'img'} src={Images.ledgerIcon} sx={{ height: '16px', objectFit: 'contain' }} />
                                                                                                    </IconButton>
                                                                                                    <Typography variant="body2">
                                                                                                        View
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            </Box>
                                                                                        }
                                                                                    </Cell>
                                                                                </Row>
                                                                                {expand.indexOf(account.id) !== -1 &&
                                                                                    <Fragment>
                                                                                        {account?.childAccounts?.map((child, j) => {
                                                                                            let ChildBalance = 0
                                                                                            ChildBalance = child?.nature === 'debit' ? parseFloat(child?.total_debit) - parseFloat(child?.total_credit) : parseFloat(child?.total_credit) - parseFloat(child?.total_debit)

                                                                                            return (
                                                                                                <Fragment key={j}>
                                                                                                    <Row sx={{ bgcolor: '#EEFBEE' }}>
                                                                                                        <Cell>
                                                                                                            <Typography className="pdf-table" variant="body1" sx={{ ml: 4.5 }}>
                                                                                                                {child?.account_code ?? '-'}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                        <Cell className="pdf-table">
                                                                                                            {child?.account_name ?? '-'}
                                                                                                        </Cell>

                                                                                                        <Cell className="pdf-table">
                                                                                                            {child?.account_category ?? '-'}
                                                                                                        </Cell>
                                                                                                        <Cell className="pdf-table">
                                                                                                            {child?.account_subcategory ?? '-'}
                                                                                                        </Cell>
                                                                                                        <Cell className="pdf-table">
                                                                                                            {ChildBalance.toFixed(2)}
                                                                                                        </Cell>
                                                                                                        <Cell>
                                                                                                            <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                                                                                                <Box onClick={() => {
  const url = `/account-ledger/${account?.id}`;
  const state = {
 
    cost_center: selectedCostCenter,
  };
  const encodedState = encodeURIComponent(JSON.stringify(state));
  window.open(`${url}?state=${encodedState}`, '_blank');
}}
>
                                                                                                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                                                                                                        <Box component={'img'} src={Images.ledgerIcon} sx={{ height: '16px', objectFit: 'contain' }} />
                                                                                                                    </IconButton>
                                                                                                                    <Typography variant="body2">
                                                                                                                        View
                                                                                                                    </Typography>
                                                                                                                </Box>
                                                                                                            </Box>
                                                                                                        </Cell>
                                                                                                    </Row>
                                                                                                </Fragment>
                                                                                            )
                                                                                        })}
                                                                                    </Fragment>
                                                                                }
                                                                            </Fragment>
                                                                        )
                                                                    })}
                                                                </Fragment>
                                                            }
                                                        </Fragment>
                                                    ))}
                                                </Fragment>
                                            </>
                                        ) : (
                                            <Row>
                                                <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                                                    No Data Found
                                                </Cell>
                                            </Row>
                                        )) : (
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
    );
}

export default ChartOfAccount;