import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Typography, FormControl, FormControlLabel, Radio, RadioGroup, InputLabel } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { FontFamily, Images } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { GeneratePDF, handleExportWithComponent } from 'utils';
import GatePassServices from 'services/GatePass';
import SelectField from 'components/Select';
import FinanceServices from 'services/Finance';
import BankServices from 'services/Bank';
import { useAuth } from 'context/UseContext';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";


function PayViewGatePass() {

  const { state } = useLocation();
  const { id } = useParams();
  const contentRef = useRef(null);
  const { user } = useAuth();

  const ddData = [
    { text: "A4", value: "size-a4" },
    { text: "Letter", value: "size-letter" },
    { text: "Executive", value: "size-executive" }
  ];

  const [layoutSelection, setLayoutSelection] = useState({
    text: "A4",
    value: "size-a4"
  });

  const updatePageLayout = event => {
    setLayoutSelection(event.target.value);
  };

  const pdfExportComponent = useRef(null);


  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const [loader, setLoader] = useState(true);
  const [loading, setLoading] = useState(false);

  // *For Gate Pass Detail
  const [gatePassDetail, setGatePassDetail] = useState();

  // *For Select Payment Method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentType, setPaymentType] = useState('aed');

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

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [bankName, setBankName] = useState();
  const [bankAccountId, setBankAccountId] = useState();

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState('');

  // *For Vault Account
  const [vaultAccounts, setVaultAccounts] = useState([]);
  const [selectedVaultAccount, setSelectedVaultAccount] = useState('');
  const [vaultBalance, setVaultBalance] = useState();

  // *For Get Payment Accounts
  const getPaymentAccounts = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000
      }
      const { data } = await FinanceServices.getPaymentAccounts(params)
      // *Filter only shipping account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Shipping')
      // *1003 is the cashier role ID if the login user is a cashier then show only their account
      if (user?.role_id === 1003) {
        const userId = user?.ref_id.split('-')[1]
        const filterCashier = vehicleAcc.filter(e => e.user_id == userId)
        setCashierAccounts(filterCashier)
        // *Select Default AED cashier account
        setValue('cash', filterCashier.find(e => e.currency === paymentType)?.name)
        setSelectedCashierAccount(filterCashier.find(e => e.currency === paymentType))
      } else {
        setCashierAccounts(vehicleAcc)
        // *Select Default AED cashier account
        setValue('cash', vehicleAcc.find(e => e.currency === paymentType)?.name)
        setSelectedCashierAccount(vehicleAcc.find(e => e.currency === paymentType))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Banks
  const getBanks = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000
      }
      const { data } = await BankServices.getBanks(params)
      setBankAccounts(data?.banks?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Select Bank Detail
  const handleSelectBank = (id) => {
    const detail = bankAccounts.find(e => e.id === id)
    setSelectedBankAccount(id)
    setBankName(detail?.name)
    setBankAccountId(detail?.guc_account_id)
  }

  // *For Get Vault Customers
  const getVaultCustomers = async (id) => {
    try {
      let params = {
        page: 1,
        limit: 1000,
        customer_id: id
      }
      const { data } = await FinanceServices.getVaultCustomers(params)
      if (data?.customers?.rows[0]?.accounts?.length > 0) {
        const filterData = data?.customers?.rows[0]?.accounts?.filter(e => e.unit === 'Shipping')
        setVaultAccounts(filterData)

      }
      else {
        setVaultAccounts([])
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Handle Select Vault Detail
  const handleSelectVault = (id) => {

    const detail = vaultAccounts.find(e => e.id === id?.id)
    console.log(id);
    console.log(vaultAccounts);
    console.log(detail);
    setSelectedVaultAccount(id)
    const debit = detail?.total_dr ? detail?.total_dr : 0
    const credit = detail?.total_cr ? detail?.total_cr : 0
    const balance = detail?.nature === 'credit' ? parseFloat(credit) - parseFloat(debit) : parseFloat(debit) - parseFloat(credit)
    setValue('vaultBalance', balance)
    setVaultBalance(balance)
  }

  // *For Get Gate Pass Detail
  const getGatePassDetails = async () => {
    setLoader(true)
    try {
      let params = {
        vehicle_id: id
      }
      const { data } = await GatePassServices.getGatePassDetails(params)
      setGatePassDetail(data?.details)
      getVaultCustomers(data?.details?.booking?.customer?.id)
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

  // *For Pay Gate Pass
  const payGatePass = async () => {
    setLoading(true)
    try {
      let obj = {
        pass_id: gatePassDetail?.gate_pass?.id,
        total_due: totalDue,
        total_due_aed: totalDueAed,
        paid_amount: paidAmount,
        paid_amount_aed: paidAmountAed,
        currency: gatePassDetail?.booking?.currency,
        deposit_medium: selectedPaymentMethod?.id,
        make_name: gatePassDetail?.booking?.veh_make?.name,
        model_name: gatePassDetail?.booking?.veh_model?.name,
        color: gatePassDetail?.booking?.color,
        vin: gatePassDetail?.booking?.vin,
        lot_number: gatePassDetail?.booking?.lot_number,
        customer_id: gatePassDetail?.booking?.customer?.id,
        customer_phone: gatePassDetail?.booking?.customer?.uae_phone
      }
      if (selectedPaymentMethod?.id === 'bank') {
        obj.bank_id = selectedBankAccount
        obj.bank_name = bankName
        obj.payment_account_id = bankAccountId?.id
      }
      if (selectedPaymentMethod?.id === 'cash') {
        obj.payment_account_id = selectedCashierAccount?.id
        obj.account_name = selectedCashierAccount?.name
      }
      if (selectedPaymentMethod?.id === 'vault') {
        if (vaultBalance < paidAmount) {
          ErrorToaster('Low Balance (please top up your wallet account)')
          return
        }
        obj.payment_account_id = selectedVaultAccount?.id
        obj.account_name = selectedVaultAccount?.name
      }
      const { message } = await GatePassServices.payGatePass(obj)
      SuccessToaster(message)
      getGatePassDetails()
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: 'vehicle-gate-pass',
  });

  useEffect(() => {
    if (paymentType) {
      setValue('cash', cashierAccounts.find(e => e.currency === paymentType)?.name)
      setSelectedCashierAccount(cashierAccounts.find(e => e.currency === paymentType))
    }
  }, [paymentType]);

  useEffect(() => {
    if (id) {
      getGatePassDetails()
      getPaymentAccounts()
      getBanks()
    }
  }, [id]);

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


      <PDFExport ref={pdfExportComponent}>
        <Box sx={{ width: '1000px', mx: 4, my: 2, bgcolor: Colors.white, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

          {!loader ? (
            <Fragment>
              <Box ref={contentRef}>
                <Grid container spacing={0} justifyContent={'space-between'}>
                  <Grid item xs={12} sm={5.5}>
                    <Box component={'img'} src={Images.logo} sx={{ height: '100px', mb: 3, ml: 3, mt: 2 }} />
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
                            {gatePassDetail?.gate_pass?.vehicle_receiver}
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
                  <Grid item xs={12} sm={5.7}>
                    <Typography variant="h2" sx={{ textAlign: 'center', mb: 5, borderBottom: '1px solid #B2B5BA', mr: 2, mt: 4 }}>
                      VEHICLE GATE PASS
                    </Typography>
                    {console.log(gatePassDetail)}
                    {console.log(moment().diff(gatePassDetail?.gate_pass?.createdAt, "days") < 15)}
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
                      <QRCodeCanvas
                        value={window.location.origin + `/gate-pass-preview/${btoa("gatepass-" + id)}?mobile`}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              {state === 'payment' && gatePassDetail?.gate_pass?.is_paid !== true &&
                <Box component={'form'} sx={{ mx: 2, my: 4 }} onSubmit={handleSubmit(payGatePass)}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={4}>
                      <SelectField
                        label={'Payment Method'}
                        options={[
                          {
                            "id": "cash",
                            "name": "Cash"
                          },
                          {
                            "id": "bank",
                            "name": "Bank"
                          },
                          {
                            "id": "vault",
                            "name": "Shipping Wallet"
                          }
                        ]}
                        selected={selectedPaymentMethod}
                        onSelect={(value) => setSelectedPaymentMethod(value)}
                        error={errors?.paymentMethod?.message}
                        register={register("paymentMethod", {
                          required: 'Please select payment method.',
                        })}
                      />
                    </Grid>
                    {selectedPaymentMethod?.id === 'cash' &&
                      <Fragment>
                        <Grid item xs={12} sm={4}>
                          <InputLabel>
                            Cash in Hand
                          </InputLabel>
                          <FormControl>
                            <RadioGroup row value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                              <FormControlLabel value="aed" control={<Radio />} label="AED" />
                              <FormControlLabel value="usd" control={<Radio />} label="USD" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <SelectField
                            disabled={user?.role_id === 1003 ? true : false}
                            label={'Cashier Account'}
                            options={cashierAccounts}
                            selected={selectedCashierAccount}
                            onSelect={(value) => setSelectedCashierAccount(value)}
                            error={errors?.cash?.message}
                            register={register("cash", {
                              required: selectedPaymentMethod?.id === 'cash' ? 'Please select cash account.' : false,
                            })}
                          />
                        </Grid>
                      </Fragment>
                    }
                    {selectedPaymentMethod?.id === 'bank' &&
                      <Grid item xs={12} sm={3}>
                        <SelectField
                          label={'Bank Account'}
                          options={bankAccounts}
                          selected={selectedBankAccount}
                          onSelect={(value) => handleSelectBank(value)}
                          error={errors?.bank?.message}
                          register={register("bank", {
                            required: selectedPaymentMethod === 'bank' ? 'Please select bank account.' : false,
                          })}
                        />
                      </Grid>
                    }
                    {selectedPaymentMethod?.id === 'vault' &&
                      <Fragment>
                        <Grid item xs={12} sm={3}>
                          <SelectField
                            label={'Wallet Account'}
                            options={vaultAccounts}
                            selected={selectedVaultAccount}
                            onSelect={(value) => handleSelectVault(value)}
                            error={errors?.vault?.message}
                            register={register("vault", {
                              required: selectedPaymentMethod === 'vault' ? 'Please select wallet account.' : false,
                            })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <InputField
                            disabled={true}
                            label={'Wallet Balance'}
                            placeholder={'Wallet Balance'}
                            register={register('vaultBalance')}
                          />
                        </Grid>
                      </Fragment>
                    }
                    <Grid item xs={12} sm={12} sx={{ textAlign: 'right', mb: 2 }}>
                      <PrimaryButton
                        title="Receive Payment"
                        type='submit'
                        loading={loading}
                      />
                    </Grid>
                  </Grid>
                </Box>
              }
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

export default PayViewGatePass;