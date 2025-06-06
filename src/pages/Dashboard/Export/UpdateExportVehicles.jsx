import {
	Grid,
	Box,
	Typography,
	Button,
	ImageList,
	ImageListItem,
	IconButton,
	Tooltip,
	InputLabel,
	Divider,
	InputAdornment,
} from "@mui/material";
import Colors from "assets/Style/Colors";
import * as React from "react";
import { FontFamily, ChecklitsIcons } from "assets";
import { CleanTypes, Debounce, getFileSize, getYearMonthDateFormate } from "utils";
import Compressor from "compressorjs";
import { Fragment } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { CancelOutlined } from "@mui/icons-material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import { useState, useRef, useEffect } from "react";
import routes from "services/System/routes";
import InputField from "components/Input";
import { Icons } from "assets/index";
import JSZip from "jszip";
import DatePicker from "components/DatePicker";
import UploadFile from "components/UploadFile";
import TripleSwitchToggle from "components/Buttons/TrippleSwitch";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import ReactImageMagnify from "react-image-magnify";
import instance from "config/axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ExportServices from "services/Export/index";
import CustomSwitch from "components/Buttons/CustomSwitch";
import { useParams } from "react-router-dom";
import SystemServices from "services/System";
import { CloudDownload, FullscreenOutlined, HdOutlined } from "@mui/icons-material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/zoom";

