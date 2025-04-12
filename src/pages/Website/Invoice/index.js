import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, CardMedia, Typography, Divider, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import { FontFamily, Images, InvoiceGlobal, InvoiceLocation, InvoiceMail, InvoicePhone } from 'assets';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import CurrencyServices from 'services/Currency';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { PDFExport } from '@progress/kendo-react-pdf';

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

function Invoice() {

  const { id } = useParams();
  const contentRef = useRef(null);
  const classes = useStyle();

  const [loader, setLoader] = useState(true);

  // *For Invoice Detail
  const [invoiceDetail, setInvoiceDetail] = useState();

  // *For Currencies
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState();





  // *For Get Invoice Preview
  const getInvoicePreview = async () => {
    setLoader(true)
    try {
      let params = {
        invoice_id: atob(id).split('-')[1]
      }
      const { data } = await VehiclePaymentServices.getInvoicePreview(params)
      setInvoiceDetail(data)
      getCurrencies(data?.invoice?.booking?.currency)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Get Currencies
  const getCurrencies = async (currency) => {
    try {
      let params = {
        detailed: true
      }
      const { data } = await CurrencyServices.getCurrencies(params)
      const rate = data?.currencies.find(e => e.currency === currency)?.conversion_rate
      setCurrencyExchangeRate(rate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    if (id) {
      getInvoicePreview()
    }
  }, []);

  useEffect(() => {
    if (!loader) {
      let Url = window.location.href

      if (Url.includes('mobile')) {
        handleExportWithComponent(contentRef)
      }
    }

  }, [currencyExchangeRate])

  return (
    <Container>

      {!loader &&
        <Box sx={{ textAlign: 'right', p: 4 }}>
          <PrimaryButton
            title="Download Invoice"
            type='button'
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(contentRef)}
          />
        </Box>
      }

      <Box sx={{ width: '1000px', mx: 4, my: 2, bgcolor: Colors.white, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

        {!loader ? (
          <PDFExport ref={contentRef} fileName="Invoice">
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
                    <Typography variant="h3" sx={{ py: 3, textAlign: 'center', color: Colors.white }}> Galaxy Used Cars Tr. LLC</Typography>
                  </CardMedia>
                  <Grid container spacing={1.5} alignItems={'center'} justifyContent={'space-evenly'}>
                    <Grid item xs={4} sm={4} md={4}>
                      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <InvoicePhone />
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>+971 6 510 2000</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <InvoiceMail />
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>info@galaxyshipping.com</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={4} md={4}>
                      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <InvoiceGlobal />
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>https://galaxyshipping.com</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <InvoiceLocation />
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>Ind Area#4 P.O Box 83126, Sharjah , UAE</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Box sx={{ my: 5, position: 'relative', bgcolor: Colors.bluishCyan, width: 1, height: '12px' }}>
                <Typography component={'span'} variant="h2" sx={{ color: Colors.charcoalGrey, bgcolor: Colors.white, p: 2, letterSpacing: '3px', position: 'absolute', right: '90px', top: '-40px' }}>
                  INVOICE
                </Typography>
              </Box>
              <Grid container spacing={0} justifyContent={'space-between'}>
                <Grid item xs={5.5} sm={5.5} md={5.5}>
                  <Box sx={{ ml: 4, mb: 7.5 }}>
                    <Grid container spacing={0.5} >
                      <Grid item xs={12} sm={12} md={12}>
                        <Typography variant="h4" className={classes.text} sx={{ mb: 1 }}>Invoice To:</Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Customer ID:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography noWrap variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.customer?.ref_id ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Customer Name:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.customer?.name ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Phone:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.customer?.uae_phone ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Email:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.customer?.email ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Address:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.customer?.address ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Country:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.location?.country_name ?? '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
                    <Typography variant="h4" className={classes.heading}>VEHICLE INFORMATION</Typography>
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Grid container spacing={1.34} >
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Buyer ID:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.buyer_id ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Purchase Date:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {moment(invoiceDetail?.invoice?.booking?.purchase_date).format('DD-MMM-YYYY hh:mm')}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Make:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.veh_make?.name ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Model:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.veh_model?.name ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Color:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.color ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          VIN #
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.vin ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          LOT #
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.lot_number ?? '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={5} sm={5} md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Auctioneer
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {invoiceDetail?.invoice?.booking?.auctioneer ?? '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box className={classes.headingBg} sx={{ bgcolor: Colors.bluishCyan }}>
                    <Typography variant="h4" className={classes.heading}>NOTES</Typography>
                  </Box>
                  <Box sx={{ ml: 4, mr: 2 }}>
                    <Typography variant="body1" className={classes.text}>
                      {invoiceDetail?.pay_history?.rows?.map((item, index) => (
                        `${item?.payment?.comments}`
                      ))}
                    </Typography>
                  </Box>
                  <Box className={classes.headingBg} sx={{ pl: '32px !important', bgcolor: Colors.aliceBlue }}>
                    <Typography variant="body1" className={classes.heading} sx={{ textAlign: 'left', color: `${Colors.charcoalGrey} !important` }}>
                      <b>Processed by</b> :
                      <Typography component={"span"} variant="body2" sx={{ textTransform: 'none' }}>
                        {invoiceDetail?.pay_history?.rows?.map((item, index) => (
                          `${parseFloat(item?.amount).toFixed(2)} ${item?.currency} received by ${item?.payment?.user?.name}, `
                        ))}
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={5.5} sm={5.5} md={5.5}>
                  <Box sx={{ mr: 3, mt: 0 }}>
                    <Grid container spacing={0} justifyContent={'flex-end'}>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Invoice #:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          GVI-{invoiceDetail?.invoice?.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Booking #:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          GBR-{invoiceDetail?.invoice?.booking?.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Invoice on:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {moment(invoiceDetail?.invoice?.created_at).format('DD-MMM-YYYY hh:mm')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Creation on:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {moment(invoiceDetail?.invoice?.booking?.created_at).format('DD-MMM-YYYY hh:mm')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Last Updated on:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {moment(invoiceDetail?.invoice?.updated_at).format('DD-MMM-YYYY hh:mm')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Due on:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {/* {moment(invoiceDetail?.invoice?.created_at).format('DD-MMM-YYYY')} */}
                          {moment(invoiceDetail?.invoice?.created_at).add(3, 'days').format('DD-MMM-YYYY hh:mm')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Past Due Days:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={6} md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {/* {moment(invoiceDetail?.invoice?.created_at).format('DD-MMM-YYYY')} */}
                          {invoiceDetail?.balance == 0 ? moment(invoiceDetail?.invoice?.created_at).diff(moment(invoiceDetail?.invoice?.updated_at)) < 0 ? 0 : moment(invoiceDetail?.invoice?.created_at).diff(moment(invoiceDetail?.invoice?.updated_at)) : moment().diff(moment(invoiceDetail?.invoice?.created_at).add(2, 'days'), 'days') < 0 ? 0 : moment().diff(moment(invoiceDetail?.invoice?.created_at).add(2, 'days'), 'days')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
                    <Typography variant="h4" className={classes.heading}>Commercial</Typography>
                  </Box>
                  <Box sx={{ mr: 3, mb: 8 }}>
                    <Grid container spacing={0} justifyContent={'flex-end'}>
                      <Grid item xs={4} sm={4} md={4}>
                        <Typography variant="subtitle2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                          Particular
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4}>
                        <Typography variant="subtitle2" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular }}>
                          {invoiceDetail?.invoice?.booking?.currency?.toUpperCase()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4}>
                        <Typography variant="subtitle2" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular }}>
                          AED
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Purchase Price:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.booking?.value)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.booking?.value * currencyExchangeRate)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Other Charges:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.booking?.other_charges)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.booking?.other_charges * currencyExchangeRate)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Total Due:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.amount)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.amount * currencyExchangeRate)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Paid Amount:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.paid)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.paid * currencyExchangeRate)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Balance Due:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.balance)?.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sm={4} md={4} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {parseFloat(invoiceDetail?.invoice?.balance * currencyExchangeRate)?.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  <Box className={classes.headingBg} sx={{ bgcolor: Colors.bluishCyan }}>
                    <Typography variant="h4" className={classes.heading}>PAYMENT HISTORY</Typography>
                  </Box>
                  <Box sx={{ mr: 3 }}>
                    {invoiceDetail?.pay_history?.rows.length > 0 ? (
                      <Grid container spacing={0} justifyContent={'flex-end'}>
                        <Grid item xs={3} sm={3} md={3}>
                          <Typography variant="subtitle2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                            Paid on
                          </Typography>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3}>
                          <Typography variant="subtitle2" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular }}>
                            Payment Mode
                          </Typography>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3}>
                          <Typography variant="subtitle2" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular }}>
                            {invoiceDetail?.invoice?.booking?.currency?.toUpperCase()}
                          </Typography>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3}>
                          <Typography variant="subtitle2" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular }}>
                            AED
                          </Typography>
                        </Grid>
                        {invoiceDetail?.pay_history?.rows.map((item, index) => (
                          <Fragment key={index}>
                            <Grid item xs={3} sm={3} md={3} className={classes.tableCell}>
                              <Typography variant="body1" className={classes.text}>
                                {item?.payment?.created_at ? moment(item?.payment?.created_at).format('DD-MMM-YY') : '-'}
                              </Typography>
                            </Grid>
                            <Grid item xs={3} sm={3} md={3} className={classes.tableCell}>
                              <Typography variant="body1" className={classes.text}>
                                {item?.payment?.payment_medium ?? '-'}
                              </Typography>
                            </Grid>
                            <Grid item xs={3} sm={3} md={3} className={classes.tableCell}>
                              <Typography variant="body1" className={classes.text}>
                                {parseFloat(item?.amount)?.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={3} sm={3} md={3} className={classes.tableCell}>
                              <Typography variant="body1" className={classes.text}>
                                {parseFloat(item?.amount_aed)?.toFixed(2)}
                              </Typography>
                            </Grid>
                          </Fragment>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="subtitle1" sx={{ textAlign: 'center', fontFamily: FontFamily.NunitoRegular }}>
                        No Payment History
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={0} justifyContent={'space-between'}>
                <Grid item xs={9.5} sm={9.5} md={9.5}>
                  <Box sx={{ pl: 4, pr: 3, mb: 3, mt: 4 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      PLEASE READ CAREFULLY BELOW TERM & CONDITION:
                    </Typography>
                    <Typography variant="body2" className={classes.text} sx={{ mb: 1 }}>
                      1 - I've clearly informed and made them understand all the vehicle information, amount, charges and rates.
                    </Typography>
                    <Typography variant="body2" className={classes.text} sx={{ mb: 1 }}>
                      2 - Kindly pay the due amount within 3 business days from the purchase date to avoid the Late Payment and Storages that will be charged once vehicle arrived to final destination (Further, If there are some special annousment/memo ignore this and follow that)
                    </Typography>
                    <Typography variant="body2" className={classes.text} sx={{ mb: 1 }}>
                      3 - If vehicle got relisted, the relist charges customer has to pay within 3 days otherwise 15% Penalty will be applied after 3 days as issued memo on 9/Jun/2022.
                    </Typography>
                    <Typography variant="body2" className={classes.text} sx={{ mb: 1 }}>
                      4 - Galaxy Customer care department will inform you about the latest updates about rates and charges through WhatsApp and emails.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={2} sm={2} md={2}>
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                    <QRCodeCanvas value={window.location.origin + `/invoice-preview/${id}`} />
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ pl: 4, pr: 3, py: 1, bgcolor: Colors.primary }}>
                <Typography variant="caption" sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}>
                  Customer care Contact: Mohammed husni - +971523195682 (Arabic & English ) Ardamehr Shoev - +971545836028 (English ,Arabic, Tajik & Farsi)
                </Typography>
                <Typography variant="caption" sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}>
                  Ravin abdul kareem - +971528293801 (Kurdish , Arabic & English) Magsat Gylyjov - +97158666403 (Turken , Russian & English)
                </Typography>
              </Box>
            </Box>
          </PDFExport>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

      </Box>

    </Container>
  );
}

export default Invoice;