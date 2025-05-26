import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, IconButton, TableContainer, TableHead, TableRow, Typography, tableCellClasses, CircularProgress, Grid, Tabs, Tab } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import FinanceServices from 'services/Finance';
import { PrimaryButton } from 'components/Buttons';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CommaSeparator, handleExportWithComponent } from 'utils';
import { PDFExport } from '@progress/kendo-react-pdf';
import SearchIcon from "@mui/icons-material/Search";
import moment from 'moment';
import CustomerServices from 'services/Customer';
import { showErrorToast } from 'components/NewToaster';
import DatePicker from 'components/DatePicker';
import SelectField from 'components/Select';

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

function BalanceSheet() {

  const classes = useStyles();
  const navigate = useNavigate();

  const contentRef = useRef(null);
  const { register } = useForm();

  const tableHead = ['Code', 'Name', 'Major Category', 'Sub Category', 'Sub Total (AED)', 'Final Total (AED)']

  const [loader, setLoader] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalCost, setTotalCost] = useState(0)

  // *For Balance Sheet
  const [balanceSheet, setBalanceSheet] = useState([]);
  console.log("🚀 ~ BalanceSheet ~ balanceSheet:", balanceSheet)
  const [filteredBalanceSheet, setFilteredBalanceSheet] = useState([]);
  console.log("🚀 ~ BalanceSheet ~ filteredBalanceSheet:", filteredBalanceSheet)


  const [childTabs, setChildTabs] = useState([])
  const [costCenters, setCostCenters] = useState([])
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)

  const [capitalTotal, setCapitalTotal] = useState(0)
  const [libalTotal, setLibalTotal] = useState(0)
  // *For Filters
  const [filters, setFilters] = useState('all');
  const [filterData, setFilterData] = useState();

  // *For Collapse
  const [expand, setExpand] = useState([]);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  let TotalEquity = 0

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

  // *For Handle Date
  const handleFromDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setFromDate('invalid')
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
      if (newDate == 'Invalid Date') {
        setToDate('invalid')
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
      let params = {
        cost_center: selectedCostCenter?.name,
        to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
        from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
      }
      const { data } = await FinanceServices.getAccountReports(params)
      console.log(data?.detail, 'data?.detail');
      let newData = data?.detail.slice(3)
      console.log(newData, 'newData');


      let myData = data?.detail
      setBalanceSheet(data?.detail?.slice(0, -2))
      setFilteredBalanceSheet(data?.detail?.slice(0, -2))

      const fil = []
      data?.detail.forEach(e => {
        let obj = {
          id: e.id,
          name: e.name,
          sub_accounts: e.sub
        }
        fil.push(obj)
      })
      setFilterData(fil?.slice(0, -2))
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
      let costData = newData.filter(item => item?.name == "Expenses")
      console.log(costData, 'costDatacostData');
      console.log(costData[0]?.sub?.filter(item => item?.type_number == 1), 'costDatacostData');
      const costSalesTotal = totalSales(costData[0]?.sub?.filter(item => item?.type_number == 1));
      console.log(costSalesTotal, 'costSalesTotal');
      const revenueTotal = calculateTotal(newData, 'Revenue');
      const totalEnxpensesVal = calculateTotal(newData, 'Expenses');


      console.log(totalEnxpensesVal, 'totalEnxpensesVal');
      console.log(revenueTotal, 'revenueTotalrevenueTotalrevenueTotalrevenueTotal');
      setTotalRevenue(revenueTotal)
      setTotalExpenses(totalEnxpensesVal)

      // Usage
      const LiabilitiesTotal = calculateTotal(myData, 'Liabilities');
      const OwnerCapitalTotal = calculateTotal(myData, 'Owner Capital');
      console.log(LiabilitiesTotal);
      setCapitalTotal(OwnerCapitalTotal)
      setLibalTotal(LiabilitiesTotal)
      console.log(OwnerCapitalTotal, 'OwnerCapitalTotal');
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Filter
  const handleFilter = (event, newValue, child) => {
    if (child) {

      console.log(newValue, 'newValue');
      console.log(balanceSheet);
      console.log(balanceSheet?.map(item => item?.sub?.filter(subItem => subItem?.id == newValue)), 'sdasadsda');
      const arrayOfArrays = balanceSheet?.map(item => item?.sub?.filter(subItem => subItem?.id == newValue))
      const nonEmptyArrays = arrayOfArrays.filter(arr => arr.length > 0);

      // Log the result to the console
      console.log(nonEmptyArrays.flat());
      setFilteredBalanceSheet(nonEmptyArrays.flat())

      setFilters(newValue);
    }
    else {

      setFilters(newValue);
      if (newValue === 'all') {
        setFilteredBalanceSheet(balanceSheet)
        setChildTabs(balanceSheet.find(item => item?.id == newValue)?.sub)
      } else {
        const filterData = balanceSheet.filter(e => e.id === newValue)
        setChildTabs(balanceSheet.find(item => item?.id == newValue)?.sub)
        setFilteredBalanceSheet(filterData)
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

    for (const item of balanceSheet) {
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

    setFilteredBalanceSheet(result)
  }

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = [];
    let GrandTotal = 0;
    let TotalEquity = 0;

    filteredBalanceSheet?.forEach((item, index) => {
      let sectionTotal = 0;

      item?.sub?.forEach(subItem => {
        let subTotal = 0;

        subItem?.accounts?.forEach(account => {
          let accountTotal = 0;

          // Calculate base account values
          const credit = parseFloat(account?.total_credit) || 0;
          const debit = parseFloat(account?.total_debit) || 0;

          if (Array.isArray(account?.childAccounts) && account.childAccounts.length > 0) {
            // Calculate child accounts total
            let childCredit = 0;
            let childDebit = 0;

            account.childAccounts.forEach(child => {
              const cc = parseFloat(child?.total_credit) || 0;
              const cd = parseFloat(child?.total_debit) || 0;

              childCredit += cc;
              childDebit += cd;

              const childNatureTotal = child?.nature === 'debit'
                ? cd - cc
                : cc - cd;

              rows.push([
                child?.account_code ?? '-',
                child?.account_name ?? '-',
                child?.account_category ?? '-',
                child?.account_subcategory ?? '-',
                '',
                parseFloat(childNatureTotal.toFixed(2)),
              ]);
            });

            // Account total from children
            accountTotal = account?.nature === 'debit'
              ? childDebit - childCredit
              : childCredit - childDebit;
          } else {
            // Account without children
            accountTotal = account?.nature === 'debit'
              ? debit - credit
              : credit - debit;
          }

          // Add to section, total, and conditionally equity
          subTotal += accountTotal;
          sectionTotal += accountTotal;
          GrandTotal += accountTotal;

          if (item?.name?.toLowerCase().includes('equity') || item?.name?.toLowerCase().includes('liabilities')) {
            TotalEquity += accountTotal;
          }

          rows.push([
            account?.account_code ?? '-',
            account?.account_name ?? '-',
            account?.account_category ?? '-',
            account?.account_subcategory ?? '-',
            '',
            parseFloat(accountTotal.toFixed(2))
          ]);
        });

        if (subItem?.accounts?.length > 0) {
          rows.push([`Subtotal of ${subItem?.accounts[0]?.type_code}`,'','','','','', parseFloat(subTotal.toFixed(2))]);
        }
      });

      // Section total (Assets / Liabilities / Equity)
      if (item?.sub?.length > 0) {
        rows.push([ `Total ${item?.name}`, '','','','','',parseFloat(sectionTotal.toFixed(2))]);
      }
    });

    // Optional: Add Grand Totals if needed
    rows.push([ '	Owner Capital + Liabilities + Retain Profit', '','','','','', CommaSeparator(parseFloat(parseFloat(libalTotal) + parseFloat(capitalTotal)+(parseFloat(parseFloat(totalRevenue) - parseFloat(totalCost)) - parseFloat(totalExpenses))).toFixed(2))]);


    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(new Blob([buf]), "Balance_Sheet.xlsx");
  };



  useEffect(() => {
    getBalanceSheet()
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
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
          Balance Sheet
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
          <Tabs value={filters} onChange={(event, newValue) => handleFilter(event, newValue, true)} >

            {childTabs?.map((item, index) => (

              <Tab key={index} value={item?.id} label={item?.name} />


            ))}
          </Tabs>
        </Grid>
      </Grid>

      {balanceSheet ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Balance Sheet"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Balance Sheet
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
                    filteredBalanceSheet?.length > 0 ? (
                      <>
                        <Fragment>
                          {filteredBalanceSheet?.map((item, index) => {
                            let GrandTotal = 0
                            return (
                              <Fragment key={index}>
                                <Row>
                                  <Cell className="pdf-table" colSpan={tableHead?.length}>
                                    <Typography className="pdf-table" variant="subtitle1" sx={{ textAlign: 'left' }}>
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
                                            <Cell className="pdf-table" colSpan={tableHead?.length}>
                                              <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, textAlign: 'left', ml: 1.5 }}>
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
                                                console.log(account, 'accountaccount');

                                                const credit = isNaN(account?.total_credit) ? 0 : account?.total_credit
                                                const debit = isNaN(account?.total_debit) ? 0 : account?.total_debit
                                                let childTotal = account?.nature === 'debit' ? parseFloat(debit) - parseFloat(credit) : parseFloat(credit) - parseFloat(debit)
                                                console.log(account?.childAccounts, 'childAccounts');

                                                if (account?.childAccounts?.length > 0) {
                                                  const initialValue = { "credit": 0, "debit": 0 };

                                                  const result = account?.childAccounts?.reduce((accumulator, transaction) => {
                                                    console.log(accumulator, transaction, 'transactiontransaction');

                                                    const credit = isNaN(transaction?.total_credit) ? 0 : transaction?.total_credit
                                                    const debit = isNaN(transaction?.total_debit) ? 0 : transaction?.total_debit
                                                    return {
                                                      "credit": parseFloat(accumulator.credit) + parseFloat(credit),
                                                      "debit": parseFloat(accumulator.debit) + parseFloat(debit),
                                                    };
                                                  }, initialValue);
                                                  console.log(result, 'resultresultresult');

                                                  childTotal = account?.nature === 'debit' ? parseFloat(result?.debit) - parseFloat(result?.credit) : parseFloat(result?.credit) - parseFloat(result?.debit)

                                                }
                                                Total += parseFloat(childTotal)
                                                GrandTotal += parseFloat(childTotal)
                                                if (index !== 0) {
                                                  TotalEquity += parseFloat(childTotal)
                                                }
                                                return (
                                                  <Fragment key={j}>
                                                    <Row>
                                                      <Cell className={account?.childAccounts ? classes.anchorLink + " " + "pdf-table" : 'pdf-table'} onClick={() => handleExpand(account?.id)}>
                                                        <Typography variant="body1" sx={{ ml: 3 }}>
                                                          {account?.account_code ?? '-'}
                                                        </Typography>
                                                      </Cell>
                                                      <Cell className={account?.childAccounts ? classes.anchorLink + " " + "pdf-table" : 'pdf-table'} onClick={() => handleExpand(account?.id)}>
                                                        {account?.account_name ?? '-'}
                                                      </Cell>
                                                      <Cell className="pdf-table" >
                                                        {account?.account_category ?? '-'}
                                                      </Cell>
                                                      <Cell className="pdf-table"  >
                                                        {account?.account_subcategory ?? '-'}
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                        {CommaSeparator(parseFloat(childTotal.toFixed(2)))}
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
                                                                <Cell className="pdf-table">
                                                                  <Typography variant="body1" sx={{ ml: 4.5 }}>
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
                                                <Row>
                                                  <Cell>
                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, ml: 4.5 }}>
                                                      Total of {subItem?.accounts[0]?.type_code}
                                                    </Typography>
                                                  </Cell>
                                                  <Cell colSpan={3}>
                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                      Total {subItem?.name}
                                                    </Typography>
                                                  </Cell>
                                                  <Cell>
                                                  </Cell>
                                                  <Cell>
                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                      {CommaSeparator(parseFloat(Total).toFixed(2))}
                                                    </Typography>
                                                  </Cell>
                                                </Row>
                                              }
                                            </Fragment>
                                          }
                                        </Fragment>
                                      )
                                    })}
                                    {console.log(item?.sub, 'item?.subitem?.subitem?.sub')}
                                    {item?.sub?.length > 0 &&
                                      <Fragment>
                                        <Row sx={{ bgcolor: item?.name == "Asset" ? Colors.primary : Colors.bluishCyan }}>
                                          <Cell>
                                            <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}>
                                              Totals
                                            </Typography>
                                          </Cell>
                                          <Cell colSpan={3}>
                                            <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                              Total {item?.name}
                                            </Typography>
                                          </Cell>
                                          <Cell>
                                          </Cell>
                                          <Cell>
                                            <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                              {CommaSeparator(parseFloat(GrandTotal).toFixed(2))}
                                            </Typography>
                                          </Cell>
                                        </Row>
                                      </Fragment>
                                    }
                                    {/* {item?.name === 'Liabilities' && filters === 'all' &&
                                    <Row sx={{ bgcolor: Colors.primary }}>
                                      <Cell colSpan={5}>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          TOTAL EQUITY & LIABILITIES
                                        </Typography>
                                      </Cell>
                                      <Cell>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
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
                        <Fragment>
                          {filteredBalanceSheet?.map((item, index) => {
                            let GrandTotal = 0
                            return (
                              <Fragment key={index}>

                                {true &&
                                  <Fragment>
                                    {filteredBalanceSheet?.map((subItem, i) => {
                                      let Total = 0
                                      return (
                                        <Fragment key={i}>

                                          {true &&
                                            <Fragment>
                                              {subItem?.accounts?.map((account, j) => {
                                                let childFinalTotal = 0
                                                const credit = isNaN(account?.total_credit) ? 0 : account?.total_credit
                                                const debit = isNaN(account?.total_debit) ? 0 : account?.total_debit

                                                let childTotal = account?.nature === 'debit' ? parseFloat(debit) - parseFloat(credit) : parseFloat(credit) - parseFloat(debit)
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
                                                Total += parseFloat(childTotal)
                                                GrandTotal += parseFloat(childTotal)
                                                if (index !== 0) {
                                                  TotalEquity += parseFloat(childTotal)
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
                                                      </Cell>
                                                      <Cell className="pdf-table">
                                                        {CommaSeparator(parseFloat(childTotal.toFixed(2)))}
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
                                                                <Cell className="pdf-table">
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
                                                                  {CommaSeparator(parseFloat(subTotal).toFixed(2))}
                                                                </Cell>
                                                                <Cell className="pdf-table">

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
                                                <Row>
                                                  <Cell>
                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, ml: 4.5 }}>
                                                      Total of {subItem?.accounts[0]?.type_code}
                                                    </Typography>
                                                  </Cell>
                                                  <Cell colSpan={3}>
                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                      Total {subItem?.name}
                                                    </Typography>
                                                  </Cell>
                                                  <Cell>
                                                  </Cell>
                                                  <Cell>
                                                    <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700 }}>
                                                      {CommaSeparator(parseFloat(Total).toFixed(2))}
                                                    </Typography>
                                                  </Cell>
                                                </Row>
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
                                          <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white, ml: 4.5 }}>
                                            Total
                                          </Typography>
                                        </Cell>
                                        <Cell colSpan={3}>
                                          <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                            Total {item?.name}sdasadsda
                                          </Typography>
                                        </Cell>
                                        <Cell>
                                        </Cell>
                                        <Cell>
                                          <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                            {parseFloat(GrandTotal).toFixed(2)}s
                                          </Typography>
                                        </Cell>
                                      </Row>
                                    </Fragment>
                                  } */}
                                    {/* {item?.name === 'Liabilities' && filters === 'all' &&
                                    <Row sx={{ bgcolor: Colors.primary }}>
                                      <Cell colSpan={5}>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
                                          TOTAL EQUITY & LIABILITIES
                                        </Typography>
                                      </Cell>
                                      <Cell>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.white }}>
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
                          <Row>

                      

                          </Row>
                          <Row sx={{ bgcolor: Colors.primary }}>
                              <Cell colSpan={5}>
                              <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, ml: 4.5, color: 'white' }}>
                                Retain Profit
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
                          <Row sx={{ bgcolor: Colors.primary }}>
                            <Cell>
                              <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, ml: 4.5, color: 'white' }}>
                                Total
                              </Typography>
                            </Cell>
                            <Cell colSpan={3}>
                              <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: 'white' }}>
                                Owner Capital + Liabilities + Retain Profit

                              </Typography>
                            </Cell>
                            <Cell>
                            </Cell>
                            <Cell>
                              <Typography className="pdf-table" variant="body1" sx={{ fontWeight: 700, color: 'white' }}>
                                {CommaSeparator(parseFloat(parseFloat(libalTotal) + parseFloat(capitalTotal)+(parseFloat(parseFloat(totalRevenue) - parseFloat(totalCost)) - parseFloat(totalExpenses))).toFixed(2))}
                              </Typography>
                            </Cell>
                          </Row>
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

export default BalanceSheet;