import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box, CircularProgress, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, FormControl,
  Checkbox,
  Select,
  MenuItem,
  ListItemText,
  InputLabel,
  Tooltip,
  InputAdornment
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CashIcon, CheckIcon, CreateIcon, EyeIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import GatePassServices from 'services/GatePass';
import RequestApprovalStatusDialog from 'components/Dialog/RequestApprovalStatusDialog';
import moment from 'moment';
import { addPermission } from 'redux/slices/navigationDataSlice';
import { useDispatch } from "react-redux";
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
      justifyContent: 'flex-start',
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

function IssueGatePass() {

  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);


  const tableHead = ['Create Date', 'Type', 'ID', 'VCC Serial Number', 'Customer ID', 'Customer Name', 'VIN', 'LOT', 'Container', 'Buyer ID', 'VCC Declaration Number', 'Receiver', 'Receiver Phone', 'E-ID', 'VCC Date', 'VCC Expiry Date', 'Time Left', 'Email', 'Status', 'Payment Status', 'Action']

  const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Vehicle List
  const [vehicleList, setVehicleList] = useState();

  // *For Vehicle Id
  const [vehicleId, setVehicleId] = useState();

  // *For Booking Id
  const [bookingId, setBookingId] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 300);
  }

  // *For Dialog Box
  const [requestApprovalStatusDialog, setRequestApprovalStatusDialog] = useState(false);

  // *For Get Vehicle List
  const getVehicleList = async (page, limit, filter) => {
    // setLoader(true)
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
      const { data: { vehicles, permissions } } = await GatePassServices.getVehicleList(params)
      setVehicleList(vehicles?.rows)
      setTotalCount(vehicles?.count)
      setPermissions(formatPermissionData(permissions))
      permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Dialog
  const handleDialog = (data) => {

    try {
      if (data?.arrived_galaxy_date === null) {
        ErrorToaster('Vehicle is not arrived yet.')
        return
      }
      if (permissions?.request && data?.gate_pass === null) {
        setRequestApprovalStatusDialog(true)
        setVehicleId(data?.id)
        setBookingId(data?.booking_id)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Request Gate Pass
  const requestGatePass = async () => {

    try {
      let obj = {
        vehicle_id: vehicleId,
        booking_id: bookingId,
      }
      const { message } = await GatePassServices.requestGatePass(obj)
      SuccessToaster(message)
      getVehicleList()
      setRequestApprovalStatusDialog(false)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVehicleList(1, '', data));
  }


  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive,) => {

    const date = moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY');
    const targetDate = moment(date, 'MM-DD-YYYY');
    let daysRemaining = targetDate.diff(moment(), 'days');
    if (daysRemaining < 0) {
      daysRemaining = 0
    }

    switch (colIndex) {
      case 0:
        return item?.gate_pass?.createdAt ? moment(item?.gate_pass?.createdAt).format('MM-DD-YYYY') : '-';
      case 1:
        return item?.gate_pass?.is_online ? "Online Generated" : "System Generated" ?? '-';
      case 2:
        return item?.gate_pass ? "GP-" + item?.gate_pass?.id : '-' ?? '-';
      case 3:
        return item?.vcc?.id ?? '-';
      case 4:
        return item?.booking?.customer?.id ?? '-';
      case 5:
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

      case 6:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={copied ? "copied" : item?.booking?.vin ?? "-"}
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
      case 7:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={copied ? "copied" : item?.booking?.lot_number ?? "-"}
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
      case 8:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={item?.container_no ?? "-" ?? "-"}
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
                item?.container_no ?? "-"?.length > 12
                  ? item?.container_no ?? "-"?.slice(0, 8) + "..." : item?.container_no ?? "-"
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.container_no ?? "-" ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.lot_number ?? '-';
      case 9:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={item?.booking?.buyer?.name ?? "-"}
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
                item?.booking?.buyer?.name?.length > 12
                  ? item?.booking?.buyer?.name?.slice(0, 8) + "..." : item?.booking?.buyer?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.buyer?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.buyer?.name ?? '-';
      case 10:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
              title={item?.vcc?.vcc_declaration ?? "-"}
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
                item?.vcc?.vcc_declaration?.length > 12
                  ? item?.vcc?.vcc_declaration?.slice(0, 8) + "..." : item?.vcc?.vcc_declaration
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.vcc?.vcc_declaration ?? "-"}
            </Box>
          </Box>
        )
      case 11:
        return item?.gate_pass?.vehicle_receiver ?? '-'
      case 12:
        return item?.gate_pass?.receiver_phone ?? '-'
      case 13:
        return item?.gate_pass?.eid_doc ?
          <Box component={'a'} target='_blank'
            href={process.env.REACT_APP_IMAGE_BASE_URL + "/" + item?.gate_pass?.eid_doc}
            sx={{ textDecoration: 'underline', color: 'blue', textAlign: 'center' }}
          >
            {item?.gate_pass?.eid_number ?? "-"}
          </Box> :
          <Box sx={{ textAlign: 'center' }}>
            {item?.gate_pass?.eid_number ?? "-"}
          </Box>

      case 14:
        return item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-';
      case 15:
        return item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-';
      case 16:
        return item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : '-';

      case 17:
        return (
          <Tooltip
            title={item?.booking?.customer?.email ?? "-"}
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
              item?.booking?.customer?.email?.length > 22
                ? item?.booking?.customer?.email?.slice(0, 16) + "..." : item?.booking?.customer?.email
            }
          </Tooltip>
        )
      // item?.booking?.customer?.email ?? '-';
      case 18:
        return <Box onClick={() => handleDialog(item)} sx={{ cursor: 'pointer', 'path': { fill: item?.booking?.customer?.customerProfile?.is_trusted ? Colors.bluishCyan : item?.gate_pass?.is_approved ? '' : Colors.danger, display: 'flex', justifyContent: "center" } }}>
          <span className='pdf-hide'>    {item?.booking?.customer?.customerProfile?.is_trusted ? <CheckIcon /> : item?.gate_pass?.is_approved ? <CheckIcon /> : <PendingIcon />}</span>
          <Typography variant="body2">
            {item?.booking?.customer?.customerProfile?.is_trusted ? 'Trusted Customer' : item?.gate_pass === null ? 'Request for Approval' : item?.gate_pass?.is_approved === null ? 'Pending' : item?.gate_pass?.is_approved ? 'Approved' : 'Rejected'}
          </Typography>
        </Box>;
      case 19:
        return <Box sx={{ cursor: 'pointer', 'path': { fill: item?.gate_pass?.is_paid ? '' : Colors.danger }, display: 'flex', justifyContent: "center" }}>
          <span className='pdf-hide'> {item?.gate_pass ? item?.gate_pass?.is_paid ? <CheckIcon /> : <PendingIcon /> : ''}</span>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {item?.gate_pass?.is_paid ? "Paid" : item?.gate_pass ? "Unpaid" : " "}
          </Typography>
        </Box>;
      case 20:
        return <Cell sx={{ bgcolor: item?.gate_pass?.is_valid === false ? Colors.danger + '33' : item?.gate_pass?.is_paid === false ? Colors.yellow + '' : '', border: 'none !important', width: '200px' }}> <Box sx={{ gap: '16px !important' }}>
          {((permissions?.create && item?.booking?.customer?.customerProfile?.is_trusted && !item?.gate_pass) || (item?.gate_pass?.is_approved && item?.gate_pass?.is_paid === null && item?.gate_pass?.is_valid === null && item?.gate_pass?.total_due === null && item?.gate_pass?.is_out !== true)) &&
            <Box component={'div'} className='pdf-hide' onClick={() => navigate(`/create-gate-pass/${item.id}`)}>
              <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                <CreateIcon />
              </IconButton>
              <Typography variant="body2">
                Create
              </Typography>
            </Box>
          }
          {(permissions?.recreate && item?.gate_pass?.is_valid === false && item?.gate_pass?.total_due !== null && item?.gate_pass?.is_out !== true) &&
            <Box component={'div'} className='pdf-hide' onClick={() => navigate(`/recreate-gate-pass/${item.id}`, { state: { recreate: true } })}>
              <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                <CreateIcon />
              </IconButton>
              <Typography variant="body2">
                ReCreate
              </Typography>
            </Box>
          }
          {permissions?.view && item?.gate_pass?.total_due &&
            <Box component={'div'} className='pdf-hide' onClick={() => navigate(`/gate-pass/${item.id}`)}>
              <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                <EyeIcon />
              </IconButton>
              <Typography variant="body2">
                View
              </Typography>
            </Box>
          }
          {permissions?.payment && item?.gate_pass?.total_due && !item?.gate_pass?.is_paid &&
            <Box component={'div'} className='pdf-hide' onClick={() => navigate(`/gate-pass/${item.id}`, { state: 'payment' })}>
              <IconButton sx={{ bgcolor: Colors.smokeyGrey, '&:hover': { bgcolor: Colors.smokeyGrey } }}>
                <CashIcon />
              </IconButton>
              <Typography variant="body2">
                Payment
              </Typography>
            </Box>
          }
        </Box> </Cell>;
      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vehicleList?.map((item) => {
      const date = moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY');
      const targetDate = moment(date, 'MM-DD-YYYY');
      let daysRemaining = targetDate.diff(moment(), 'days');
      if (daysRemaining < 0) {
        daysRemaining = 0
      }
      return [
        item?.gate_pass?.createdAt ? moment(item?.gate_pass?.createdAt).format('MM-DD-YYYY') : '-',
        item?.gate_pass?.is_online ? "Online Generated" : "System Generated" ?? '-',
        item?.gate_pass ? "GP-" + item?.gate_pass?.id : '-' ?? '-',
        item?.vcc?.id ?? '-',
        item?.booking?.customer?.id ?? '-',
        item?.booking?.customer?.name ?? "-",
        item?.booking?.vin ?? "-",
        item?.booking?.lot_number ?? "-",
        item?.container_no ?? "-",
        item?.booking?.buyer?.name ?? "-",
        item?.vcc?.vcc_declaration ?? "-",
        item?.gate_pass?.vehicle_receiver ?? '-',
        item?.gate_pass?.receiver_phone ?? '-',
        item?.gate_pass?.eid_number ?? "-",
        item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-',
        item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-',
        item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : '-',
        item?.booking?.customer?.email ?? "-",
        item?.booking?.customer?.customerProfile?.is_trusted ? 'Trusted Customer' : item?.gate_pass === null ? 'Request for Approval' : item?.gate_pass?.is_approved === null ? 'Pending' : item?.gate_pass?.is_approved ? 'Approved' : 'Rejected',
        item?.gate_pass?.is_paid ? "Paid" : item?.gate_pass ? "Unpaid" : " ",
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
    getVehicleList()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      {/* ========== Request Approval Dialog ========== */}
      <RequestApprovalStatusDialog open={requestApprovalStatusDialog} onClose={() => setRequestApprovalStatusDialog(false)} updateStatus={() => requestGatePass()} />
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
          Gate Pass
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'VIN'}
              placeholder={'VIN'}
              register={register('vin', {
                onChange: (e) => handleFilter({ vin: e.target.value })
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={'small'}
              label={'LOT'}
              placeholder={'LOT'}
              register={register('lot', {
                onChange: (e) => handleFilter({ lot: e.target.value })
              })}
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
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="Gate Pass" >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          Gate Pass
                        </Typography>
                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                      </Box>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}
                      className='table-box'
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        {/* Table Header */}
                        <TableHead>
                          <TableRow>
                            {visibleColumns.map((index) => (
                              <Cell
                                key={index}
                                className='pdf-table2'
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
                                        <Cell className='pdf-table2' key={colIndex}>
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
                    onPageSizeChange={(size) => getVehicleList(1, size.target.value)}
                    tableCount={vehicleList?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVehicleList(page, "")}
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

export default IssueGatePass;