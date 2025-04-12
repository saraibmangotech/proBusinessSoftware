import React from "react";
import { useState, useEffect } from "react";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import ExportServices from "services/Export";
import { useParams } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "components/Buttons";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { useAuth } from "context/UseContext";

function DamageDetailsView() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [cashierAccounts, setCashierAccounts] = useState([])
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [ev_id, setEv_id] = useState();

	
	const {
		register:register2,
		handleSubmit:handleSubmit2,
		formState: { errors:errors2 },
	} = useForm();
	const [selectedParty, setSelectedParty] = useState(null)

	const [userData, setUserData] = useState()
	//*Loading
	const [loading, setLoading] = useState(false);
	const {
		register,

		setValue,
		formState: { errors },
	} = useForm();

	//*Get Data

	const getExportVehicle = async (page, limit, filter) => {
		try {
			let params = {
				page: 1,
				limit: 15,
				filter: id,
			};

			const { data } = await ExportServices.getExportVehicles(params);
			setUserData(data?.vehicles?.rows[0])
			setValue("Vin", data?.vehicles?.rows[0]?.vin);
			setEv_id(data?.vehicles?.rows[0].id);
			setValue("make", data?.vehicles?.rows[0]?.make?.name);
			setValue("model", data?.vehicles?.rows[0]?.model?.name);
			setValue("year", data?.vehicles?.rows[0]?.year);
			setValue("color", data?.vehicles?.rows[0]?.color);
			setValue("accountableParty",  data?.vehicles?.rows[0]?.accountable?.id == 30001 ? "GWS" : data?.vehicles?.rows[0]?.accountable?.name);
			setSelectedParty({id:data?.vehicles?.rows[0]?.accountable?.id,name:data?.vehicles?.rows[0]?.accountable?.name})
			setValue("damagePart", data?.vehicles?.rows[0]?.damaged_part);
			setValue("damageCost", data?.vehicles?.rows[0]?.damage_cost);
			setValue("damageDescription", data?.vehicles?.rows[0]?.damage_description);
			setValue("notes", data?.vehicles?.rows[0]?.notes);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Get Payment Accounts
	const getPaymentAccounts = async () => {
		try {
			let params = {
				page: 1,
				limit: 1000
			}
			const { data } = await ExportServices.getPaymentAccounts(params)
			// *Filter only vehicle account
			const vehicleAcc = data?.cashierAccounts?.rows?.filter(e => e.unit === 'Shipping')
			// *1003 is the cashier role ID if the login user is a cashier then show only their account
			if (user?.role_id === 1004) {
				const userId = user?.ref_id.split('-')[1]
				const filterCashier = vehicleAcc.filter(e => e.user_id == userId && e.currency == 'usd')
				console.log(filterCashier, 'filterCashier');
				setCashierAccounts(filterCashier)
			} else {
				console.log(vehicleAcc.filter(e => e.currency == "usd"), 'filterCashier2');
				setCashierAccounts(vehicleAcc.filter(e => e.currency == "usd"))
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}
		//*For Damage Create
		const handlePay = async (formData) => {
			setLoading(true);
			console.log(userData, 'userData');
			try {
				let obj = {
					ev_id: ev_id,
					accountable_party_id: selectedParty.id,
					damaged_part: userData?.damaged_part,
					damage_cost: formData?.DamageCost,
					damage_description: formData?.DamageDescription,
					customer_id:userData?.customer_id,
					vin: userData?.vin,
					make_name: userData?.make?.name,
					model_name: userData?.model?.name,
					color: userData?.color,
					year: userData?.year,
					cashier_account_id:selectedAccount?.id,
					damage_cost:userData?.damage_cost
				};
		
				const { message } = await ExportServices.handlePay(obj);
				SuccessToaster(message);
		
			} catch (error) {
				ErrorToaster(error);
			} finally {
				setLoading(false);
			}
		};
	


	useEffect(() => {
		getExportVehicle();
		getPaymentAccounts();
	}, []);

	return (
		<Box component={'form'} onSubmit={handleSubmit2(handlePay)}
			sx={{
				m: 4,
				p: 5,
			}}
		>
			<Typography
				variant="h5"
				sx={{
					color: Colors.charcoalGrey,
					fontFamily: FontFamily.NunitoRegular,
					mb: 2,
					textAlign: "left",
				}}
			>
				Damage Details
			</Typography>

			<Grid
				container
				sx={{
					p: 4,
					bgcolor: Colors.white,
					borderRadius: 3,
					boxShadow: "0px 8px 18px 0px #9B9B9B1A",
				}}
			>
				<Grid container sm={12} spacing={4}>
					<Grid item xs={12} sm={6} md={4}>
						<InputField size={'small'} disabled={true} label={"VIN"} register={register("Vin")} />
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField size={'small'} disabled={true} label={"Make"} register={register("make")} />
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Model"}
							// error={errors?.auctionHouse?.message}
							register={register("model")}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Year"}
							// error={errors?.auctionHouse?.message}
							register={register("year")}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Color"}
							// error={errors?.auctionHouse?.message}
							register={register("color")}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Accountable Party"}
							// error={errors?.auctionHouse?.message}
							register={register("accountableParty")}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Damage Part"}
							// error={errors?.auctionHouse?.message}
							register={register("damagePart")}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Damage Cost"}
							// error={errors?.auctionHouse?.message}
							register={register("damageCost")}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={4}>
						<InputField
							size={'small'}
							disabled={true}
							label={"Damage Description"}
							// error={errors?.auctionHouse?.message}
							register={register("damageDescription")}
						/>
					</Grid>
					<Grid item sm={4}>
						<SelectField
							size={'small'}
							label={'Casheir Account'}
							options={cashierAccounts}
							selected={selectedAccount}
							onSelect={(value) => setSelectedAccount(value)}
							error={errors2?.account?.message}
							register={register2("account", {
								required: 'Please select  account.',
							})}
						/>
					</Grid>

				</Grid>
			</Grid>
			<Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>

		
			<Grid item xs={12} sm={12} sx={{ mt: 0, textAlign: "right", p: 4, pt: 1 }}>
				<PrimaryButton title="Damage Booked" type="submit" loading={loading} />
			</Grid>
			<Grid item xs={12} sm={12} sx={{ m: 4, textAlign: "right" }}>
				<PrimaryButton
					title="Back"
					style={{ backgroundColor: Colors.greyShade }}
					onClick={() => navigate(-1)}
				/>
			</Grid>
			</Box>
		</Box>
	);
}

export default DamageDetailsView;
