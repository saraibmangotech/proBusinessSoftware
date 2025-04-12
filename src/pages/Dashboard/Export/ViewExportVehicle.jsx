import React, { Fragment, useEffect, useState } from "react";
import {
	Box,
	Divider,
	Grid,
	Typography,
	Tooltip,
	ImageList,
	ImageListItem,
	IconButton,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import { ErrorToaster } from "components/Toaster";
import Colors from "assets/Style/Colors";
import JSZip from "jszip";
import { FontFamily, ChecklitsIcons } from "assets";
import CustomerServices from "services/Customer";
import ReactImageMagnify from "react-image-magnify";
import moment from "moment";
import { DownloadFile } from "utils";
import { Icons } from "assets/index";
import ExportServices from "services/Export";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { CloudDownload, FullscreenOutlined, HdOutlined } from "@mui/icons-material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function ViewExportVehicle() {
	const { id } = useParams();
	const navigate = useNavigate();

	//*For Checklist
	const [checklist, setChecklist] = useState("");

	//*For Vehicle Data
	const [ExportVehicleDetails, setExportVehicleDetails] = useState();

	//*For Customer Details
	const [customerDetails, setCustomerDetails] = useState();

	// *For Customer Booking
	const [customers, setCustomers] = useState([]);

	// *For Pictures
	const [pictures, setPictures] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);

	const handleCounter = (move) => {
		if (move == 'left') {
			setImageIndex(imageIndex - 1)
		}
		else {
			setImageIndex(imageIndex + 1)
		}
		

	}

	// *For Get Customer Booking
	const getCustomerBooking = async () => {
		try {
			const { data } = await CustomerServices.getCustomerBooking();
			setCustomers(data?.customers);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Get Vehicle Booking Detail
	const getVehicleExportDetails = async () => {
		try {
			let params = { ev_id: id };

			const { data } = await ExportServices.getVehicleExportDetails(params);
			setChecklist(data?.vehicle?.checklist);
			setExportVehicleDetails(data?.vehicle);
			setCustomerDetails(data?.vehicle?.customer);
			setPictures(data?.vehicle.pictures);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*Download Zip Function
	const handleDownloadClick = () => {
		const zip = new JSZip();

		const downloadPromises = pictures.map((imagePath) =>
			fetch(`${process.env.REACT_APP_IMAGE_BASE_URL}${imagePath}`)
				.then((response) => response.blob())
				.then((data) => {
					const filename = imagePath.split("/").pop();
					zip.file(filename, data);
				})
		);

		Promise.all(downloadPromises).then(() => {
			zip.generateAsync({ type: "blob" }).then((blob) => {
				const zipFilename = "images.zip";
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.style.display = "none";
				a.href = url;
				a.download = zipFilename;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			});
		});
	};

	useEffect(() => {
		if (id) {
			getCustomerBooking();
			getVehicleExportDetails();
		}
	}, [id]);

	return (
		<Box>
			<Box
				sx={{
					m: 4,
					p: 2,
					bgcolor: Colors.white,
					borderRadius: 3,
					boxShadow: "0px 8px 18px 0px #9B9B9B1A",
				}}
			>
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
							Export Vehicle Details
						</Typography>
						<Divider sx={{ my: 2, width: "46%" }} />
					</Grid>

					<Grid item xs={12} sm={5.5} sx={{position:'relative'}}>
					<Box display={'flex'} justifyContent={"space-between"} sx={{position:'absolute',top:'30%',zIndex:1,width:'97%'}}>
						{ <button style={{border:'none' ,backgroundColor:'transparent'}} disabled={imageIndex !=0  ? false : true} onClick={() => handleCounter('left')}><ChevronLeftIcon sx={{color:'white',fontSize:'40px',cursor:'pointer'}}/></button>}
						{   <button  style={{border:'none' ,backgroundColor:'transparent'}} disabled={imageIndex != pictures.length-1 ? false : true  } onClick={() => handleCounter('right')}><ChevronRightIcon sx={{color:'white',fontSize:'40px',cursor:'pointer'}} /></button>}
						</Box>
						{pictures?.length > 0 && (
							<Fragment>
								<Box sx={{ position: "relative" }}>
									<ReactImageMagnify
										{...{
											smallImage: {
												src:
													process.env.REACT_APP_IMAGE_BASE_URL +
													pictures[imageIndex],
												isFluidWidth: true,
											},
											largeImage: {
												src:
													process.env.REACT_APP_IMAGE_BASE_URL +
													pictures[imageIndex],
												width: 1200,
												height: 1200,
											},
											isHintEnabled: true,
											shouldHideHintAfterFirstActivation: false,
										}}
									/>
									<Box
										sx={{ position: "absolute", left: "10px", bottom: "10px" }}
									>
										<Box sx={{ mb: 1 }}>
											<Tooltip title={"Full Screen"} placement="right-start">
												<IconButton
													size="small"
													sx={{
														borderRadius: "10px",
														bgcolor: Colors.darkGrey,
														"&:hover": { bgcolor: Colors.darkGrey },
													}}
												>
													<FullscreenOutlined
														sx={{ color: Colors.white }}
													/>
												</IconButton>
											</Tooltip>
										</Box>
										<Box sx={{ mb: 1 }}>
											<Tooltip title={"View HD"} placement="right-start">
												<IconButton
													size="small"
													sx={{
														borderRadius: "10px",
														bgcolor: Colors.darkGrey,
														"&:hover": { bgcolor: Colors.darkGrey },
													}}
												>
													<HdOutlined sx={{ color: Colors.white }} />
												</IconButton>
											</Tooltip>
										</Box>
										<Box>
											<Tooltip title={"Download"} placement="right-start">
												<IconButton
													size="small"
													onClick={() => handleDownloadClick()}
													sx={{
														borderRadius: "10px",
														bgcolor: Colors.darkGrey,
														"&:hover": { bgcolor: Colors.darkGrey },
													}}
												>
													<CloudDownload sx={{ color: Colors.white }} />
												</IconButton>
											</Tooltip>
										</Box>
									</Box>
								</Box>
								<ImageList sx={{ maxHeight: 200 }} cols={4}>
									{pictures.map((item, index) => (
										<ImageListItem
											key={index}
											onClick={() => setImageIndex(index)}
											sx={{
												border: `1px solid ${
													index === imageIndex
														? Colors.greyShade
														: "transparent"
												}`,
												borderRadius: 2,
												alignItems: "center",
												p: 0.5,
												cursor: "pointer",
											}}
										>
											<Box
												component={"img"}
												src={process.env.REACT_APP_IMAGE_BASE_URL + item}
												sx={{ height: 85, width: 85, objectFit: "cover" }}
											/>
										</ImageListItem>
									))}
								</ImageList>
							</Fragment>
						)}
					</Grid>
					<Grid item xs={12} sx={{ paddingLeft: "20px !important" }} sm={3}>
						<Typography
							variant="h6"
							sx={{
								color: Colors.charcoalGrey,
								fontFamily: FontFamily.NunitoRegular,
								mb: 4,
								fontWeight: "bold",
							}}
						>
							Vehicle Information
						</Typography>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									VIN:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.vin}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Year:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.year}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Make:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.make?.name}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Model:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.model?.name}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Color:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.color}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									PickupFrom:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.pickup_from}
								</Typography>
							</Box>
						</Box>
						{ExportVehicleDetails?.uae_location && (
							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-start",
										alignItems: "center",
										width: "60%",
										gap: "10px",
										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										UAE Location:
									</Typography>
								</Box>
								<Box sx={{ width: "45%" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{ExportVehicleDetails?.uae_location}
									</Typography>
								</Box>
							</Box>
						)}
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Final Destination:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.destination?.name}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Status
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.status?.name}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Payment at:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.payment_at}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Date:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.date
										? moment(ExportVehicleDetails?.date).format("MM-DD-YYYY")
										: "N/A"}
								</Typography>
							</Box>
						</Box>
					</Grid>
					<Grid item xs={12} sm={3.5}>
						<Typography
							variant="h6"
							sx={{
								color: Colors.charcoalGrey,
								fontFamily: FontFamily.NunitoRegular,
								mb: 4,
								fontWeight: "bold",
							}}
						>
							Customer Information
						</Typography>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<img src={Icons.user} alt="" width={"14px"} height={"14px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Customer Name:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.customer?.name}
								</Typography>
							</Box>
						</Box>

						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<img src={Icons.card2} alt="" width={"15px"} height={"12px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Customer ID:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.customer_id}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<img src={Icons.call} alt="" width={"15px"} height={"15px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Contact Number:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{customerDetails?.uae_phone}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "60%",
									gap: "10px",
									lineHeight: "0",
								}}
							>
								<img src={Icons.Message} alt="" width={"15px"} height={"12px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Email:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{
										fontFamily: FontFamily.NunitoRegular,
										wordBreak: "break-word",
									}}
								>
									{customerDetails?.email}
								</Typography>
							</Box>
						</Box>
						<Typography
							variant="h6"
							sx={{
								color: Colors.charcoalGrey,
								fontFamily: FontFamily.NunitoRegular,
								mb: 4,
								fontWeight: "bold",
							}}
						>
							Price Information
						</Typography>
						<Box sx={{ display: "flex", mb: 1.5, mt: 3 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Price:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.price}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Discount:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.discount}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Final Price:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{ExportVehicleDetails?.final_price}
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Box>
			<Box
				sx={{
					m: 4,
					p: 2,
					bgcolor: Colors.white,
					borderRadius: 3,
					boxShadow: "0px 8px 18px 0px #9B9B9B1A",
				}}
			>
				<Typography
					variant="h5"
					sx={{
						color: Colors.charcoalGrey,
						fontFamily: FontFamily.NunitoRegular,
						m: 3,
					}}
				>
					Checklist
				</Typography>
				<Grid container spacing={2}>
					{checklist &&
						checklist.map((item, index) => (
							<Grid item key={index} lg={4} md={6} sm={12}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-evenly",
										alignItems: "center",
									}}
								>
									<div
										style={{ width: "80px", textAlign: "center" }}
										dangerouslySetInnerHTML={{
											__html: ChecklitsIcons[item.icon],
										}}
									></div>
									<div style={{ width: "120px", textAlign: "left" }}>
										{item.name}
									</div>
									<div style={{ width: "120px", textAlign: "left" }}>
										{item.value == "-1" ? (
											<Box
												sx={{
													width: "28px",
													height: "28px",
													borderRadius: "50%",
													backgroundColor: "#A3A3A3",
												}}
												display={"flex"}
												justifyContent={"center"}
												alignItems={"center"}
											>
												<DoNotDisturbIcon sx={{ color: "white" }} />
											</Box>
										) : item.value == "1" ? (
											<Box
												sx={{
													width: "28px",
													height: "28px",
													borderRadius: "50%",
													backgroundColor: "#38CB89",
												}}
												display={"flex"}
												justifyContent={"center"}
												alignItems={"center"}
											>
												<DoneIcon sx={{ color: "white" }} />
											</Box>
										) : item.value == "0" ? (
											<Box
												sx={{
													width: "28px",
													height: "28px",
													borderRadius: "50%",
													backgroundColor: "#d10202",
												}}
												display={"flex"}
												justifyContent={"center"}
												alignItems={"center"}
											>
												<ClearIcon
													sx={{ color: "white", fontSize: "20px" }}
												/>
											</Box>
										) : (
											""
										)}
									</div>
								</div>
							</Grid>
						))}
				</Grid>
			</Box>
			<Grid
				className="notes-div"
				item
				xs={12}
				sm={8}
				sx={{
					boxShadow: "0px 8px 18px 0px #9B9B9B1A;",
					backgroundColor: Colors.white,
					padding: "10px",
					width: "50%",
					borderRadius: "15px",
					m: 4,
					p: 4,
				}}
			>
				<Typography variant="subtitle1" sx={{ color: Colors.smokeyGrey }}>
					Notes
				</Typography>
				<Typography variant="body1" sx={{ fontFamily: FontFamily.NunitoRegular }}>
					{ExportVehicleDetails?.notes}
				</Typography>
			</Grid>
			<Grid item xs={12} sm={12} sx={{ m: 4, textAlign: "right" }}>
				<PrimaryButton
					title="Back"
					style={{ backgroundColor: Colors.greyShade }}
					onClick={() => navigate(-1)}
				/>
			</Grid>
		</Box>
	);
}

export default ViewExportVehicle;
