import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, CircularProgress, Grid, Tooltip } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import CurrencyServices from 'services/Currency';
import { makeStyles } from '@mui/styles';
import moment from 'moment/moment';
import SelectField from 'components/Select';
import DatePicker from 'components/DatePicker';
import { Debounce, handleExportWithComponent } from 'utils';
import Pagination from 'components/Pagination';
import { PDFExport } from '@progress/kendo-react-pdf';
import { PrimaryButton } from 'components/Buttons';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

function ExchangeRateLog() {

  const classes = useStyles();
  const contentRef = useRef()

  const tableHead = ['Currency', 'Exc.Rate', 'Date & Time', 'User']

  // *For Loading
  const [loader, setLoader] = useState(false);

  // *For Currencies
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // *For Currencies log
  const [currenciesLogs, setCurrenciesLogs] = useState();

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

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      const { data } = await CurrencyServices.getCurrencies()
      const currencyArray = []
      data?.currencies.forEach(e => {
        let obj = {
          id: e,
          name: e.toUpperCase()
        }
        currencyArray.push(obj)
      })
      setCurrencies(currencyArray)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Currencies Logs
  const getCurrenciesLogs = async (page, limit, filter) => {
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
      const { data } = await CurrencyServices.getCurrenciesLogs(params)
      setCurrenciesLogs(data?.logs?.rows)
      setTotalCount(data?.logs?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getCurrenciesLogs(1, '', data));
  }

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead;
    const data = currencies;
    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => [
      item?.currency?.toUpperCase() ?? '-',
      item?.exchange_rate ?? '-',
      moment(item?.updated_at).format('DD-MMM-YYYY HH:mm a'),
      item?.user?.name ?? "-"
    ]);

    // Create a workbook with a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Convert the workbook to an array buffer
    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file using FileSaver.js
    saveAs(new Blob([buf]), "data.xlsx");
  };

  useEffect(() => {
    getCurrencies()
    getCurrenciesLogs()
  }, []);

  return (
    <Box sx={{ m: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: "center",
          mr: 4,
          my: 4,
        }}
      >
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
          Exc Rate History
        </Typography>
        {currenciesLogs?.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <PrimaryButton
              title={"Download Excel"}
              onClick={() => downloadExcel()}
            />
            <PrimaryButton
              title="Download PDF"
              type="button"
              style={{ backgroundColor: Colors.bluishCyan }}
              onClick={() => handleExportWithComponent(contentRef)}
            />
          </Box>
        )}
      </Box>

      {/* Filters */}
      <Grid container spacing={1}>
        <Grid item xs={12} sm={3}>
          <SelectField
            size='small'
            label={'Currency'}
            options={currencies}
            selected={selectedCurrency}
            onSelect={(value) => { setSelectedCurrency(value); handleFilter({ currency: value?.id }) }}
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

      {currenciesLogs ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Exc Rate History"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Exc Rate History
                </Typography>
                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
              </Box>
            </Box>
            {/* ========== Table ========== */}
            <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 100px)' }} className='table-box'>
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
                    currenciesLogs?.length > 0 ? (
                      <Fragment>
                        {currenciesLogs.map((item, index) => (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell className='pdf-table'>
                              {item?.currency.toUpperCase() ?? '-'}
                            </Cell>
                            <Cell className='pdf-table'>
                              {item?.exchange_rate ?? '-'}
                            </Cell>
                            <Cell className='pdf-table'>
                              {moment(item?.updated_at).format('DD-MMM-YYYY HH:mm a')}
                            </Cell>
                            <Cell className='pdf-table'>
                              <Tooltip
                                className='pdf-hide'
                                title={item?.user?.name ?? "-"}
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
                                  item?.user?.name?.length > 12
                                    ? item?.user?.name?.slice(0, 8) + "..." : item?.user?.name
                                }
                              </Tooltip>
                              <Box
                                component={"div"}
                                className='pdf-show'
                                sx={{ display: "none !important" }}
                              >
                                {item?.user?.name ?? "-"}
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
            onPageSizeChange={(size) => getCurrenciesLogs(1, size.target.value)}
            tableCount={currenciesLogs?.length}
            totalCount={totalCount}
            onPageChange={(page) => getCurrenciesLogs(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default ExchangeRateLog;