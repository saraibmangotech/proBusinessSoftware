import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Box, StepConnector, Checkbox, stepConnectorClasses, Grid, Stepper, Step, StepLabel, Typography, Divider, InputAdornment, IconButton, FormControl, FormControlLabel, Radio, RadioGroup, } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { v4 as uuidv4 } from 'uuid';
import CustomerType from './shared/CustomerType';
import Colors from 'assets/Style/Colors';
import { FontFamily } from 'assets';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import AuthServices from 'services/Auth';
import SystemServices from 'services/System';
import { useForm } from 'react-hook-form';
import InputField from 'components/Input';
import { CancelOutlined, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { CleanTypes, emailRegex, encryptData, getFileSize, nameRegex, passwordRegex } from 'utils';
import SelectField from 'components/Select';
import { PrimaryButton } from 'components/Buttons';
import InputPhone from 'components/InputPhone';
import instance from 'config/axios';
import routes from 'services/System/routes';
import UploadFile from 'components/UploadFile';
import Uploading from 'components/Uploading';
import TermsConditions from 'components/TermsConditions';
import DatePicker from 'components/DatePicker';
import ImageLightBox from 'components/ImageLightBox';
import UserServices from 'services/User';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';

const ColorConnector = styled(StepConnector)(({ theme }) => ({
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			borderLeft: `4px solid ${Colors.primary}`,
			marginLeft: '0px',
			height: '80px'
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			borderLeft: `4px solid ${Colors.primary}`,
			marginLeft: '0px',
			height: '80px'
		},
	},
	[`& .${stepConnectorClasses.line}`]: {
		borderLeft: `4px solid ${Colors.cloud}`,
		marginLeft: '0px',
		height: '80px'
	},
}));

