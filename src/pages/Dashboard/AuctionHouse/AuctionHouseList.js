import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Paper, Table, TableBody, Grid, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, InputAdornment } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily, SearchIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import { Edit } from '@mui/icons-material';
import AuctionHouseServices from 'services/AuctionHouse';
import Pagination from 'components/Pagination';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { Debounce, formatPermissionData, handleExportWithComponent } from 'utils';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import { useDispatch } from "react-redux";
import { addPermission } from 'redux/slices/navigationDataSlice';
import { PrimaryButton } from "components/Buttons";
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

function AuctionHouseList() {

  const classes = useStyles();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const dispatch = useDispatch();

  const { register } = useForm();

  const tableHead = ['Auction House', 'Actions']

  // *For Loading
  const [loader, setLoader] = useState(false);

  // *For Auction Houses
  const [auctionHouses, setAuctionHouses] = useState();

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();
  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Get Auction Houses
  const getAuctionHouses = async (page, limit, filter) => {
    setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page)
      setPageLimit(Limit)
      let params = {
        page: Page,
        limit: Limit
      }
      params = { ...params, ...Filter };
      const { data } = await AuctionHouseServices.getAuctionHouses(params)
      setAuctionHouses(data?.auction_houses?.rows)
      setTotalCount(data?.auction_houses?.count)
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach((e) => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      });
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getAuctionHouses(1, '', data));
  }

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Actions");
    const rows = auctionHouses?.map((item) => [
      item?.name ?? '-'
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
    getAuctionHouses()
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
          Auction House List
        </Typography>
        {auctionHouses?.length > 0 && (
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
            <InputField
              size={'small'}
              placeholder={'Search'}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              register={register('search', {
                onChange: (e) => handleFilter({ search: e.target.value })
              })}
            />
          </Grid>
        </Grid>

        {auctionHouses ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName='Auction House List' >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Auction House List
                  </Typography>
                  <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                </Box>
              </Box>
              {/* ========== Table ========== */}
              <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)', width: '70%', margin: '0 auto' }}>
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
                      auctionHouses?.length > 0 ? (
                        <Fragment>
                          {auctionHouses.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className='pdf-table' >
                                {item?.name ?? '-'}
                              </Cell>
                              <Cell >
                                <Box component={'div'} className='pdf-hide' sx={{ gap: '16px !important' }}>
                                  {permissions?.update &&
                                    <Box onClick={() => navigate('/update-auction-house', { state: item })}>
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
            <Box sx={{ width: '70%', margin: '0 auto' }}>
              <Pagination
                currentPage={currentPage}
                pageSize={pageLimit}
                onPageSizeChange={(size) => getAuctionHouses(1, size.target.value)}
                tableCount={auctionHouses?.length}
                totalCount={totalCount}
                onPageChange={(page) => getAuctionHouses(page, '')}
              />
            </Box>
          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>

    </Box>
  );
}

export default AuctionHouseList;