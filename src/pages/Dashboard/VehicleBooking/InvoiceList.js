import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, Dialog, Tooltip, InputAdornment } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import SelectField from 'components/Select';
import CustomerServices from 'services/Customer';
import { addPermission } from 'redux/slices/navigationDataSlice';
import { useDispatch } from "react-redux";
import { CancelOutlined, FilterAlt } from '@mui/icons-material';
import { PrimaryButton } from 'components/Buttons';
import DatePicker from 'components/DatePicker';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

function InvoiceList() {

  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const tableHead = ['Date', 'Buy Date', 'Customer', 'C-ID', 'Invoice#', 'Amount', 'Status', 'Paid', 'Balance', 'VIN', 'Lot', 'Actions']
  const { register, handleSubmit } = useForm();
  const [loader, setLoader] = useState(false);

  // *For Invoice List
  const [invoiceList, setInvoiceList] = useState();

  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Dialog
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

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

  const applyFilter = () => {
    let filterData = {

      from_date: fromDate ? moment(fromDate).format('MM-DD-YYYY') : '',
      to_date: toDate ? moment(toDate).format('MM-DD-YYYY') : '',
    }
    getInvoiceList(1, '', filterData)
    setOpenFilterDialog(false)
  }

  const clearFilter = () => {

    setFromDate(null)
    setToDate(null)
    let filterData = {
      form_date: '',
      to_date: '',
    }
    getInvoiceList(1, '', filterData)
    setOpenFilterDialog(false)
  }


  // *For Get Customer Booking
  const getCustomerBooking = async (search) => {
    try {
      let params = {
        name: search ?? ''
      }
      const { data } = await CustomerServices.getCustomerBooking(params)
      setCustomers(data?.customers)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Invoice List
  const getInvoiceList = async (page, limit, filter) => {
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
      const { data: { approvals } } = await VehiclePaymentServices.getInvoiceList(params)
      setInvoiceList(approvals?.rows)
      setTotalCount(approvals?.count)
      setPermissions(formatPermissionData(approvals?.permissions))
      approvals?.permissions.forEach((e) => {
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
    Debounce(() => getInvoiceList(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Actions");
    const rows = invoiceList?.map((item) => [
      moment(item?.created_at).format('DD-MMM-YYYY'),
      item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format('DD-MMM-YYYY') : '-',
      item?.booking?.customer?.name ?? '-',
      item?.booking?.customer?.id ?? '-',
      `GVI-${item?.id ?? '-'}`,
      parseFloat(item?.amount).toFixed(2) ?? '-',
      item?.paid === item?.amount ? 'Paid' : item?.paid === '0.000' ? 'UnPaid' : 'Partial Paid',
      parseFloat(item?.paid).toFixed(2) ?? '-',
      parseFloat(item?.balance).toFixed(2) ?? '-',
      item?.booking?.vin ?? '-',
      item?.booking?.lot_number ?? '-',

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
    getCustomerBooking()
    getInvoiceList()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Dialog
        open={openFilterDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "35%",
            height: "auto",
            borderRadius: 2,
            py: 2,
            px: 3,
          },
        }}
      >
        <IconButton
          onClick={() => setOpenFilterDialog(false)}
          sx={{ position: "absolute", right: 13, top: 13 }}
        >
          <CancelOutlined />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            color: Colors.charcoalGrey,
            fontFamily: FontFamily.NunitoRegular,
            mt: 1,
            mb: 2.5,
          }}
        >
          Filters
        </Typography>
        <Box component="form" onSubmit={handleSubmit(applyFilter)}>
          <Grid container spacing={0.5} alignItems="center">




            <Grid item xs={12} sm={3}>
              <Typography variant="body1">From Date:</Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              <DatePicker
                disableFuture={true}
                size="small"
                value={fromDate}
                onChange={(date) => handleFromDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body1">To Date:</Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              <DatePicker
                disableFuture={true}
                size="small"
                minDate={fromDate}
                value={toDate}
                onChange={(date) => handleToDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton
                title="Apply"
                type="submit"
                buttonStyle={{ minWidth: "120px" }}
              />
              <Box component={"span"} sx={{ mx: 1 }} />
              <PrimaryButton
                title="Reset"
                type="button"
                buttonStyle={{
                  minWidth: "120px",
                  bgcolor: Colors.cloudyGrey,
                  "&:hover": { bgcolor: Colors.cloudyGrey },
                }}
                onClick={() => clearFilter()}
              />
            </Grid>
          </Grid>
        </Box>
      </Dialog>

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
          Vehicle Invoices
        </Typography>
        {invoiceList?.length > 0 && (
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
        <Grid container spacing={1} >
          <Grid item xs={12} sm={2}>
            <InputField
              size={'small'}
              label={'Search'}
              placeholder={'Search'}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              register={register('search', {
                onChange: (e) => handleFilter({ search: e.target.value })
              })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SelectField
              size={'small'}
              onSearch={(v) => getCustomerBooking(v)}
              label={'Select Customer'}
              options={customers}
              selected={selectedCustomer}
              onSelect={(value) => { setSelectedCustomer(value); handleFilter({ customer_id: value?.id }) }}
              register={register("customer")}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <InputField
              size={'small'}
              label={'VIN'}
              placeholder={'VIN'}
              register={register('vin', {
                onChange: (e) => handleFilter({ vins: e.target.value })
              })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <InputField
              size={'small'}
              label={'Lot'}
              placeholder={'Lot'}
              register={register('lot', {
                onChange: (e) => handleFilter({ lots: e.target.value })
              })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SelectField
              size={'small'}
              label={'Payment Status'}
              options={[{ id: 'Paid', name: 'Paid' }, { id: 'UnPaid', name: 'UnPaid' }]}
              selected={selectedPaymentStatus}
              onSelect={(value) => { setSelectedPaymentStatus(value); handleFilter({ unpaid: value?.id === 'Paid' ? false : true }) }}
              register={register("paymentStatus")}
            />
          </Grid>
          <Grid item xs={12} sm={2} sx={{ textAlign: "right", mt: 3.2 }}>
            <PrimaryButton
              title="Filters"
              startIcon={<FilterAlt />}
              buttonStyle={{ minWidth: "120px" }}
              onClick={() => setOpenFilterDialog(true)}
            />
          </Grid>
        </Grid>

        {invoiceList ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Vehicle Invoices'>
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Invoice List
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
                      invoiceList?.length > 0 ? (
                        <Fragment>

                          {invoiceList.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              {console.log(item)}
                              <Cell className='pdf-table'>
                                {moment(item?.created_at).format('DD-MMM-YYYY')}
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format('DD-MMM-YYYY') : '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.booking?.customer?.name ?? '-'}
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
                                  {item?.booking?.customer?.name?.length > 15 ? item?.booking?.customer?.name?.slice(0, 10) + "..." : item?.booking?.customer?.name}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.customer?.name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.booking?.customer?.id ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                GVI-{item?.id ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {parseFloat(item?.amount).toFixed(2) ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Box sx={{ 'path': { fill: item?.paid !== item?.amount && item?.paid !== '0.000' ? Colors.bluishCyan : item?.paid === '0.000' ? Colors.danger : Colors.primary } }}>
                                  <span className='pdf-hide' > {item?.paid === item?.amount ? <CheckIcon /> : item?.paid === '0.000' ? <PendingIcon /> : <CheckIcon />}</span>
                                  <Typography variant="body2">
                                    {item?.paid === item?.amount ? 'Paid' : item?.paid === '0.000' ? 'UnPaid' : 'Partial Paid'}
                                  </Typography>
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                {parseFloat(item?.paid).toFixed(2) ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {parseFloat(item?.balance).toFixed(2) ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.booking?.vin ?? '-'}
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
                                  {item?.booking?.vin?.length > 12 ? item?.booking?.vin?.slice(0, 8) + "..." : item?.booking?.vin}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.vin ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.booking?.lot_number ?? '-'}
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
                                  {item?.booking?.lot_number?.length > 12 ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number}
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.booking?.lot_number ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                  <Box onClick={() => navigate(`/invoice/${item?.id}`)}>
                                    <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                      <EyeIcon />
                                    </IconButton>
                                    <Typography variant="body2">
                                      View Invoice
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
              onPageSizeChange={(size) => getInvoiceList(1, size.target.value)}
              tableCount={invoiceList?.length}
              totalCount={totalCount}
              onPageChange={(page) => getInvoiceList(page, '')}
            />

          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>

    </Box >
  );
}

export default InvoiceList;