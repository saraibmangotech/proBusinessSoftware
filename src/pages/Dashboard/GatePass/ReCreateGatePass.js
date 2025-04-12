import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Grid, InputAdornment, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { numberRegex } from 'utils';
import GatePassServices from 'services/GatePass';
import CurrencyServices from 'services/Currency';

function ReCreateGatePass() {
	const usdref = useRef();
	const aedref = useRef();
	const exchangerateref = useRef();

	const handlePerDayChange = (e) => {
		setPerDayCharge(usdref.current.value);
		setPerDayChargeAed(parseFloat(usdref.current.value * exchangerateref.current.value).toFixed(2));



	};
	const handlePerDayChangeAed = (e) => {

		setPerDayChargeAed(aedref.current.value);
		setPerDayCharge(parseFloat(aedref.current.value / exchangerateref.current.value).toFixed(2));
	};

	const navigate = useNavigate();
	const { id } = useParams();

	const { register, handleSubmit, formState: { errors }, setValue } = useForm();
	const [loader, setLoader] = useState(true);
	const [loading, setLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(true);

	// *For Gate Pass Detail
	const [gatePassDetail, setGatePassDetail] = useState();

	// *For Chargeable Days
	const [chargeableDays, setChargeableDays] = useState(0);

	// *For Currencies
	const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

	// *For Amounts
	const [perDayCharge, setPerDayCharge] = useState(0);
	const [perDayChargeAed, setPerDayChargeAed] = useState(0);
	const [parkingDue, setParkingDue] = useState(0);
	const [parkingDueAed, setParkingDueAed] = useState(0);
	const [recoveryCharges, setRecoveryCharges] = useState(0);
	const [recoveryChargesAed, setRecoveryChargesAed] = useState(0);
	const [totalDue, setTotalDue] = useState(0);
	const [totalDueAed, setTotalDueAed] = useState(0);
	const [discount, setDiscount] = useState(0);
	const [discountAed, setDiscountAed] = useState(0);
	const [paid, setPaid] = useState(0);
	const [paidAed, setPaidAed] = useState(0);
	const [balance, setBalance] = useState(0);
	const [balanceAed, setBalanceAed] = useState(0);

	// *For Check Balance Amount is Negative
	const [balanceNegative, setBalanceNegative] = useState(false);

	// *For Get Currencies
	const getCurrencies = async (currency) => {
		try {
			let params = {
				detailed: true
			}
			const { data } = await CurrencyServices.getCurrencies(params)
			const rate = data?.currencies.find(e => e.currency === 'usd')?.conversion_rate
			setCurrencyExchangeRate(rate)
		} catch (error) {
			ErrorToaster(error)
		}
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
			getCurrencies(data?.details?.booking?.currency)
			const date = moment(data?.details?.gate_pass?.valid_till).format('MM-DD-YYYY');
			const targetDate = moment(date, 'MM-DD-YYYY');
			const daysRemaining = moment().diff(targetDate, 'days');
			setChargeableDays(daysRemaining)
			setIsDisabled(false)
			let totalPaid = 0
			let totalPaidAed = 0
			data?.details?.gate_pass?.details.forEach(element => {
				totalPaid += parseFloat(element?.paid)
				totalPaidAed += parseFloat(element?.paid_aed)
			})
			setPaid(totalPaid)
			setPaidAed(totalPaidAed)
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoader(false)
		}
	}

	// *For Create Gate Pass
	const createGatePass = async (formData) => {
		setLoading(true)
		try {
			let totalGatePassDue = parseFloat(totalDue)
			let totalGatePassDueAed = parseFloat(totalDueAed)
			gatePassDetail?.gate_pass?.details.forEach(e => {
				totalGatePassDue += parseFloat(e.total_due)
				totalGatePassDueAed += parseFloat(e.total_due_aed)
			})

			let obj = {
				pass_id: gatePassDetail?.gate_pass?.id,
				chargeable_days: chargeableDays === '' ? 0 : chargeableDays,
				per_day_charge: perDayCharge === '' ? 0 : perDayCharge,
				per_day_charge_aed: perDayChargeAed === '' ? 0 : perDayChargeAed,
				parking_due: parkingDue === '' ? 0 : parkingDue,
				parking_due_aed: parkingDueAed === '' ? 0 : parkingDueAed,
				recovery_charges: recoveryCharges === '' ? 0 : recoveryCharges,
				recovery_charges_aed: recoveryChargesAed === '' ? 0 : recoveryChargesAed,
				total_due: totalDue === '' ? 0 : totalDue,
				total_due_aed: totalDueAed === '' ? 0 : totalDueAed,
				discount: discount === '' ? 0 : discount,
				discount_aed: discountAed === '' ? 0 : discountAed,
				balance: balance === '' ? 0 : balance,
				balance_aed: balanceAed === '' ? 0 : balanceAed,
				paid_amount: paid === '' ? 0 : paid,
				paid_amount_aed: paidAed === '' ? 0 : paidAed,
				currency: 'usd',
				total_gatepass_due: totalGatePassDue,
				total_gatepass_due_aed: totalGatePassDueAed,
				vehicle_receiver: formData?.receiverName
			}
			const { message } = await GatePassServices.createGatePass(obj)
			SuccessToaster(message)
			navigate('/issue-gate-pass')
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (id) {
			getGatePassDetails()
		}
	}, [id]);

	useEffect(() => {
		if (perDayCharge) {
			const parking = perDayCharge * chargeableDays
			setParkingDue(parking)
			setParkingDueAed(parking * currencyExchangeRate)
		}
	}, [perDayCharge]);

	useEffect(() => {
		if (recoveryCharges) {
			const total = (parkingDue ? parkingDue : 0) + parseFloat(recoveryCharges)
			const totalAed = (parkingDueAed ? parkingDueAed : 0) + parseFloat(recoveryCharges * currencyExchangeRate)
			setTotalDue(total)
			setTotalDueAed(totalAed)
		}
	}, [recoveryCharges, parkingDue]);

	useEffect(() => {
		if (discount || totalDue) {
			let paidAmount = discount ? totalDue - discount : totalDue
			let paidAmountAed = discountAed ? totalDueAed - discountAed : totalDueAed
			// setPaid(paidAmount)
			// setPaidAed(paidAmountAed)
			setBalance(paidAmount)
			setBalanceAed(paidAmountAed)
			if (paidAmount < 0) {
				setBalanceNegative(true)
			} else {
				setBalanceNegative(false)
			}
		}
	}, [totalDue, discount]);

	useEffect(() => {

		setPerDayCharge(gatePassDetail?.gate_pass?.details[0]?.per_day_charge)
		setPerDayChargeAed(gatePassDetail?.gate_pass?.details[0]?.per_day_charge_aed)
		setRecoveryCharges('0')
		setRecoveryChargesAed('0')
	}, [currencyExchangeRate]);

	return (
		<Box
			sx={{
				m: 4,
				p: 5,
				bgcolor: Colors.white,
				borderRadius: 3,
				boxShadow: "0px 8px 18px 0px #9B9B9B1A",
			}}
		>
			{!loader ? (
				<Box component="form" onSubmit={handleSubmit(createGatePass)}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							<Typography
								variant="h5"
								sx={{
									color: Colors.charcoalGrey,
									fontFamily: FontFamily.NunitoRegular,
									mb: 4,
								}}
							>
								Re-Create Gate Pass
							</Typography>
						</Grid>
						<Grid item xs={12} sm={7}>
							<Box sx={{ display: "flex" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Chargeable Days</Typography>
								</Box>
								<Box sx={{ p: 1.5, width: "350px", bgcolor: Colors.primary }}>
									<Typography
										variant="subtitle1"
										sx={{ color: Colors.white, textTransform: "capitalize" }}
									>
										{chargeableDays} Days
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Location Of Yard</Typography>
								</Box>
								<Box sx={{ p: 1, width: "350px", bgcolor: Colors.bluishCyan }}>
									<Typography
										variant="subtitle1"
										sx={{ color: Colors.white, textTransform: "capitalize" }}
									>
										{gatePassDetail?.g_yard?.name ?? "N/A"}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ mt: 4 }} />
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Per Day Charge</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										inputRef={usdref}
										size={"small"}
										value={perDayCharge}
										type={"number"}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0 }}
										register={register("perDayCharge", {
											pattern: numberRegex,
											onChange: handlePerDayChange,
										})}
									/>
									<InputField
										size={"small"}
										inputRef={aedref}
										value={perDayChargeAed}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0 }}
										type={"number"}
										register={register("perDayChargeAed", {
											pattern: numberRegex,
											onChange: handlePerDayChangeAed,
										})}
									/>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Parking Due</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										disabled={true}
										size={"small"}
										value={parkingDue ? parseFloat(parkingDue).toFixed(2) : ""}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.feta }}
										register={register("parkingDue")}
									/>
									<InputField
										disabled={true}
										size={"small"}
										value={parkingDueAed ? parseFloat(parkingDueAed).toFixed(2) : ''}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.iceBerg }}
										register={register("parkingDueAed")}
									/>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Recovery Charge</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										size={"small"}
										value={recoveryCharges}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0 }}
										register={register("recoveryCharges", {
											pattern: numberRegex,

											onChange: (e) => {
												setRecoveryCharges(e.target.value);
												setRecoveryChargesAed(
													e.target.value * currencyExchangeRate
												);
											},
										})}
									/>
									<InputField
										disabled={true}
										size={"small"}
										value={recoveryChargesAed}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.iceBerg }}
										register={register("recoveryChargesAed")}
									/>
								</Box>
							</Box>
							<Box sx={{ mt: 4 }} />
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Total Due</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										disabled={true}
										size={"small"}
										value={parseFloat(totalDue).toFixed(2)}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.feta }}
										register={register("totalDue")}
									/>
									<InputField
										disabled={true}
										size={"small"}
										value={parseFloat(totalDueAed).toFixed(2)}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.iceBerg }}
										register={register("totalDueAed")}
									/>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Discount</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										size={"small"}
										value={discount}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0 }}
										register={register("discount", {
											pattern: numberRegex,
											onChange: (e) => {
												setDiscount(e.target.value);
												setDiscountAed(
													e.target.value * currencyExchangeRate
												);
											},
										})}
									/>
									<InputField
										disabled={true}
										size={"small"}
										value={discountAed}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.iceBerg }}
										register={register("discountAed")}
									/>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Paid Amount</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										disabled={true}
										size={"small"}
										value={paid}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.feta }}
										register={register("paidAmount")}
									/>
									<InputField
										disabled={true}
										size={"small"}
										value={paidAed}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.iceBerg }}
										register={register("paidAmountAed")}
									/>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Balance Due</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
									<InputField
										disabled={true}
										size={"small"}
										value={balance}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													USD
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.feta }}
										register={register("balance")}
									/>
									<InputField
										disabled={true}
										size={"small"}
										value={balanceAed}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													AED
												</InputAdornment>
											),
										}}
										style={{ m: 0, backgroundColor: Colors.iceBerg }}
										register={register("balanceAed")}
									/>
								</Box>
							</Box>
							{balanceNegative && (
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<Box sx={{ p: 1, width: "250px" }}></Box>
									<Box sx={{ display: "flex", gap: "5px", p: 1, width: "350px" }}>
										<Typography variant="body1" sx={{ color: Colors.danger }}>
											The amount is negative.
										</Typography>
									</Box>
								</Box>
							)}
							<Box sx={{ mt: 4 }} />
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">Customer Name</Typography>
								</Box>
								<Box sx={{ p: 1, width: "350px" }}>
									<Typography
										variant="subtitle1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.booking?.customer?.name}
									</Typography>

									{/* <InputField
                    disabled={true}
                    size={'small'}
                    style={{ m: 0 }}
                    value={gatePassDetail?.booking?.customer?.name}
                  /> */}
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">
										Vehicle Receiver Name
									</Typography>
								</Box>
								<Box sx={{ p: 1, width: "350px" }}>
									<Typography
										variant="subtitle1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.gate_pass?.vehicle_receiver}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ p: 1, width: "250px" }}>
									<Typography variant="subtitle1">
										E ID
									</Typography>
								</Box>
								<Box sx={{ p: 1, width: "350px" }}>
									<Typography
										variant="subtitle1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.gate_pass?.eid_doc ? gatePassDetail?.gate_pass?.eid_doc.split('/').pop() : 'N/A'}
									</Typography>
								</Box>
							</Box>
						</Grid>
						<Grid item xs={12} sm={5}>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">Make</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.booking?.veh_make?.name}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">Model</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.booking?.veh_model?.name}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">Color</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.booking?.color}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">VIN#</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.booking?.vin}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">LOT#</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.booking?.lot_number}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">Container#</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.container_no}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex" }}>
								<Box
									sx={{
										p: 1,
										width: "150px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography variant="body2">Arrived Date</Typography>
								</Box>
								<Box
									sx={{
										p: 1,
										width: "300px",
										bgcolor: Colors.whiteSmoke,
										border: "0.5px solid #B2B5BA",
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{gatePassDetail?.arrived_galaxy_date
											? moment(gatePassDetail?.arrived_galaxy_date).format(
												"MM-DD-YYYY"
											)
											: "N/A"}
									</Typography>
								</Box>
							</Box>
							{/* <Box sx={{ display: 'flex' }}>
								<Box sx={{ p: 1, width: '150px', bgcolor: Colors.bluishCyan, border: '0.5px solid #B2B5BA' }}>
									<Typography variant="body2" sx={{ color: Colors.white, }}>Valid Upto</Typography>
								</Box>
								<Box sx={{ p: 1, width: '300px', bgcolor: Colors.bluishCyan, border: '0.5px solid #B2B5BA' }}>
									<Typography variant="body2" sx={{ color: Colors.white, fontFamily: FontFamily.NunitoRegular }}>{moment(gatePassDetail?.vcc?.vcc_expiry_date).format('MM-DD-YYYY')}</Typography>
								</Box>
							</Box> */}
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									width: "100%",
									mt: 4
								}}
							>
								<Box sx={{ p: 1, width: "400px" }}>
									<Typography variant="subtitle1">
										Exchange Rate to AED
									</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: "5px", p: 1 }}>
									<InputField
										size={"small"}
										inputRef={exchangerateref}
										value={currencyExchangeRate}
										style={{ m: 0 }}
										type={"number"}
										register={register("ExchangeratetoAed", {
											pattern: numberRegex,
											onChange: (e) => {
												setCurrencyExchangeRate(
													exchangerateref.current.value
												);
												handlePerDayChange(e);
												handlePerDayChangeAed(e);
											},
										})}
									/>
								</Box>
							</Box>
						</Grid>
						<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
							<PrimaryButton
								disabled={balanceNegative || isDisabled}
								title="Submit"
								type="submit"
								loading={loading}
							/>
						</Grid>
					</Grid>
				</Box>
			) : (
				<Box sx={{ textAlign: "center" }}>
					<CircularProgress />
				</Box>
			)}
		</Box>
	);
}

export default ReCreateGatePass;