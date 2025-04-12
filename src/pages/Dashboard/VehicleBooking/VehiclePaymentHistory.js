import React, { Fragment, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import VehiclePaymentServices from 'services/VehiclePayment';
import DatePicker from 'components/DatePicker';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { handleExportWithComponent } from 'utils';
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

function VehiclePaymentHistory() {

  const navigate = useNavigate();
  const classes = useStyles();
  const contentRef = useRef(null);

  const tableHead = ['Invoice ID', 'Booking ID', 'Currency', 'Total Amount', 'Ex Rate', 'Total AED', 'Date', 'User']
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loader, setLoader] = useState(false);

  // *For Vehicle Payment History
  const [vehiclePaymentHistory, setVehiclePaymentHistory] = useState();

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
  // *For Get Payment History
  const getVehiclePaymentHistory = async (page, limit, filter) => {
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
      const { data } = await VehiclePaymentServices.getVehiclePaymentHistory(params)
      setVehiclePaymentHistory(data?.history?.rows)
      setTotalCount(data?.history?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (formData) => {
    let filterData = {
      vin: formData?.vin,
      lot: formData?.lot,
      fromDate: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
      toDate: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
    }
    getVehiclePaymentHistory(1, '', filterData)
  }

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = vehiclePaymentHistory?.map((item) => [
      item?.invoice_id ?? '-',
      item?.booking_id ?? '-',
      item?.currency.toUpperCase() ?? '-',
      parseFloat(item?.amount).toFixed(2) ?? '-',
      parseFloat(item?.exchange_rate).toFixed(2) ?? '-',
      parseFloat(item?.amount_aed).toFixed(2) ?? '-',
      moment(item?.payment?.created_at).format('MM-DD-YYYY HH:mm a'),
      item?.payment?.user?.name ?? '-'
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
          Payment History
        </Typography>
        {vehiclePaymentHistory?.length > 0 && (
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
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }} >
        <Box component={'form'} onSubmit={handleSubmit(handleFilter)}>
          <Grid container spacing={1} alignItems="center" >
            <Grid item xs={12} sm={2} mt={1}>
              <InputField
                size={'small'}
                label={'VIN'}
                placeholder={'VIN'}
                error={errors?.vin?.message}
                register={register('vin')}
              />
            </Grid>
            <Grid item xs={12} sm={2} mt={1}>
              <InputField
                size={'small'}
                label={'LOT'}
                placeholder={'LOT'}
                register={register('lot')}
              />
            </Grid>
            <Grid item xs={12} sm={3} >
              <DatePicker
                disableFuture={true}
                size="small"
                label={"From Date"}
                value={fromDate}
                onChange={(date) => handleFromDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                disableFuture={true}
                size="small"
                label={"To Date"}
                minDate={fromDate}
                value={toDate}
                onChange={(date) => handleToDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={2} sx={{ mt: 3 }}>
              <PrimaryButton
                title="Search"
                type='submit'
                loading={loader}
              />
            </Grid>
          </Grid>
        </Box>

        {vehiclePaymentHistory &&
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Payment History'>
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Payment History
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
                      vehiclePaymentHistory?.length > 0 ? (
                        <Fragment>
                          {vehiclePaymentHistory.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className='pdf-table'>
                                {item?.invoice_id ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.booking_id ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.currency.toUpperCase() ?? '-'}
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
                                {moment(item?.payment?.created_at).format('MM-DD-YYYY HH:mm a')}
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.payment?.user?.name ?? '-'}
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
              onPageSizeChange={(size) => getVehiclePaymentHistory(1, size.target.value)}
              tableCount={vehiclePaymentHistory?.length}
              totalCount={totalCount}
              onPageChange={(page) => getVehiclePaymentHistory(page, '')}
            />

          </Fragment>
        }

        {loader && <CircleLoading />}
      </Box>
    </Box >
  );
}

export default VehiclePaymentHistory;