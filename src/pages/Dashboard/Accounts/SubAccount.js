import React, { Fragment, useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import BuyerServices from 'services/Buyer';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce } from 'utils';
import SelectField from 'components/Select';
import AuctionHouseServices from 'services/AuctionHouse';
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

function SubAccount() {

  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const { register } = useForm();

  const tableHead = ['Code', 'Name', 'Unit', 'Major Category', 'Sub Category', 'Debit', 'Credit', 'Actions']

  const [loader, setLoader] = useState(false);

  // *For Sub Accounts List
  const [subAccounts, setSubAccounts] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Get Chart of Account Sub Account 
  const getChartOfAccountSubAccount = async (page, limit, filter) => {
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
        primary_account_id: id
      }
      params = { ...params, ...Filter }
      const { data } = await FinanceServices.getChartOfAccountSubAccount(params)
      setSubAccounts(data?.accounts?.rows)
      setTotalCount(data?.accounts?.count)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getChartOfAccountSubAccount(1, '', data));
  }

  useEffect(() => {
    getChartOfAccountSubAccount()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        {state?.accountName} Account's List
      </Typography>

      {/* Filters */}
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Code'}
            placeholder={'Search Code'}
            register={register('code', {
              onChange: (e) => handleFilter({ code: e.target.value })
            })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Name'}
            placeholder={'Search Name'}
            register={register('name', {
              onChange: (e) => handleFilter({ name: e.target.value })
            })}
          />
        </Grid>
      </Grid>

      {subAccounts ? (
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
                  subAccounts?.length > 0 ? (
                    <Fragment>
                      {subAccounts.map((item, index) => (
                        <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                          <Cell>
                            {item?.account_code ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.name ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.unit ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.cat?.name ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.sub_cat?.name ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.total_debit ? parseFloat(item?.total_debit)?.toFixed(2) : '0.00'}
                          </Cell>
                          <Cell>
                            {item?.total_credit ? parseFloat(item?.total_credit)?.toFixed(2) : '0.00'}
                          </Cell>
                          <Cell>
                            <Box sx={{ gap: '16px !important' }}>
                              <Box onClick={() => navigate(`/account-ledger/${item?.id}`, { state: { accountName: item?.name } })}>
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
                      ))}
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
            onPageSizeChange={(size) => getChartOfAccountSubAccount(1, size.target.value)}
            tableCount={subAccounts?.length}
            totalCount={totalCount}
            onPageChange={(page) => getChartOfAccountSubAccount(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default SubAccount;