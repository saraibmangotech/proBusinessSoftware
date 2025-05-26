import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box, CircularProgress, Grid, Paper, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, ListItemText,
  InputLabel,
  FormControl,
  Checkbox,
  Select,
  MenuItem,
  Tooltip,
  InputAdornment
} from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, FontFamily, SearchIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import Pagination from 'components/Pagination';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Debounce, handleExportWithComponent } from 'utils';
import VccServices from 'services/Vcc';
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

function VccRefundedList() {

  const navigate = useNavigate();
  const classes = useStyles();
  const contentRef = useRef(null);
  const tableHead = ['Customer ID', 'Customer Name', 'VIN', 'LOT', 'Make', 'Modal', 'Color', 'VCC Declaration Number', 'VCC Declaration Date', 'VCC Expiry Date', 'VCC Deposit', 'Action',]

  const [visibleColumns, setVisibleColumns] = useState([...Array(tableHead?.length).keys()]);

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For VCC Refunded List
  const [vccDepositedList, setVccDepositedList] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

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
    }, 999999);
  }

  // *For Get VCC Refunded List
  const getVccDepositedList = async (page, limit, filter) => {
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
      const { data } = await VccServices.getVccDepositedList(params)
      setVccDepositedList(data?.vehicles?.rows)
      setTotalCount(data?.vehicles?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVccDepositedList(1, '', data));
  }
  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive,) => {

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
      case 8:
        return item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-';
      case 9:
        return item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-';
      case 10:
        return item?.vcc?.deposit?.amount ?? '-';
      case 11:
        return <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
          <Box onClick={() => navigate(`/vcc-deposited/${item?.vcc?.id}`)}>
            <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
              <EyeIcon />
            </IconButton>
            <Typography variant="body2">
              View
            </Typography>
          </Box>
        </Box>;
      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = vccDepositedList?.map((item) => [
      item?.booking?.customer?.id ?? '-',
      item?.booking?.customer?.name ?? "-",
      item?.booking?.vin ?? "-",
      item?.booking?.lot_number ?? "-",
      item?.booking?.veh_make?.name ?? "-",
      item?.booking?.veh_model?.name ?? "-",
      item?.booking?.color ?? '-',
      item?.vcc?.vcc_declaration ?? "-",
      item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-',
      item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-',
      item?.vcc?.deposit?.amount ?? '-'
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
    getVccDepositedList()
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
          VCC Deposited List
        </Typography>
        {vccDepositedList?.length > 0 && (
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
          {/* <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Container'}
            placeholder={'Container'}
            register={register('container', {
              onChange: (e) => handleFilter({ container: e.target.value })
            })}
          />
        </Grid> */}

        </Grid>


        <Grid item md={11}>
          {vccDepositedList && <Box>

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


                      if (column !== 'Action' && column !== 'Status') {
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
              vccDepositedList && (
                <Fragment>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                    fileName="VCC Deposited List"
                  >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          Vcc Deposit List
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
                            vccDepositedList?.length > 0 ? (
                              <Fragment>
                                {vccDepositedList?.map((item, rowIndex) => {

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
                    onPageSizeChange={(size) => getVccDepositedList(1, size.target.value)}
                    tableCount={vccDepositedList?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVccDepositedList(page, "")}
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

export default VccRefundedList;