function UpdateExportVehicles() {
	const { id } = useParams();
	const navigate = useNavigate();

	//*Submit Forms Of Stepper

	const {
		register,
		getValues,
		formState: { errors },
	} = useForm();

	const {
		register: register1,
		handleSubmit: handleSubmit1,
		formState: { errors: errors1 },
		getValues: getValues1,
		setValue: setValue1,
		watch,
	} = useForm();

	const {
		register: register2,
		handleSubmit: handleSubmit2,
		formState: { errors: errors2 },
		getValues: getValues2,
		setValue: setValue2,
		watch1,
	} = useForm();

	const {
		register: register3,
		handleSubmit: handleSubmit3,
		formState: { errors: errors3 },
		getValues: getValues3,
		setValue: setValue3,
		watch2,
	} = useForm();

	const allowFilesType2 = ["application/pdf"];

	//year Options
	const currentYear = new Date().getFullYear();
	const yearsArray = [];

	for (let year = currentYear; year >= 1985; year--) {
		yearsArray.push({ id: year, name: year });
	}

	//Pickup Options
	const pickupOptions = [
		{ id: "Garage", name: "Garage" },
		{ id: "Location in UAE", name: "Location in UAE" },
	];
	//Payment At Options
	const paymentatOptions = [
		{ id: "GWS", name: "GWS" },
		{ id: "Destination", name: "Destination" },
	];

	//*Stepper Options
	const steps = ["Customer Details", "Vehicle Info", "Vehicle Condition", "Shipping Charges"];

	// *For Select Type
	const [selectedType, setSelectedType] = useState("");

	// *For Upload File types
	const allowFilesType = ["image/png", "image/jpg", "image/jpeg"];

	//Viewer Ref

	const viewerRef = useRef();

	//*For Pictures Slider
	const [pictures, setPictures] = useState([]);
	const [pictureLoading, setPictureLoading] = useState(false);
	const [imageIndex, setImageIndex] = useState(0);

	//*For Users Dropdown Options
	const [customersOptions, setCustomersOptions] = useState([]);
	const [brokerOptions, setBrokerOptions] = useState([]);
	const [agentOptions, setagentOptions] = useState([]);

	//*ForfinalPrice
	const [finalPrice, setFinalPrice] = useState(false);

	//*For Users Dropdown Selected Values
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [selectedBroker, setSelectedBroker] = useState(null);
	const [selectedAgent, setSelectedAgent] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState(null);

	//*For Vehicles Dropdown Options
	const [destinationOptions, setDestinationOptions] = useState([]);
	const [statusOptions, setStatusOptions] = useState([]);
	const [makeOptions, setMakeOptions] = useState([]);
	const [modelOptions, setModelOptions] = useState([]);
	const [colorOptions, setColorOptions] = useState([]);

	const [documents, setDocuments] = useState([]);

	//*For Vehicles Dropdown Selected Values
	const [selectedModel, setSelectedModel] = useState(null);
	const [selectedYear, setSelectedYear] = useState(null);
	const [selectedMake, setSelectedMake] = useState(null);
	const [selectedColor, setSelectedColor] = useState(null);
	const [selectedPickup, setSelectedPickup] = useState(null);
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [selectedDestination, setSelectedDestination] = useState(null);
	const [fileInputKey, setFileInputKey] = useState(Date.now());

	//*For User Details
	const [username, setUsername] = useState();
	const [userEmail, setUserEmail] = useState();
	const [userPhone, setUserPhone] = useState();

	//*For Vehicle Conditions
	const [loading, setLoading] = useState(false);
	const [isDamage, setIsDamage] = useState(true);
	const [IsPicture, setIsPicture] = useState(false);
	const [purchaseDate, setPurchaseDate] = useState();
	const [IsKey, setIsKey] = useState(true);
	const [start, setStart] = useState(true)

	const [etaDate, setEtaDate] = useState()
	//*For Checklist
	const [checklist, setChecklist] = useState();
	const [checkListSubmit, setCheckListSubmit] = useState();
	const [toggleStates, setToggleStates] = useState(checklist);
	const [Data, setData] = useState();

	// *For Stepper Forms Data
	const [step1FormData, setStep1FormData] = useState();
	const [step2FormData, setStep2FormData] = useState();
	const [step3FormData, setStep3FormData] = useState();

	// for get Data
	const getVehicleExportDetails = async () => {
		try {
			let params = { ev_id: id };

			const { data } = await ExportServices.getVehicleExportDetails(params);
			console.log(data);
			setDocuments(data?.vehicle?.documents)
			setChecklist(data?.vehicle?.checklist);
			setToggleStates(data?.vehicle?.checklist);
			setCheckListSubmit(data?.vehicle?.checklist);
			setData(data?.vehicle);

			setPictures(data?.vehicle.pictures);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const handleClickStart = (event) => {
		event.preventDefault();
		setStart((prevstart) => !prevstart);
	};

	///For get Customers
	const getCustomers = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				name: search,
			};
			const { data } = await ExportServices.getExportCustomers(params);
			setCustomersOptions(data?.customers?.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For get Broker
	const getBroker = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				search: search,
				broker_type: 2,
			};
			const { data } = await ExportServices.getExportCustomers(params);
			setBrokerOptions(data?.customers?.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For get Agents
	const getAgent = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				search: search,
				broker_type: 1,
			};
			const { data } = await ExportServices.getExportCustomers(params);
			setagentOptions(data?.customers?.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//Get Destinations

	const getFinalDestination = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				search: search,
			};
			const { data } = await ExportServices.getFinalDestination(params);
			const updateData = data?.destinations?.map((item) => {
				return {
					id: item.id,
					name: item?.name + "-" + item?.country?.name,
					country_id: item.country_id,
				};
			})
			setDestinationOptions(updateData);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For Status
	const getStatus = async () => {
		try {
			const { data } = await ExportServices.getVehicleStatus();
			setStatusOptions(data?.statuses);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For Make
	const getMake = async () => {
		try {
			const { data } = await ExportServices.getMake();
			setMakeOptions(data?.makes.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For Models
	const getModels = async (search) => {
		try {
			let params = {
				page: 1,
				limit: 50,
				make_id: search,
			};
			const { data } = await ExportServices.getModel(params);
			setModelOptions(data?.models?.rows);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	///For Colors
	const getColors = async (search) => {
		try {
			const { data } = await ExportServices.getColors();
			const colorsArray = [];
			data?.colors?.forEach((element) => {
				let obj = {
					id: element,
					name: element,
				};
				colorsArray.push(obj);
			});
			setColorOptions(colorsArray);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const allPictures = [...pictures];
	const handleUploadDocument = async (e) => {
		setPictureLoading(true);
		try {
			e.preventDefault();
			const files = Array.from(e.target.files);

			files.forEach(async (element) => {
				if (allowFilesType.includes(element.type)) {
					new Compressor(element, {
						quality: 0.8,
						success: (compressedImage) => {
							// compressedResult has the compressed file.
							// Use the compressed file to upload the images to your server.
							// setCompressedFile(res)

							handleUpload(compressedImage);
						},
					});
					setFileInputKey(Date.now());
				} else {
					ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
				}
			});
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const handleUpload = async (file) => {
		try {
			const formData = new FormData();
			formData.append("document", file);
			const { data } = await instance.post(routes.uploadDocuments, formData);
			if (data) {
				allPictures.push(data?.data?.nations);
				Debounce(() => setPictures(allPictures));
			}
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setPictureLoading(false);
		}
	};

	// *For Remove Picture
	const removePicture = (index) => {
		try {
			let shallowPicture = [...pictures];
			shallowPicture.splice(index, 1);
			setPictures(shallowPicture);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	const handleUploadDocument2 = async (e) => {
		const alldocuments = [...documents];
		setPictureLoading(true);
		try {
			e.preventDefault();
			const files = Array.from(e.target.files);
			console.log(files, 'files');
			const uploadPromises = files.map(async (element) => {
				try {
					console.log(allowFilesType2.includes(element.type), 'allowFilesType2.includes(element.type)');
					if (allowFilesType2.includes(element.type)) {
						// Check if the file is a PDF
						if (element.type === 'application/pdf') {
							// Handle PDF upload logic here (you may want to use a different library for PDFs)
							const formData = new FormData();
							formData.append("document", element);

							const { data } = await instance.post(routes.uploadDocuments, formData);
							alldocuments.push(data?.data?.nations)
							console.log(alldocuments, 'alldocuments');
							setDocuments(alldocuments)
						}
					} else {
						ErrorToaster(`Only ${CleanTypes(allowFilesType2)} formats are supported`);
					}
				} catch (error) {
					ErrorToaster(error);
				}
			});

			// Wait for all file uploads to complete
			await Promise.all(uploadPromises);
		} catch (error) {
			ErrorToaster(error);
		} finally {
			setPictureLoading(false);
		}
	};
	///for Download Zip
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

	//*Checklist Change Function

	const handleToggleChange = (index, newValue) => {
		setToggleStates((prevStates) => {
			const newStates = [...prevStates];
			newStates[index].value = newValue;
			setCheckListSubmit(newStates);

			return newStates;
		});
	};

	//*Vehicle Conditions Functions

	const handleClickDamage = (event) => {
		event.preventDefault();
		setIsDamage((previsDamage) => !previsDamage);
	};

	const handleClickPicture = (event) => {
		event.preventDefault();
		setIsPicture((prevIsPicture) => !prevIsPicture);
	};

	const handleClickKey = (event) => {
		event.preventDefault();
		setIsKey((prevIsKey) => !prevIsKey);
	};

	//*Discount Change

	const handleDiscountChange = (e) => {
		const discountValue = e.target.value;
		const priceValue = +getValues3("price");

		if (priceValue > +discountValue) {
			setValue3("finalPrice", priceValue - discountValue);
		} else {
			setValue3("Discount", +priceValue);
			setValue3("finalPrice", 0);
		}
	};
		//*Handle Date
		const handleEtaDate = (newDate) => {
			try {
				if (newDate === "Invalid Date") {
					setEtaDate("invalid");
					return;
				}
				setEtaDate(new Date(newDate));
				setValue3('etaDateVal',(new Date(newDate)))
			} catch (error) {
				ErrorToaster(error);
			}
		};

	//*Price Change

	const handlePriceChange = (e) => {
		Debounce(() => {
			if (+getValues3("price") < +getValues3("Discount")) {
				Debounce(() => {
					setValue3("price", +getValues3("Discount") + 1);
					setValue3("finalPrice", +getValues3("price") - getValues3("Discount"));
				});
			} else {
				setValue3("finalPrice", +getValues3("price") - getValues3("Discount"));
			}
		});
	};

	//* Stepper
	const [activeStep, setActiveStep] = React.useState(0);
	const [skipped, setSkipped] = React.useState(new Set());

	const isStepOptional = (step) => {
		return step === 4;
	};

	const isStepSkipped = (step) => {
		return skipped.has(step);
	};

	const handleNext = () => {
		let newSkipped = skipped;
		if (isStepSkipped(activeStep)) {
			newSkipped = new Set(newSkipped.values());
			newSkipped.delete(activeStep);
		}

		setActiveStep((prevActiveStep) => prevActiveStep + 1);
		setSkipped(newSkipped);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleSkip = () => {
		if (!isStepOptional(activeStep)) {
			// You probably want to guard against something like this,
			// it should never occur unless someone's actively trying to break something.
			throw new Error("You can't skip a step that isn't optional.");
		}

		setActiveStep((prevActiveStep) => prevActiveStep + 1);
		setSkipped((prevSkipped) => {
			const newSkipped = new Set(prevSkipped.values());
			newSkipped.add(activeStep);
			return newSkipped;
		});
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	//*User Data
	const handleUserData = () => {
		const selectedCustomerObject = customersOptions.find(
			(option) => option.id === selectedCustomer?.id
		);

		if (selectedCustomerObject) {
			setUsername(selectedCustomerObject.name);
			setUserEmail(selectedCustomerObject.email);
			setUserPhone(selectedCustomerObject.uae_phone);
		} else {
		}
	};

	// *For Submit Form 1
	const submitForm1 = async (formData) => {
		try {
			let obj = {
				customer_id: selectedCustomer?.id,
				customer_name: selectedCustomer?.name,
				customer_phone:userPhone,
				agent_id: selectedAgent?.id,
				broker_id: selectedBroker?.id,
			};

			setStep1FormData(obj);
			handleNext();
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Submit Form 2
	const submitForm2 = async (formData) => {
		try {
			let obj = {
				vin: formData?.VIN,
				make_id: selectedMake?.id,
				model_id: selectedModel?.id,
				year: formData?.Year,
				color: formData?.Color,
				status_id: selectedStatus?.id,
				pictures: pictures,
				documents: documents,
				date: getYearMonthDateFormate(purchaseDate),
			};

			setStep2FormData(obj);
			handleNext();
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Submit Form 3

	const submitForm3 = async (formData) => {
		try {
			let obj = {
				...step1FormData,
				...step2FormData,
				ev_id: id,
				pickup_from: formData?.Pickupfrom,
				uae_location: formData?.Location,
				final_destination_id: selectedDestination?.id,
				payment_at: formData?.Paymentat,
				price: formData?.price,
				discount: formData?.Discount,
				eta: getYearMonthDateFormate(etaDate),
				final_price: formData?.finalPrice,
				checklist: checkListSubmit,
				damage_on_receiving: isDamage,
				notes: formData?.Notes,
				key: IsKey,
			};

			setStep3FormData(obj);
			const { message } = await ExportServices.VehicleStatusUpdate(obj);
			SuccessToaster(message);
			navigate("/list-export-vehicle");
		} catch (error) {
			ErrorToaster(error);
		}
	};
	// *For Create Make
	const createMake = async (name) => {
		try {
			let obj = {
				name: name,
			};
			const { data } = await SystemServices.createMake(obj);
			getMake();
			setSelectedMake(data?.make);
			setValue2("Make", data?.make?.name);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Create Model
	const createModel = async (name) => {
		try {
			let obj = {
				name: name,
				make_id: selectedMake?.id,
			};
			const { data } = await SystemServices.createModel(obj);
			getModels(obj?.make_id);
			setSelectedModel(data?.model);
			setValue2("Model", data?.model?.name);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	// *For Create Color
	const createColor = async (name) => {
		try {
			let obj = {
				color: name,
			};
			const { data } = await SystemServices.createColor(obj);
			getColors();
			setSelectedColor({ id: data?.color, name: data?.color });
			setValue2("Color", data?.color);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*Date Function

	const handlePurchaseDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == "Invalid Date") {
				setPurchaseDate("invalid");
				return;
			}
			setPurchaseDate(newDate ? new Date(newDate) : newDate);
		} catch (error) {
			ErrorToaster(error);
		}
	};

	//*UseEffects

	useEffect(() => {
		getCustomers();
		getBroker();
		getAgent();

		getFinalDestination();
		getStatus();
		getModels();
		getMake();
		getVehicleExportDetails();
		getColors();
	}, []);

	useEffect(() => {
		if (pictures.length > 0) {
			setIsPicture(true);
		}
	}, [pictures.length]);

	useEffect(() => {
		if (selectedCustomer?.id) {
			handleUserData();
		}
	}, [selectedCustomer?.id]);

	useEffect(() => {
		if (Data) {
			setValue1("Customer", Data?.customer?.name);
			setValue1("Agent", Data?.agent?.name);
			setValue1("Broker", Data?.broker?.name);
			handlePurchaseDate(Data?.date);
			handleEtaDate(Data?.eta);
			setValue2("Status", Data?.status?.name);
			setValue2("VIN", Data?.vin);
			setValue2("Make", Data?.make?.name);
			setValue2("Model", Data?.model?.name);
			setValue2("Year", Data?.year);
			setValue2("Color", Data?.color);
			setValue3("Pickupfrom", Data?.pickup_from);
			setValue3("FinalDestination", Data?.destination?.name);
			setValue3("Location", Data?.uae_location);
			setValue3("Paymentat", Data?.payment_at);
			setValue3("price", Data?.price);
			setValue3("Discount", Data?.discount);
			setValue3("finalPrice", Data?.final_price);
			setValue3("Notes", Data?.notes);
		}
		setSelectedCustomer(Data?.customer);
		setSelectedAgent(Data?.agent);
		setSelectedBroker(Data?.broker);
		setSelectedStatus(Data?.status);
		setSelectedMake(Data?.make);
		setSelectedModel(Data?.model);
		setSelectedYear({ id: Data?.year, name: Data?.year });
		setSelectedColor(Data?.color);
		setSelectedPickup(Data?.pickup_from);
		setSelectedDestination(Data?.destination?.name);
		setSelectedPayment(Data?.payment_at);
		handleUserData();
	}, [Data]);

	return (
		<Box>
			<Box>
				<Box sx={{ width: "90%", margin: "0 auto", mt: 10 }}>
					<Stepper activeStep={activeStep}>
						{steps.map((label, index) => {
							const stepProps = {};
							const labelProps = {};
							if (isStepOptional(index)) {
								labelProps.optional = (
									<Typography variant="caption">Optional</Typography>
								);
							}
							if (isStepSkipped(index)) {
								stepProps.completed = false;
							}
							return (
								<Step key={label} {...stepProps}>
									<StepLabel {...labelProps}>{label}</StepLabel>
								</Step>
							);
						})}
					</Stepper>

					{activeStep === steps.length ? (
						<React.Fragment>
							<Typography sx={{ mt: 2, mb: 1 }}>
								All steps completed - you&apos;re finished
							</Typography>
							<Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
								<Box sx={{ flex: "1 1 auto" }} />
								<Button onClick={handleReset}>Reset</Button>
							</Box>
						</React.Fragment>
					) : (
						""
					)}
				</Box>

				{/* //* Step 1 */}

				{activeStep === 0 && (
					<Box
						component={"form"}
						onSubmit={handleSubmit1(submitForm1)}
						sx={{ p: 4, m: 4 }}
					>
						<Grid container spacing={0.5} justifyContent={"space-between"}>
							<Grid item md={12} lg={6.5}>
								{" "}
								<Grid
									container
									sx={{ width: "100%", justifyContent: "space-between" }}
								>
									<Grid
										component={"form"}
										container
										sm={12}
										md={12}
										spacing={0}
										sx={{
											border: "1px solid #D9D9D9",
											borderRadius: "5px",
											backgroundColor: "#EEFBEE",
											paddingBottom: "0px",
											height: "auto",
										}}
									>
										<Grid item md={12} lg={6} sx={{ p: 2, pb: 0 }}>
											<SelectField
												size={'small'}
												label={"Select Customer"}
												options={customersOptions}
												onSearch={(v) => getCustomers(v)}
												selected={selectedCustomer}
												onSelect={(value) => {
													setSelectedCustomer(value);
													handleUserData(value?.id);
												}}
												error={errors1?.Customer?.message}
												register={register1("Customer", {
													required: "Please enter customer.",
												})}
											/>
										</Grid>
										<Grid
											item
											sm={12}
											md={6}
											lg={6}
											display="flex"
											alignItems="center"
											sx={{ height: "135px" }}
											justifyContent="center"

										>
											<PrimaryButton
												title="Add New"
												src={Icons.addImg}
												onClick={() => navigate("/create-customer")}
												loading={loading}
												bgcolor="#25ABE1"
											/>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
							<Grid item md={12} lg={5}>
								<Grid
									container
									sm={10}
									md={12}
									sx={{
										border: "1px solid black",
										backgroundColor: "#D2F2FF",
										border: "1px solid #D9D9D9",
										gap: "20px",
										padding: "10px",
										borderRadius: "5px",
										paddingBottom: "17px",
										paddingTop: "20px",
									}}
									display={"flex"}
									justifyContent={"space-evenly"}
								>
									<Grid item xs={5} sx={{ gap: "20px" }}>
										<SelectField
											size={'small'}
											label={"Select Agent"}
											options={agentOptions}
											onSearch={(v) => getAgent(v)}
											selected={selectedAgent}
											onSelect={(value) => setSelectedAgent(value)}
											// error={errors?.auctionHouses?.message}
											register={register1("Agent")}
										/>
									</Grid>
									<Grid item xs={5} sx={{ gap: "20px" }}>
										<SelectField
											size={'small'}
											label={"Select Broker"}
											options={brokerOptions}
											onSearch={(v) => getBroker(v)}
											selected={selectedBroker}
											onSelect={(value) => setSelectedBroker(value)}
											// error={errors?.auctionHouses?.message}
											register={register1("Broker")}
										/>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Box
							sx={{
								mt: 4,
								p: 5,
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
										Vehicle Ownership
									</Typography>
								</Grid>
								<Grid item xs={12} sm={6} md={4}>
									<InputField
										disabled={true}
										size={'small'}
										value={username}
										label={"Customer Name"}
										placeholder={"Customer Name"}
										labelIcon={Icons.NameIcon}
										// error={errors?.auctionHouse?.message}
										register={register("CustomerName")}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={4}>
									<InputField
										disabled={true}
										size={'small'}
										label={"Contact Number"}
										value={userPhone}
										placeholder={"Contact Number"}
										labelIcon={Icons.NumberIcon}
										type={"number"}
										// error={errors?.auctionHouse?.message}
										register={register("ContactNumber")}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={4}>
									<InputField
										disabled={true}
										label={"Email ID"}
										size={'small'}
										value={userEmail}
										placeholder={"Email ID"}
										labelIcon={Icons.EmailIcon}
										type={"email"}
										// error={errors?.auctionHouse?.message}
										register={register("EmailID")}
									/>
								</Grid>
							</Grid>
						</Box>
						<Grid item xs={12} sm={12} sx={{ mt: 4, textAlign: "right", p: 4 }}>
							<PrimaryButton title="Next" type="submit" loading={loading} />
						</Grid>
					</Box>
				)}

				{/* Step 2 */}

				{activeStep === 1 && (
					<Box component={"form"} onSubmit={handleSubmit2(submitForm2)}>
						<Box
							sx={{
								m: 4,
								p: 5,
								bgcolor: Colors.white,
								borderRadius: 3,
								boxShadow: "0px 8px 18px 0px #9B9B9B1A",
							}}
						>
							<Grid container spacing={2}>
								<Grid container display={"flex"} alignItems={"center"}>
									<Grid item xs={6} md={3}>
										<Typography
											variant="h5"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												mb: 4,
											}}
										>
											Vehicle Info
										</Typography>
									</Grid>
									<Grid
										item
										sm={12}
										md={12}
										lg={4.5}
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: "10px",
										}}
									>
										<InputLabel sx={{ width: "50%", textAlign: "right" }}>
											Date{" "}
										</InputLabel>
										<DatePicker
											size="small"
											value={purchaseDate}
											register={register2("Date")}
											onChange={(date) => handlePurchaseDate(date)}
										/>
									</Grid>
									<Grid
										item
										sm={12}
										md={12}
										lg={4.5}
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											gap: "10px",
										}}
									>
										<InputLabel sx={{ width: "50%", textAlign: "right" }}>
											Status{" "}
										</InputLabel>
										<Box sx={{ width: "90%", mt: "1.5%" }}>
											<SelectField
												options={statusOptions}
												selected={selectedStatus}
												onSelect={(value) => {
													setSelectedStatus(value);
													setPurchaseDate(new Date());
												}}
												size="small"
												error={errors2?.Status?.message}
												register={register2("Status", {
													required: "Please select  status.",
												})}
											/>
										</Box>
									</Grid>
								</Grid>
							</Grid>
							<Divider sx={{ my: 2.5 }} />
							<Grid container spacing={4}>
								<Grid item sm={12} md={12} lg={3}>
									<Grid item xs={12} sm={12} md={12}>
										<InputField
											size={'small'}
											label={"VIN"}
											placeholder={"VIN"}
											error={errors2?.VIN?.message}
											register={register2("VIN", {
												required: "Please enter VIN No.",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={12} md={12}>
										<SelectField
											size={'small'}
											label={"Year"}
											options={yearsArray}
											selected={selectedYear}
											onSelect={(value) => {
												setSelectedYear(value);
											}}
											error={errors2?.Year?.message}
											register={register2("Year", {
												required: "Please enter  year.",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={12} md={12}>
										<SelectField
											size={'small'}
											label={"Make"}
											options={makeOptions}
											selected={selectedMake}
											addNew={(newValue) => createMake(newValue)}
											onSearch={(v) => getMake(v)}
											onSelect={(value) => {
												setSelectedMake(value);
												getModels(value?.id);
											}}
											error={errors2?.Make?.message}
											register={register2("Make", {
												required: "Please enter  make.",
											})}
										/>
									</Grid>
									<Grid item xs={12} sm={12} md={12}>
										<SelectField
											size={'small'}
											label={"Model"}
											options={modelOptions}
											selected={selectedModel}
											addNew={(newValue) => createModel(newValue)}
											onSelect={(value) => setSelectedModel(value)}
											error={errors2?.Model?.message}
											register={register2("Model", {
												required: "Please enter  model.",
											})}
										/>
									</Grid>

									<Grid item xs={12} sm={12} md={12}>
										<SelectField
											size={'small'}
											label={"Color"}
											options={colorOptions}
											selected={selectedColor}
											addNew={(newValue) => createColor(newValue)}
											onSelect={(value) => setSelectedColor(value)}
											error={errors2?.Color?.message}
											register={register2("Color", {
												required: "Please enter  color.",
											})}
										/>
									</Grid>
								</Grid>
								<Grid item sm={12} md={12} lg={6} mt={4}>
									{pictures?.length > 0 && (
										<Fragment>
											<Box sx={{ position: "relative" }}>
												<ReactImageMagnify
													{...{
														smallImage: {
															src:
																process.env
																	.REACT_APP_IMAGE_BASE_URL +
																pictures[imageIndex],
															isFluidWidth: true,
														},
														largeImage: {
															src:
																process.env
																	.REACT_APP_IMAGE_BASE_URL +
																pictures[imageIndex],
															width: 1200,
															height: 1200,
														},
														isHintEnabled: true,
														shouldHideHintAfterFirstActivation: false,
														style: {
															zIndex: 999999,
															marginRight: "20%",
														},
													}}
												/>
												<Box
													sx={{
														position: "absolute",
														left: "10px",
														bottom: "10px",
														zIndex: 999999,
													}}
												>
													<Box sx={{ mb: 1 }}>
														<Tooltip
															title={"Full Screen"}
															placement="right-start"
														>
															<IconButton
																size="small"
																sx={{
																	borderRadius: "10px",
																	bgcolor: Colors.darkGrey,
																	"&:hover": {
																		bgcolor: Colors.darkGrey,
																	},
																}}
															>
																<FullscreenOutlined
																	sx={{ color: Colors.white }}
																/>
															</IconButton>
														</Tooltip>
													</Box>
													<Box sx={{ mb: 1 }}>
														<Tooltip
															title={"View HD"}
															placement="right-start"
														>
															<IconButton
																size="small"
																sx={{
																	borderRadius: "10px",
																	bgcolor: Colors.darkGrey,
																	"&:hover": {
																		bgcolor: Colors.darkGrey,
																	},
																}}
															>
																<HdOutlined
																	sx={{ color: Colors.white }}
																/>
															</IconButton>
														</Tooltip>
													</Box>
													<Box>
														<Tooltip
															title={"Download"}
															placement="right-start"
														>
															<IconButton
																size="small"
																onClick={() =>
																	handleDownloadClick()
																}
																sx={{
																	borderRadius: "10px",
																	bgcolor: Colors.darkGrey,
																	"&:hover": {
																		bgcolor: Colors.darkGrey,
																	},
																}}
															>
																<CloudDownload
																	sx={{ color: Colors.white }}
																/>
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
														<IconButton
															sx={{
																position: "absolute",
																top: "0",
																right: "5px",
																width: 15,
																height: 15,
																ml: 0.5,
															}}
															onClick={() => removePicture(index)}
														>
															<CancelOutlined
																sx={{
																	color: Colors.danger,
																	fontSize: 15,
																}}
															/>
														</IconButton>
														<Box
															component={"img"}
															src={
																process.env
																	.REACT_APP_IMAGE_BASE_URL + item
															}
															sx={{
																height: 85,
																width: 85,
																objectFit: "cover",
															}}
														/>
													</ImageListItem>
												))}
											</ImageList>
										</Fragment>
									)}
								</Grid>
								<Grid item xs={3} mt={2}>
									<Typography
										variant="p"
										sx={{
											color: Colors.charcoalGrey,
											fontFamily: FontFamily.NunitoRegular,
											mb: 8,
											fontWeight: "bold",
										}}
									>
										Upload Images
									</Typography>
									<UploadFile
										multiple={true}
										accept={allowFilesType.join(",")}
										register={register("picture", {
											onChange: (e) => handleUploadDocument(e),
										})}
									/>
									<Box sx={{ mt: 5 }}>
										<Typography
											variant="p"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												mb: 8,
												mt: 5,
												fontWeight: "bold",
											}}
										>
											Upload Files (PDF Only)
										</Typography>
										<UploadFile
											multiple={true}
											accept={allowFilesType2.join(",")}
											register={register("pdfs", {
												onChange: (e) => handleUploadDocument2(e),
											})}
										/>

										{documents?.map((item, index) => (
											<Box display={'flex'} mt={2} key={index}>
												<PictureAsPdfIcon sx={{ color: '#c50606', fontSize: '35px' }} />
												<Box sx={{ fontSize: '15px' }}>{item?.split('/').pop()}</Box> {/* Use split to get the file name */}
											</Box>
										))}
									</Box>

								</Grid>
								<Grid item xs={3} mt={2}>
									<Typography
										variant="p"
										sx={{
											color: Colors.charcoalGrey,
											fontFamily: FontFamily.NunitoRegular,
											mb: 8,
											fontWeight: "bold",
										}}
									>
										Upload Images
									</Typography>
									<UploadFile
										multiple={true}
										key={fileInputKey}
										accept={allowFilesType.join(",")}
										register={register("picture", {
											onChange: (e) => handleUploadDocument(e),
										})}
									/>
									{/* {pictures.length > 0 && (
										<Grid item xs={12} sm={12}>
											<ImageList cols={10} ref={viewerRef}>
												{pictures.map((item, index) => (
													<ImageListItem key={index}>
														<Box
															sx={{
																cursor: "pointer",
																position: "relative",
																textAlign: "center",
															}}
														>
															<Box
																component={"img"}
																src={
																	process.env
																		.REACT_APP_IMAGE_BASE_URL +
																	item
																}
																sx={{
																	height: 80,
																	width: 80,
																	objectFit: "contain",
																}}
															/>
															<IconButton
																sx={{
																	position: "absolute",
																	top: "0",
																	right: "5px",
																	width: 15,
																	height: 15,
																	ml: 0.5,
																}}
																onClick={() => removePicture(index)}
															>
																<CancelOutlined
																	sx={{
																		color: Colors.danger,
																		fontSize: 15,
																	}}
																/>
															</IconButton>
														</Box>
													</ImageListItem>
												))}
											</ImageList>
										</Grid>
									)} */}
								</Grid>
							</Grid>
						</Box>
						<Grid
							item
							xs={12}
							sm={12}
							display={"flex"}
							justifyContent={"space-between"}
							sx={{ mt: 4, textAlign: "right", p: 4 }}
						>
							<PrimaryButton
								title="Back"
								color="secondary"
								onClick={handleBack}
								loading={loading}
							/>
							<PrimaryButton title="Next" type="submit" loading={loading} />
						</Grid>
					</Box>
				)}

				{/* //* Step 3*/}
				{activeStep === 2 && (
					<Box component={"form"}>
						<Box
							sx={{
								m: 4,
								p: 5,
								backgroundColor: Colors.white,
								borderRadius: 3,
								boxShadow: "0px 8px 18px 0px #9B9B9B1A",
							}}
						>
							<Typography
								variant="h5"
								sx={{
									color: Colors.charcoalGrey,
									fontFamily: FontFamily.NunitoRegular,
									mb: 4,
								}}
							>
								Vehicle Condition
							</Typography>

							<Grid container sx={{ backgroundColor: "#EAEAEA", padding: "10px" }}>
								<Grid
									item
									xs={3}

									sx={{
										display: "flex",
										justifyContent: "space-evenly",
										borderRight: "2px solid #38CB89",
										paddingRight: "10px",
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<span>
											<img src={Icons.BandageIcon} alt="" width={"20px"} />
										</span>
										<Typography
											variant="p"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												ml: 2,
												fontWeight: "bold",
											}}
										>
											Damage On receiving
										</Typography>
									</Box>
									<CustomSwitch checked={isDamage} onChange={handleClickDamage} />
								</Grid>
								<Grid
									item
									xs={3}

									sx={{
										display: "flex",
										justifyContent: "space-evenly",
										borderRight: "2px solid #38CB89",
										paddingRight: "10px",
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<span>
											<img src={Icons.PictureIcon} alt="" width={"20px"} />
										</span>
										<Typography
											variant="p"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												ml: 2,
												fontWeight: "bold",
											}}
										>
											Pictures
										</Typography>
									</Box>
									<CustomSwitch
										checked={IsPicture}
										onChange={handleClickPicture}
									/>
								</Grid>
								<Grid
									item
									xs={3}

									sx={{ display: "flex", justifyContent: "space-evenly" }}
								>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<span>
											<img src={Icons.PictureIcon} alt="" width={"20px"} />
										</span>
										<Typography
											variant="p"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												ml: 2,
												fontWeight: "bold",
											}}
										>
											Key
										</Typography>
									</Box>
									<CustomSwitch checked={IsKey} onChange={handleClickKey} />
								</Grid>
								<Grid
									item
									xs={3}

									sx={{ display: "flex", justifyContent: "space-evenly", borderLeft: "2px solid #38CB89" }}
								>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<span>
											<img src={Icons.PictureIcon} alt="" width={"20px"} />
										</span>
										<Typography
											variant="p"
											sx={{
												color: Colors.charcoalGrey,
												fontFamily: FontFamily.NunitoRegular,
												ml: 2,
												fontWeight: "bold",
											}}
										>
											Car Start
										</Typography>
									</Box>
									<CustomSwitch checked={start} onChange={handleClickStart} />
								</Grid>
							</Grid>
						</Box>
						<Box
							sx={{
								m: 4,

								backgroundColor: Colors.white,
								borderRadius: 3,
								boxShadow: "0px 8px 18px 0px #9B9B9B1A",
							}}
						>
							<Typography
								variant="h5"
								sx={{
									color: Colors.charcoalGrey,
									fontFamily: FontFamily.NunitoRegular,
									pt: 3,
									pl: 2,
								}}
							>
								Checklist
							</Typography>
							<div className="main-body switch-table" style={{ paddingTop: "3%" }}>
								{toggleStates &&
									toggleStates
										.reduce((chunks, item, index) => {
											if (index % 12 === 0) {
												chunks.push(toggleStates.slice(index, index + 12));
											}
											return chunks;
										}, [])
										.map((chunk, tableIndex) => (
											<table key={tableIndex} className="toggle-table">
												<tbody>
													{chunk.map((obj, rowIndex) => (
														<tr key={rowIndex}>
															<td>
																<div
																	style={{
																		display: "flex",
																		justifyContent:
																			"space-evenly",
																		alignItems: "center",
																	}}
																>
																	<div
																		dangerouslySetInnerHTML={{
																			__html: ChecklitsIcons[
																				obj.icon
																			],
																		}}
																	></div>
																	<div>{obj.name}</div>
																</div>
															</td>
															<td>
																<TripleSwitchToggle
																	updateClick={(event) =>
																		handleToggleChange(
																			rowIndex +
																			tableIndex * 12,
																			event.target.value
																		)
																	}
																	datas={obj.value}
																	name={"leads_email"}
																/>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										))}
							</div>
						</Box>
						<Grid
							item
							xs={12}
							sm={12}
							display={"flex"}
							justifyContent={"space-between"}
							sx={{ mt: 4, textAlign: "right", p: 4 }}
						>
							<PrimaryButton
								title="Back"
								color="secondary"
								onClick={handleBack}
								loading={loading}
							/>
							<PrimaryButton title="Next" onClick={handleNext} loading={loading} />
						</Grid>
					</Box>
				)}

				{/* Step 4 */}

				{activeStep === 3 && (
					<Box component={"form"} onSubmit={handleSubmit3(submitForm3)}>
						<Box
							sx={{
								m: 4,
								p: 5,
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
										Shipping Charges
									</Typography>
								</Grid>
								<Grid item xs={12} sm={4}>
									<SelectField
										size={'small'}
										label={"Pick up from"}
										options={pickupOptions}
										selected={selectedPickup}
										onSelect={(value) => setSelectedPickup(value)}
										error={errors3?.Pickupfrom?.message}
										register={register3("Pickupfrom", {
											required: "Please enter  pickup from.",
										})}
									/>
								</Grid>

								<Grid item xs={12} sm={4}>
									<SelectField
										size={'small'}
										label={"Final Destination"}
										options={destinationOptions}
										selected={selectedDestination}
										onSearch={(v) => getFinalDestination(v)}
										onSelect={(value) => {
											setSelectedDestination(value);
										}}
										error={errors3?.FinalDestination?.message}
										register={register3("FinalDestination", {
											required: "Please enter final destination.",
										})}
									/>
								</Grid>
								{selectedPickup?.name == "Location in UAE" && (
									<Grid item xs={12} sm={4}>
										<InputField
											size={'small'}
											label={"Location"}
											placeholder={"Location"}
											error={errors3?.Location?.message}
											register={register3("Location", {
												required: "Please enter location.",
											})}
										/>
									</Grid>
								)}
								<Grid item xs={12} sm={6} md={4}>
									<SelectField
										size={'small'}
										label={"Payment at"}
										options={paymentatOptions}
										selected={selectedPayment}
										onSelect={(value) => setSelectedPayment(value)}
										error={errors3?.Paymentat?.message}
										register={register3("Paymentat", {
											required: "Please enter payment at.",
										})}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<InputField
										size={'small'}
										label={"Price"}
										placeholder={"Price"}
										type={"number"}
										// error={errors?.auctionHouse?.message}
										endAdornment={
											<InputAdornment position="end">
												<IconButton>
													<AttachMoneyIcon />
												</IconButton>
											</InputAdornment>
										}
										register={register3("price", {
											required: "Please enter price.",
											onChange: (e) => {
												handlePriceChange(e);
											},
										})}
										error={errors3?.price?.message}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<InputField
										size={'small'}
										label={"Discount"}
										placeholder={"Discount"}
										type={"number"}
										error={errors3?.Discount?.message}
										endAdornment={
											<InputAdornment position="end">
												<IconButton>
													<AttachMoneyIcon />
												</IconButton>
											</InputAdornment>
										}
										register={register3("Discount", {
											required: "Please enter discount.",
											onChange: (e) => {
												handleDiscountChange(e);
											},
										})}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<InputField
										size={'small'}
										disabled={true}
										label={"Final Price"}
										placeholder={"Final Price"}
										type={"number"}
										endAdornment={
											<InputAdornment position="end">
												<IconButton>
													<AttachMoneyIcon />
												</IconButton>
											</InputAdornment>
										}
										error={errors3?.finalPrice?.message}
										register={register3("finalPrice", {
											onChange: (e) => {
												Debounce(() => getValues("finalPrice"));
											},
										})}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
								<DatePicker
									label={'ETA Date'}
									size="small"
									value={etaDate}
									error={errors3?.etaDateVal?.message}
									register={register3("etaDateVal", {
										required: "Please enter Eta date."
												
									})}
									onChange={(date) => handleEtaDate(date)}
								/>

							</Grid>

								<Grid item xs={6}>
									{" "}
									<InputField
										size={'small'}
										label={"Notes"}
										// error={errors?.auctionHouse?.message}
										register={register3("Notes")}
									/>
								</Grid>

							</Grid>
						</Box>

						<Grid
							item
							xs={12}
							sm={12}
							display={"flex"}
							justifyContent={"space-between"}
							sx={{ mt: 4, textAlign: "right", p: 4 }}
						>
							<PrimaryButton
								title="Back"
								color="secondary"
								onClick={handleBack}
								loading={loading}
							/>
							<PrimaryButton title="Submit" type="submit" loading={loading} />
						</Grid>
					</Box>
				)}
			</Box>
		</Box>
	);
}
export default UpdateExportVehicles;
