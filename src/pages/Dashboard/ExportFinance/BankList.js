import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { Edit } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import Pagination from 'components/Pagination';
import { useNavigate } from 'react-router-dom';
import ExportFinanceServices from 'services/ExportFinance';
import { PrimaryButton, SwitchButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import { useDispatch } from "react-redux";
import { addPermission } from 'redux/slices/navigationDataSlice';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';

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

function BankList() {

  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const tableHead = ['Banks Name', 'Title', 'Account Number', 'IBN', 'Currency', 'Country', 'Status', 'Actions']

  const { register } = useForm();

  const [loader, setLoader] = useState(false);

  // *For Banks
  const [banks, setBanks] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Get Banks
  const getBanks = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      let params = {
        page: Page,
        limit: Limit
      }
      params = { ...params, ...Filter }
      const { data } = await ExportFinanceServices.getBanks(params)
      setBanks(data?.banks?.rows)
      setTotalCount(data?.banks?.count)
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

  // *For Update Bank Status
  const updateBankStatus = async (id, status) => {
    console.log(id, status);
    try {
      let obj = {
        id: id,
        is_active: status
      }
      const { message } = await ExportFinanceServices.updateBank(obj)
      SuccessToaster(message)
      getBanks()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getBanks(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Status" && item !== "Actions");
    const rows = banks?.map((item) => [
      item?.name ?? '-',
      item?.account_title ?? '-',
      item?.account_number ?? '-',
      item?.account_ibn ?? '-',
      item?.currency?.toUpperCase(),
      item?.country_name
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
    getBanks()
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
          Bank List
        </Typography>
        {banks?.length > 0 && (
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
      <Grid container spacing={1} columns={15}>
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
      </Grid>

      {banks ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName="Bank List"
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Bank List
                </Typography>
                <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
              </Box>
            </Box>
            {/* ========== Table ========== */}
            <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 190px)' }} className='table-box'>
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
                    banks?.length > 0 ? (
                      <Fragment>
                        {banks.map((item, index) => (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell className="pdf-table" >
                              {item?.name ?? '-'}
                            </Cell>
                            <Cell className="pdf-table" >
                              {item?.account_title ?? '-'}
                            </Cell>
                            <Cell className="pdf-table" >
                              {item?.account_number ?? '-'}
                            </Cell>
                            <Cell className="pdf-table" >
                              {item?.account_ibn ?? '-'}
                            </Cell>
                            <Cell className="pdf-table" >
                              {item?.currency?.toUpperCase()}
                            </Cell>
                            <Cell className="pdf-table" >
                              {item?.country_name}
                            </Cell>
                            <Cell className="pdf-table" >
                              <Box component={'div'} className='pdf-hide'>
                                <SwitchButton

                                  isChecked={item?.is_active}
                                  setIsChecked={() => permissions?.update_status && updateBankStatus(item.id, !item?.is_active)}
                                />

                              </Box>
                              <Box component={'div'} className='pdf-show' sx={{ display: 'none !important' }} >
                                {item?.is_active ? 'Enable' : "Disabled"}
                              </Box>
                            </Cell>
                            <Cell >
                              <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                {true &&
                                  <Box onClick={() => navigate('/update-bank-export', { state: item })}>
                                    <IconButton sx={{ bgcolor: Colors.bluishCyan, '&:hover': { bgcolor: Colors.bluishCyan } }}>
                                      <Edit sx={{ color: Colors.white, height: '16px !important' }} />
                                    </IconButton>
                                    <Typography variant="body2">
                                      Edit
                                    </Typography>
                                  </Box>
                                }
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
            onPageSizeChange={(size) => getBanks(1, size.target.value)}
            tableCount={banks?.length}
            totalCount={totalCount}
            onPageChange={(page) => getBanks(page, '')}
          />

        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default BankList;