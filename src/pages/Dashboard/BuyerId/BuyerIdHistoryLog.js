import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, Tooltip } from '@mui/material';
import styled from '@emotion/styled';
import { CheckIcon, FontFamily, PendingIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { Delete, Edit } from '@mui/icons-material';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';
import BuyerServices from 'services/Buyer';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import moment from 'moment';
import InputField from 'components/Input';
import SelectField from 'components/Select';
import { useForm } from 'react-hook-form';
import { Debounce, handleExportWithComponent } from 'utils';
import DatePicker from 'components/DatePicker';
import { PrimaryButton } from "components/Buttons";
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

function BuyerIdHistoryLog() {

  const classes = useStyles();
  const contentRef = useRef(null);
  const tableHead = ['Buyer ID', 'Date', 'Action', 'Customer', 'User']

  const [loader, setLoader] = useState(false);

  // *For Buyer ID History Log
  const [buyerIdHistoryLogs, setBuyerIdHistoryLogs] = useState();

  // *For Buyer ID
  const [buyerIds, setBuyerIds] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);

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

  // *For Get Buyer IDs
  const getBuyerIds = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await BuyerServices.getBuyerIds(params)
      setBuyerIds(data?.buyer_ids?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Buyer ID History Log
  const getBuyerIdHistoryLogs = async (page, limit, filter) => {
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
      const { data } = await BuyerServices.getBuyerIdHistoryLogs(params)
      setBuyerIdHistoryLogs(data?.logs?.rows)
      setTotalCount(data?.logs?.count)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getBuyerIdHistoryLogs(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Action");
    const rows = buyerIdHistoryLogs?.map((item) => [
      item?.buyer_id_name ?? '-',
      moment(item?.action_at).format('MM-DD-YYYY HH:mm a'),
      item?.action,
      item?.customer_name ?? '-',
      item?.action_by_name ?? '-'
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
    getBuyerIds()
    getBuyerIdHistoryLogs()
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
          Buyer ID History Logs
        </Typography>
        {buyerIdHistoryLogs?.length > 0 && (
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
              size='small'
              onSearch={(v) => getBuyerIds(v)}
              label={'Buyer ID'}
              options={buyerIds}
              selected={selectedBuyerId}
              onSelect={(value) => { setSelectedBuyerId(value); handleFilter({ buyer_ids: value?.id }) }}
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

        {buyerIdHistoryLogs ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Buyer ID History Logs' >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    BUyer Id History Log
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
                      buyerIdHistoryLogs?.length > 0 ? (
                        <Fragment>
                          {buyerIdHistoryLogs.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className='pdf-table' >
                                {item?.buyer_id_name ?? '-'}
                              </Cell>
                              <Cell className='pdf-table' >
                                {moment(item?.action_at).format('MM-DD-YYYY HH:mm a')}
                              </Cell>
                              <Cell className='pdf-table' >
                                <Box sx={{ display: 'flex', alignItems: 'center', 'path': { fill: item?.action === 'allocated' ? Colors.success : Colors.danger } }}>
                                  <span className='pdf-hide'> {item?.action == 'allocated' ? <CheckIcon /> : <PendingIcon />}</span>
                                  <Typography variant="body2">
                                    {item?.action ? item?.action : 'UnAllocated'}
                                  </Typography>
                                </Box>
                              </Cell>
                              <Cell className='pdf-table' >
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.customer_name ?? '-'}
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
                                  {item?.customer_name?.length > 15
                                    ? item?.customer_name?.slice(0, 10) + "..."
                                    : item?.customer_name
                                  }
                                </Tooltip>
                                <Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
                                  {item?.customer_name ?? '-'}
                                </Box>
                              </Cell>
                              <Cell className='pdf-table' >
                                <Tooltip
                                  className="pdf-hide"
                                  title={item?.action_by_name ?? '-'}
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
                                  {item?.action_by_name?.length > 15
                                    ? item?.action_by_name?.slice(0, 10) + "..."
                                    : item?.action_by_name
                                  }
                                </Tooltip>
                                <Box component={"div"} sx={{ display: "none !important" }} className="pdf-show">
                                  {item?.action_by_name ?? '-'}
                                </Box>
                                {/* {item?.action_by_name ?? '-'} */}
                              </Cell>
                            </Row>
                          ))}
                        </Fragment>
                      ) : (
                        <Row>
                          <Cell className='pdf-table' colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
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
              onPageSizeChange={(size) => getBuyerIdHistoryLogs(1, size.target.value)}
              tableCount={buyerIdHistoryLogs?.length}
              totalCount={totalCount}
              onPageChange={(page) => getBuyerIdHistoryLogs(page, '')}
            />

          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>
    </Box>
  );
}

export default BuyerIdHistoryLog;