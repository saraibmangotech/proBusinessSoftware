import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, CircularProgress, Grid, Tabs, Tab } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import FinanceServices from 'services/Finance';
import DatePicker from 'components/DatePicker';
import moment from 'moment';
import { CommaSeparator, Debounce, handleExportWithComponent } from 'utils';
import ExportFinanceServices from 'services/ExportFinance';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PrimaryButton } from 'components/Buttons';
import { PDFExport } from '@progress/kendo-react-pdf';
import SelectField from 'components/Select';
import CustomerServices from 'services/Customer';
import { showErrorToast } from 'components/NewToaster';

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

function ProfitLossCustomerReport() {

    const classes = useStyles();
    const contentRef = useRef(null);

    const tableHead = ['Code', 'Name', 'Major Category', 'Sub Category', 'Sub Total (AED)', 'Final Total (AED)']

    const [loader, setLoader] = useState(false);

    // *For Profit Loss Statement
    const [profitLossStatement, setProfitLossStatement] = useState([]);
    const [filteredProfitLossStatement, setFilteredProfitLossStatement] = useState([]);
    const [customerQueue, setCustomerQueue] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState('all');
    const [filterData, setFilterData] = useState();
    const [dateFilter, setDateFilter] = useState();
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [childTabs, setChildTabs] = useState([])

    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [totalCost, setTotalCost] = useState(0)
    const [totalAdminExpenses, setTotalAdminExpenses] = useState(0)

    // *For Collapse
    const [expand, setExpand] = useState([]);

    // *For Handle Date
    const handleFromDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == 'Invalid Date') {
                setFromDate('invalid')
                return
            }
            setFromDate(new Date(newDate))
            handleFilter({ fromDate: moment(new Date(newDate)).format('MM-DD-YYYY') })
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
            handleFilter({ toDate: moment(new Date(newDate)).format('MM-DD-YYYY') })
        } catch (error) {
            ErrorToaster(error)
        }
    }
    const [GrossTotal, setGrossTotal] = useState(0)

    const getCustomerQueue = async (page, limit, filter) => {
        // setLoader(true)
        try {

            const Filter = { ...filters, ...filter }

            setFilters(Filter)
            let params = {
                page: 1,
                limit: 1000,
            }
            params = { ...params }
            const { data } = await CustomerServices.getCustomerQueue(params)

            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }


    // *For Get Balance Sheet
    const getProfitLossStatement = async (filter) => {
        try {
            const Filter = { ...dateFilter, ...filter }
            setDateFilter(Filter)
            let params = {
                ...Filter
            }
            const { data } = await FinanceServices.getCustomerProfitLoss(params)
            setProfitLossStatement(data?.detail.slice(3))
            setFilteredProfitLossStatement(data?.detail.slice(3))
            let myData = data?.detail.slice(3)
            console.log(myData, 'myData');
            // Remove Admin & Operational Expenses
            myData.forEach(item => {
                if (item.sub) {
                    item.sub = item.sub.filter(subItem => subItem.name !== 'Admin & Operational Expenses' &&
                        subItem.name !== 'Core Income');
                }
            });

            // Console the rest
            console.log(myData, 'myData');

            const calculateTotal = (data, category) => {
                let total = 0;

                data?.forEach((item) => {
                    try {
                        if (item?.name === category) {
                            console.log(item?.name);
                            console.log(category);
                            processSubItems(item?.sub);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                });

                return total.toFixed(2);

                function processSubItems(subItems) {
                    subItems?.forEach((subItem) => {
                        console.log(subItem);
                        if (subItem?.accounts) {
                            subItem.accounts.forEach((account) => {
                                const credit = parseFloat(account.total_credit) || 0;
                                const debit = parseFloat(account.total_debit) || 0;

                                total += account.nature === 'debit' ? debit - credit : credit - debit;
                            });
                        }
                        else {
                            subItem.childAccounts?.forEach((account) => {
                                const credit = parseFloat(account.total_credit) || 0;
                                const debit = parseFloat(account.total_debit) || 0;

                                total += account.nature === 'debit' ? debit - credit : credit - debit;
                            });
                        }

                        // Recursively process child accounts
                        if (subItem?.accounts ? subItem?.accounts : subItem?.childAccounts) {
                            console.log(subItem?.accounts ? subItem?.accounts : subItem?.childAccounts);
                            processSubItems(subItem?.accounts ? subItem?.accounts : subItem?.childAccounts);
                        }
                    });
                }
            };

            // Usage
            const revenueTotal = calculateTotal(myData, 'Revenue');
            const totalEnxpensesVal = calculateTotal(myData, 'Expenses');
            let costData = myData.filter(item => item?.name == "Expenses")
            console.log(costData, 'costDatacostData');
            console.log(costData[0]?.sub?.filter(item => item?.type_number == 1));

            console.log(totalEnxpensesVal);
            console.log(revenueTotal, 'revenueTotalrevenueTotalrevenueTotalrevenueTotal');
            setTotalRevenue(revenueTotal)
            setTotalExpenses(totalEnxpensesVal)
            console.log(revenueTotal);


            console.log('Total Revenue:', revenueTotal);


            const calculateAdminOperationalExpensesTotal = (expensesData) => {
                let total = 0;

                expensesData?.forEach((category) => {
                    if (category.name == 'Admin & Operational Expenses') {
                        category.sub.forEach((subCategory) => {
                            subCategory.accounts.forEach((account) => {
                                if (account.nature === 'debit') {
                                    total += parseFloat(account.total_debit);
                                }
                            });

                            // If there are child accounts, consider their debits as well
                            if (subCategory.accounts.childAccounts) {
                                subCategory.accounts.childAccounts.forEach((childAccount) => {
                                    if (childAccount.nature === 'debit') {
                                        total += parseFloat(childAccount.total_debit);
                                    }
                                });
                            }
                        });
                    }
                });

                return total.toFixed(2);
            };

            const totalSales = (data, category) => {
                let total = 0;

                data?.forEach((item) => {
                    try {
                        if (true) {

                            processSubitems2(item?.accounts);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                });

                return total.toFixed(2);




                function processSubitems2(subItems) {

                    console.log(subItems)
                    let grandTotal = 0
                    for (let i = 0; i < subItems.length; i++) {
                        const subItem = subItems[i];
                        let accountNature = subItem.nature;
                        let childTotal = 0;
                        if (subItem.childAccounts && subItem.childAccounts.length > 0) {
                            for (let j = 0; j < subItem.childAccounts.length; j++) {
                                const child = subItem.childAccounts[j];
                                console.log(child, "child")
                                const childCredit = parseFloat(child.total_credit) || 0;
                                const childDebit = parseFloat(child.total_debit) || 0;

                                childTotal += accountNature == "debit" ? parseFloat(childDebit) - parseFloat(childCredit) : parseFloat(childCredit) - parseFloat(childDebit);
                            }
                        }

                        grandTotal += childTotal;
                        const credit = parseFloat(subItem.total_credit) || 0;
                        const debit = parseFloat(subItem.total_debit) || 0;
                        grandTotal += accountNature == "debit" ? parseFloat(debit) - parseFloat(credit) : parseFloat(credit) - parseFloat(debit);
                        console.log(childTotal, "Child total")
                    }
                    setTotalCost(grandTotal)
                    console.log(grandTotal, "grand Total")


                }
            };
            // Usage
            const costSalesTotal = totalSales(costData[0]?.sub?.filter(item => item?.type_number == 1));
            console.log(costSalesTotal);
            const adminOperationalExpensesTotal = calculateAdminOperationalExpensesTotal(myData);
            setTotalAdminExpenses(adminOperationalExpensesTotal)

            const fil = []
            data?.detail?.forEach(e => {
                let obj = {
                    id: e.id,
                    name: e.name,
                    sub_accounts: e.sub
                }
                fil.push(obj)
            })
            setFilterData(fil.slice(3))
            let mydata = fil.slice(3)


        } catch (error) {
            ErrorToaster(error)
        }
    }

    // *For Handle Category Filter
    const handleCategoryFilter = (event, newValue, child) => {
        if (child) {


            const arrayOfArrays = profitLossStatement?.map(item => item?.sub?.filter(subItem => subItem?.id == newValue))
            const nonEmptyArrays = arrayOfArrays.filter(arr => arr.length > 0);

            // Log the result to the console

            setFilteredProfitLossStatement(nonEmptyArrays.flat())

            setFilters(newValue);
        }
        else {

            setFilters(newValue);
            if (newValue === 'all') {
                setFilteredProfitLossStatement(profitLossStatement)
                setChildTabs(profitLossStatement.find(item => item?.id == newValue)?.sub)
            } else {
                const filterData = profitLossStatement.filter(e => e.id === newValue)
                setChildTabs(profitLossStatement.find(item => item?.id == newValue)?.sub)
                setFilteredProfitLossStatement(filterData)
            }
        }
    };

    // *For Handle Filter
    const handleFilter = (data) => {
        Debounce(() => getProfitLossStatement(data));
    }

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

        for (const item of profitLossStatement) {
            if (item?.sub.length > 0) {
                for (const sub of item?.sub) {
                    if (sub?.accounts?.length > 0) {
                        for (const acc of sub?.accounts) {
                            if (acc.account_name?.toLowerCase().includes(search?.toLowerCase()) || acc.account_code?.toLowerCase().includes(search?.toLowerCase())) {
                                result.push(item);
                            } else {
                                if (acc?.childAccounts?.length > 0) {
                                    for (const subAcc of acc?.childAccounts) {
                                        if (subAcc.account_name?.toLowerCase().includes(search?.toLowerCase()) || subAcc.account_code?.toLowerCase().includes(search?.toLowerCase())) {
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

        setFilteredProfitLossStatement(result)
    }

    const downloadExcel = () => {
        const headers = tableHead;
        const rows = [];
        // Iterate through the data and push each row to the 'rows' array
        filteredProfitLossStatement?.forEach(item => {
            let GrandTotal = 0
            rows.push([
                item.name,
                '', // Empty cells for the columns that don't have data in this row
                '',
                '',
                '',
                ''
            ]);

            if (item.sub) {
                item.sub.forEach(subItem => {
                    let Total = 0
                    rows.push([
                        subItem.name,
                        '',
                        '',
                        '',
                        '',
                        ''
                    ]);
                    if (subItem.accounts) {
                        subItem.accounts.forEach(account => {
                            let childFinalTotal = 0
                            let childTotal = 0
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
                                childTotal = account?.nature === 'debit' ? parseFloat(result?.debit) - parseFloat(result?.credit) : parseFloat(result?.credit) - parseFloat(result?.debit)

                            }
                            else {
                                childTotal = account?.nature === 'debit' ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit) : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)
                            }
                            Total += parseFloat(childTotal)
                            GrandTotal += parseFloat(childTotal)
                            // const total = account.total !== undefined && account.total !== null ? parseFloat(account.total).toFixed(2) : '';
                            rows.push([
                                account.account_code ?? '-',
                                account.account_name ?? '-',
                                account.account_category ?? '-',
                                account.account_subcategory ?? '-',
                                '',
                                childTotal
                            ]);

                            if (account.childAccounts) {
                                account.childAccounts.forEach(child => {
                                    const credit = isNaN(child?.total_credit) ? 0 : child?.total_credit
                                    const debit = isNaN(child?.total_debit) ? 0 : child?.total_debit
                                    let subTotal = child?.nature === 'debit' ? (parseFloat(debit) - parseFloat(credit)).toFixed(2) : (parseFloat(credit) - parseFloat(debit)).toFixed(2)
                                    childFinalTotal += parseFloat(subTotal)
                                    // const childTotal = child.total !== undefined && child.total !== null ? parseFloat(child.total).toFixed(2) : '';
                                    rows.push([
                                        child.account_code ?? '-',
                                        child.account_name ?? '-',
                                        child.account_category ?? '-',
                                        child.account_subcategory ?? '-',
                                        subTotal,
                                        ''
                                    ]);
                                });
                            }
                        });
                    }
                    subItem?.accounts?.length > 0 && (
                        rows.push([
                            `Total of ${subItem?.accounts[0]?.type_code}`,
                            "",
                            `Total of ${subItem?.name}`,
                            "",
                            "",
                            Total
                        ])
                    )
                    subItem?.name === 'Cost of Sales' && (
                        rows.push([
                            "",
                            "",
                            "Gross Profit",
                            "",
                            "",
                            parseFloat(parseFloat(totalRevenue) - parseFloat(totalCost)).toFixed(2)
                        ])
                    )
                });
                item?.sub?.length > 0 && (
                    rows.push([
                        "Total",
                        "",
                        `Total ${item?.name}`,
                        "",
                        "",
                        parseFloat(GrandTotal).toFixed(2)
                    ])
                )
            }
        });
        filteredProfitLossStatement.length - 1 && (
            rows.push([
                "",
                "",
                "Net Profit",
                "",
                "",
                parseFloat(parseFloat(totalRevenue) - parseFloat(totalExpenses)).toFixed(2)
            ])
        )

        // Convert the data to a worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Convert the workbook to a binary Excel file and trigger the download
        const buf = XLSX.write(wb, {
            bookType: "xlsx",
            type: "array",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(new Blob([buf]), "data.xlsx");
    };

    useEffect(() => {
     
        getCustomerQueue()
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
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, }}>
                    Profit & Loss Visa Report
                </Typography>
                {/* {profitLossStatement?.length > 0 && (
                    <Box sx={{
                        textAlign: "right", p: 4, display: "flex", gap: 2

                    }}>
                        <PrimaryButton
                            title="Download PDF"
                            type="button"
                            style={{ backgroundColor: Colors.bluishCyan }}
                            onClick={() => handleExportWithComponent(contentRef)}
                        />
                        <PrimaryButton
                            title={"Download Excel"}
                            onClick={() => downloadExcel()}
                        />
                    </Box>
                )} */}
            </Box>

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
                <Grid item xs={3} >
                    <SelectField
                        size={'small'}
                        label={'Select Customer :'}

                        options={customerQueue}
                        selected={selectedCustomer}
                        onSelect={(value) => {
                            setSelectedCustomer(value)


                            let data = {
                                customer_id : value?.id
                            }
                            getProfitLossStatement(data)

                        }}

                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <DatePicker
                        disableFuture={true}
                        size='small'
                        label={'From Date'}
                        value={fromDate}
                        onChange={(date) => handleFromDate(date)}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <DatePicker
                        disabled={fromDate ? false : true}
                        disableFuture={true}
                        size='small'
                        minDate={fromDate}
                        label={'To Date'}
                        value={toDate}
                        onChange={(date) => handleToDate(date)}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={12}>
                    <Tabs value={filters} onChange={(event, newValue) => handleCategoryFilter(event, newValue, false)} >
                        <Tab value="all" label="All" />

                        {filterData?.map((item, index) => (
                            <Tab key={index} value={item?.id} label={item?.name} />
                        ))}
                    </Tabs>
                    <Tabs value={filters} onChange={(event, newValue) => handleCategoryFilter(event, newValue, true)} >

                        {childTabs?.map((item, index) => (

                            <Tab key={index} value={item?.id} label={item?.name} />


                        ))}
                    </Tabs>
                </Grid>
            </Grid>

            {profitLossStatement ? (
                <Fragment>
                    <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                        fileName="Profit OR Loss Statement"
                    >
                        <Box className='pdf-show' sx={{ display: 'none' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                                    Profit OR Loss Statement
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
                                            <Cell className='pdf-table' key={index}>{item}</Cell>
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
                                                                        <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, textAlign: 'left' }}>
                                                                            {expand.indexOf(item.id) === -1 ? (
                                                                                <ExpandMore className='pdf-hide' sx={{ verticalAlign: 'sub', cursor: 'pointer', opacity: item?.sub?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(item.id)} />
                                                                            ) : (
                                                                                <ExpandLess className='pdf-hide' sx={{ verticalAlign: 'sub', cursor: 'pointer', transform: 'rotate(90deg)', opacity: item?.sub?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(item.id)} />
                                                                            )}
                                                                            {item?.name}
                                                                        </Typography>
                                                                    </Cell>
                                                                </Row>
                                                                {expand.indexOf(item.id) === -1 &&
                                                                    <Fragment>
                                                                        {item?.sub?.map((subItem, i) => {
                                                                            let Total = 0

                                                                            return (
                                                                                <Fragment key={i}>
                                                                                    <Row>
                                                                                        <Cell colSpan={tableHead?.length}>
                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, textAlign: 'left', ml: 1.5 }}>
                                                                                                {expand.indexOf(subItem.id) === -1 ? (
                                                                                                    <ExpandMore className='pdf-hide' sx={{ verticalAlign: 'sub', cursor: 'pointer', opacity: subItem?.accounts?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(subItem.id)} />
                                                                                                ) : (
                                                                                                    <ExpandLess className='pdf-hide' sx={{ verticalAlign: 'sub', cursor: 'pointer', transform: 'rotate(90deg)', opacity: subItem?.accounts?.length > 0 ? 1 : 0 }} onClick={() => handleExpand(subItem.id)} />
                                                                                                )}
                                                                                                {subItem?.name}
                                                                                            </Typography>
                                                                                        </Cell>
                                                                                    </Row>
                                                                                    {expand.indexOf(subItem.id) === -1 &&
                                                                                        <Fragment>
                                                                                            {subItem?.accounts?.map((account, j) => {
                                                                                                let childFinalTotal = 0
                                                                                                let childTotal = 0
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
                                                                                                    childTotal = account?.nature === 'debit' ? parseFloat(result?.debit) - parseFloat(result?.credit) : parseFloat(result?.credit) - parseFloat(result?.debit)

                                                                                                }
                                                                                                else {
                                                                                                    childTotal = account?.nature === 'debit' ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit) : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)


                                                                                                }
                                                                                                Total += parseFloat(childTotal)


                                                                                                GrandTotal += parseFloat(childTotal)
                                                                                                return (
                                                                                                    <Fragment key={j}>
                                                                                                        <Row>
                                                                                                            <Cell className={account?.childAccounts ? classes.anchorLink : ''} onClick={() => handleExpand(account?.id)}>
                                                                                                                <Typography className='pdf-table' variant="body2" sx={{ ml: 3 }}>
                                                                                                                    {account?.account_code ?? '-'}
                                                                                                                </Typography>
                                                                                                            </Cell>
                                                                                                            <Cell className={account?.childAccounts ? classes.anchorLink + ' ' + 'pdf-table' : 'pdf-table'} onClick={() => handleExpand(account?.id)}>
                                                                                                                {account?.account_name ?? '-'}
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table' >
                                                                                                                {account?.account_category ?? '-'}
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table'>
                                                                                                                {account?.account_subcategory ?? '-'}
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table'>
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table'>
                                                                                                                {CommaSeparator(parseFloat(childTotal).toFixed(2))}
                                                                                                            </Cell>
                                                                                                        </Row>
                                                                                                        {expand.indexOf(account.id) !== -1 &&
                                                                                                            <Fragment>
                                                                                                                {account?.childAccounts?.map((child, j) => {
                                                                                                                    const credit = isNaN(child?.total_credit) ? 0 : child?.total_credit
                                                                                                                    const debit = isNaN(child?.total_debit) ? 0 : child?.total_debit
                                                                                                                    let subTotal = child?.nature === 'debit' ? (parseFloat(debit) - parseFloat(credit)).toFixed(2) : (parseFloat(credit) - parseFloat(debit)).toFixed(2)

                                                                                                                    childFinalTotal += parseFloat(subTotal)
                                                                                                                    return (
                                                                                                                        <Fragment key={j}>
                                                                                                                            <Row sx={{ bgcolor: '#EEFBEE' }}>
                                                                                                                                <Cell>
                                                                                                                                    <Typography className='pdf-table' variant="body2" sx={{ ml: 4.5 }}>
                                                                                                                                        {child?.account_code ?? '-'}
                                                                                                                                    </Typography>
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {child?.account_name ?? '-'}
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {child?.account_category ?? '-'}
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {child?.account_subcategory ?? '-'}
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {CommaSeparator(parseFloat(subTotal).toFixed(2))}
                                                                                                                                </Cell>
                                                                                                                                <Cell>

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
                                                                                            {subItem?.accounts?.length > 0 &&
                                                                                                <Fragment>
                                                                                                    <Row>
                                                                                                        <Cell>
                                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, ml: 4.5 }}>
                                                                                                                Total of {subItem?.accounts[0]?.type_code}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                        <Cell colSpan={3}>
                                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700 }}>
                                                                                                                Total {subItem?.name}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                        <Cell>
                                                                                                        </Cell>
                                                                                                        <Cell>
                                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700 }}>
                                                                                                                {CommaSeparator(parseFloat(Total).toFixed(2))}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                    </Row>
                                                                                                    {console.log(subItem?.name)
                                                                                                    }
                                                                                                    {(subItem?.name == 'Cost of Sales') &&
                                                                                                        <Row sx={{ bgcolor: Colors.primary }}>
                                                                                                            <Cell colSpan={5}>
                                                                                                                <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                                                    Profit
                                                                                                                </Typography>
                                                                                                            </Cell>
                                                                                                            <Cell>
                                                                                                                <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                                                    {CommaSeparator(parseFloat(parseFloat(totalRevenue) - parseFloat(totalCost)).toFixed(2))}
                                                                                                                </Typography>
                                                                                                            </Cell>
                                                                                                        </Row>
                                                                                                    }
                                                                                                </Fragment>
                                                                                            }

                                                                                        </Fragment>
                                                                                    }
                                                                                </Fragment>
                                                                            )
                                                                        })}
                                                                        {/* {item?.sub?.length > 0 &&
                                                                            <Fragment>
                                                                                <Row sx={{ bgcolor: Colors.bluishCyan }}>
                                                                                    <Cell>
                                                                                        <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}>
                                                                                            Total
                                                                                        </Typography>
                                                                                    </Cell>
                                                                                    <Cell colSpan={3}>
                                                                                        <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                            Total {item?.name}
                                                                                        </Typography>
                                                                                    </Cell>
                                                                                    <Cell>
                                                                                    </Cell>
                                                                                    <Cell>
                                                                                        <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                            {CommaSeparator(parseFloat(GrandTotal).toFixed(2))}
                                                                                        </Typography>
                                                                                    </Cell>
                                                                                </Row>
                                                                            </Fragment>
                                                                        } */}
                                                                        {/* {filteredProfitLossStatement.length - 1 === index && filters === 'all' &&
                                                                            <Row sx={{ bgcolor: Colors.primary }}>
                                                                                <Cell colSpan={5}>
                                                                                    <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                        Net Profit
                                                                                    </Typography>
                                                                                </Cell>
                                                                                <Cell>
                                                                                    {console.log(totalRevenue, 'asdasd')}
                                                                                    {console.log(totalExpenses, 'asdasd')}
                                                                                    {console.log(parseFloat(parseFloat(totalRevenue) - parseFloat(totalExpenses)).toFixed(2), 'asdasd')}

                                                                                    <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                        {CommaSeparator((parseFloat(parseFloat(totalRevenue) - parseFloat(totalCost)) - parseFloat(totalExpenses)).toFixed(2))}
                                                                                    </Typography>
                                                                                </Cell>
                                                                            </Row>
                                                                        } */}
                                                                    </Fragment>
                                                                }
                                                            </Fragment>
                                                        )
                                                    })}
                                                </Fragment>
                                                <Fragment>
                                                    {filteredProfitLossStatement?.map((item, index) => {
                                                        let GrandTotal = 0
                                                        return (
                                                            <Fragment key={index}>

                                                                {true &&
                                                                    <Fragment>
                                                                        {filteredProfitLossStatement?.map((subItem, i) => {
                                                                            let Total = 0
                                                                            return (
                                                                                <Fragment key={i}>

                                                                                    {true &&
                                                                                        <Fragment>
                                                                                            {subItem?.accounts?.map((account, j) => {
                                                                                                let childFinalTotal = 0
                                                                                                let childTotal = 0
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
                                                                                                    childTotal = account?.nature === 'debit' ? parseFloat(result?.debit) - parseFloat(result?.credit) : parseFloat(result?.credit) - parseFloat(result?.debit)

                                                                                                }
                                                                                                else {

                                                                                                    childTotal = account?.nature === 'debit' ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit) : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)

                                                                                                }
                                                                                                Total += parseFloat(childTotal)
                                                                                                GrandTotal += parseFloat(childTotal)
                                                                                                return (
                                                                                                    <Fragment key={j}>
                                                                                                        <Row>
                                                                                                            <Cell className={account?.childAccounts ? classes.anchorLink : ''} onClick={() => handleExpand(account?.id)}>
                                                                                                                <Typography className='pdf-table' variant="body2" sx={{ ml: 3 }}>
                                                                                                                    {account?.account_code ?? '-'}
                                                                                                                </Typography>
                                                                                                            </Cell>
                                                                                                            <Cell className={account?.childAccounts ? classes.anchorLink + ' ' + 'pdf-table' : 'pdf-table'} onClick={() => handleExpand(account?.id)}>
                                                                                                                {account?.account_name ?? '-'}
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table'>
                                                                                                                {account?.account_category ?? '-'}
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table'>
                                                                                                                {account?.account_subcategory ?? '-'}
                                                                                                            </Cell>
                                                                                                            <Cell>
                                                                                                            </Cell>
                                                                                                            <Cell className='pdf-table'>
                                                                                                                {CommaSeparator(parseFloat(childTotal).toFixed(2))}
                                                                                                            </Cell>
                                                                                                        </Row>
                                                                                                        {expand.indexOf(account.id) !== -1 &&
                                                                                                            <Fragment>
                                                                                                                {account?.childAccounts?.map((child, j) => {
                                                                                                                    const credit = isNaN(child?.total_credit) ? 0 : child?.total_credit
                                                                                                                    const debit = isNaN(child?.total_debit) ? 0 : child?.total_debit
                                                                                                                    let subTotal = child?.nature === 'debit' ? (parseFloat(debit) - parseFloat(credit)).toFixed(2) : (parseFloat(credit) - parseFloat(debit)).toFixed(2)

                                                                                                                    childFinalTotal += parseFloat(subTotal)
                                                                                                                    return (
                                                                                                                        <Fragment key={j}>
                                                                                                                            <Row sx={{ bgcolor: '#EEFBEE' }}>
                                                                                                                                <Cell>
                                                                                                                                    <Typography className='pdf-table' variant="body2" sx={{ ml: 4.5 }}>
                                                                                                                                        {child?.account_code ?? '-'}
                                                                                                                                    </Typography>
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {child?.account_name ?? '-'}
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {child?.account_category ?? '-'}
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {child?.account_subcategory ?? '-'}
                                                                                                                                </Cell>
                                                                                                                                <Cell className='pdf-table'>
                                                                                                                                    {CommaSeparator(parseFloat(subTotal).toFixed(2))}
                                                                                                                                </Cell>
                                                                                                                                <Cell>

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
                                                                                            {subItem?.accounts?.length > 0 &&
                                                                                                <Fragment>
                                                                                                    <Row>
                                                                                                        <Cell>
                                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, ml: 4.5 }}>
                                                                                                                Total of {subItem?.accounts[0]?.type_code}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                        <Cell colSpan={3}>
                                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700 }}>
                                                                                                                Total {subItem?.name}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                        <Cell>
                                                                                                        </Cell>
                                                                                                        <Cell>
                                                                                                            <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700 }}>
                                                                                                                {CommaSeparator(parseFloat(Total).toFixed(2))}
                                                                                                            </Typography>
                                                                                                        </Cell>
                                                                                                    </Row>
                                                                                                    {filters === 'all' && subItem?.name === 'Cost of Sales' &&
                                                                                                        <Row sx={{ bgcolor: Colors.primary }}>
                                                                                                            <Cell colSpan={5}>
                                                                                                                <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                                                    Gross Profitssdasdasda
                                                                                                                </Typography>
                                                                                                            </Cell>
                                                                                                            <Cell>
                                                                                                                <Typography className='pdf-table' variant="body2" sx={{ fontWeight: 700, color: Colors.white }}>
                                                                                                                    {/* {parseFloat(Total).toFixed(2)}sadsadsda */}
                                                                                                                </Typography>
                                                                                                            </Cell>
                                                                                                        </Row>
                                                                                                    }
                                                                                                </Fragment>
                                                                                            }
                                                                                        </Fragment>
                                                                                    }
                                                                                </Fragment>
                                                                            )
                                                                        })}
                                                                        {item?.sub?.length > 0 &&
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
                                                                        }
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
                                                                }
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

export default ProfitLossCustomerReport;