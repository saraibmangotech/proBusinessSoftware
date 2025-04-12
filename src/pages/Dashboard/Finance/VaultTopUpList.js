import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, Grid, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Tooltip, InputAdornment } from '@mui/material';
import styled from '@emotion/styled';
import { EyeIcon, FontFamily, SearchIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useNavigate } from 'react-router-dom';
import FinanceServices from 'services/Finance';
import { useDispatch } from "react-redux";
import { formatPermissionData, handleExportWithComponent } from 'utils';
import { addPermission } from 'redux/slices/navigationDataSlice';
import { useForm } from "react-hook-form";
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { Edit } from '@mui/icons-material';
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

function VaultTopUpList() {

  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef()

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const tableHead = ['Date', 'Receipt Voucher #', 'Received By', 'C-ID', 'Customer Name', 'Total AED', 'Total USD', 'Unit', 'Payment Type', 'Remark', 'User', 'Actions']

  const [loader, setLoader] = useState(false);

  // *For Vault Top Up
  const [vaultTopUps, setVaultTopUps] = useState();

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Get Vault TopUp
  const getVaultTopUps = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page)
      setPageLimit(Limit)
      let params = {
        page: Page,
        limit: Limit,
        search: getValues('search')
      }
      params = { ...params, ...Filter };
      const { data } = await FinanceServices.getVaultTopUps(params)
      setVaultTopUps(data?.topups?.rows)
      setTotalCount(data?.topups?.count)
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach((e) => {
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

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let data = {
        to_date: moment(new Date(toDate)).format('MM-DD-YYYY') != "Invalid date" ? moment(new Date(toDate)).format('MM-DD-YYYY') : null,
        from_date: moment(new Date(fromDate)).format('MM-DD-YYYY') != "Invalid date" ? moment(new Date(fromDate)).format('MM-DD-YYYY') : null,
      };


      getVaultTopUps(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Actions");
    const rows = vaultTopUps?.map((item) => [
      item?.created_at ? moment(item?.created_at).format("MM-DD-YYYY") : "-",
      `GRV ${item?.id ?? '-'}`,
      item?.received_by ?? "-",
      item?.receiver?.id ?? '-',
      item?.receiver?.name ?? "-",
      parseFloat(item?.total_amount_aed)?.toFixed(2),
      parseFloat(item?.total_amount_usd)?.toFixed(2),
      item?.unit ?? '-',
      item?.payment_medium ?? '-',
      item?.remarks ?? "-",
      item?.creator?.name ?? "-",
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
    getVaultTopUps()
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
          Top Up List
        </Typography>
        {vaultTopUps?.length > 0 && (
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
      <Box
        component={"form"}
        onSubmit={handleSubmit(applyFilter)}
        sx={{
          m: "20px 0 20px 5px",


        }}
      >
        <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
          <Grid container spacing={2} alignItems={"center"} columns={10}>

            <Grid item md={2} mt={1}>
              <InputField
                size="small"
                inputStyle={{ backgroundColor: '#f5f5f5' }}
                label={'Search'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                placeholder={"Search"}
                register={register("search")}
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
            <Grid item xs={12} md={2} sx={{ height: "55px" }}>
              <Box
                sx={{
                  mt: "11px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <PrimaryButton type={"submit"} title={"Search"} />
              </Box>
            </Grid>
          </Grid>


          {vaultTopUps ? (
            <Fragment>
              <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
                fileName="Top Up List"
              >
                <Box className='pdf-show' sx={{ display: 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                      Top Up List
                    </Typography>
                    <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                  </Box>
                </Box>
                {/* ========== Table ========== */}
                <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(77vh - 190px)' }} className='table-box'>
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
                        vaultTopUps?.length > 0 ? (
                          <Fragment>
                            {vaultTopUps.map((item, index) => (
                              <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                <Cell className='pdf-table'>
                                  {item?.created_at
                                    ? moment(item?.created_at).format(
                                      "MM-DD-YYYY"
                                    )
                                    : "-"}
                                </Cell>
                                <Cell className='pdf-table'>
                                  GRV{item?.id ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  <Tooltip
                                    className='pdf-hide'
                                    title={item?.received_by ?? "-"}
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
                                      item?.received_by?.length > 12
                                        ? item?.received_by?.slice(0, 8) + "..." : item?.received_by
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.received_by ?? "-"}
                                  </Box>
                                </Cell>
                                <Cell className='pdf-table'>
                                  {item?.receiver?.id ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  <Tooltip
                                    className='pdf-hide'
                                    title={item?.receiver?.name ?? "-"}
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
                                      item?.receiver?.name?.length > 12
                                        ? item?.receiver?.name?.slice(0, 8) + "..." : item?.receiver?.name
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.receiver?.name ?? "-"}
                                  </Box>
                                </Cell>
                                <Cell className='pdf-table'>
                                  {parseFloat(item?.total_amount_aed)?.toFixed(2)}
                                </Cell>
                                <Cell className='pdf-table'>
                                  {parseFloat(item?.total_amount_usd)?.toFixed(2)}
                                </Cell>
                                <Cell className='pdf-table'>
                                  {item?.unit ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  {item?.payment_medium ?? '-'}
                                </Cell>
                                <Cell className='pdf-table'>
                                  <Tooltip
                                    className='pdf-hide'
                                    title={item?.remarks ?? "-"}
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
                                      item?.remarks?.length > 12
                                        ? item?.remarks?.slice(0, 8) + "..." : item?.remarks
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.remarks ?? "-"}
                                  </Box>
                                </Cell>
                                <Cell className='pdf-table'>
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
                                        ? item?.creator?.name?.slice(0, 8) + "..." : item?.creator?.name
                                    }
                                  </Tooltip>
                                  <Box
                                    component={"div"}
                                    className='pdf-show'
                                    sx={{ display: "none !important" }}
                                  >
                                    {item?.creator?.name ?? "-"}
                                  </Box>
                                </Cell >
                                <Cell className='pdf-table' sx={{ display: 'flex', gap: 2 }}>

                                  <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                    <Box onClick={() => navigate(`/view-vault-top-up/${item?.id}`, { state: { shipping: true } })}>
                                      <IconButton sx={{ bgcolor: Colors.primary, '&:hover': { bgcolor: Colors.primary } }}>
                                        <EyeIcon />
                                      </IconButton>
                                      <Typography variant="body2">
                                        View
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box component={'div'} className='pdf-hide' onClick={() => navigate(`/update-vault-top-up/${item.id}`)}>
                                    <IconButton sx={{ bgcolor: Colors.bluishCyan, '&:hover': { bgcolor: Colors.bluishCyan } }}>
                                      <Edit sx={{ color: Colors.white, height: '16px !important' }} />
                                    </IconButton>
                                    <Typography variant="body2">
                                      Edit
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
                onPageSizeChange={(size) => getVaultTopUps(1, size.target.value)}
                tableCount={vaultTopUps?.length}
                totalCount={totalCount}
                onPageChange={(page) => getVaultTopUps(page, '')}
              />

            </Fragment>
          ) : (
            <CircleLoading />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default VaultTopUpList;