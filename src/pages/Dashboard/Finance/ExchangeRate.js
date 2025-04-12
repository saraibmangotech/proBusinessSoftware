import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { CircleLoading } from 'components/Loaders';
import { ErrorToaster } from 'components/Toaster';
import CurrencyServices from 'services/Currency';
import { makeStyles } from '@mui/styles';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import { PrimaryButton } from 'components/Buttons';
import { useDispatch } from 'react-redux';
import { setAedExchangeRate, setCadExchangeRate, setUsdExchangeRate } from 'redux/slices/navigationDataSlice';
import { handleExportWithComponent } from 'utils';
import { PDFExport } from '@progress/kendo-react-pdf';
import moment from 'moment';
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
    width: '50%',

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

function ExchangeRate() {

  const classes = useStyles();
  const cellRef = useRef([]);
  const contentRef = useRef()
  const dispatch = useDispatch();


  const tableHead = ['Currency', 'Exc.Rate']

  const { register, handleSubmit, reset, setValue } = useForm();

  // *For Loading
  const [loader, setLoader] = useState(false);

  // *For Currencies
  const [currencies, setCurrencies] = useState();
  const [currency, setCurrency] = useState();

  // *For Dialog Box
  const [openRateDialog, setOpenRateDialog] = useState(false);

  // *For Get Currencies
  const getCurrencies = async () => {
    // setLoader(true)
    try {
      let params = {
        detailed: true
      }
      const { data } = await CurrencyServices.getCurrencies(params)
      setCurrencies(data?.currencies)
      dispatch(setAedExchangeRate(parseFloat(data?.currencies.find(e => e.currency === 'aed')?.conversion_rate)))
      dispatch(setUsdExchangeRate(parseFloat(data?.currencies.find(e => e.currency === 'usd')?.conversion_rate)))
      dispatch(setCadExchangeRate(parseFloat(data?.currencies.find(e => e.currency === 'cad')?.conversion_rate)))
    } catch (error) {
      ErrorToaster(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Open Rate Dialog
  const handleOpenDialog = (item) => {
    try {
      setOpenRateDialog(true);
      setValue('rate', item?.conversion_rate)
      setCurrency(item?.currency)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Currency Rate
  const updateCurrencyRate = async (formData) => {
    try {
      let obj = {
        currency: currency,
        exchange_rate: formData?.rate,
      }
      await CurrencyServices.updateCurrencyRate(obj)
      reset()
      setOpenRateDialog(false);
      getCurrencies()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead;
    const data = currencies;
    // Extract values from objects and create an array for each row
    const rows = data.map((item, index) => [
      item?.currency.toUpperCase() ?? '-',
      item?.conversion_rate ? parseFloat(item?.conversion_rate)?.toFixed(3) : 0
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
  }, []);

  return (
    <Box sx={{ m: 4 }}>

      <SimpleDialog open={openRateDialog} onClose={() => setOpenRateDialog(false)} title={'Update Exchange Rate'}>
        <Box component="form" onSubmit={handleSubmit(updateCurrencyRate)} >
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <InputField
                size={'small'}
                label={'Exchange Rate'}
                placeholder={'Exchange Rate'}
                register={register("rate", {
                  required: 'Please enter rate.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
              <PrimaryButton
                title="Save"
                type='submit'
              />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
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
          Daily Exc Rates
        </Typography>
        {currencies?.length > 0 && (
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

      {currencies ? (
        <Fragment>
          <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5}
            fileName='Daily Exc Rates'
          >
            <Box className='pdf-show' sx={{ display: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                  Daily Exc Rates
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
                    currencies?.length > 0 ? (
                      <Fragment>
                        {currencies.map((item, index) => (
                          <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                            <Cell className='pdf-table'>
                              {item?.currency.toUpperCase() ?? '-'}
                            </Cell>
                            <Cell className='pdf-table' ref={ref => { cellRef.current[index] = ref }} >
                              <Box onClick={() => handleOpenDialog(item)} sx={{ cursor: 'pointer', textAlign: 'center', p: 1, width: '130px', mx: 'auto', bgcolor: Colors.white, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                                <Typography variant="body2" sx={{ color: Colors.smokeyGrey }}>
                                  {item?.conversion_rate ? parseFloat(item?.conversion_rate)?.toFixed(3) : 0}
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
        </Fragment>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default ExchangeRate;