function Register() {

	const navigate = useNavigate();
	const { pathname } = useLocation();
	const viewerRef = useRef();

	const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 }, watch } = useForm();
	const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, control: control2 } = useForm();
	const { register: register3, handleSubmit: handleSubmit3, formState: { errors: errors3 }, setValue: setValue3, control: control3 } = useForm();
	const { register: register4, handleSubmit: handleSubmit4, formState: { errors: errors4 }, setValue: setValue4 } = useForm();

	const [ShowRadio, setShowRadio] = useState(false)
	const [radiovalue, setradiovalue] = useState('2')
	const password = useRef({});
	password.current = watch("password", "");

	const [loading, setLoading] = useState(false);

	// *For Stepper Label
	const stepperLabel = ['Step 1', 'Step 2', 'Step 3', 'Step 4']

	// *For Stepper
	const [isForm, setIsForm] = useState(false);
	const [activeStep, setActiveStep] = useState(0);

	// *For Upload File types
	const allowFilesType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']
	const allowOnlyImage = ['image/png', 'image/jpg', 'image/jpeg']

	// *For Types
	const [customerTypes, setCustomerTypes] = useState();

	// *For Stepper Forms Data
	const [step1FormData, setStep1FormData] = useState();
	const [step2FormData, setStep2FormData] = useState();
	const [step3FormData, setStep3FormData] = useState();
	const [step4FormData, setStep4FormData] = useState();

	const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1)

	const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

	// *For Password Show/Hide Toggle
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [permission, setPermission] = useState(false)

	// *For Countries
	const [countries, setCountries] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(null);

	// *For Business Country
	const [selectedBusinessCountry, setSelectedBusinessCountry] = useState([]);

	// *For International Country Code
	const [intCode, setIntCode] = useState();

	// *For Uploaded Documents
	const [progress, setProgress] = useState(0);
	const [uploadedSize, setUploadedSize] = useState(0);
	const [documentsDetail, setDocumentsDetail] = useState([]);
	const [uploadedDocuments, setUploadedDocuments] = useState([]);

	// *For Uploaded Documents
	const [progress4, setProgress4] = useState(0);
	const [uploadedSize4, setUploadedSize4] = useState(0);
	const [passportDetail, setPassportDetail] = useState([]);
	const [passportLink, setPassportLink] = useState('');
	const [pictureDetail, setPictureDetail] = useState([]);
	const [pictureLink, setPictureLink] = useState('');
	const [licenseDetail, setLicenseDetail] = useState([]);
	const [licenseLink, setLicenseLink] = useState('');
	const [certificateDetail, setCertificateDetail] = useState([]);
	const [certificateLink, setCertificateLink] = useState('');
	const [userData, setUserData] = useState()
	const [confirmMessage, setConfirmMessage] = useState('')
	// *For Dialog Box
	const [confirmationDialog, setConfirmationDialog] = useState(false);

	// *For Expiration Date
	const [passportExp, setPassportExp] = useState();
	const [tradeExp, setTradeExp] = useState();
	const [vatExp, setVatExp] = useState();

	// *For Accept Terms & Conditions
	const [isAccept, setIsAccept] = useState(false);

	// *For Open Terms
	const [openTerms, setOpenTerms] = useState(false);



	// *For Get Countries
	const getCountries = async () => {
		try {
			const { data } = await SystemServices.getCountries()
			setCountries(data?.nations.rows)
		} catch (error) {
			ErrorToaster(error)
		}
	}


	const getPermission = () => {


		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				console.log('Notification permission granted.');
				localStorage.setItem('Permission', true)
				setPermission(true)
			}
			else {
				localStorage.setItem('Permission', false)
				setPermission(false)
			}
		})
	}

	// *For Upload Document
	const handleUploadDocument = async (e) => {
		try {
			e.preventDefault();
			const file = e.target.files[0]
			let obj = {
				id: uuidv4(),
				name: file?.name,
				file: '',
				type: file?.type.split('/')[1],
				size: getFileSize(file.size),
				isUpload: false
			}
			if (allowFilesType.includes(file.type)) {
				setDocumentsDetail(prev => [...prev, obj])
				handleUpload(file, [...documentsDetail, obj], obj.id)
			} else {
				ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	const handleUpload = async (file, docs, docId) => {
		setProgress(0)
		try {
			const formData = new FormData();
			formData.append('document', file);
			const { data } = await instance.post(routes.uploadDocuments, formData, {
				onUploadProgress: (progressEvent) => {
					const uploadedBytes = progressEvent.loaded;
					const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

					setProgress(percentCompleted);
					setUploadedSize(getFileSize(uploadedBytes))
				},
			});
			if (data) {
				const index = docs.findIndex(doc => doc.id === docId)
				docs[index].isUpload = true
				docs[index].file = data?.data?.nations
				setDocumentsDetail(docs)
				const documentsLinks = [...uploadedDocuments, data?.data?.nations]
				setUploadedDocuments(documentsLinks)
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Remove Uploaded Document
	const removeDoc = (index) => {
		try {
			let updateDocDetail = [...documentsDetail]
			updateDocDetail.splice(index, 1)
			let updateDocLink = [...uploadedDocuments]
			updateDocLink.splice(index, 1)
			setDocumentsDetail(updateDocDetail)
			setUploadedDocuments(updateDocLink)
			setValue3('document', '')
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Handle Date
	const handlePassportDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setPassportExp('invalid')
				return
			}
			setPassportExp(newDate)
			setValue4('passportExp', newDate)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	const handleTradeDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setTradeExp('invalid')
				return
			}
			setTradeExp(newDate)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	const handleVatDate = (newDate) => {
		try {
			// eslint-disable-next-line eqeqeq
			if (newDate == 'Invalid Date') {
				setVatExp('invalid')
				return
			}
			setVatExp(newDate)
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Upload Document
	const handleUploadDocument4 = async (e, type) => {
		try {
			e.preventDefault();
			const file = e.target.files[0]
			let arr = [{
				name: file?.name,
				file: '',
				type: file?.type.split('/')[1],
				size: getFileSize(file.size),
				isUpload: false
			}]

			// *For Check Image Format
			if (type !== 'picture' && allowFilesType.includes(file.type)) {
				handleUpload4(file, arr, type)
				if (type === 'passport') {
					setPassportDetail(arr)
				} else if ('license') {
					setLicenseDetail(arr)
				} else {
					setCertificateDetail(arr)
				}
			} else if (type === 'picture' && allowOnlyImage.includes(file.type)) {
				setPictureDetail(arr)
				handleUpload4(file, arr, type)
			} else {
				ErrorToaster(`Only ${CleanTypes(type === 'picture' ? allowOnlyImage : allowFilesType)} formats is supported`)
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	const handleUpload4 = async (file, docs, type) => {
		setProgress4(0)
		try {
			const formData = new FormData();
			formData.append('document', file);
			const { data } = await instance.post(routes.uploadDocuments, formData, {
				onUploadProgress: (progressEvent) => {
					const uploadedBytes = progressEvent.loaded;
					const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

					setProgress4(percentCompleted);
					setUploadedSize4(getFileSize(uploadedBytes))
				},
			});
			if (data) {
				docs[0].isUpload = true
				docs[0].file = data?.data?.nations
				if (type === 'passport') {
					setPassportDetail(docs)
					setPassportLink(data?.data?.nations)
				} else if (type === 'picture') {
					setPictureDetail(docs)
					setPictureLink(data?.data?.nations)
				} else if (type === 'license') {
					setLicenseDetail(docs)
					setLicenseLink(data?.data?.nations)
				} else {
					setCertificateDetail(docs)
					setCertificateLink(data?.data?.nations)
				}
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Remove Uploaded Document
	const removeDoc4 = (type) => {
		try {
			if (type === 'passport') {
				setPassportDetail([])
				setPassportLink('')
				setValue4('passport', '')
			} else if ('picture') {
				setPictureDetail([])
				setPictureLink('')
				setValue4('picture', '')
			} else if ('license') {
				setLicenseDetail([])
				setLicenseLink('')
				setValue4('license', '')
			} else {
				setCertificateDetail([])
				setCertificateLink('')
				setValue4('certificate', '')
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Submit Form 1
	const submitForm1 = async (formData) => {
		try {
			let obj = {
				name: formData.customerName,
				nationality_id: selectedCountry?.id,
			};
			if (pathname !== '/create-customer') {
				obj.password = encryptData(formData.password)
				obj.fcm_token = localStorage.getItem('fcmToken')
			}
			setStep1FormData(obj)
			handleNext()
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Submit Form 2
	const submitForm2 = async (formData) => {

		try {
			let obj = {
				uae_phone: formData?.uaeMobile,
				int_phone_code: intCode,
				int_phone: formData?.internationalMobile.replace(intCode, ''),
				email: formData?.email,
				currency: 'aed',
			}
			let checkDuplicate = {
				uae_phone: formData.uaeMobile,
				email: formData.email,
				validate: true
			}
			setUserData(checkDuplicate)

			const { responseCode,message } = await AuthServices.register(checkDuplicate)
			console.log(responseCode);
			if (responseCode == 202) {
				setConfirmationDialog(true)
				setConfirmMessage(message)

			}
			else {

				setStep2FormData(obj)
				handleNext()
			}
		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Submit Form 3
	const submitForm3 = async (formData) => {
		try {
			let obj = {
				ap_name: formData.apName,
				ap_number: formData.uaeMobile,
				ap_document_name: formData.apDocumentName,
				ap_document: uploadedDocuments.length > 0 ? uploadedDocuments : []
			}
			
			setStep3FormData(obj)
			sendRegisterOtp(obj)

		} catch (error) {
			ErrorToaster(error)
		}
	}

	// *For Submit Form
	const submitForm4 = async (formData) => {
		try {
			let obj = {
				picture: pictureLink,
			}
			if (customerTypes?.customerType?.id === 3) {
				obj.trade_license_number = formData?.tradeLicense
				obj.trade_license = licenseLink
				obj.trade_license_expiry = tradeExp
				obj.vat_certificate = certificateLink
				obj.vat_expiry = vatExp
				obj.vat_number = formData?.vatCertificate
			} else {
				obj.passport_expiry = passportExp
				obj.passport = passportLink
			}

			setStep4FormData(obj)

			handleNext()

		} catch (error) {
			ErrorToaster(error)
		}
	}
	const handleAccountLinking = async () => {

		try {
			let obj = {
				business_region: customerTypes.businessRegion,
				uae_phone: userData?.uae_phone,
				email: userData?.email,
				screen:'link'

			}


			const { data,responseCode } = await AuthServices.Linking(obj)
			console.log(data);
			if(responseCode==206){
				
			
				const otpField = {
					emailField: data?.email,
					phoneField: data?.phone,
				}
				navigate('/verify-otp', { state: { ...obj, ...otpField } })
			}

		}
		catch (error) {
			console.log(error);
		}
	}
	// *For Send OTP For Registration
	const sendRegisterOtp = async (formData) => {
		setLoading(true)

		try {
			let obj;

			if (customerTypes?.customerType.label !== "Broker") {
				obj = {
					...step1FormData,
					...step2FormData,
					...step3FormData,
					...step4FormData,
					...formData,
					business_region: customerTypes.businessRegion.toLowerCase(),
					import: customerTypes.businessRegion === "Import" ? true : false,
					export: customerTypes.businessRegion === "Export" ? true : false,
					gender: "male",
					customer_type: customerTypes.customerType.id,
				};
			}
			else {
				obj = {
					...step1FormData,
					...step2FormData,
					...step3FormData,
					...step4FormData,
					...formData,
					business_region: customerTypes.businessRegion.toLowerCase(),
					import: customerTypes.businessRegion === "Import" ? true : false,
					export: customerTypes.businessRegion === "Export" ? true : false,
					gender: "male",
					broker_type_id: radiovalue,
					customer_type: customerTypes.customerType.id,
				};
			}
			if (localStorage.getItem('Permission') == 'true') {
				if (pathname !== '/create-customer') {
					let otpObj = {
						uae_phone: obj.uae_phone,
						email: obj.email,
					};

					const { message, data } = await AuthServices.register(otpObj)
					SuccessToaster(message)
					const otpField = {
						emailField: data?.email,
						phoneField: data?.phone,
					}
					navigate('/verify-otp', { state: { ...obj, ...otpField } })
				} else {
					console.log(obj);
					const { message } = await UserServices.createUser(obj)
					SuccessToaster(message)
					navigate('/customer-queue')
				}
			}
			else {
				Notification.requestPermission().then((permission) => {
					if (permission === 'granted') {
						// Save the permission in localStorage
						localStorage.setItem('Permission', true);

						// Notifications are allowed, proceed with showing notifications

					}
					else {
						localStorage.setItem('Permission', false);
					}
				});
				ErrorToaster('Please Enable Notifications Permission')
			}
		} catch (error) {
			ErrorToaster(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		getCountries()
		getPermission()
	}, []);

	return (
		<Fragment>

			< ConfirmationDialog
				open={confirmationDialog}
				onClose={() => setConfirmationDialog(false)
				}
				message={confirmMessage}
				action={() => {
					setConfirmationDialog(false);
					handleAccountLinking()
				}}
			/>
			{isForm && (
				<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
					<IconButton onClick={() => setIsForm(false)}>
						<CancelOutlined />
					</IconButton>
				</Box>
			)}

			{/* ========== Terms & Conditions ========== */}
			<TermsConditions
				open={openTerms}
				close={() => {
					setOpenTerms(false);
					setIsAccept(true);
				}}
			/>

			{/* ========== Customer Types ========== */}
			{!isForm && (
				<CustomerType
					submit={(value) => {
						if (
							value.businessRegion === "Export" &&
							value.customerType.id == "2"
						) {
							setShowRadio(true);
						}
						setCustomerTypes(value);

						setIsForm(true);
					}}
				/>
			)}

			{/* ========== Customer Types ========== */}
			{isForm && (
				<Grid container spacing={1} justifyContent={"space-between"}>
					<Grid item md={3.5}>
						<Box sx={{ mb: 5 }}>
							<Typography variant="h4" sx={{ color: Colors.charcoalGrey }}>
								{customerTypes?.customerType?.label == "Individual" ? "Customer" : customerTypes?.customerType?.label}
							</Typography>
							<Typography
								variant="subtitle2"
								sx={{ color: Colors.Martini, fontFamily: FontFamily.NunitoRegular }}
							>
								Customer Type {customerTypes?.customerType?.label == "Individual" ? "Customer" : customerTypes?.customerType?.label} selected
							</Typography>
						</Box>
						<Stepper
							activeStep={activeStep}
							orientation="vertical"
							connector={<ColorConnector />}
						>
							{stepperLabel.map((label, index) => (
								<Step
									key={index}
									sx={{
										"& .MuiStepLabel-label": {
											color: `${Colors.cloud} !important`,
											fontSize: { md: "16px" },
										},
										"& .Mui-completed": {
											color: `${Colors.primary} !important`,
										},
									}}
								>
									<StepLabel>{label}</StepLabel>
								</Step>
							))}
						</Stepper>
					</Grid>
					<Grid item md={8.5}>
						<Box sx={{ bgcolor: Colors.white, p: 4, borderRadius: "12px" }}>
							<Typography variant="h4" sx={{ color: Colors.charcoalGrey }}>

								Create {customerTypes?.customerType?.label == "Individual" ? "Customer" : customerTypes?.customerType?.label}
							</Typography>
							{activeStep === 3 && (
								<Typography
									variant="body1"
									sx={{ color: Colors.iron, fontFamily: FontFamily }}
								>
									(optional Details)
								</Typography>
							)}
							<Divider sx={{ color: Colors.iron, my: 3 }} />

							{/* ========== Stepper 1 ========== */}
							{activeStep === 0 && (
								<Box component="form" onSubmit={handleSubmit1(submitForm1)}>
									<Grid container spacing={2}>
										<Grid item xs={12} sm={12}>
											<InputField
												label={
													customerTypes?.customerType?.label == "Individual" ? "Customer Name" : customerTypes?.customerType?.label +
														" " +
														"Name"
												}
												placeholder={
													customerTypes?.customerType?.label == "Individual" ? "Customer Name" : customerTypes?.customerType?.label +
														" " +
														"Name"
												}
												inputProps={{ maxLength: 50 }}
												error={errors1?.customerName?.message}
												register={register1("customerName", {
													required: "Please enter your name.",
													pattern: {
														value: nameRegex,
														message: "Please enter valid name.",
													},
												})}
											/>
										</Grid>
										{ShowRadio ? (
											<Grid item xs={12} sm={12}>
												<FormControl>
													<RadioGroup
														row
														defaultValue={"2"}
														onChange={(e) => {
															setradiovalue(e.target.value);
														}}
													>
														<FormControlLabel
															sx={{ color: "#00000099" }}
															value="1"
															control={<Radio />}
															label="Agent"
														/>
														<FormControlLabel
															sx={{ color: "#00000099" }}
															value="2"
															control={<Radio />}
															label="Broker"
														/>
													</RadioGroup>
												</FormControl>
											</Grid>
										) : (
											""
										)}
										<Grid item xs={12} sm={6}>
											<SelectField
												label={"Nationality"}
												options={countries}
												selected={selectedCountry}
												onSelect={(value) => setSelectedCountry(value)}
												error={errors1?.nationality?.message}
												register={register1("nationality", {
													required: "Please select nationality.",
												})}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<SelectField
												multiple={true}
												label={"Business Countries"}
												options={countries}
												selected={selectedBusinessCountry}
												onSelect={(value) =>
													setSelectedBusinessCountry(value)
												}
												error={errors1?.businessCountry?.message}
												register={register1("businessCountry", {
													// required: "Please select Business Country.",
												})}
											/>
										</Grid>
										{pathname !== "/create-customer" && (
											<Fragment>
												<Grid item xs={12} sm={6}>
													<InputField
														label={"Password"}
														type={showPassword ? "text" : "password"}
														placeholder={"Password"}
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<IconButton
																		edge="end"
																		onClick={() =>
																			setShowPassword(
																				!showPassword
																			)
																		}
																	>
																		{showPassword ? (
																			<Visibility
																				sx={{
																					color: Colors.cloud,
																				}}
																			/>
																		) : (
																			<VisibilityOff
																				sx={{
																					color: Colors.cloud,
																				}}
																			/>
																		)}
																	</IconButton>
																</InputAdornment>
															),
														}}
														error={errors1?.password?.message}
														register={register1("password", {
															required:
																pathname !== "/create-customer"
																	? "Please enter the password."
																	: false,
															pattern: {
																value: passwordRegex,
																message:
																	"Password contain minimum 8 characters, at least uppercase/lowercase letter, number and special character",
															},
														})}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<InputField
														label={"Confirm Password"}
														type={
															showConfirmPassword
																? "text"
																: "password"
														}
														placeholder={"Confirm Password"}
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<IconButton
																		edge="end"
																		onClick={() =>
																			setShowConfirmPassword(
																				!showConfirmPassword
																			)
																		}
																	>
																		{showConfirmPassword ? (
																			<Visibility
																				sx={{
																					color: Colors.smokeyGrey,
																				}}
																			/>
																		) : (
																			<VisibilityOff
																				sx={{
																					color: Colors.smokeyGrey,
																				}}
																			/>
																		)}
																	</IconButton>
																</InputAdornment>
															),
														}}
														error={errors1?.confirmPassword?.message}
														register={register1("confirmPassword", {
															required:
																pathname !== "/create-customer"
																	? "Please enter the confirm password."
																	: false,
															validate: (value) =>
																value === password.current ||
																"Confirm password does not match.",
														})}
													/>
												</Grid>
											</Fragment>
										)}
										<Grid
											item
											xs={12}
											sm={12}
											sx={{ mt: 2, textAlign: "right" }}
										>
											<PrimaryButton title="Next" type="submit" />
										</Grid>
									</Grid>
								</Box>
							)}

							{/* ========== Stepper 2 ========== */}
							{activeStep === 1 && (
								<Box component="form" onSubmit={handleSubmit2(submitForm2)}>
									<Grid container spacing={2}>
										<Grid item xs={12} sm={6}>
											<InputPhone
												label={"Whatsapp Number"}
												name={"uaeMobile"}
												disableDropdown={false}
												countryCodeEditable={true}
												control={control2}
												error={errors2?.uaeMobile?.message}
												rules={{
													required: "Please enter your whatsapp number.",
												}}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<InputPhone
												label={"International Mobile"}
												name={"internationalMobile"}
												control={control2}
												error={errors2?.internationalMobile?.message}
												onBlur={(e, v) => setIntCode(v.dialCode)}
												rules={{
													required:
														"Please enter your international mobile number.",
												}}
											/>
										</Grid>
										<Grid item xs={12} sm={12}>
											<InputField
												label={"Email"}
												type={"email"}
												placeholder={"Email Address"}
												error={errors2?.email?.message}
												register={register2("email", {
													required: "Please enter your email.",
													pattern: {
														value: emailRegex,
														message: "Please enter a valid email.",
													},
												})}
											/>
										</Grid>
										<Grid item xs={6} sm={6} sx={{ mt: 2 }}>
											<PrimaryButton
												title="Back"
												onClick={() => handleBack()}
												color="secondary"
											/>
										</Grid>
										<Grid item xs={6} sm={6} sx={{ mt: 2, textAlign: "right" }}>
											<PrimaryButton title="Next" type="submit" />
										</Grid>
									</Grid>
								</Box>
							)}

							{/* ========== Stepper 3========== */}
							{activeStep === 2 && (
								<Box component="form" onSubmit={handleSubmit4(submitForm4)}>
									<Grid container spacing={2}>
										{customerTypes?.customerType?.id !== 3 ? (
											<Fragment>
												<Grid item xs={12} sm={6}>
													<Typography
														variant="body1"
														sx={{ color: Colors.charcoalGrey, mb: 1 }}
													>
														Upload Passport Copy
													</Typography>
													<UploadFile
														accept={allowFilesType}
														error={errors4?.passport?.message}
														register={register4("passport", {
															required:
																customerTypes?.customerType?.id !==
																	3
																	? passportDetail.length === 0 &&
																	"Please upload your passport copy."
																	: false,
															onChange: (e) =>
																handleUploadDocument4(
																	e,
																	"passport"
																),
														})}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<DatePicker
														label={"Passport Expiry Date"}
														value={passportExp}
														disablePast={true}
														error={errors4?.passportExp?.message}
														register={register4("passportExp", {
															required:
																customerTypes?.customerType?.id !==
																	3
																	? "please enter your passport expiry date."
																	: false,
														})}
														onChange={(date) =>
															handlePassportDate(date)
														}
													/>
													{passportDetail.length > 0 && (
														<Typography
															variant="body1"
															sx={{
																color: Colors.charcoalGrey,
																my: 1,
															}}
														>
															Uploaded Files
														</Typography>
													)}
													<Box
														sx={{
															maxHeight: 300,
															overflow: "auto",
															pr: 1,
														}}
													>
														{passportDetail?.map((item, index) => (
															<Uploading
																key={index}
																data={item}
																uploadedSize={uploadedSize4}
																progress={progress4}
																removeDoc={() =>
																	removeDoc4("passport")
																}
															/>
														))}
													</Box>
												</Grid>
											</Fragment>
										) : (
											<Fragment>
												<Grid item xs={12} sm={6}>
													<InputField
														label={"Trade License #"}
														placeholder={"Trade License"}
														error={errors4?.tradeLicense?.message}
														register={register4("tradeLicense", {
															required:
																customerTypes?.customerType?.id ===
																	3
																	? "Please enter your trade license."
																	: false,
														})}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<DatePicker
														label={"Trade License Expiry Date"}
														value={tradeExp}
														disablePast={true}
														error={
															customerTypes?.customerType?.id === 3
																? tradeExp === null ||
																	tradeExp === "invalid"
																	? true
																	: false
																: false
														}
														errorMessage={
															"please enter your trade license expiry date."
														}
														onChange={(date) => handleTradeDate(date)}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<InputField
														label={"VAT Certificate #"}
														placeholder={"VAT Certificate"}
														error={errors4?.vatCertificate?.message}
														register={register4("vatCertificate", {
															required:
																customerTypes?.customerType?.id ===
																	3
																	? "Please enter your VAT certificate."
																	: false,
														})}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<DatePicker
														label={"VAT Expiry Date"}
														value={vatExp}
														disablePast={true}
														error={
															customerTypes?.customerType?.id === 3
																? vatExp === null ||
																	vatExp === "invalid"
																	? true
																	: false
																: false
														}
														errorMessage={
															"please enter your VAT expiry date."
														}
														onChange={(date) => handleVatDate(date)}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Typography
														variant="body1"
														sx={{ color: Colors.charcoalGrey, mb: 1 }}
													>
														Upload Trade License
													</Typography>
													<UploadFile
														accept={allowFilesType}
														error={errors4?.license?.message}
														register={register4("license", {
															required:
																"Please upload your trade license.",
															onChange: (e) =>
																handleUploadDocument4(e, "license"),
														})}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													{licenseDetail.length > 0 && (
														<Typography
															variant="body1"
															sx={{
																color: Colors.charcoalGrey,
																mb: 1,
															}}
														>
															Uploaded Files
														</Typography>
													)}
													<Box
														sx={{
															maxHeight: 300,
															overflow: "auto",
															pr: 1,
														}}
													>
														{licenseDetail?.map((item, index) => (
															<Uploading
																key={index}
																data={item}
																uploadedSize={uploadedSize4}
																progress={progress4}
																removeDoc={() =>
																	removeDoc4("license")
																}
															/>
														))}
													</Box>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Typography
														variant="body1"
														sx={{ color: Colors.charcoalGrey, mb: 1 }}
													>
														Upload VAT Certificate
													</Typography>
													<UploadFile
														accept={allowFilesType}
														error={errors4?.certificate?.message}
														register={register4("certificate", {
															required:
																"Please upload your VAT certificate.",
															onChange: (e) =>
																handleUploadDocument4(
																	e,
																	"certificate"
																),
														})}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													{certificateDetail.length > 0 && (
														<Typography
															variant="body1"
															sx={{
																color: Colors.charcoalGrey,
																mb: 1,
															}}
														>
															Uploaded Files
														</Typography>
													)}
													<Box
														sx={{
															maxHeight: 300,
															overflow: "auto",
															pr: 1,
														}}
													>
														{certificateDetail?.map((item, index) => (
															<Uploading
																key={index}
																data={item}
																uploadedSize={uploadedSize4}
																progress={progress4}
																removeDoc={() =>
																	removeDoc4("certificate")
																}
															/>
														))}
													</Box>
												</Grid>
											</Fragment>
										)}
										<Grid item xs={12} sm={6}>
											<Typography
												variant="body1"
												sx={{ color: Colors.charcoalGrey, mb: 1 }}
											>
												Upload Customer Picture
											</Typography>
											<UploadFile
												accept={allowOnlyImage}
												error={errors4?.picture?.message}
												register={register4("picture", {

													onChange: (e) =>
														handleUploadDocument4(e, "picture"),
												})}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											{pictureDetail.length > 0 && (
												<Typography
													variant="body1"
													sx={{ color: Colors.charcoalGrey, mb: 1 }}
												>
													Uploaded Files
												</Typography>
											)}
											<Box sx={{ maxHeight: 300, overflow: "auto", pr: 1 }}>
												{pictureDetail?.map((item, index) => (
													<Uploading
														key={index}
														data={item}
														uploadedSize={uploadedSize4}
														progress={progress4}
														removeDoc={() => removeDoc4("picture")}
													/>
												))}
											</Box>
										</Grid>
										<Grid item xs={12} sm={12}>
											<Checkbox
												checked={isAccept}
												onChange={() => setOpenTerms(true)}
											/>
											<Typography
												component={"span"}
												variant="body2"
												sx={{
													color: Colors.black,
													fontFamily: FontFamily.NunitoRegular,
													mb: 1,
												}}
											>
												By creating this account, I accept the&nbsp;
												<Typography
													component={"span"}
													variant="body2"
													onClick={() => setOpenTerms(true)}
													sx={{
														textDecoration: "underline",
														cursor: "pointer",
														color: Colors.primary,
														fontFamily: FontFamily.NunitoRegular,
														mb: 1,
													}}
												>
													terms & conditions.
												</Typography>
											</Typography>
										</Grid>
										<Grid item xs={6} sm={6} sx={{ mt: 2 }}>
											<PrimaryButton
												title="Back"
												onClick={() => handleBack()}
												color="secondary"
											/>
										</Grid>

										<Grid item xs={6} sm={6} sx={{ mt: 2, textAlign: "right" }}>
											<PrimaryButton title="Next" type="submit" />
										</Grid>
									</Grid>
								</Box>
							)}

							{/* ========== Stepper 4 ========== */}
							{activeStep === 3 && (
								<Box component="form" onSubmit={handleSubmit3(submitForm3)}>
									<Grid container spacing={2}>
										<Grid item xs={12} sm={6}>
											<InputField
												label={"Authorized Person Name"}
												inputProps={{ maxLength: 30 }}
												placeholder={"Authorized Person Name"}
												error={errors3?.apName?.message}
												register={register3("apName")}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<InputPhone
												label={"Whatsapp Number"}
												name={"uaeMobile"}
												disableDropdown={true}
												countryCodeEditable={false}
												control={control3}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											<InputField
												label={"Identity Document"}
												placeholder={"Identity Document"}
												inputProps={{ maxLength: 30 }}
												error={errors3?.apDocumentName?.message}
												register={register3("apDocumentName")}
											/>
										</Grid>
										<Grid item xs={12} sm={6}></Grid>
										<Grid item xs={12} sm={6}>
											<Typography
												variant="body1"
												sx={{ color: Colors.charcoalGrey, mb: 1 }}
											>
												Identity / Power of Attorney Attach
											</Typography>
											<UploadFile
												accept={allowFilesType}
												register={register3("document", {
													onChange: (e) => handleUploadDocument(e),
												})}
											/>
										</Grid>
										<Grid item xs={12} sm={6}>
											{documentsDetail.length > 0 && (
												<Fragment>
													<Typography
														variant="body1"
														sx={{ color: Colors.charcoalGrey, mb: 1 }}
													>
														Uploaded Files
													</Typography>
													<Box
														sx={{
															maxHeight: 300,
															overflow: "auto",
															pr: 1,
														}}
													>
														{documentsDetail?.map((item, index) => (
															<Uploading
																key={index}
																data={item}
																uploadedMBs={uploadedSize}
																progress={progress}
																removeDoc={() => removeDoc(index)}
															/>
														))}
													</Box>
												</Fragment>
											)}
										</Grid>
										<Grid item xs={6} sm={6} sx={{ mt: 2 }}>
											<PrimaryButton
												title="Back"
												onClick={() => handleBack()}
												color="secondary"
											/>
										</Grid>
										<Grid item xs={6} sm={6} sx={{ mt: 2, textAlign: "right" }}>
											<PrimaryButton

												title="Submit"
												type="submit"
												loading={loading}
												disabled={!isAccept}
											/>
										</Grid>
									</Grid>
								</Box>
							)}


						</Box>
					</Grid>
				</Grid>
			)}
		</Fragment>
	);
}

export default Register;