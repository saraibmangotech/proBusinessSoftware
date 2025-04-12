import React, { Fragment, useState } from 'react';
import { Box, Typography, Grid, CardMedia, Checkbox, IconButton } from '@mui/material';
import { CheckCircle, Circle } from '@mui/icons-material';
import { Images, IndividualIcon, BrokerIcon, CompanyIcon, SubCustomerIcon } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import Types from 'data/Types';
import CustomerTypes from 'data/Customer_Types';

function CustomerType({ submit }) {

	const [selectedBusinessRegion, setSelectedBusinessRegion] = useState('Import');
	const [selectedCustomerType, setSelectedCustomerType] = useState({ id: 1, label: 'Individual' });

	return (
		<Fragment>
			<Typography
				variant="h3"
				sx={{ textAlign: "center", color: Colors.textSecondary, my: 2, mb: 4, fontSize: "30px" }}
			>
				Please select your business Category
			</Typography>
			<Box sx={{ my: 4 }}>
				<Grid container justifyContent={"space-evenly"}>
					{Types.map((item, index) => (
						<Grid key={index} item md={4} width={"100%"}>
							<CardMedia
								image={Images[item.icon]}
								onClick={() => setSelectedBusinessRegion(item.label)}
								sx={{
									height: "210px",
									backgroundSize: "contain",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									position: "relative",
									cursor: "pointer",
									width: "100%",
								}}
							>
								<Box sx={{ position: "absolute", top: 5, right: 10 }}>
									<Checkbox
										checked={
											item.label === selectedBusinessRegion ? true : false
										}
										icon={<Circle />}
										checkedIcon={<CheckCircle />}
										sx={{ "& .MuiSvgIcon-root": { fontSize: 32 } }}
									/>
								</Box>
								<Typography
									variant="h4"
									sx={{ textAlign: "center", color: Colors.white }}
								>
									{item.label}
								</Typography>
							</CardMedia>
						</Grid>
					))}
				</Grid>
			</Box>
			<Box sx={{ bgcolor: Colors.milkWhite, my: 4, px: 3, py: 5, borderRadius: "25px" }}>
				<Grid
					container
					spacing={1}
					alignItems={"center"}
					justifyContent={"center"}
					sx={{ gap: "20px" }}
				>
					{CustomerTypes.map((item, index) => (
						<Grid key={index} item md={2.3} width={"100%"}>
							<Box
								onClick={() => setSelectedCustomerType(item)}
								sx={{
									bgcolor:
										selectedCustomerType?.id === item.id
											? Colors.charcoalGrey
											: Colors.white,
									borderRadius: "25px",
									height: 280,
									boxShadow: "0px 25px 35px 0px #D9D9D933",
									display: "flex",
									flexDirection: "column",
									justifyContent: "space-evenly",
									alignItems: "center",
									cursor: "pointer",
									svg: {
										path: {
											fill:
												selectedCustomerType?.id === item.id
													? Colors.white
													: Colors.primary,
										},
									},
								}}
							>
								<IconButton
									disableTouchRipple
									sx={{
										bgcolor:
											selectedCustomerType?.id === item.id
												? Colors.primary
												: Colors.whiteSmoke,
										p: 2.5,
										"&:hover": {
											bgcolor:
												selectedCustomerType?.id === item.id
													? Colors.primary
													: Colors.whiteSmoke,
										},
									}}
								>
									{item.icon === "individual" && <IndividualIcon />}
									{item.icon === "broker" && <BrokerIcon />}
									{item.icon === "company" && <CompanyIcon />}
									{item.icon === "subCustomer" && <SubCustomerIcon />}
								</IconButton>
								<Typography
									variant="h5"
									sx={{
										textAlign: "center",
										color:
											selectedCustomerType?.id === item.id
												? Colors.white
												: Colors.charcoalGrey,
									}}
								>
									{item.label}
								</Typography>
							</Box>
						</Grid>
					))}
					<Grid item md={2.4} sx={{ textAlign: "center" }}>
						<PrimaryButton
							title={"Proceed"}
							color={"primary"}
							style={{ borderRadius: 15, width: 160 }}
							onClick={() =>
								submit({
									businessRegion: selectedBusinessRegion,
									customerType: selectedCustomerType,
								})
							}
						/>
					</Grid>
				</Grid>
			</Box>
		</Fragment>
	);
}

export default CustomerType;