import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Dialog, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, EyeIcon, FontFamily, InIcon, OutIcon, PendingIcon, SearchIcon, } from 'assets';
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
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import GatePassServices from 'services/GatePass';
import InOutStatusDialog from 'components/Dialog/InOutStatusDialog';
import SystemServices from 'services/System';
import SelectField from 'components/Select';
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

function GatePassYard() {

  const classes = useStyles();
  const contentRef = useRef(null);
  const tableHead = ['Date', 'C-ID', 'LOT', 'VIN', 'Buyer ID', 'Customer Name', 'Guard Name', 'Email', 'Yard', 'Gate Pass Status', 'Status']

  const { register, setValue } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Vehicle List
  const [vehicleList, setVehicleList] = useState();

  // *For Pass Id
  const [passId, setPassId] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);


  // *For Shipping Yards
  const [galaxyYards, setGalaxyYards] = useState([]);
  const [selectedGalaxyYard, setSelectedGalaxyYard] = useState(null);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Dialog Box
  const [inOutStatusDialog, setInOutStatusDialog] = useState(false);

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
      const { data } = await GatePassServices.getVehicleList(params)
      setVehicleList(data?.vehicles?.rows)
      setTotalCount(data?.vehicles?.count)

      setPermissions(formatPermissionData(data?.permissions))
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVehicleList(1, '', data));
  }


  // *For Create Galaxy Yards
  const createGalaxyYard = async (name) => {
    try {
      let obj = {
        name: name
      }
      const { data } = await SystemServices.createGalaxyYard(obj)
      getGalaxyYards()
      setSelectedGalaxyYard(data?.model)
      setValue('galaxyYard', data?.model?.name)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Galaxy Yards
  const getGalaxyYards = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getGalaxyYards(params)
      setGalaxyYards(data?.yards?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update In Out Status
  const updateInOutStatus = async (status) => {
    try {
      let obj = {
        pass_id: passId,
        is_out: status
      }
      const { message } = await GatePassServices.updateInOutStatus(obj)
      SuccessToaster(message)
      getVehicleList()
      setInOutStatusDialog(false)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Update Vehicle Status
  const handleUpdateStatus = (item) => {

    try {
      if (permissions?.update_status) {
        setInOutStatusDialog(true);
        setPassId(item?.gate_pass?.id)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = vehicleList?.map((item) => [
      item?.gate_pass?.out_date ? moment(item?.gate_pass?.out_date).format('MM-DD-YYYY') : '-',
      item?.booking?.customer?.id ?? '-',
      item?.booking?.lot_number ?? "-",
      item?.booking?.vin ?? "-",
      item?.booking?.buyer?.name ?? '-',
      item?.booking?.customer?.name ?? "-",
      item?.gate_pass?.guard?.name ?? "-",
      item?.booking?.customer?.email ?? "-",
      item?.g_yard?.name ?? '-',
      item?.gate_pass?.is_valid ? 'Valid' : 'InValid',
      item?.gate_pass?.is_out ? 'OUT' : 'IN'
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
    getVehicleList()
    getGalaxyYards()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>

      {/* ========== IN OUT Status Dialog ========== */}
      <InOutStatusDialog open={inOutStatusDialog} onClose={() => setInOutStatusDialog(false)} updateStatus={(status) => updateInOutStatus(status)} />
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
          Gate Pass Status
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
              size={"small"}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              placeholder={"Search"}
              register={register("Search", {
                onChange: (e) => handleFilter({ search: e.target.value }),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              size={'small'}
              addNew={(newValue) => createGalaxyYard(newValue)}
              onSearch={(v) => getGalaxyYards(v)}
              label={'Galaxy Yard'}
              options={galaxyYards}
              selected={selectedGalaxyYard}
              onSelect={(value) => {
                setSelectedGalaxyYard(value)
                handleFilter({ galaxy_yard: value?.id })
              }}
              register={register("galaxyYard")}
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

        {vehicleList ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
              fileName="Gate Pass Status"
            >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Gate Pass Status
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
                      vehicleList?.length > 0 ? (
                        <Fragment>
                          {vehicleList.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className='pdf-table'>
                                {item?.gate_pass?.out_date ? moment(item?.gate_pass?.out_date).format('MM-DD-YYYY') : '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.booking?.customer?.id ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.booking?.lot_number ?? "-"}
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
                                    item?.booking?.lot_number?.length > 12
                                      ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number
                                  }
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.booking?.lot_number ?? "-"}
                                  </Box>
                                </Tooltip>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.booking?.vin ?? "-"}
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
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.booking?.buyer?.name ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
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
                              </Cell>
                              <Cell className='pdf-table'>
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.gate_pass?.guard?.name ?? "-"}
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
                                    item?.gate_pass?.guard?.name?.length > 12
                                      ? item?.gate_pass?.guard?.name?.slice(0, 8) + "..." : item?.gate_pass?.guard?.name
                                  }
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.gate_pass?.guard?.name ?? "-"}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
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
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.booking?.customer?.email ?? "-"}
                                  </Box>
                                </Tooltip>
                              </Cell>
                              <Cell className='pdf-table'>
                                {item?.g_yard?.name ?? '-'}
                              </Cell>
                              <Cell className='pdf-table'>
                                <Box>
                                  <span className='pdf-hide'>  {item?.gate_pass?.is_valid ? <CheckIcon /> : <PendingIcon />}</span>
                                  <Typography variant="body2">
                                    {item?.gate_pass?.is_valid ? 'Valid' : 'InValid'}
                                  </Typography>
                                </Box>
                              </Cell>
                              <Cell className='pdf-table'>
                                <Box onClick={item?.gate_pass?.is_valid && !item?.gate_pass?.is_out ? () => handleUpdateStatus(item) : () => { }} sx={{ cursor: 'pointer' }}>
                                  <span className='pdf-hide'>   {item?.gate_pass?.is_out ? <OutIcon /> : <InIcon />} </span>
                                  <Typography variant="body2">
                                    {item?.gate_pass?.is_out ? 'OUT' : 'IN'}
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
            </PDFExport>
            {/* ========== Pagination ========== */}
            <Pagination
              currentPage={currentPage}
              pageSize={pageLimit}
              onPageSizeChange={(size) => getVehicleList(1, size.target.value)}
              tableCount={vehicleList?.length}
              totalCount={totalCount}
              onPageChange={(page) => getVehicleList(page, '')}
            />

          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>

    </Box >
  );
}

export default GatePassYard;