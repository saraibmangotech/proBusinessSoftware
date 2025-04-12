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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { handleExportWithComponent } from 'utils';
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    padding: '15px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    background: Colors.primary,
    color: Colors.white
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: 'center',
    textWrap: 'nowrap',
    padding: '5px !important',

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
      height: '24px'
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

  const { register } = useForm();

  const tableHead = ['Code', 'Name', 'Unit', 'Major Category', 'Sub Category', 'Balance (AED)', 'Actions']

  const [loader, setLoader] = useState(false);

  // *For Chart of Account
  const [chartOfAccount, setChartOfAccount] = useState();
  const [filteredCOA, setFilteredCOA] = useState();

  // *For Filters
  const [filters, setFilters] = useState('all');
  const [filterData, setFilterData] = useState();

  const [childTabs, setChildTabs] = useState([])

  // *For Collapse
  const [expand, setExpand] = useState([]);

  // *For Get Chart Account
  const getChartOfAccount = async (filter) => {
    try {
      const { data } = await FinanceServices.getChartOfAccount()
      setChartOfAccount(data?.COA)
      setFilteredCOA(data?.COA)

      const fil = []
      data?.COA.forEach(e => {
        let obj = {
          id: e.id,
          name: e.name,
          sub_accounts: e.sub
        }
        fil.push(obj)
      })
      setFilterData(fil)
    } catch (error) {
      ErrorToaster(error)
    }
  }

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
    // Define headers and data separately
    const headers = tableHead.filter((item) => item !== "Actions");
    const rows = [];
    // Extract values from objects and create an array for each row
    chartOfAccount?.forEach((item, index) => {
      rows.push([
        item.name,
        "",
        "",
        "",
        "",
        "",
      ])
      item?.sub?.forEach((subItem, i) => {
        rows.push([
          subItem?.name,
          "",
          "",
          "",
          "",
          "",
        ])
        subItem?.accounts?.forEach((account, j) => {
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
            Balance = account?.nature === 'debit'
              ? parseFloat(result?.debit) - parseFloat(result?.credit)
              : parseFloat(result?.credit) - parseFloat(result?.debit)

          }
          else {
            Total = account?.nature === 'debit'
              ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit)
              : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)
          }
          rows.push([
            account?.account_code ?? '-',
            account?.account_name ?? '-',
            account?.unit ?? '-',
            account?.account_category ?? '-',
            account?.account_subcategory ?? '-',
            account?.childAccounts ? Balance.toFixed(2) : Total.toFixed(2)
          ])
          account?.childAccounts?.forEach((child, j) => {
            let ChildBalance = 0;
            ChildBalance = child?.nature === 'debit'
              ? parseFloat(child?.total_debit) - parseFloat(child?.total_credit)
              : parseFloat(child?.total_credit) - parseFloat(child?.total_debit)
            rows.push([
              child?.account_code ?? '-',
              child?.account_name ?? '-',
              child?.unit ?? '-',
              child?.account_category ?? '-',
              child?.account_subcategory ?? '-',
              ChildBalance.toFixed(2)
            ])
          })
        })
      })
      item?.accounts?.forEach((account, j) => {
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
          Balance = account?.nature === 'debit'
            ? parseFloat(result?.debit) - parseFloat(result?.credit)
            : parseFloat(result?.credit) - parseFloat(result?.debit)

        }
        else {
          Total = account?.nature === 'debit'
            ? parseFloat(account?.total_debit) - parseFloat(account?.total_credit)
            : parseFloat(account?.total_credit) - parseFloat(account?.total_debit)
        }
        rows.push([
          account?.account_name ?? '-',
          account?.unit ?? '-',
          account?.account_category ?? '-',
          account?.account_subcategory ?? '-',
          account?.childAccounts ? Balance.toFixed(2) : Total.toFixed(2)
        ])
        account?.childAccounts?.forEach((child, j) => {
          let ChildBalance = 0
          ChildBalance = child?.nature === 'debit'
            ? parseFloat(child?.total_debit) - parseFloat(child?.total_credit)
            : parseFloat(child?.total_credit) - parseFloat(child?.total_debit)
          rows.push([
            child?.account_code ?? '-',
            child?.account_name ?? '-',
            child?.unit ?? '-',
            child?.account_category ?? '-',
            child?.account_subcategory ?? '-',
            ChildBalance.toFixed(2)
          ])
        })
      })
    })

    // Create a workbook with a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Convert the workbook to an array buffer
    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file using FileSaver.js
    saveAs(new Blob([buf]), "data.xlsx");
  };

  useEffect(() => {
    getChartOfAccount()
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
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
          All Chart of Accounts
        </Typography>
        {chartOfAccount?.length > 0 && (
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
          <Tabs value={filters} onChange={(event, newValue) => handleFilter(event, newValue, false)} >
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

      {chartOfAccount ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}  >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
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
                                                    {account?.unit ?? '-'}
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
                                                        <Box onClick={() => navigate(`/account-ledger/${account?.id}`, { state: { accountName: account?.account_name, nature: account?.nature } })}>
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
                                                              {child?.unit ?? '-'}
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
                                                                <Box onClick={() => navigate(`/account-ledger/${child?.id}`, { state: { accountName: child?.account_name, nature: child?.nature } })}>
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
                                            {account?.unit ?? '-'}
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
                                                <Box onClick={() => navigate(`/account-ledger/${account?.id}`, { state: { accountName: account?.account_name, nature: account?.nature } })}>
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
                                                      {child?.unit ?? '-'}
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
                                                        <Box onClick={() => navigate(`/account-ledger/${child?.id}`, { state: { accountName: child?.account_name, nature: child?.nature } })}>
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