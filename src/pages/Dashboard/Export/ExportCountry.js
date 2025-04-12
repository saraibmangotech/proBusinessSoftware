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
import { useForm, useFormState } from 'react-hook-form';
import { useDispatch } from "react-redux";
import { addPermission } from 'redux/slices/navigationDataSlice';
import ExportServices from 'services/Export';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from 'moment';
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

function ExportCountry() {

  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  const tableHead = ['Country']

  // *For Loading
  const [loader, setLoader] = useState(false);

  // *For Auction Houses
  const [auctionHouses, setAuctionHouses] = useState();

  //for Countries
  const [countries, setCountries] = useState([])
  const [originalCountries, setOriginalCountries] = useState([])

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // *For Permissions
  const [permissions, setPermissions] = useState();
  // *For Filters
  const [filters, setFilters] = useState({});

  const [countryDialog, setCountryDialog] = useState(false)

  // *For Get Auction Houses
  const getExportCountries = async (page, limit, filter) => {
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
      const { data } = await ExportServices.getExportCountries(params)
      setCountries(data?.countries)
      setOriginalCountries(data?.countries)

    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }
  const CreateExportCountry = async (name) => {
    try {
      let obj = {
        name: getValues('countryName'),

      };
      const { data } = await ExportServices.CreateExportCountry(obj);
      getExportCountries()
      setCountryDialog(false)
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Filter
  const handleFilter = (value) => {
    console.log(value, 'asdjkads');

    if (value) {
      const result = originalCountries.filter(item => {
        const nameMatches = item?.name && item.name.toLowerCase().includes(value.toLowerCase());
        return nameMatches;
      });
      setCountries(result)
    }
    else {
      setCountries(originalCountries)
    }
  }

  const downloadExcel = () => {
    const headers = tableHead;
    const rows = countries?.map((item) => [
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
    getExportCountries()
  }, []);

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      <SimpleDialog
        open={countryDialog}
        onClose={() => setCountryDialog(false)}
        title={"Add Country"}
      >
        <Box component="form" onSubmit={handleSubmit(CreateExportCountry)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InputField
                size={'small'}
                label={"Country Name"}
                placeholder={"Country Name"}
                multiline={true}
                error={errors?.comment?.message}
                register={register("countryName", {
                  required: "Please enter country name.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
          Export Countries
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            mr: 6
          }}
        >
          {countries?.length > 0 && (
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
          <PrimaryButton title="Add" onClick={() => setCountryDialog(true)} />
        </Box>
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
                onChange: (e) => handleFilter(e.target.value)
              })}
            />
          </Grid>
        </Grid>

        {countries ? (
          <Fragment>
            <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
              fileName="Export Countries"
            >
              <Box className='pdf-show' sx={{ display: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                    Export Countries
                  </Typography>
                  <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                </Box>
              </Box>
              {/* ========== Table ========== */}
              <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)', width: '70%', margin: '0 auto' }} className='table-box'>
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
                      countries?.length > 0 ? (
                        <Fragment>
                          {countries?.map((item, index) => (
                            <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                              <Cell className="pdf-table" >
                                {item?.name ?? '-'}
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
              {/* <Pagination
                currentPage={currentPage}
                pageSize={pageLimit}
                onPageSizeChange={(size) => getExportCountries(1, size.target.value)}
                tableCount={countries?.length}
                totalCount={totalCount}
                onPageChange={(page) => getExportCountries(page, '')}
              /> */}
            </Box>
          </Fragment>
        ) : (
          <CircleLoading />
        )}
      </Box>

    </Box>
  );
}

export default ExportCountry;