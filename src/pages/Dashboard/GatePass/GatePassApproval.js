import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses,
  FormControl,
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
import { CheckIcon, FontFamily, PendingIcon, SearchIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import GatePassServices from 'services/GatePass';
import GatePassApproveRejectStatusDialog from 'components/Dialog/GatePassApproveRejectStatusDialog';
import moment from 'moment';
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

function GatePassApproval() {

  const classes = useStyles();
  const contentRef = useRef(null);

  const tableHead = ['VCC Serial Number', 'Customer ID', 'Customer Name', 'VIN', 'LOT', 'Buyer ID', 'VCC Declaration Number', 'VCC Date', 'VCC Expiry Date', 'Time Left', 'Email', 'Status']

  const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Vehicle List
  const [vehicleList, setVehicleList] = useState();

  // *For Pass Id
  const [passId, setPassId] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Dialog Box
  const [approveRejectStatusDialog, setApproveRejectStatusDialog] = useState(false);

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
      const { data: { vehicles } } = await GatePassServices.getVehicleList(params)
      setVehicleList(vehicles?.rows)
      setTotalCount(vehicles?.count)
      setPermissions(formatPermissionData(vehicles?.permissions))
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Dialog
  const handleDialog = (data) => {
    try {
      if (data?.arrived_galaxy_date === null || data?.arrived_galaxy_date >= moment().format()) {
        ErrorToaster('Vehicle is not arrived yet.')
        return
      }
      if (data?.gate_pass?.is_approved === null) {
        setApproveRejectStatusDialog(true)
        setPassId(data?.gate_pass?.id)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Approve Reject Status
  const approveStatus = async (status) => {
    try {
      let obj = {
        pass_id: passId,
        approve: status
      }
      const { message } = await GatePassServices.approveStatus(obj)
      SuccessToaster(message)
      getVehicleList()
      setApproveRejectStatusDialog(false)
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
        return item?.vcc?.id ?? '-';
      case 1:
        return item?.booking?.customer?.id ?? '-';

      case 2:
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
      case 3:
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
      case 4:
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
      case 5:
        return item?.booking?.buyer?.name ?? '-';
      case 6:
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
      // item?.vcc?.vcc_declaration ?? '-';
      case 7:
        return item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-';
      case 8:
        return item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-';

      case 9:
        return item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : '-';
      case 10:
        return (
          <Box>
            <Tooltip
              className='pdf-hide'
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
                item?.booking?.customer?.email?.length > 12
                  ? item?.booking?.customer?.email?.slice(0, 8) + "..." : item?.booking?.customer?.email
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.customer?.email ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.customer?.email ?? '-';
      case 11:
        return <Box onClick={() => handleDialog(item)} sx={{ cursor: 'pointer', 'path': { fill: item?.gate_pass?.is_approved ? '' : Colors.danger } }}>
          <span className='pdf-hide'>  {item?.gate_pass?.is_approved ? <CheckIcon /> : <PendingIcon />} </span>
          <Typography variant="body2">
            {item?.gate_pass === null ? 'Request for Approval' : item?.gate_pass?.is_approved === null ? 'Pending' : item?.gate_pass?.is_approved ? 'Approved' : 'Rejected'}
          </Typography>
        </Box>;

      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = vehicleList?.map((item) => {
      const date = moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY');
      const targetDate = moment(date, 'MM-DD-YYYY');
      let daysRemaining = targetDate.diff(moment(), 'days');
      if (daysRemaining < 0) {
        daysRemaining = 0
      }
      return [
        item?.vcc?.id ?? '-',
        item?.booking?.customer?.id ?? '-',
        item?.booking?.customer?.name ?? "-",
        item?.booking?.vin ?? "-",
        item?.booking?.lot_number ?? "-",
        item?.booking?.buyer?.name ?? '-',
        item?.vcc?.vcc_declaration ?? "-",
        item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-',
        item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-',
        item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : '-',
        item?.booking?.customer?.email ?? "-",
        item?.gate_pass === null ? 'Request for Approval' : item?.gate_pass?.is_approved === null ? 'Pending' : item?.gate_pass?.is_approved ? 'Approved' : 'Rejected'
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

      {/* ========== Approve Reject Dialog ========== */}
      <GatePassApproveRejectStatusDialog open={approveRejectStatusDialog} onClose={() => setApproveRejectStatusDialog(false)} updateStatus={(status) => approveStatus(status)} />
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
          GP Approvals
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
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                    fileName="GP Approvals"
                  >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          GP Approvals
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
                                className='pdf-table '
                                key={index}

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
                                        <Cell className='pdf-table ' key={colIndex}>
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

export default GatePassApproval;