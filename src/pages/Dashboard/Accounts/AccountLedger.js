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
import CustomerServices from 'services/Customer';
import { showErrorToast } from 'components/NewToaster';
import SelectField from 'components/Select';

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
  }
})

function AccountLedger() {

  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [TotalBalance, setTotalBalance] = useState();

  let Balance = TotalBalance;


  const { register, handleSubmit, setValue } = useForm();

  const tableHead = ['Date', 'JV#', 'Particular#', 'Cost Center', 'Type', 'Description', 'Comments', 'Debit (AED)', 'Credit (AED)', 'Balance (AED)']

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Account Ledger
  const [accountLedgers, setAccountLedgers] = useState();


  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [costCenters, setCostCenters] = useState([])
  const [selectedCostCenter, setSelectedCostCenter] = useState(null)

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
        account_id: id,
        cost_center: selectedCostCenter?.name
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
      to_date: toDate ? moment(new Date(toDate)).format('MM-DD-YYYY') : '',
      cost_center: selectedCostCenter?.name
    }
    getAccountLedgers(1, '', data)
    // Debounce(() => getAccountLedgers(1, '', data));
  }

  const getCostCenters = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await CustomerServices.getCostCenters(params);
      setCostCenters([{ id: 'All', name: 'All' }, ...(data?.cost_centers || [])]);

    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleFilterSearch = (data) => {
    Debounce(() => getAccountLedgers(1, '', data));
  }

  useEffect(() => {
    getCostCenters()
    getAccountLedgers()
  }, []);
  useEffect(() => {
  
    getAccountLedgers()
  }, [selectedCostCenter]);
  useEffect(() => {
    if (state?.cost_center) {
      setSelectedCostCenter(state?.cost_center)
    }

  }, [state])

  console.log(state, 'statestate');



  return (
    <Box sx={{ m: 4, mb: 2 }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        {state?.accountName} Account's Ledger
      </Typography>

      {/* Filters */}
      <Box component={'form'} onSubmit={handleSubmit(handleFilter)}>
        <Grid container spacing={1} >
          <Grid item xs={12} sm={2.5}>
            <InputField
              size={'small'}
              label={'Search'}
              placeholder={'Search'}
              register={register('search', {
                onChange: (e) => handleFilterSearch({ search: e.target.value })
              })}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <SelectField

              size={"small"}
              label={"Cost Center"}
              options={costCenters}
              selected={selectedCostCenter}
              onSelect={(value) => {
                setSelectedCostCenter(value);
              }}
              register={register("costCenter")}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <DatePicker
              disableFuture={true}
              size='small'
              label={'From Date'}
              value={fromDate}
              onChange={(date) => handleFromDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
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
                        if (state?.currency) {
                          credit = item?.credit_cur
                          debit = item?.debit_cur
                        }

                        const balance = state?.nature === 'debit' ? (parseFloat(debit) - parseFloat(credit)).toFixed(2) : (parseFloat(credit) - parseFloat(debit)).toFixed(2)
                        Balance += parseFloat(balance)
                        return (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell>
                              {item?.created_at ? moment(item?.created_at).format('MM-DD-YYYY') : '-'}
                            </Cell>
                            <Cell>
                              {item?.journal_id ? item?.series_id + item?.journal_id : '-'}
                            </Cell>
                            <Cell>
                              {item?.entry?.reference_no ?? '-'}
                            </Cell>
                            <Cell>
                              {item?.cost_center ?? '-'}
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
                            {/* <Cell>
                              <Box
                                onClick={page ? () =>
                                  navigate(`/${page}/${item?.entry?.reference_id}`)
                                  : () => {

                                    navigate(`/general-journal-ledger`, { state: item?.series_id + item?.journal_id })
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
                            </Cell> */}
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

export default AccountLedger;