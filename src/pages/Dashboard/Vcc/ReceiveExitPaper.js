import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, InputLabel,
  FormControl,
  Checkbox,
  Select,
  MenuItem,
  ListItemText,
  InputAdornment,
  Tooltip
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import GatePassReceiveDialog from 'components/Dialog/GatePassReceiveDialog';
import GatePassRefundDialog from 'components/Dialog/GatePassRefundDialog';
import RefundFormDialog from 'components/Dialog/RefundFormDialog';
import VccServices from 'services/Vcc';
import DatePicker from 'components/DatePicker';
import { PrimaryButton } from 'components/Buttons';
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

function ReceiveExitPaper() {

  const navigate = useNavigate();
  const classes = useStyles();
  const contentRef = useRef(null);

  const tableHead = ['Customer ID', 'Customer Name', 'VIN', 'LOT', 'Make', 'Modal', 'Color', 'VCC Issue Purpose', 'VCC Declaration Number', 'VCC Declaration Date', 'VCC Expiry Date', 'Time Left', 'CEC Status', 'Status',]

  const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

  const { register } = useForm();

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Vehicle List
  const [vehicleList, setVehicleList] = useState();
  const [vehicleDetail, setVehicleDetail] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  // *For Dialog Box
  const [receiveStatusDialog, setReceiveStatusDialog] = useState(false);
  const [refundStatusDialog, setRefundStatusDialog] = useState(false);
  const [refundFormDialog, setRefundFormDialog] = useState(false);

  // *For Permissions
  const [permissions, setPermissions] = useState();

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

  // *For Get Vehicle List
  const getExitPaperReceiving = async (page, limit, filter) => {
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
      const { data } = await VccServices.getExitPaperReceiving(params)
      setVehicleList(data?.vehicles?.rows)
      setTotalCount(data?.vehicles?.count)
      setPermissions(formatPermissionData(data?.permissions))
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Dialog
  const handleDialog = (data) => {
    try {
      setVehicleDetail(data)
      if (data?.exit_paper_received === null) {
        setReceiveStatusDialog(true)
      }
      // if (data?.exit_paper_received) {
      //   setRefundStatusDialog(true)
      // }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Receive Exit Paper 
  const receiveExitPaper = async () => {
    console.log(vehicleDetail);
    try {
      let obj = {
        vehicle_id: vehicleDetail?.vehicle_id,
        received: true,
        vcc_id: vehicleDetail?.id,
        vcc_expiry: vehicleDetail?.vcc_expiry_date,
        customer_id: vehicleDetail?.booking?.customer?.id,
        customer_phone: vehicleDetail?.booking?.customer?.uae_phone

      }
      const { message } = await VccServices.receiveExitPaper(obj)
      SuccessToaster(message)
      getExitPaperReceiving()
      setReceiveStatusDialog(false)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Refund Exit Paper 
  const refundExitPaper = async (data) => {
    setLoading(true)
    try {
      let obj = {
        vehicle_id: vehicleDetail?.vehicle_id,
        vcc_id: vehicleDetail?.id,
        is_refunded: true,
        make_name: vehicleDetail?.booking?.veh_make?.name,
        model_name: vehicleDetail?.booking?.veh_model?.name,
        color: vehicleDetail?.booking?.color,
        vin: vehicleDetail?.booking?.vin,
        lot_number: vehicleDetail?.booking?.lot_number,
        customer_id: vehicleDetail?.booking?.customer?.id,
        ...data
      }
      const { message } = await VccServices.refundExitPaper(obj)
      SuccessToaster(message)
      getExitPaperReceiving()
      setRefundStatusDialog(false)
      setRefundFormDialog(false)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getExitPaperReceiving(1, '', data));
  }

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive,) => {
    const date = moment(item?.vcc_expiry_date).format('MM-DD-YYYY');
    const targetDate = moment(date, 'MM-DD-YYYY');
    let daysRemaining = targetDate.diff(moment(), 'days');
    if (daysRemaining < 0) {
      daysRemaining = 0
    }

    switch (colIndex) {
      case 0:
        return item?.booking?.customer?.id ?? '-';
      case 1:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={item?.booking?.customer?.name ?? "-"}
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
              {
                item?.booking?.customer?.name?.length > 12
                  ? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.customer?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.customer?.name ?? '-';
      case 2:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={copied ? "copied" : (item?.booking?.vin ?? "-")}
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
              onClick={() => copyContent(item?.booking?.vin ?? "-")}
            >
              {
                item?.booking?.vin?.length > 12
                  ? item?.booking?.vin?.slice(0, 8) + "..." : item?.booking?.vin
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.vin ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.vin ?? '-';
      case 3:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={copied ? "copied" : (item?.booking?.lot_number ?? "-")}
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
              onClick={() => copyContent(item?.booking?.lot_number ?? "-")}
            >
              {
                item?.booking?.lot_number?.length > 12
                  ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.lot_number ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.lot_number ?? '-';
      case 4:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={item?.booking?.veh_make?.name ?? "-"}
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
              {
                item?.booking?.veh_make?.name?.length > 12
                  ? item?.booking?.veh_make?.name?.slice(0, 8) + "..." : item?.booking?.veh_make?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.veh_make?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.veh_make?.name ?? '-';
      case 5:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={item?.booking?.veh_model?.name ?? "-"}
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
              {
                item?.booking?.veh_model?.name?.length > 12
                  ? item?.booking?.veh_model?.name?.slice(0, 8) + "..." : item?.booking?.veh_model?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.veh_model?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.veh_model?.name ?? '-';
      case 6:
        return item?.booking?.color ?? '-';
      case 7:
        return item?.vcc_purpose ?? '-';
      case 8:
        return item?.vcc_declaration ?? '-';

      case 9:
        return item?.vcc_date ? moment(item?.vcc_date).format('MM-DD-YYYY') : '-';
      case 10:
        return item?.vcc_expiry_date ? moment(item?.vcc_expiry_date).format('MM-DD-YYYY') : '-';
      case 11:
        return item?.vcc_expiry_date ? (
          daysRemaining === 0 ? (
            <Box>
              <span className='pdf-hide'>     <PendingIcon /> </span>
              <Typography variant="body2">
                Expired
              </Typography>
            </Box>
          ) : (
            `${daysRemaining} days`
          )
        ) : (
          '-'
        );
      case 12:
        return <Box>
          <span className='pdf-hide'>   {item?.exit_paper_received ? daysRemaining > 0 ? <CheckIcon /> : <PendingIcon /> : <PendingIcon />} </span>
          <Typography variant="body2">
            {item?.exit_paper_received ? daysRemaining > 0 ? item?.is_refunded ? 'On Time Received/Refunded' : 'On Time Received' : item?.is_refunded ? 'late Received/Refunded' : 'late Received' : 'Pending'}
          </Typography>
        </Box>;
      case 13:
        return <Box onClick={() => {
          if (
            !item?.is_refunded &&
            (item?.custom_charges_aed !== 0 &&
              item?.custom_charges_aed !== null &&
              item?.custom_charges_aed !== "")
          ) {
            handleDialog(item);
          }
        }} sx={{ cursor: 'pointer', 'path': { fill: item?.is_refunded ? Colors.primary : item?.is_refunded === false ? Colors.bluishCyan : '' } }}>
          <span className='pdf-hide'>  {item?.is_refunded ? <CheckIcon /> : <PendingIcon />}</span>
          <Typography variant="body2">
            {item?.is_refunded ? 'Refunded' : item?.is_refunded === false ? 'Received' : 'Pending'}
          </Typography>
        </Box>;
      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vehicleList?.map((item) => {
      const date = moment(item?.vcc_expiry_date).format('MM-DD-YYYY');
      const targetDate = moment(date, 'MM-DD-YYYY');
      let daysRemaining = targetDate.diff(moment(), 'days');
      if (daysRemaining < 0) {
        daysRemaining = 0
      }
      return [
        item?.booking?.customer?.id ?? '-',
        item?.booking?.customer?.name ?? "-",
        item?.booking?.vin ?? "-",
        item?.booking?.lot_number ?? "-",
        item?.booking?.veh_make?.name ?? "-",
        item?.booking?.veh_model?.name ?? "-",
        item?.booking?.color ?? '-',
        item?.vcc_purpose ?? '-',
        item?.vcc_declaration ?? '-',
        item?.vcc_date ? moment(item?.vcc_date).format('MM-DD-YYYY') : '-',
        item?.vcc_expiry_date ? moment(item?.vcc_expiry_date).format('MM-DD-YYYY') : '-',
        item?.vcc_expiry_date ? (daysRemaining === 0 ? "Expired" : `${daysRemaining} days`) : '-',
        item?.exit_paper_received ? daysRemaining > 0 ? item?.is_refunded ? 'On Time Received/Refunded' : 'On Time Received' : item?.is_refunded ? 'late Received/Refunded' : 'late Received' : 'Pending',
        item?.is_refunded ? 'Refunded' : item?.is_refunded === false ? 'Received' : 'Pending',
      ]
    })

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
    getExitPaperReceiving()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      {/* ========== Receive Dialog ========== */}
      <GatePassReceiveDialog open={receiveStatusDialog} onClose={() => setReceiveStatusDialog(false)} updateStatus={() => receiveExitPaper()} />

      {/* ========== Refund Dialog ========== */}
      <GatePassRefundDialog open={refundStatusDialog} onClose={() => setRefundStatusDialog(false)} updateStatus={() => setRefundFormDialog(true)} />

      {/* ========== Refund Form Dialog ========== */}
      <RefundFormDialog open={refundFormDialog} onClose={() => setRefundFormDialog(false)} loading={loading} depositId={vehicleDetail?.deposit?.id} depositAmount={vehicleDetail?.deposit?.amount} customerId={vehicleDetail?.booking?.customer?.id} onSubmit={(data) => refundExitPaper(data)} />
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
          Receive Custom Exit Certificate (CEC)
        </Typography>
        {vehicleList?.length > 0 && (
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
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={2} mt={1.2}>
            <InputField
              size={'small'}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              placeholder={'Search'}
              register={register('search', {
                onChange: (e) => handleFilter({ search: e.target.value })
              })}
            />
          </Grid>

          <Grid item xs={12} sm={2.5}>
            <DatePicker
              size='small'
              disableFuture={true}
              label={'From Date'}
              maxDate={toDate}
              value={fromDate}
              onChange={(date) => handleFromDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <DatePicker
              size='small'
              disableFuture={true}
              minDate={fromDate}
              label={'To Date'}
              value={toDate}
              onChange={(date) => handleToDate(date)}
            />
          </Grid>
        </Grid>



        <Grid item md={11}>
          {vehicleList && <Box>

            <Grid container mb={2} >
              <Grid item xs={5}>
                <FormControl>
                  <InputLabel>Columns</InputLabel>
                  <Select
                    size={'small'}
                    multiple
                    value={visibleColumns}
                    label={'Columns'}
                    onChange={handleColumnChange}
                    renderValue={() => "Show/Hide"}
                  >

                    {tableHead.map((column, index) => {


                      if (column !== 'Exit Paper Status' && column !== 'Status') {
                        return (
                          <MenuItem key={index} value={index}>
                            <Checkbox checked={visibleColumns.includes(index)} />
                            <ListItemText primary={column} />
                          </MenuItem>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {(
              vehicleList && (
                <Fragment>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                    fileName="Receive Custom Exit Certificate (CEC)"
                  >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          Receive Custom Exit Certificate (CEC)
                        </Typography>
                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                      </Box>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
                      className="table-box"
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        {/* Table Header */}
                        <TableHead>
                          <TableRow>
                            {visibleColumns.map((index) => (
                              <Cell
                                key={index}
                                className='pdf-table'
                              >
                                {tableHead[index]}
                              </Cell>
                            ))}
                          </TableRow>
                        </TableHead>

                        {/* Table Body */}
                        <TableBody>
                          {!loader ? (
                            vehicleList?.length > 0 ? (
                              <Fragment>
                                {vehicleList?.map((item, rowIndex) => {

                                  const isActive = true;
                                  return (
                                    <Row
                                      key={rowIndex}
                                      sx={{ bgcolor: rowIndex % 2 !== 0 && "#EFF8E7" }}
                                    >
                                      {visibleColumns.map((colIndex) => (
                                        <Cell className='pdf-table' key={colIndex}>
                                          {renderCellContent(colIndex, item, isActive,)}
                                        </Cell>
                                      ))}
                                    </Row>

                                  );
                                })}

                              </Fragment>
                            ) : (
                              <Row>
                                <Cell
                                  colSpan={tableHead.length + 1}
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  No Data Found
                                </Cell>
                              </Row>
                            )
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={visibleColumns?.length + 2}
                                align="center"
                                sx={{ fontWeight: 600 }}
                              >
                                <Box className={classes.loaderWrap}>
                                  <CircularProgress />
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </PDFExport>
                  {/* ========== Pagination ========== */}
                  <Pagination
                    currentPage={currentPage}
                    pageSize={pageLimit}
                    onPageSizeChange={(size) => getExitPaperReceiving(1, size.target.value)}
                    tableCount={vehicleList?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getExitPaperReceiving(page, "")}
                  />

                </Fragment>
              )
            )}


            {loader && <CircleLoading />}

          </Box>}





        </Grid>
      </Box>

    </Box >
  );
}

export default ReceiveExitPaper;