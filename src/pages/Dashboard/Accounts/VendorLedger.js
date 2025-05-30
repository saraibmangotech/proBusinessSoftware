import React, { Fragment, useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid } from '@mui/material';
import styled from '@emotion/styled';
import { EyeIcon, FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, LedgerLinking } from 'utils';
import DatePicker from 'components/DatePicker';
import { PrimaryButton } from 'components/Buttons';
import moment from 'moment';
import FinanceServices from 'services/Finance';

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
  }
})

function VendorLedger() {

  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [TotalBalance, setTotalBalance] = useState();

  let Balance = TotalBalance;


  const { register, handleSubmit, setValue } = useForm();

  const tableHead = ['Date', 'JV#', 'Particular#', 'Type', 'Description', 'Comments', 'Debit (AED)', 'Credit (AED)', 'Balance (AED)', 'Action']

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Account Ledger
  const [accountLedgers, setAccountLedgers] = useState();


  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

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

  // *For Get Account Ledger
  const getAccountLedgers = async (page, limit, filter) => {
    setLoading(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit,
        account_id: id
      }
      params = { ...params, ...Filter }
      const { data } = await FinanceServices.getAccountLedgers(params)
      setAccountLedgers(data?.statement?.rows);
      setTotalCount(data?.statement?.count);
      setTotalBalance(data?.statement?.opening_balance_aed);
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      from_date: fromDate ? moment(new Date(fromDate)).format('MM-DD-YYYY') : '',
      to_date: toDate ? moment(new Date(toDate)).format('MM-DD-YYYY') : ''
    }
    getAccountLedgers(1, '', data)
    // Debounce(() => getAccountLedgers(1, '', data));
  }

  const handleFilterSearch = (data) => {
    Debounce(() => getAccountLedgers(1, '', data));
  }

  useEffect(() => {
    getAccountLedgers()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        {state?.accountName} Account's Ledger
      </Typography>

      {/* Filters */}
      <Box component={'form'} onSubmit={handleSubmit(handleFilter)}>
        <Grid container spacing={1} >
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'Search'}
              placeholder={'Search'}
              register={register('search', {
                onChange: (e) => handleFilterSearch({ search: e.target.value })
              })}
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
              disableFuture={true}
              size='small'
              minDate={fromDate}
              label={'To Date'}
              value={toDate}
              onChange={(date) => handleToDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={2} sx={{ mt: 3.5 }}>
            <PrimaryButton
              title="Search"
              type='submit'
              loading={loading}
            />
          </Grid>
        </Grid>
      </Box>

      {accountLedgers ? (
        <Fragment>

          {/* ========== Table ========== */}
          <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}>
            <Table stickyHeader sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  {tableHead.map((item, index) => (
                    <Cell key={index}>{item}</Cell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loader ? (
                  accountLedgers?.length > 0 ? (
                    <Fragment>
                      {accountLedgers.map((item, index) => {
                        let page = LedgerLinking(item?.entry?.reference_module)
                        let debit = item?.debit;
                        let credit = item?.credit;
                        // if (state?.currency) {
                        //   credit = item?.credit_cur
                        //   debit = item?.debit_cur
                        // }
                        const balance = state?.nature === 'credit' ? (parseFloat(credit) - parseFloat(debit)).toFixed(2) : (parseFloat(debit) - parseFloat(credit)).toFixed(2)
                        Balance += parseFloat(balance)
                        return (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell>
                              {item?.created_at ? moment(item?.created_at).format('DD/MM/YYYY') : '-'}
                            </Cell>
                            <Cell>
                              {item?.journal_id ? item?.series_id + item?.journal_id : '-'}
                            </Cell>
                            <Cell>
                              {item?.entry?.reference_no ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.type?.type_name ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.description ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.comment ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.debit}
                            </Cell>
                            <Cell>
                              {item?.credit}
                            </Cell>
                            <Cell>
                              {Balance?.toFixed(2)}
                            </Cell>
                            <Cell>
                              <Box
                                onClick={page ? () =>
                                  navigate(`/${page}/${item?.entry?.reference_id}`)
                                  : () => {
                                    setValue('search', item?.series_id + item?.journal_id);
                                    handleFilter({ search: item?.series_id + item?.journal_id })
                                  }}
                              >
                                <IconButton
                                  sx={{
                                    bgcolor:
                                      Colors.primary,
                                    "&:hover": {
                                      bgcolor:
                                        Colors.primary,
                                    },
                                  }}
                                >
                                  <EyeIcon />
                                </IconButton>

                              </Box>
                            </Cell>
                          </Row>
                        )
                      })}
                    </Fragment>
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

          {/* ========== Pagination ========== */}
          <Pagination
            currentPage={currentPage}
            pageSize={pageLimit}
            onPageSizeChange={(size) => getAccountLedgers(1, size.target.value)}
            tableCount={accountLedgers?.length}
            totalCount={totalCount}
            onPageChange={(page) => getAccountLedgers(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default VendorLedger;