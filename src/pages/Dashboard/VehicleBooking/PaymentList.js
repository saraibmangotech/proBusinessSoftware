import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import { useDispatch } from "react-redux";
import { addPermission } from 'redux/slices/navigationDataSlice';
import { useForm } from 'react-hook-form';
import VehicleBookingServices from 'services/VehicleBooking';
import SelectField from 'components/Select';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PrimaryButton } from 'components/Buttons';
import { PDFExport } from '@progress/kendo-react-pdf';

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

function PaymentList() {

  const navigate = useNavigate();
  const classes = useStyles();
  const contentRef = useRef(null);
  const dispatch = useDispatch();
  const { register } = useForm();

  const tableHead = ['Date', 'Customer', 'C-ID', 'Currency', 'Amount', 'Exchange Rate', 'Amount AED', 'User', 'Actions']

  const [loader, setLoader] = useState(false);

  // *For Payment List
  const [paymentList, setPaymentList] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Booking Customer
  const [bookingCustomers, setBookingCustomers] = useState([]);
  const [selectedBookingCustomer, setSelectedBookingCustomer] = useState(null);

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
      handleFilter({ from_date: moment(new Date(newDate)).format('MM-DD-YYYY') })
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
      handleFilter({ to_date: moment(new Date(newDate)).format('MM-DD-YYYY') })
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Booking Customer
  const getBookingCustomers = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await VehicleBookingServices.getBookingCustomers(params)
      setBookingCustomers(data?.filters.map((item) => { return { id: item?.customer_id, name: item?.customer_name } }))
    } catch (error) {
      ErrorToaster(error)
    }
  }


  // *For Get Payment List
  const getPaymentList = async (page, limit, filter) => {
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
      const { data: { payments } } = await VehiclePaymentServices.getPaymentList(params)
      setPaymentList(payments?.rows)
      setTotalCount(payments?.count)
      setPermissions(formatPermissionData(payments?.permissions))
      payments?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getPaymentList(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Actions");
    const rows = paymentList?.map((item) => [
      moment(item?.created_at).format('DD-MMM-YYYY'),
      item?.customer?.name ?? '-',
      item?.customer?.id ?? '-',
      item?.currency?.toUpperCase() ?? '-',
      parseFloat(item?.amount).toFixed(2) ?? '-',
      parseFloat(item?.exchange_rate).toFixed(2) ?? '-',
      parseFloat(item?.amount_aed).toFixed(2) ?? '-',
      item?.user?.name ?? '-',
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(new Blob([buf]), "data.xlsx");
  };

  useEffect(() => {
    getPaymentList()
    getBookingCustomers()
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
          Payment Receipts
        </Typography>
        {paymentList?.length > 0 && (
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
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>


        <Grid container spacing={1}>
          <Grid item xs={12} sm={3}>
            <SelectField
              size={'small'}
              onSearch={(v) => getBookingCustomers(v)}
              label={'Customer'}
              options={bookingCustomers}
              selected={selectedBookingCustomer}
              onSelect={(value) => { setSelectedBookingCustomer(value); handleFilter({ customer_id: value?.id }) }}
              register={register("bookingCustomer")}
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

        {paymentList ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Payment Receipts' >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Payment Receipts
                  </Typography>
                  <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                </Box>
              </Box>
              {/* ========== Table ========== */}
              <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }} className='table-box'>
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
                      paymentList?.length > 0 ? (
                        <Fragment>
                          {paymentList.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className='pdf-table'>
                                {moment(item?.created_at).format('DD-MMM-YYYY')}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.customer?.name ?? '-'}
                                  arrow
                                  placement="top"
                                  slotProps={{
                                    popper: {
                                      modifiers: [
                                        {
                                          name: "offset",
                                          options: {
                                            offset: [10, -2],
                                          },
                                        },
                                      ],
                                    },
                                  }}
                                >
                                  {item?.customer?.name?.length > 12 ? item?.customer?.name?.slice(0, 12) + "..." : item?.customer?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.customer?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.customer?.id ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.currency?.toUpperCase() ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {parseFloat(item?.amount).toFixed(2) ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {parseFloat(item?.exchange_rate).toFixed(2) ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {parseFloat(item?.amount_aed).toFixed(2) ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.user?.name ?? '-'}
                                  arrow
                                  placement="top"
                                  slotProps={{
                                    popper: {
                                      modifiers: [
                                        {
                                          name: "offset",
                                          options: {
                                            offset: [10, -2],
                                          },
                                        },
                                      ],
                                    },
                                  }}
                                >
                                  {item?.user?.name?.length > 8 ? item?.user?.name?.slice(0, 5) + "..." : item?.user?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.user?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                  <Box onClick={() => navigate(`/payment-receipt/${item?.id}`)}>
                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                      <EyeIcon />
                                    </IconButton>
                                    <Typography variant="body2">
                                      View Receipt
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
            </PDFExport>
            {/* ========== Pagination ========== */}
            <Pagination
              currentPage={currentPage}
              pageSize={pageLimit}
              onPageSizeChange={(size) => getPaymentList(1, size.target.value)}
              tableCount={paymentList?.length}
              totalCount={totalCount}
              onPageChange={(page) => getPaymentList(page, '')}
            />

          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>
    </Box >
  );
}

export default PaymentList;