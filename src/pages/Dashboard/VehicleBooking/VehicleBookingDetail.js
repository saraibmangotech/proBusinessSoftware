import React, { Fragment, useEffect, useState } from "react";
import {
	Box,
	Divider,
	Tooltip,
	Grid,
	ImageList,
	ImageListItem,
	Typography,
	IconButton,
	Dialog,

} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import { ErrorToaster } from "components/Toaster";
import Colors from "assets/Style/Colors";
import JSZip from "jszip";
import { Icons, FontFamily } from "assets";
import CustomerServices from "services/Customer";
import VehicleBookingServices from "services/VehicleBooking";
import moment from "moment";
import UploadedFile from "components/UploadedFile";
import ReactImageMagnify from "react-image-magnify";
import { CloudDownload, FullscreenOutlined, HdOutlined, CancelOutlined } from "@mui/icons-material";
import "viewerjs/dist/viewer.css";
import ImageLightBox from "components/ImageLightBox";
import axios from 'axios';
import { saveAs } from 'file-saver';
import FsLightbox from "fslightbox-react";
import { Button } from "@mui/base";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function VehicleBookingDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { state } = useLocation();
	const [toggler, setToggler] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [baseUrlImages, setbaseUrlImages] = useState([])
	const [open, setOpen] = React.useState(false);


	// *For Vehicle Detail
	const [vehicleDetails, setVehicleDetails] = useState();
	const [customerDetails, setCustomerDetails] = useState();
	const [slidePictures, setSlidePictures] = useState([])

	// *For Pictures
	const [pictures, setPictures] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);

	const openLightbox = () => {


		const picturesWithBaseUrl = pictures.map((picture) => process.env.REACT_APP_IMAGE_BASE_URL + picture);
		let pics = ['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D']
		setbaseUrlImages(picturesWithBaseUrl)


		setToggler(!toggler);
	};
	const handleCounter = (move) => {
		if (move == 'left') {
			setImageIndex(imageIndex - 1)
		}
		else {
			setImageIndex(imageIndex + 1)
		}


	}
	// *For Get Customer Booking
	const getCustomerBooking = async (id) => {
		try {
			const { data } = await CustomerServices.getCustomerBooking();
			setCustomerDetails(data?.customers.find((e) => e.id === id));
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

	// *For Get Vehicle Booking Detail
	const getVehicleBookingDetail = async () => {
		try {
			let params = { booking_id: id };
			if (state?.shipping) {
				params.shipping_details = true;
			}
			const { data } = await VehicleBookingServices.getVehicleBookingDetail(params);
			const { details } = data;
			setVehicleDetails(details);
			setPictures(details?.pictures);
			console.log(details?.pictures);
		
			let slides=details?.pictures?.map((item,index)=>{
				return{
					src:item?.includes('https') ? item : process.env.REACT_APP_IMAGE_BASE_URL + item,
					alt: `image${index}`,
					width: 3840,
					height: 2560,
				}
			})
			setSlidePictures(slides)
	
			getCustomerBooking(details?.customer_id);
		} catch (error) {
			ErrorToaster(error);
		}
	};



	useEffect(() => {
		if (id) {
			getVehicleBookingDetail();
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
							Vehicle Booking Detail
						</Typography>
						<Divider sx={{ my: 2 }} />
					</Grid>
			
					<Lightbox
						open={open}
						close={() => setOpen(false)}
						slides={slidePictures}
					/>
					<Grid item xs={12} sm={5.5} sx={{ position: 'relative' }} >
						<Box display={'flex'} justifyContent={"space-between"} sx={{ position: 'absolute', top: '20%', zIndex: 1, width: '97%' }}>
							{<button style={{ border: 'none', backgroundColor: 'transparent' }} disabled={imageIndex != 0 ? false : true} onClick={() => handleCounter('left')}><ChevronLeftIcon sx={{ color: 'white', fontSize: '40px', cursor: 'pointer' }} /></button>}
							{<button style={{ border: 'none', backgroundColor: 'transparent' }} disabled={imageIndex != pictures.length - 1 ? false : true} onClick={() => handleCounter('right')}><ChevronRightIcon sx={{ color: 'white', fontSize: '40px', cursor: 'pointer' }} /></button>}
						</Box>
						{pictures?.length > 0 && (
							<Fragment>
								<Box sx={{ position: "relative" }}>
									<ReactImageMagnify
										{...{
											smallImage: {
												src:
													pictures[imageIndex]?.includes('https') ? pictures[imageIndex] : process.env.REACT_APP_IMAGE_BASE_URL +
														pictures[imageIndex],
												isFluidWidth: true,
											}, largeImage: {
												src:
													pictures[imageIndex]?.includes('https') ? pictures[imageIndex] : process.env.REACT_APP_IMAGE_BASE_URL +
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
										<Box sx={{ mb: 1 }} onClick={() => setOpen(true)}>
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
													onClick={(e) => {
														e.stopPropagation()
														handleDownloadClick()
													}}
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
									{pictures?.map((item, index) => (
										<ImageListItem
											key={index}
											onClick={() => setImageIndex(index)}
											sx={{
												border: `1px solid ${index === imageIndex
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
												src={item?.includes('https') ? item : process.env.REACT_APP_IMAGE_BASE_URL + item}
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

						<>

							<FsLightbox
								toggler={toggler}
								sources={baseUrlImages}
							/>
						</>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "flex-start",
									alignItems: "center",
									width: "150px",
									lineHeight: "0",
								}}
							>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Purchase Date:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.purchase_date
										? moment(vehicleDetails?.purchase_date).format(
											"MM-DD-YYYY"
										)
										: "N/A"}
								</Typography>
							</Box>
						</Box>
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
									{vehicleDetails?.vin}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									LOT Number:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.lot_number}
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
									{vehicleDetails?.veh_make?.name}
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
									{vehicleDetails?.veh_model?.name}
								</Typography>
							</Box>
						</Box>
						<Box>
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
										{vehicleDetails?.color}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										width: "150px",

										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										Country:
									</Typography>
								</Box>
								<Box sx={{ width: "150px" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{vehicleDetails?.location?.country_name}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-start",
										alignItems: "center",
										width: "150px",
										gap: "10px",
										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										Location:
									</Typography>
								</Box>
								<Box sx={{ width: "150px" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{vehicleDetails?.location?.state_code + "-" + vehicleDetails?.location?.city_name}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-start",
										alignItems: "center",
										width: "150px",
										gap: "10px",
										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										Key:
									</Typography>
								</Box>
								<Box sx={{ width: "150px" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{vehicleDetails?.key == "N/A" ? "-" : vehicleDetails?.key}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-start",
										alignItems: "center",
										width: "150px",
										gap: "10px",
										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										Title Status:
									</Typography>
								</Box>
								<Box sx={{ width: "150px" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{vehicleDetails?.title_status}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-start",
										alignItems: "center",
										width: "150px",
										gap: "10px",
										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										Title Received Date:
									</Typography>
								</Box>
								<Box sx={{ width: "150px" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{vehicleDetails?.title_receive_date
											? moment(vehicleDetails?.title_receive_date).format(
												"MM-DD-YYYY"
											)
											: "N/A"}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ display: "flex", mb: 1.5 }}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "flex-start",
										alignItems: "center",
										width: "150px",
										lineHeight: "0",
									}}
								>
									<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
										Towed By:
									</Typography>
								</Box>
								<Box sx={{ width: "150px" }}>
									<Typography
										variant="body1"
										sx={{ fontFamily: FontFamily.NunitoRegular }}
									>
										{vehicleDetails?.tower
											? vehicleDetails?.tower?.name
											: "-"}
									</Typography>
								</Box>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Auctioneer:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.auctioneer}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Pickup Date:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.pickup_date
										? moment(vehicleDetails?.pickup_date).format("MM-DD-YYYY")
										: "N/A"}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Delivery Date:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.delivery_date
										? moment(vehicleDetails?.delivery_date).format("MM-DD-YYYY")
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
								<img src={Icons?.user} alt="" width={"14px"} height={"14px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Customer Name:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.customer?.name}
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
								<img src={Icons?.card1} alt="" width={"15px"} height={"12px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Buyer ID:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.buyer?.name}
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
								<img src={Icons?.card2} alt="" width={"15px"} height={"12px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Customer ID:
								</Typography>
							</Box>
							<Box sx={{ width: "45%" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.customer?.ref_id}
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
								<img src={Icons?.call} alt="" width={"15px"} height={"15px"} />
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Contact :
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
								<img src={Icons?.Message} alt="" width={"15px"} height={"12px"} />
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
								mt: 10,
								fontWeight: "bold",
							}}
						>
							Price Information
						</Typography>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Currency:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.currency}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Value:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.value}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ display: "flex", mb: 1.5 }}>
							<Box sx={{ width: "150px" }}>
								<Typography variant="body1" sx={{ color: Colors.smokeyGrey }}>
									Other Charges:
								</Typography>
							</Box>
							<Box sx={{ width: "150px" }}>
								<Typography
									variant="body1"
									sx={{ fontFamily: FontFamily.NunitoRegular }}
								>
									{vehicleDetails?.other_charges}
								</Typography>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Box>
			<Box sx={{ m: 4, p: 2, borderRadius: 3 }}>
				<Grid container sx={{ gap: "15px" }}>
					{state?.shipping && (
						<Fragment>
							<Grid item xs={12} sm={12}>
								<Typography
									variant="h5"
									sx={{
										color: Colors.charcoalGrey,
										fontFamily: FontFamily.NunitoRegular,
										mb: 4,
									}}
								>
									Container Information
								</Typography>
							</Grid>
							<Grid
								item
								xs={12}
								sm={3.8}
								sx={{
									backgroundColor: Colors.white,
									borderRadius: "15px",
									boxShadow: "0px 8px 18px 0px #9B9B9B1A;",
									padding: "15px !important",
									borderLeft: "2px solid #9B9B9B1A",
								}}
							>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Container No:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.container_no ?? "-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Container Size:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.container?.name ??
												"-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Booking No:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.booking_no ?? "-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Shipping Line:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.ship_line?.name ??
												"-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Vendor Yard:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.vendor_yard ?? "-"}
										</Typography>
									</Box>
								</Box>
								{/* <Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Service Provider:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.service?.name ??
												"-"}
										</Typography>
									</Box>
								</Box> */}
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Loading Port:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.loading_port
												?.name ?? "-"}
										</Typography>
									</Box>
								</Box>
							</Grid>
							<Grid
								item
								xs={12}
								sm={3.8}
								sx={{
									backgroundColor: Colors.white,
									borderLeft: "",
									borderRadius: "15px",
									boxShadow: "0px 8px 18px 0px #9B9B9B1A;",
									padding: "15px !important",
									borderLeftColor: "5px solid #9B9B9B1A",
								}}
							>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Country:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.location?.country_name ?? "-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											State:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.location?.state_name ?? "-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Destination:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.dest?.name ?? "-"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Shipping Vendor:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.ship_vendor?.name}
										</Typography>
									</Box>
								</Box>

								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Cleared By:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.shipping?.clearer?.name}
										</Typography>
									</Box>
								</Box>
							</Grid>
							<Grid
								item
								xs={12}
								sm={3.8}
								sx={{
									backgroundColor: Colors.white,
									borderLeft: "",
									borderRadius: "15px",
									boxShadow: "0px 8px 18px 0px #9B9B9B1A;",
									padding: "15px !important",
								}}
							>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Loading Date:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.loading_date
												? moment(
													vehicleDetails?.vehicle?.loading_date
												).format("MM-DD-YYYY")
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Export Date:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.export_date
												? moment(
													vehicleDetails?.vehicle?.export_date
												).format("MM-DD-YYYY")
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											ETA:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.eta
												? moment(vehicleDetails?.vehicle?.eta).format(
													"MM-DD-YYYY"
												)
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Arrived At Port Date:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.arrived_port_date
												? moment(
													vehicleDetails?.vehicle?.arrived_port_date
												).format("MM-DD-YYYY")
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Arrived At Galaxy Yard Date:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.arrived_galaxy_date
												? moment(
													vehicleDetails?.vehicle?.arrived_galaxy_date
												).format("MM-DD-YYYY")
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Date Picked From Auction:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.picked_auction_date
												? moment(
													vehicleDetails?.vehicle?.picked_auction_date
												).format("MM-DD-YYYY")
												: "N/A"}
										</Typography>
									</Box>
								</Box>
								<Box sx={{ display: "flex", mb: 1.5 }}>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.smokeyGrey }}
										>
											Galaxy Yard:
										</Typography>
									</Box>
									<Box sx={{ width: "150px" }}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.vehicle?.g_yard?.name ?? "-"}
										</Typography>
									</Box>
								</Box>
							</Grid>
							
							<Grid sm={12} sx={{ display: "flex", gap: "15px" }}>
								<Grid
									item
									xs={12}
									sm={3.5}
									sx={{
										backgroundColor: Colors.white,
										borderLeft: "",
										borderRadius: "15px",
										boxShadow: "0px 8px 18px 0px #9B9B9B1A;",
										padding: "15px !important",
									}}
								>
									<Box sx={{ mb: 1.5 }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.charcoalGrey }}
										>
											BL
										</Typography>
										{vehicleDetails?.vehicle?.bl ? (
											<UploadedFile
												data={{
													name: "BL",
													file: vehicleDetails?.vehicle?.bl,
													
												}}
											/>
										) : (
											"N/A"
										)}
									</Box>
									<Box sx={{ mb: 1.5 }}>
										<Typography
											variant="body1"
											sx={{ color: Colors.charcoalGrey }}
										>
											Invoice
										</Typography>
										{vehicleDetails?.vehicle?.auction_invoice ? (
											<UploadedFile
												data={{
													name: "Invoice",
													file: vehicleDetails?.vehicle?.auction_invoice,
												}}
											/>
										) : (
											"N/A"
										)}
									</Box>
								</Grid>
							
							</Grid>
						</Fragment>
					)}
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
										p: 4,
									}}
								>
									<Typography
										variant="subtitle1"
										sx={{ color: Colors.smokeyGrey }}
									>
										Notes
									</Typography>
									<Grid xs={6}>
										<Typography
											variant="body1"
											sx={{ fontFamily: FontFamily.NunitoRegular }}
										>
											{vehicleDetails?.notes ?? ''}
										</Typography>
									</Grid>
								</Grid>
					<Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
						<PrimaryButton
							title="Back"
							style={{ backgroundColor: Colors.greyShade }}
							onClick={() => navigate(-1)}
						/>
					</Grid>
				</Grid>
			</Box>
			
		</Box>
	);
}

export default VehicleBookingDetail;
