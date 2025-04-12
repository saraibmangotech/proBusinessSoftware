import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Container, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import SystemServices from "services/System";
import BankServices from "services/Bank";
import FinanceServices from "services/Finance";
import { QRCodeCanvas } from "qrcode.react";
import DatePicker from "components/DatePicker";
import { GeneratePDF, handleExportWithComponent, numberRegex } from "utils";
import { Add, Delete } from "@mui/icons-material";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import { useReactToPrint } from 'react-to-print';
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

const useStyle = makeStyles({
  text: {
    color: Colors.smokeyGrey,
    fontWeight: 300,
    fontFamily: FontFamily.NunitoRegular
  },
})

function ViewVaultTopUp() {

  const { id } = useParams();
  const classes = useStyle();
  const contentRef = useRef(null);

  const [loader, setLoader] = useState(false);

  // *For Vault Top Up Detail
  const [vaultTopUpDetail, setVaultTopUpDetail] = useState();

  const [fcyAed, setFcyAed] = useState(0);
  const [fcyUsd, setFcyUsd] = useState(0);
  const [lcyAed, setLcyAed] = useState(0);
  const [lcyUsd, setLcyUsd] = useState(0);

  // *For Currency
  const [exchangeRateAed, setExchangeRateAed] = useState();
  const [exchangeRateUsd, setExchangeRateUsd] = useState();

  // *For Get Vault Top Up Detail
  const getVaultTopUpDetail = async () => {
    setLoader(true)
    try {
      let params = {
        topup_id: id
      }
      const { data } = await FinanceServices.getVaultTopUpDetail(params)
      setVaultTopUpDetail(data?.topup)
      let fcyAed = 0
      let fcyUsd = 0
      let lcyAed = 0
      let lcyUsd = 0
      let rateAed = 0
      let rateUsd = 0
      data?.topup?.details.forEach(e => {
        if (e?.currency === 'usd') {
          fcyAed += parseFloat(e?.fcy_amount)
          lcyAed += parseFloat(e?.lcy_amount)
          rateAed = parseFloat(e?.ex_rate)
        } else {
          fcyUsd += parseFloat(e?.fcy_amount)
          lcyUsd += parseFloat(e?.lcy_amount)
          rateUsd = parseFloat(e?.ex_rate)
        }
      })
      setFcyAed(fcyAed)
      setFcyUsd(fcyUsd)
      setLcyAed(lcyAed)
      setLcyUsd(lcyUsd)
      setExchangeRateAed(rateAed)
      setExchangeRateUsd(rateUsd)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }




  useEffect(() => {
    if (id) {
      getVaultTopUpDetail()
    }
  }, [id]);

  return (
    <Container>

      {!loader &&
        <Box sx={{ textAlign: 'right', p: 4 }}>
          <PrimaryButton
            title="Download Wallet"
            type='button'
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(contentRef)}
          />
        </Box>
      }
      <PDFExport ref={contentRef}
        fileName="Wallet Top UP"
      >
        <Box sx={{ width: '1000px', mx: 4, my: 2, bgcolor: Colors.white, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

          {loader ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ p: 5 }}>
              <Grid container spacing={2} alignItems='flex-start'>
                <Grid item xs={12} sm={9}>
                  <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
                    Wallet Top UP
                  </Typography>
                </Grid >
                <Grid item xs={12} sm={3}>
                  <FormControl>
                    <RadioGroup row value={vaultTopUpDetail?.payment_medium}>
                      <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                      <FormControlLabel value="bank" control={<Radio />} label="Bank" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid container spacing={2} item xs={12} sm={6}>
                  <Grid item md={5}>
                    <Typography variant="body1">
                      Received Form:
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Typography noWrap variant="body1" className={classes.text}>
                      {vaultTopUpDetail?.receiver?.name ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item md={5}>
                    <Typography variant="body1">
                      Wallet Account:
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Typography noWrap variant="body1" className={classes.text}>
                      {vaultTopUpDetail?.vault?.name ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item md={5}>
                    <Typography variant="body1">
                      Remark:
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Typography noWrap variant="body1" className={classes.text}>
                      {vaultTopUpDetail?.remarks ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item md={5}>
                    <Typography variant="body1">
                      Received By:
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Typography noWrap variant="body1" className={classes.text}>
                      {vaultTopUpDetail?.received_by ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Box sx={{ mt: 3 }}>
                      <QRCodeCanvas value={window.location.origin + `/vaulttopup-preview/${btoa('vaulttopup-' + vaultTopUpDetail?.id)}`} />
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={2} item xs={12} sm={6}>
                  <Grid item md={5}>
                    <Typography variant="body1">
                      Date:
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Typography noWrap variant="body1" className={classes.text}>
                      {moment(vaultTopUpDetail?.created_at).format('MM-DD-YYYY')}
                    </Typography>
                  </Grid>
                  <Grid item md={5}>
                    <Typography variant="body1">
                      Receipt Voucher #:
                    </Typography>
                  </Grid>
                  <Grid item md={6}>
                    <Typography noWrap variant="body1" className={classes.text}>
                      GRV{vaultTopUpDetail?.id}
                    </Typography>
                  </Grid>
                  <Grid item md={12}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle1">Amount Received</Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <Cell>AED</Cell>
                            <Cell>Rate</Cell>
                            <Cell>USD</Cell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <Row>
                            <Cell>
                              {parseFloat(vaultTopUpDetail?.total_amount_aed)?.toFixed(2)}
                            </Cell>
                            <Cell>
                              {exchangeRateUsd?.toFixed(2)}
                            </Cell>
                            <Cell>
                              {parseFloat(vaultTopUpDetail?.total_amount_usd)?.toFixed(2)}
                            </Cell>
                          </Row>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item md={12}>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle1">Received Currency Detail</Typography>
                    </Box>
                    <Box>
                      <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <Cell>Currency</Cell>
                              <Cell>FCY Amt</Cell>
                              <Cell>Ex.Rate</Cell>
                              <Cell>LCY</Cell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <Row>
                              <Cell>
                                AED
                              </Cell>
                              <Cell>
                                {fcyAed?.toFixed(2)}
                              </Cell>
                              <Cell>
                                {exchangeRateAed?.toFixed(2)}
                              </Cell>
                              <Cell>
                                {lcyAed?.toFixed(2)}
                              </Cell>
                            </Row>
                            <Row>
                              <Cell>
                                USD
                              </Cell>
                              <Cell>
                                {fcyUsd?.toFixed(2)}
                              </Cell>
                              <Cell>
                                {exchangeRateUsd?.toFixed(2)}
                              </Cell>
                              <Cell>
                                {lcyUsd?.toFixed(2)}
                              </Cell>
                            </Row>
                            <Row>
                              <Cell colspan={2}>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                  Total in AED
                                </Typography>
                              </Cell>
                              <Cell colspan={2}>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                  {parseFloat(vaultTopUpDetail?.total_amount_aed)?.toFixed(2)}
                                </Typography>
                              </Cell>
                            </Row>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Grid>
                </Grid>
              </Grid >
            </Box>
          )}

        </Box>
      </PDFExport>
    </Container>
  );
}

export default ViewVaultTopUp;