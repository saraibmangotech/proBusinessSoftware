import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import moment from 'moment';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import GatePassServices from 'services/GatePass';
import { QRCodeCanvas } from 'qrcode.react';
import { Debounce } from 'utils';
import { useReactToPrint } from 'react-to-print';
import { PDFExport } from '@progress/kendo-react-pdf';

function GatePassPreview() {

  const { id } = useParams();
  const contentRef = useRef(null);
  const pdfExportComponent = useRef(null);

  const [loader, setLoader] = useState(true);

  // *For Gate Pass Detail
  const [gatePassDetail, setGatePassDetail] = useState();

  const [chargeableDays, setChargeableDays] = useState(0);

  // *For Amounts
  const [perDayCharge, setPerDayCharge] = useState();
  const [perDayChargeAed, setPerDayChargeAed] = useState();
  const [parkingDue, setParkingDue] = useState();
  const [parkingDueAed, setParkingDueAed] = useState();
  const [recoveryCharges, setRecoveryCharges] = useState();
  const [recoveryChargesAed, setRecoveryChargesAed] = useState();
  const [totalDue, setTotalDue] = useState();
  const [totalDueAed, setTotalDueAed] = useState();
  const [discount, setDiscount] = useState();
  const [discountAed, setDiscountAed] = useState();
  const [paidAmount, setPaid] = useState();
  const [paidAmountAed, setPaidAed] = useState();
  const [balance, setBalance] = useState();
  const [balanceAed, setBalanceAed] = useState();

  // *For Get Gate Pass Detail
  const getGatePassDetails = async () => {
    setLoader(true)
    try {
      let params = {
        vehicle_id: atob(id).split('-')[1]
      }
      const { data } = await GatePassServices.getGatePassPreview(params)
      setGatePassDetail(data?.details)
      let Day = 0
      let PDC = 0
      let PDCA = 0
      let PD = 0
      let PDA = 0
      let RC = 0
      let RCA = 0
      let TD = 0
      let TDA = 0
      let D = 0
      let DA = 0
      let P = 0
      let PA = 0
      let B = 0
      let BA = 0

      data?.details?.gate_pass?.details.forEach(e => {
        Day += e?.chargeable_days
        PDC += e?.per_day_charge ? parseFloat(e?.per_day_charge) : 0
        PDCA += e?.per_day_charge_aed ? parseFloat(e?.per_day_charge_aed) : 0
        PD += e?.parking_due ? parseFloat(e?.parking_due) : 0
        PDA += e?.parking_due_aed ? parseFloat(e?.parking_due_aed) : 0
        RC += e?.recovery_charges ? parseFloat(e?.recovery_charges) : 0
        RCA += e?.recovery_charges_aed ? parseFloat(e?.recovery_charges_aed) : 0
        TD += e?.total_due ? parseFloat(e?.total_due) : 0
        TDA += e?.total_due_aed ? parseFloat(e?.total_due_aed) : 0
        D += e?.discount ? parseFloat(e?.discount) : 0
        DA += e?.discount_aed ? parseFloat(e?.discount_aed) : 0
        P += e?.paid ? parseFloat(e?.paid) : 0
        PA += e?.paid_aed ? parseFloat(e?.paid_aed) : 0
        B += e?.balance_due ? parseFloat(e?.balance_due) : 0
        BA += e?.balance_due_aed ? parseFloat(e?.balance_due_aed) : 0
      })

      setChargeableDays(isNaN(Day) ? 0 : Day)
      setPerDayCharge(isNaN(PDC) ? 0 : PDC)
      setPerDayChargeAed(isNaN(PDCA) ? 0 : PDCA)
      setParkingDue(isNaN(PD) ? 0 : PD)
      setParkingDueAed(isNaN(PDA) ? 0 : PDA)
      setRecoveryCharges(isNaN(RC) ? 0 : RC)
      setRecoveryChargesAed(isNaN(RCA) ? 0 : RCA)
      setTotalDue(isNaN(TD) ? 0 : TD)
      setTotalDueAed(isNaN(TDA) ? 0 : TDA)
      setDiscount(isNaN(D) ? 0 : D)
      setDiscountAed(isNaN(DA) ? 0 : DA)
      setPaid(isNaN(P) ? 0 : P)
      setPaidAed(isNaN(PA) ? 0 : PA)
      setBalance(isNaN(B) ? 0 : B)
      setBalanceAed(isNaN(BA) ? 0 : B)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: 'vehicle-gate-pass',
  });

  const handleClick = (e) => {
    console.log('sadsasasdasda');
    e.preventDefault()
    handlePrint();
  };
  useEffect(() => {
    if (id) {
      getGatePassDetails()
      console.log(id);
    }

  }, [id]);

  useEffect(() => {
    if (!loader) {
      let Url = window.location.href
      console.log(Url);
      if (Url.includes('mobile')) {
        handleExportWithComponent(pdfExportComponent)
      }
    }

  }, [loader])



  return (
    <Container>

      {!loader &&
        <Box sx={{ textAlign: 'right', p: 4 }}>
          <PrimaryButton
            title="Download Gate Pass"
            type='button'
            style={{ backgroundColor: Colors.bluishCyan }}
            onClick={() => handleExportWithComponent(pdfExportComponent)}
          />
        </Box>
      }
      <PDFExport ref={pdfExportComponent} fileName="Gate Pass">
        <Box sx={{ width: '1000px', mx: 4, my: 2, bgcolor: Colors.white, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

          {!loader ? (
            <Fragment>
              <Box ref={contentRef}>
                <Grid container spacing={0} justifyContent={'space-between'}>
                  <Grid item xs={5.5} sm={5.5}>
                    <Box component={'img'} src={Images.logo} sx={{ height: '100px', mb: 3, ml: 3, mt: 4 }} />
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">Make</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{gatePassDetail?.booking?.veh_make?.name}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">Model</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{gatePassDetail?.booking?.veh_model?.name}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">Color</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{gatePassDetail?.booking?.color}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">VIN#</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{gatePassDetail?.booking?.vin}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">LOT#</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{gatePassDetail?.booking?.lot_number}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">Container#</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{gatePassDetail?.container_no}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2">Arrived Date</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.whiteSmoke, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>{moment(gatePassDetail?.arrived_galaxy_date).format('MM-DD-YYYY')}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 3 }}>
                      <Box sx={{ p: 1, width: '150px', bgcolor: Colors.bluishCyan, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ color: Colors.white, }}>Valid Upto</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '300px', bgcolor: Colors.bluishCyan, border: '0.5px solid #B2B5BA' }}>
                        <Typography variant="body2" sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}>{moment(gatePassDetail?.gate_pass?.valid_till).format('MM-DD-YYYY')}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ bgcolor: Colors.aliceBlue, my: 2, py: 2, pl: 3 }}>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 1, width: '150px' }}>
                          <Typography variant="body2">Customer Name</Typography>
                        </Box>
                        <Box sx={{ p: 1, width: '300px' }}>
                          <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                            {gatePassDetail?.booking?.customer?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 1, width: '150px' }}>
                          <Typography variant="body2">Receiver Name</Typography>
                        </Box>
                        <Box sx={{ p: 1, width: '300px' }}>
                          <Typography variant="body2" sx={{ fontFamily: FontFamily.NunitoRegular }}>
                            {gatePassDetail?.vcc?.vcc_received_by}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ pr: 1, bgcolor: Colors.feta, my: 3, py: 2, pl: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Terms & Conditions</Typography>
                      <Typography component={'p'} variant="caption" sx={{ fontFamily: FontFamily.NunitoRegular, my: 1 }}>1. THIS GATE PASS WILL BE VALID FOR ONLY 2 DAYS. PARKING CHARGE WILL BE COUNTED FROM THIRD DAY</Typography>
                      <Typography component={'p'} variant="caption" sx={{ fontFamily: FontFamily.NunitoRegular, my: 1 }}>2. Invalid Gate Pass will not ALLOWED to take out the Vehicle from Galaxy Yard & New Gate Pass should be requested
                        from the Galaxy Office with extra Parking.</Typography>
                      <Typography component={'p'} variant="caption" sx={{ fontFamily: FontFamily.NunitoRegular, my: 1 }}>3. The parking will be free for the first 15 Days from the Day of Arrival, After that it will be charged form Day one.</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={5.7} sm={5.7}>
                    <Typography variant="h2" sx={{ textAlign: 'center', mb: 5, borderBottom: '1px solid #B2B5BA', mr: 2, mt: 4 }}>
                      VEHICLE GATE PASS
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1">Gate Pass Status</Typography>
                      </Box>

                      <Box sx={{ p: 1.5, width: '250px', bgcolor: moment().diff(gatePassDetail?.gate_pass?.createdAt, "days") < 15 ? Colors?.primary : gatePassDetail?.gate_pass?.is_valid === false ? Colors.danger : gatePassDetail?.gate_pass?.is_paid === false ? Colors.yellow : Colors.primary }}>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize', color: moment().diff(gatePassDetail?.gate_pass?.createdAt, "days") < 15 ? Colors.white : gatePassDetail?.gate_pass?.is_valid === false ? Colors.white : gatePassDetail?.gate_pass?.is_paid === false ? Colors.black : Colors.white }}>
                          {moment().diff(gatePassDetail?.gate_pass?.createdAt, "days") < 15 ? 'Valid' : gatePassDetail?.gate_pass?.is_paid ? 'Paid' : 'UnPaid'} {moment().diff(gatePassDetail?.gate_pass?.createdAt, "days") < 15 ? '' : "&"} {moment().diff(gatePassDetail?.gate_pass?.createdAt, "days") < 15 ? '' : gatePassDetail?.gate_pass?.is_valid ? 'Valid' : 'InValid'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1">Chargeable Days</Typography>
                      </Box>
                      <Box sx={{ p: 1.5, width: '250px', bgcolor: Colors.bluishCyan }}>
                        <Typography variant="body1" sx={{ color: Colors.white, textTransform: 'capitalize' }}>{chargeableDays}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1">Location Of Yard</Typography>
                      </Box>
                      <Box sx={{ p: 1, width: '250px', bgcolor: Colors.aliceBlue }}>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{gatePassDetail?.g_yard?.name}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 4 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Per Day Charge</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {perDayCharge.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {perDayChargeAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Parking Due</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {parkingDue.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {parkingDueAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Recovery Charge</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {recoveryCharges.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {recoveryChargesAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 4 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Total Due</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {totalDue.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {totalDueAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Discount</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {discount.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {discountAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Paid Amount</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {paidAmount.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {paidAmountAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1, width: '200px' }}>
                        <Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>Balance Due</Typography>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.feta, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">USD {balance.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ p: 0.7, width: '125px', bgcolor: Colors.aliceBlue, textAlign: 'center', border: '0.5px solid #B2B5BA' }}>
                          <Typography variant="body2">AED {balanceAed.toFixed(2)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 3 }} />
                    <Box sx={{ textAlign: 'right', mr: 4 }}>
                      <QRCodeCanvas value={window.location.origin + `/gate-pass-preview/${id}`} />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Fragment>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          )}

        </Box>
      </PDFExport>
    </Container>
  );
}

export default GatePassPreview;