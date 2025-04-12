import React, { useState, useEffect } from "react";
import { Grid, Box, Typography, IconButton, InputAdornment } from "@mui/material";
import Colors from "assets/Style/Colors";
import SelectField from "components/Select";
import { FontFamily, Icons } from "assets";
import { PrimaryButton } from "components/Buttons";
import { useForm } from "react-hook-form";
import InputField from "components/Input";
import ExportServices from "services/Export";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import SystemServices from "services/System";
import AddContainerSize from "components/Dialog/AddContainerSize";
import { useLocation, useNavigate } from "react-router-dom";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CryptoJS from 'crypto-js';
import DatePicker from "components/DatePicker";
import { getYearMonthDateFormate } from "utils";


function EditContainer() {
    //*Navigate
    const navigate = useNavigate();
    const { state } = useLocation();
    console.log(state);

    //*Form Hook
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    //Pickup Options

    const pickupOptions = [
        { id: "Garage", name: "Garage" },
        { id: "Location in UAE", name: "Location in UAE" },
    ];

    const encryptData = (data, secretKey) => {
        const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
        return encryptedData;
    };
    const decryptData = (data, secretKey) => {
        const decryptedData = CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
        return decryptedData;
    };



    //*For Options
    const [customersOptions, setCustomersOptions] = useState([]);
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [AgentOptions, setAgentOptions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [etaDate, setEtaDate] = useState()

    //*For Selected Options
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [SelectedAgent, setSelectedAgent] = useState(null);

    //*For User Data
    const [userId, setUserId] = useState();
    const [userEmail, setUserEmail] = useState();
    const [userPhone, setUserPhone] = useState();

    // *For Container Sizes
    const [containerSizes, setContainerSizes] = useState([]);
    const [selectedContainerSize, setSelectedContainerSize] = useState(null);

    //*Dialog Box
    const [addContainerSizeDialog, setAddContainerSizeDialog] = useState(false);

    const [loading, setLoading] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);

    // *For get Customers
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



    ///For FinalDestination
    const getFinalDestination = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
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

    // *For Get Container Size
    const getContainerSizes = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 50,
                search: search,
            };
            const { data } = await SystemServices.getContainerSizes(params);
            setContainerSizes(data?.cont?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    // *For Create Container Size
    const createContainerSize = async (formData) => {
        setDialogLoading(true);
        try {
            const { data } = await SystemServices.createContainerSize(formData);
            getContainerSizes();
            setSelectedContainerSize(data?.model);
            setValue("containerSize", data?.model?.name);
            setAddContainerSizeDialog(false);
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setDialogLoading(false);
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
            setAgentOptions(data?.customers?.rows);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    //*Create Container

    const EditContainer = async (formData) => {
        setLoading(true);

        try {
            let obj = {
                container_id:state?.id,
                customer_id: selectedCustomer?.id,
                agent_id: SelectedAgent?.id,
                pickup_from: formData?.PickupFrom,
                uae_location: formData?.Location,
                final_destination_id: selectedDestination?.id,
                price: formData?.Price,
                container_size_id: selectedContainerSize?.id,
                container_number: formData?.ContainerNumber,
                status_id: selectedStatus?.id,
                eta: getYearMonthDateFormate(etaDate),
                country_id: selectedDestination?.country_id
            };

            const { message } = await ExportServices.EditContainer(obj);
            SuccessToaster(message);
            navigate("/container-list");
        } catch (error) {
            ErrorToaster(error);
        } finally {
            setLoading(false);
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
                setValue('etaDateVal',(new Date(newDate)))
			} catch (error) {
				ErrorToaster(error);
			}
		};

    // *For Create Size
    const createSize = async (name) => {
        try {
            let obj = {
                name: name,
            };
            const { data } = await SystemServices.createContainerSize(obj);
            getContainerSizes()

        } catch (error) {
            ErrorToaster(error);
        }
    };

    //*User Data Get
    const handleUserData = (value) => {
        const selectedCustomerObject = customersOptions.find((option) => option.id === value);

        if (selectedCustomerObject) {
            setUserId(selectedCustomerObject.id);
            setUserEmail(selectedCustomerObject.email);
            setUserPhone(selectedCustomerObject.uae_phone);
        } else {
        }
    };

    ///For Status
    const getStatus = async () => {
        try {
            const { data } = await ExportServices.getStatus();
            setStatusOptions(data?.statuses);
        } catch (error) {
            ErrorToaster(error);
        }
    };

    useEffect(() => {
        getCustomers();
        getFinalDestination();
        getContainerSizes();
        getStatus();
        getAgent();
        if (state) {
            setSelectedCustomer(state?.customer)
            setValue('Customer', state?.customer?.name)
            setSelectedAgent(state?.agent)
            setValue('Agent', state?.agent?.name)
            setValue('etaDate', state?.eta)
            setValue('CustomerID', state?.customer?.id)
            setValue('ContactNumber', state?.customer?.uae_phone)
            setValue('EmailID', state?.customer?.email)
            setSelectedPickup({ id: state?.pickup_from, name: state?.pickup_from })
            setValue('PickupFrom', state?.pickup_from)
            setSelectedDestination(state?.destination)
            setValue('FinalDestination', state?.destination?.name)
            setSelectedContainerSize(state?.container_size)
            setValue('containerSize', state?.container_size?.name)
            setValue('Location', state?.uae_location)
            setValue('Price', state?.price)
            setValue('ContainerNumber', state?.container_number)
            setSelectedStatus(state?.status)
            setValue('Status', state?.status?.name)

        }

    }, []);

    return (
        <Box>
            <AddContainerSize
                open={addContainerSizeDialog}
                onClose={() => setAddContainerSizeDialog(false)}
                loading={dialogLoading}
                onSubmit={(data) => createContainerSize(data)}
            />
            <Box component={"form"} onSubmit={handleSubmit(EditContainer)}>
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

                                }}
                            >
                                Update Container
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <SelectField
                                size={"small"}
                                disabled={true}
                                label={"Select Customer"}
                                options={customersOptions}
                                onSearch={(v) => getCustomers(v)}
                                selected={selectedCustomer}
                                onSelect={(value) => {
                                    setSelectedCustomer(value);
                                    handleUserData(value.id);
                                }}
                                error={errors?.Customer?.message}
                                register={register("Customer", {
                                    required: "Please enter  customer .",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <SelectField
                                size={"small"}
                                disabled={true}
                                label={"Select Agent"}
                                options={AgentOptions}
                                onSearch={(v) => getAgent(v)}
                                selected={SelectedAgent}
                                onSelect={(value) => setSelectedAgent(value)}
                                error={errors?.Agent?.message}
                                register={register("Agent", {
                                    required: "Please select agent .",
                                })}
                            />
                        </Grid>
                        <Grid container spacing={2} sx={{ m: 0.5 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    size={"small"}
                                    label={"Customer ID"}
                                    placeholder={"Customer ID"}
                                    labelIcon={Icons.NameIcon}
                                    value={userId}
                                    disabled={true}
                                    // error={errors?.auctionHouse?.message}
                                    register={register("CustomerID")}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    size={"small"}
                                    label={"Contact Number"}
                                    placeholder={"Contact Number"}
                                    labelIcon={Icons.NumberIcon}
                                    type={"number"}
                                    value={userPhone}
                                    disabled={true}
                                    // error={errors?.auctionHouse?.message}
                                    register={register("ContactNumber")}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <InputField
                                    size={"small"}
                                    label={"Email ID"}
                                    placeholder={"Email ID"}
                                    labelIcon={Icons.EmailIcon}
                                    type={"email"}
                                    value={userEmail}
                                    disabled={true}
                                    // error={errors?.auctionHouse?.message}
                                    register={register("EmailID")}
                                />
                            </Grid>

                        </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={12}>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: Colors.charcoalGrey,
                                    fontFamily: FontFamily.NunitoRegular,

                                }}
                            >
                                Shipment Details & Price
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <SelectField
                                size={"small"}
                                label={"Pick up from"}
                                options={pickupOptions}
                                selected={selectedPickup}
                                onSelect={(value) => setSelectedPickup(value)}
                                error={errors?.PickupFrom?.message}
                                register={register("PickupFrom", {
                                    required: "Please enter pickupfrom .",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <SelectField
                                size={"small"}
                                label={"Final Destination"}
                                options={destinationOptions}
                                selected={selectedDestination}
                                onSelect={(value) => {
                                    setSelectedDestination(value);
                                }}
                                error={errors?.FinalDestination?.message}
                                register={register("FinalDestination", {
                                    required: "Please enter  final destination .",
                                })}
                            />
                        </Grid>
                        {selectedPickup?.name == "Location in UAE" && (
                            <Grid item xs={12} sm={4}>
                                <InputField
                                    size={"small"}
                                    label={"Location"}
                                    placeholder={"Location"}
                                    error={errors?.Location?.message}
                                    register={register("Location", {
                                        required: "Please enter  location .",
                                    })}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6} md={4}>
                            <SelectField
                                size={"small"}
                                addNew={(newValue) => createSize(newValue)}
                                label={"Container Size"}
                                options={containerSizes}
                                selected={selectedContainerSize}
                                onSelect={(value) => setSelectedContainerSize(value)}
                                error={errors?.containerSize?.message}
                                register={register("containerSize", {
                                    required: "Please enter container size .",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <InputField
                                size={"small"}
                                label={"Price"}
                                placeholder={"Price"}
                                type={"number"}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton>
                                            <AttachMoneyIcon />
                                        </IconButton>
                                    </InputAdornment>
                                }
                                error={errors?.Price?.message}
                                register={register("Price", {
                                    required: "Please enter price .",
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <InputField
                                size={"small"}
                                label={"Container Number"}
                                placeholder={"Container Number"}
                                error={errors?.ContainerNumber?.message}
                                register={register("ContainerNumber", {
                                    required: "Please enter container number .",
                                })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4} md={4}>
								<DatePicker
									label={'ETA Date'}
									size="small"
									value={etaDate}
									error={errors?.etaDateVal?.message}
									register={register("etaDateVal", {
										required: "Please enter Eta date."
												
									})}
									onChange={(date) => handleEtaDate(date)}
								/>

						</Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <SelectField
                                size={"small"}
                                options={statusOptions}
                                selected={selectedStatus}
                                label={"Status"}
                                onSelect={(value) => setSelectedStatus(value)}
                                error={errors?.Status?.message}
                                register={register("Status", {
                                    required: "Please enter status .",
                                })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} sx={{ mt: 1, textAlign: "right", p: 4 }}>
                            <PrimaryButton title="Update" type="submit" loading={loading} />
                        </Grid>
                    </Grid>
                </Box>



            </Box>
        </Box>
    );
}

export default EditContainer;
