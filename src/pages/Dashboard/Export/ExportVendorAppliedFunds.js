import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  tableCellClasses,
  CircularProgress,
  IconButton,
  Dialog,
  Tooltip,
} from "@mui/material";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { CheckIcon, EyeIcon, FontFamily, PendingIcon } from "assets";
import VendorServices from "services/Vendor";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import { CircleLoading } from "components/Loaders";
import Pagination from "components/Pagination";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import moment from "moment/moment";
import { useNavigate } from "react-router-dom";
import { CancelOutlined } from "@mui/icons-material";
import InputField from "components/Input";
import { Debounce, handleExportWithComponent } from "utils";
import DatePicker from "components/DatePicker";
import ExportServices from "services/Export";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";

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

function ExportVendorAppliedFunds() {
  const contentRef = useRef(null);
  const classes = useStyles();
  const navigate = useNavigate();

  const tableHead = [
    "Date",
    "VFA No",
    "Vendor ID",
    "Vendor Name",
    "Applied Amount",
    "Applied By",
    // "Action",
  ];

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Vendor Applied Fund 
  const [vendorAppliedFunds, setVendorAppliedFunds] = useState();

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

  // *For Get Vendor Fund Approval
  const getVendorAppliedFunds = async (page, limit, filter) => {
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
      const { data } = await ExportServices.getVendorAppliedFunds(params)
      setVendorAppliedFunds(data?.funds?.rows)
      setTotalCount(data?.funds?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVendorAppliedFunds(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = vendorAppliedFunds?.map((item) => [
      moment(item?.created_at).format('MM-DD-YYYY'),
      `${item?.vfa_no}-${item?.id}`,
      item?.vendor_id ?? '-',
      item?.vendor?.name ?? '-',
      item?.tt_details?.paid_amount ?? '-',
      item?.creator?.name ?? '-'
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
    getVendorAppliedFunds()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mr: 6,
          mb: 4,
        }}
      >
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
          Export Vendor Applied Funds
        </Typography>
        {vendorAppliedFunds?.length > 0 && (
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
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <InputField
            size={'small'}
            label={'Search'}
            placeholder={'Search'}
            register={register('search', {
              onChange: (e) => handleFilter({ search: e.target.value })
            })}
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
            disableFuture={true}
            size='small'
            minDate={fromDate}
            label={'To Date'}
            value={toDate}
            onChange={(date) => handleToDate(date)}
          />
        </Grid>
      </Grid>

      {loader ? (
        <CircleLoading />
      ) : (
        vendorAppliedFunds && (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
              fileName="Export Vendor Applied Funds"
            >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Export Vendor Applied Funds
                  </Typography>
                  <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                </Box>
              </Box>
              {/* ========== Table ========== */}
              <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }} className="table-box">
                <Table stickyHeader sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      {tableHead.map((item, index) => (
                        <Cell className="pdf-table" key={index}>{item}</Cell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!loader ? (
                      vendorAppliedFunds?.length > 0 ? (
                        <Fragment>
                          {vendorAppliedFunds.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className="pdf-table">
                                {moment(item?.created_at).format('MM-DD-YYYY')}
                              </Cell>
                              <Cell className="pdf-table">
                                {`${item?.vfa_no}-${item?.id}`}
                              </Cell>
                              <Cell className="pdf-table">
                                {item?.vendor_id ?? '-'}
                              </Cell>
                              <Cell className="pdf-table">
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.vendor?.name ?? "-"}
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
                                    item?.vendor?.name?.length > 12
                                      ? item?.vendor?.name?.slice(0, 8) + "..."
                                      : item?.vendor?.name
                                  }
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.vendor?.name ?? "-"}
                                </Box>
                                {/* {item?.vendor?.name ?? '-'} */}
                              </Cell>
                              <Cell className="pdf-table">
                                {item?.tt_details?.paid_amount ?? '-'}
                              </Cell>
                              <Cell className="pdf-table">
                                <Tooltip
                                  className='pdf-hide'
                                  title={item?.creator?.name ?? "-"}
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
                                    item?.creator?.name?.length > 12
                                      ? item?.creator?.name?.slice(0, 8) + "..."
                                      : item?.creator?.name
                                  }
                                </Tooltip>
                                <Box
                                  component={"div"}
                                  className='pdf-show'
                                  sx={{ display: "none !important" }}
                                >
                                  {item?.creator?.name ?? "-"}
                                </Box>
                                {/* {item?.creator?.name ?? '-'} */}
                              </Cell>
                              {/* <Cell>
                              <Box sx={{ gap: '16px !important' }}>
                                <Box>
                                  <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                    <EyeIcon />
                                  </IconButton>
                                  <Typography variant="body2">
                                    View Detail
                                  </Typography>
                                </Box>
                              </Box>
                            </Cell> */}
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
              onPageSizeChange={(size) => getVendorAppliedFunds(1, size.target.value)}
              tableCount={vendorAppliedFunds?.length}
              totalCount={totalCount}
              onPageChange={(page) => getVendorAppliedFunds(page, '')}
            />

          </Fragment>
        )
      )}

    </Box>
  );
}

export default ExportVendorAppliedFunds;
