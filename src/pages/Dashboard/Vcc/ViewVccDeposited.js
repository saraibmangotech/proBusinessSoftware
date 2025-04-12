import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, CardMedia, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import { FontFamily, Images, InvoiceGlobal, InvoiceLocation, InvoiceMail, InvoicePhone } from 'assets';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import { QRCodeCanvas } from 'qrcode.react';
import VccServices from 'services/Vcc';
import SystemServices from 'services/System';
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

function ViewVccDeposited() {

  const { id } = useParams();
  const contentRef = useRef(null);
  const classes = useStyle();

  const [loader, setLoader] = useState(true);

  // *For Vcc Refunded Detail
  const [vccRefundedDetail, setVccRefundedDetail] = useState();
  const [exchangeRate, setExchangeRate] = useState()

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      let params = {
        detailed: true
      }
      const { data } = await SystemServices.getCurrencies(params)

      setExchangeRate(data?.currencies.find(e => e.currency === 'usd')?.conversion_rate)


    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Invoice Detail
  const getVccDepositedDetail = async () => {
    setLoader(true)
    try {
      let params = {
        vcc_id: id
      }
      const { data } = await VccServices.getVccDepositedDetail(params)
      setVccRefundedDetail(data?.details)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: 'vcc-deposited',
  });

  useEffect(() => {
    if (id) {
      getVccDepositedDetail()
      getCurrencies()
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
            title="Download Vcc"
            type="button"
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(contentRef)}
          />
        </Box>
      )}
      <PDFExport ref={contentRef}
        fileName="VCC Deposit"
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
                <Grid item md={3.5}>
                  <Box
                    component={"img"}
                    src={Images.logo}
                    sx={{ height: "150px" }}
                  />
                </Grid>
                <Grid item md={8.5}>
                  <CardMedia image={Images.invoiceHeader} sx={{ mb: 2 }}>
                    <Typography
                      variant="h3"
                      sx={{ py: 3, textAlign: "center", color: Colors.white }}
                    >
                      Galaxy WorldWide Shipping Tr. LLC
                    </Typography>
                  </CardMedia>
                  <Grid
                    container
                    spacing={1.5}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                  >
                    <Grid item md={4}>
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
                    <Grid item md={6}>
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
                    <Grid item md={4}>
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
                    <Grid item md={6}>
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
                  VCC Deposit
                </Typography>
              </Box>
              <Grid container spacing={0} justifyContent={"space-between"}>
                <Grid item md={5.5}>
                  <Box sx={{ ml: 4, mb: 7.5 }}>
                    <Grid container spacing={0.5}>
                      <Grid item md={12}>
                        <Typography
                          variant="h4"
                          className={classes.text}
                          sx={{ mb: 1 }}
                        >
                          VCC Deposit To:
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Customer Name:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.booking?.customer?.name ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Customer ID:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography
                          noWrap
                          variant="body1"
                          className={classes.text}
                        >
                          {vccRefundedDetail?.booking?.customer?.ref_id ?? "-"}
                        </Typography>
                      </Grid>





                    </Grid>
                  </Box>
                  <Box sx={{ ml: 4, mb: 7.5 }}>
                    <Grid container spacing={0.5}>
                      <Grid item md={12}>
                        <Typography
                          variant="h4"
                          className={classes.text}
                          sx={{ mb: 1 }}
                        >
                          VCC Deposit By:
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Staff Name:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.vcc?.deposit?.creator?.name ?? "-"}
                        </Typography>
                      </Grid>






                    </Grid>
                  </Box>
                  <Box className={classes.headingBg} sx={{ bgcolor: Colors.primary }}>
                    <Typography variant="h4" className={classes.heading}>
                      VEHICLE INFORMATION
                    </Typography>
                  </Box>

                  <Box sx={{ ml: 4 }}>
                    <Grid container spacing={1.34}>

                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Purchase Date:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {moment(vccRefundedDetail?.booking?.purchase_date).format("DD-MMM-YYYY hh:mm")}
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Make:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.booking?.veh_make?.name ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Model:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.booking?.veh_model?.name ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          Color:
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.booking?.color ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          VIN #
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.booking?.vin ?? "-"}
                        </Typography>
                      </Grid>
                      <Grid item md={5}>
                        <Typography variant="body1" className={classes.text}>
                          LOT #
                        </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="body1" className={classes.text}>
                          {vccRefundedDetail?.booking?.lot_number ?? "-"}
                        </Typography>
                      </Grid>

                    </Grid>
                  </Box>
                  <Box
                    className={classes.headingBg}
                    sx={{ bgcolor: Colors.bluishCyan }}
                  >
                    <Typography variant="h4" className={classes.heading}>
                      CONDITION OF DEAL
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 4, mr: 2 }}>
                    <Typography variant="body1" className={classes.text}>
                      <ul>
                        <li>This deposit is a guarantee that no later than 30 days purchaser will return a valid EXPORT DOCUMENTS</li>
                        <li>Deposit will be returned to the purchaser if correct EXPORT DOCUMENTS are provided on time. otherwise the deposit becomes property of the seller</li>
                        <li>Incomplete or incorrect EXPORT DOCUMENTS will not be accepted</li>
                      </ul>
                      <Typography variant="body" className={classes.text} sx={{ fontWeight: 'bold !important' }}>Deposit will not be refunded without deposit slip</Typography>
                    </Typography>
                  </Box>
                  {/* <Box
                  className={classes.headingBg}
                  sx={{ bgcolor: Colors.bluishCyan }}
                >
                  <Typography variant="h4" className={classes.heading}>
                    Deposit Received byss
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mr: 2 }}>
                  <Typography variant="body1" className={classes.text}sx={{fontWeight:'bold !important',color: Colors.charcoalGrey,}}>
                    <Box sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box sx={{borderBottom:'2px solid ' ,width:'100%'}}>Staff Name</Box>
                      
                    </Box>
                   
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mr: 2 , mt:3}}>
                  <Typography variant="body1" className={classes.text}sx={{fontWeight:'bold !important',color: Colors.charcoalGrey,}}>
                    <Box sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box sx={{borderBottom:'2px solid ' ,width:'100%'}}>Signature</Box>
                      
                    </Box>
                   
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mr: 2,mt:3 }}>
                  <Typography variant="body1" className={classes.text}sx={{fontWeight:'bold !important',color: Colors.charcoalGrey,}}>
                    <Box sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box sx={{borderBottom:'2px solid ' ,width:'100%'}}>Staff Notes</Box>
                      
                    </Box>
                   
                  </Typography>
                </Box> */}

                </Grid>
                <Grid item md={5.5}>
                  <Box sx={{ mr: 3, mt: 5 }}>
                    <Grid container spacing={0} justifyContent={"flex-end"}>
                      <Grid item md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Receipt #:
                        </Typography>
                      </Grid>
                      <Grid item md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          GVR-{vccRefundedDetail?.booking?.id}
                        </Typography>
                      </Grid>
                      <Grid item md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          Date :
                        </Typography>
                      </Grid>
                      <Grid item md={6} className={classes.tableCell}>
                        <Typography variant="body1" className={classes.text}>
                          {moment(vccRefundedDetail?.vcc?.deposit?.created_at).format("DD-MMM-YYYY hh:mm")}
                        </Typography>
                      </Grid>



                      <Box sx={{ mr: 3, mb: 8, mt: 33 }}>
                        <Grid container spacing={0} justifyContent={"flex-end"}>



                          <Grid
                            item
                            xs={6}
                            sm={6}
                            md={6}
                            className={classes.tableCell}
                          >
                            <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                              Amount : (AED)
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={6}
                            sm={6}
                            md={6}
                            className={classes.tableCell}
                          >
                            <Typography
                              variant="body1"
                              className={classes.text}
                              sx={{ textAlign: "right", fontWeight: 'bold !important', display: 'flex', justifyContent: 'space-between' }}
                            >
                              <Box>AED  </Box>
                              <Box>{vccRefundedDetail?.vcc?.deposit?.amount}</Box>
                            </Typography>
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            className={classes.tableCell}
                            sx={{ backgroundColor: 'white !important' }}
                          >
                            <Typography variant="body1" className={classes.text} sx={{ textAlign: "center" }}>
                              Exchange Rate AED/USD {exchangeRate}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={6}
                            sm={6}
                            md={6}
                            className={classes.tableCell}
                          >
                            <Typography variant="body1" className={classes.text} sx={{ textAlign: "right", fontWeight: 'bold !important' }}>
                              Amount : (USD)
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={6}
                            sm={6}
                            md={6}
                            className={classes.tableCell}
                          >
                            <Typography
                              variant="body1"
                              className={classes.text}
                              sx={{ textAlign: "right", fontWeight: 'bold !important', display: 'flex', justifyContent: 'space-between' }}
                            >
                              <Box>$  </Box>
                              <Box>{parseFloat(parseFloat(vccRefundedDetail?.vcc?.deposit?.amount) / exchangeRate).toFixed(2)}</Box>
                            </Typography>
                          </Grid>



                        </Grid>
                      </Box>

                    </Grid>
                    <Box
                      className={classes.headingBg}
                      sx={{ bgcolor: Colors.bluishCyan, marginTop: '16% !important' }}
                    >
                      <Typography variant="h4" className={classes.heading}>
                        الشروط الواردة في الاتفاقية
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 4, mr: 2 }}>
                      <Typography variant="body1" className={classes.text}>
                        <ul >
                          <li>سيتم إعادة ضمان التصدير عند تقديم أوراق التصدير في غضون 30 يومًا من تاريخ الاستلام من قبل الشركة.</li>
                          <li>سيتم إرجاع الضمان إلى المشتري إذا تم تقديم أوراق التصدير في الوقت المحدد. في حالات أخرى، سيصبح هذا الإيداع ملكًا للبائع بدون أي حقوق للمشتري.</li>
                          <li>لن يتم قبول مستند الترجيع إلا في حالة إبراز المستند الأصلي فقط. لن يتم رد الوديعة بدون قسيمة إيداع.</li>
                        </ul>

                      </Typography>
                    </Box>

                    {/* <Box
                  className={classes.headingBg}
                  sx={{ bgcolor: Colors.bluishCyan,marginTop:'27% !important' }}
                >
                  <Typography variant="h4" className={classes.heading}>
                    Deposit Received From
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mr: 2 }}>
                  <Typography variant="body1" className={classes.text}sx={{fontWeight:'bold !important',color: Colors.charcoalGrey,}}>
                    <Box sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box sx={{borderBottom:'2px solid ' ,width:'100%'}}> Name</Box>
                      
                    </Box>
                   
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mr: 2 , mt:3}}>
                  <Typography variant="body1" className={classes.text}sx={{fontWeight:'bold !important',color: Colors.charcoalGrey,}}>
                    <Box sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box sx={{borderBottom:'2px solid ' ,width:'100%'}}>Signature</Box>
                      
                    </Box>
                   
                  </Typography>
                </Box>
                <Box sx={{ ml: 4, mr: 2,mt:3 }}>
                  <Typography variant="body1" className={classes.text}sx={{fontWeight:'bold !important',color: Colors.charcoalGrey,}}>
                    <Box sx={{display:'flex',justifyContent:'space-between'}}>
                      <Box sx={{borderBottom:'2px solid ' ,width:'100%'}}>Ph: No.</Box>
                      
                    </Box>
                   
                  </Typography>
                </Box> */}
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={0} justifyContent={"space-between"}>
                <Grid item md={9.5}>
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
                <Grid item md={2}>
                  <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                    <QRCodeCanvas
                      value={window.location.origin + `/vcc-deposited-preview/${btoa("vccDeposited-" + id)}`}
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

export default ViewVccDeposited;