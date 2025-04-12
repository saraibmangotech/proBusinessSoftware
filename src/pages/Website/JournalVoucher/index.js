import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, Paper, CardMedia, Typography, Container, TableCell, TableContainer, TableHead, TableRow, TableBody, Table, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import { FontFamily, Images, InvoiceGlobal, InvoiceLocation, InvoiceMail, InvoicePhone } from 'assets';
import { makeStyles } from '@mui/styles';
import { QRCodeCanvas } from 'qrcode.react';
import FinanceServices from 'services/Finance';
import { useReactToPrint } from 'react-to-print';
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
    padding: '4px !important',

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
  headingBg: {
    margin: '32px 0px',
    padding: '12px 0px',
    textAlign: 'center',
  },
  heading: {
    color: Colors.white,
    textTransform: 'uppercase',
    fontWeight: 300,
    fontFamily: FontFamily.NunitoRegular
  },
  text: {
    color: Colors.smokeyGrey,
    fontWeight: 300,
    fontFamily: FontFamily.NunitoRegular
  },
  tableCell: {
    backgroundColor: Colors.aliceBlue,
    border: '0.25px solid #D9D9D9',
    '& .MuiTypography-root': {
      padding: '4px 12px'
    }
  }
})

function JournalVoucherPreview() {

  const { id } = useParams();
  const contentRef = useRef(null);
  const classes = useStyle();

  const tableHead = ['Sr.No', 'COA Code', 'COA Name', 'Debit (AED)', 'Credit (AED)', 'Description']

  const [loader, setLoader] = useState(true);

  // *For Journal Voucher Detail
  const [voucherDetail, setVoucherDetail] = useState();

  // *For Get Journal Voucher Detail
  const getJournalVoucherDetail = async () => {
    setLoader(true)
    try {
      let params = {
        voucher_id: atob(id).split("-")[1],
      };
      const { data } = await FinanceServices.getJournalVoucherPreview(params)
      setVoucherDetail(data.voucher)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }




  useEffect(() => {
    if (id) {
      getJournalVoucherDetail()
    }
  }, [id]);

  useEffect(() => {
    if (!loader) {
      let Url = window.location.href
      console.log(Url);
      if (Url.includes('mobile')) {
        handleExportWithComponent(contentRef)
      }
    }

  }, [loader])
  return (
    <Container>
      {!loader && (
        <Box sx={{ textAlign: "right", p: 4 }}>
          <PrimaryButton
            title="Download PDF"
            type="button"
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(contentRef)}
          />
        </Box>
      )}
      <PDFExport ref={contentRef}
        fileName="Journal Voucher"
      >
        <Box
          sx={{
            width: "1000px",
            mx: 4,
            my: 2,
            bgcolor: Colors.white,
            boxShadow: "0px 8px 18px 0px #9B9B9B1A",
          }}
        >
          {!loader ? (
            <Box >
              <Grid container spacing={0}>
                <Grid item xs={3.5} sm={3.5} md={3.5}>
                  <Box
                    component={"img"}
                    src={Images.whiteLogo}
                    sx={{ height: "60px", m: 2, my: 3 }}
                  />
                </Grid>
                <Grid item xs={8.5} sm={8.5} md={8.5}>
                  <CardMedia image={Images.invoiceHeader} sx={{ mb: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{ py: 3, textAlign: "center", color: Colors.white }}
                    >
                      Galaxy Used Cars Tr. LLC
                    </Typography>
                  </CardMedia>
                  <Grid
                    container
                    spacing={1.5}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                  >
                    <Grid item xs={4} sm={4} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <InvoicePhone />
                        <Typography
                          variant="body1"
                          sx={{
                            color: Colors.smokeyGrey,
                            fontFamily: FontFamily.NunitoRegular,
                          }}
                        >
                          +971 6 510 2000
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <InvoiceMail />
                        <Typography
                          variant="body1"
                          sx={{
                            color: Colors.smokeyGrey,
                            fontFamily: FontFamily.NunitoRegular,
                          }}
                        >
                          info@galaxyshipping.com
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={4} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <InvoiceGlobal />
                        <Typography
                          variant="body1"
                          sx={{
                            color: Colors.smokeyGrey,
                            fontFamily: FontFamily.NunitoRegular,
                          }}
                        >
                          https://galaxyshipping.com
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <InvoiceLocation />
                        <Typography
                          variant="body1"
                          sx={{
                            color: Colors.smokeyGrey,
                            fontFamily: FontFamily.NunitoRegular,
                          }}
                        >
                          Ind Area#4 P.O Box 83126, Sharjah , UAE
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Box
                sx={{
                  my: 5,
                  position: "relative",
                  bgcolor: Colors.bluishCyan,
                  width: 1,
                  height: "12px",
                }}
              >
                <Typography
                  component={"span"}
                  variant="h2"
                  sx={{
                    color: Colors.charcoalGrey,
                    bgcolor: Colors.white,
                    p: 2,
                    letterSpacing: "3px",
                    position: "absolute",
                    right: "90px",
                    top: "-40px",
                  }}
                >
                  JOURNAL VOUCHER
                </Typography>
              </Box>
              <Box sx={{ mx: 1 }}>
                <Grid container spacing={0} justifyContent={"space-between"}>
                  <Grid item xs={12} sm={11} md={12}>
                    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}>
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        <TableHead>
                          <TableRow>
                            {tableHead.map((item, index) => (
                              <Cell key={index}>{item}</Cell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {voucherDetail?.entries.map((item, index) => {
                            return (
                              <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                                <Cell>
                                  {index + 1}
                                </Cell>
                                <Cell>
                                  {item?.account?.account_code ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.account?.name ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.debit ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.credit ?? '-'}
                                </Cell>
                                <Cell>
                                  {item?.description ?? '-'}
                                </Cell>
                              </Row>
                            )
                          })}
                          <Row sx={{ bgcolor: '#EEFBEE' }}>
                            <Cell colSpan={3}>
                              <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                Total
                              </Typography>
                            </Cell>
                            <Cell>
                              <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                {parseFloat(voucherDetail?.total_amount).toFixed(2)}
                              </Typography>
                            </Cell>
                            <Cell>
                              <Typography variant="body1" sx={{ fontWeight: 700, }}>
                                {parseFloat(voucherDetail?.total_amount).toFixed(2)}
                              </Typography>
                            </Cell>
                            <Cell>
                            </Cell>
                          </Row>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={6} sm={6} md={6}>
                    <Box
                      className={classes.headingBg}
                      sx={{ bgcolor: Colors.bluishCyan }}
                    >
                      <Typography variant="h4" className={classes.heading}>
                        NOTES
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 4, mr: 2 }}>
                      <Typography variant="body1" className={classes.text}>
                        {voucherDetail?.notes}
                      </Typography>
                    </Box>
                    <Box
                      className={classes.headingBg}
                      sx={{ pl: "32px !important", bgcolor: Colors.aliceBlue }}
                    >
                      <Typography
                        variant="body1"
                        className={classes.heading}
                        sx={{
                          textAlign: "left",
                          color: `${Colors.charcoalGrey} !important`,
                        }}
                      >
                        <b>Processed by</b> :
                        <Typography
                          component={"span"}
                          variant="body2"
                          sx={{ textTransform: "none" }}
                        >
                          {voucherDetail?.creator?.name}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Grid container spacing={0} justifyContent={"space-between"}>
                <Grid item xs={9.5} sm={9.5} md={9.5}>
                  <Box sx={{ pl: 4, pr: 3, mb: 3, mt: 4 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      PLEASE READ CAREFULLY BELOW TERM & CONDITION:
                    </Typography>
                    <Typography
                      variant="body2"
                      className={classes.text}
                      sx={{ mb: 1 }}
                    >
                      1 - I've clearly informed and the make the understand all
                      the vehicle information, amount, charges and rates.
                    </Typography>
                    <Typography
                      variant="body2"
                      className={classes.text}
                      sx={{ mb: 1 }}
                    >
                      2 - Kindly pay the due amount within 3 business days from
                      the purchase date to avoid the Late Payment and Storages
                      that will be charged once vehicle arrived to final
                      destination (Further, If there are some special
                      annousment/memo ignore this and follow that)
                    </Typography>
                    <Typography
                      variant="body2"
                      className={classes.text}
                      sx={{ mb: 1 }}
                    >
                      3 - If vehicle got relisted, the relist charges customer has
                      to pay within 3 days otherwise 15% Penalty will applied
                      after 3 days as issued memo on 9/Jun/2022.
                    </Typography>
                    <Typography
                      variant="body2"
                      className={classes.text}
                      sx={{ mb: 1 }}
                    >
                      4 - Galaxy Customer care department will inform you about
                      the latest updates about rates and charges through WhatsApp
                      and emails.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={2} sm={2} md={2}>
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                    <QRCodeCanvas
                      value={
                        window.location.origin +
                        `/journal-voucher-preview/${btoa("voucher-" + id)}`
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ pl: 4, pr: 3, py: 1, bgcolor: Colors.primary }}>
                <Typography
                  variant="caption"
                  sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}
                >
                  Customer care Contact: Mohammed husni - +971523195682 (Arabic &
                  English ) Ardamehr Shoev - +971545836028 (English ,Arabic, Tajik &
                  Farsi)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}
                >
                  Ravin abdul kareem - +971528293801 (Kurdish , Arabic & English)
                  Magsat Gylyjov - +97158666403 (Turken , Russian & English)
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </PDFExport>
    </Container>
  );
}

export default JournalVoucherPreview;