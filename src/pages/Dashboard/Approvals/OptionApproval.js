import React, { Fragment, useEffect, useState } from 'react';
import { Box, CircularProgress, Dialog, Grid, IconButton, ImageListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import VehicleBookingServices from 'services/VehicleBooking';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import { CancelOutlined, Edit } from '@mui/icons-material';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { Debounce } from 'utils';
import ApprovalStatusDialog from 'components/Dialog/ApprovalStatusDialog';

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
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

function OptionApproval() {

  const navigate = useNavigate();
  const classes = useStyles();

  const tableHead = ['COA Code', 'COA Name', 'Unit', 'Major Category', 'Sub Category', 'Account Balance', 'Status']

  const { register, handleSubmit } = useForm();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Dialog Box
  const [approvalRequestDialog, setApprovalRequestDialog] = useState(false);

  // *For Approval List
  const [approvalList, setApprovalList] = useState([{ code: 'A1-10001', name: 'Plant & Machinery', unit: 'Shipping', major: 'Asset', sub: 'Fixed Asset', balance: '999999' }]);
  const [approvalDetail, setApprovalDetail] = useState();
  const [bookingId, setBookingId] = useState();
  const [approvalId, setApprovalId] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
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
      // handleFilter({ from_date: moment(new Date(newDate)).format('MM-DD-YYYY') })
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
      // handleFilter({ to_date: moment(new Date(newDate)).format('MM-DD-YYYY') })
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Approval List
  const getApprovalList = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit
      }
      params = { ...params, ...Filter }
      const { data } = await VehicleBookingServices.getApprovalList(params)
      setApprovalList(data?.approvals?.rows)
      setTotalCount(data?.approvals?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Get Approval Detail
  const getApprovalDetail = async (id) => {
    try {
      let params = {
        approval_id: id
      }
      let { data } = await VehicleBookingServices.getApprovalDetail(params)
      let oldData = []
      let newData = []
      for (const key in data?.details?.old_data) {
        let obj = { key: key, value: data?.details?.old_data[key] }
        oldData.push(obj)
      }
      for (const key in data?.details?.new_data) {
        let obj = { key: key, value: data?.details?.new_data[key] }
        newData.push(obj)
      }

      let obj = {
        ...data.details,
        oldData: oldData,
        newData: newData
      }
      setApprovalDetail(obj)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Review Approval
  const reviewApproval = async (status) => {
    setLoading(true)
    try {
      let obj = {
        approval_id: approvalId,
        booking_id: bookingId,
        status: status,
      }
      if (status === 'approved') {
        obj.new_data = approvalDetail?.new_data
      }
      const { message } = await VehicleBookingServices.reviewApproval(obj)
      SuccessToaster(message)
      setApprovalRequestDialog(false)
      getApprovalList()
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Handle Status Action
  const handleStatusAction = (id, status, bookingId) => {
    setApprovalRequestDialog(true);
    if (status === 'pending') {
      // getApprovalDetail(id);
      // setBookingId(bookingId);
      // setApprovalId(id)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getApprovalList(1, '', data));
  }

  useEffect(() => {
    // getApprovalList()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      <ApprovalStatusDialog open={approvalRequestDialog} onClose={() => setApprovalRequestDialog(false)} status={true} updateStatus={() => setApprovalRequestDialog(false)} />


      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Option Approval
      </Typography>

      {/* Filters */}
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <DatePicker
            size='small'
            label={'From Date'}
            maxDate={toDate}
            value={fromDate}
            onChange={(date) => handleFromDate(date)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <DatePicker
            size='small'
            minDate={fromDate}
            label={'To Date'}
            value={toDate}
            onChange={(date) => handleToDate(date)}
          />
        </Grid>
      </Grid>

      {approvalList ? (
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
                  approvalList?.length > 0 ? (
                    <Fragment>
                      {approvalList.map((item, index) => (
                        <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                          <Cell>
                            {item?.code ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.name ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.unit ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.major ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.sub ?? '-'}
                          </Cell>
                          <Cell>
                            {item?.balance ?? '-'}
                          </Cell>
                          <Cell>
                            <Box sx={{ cursor: 'pointer' }} onClick={() => handleStatusAction()} >
                              <PendingIcon />
                              <Typography variant="body2">
                                {'pending'}
                              </Typography>
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
            onPageSizeChange={(size) => getApprovalList(1, size.target.value)}
            tableCount={approvalList?.length}
            totalCount={totalCount}
            onPageChange={(page) => getApprovalList(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default OptionApproval;