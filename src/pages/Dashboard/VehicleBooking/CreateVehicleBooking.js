import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  ImageList,
  CircularProgress,
  ImageListItem,
  InputAdornment,
  InputLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Add, CancelOutlined, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import InputField from "components/Input";
import UploadFile from "components/UploadFile";
import DatePicker from "components/DatePicker";
import CustomerServices from "services/Customer";
import VehicleBookingServices from "services/VehicleBooking";
import instance from "config/axios";
import routes from "services/System/routes";
import InputPhone from "components/InputPhone";
import SystemServices from "services/System";
import { CleanTypes, Debounce, getYearMonthDateFormate } from "utils";
import TitleStatus from "data/Title_Status";
import styled from "@emotion/styled";
import Compressor from "compressorjs";
import Viewer from "viewerjs";
import moment from "moment";
import ClientServices from "services/Client";
import DeleteIcon from '@mui/icons-material/Delete';

const Input = styled("input")({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  display: "block",
  opacity: 0,
  fontSize: 0,
  cursor: "pointer",
  zIndex: 1,
});

function CreateVehicleBooking() {
  const navigate = useNavigate();
  const viewerRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    getValues,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);

  // *For Upload File types
  const allowFilesType = ["image/png", "image/jpg", "image/jpeg"];

  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Buyer Id
  const [buyerId, setBuyerId] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);

  // *For Currency
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const [vinLength, setVinLength] = useState(false);

  // *For Make
  const [makes, setMakes] = useState([]);
  const [selectedMake, setSelectedMake] = useState(null);

  // *For Models
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  // *For Color
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  // *For Title Status
  const [selectedTitleStatus, setSelectedTitleStatus] = useState(null);

  // *For Key
  const [key, setKey] = useState("N/A");


  const [extractVinLength, setExtractVinLength] = useState()
  // *For Vehicle Towers
  const [vehicleTowers, setVehicleTowers] = useState([]);
  const [selectedVehicleTower, setSelectedVehicleTower] = useState(null);

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const [loader, setLoader] = useState(false);

  // *For States
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  // *For Cities
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // *For Pictures
  const [pictures, setPictures] = useState([]);

  // *For Handle Date
  const [titleReceiveDate, setTitleReceiveDate] = useState();
  const [purchaseDate, setPurchaseDate] = useState();
  const [pickupDate, setPickupDate] = useState();
  const [deliveryDate, setDeliveryDate] = useState();
  const [allLocations, setAllLocations] = useState([]);

  const [phoneNumber, setPhoneNumber] = useState()
  const [selectedPictureIndex, setSelectedPictureIndex] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)

  const [warehouses, setWarehouses] = useState([])

  const [selectedRate, setSelectedRate] = useState({ id: 3, name: "Auto" });

  const [externalData, setExternalData] = useState();

  const handlePictureClick = (index) => {
    viewerRef.current && viewerRef.current.click();

    // Move the clicked picture to index 0
    const updatedPictures = [...pictures];
    const clickedPicture = updatedPictures.splice(index, 1)[0];
    updatedPictures.unshift(clickedPicture);

    setPictures(updatedPictures);
    setSelectedPictureIndex(0);
  };

  const rateTypeOptions = [
    { id: 1, name: "Normal Bike" },
    { id: 2, name: "Oversize Bike" },
    { id: 3, name: "Auto" },
    { id: 4, name: "Container Price" },
    { id: 5, name: "Scrap Price" },
    { id: 6, name: "Cutting" },
  ];

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

  // *For Handle Date
  const handleTitleReceiveDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setTitleReceiveDate("invalid");
        return;
      }
      setTitleReceiveDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handlePurchaseDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setPurchaseDate("invalid");
        return;
      }
      setPurchaseDate(new Date(newDate));
      setValue("purchaseDate", newDate);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handlePickupDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setPickupDate("invalid");
        return;
      }
      setPickupDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleDeliveryDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setDeliveryDate("invalid");
        return;
      }
      setDeliveryDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      let params = {
        detailed: true,
      };
      const { data } = await SystemServices.getCurrencies(params);
      const currenciesArray = [];
      data?.currencies?.forEach((element) => {
        let obj = {
          id: element?.currency,
          name: element?.currency.toUpperCase(),
          rate: element?.conversion_rate,
        };
        currenciesArray.push(obj);
      });
      const filteredArray = currenciesArray.filter((item) => item.id !== "aed");

      setCurrencies(filteredArray);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Makes
  const getMakes = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await SystemServices.getMakes(params);
      setMakes(data?.makes?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Colors
  const getModels = async (id, search, excelValue) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        make_id: selectedMake?.id ? selectedMake?.id : id,
        search: search,
      };
      const { data } = await SystemServices.getModels(params);
      setModels(data?.models?.rows);

      if (excelValue) {
        const findModel = data?.models?.rows.find(
          (e) => e?.name.toLowerCase() === excelValue.toLowerCase()
        );
        if (findModel) {
          setSelectedModel(findModel);
          setValue("model", findModel?.name);
        } else {
          createModel({ name: excelValue });
        }
      }
      return data?.models?.rows;
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Colors
  const getColors = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await SystemServices.getColors(params);
      setColors(
        data?.colors.map((item) => {
          return { id: item, name: item };
        })
      );
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Countries
  const getCountries = async () => {
    try {
      const { data } = await SystemServices.getBusinessCountries();
      setCountries(data?.countries);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Countries
  const getAllLocations = async () => {
    try {
      const { data } = await SystemServices.getBusinessLocation();
      setAllLocations(data?.locations);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get States
  const getStates = async (countryId) => {
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId);

      setStates(
        data?.locations?.map((item) => {
          return {
            id: item.id,
            name: item?.state_code + " - " + item?.city_name,
          };
        })
      );
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Cities
  const getCities = async (stateId) => {
    try {
      const { data } = await SystemServices.getCities(stateId);
      setCities(data?.cities.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Customer Booking
  const getCustomerBooking = async (search) => {
    try {
      let params = {
        name: search ?? "",
      };
      const { data } = await CustomerServices.getCustomerBooking(params);
      setCustomers(data?.customers);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Customer Buyer ID
  const getCustomerBuyerId = async (id) => {
    try {
      let params = { customerID: id };
      const { data } = await CustomerServices.getCustomerBuyerId(params);
      setBuyerId(data?.details);
      setValue("buyerId", data?.details[0]?.id);
      setSelectedBuyerId(data?.details[0]);
      setValue("auctioneer", data?.details[0]?.auction?.name);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Set Customer Detail
  const setCustomerDetail = (data) => {
    if (data) {
      getCustomerBuyerId(data?.id);
      setValue("customerId", data?.ref_id);
      setPhoneNumber(data?.uae_phone)

      setValue("contactNumber", data?.uae_phone);
      setValue("email", data?.email);
    }
  };

  const removeExtension = (fileName) =>
    fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  // *For Upload Document
  const allPictures = [...pictures];

  const handleUploadDocument = async (e) => {
    setPictureLoading(true);

    try {
      e.preventDefault();
      const files = Array.from(e.target.files);

      const uploadPromises = [];

      for (let i = 0; i < files.length; i++) {
        const element = files[i];


        if (allowFilesType.includes(element.type)) {
          const promise = new Promise((resolve, reject) => {
            new Compressor(element, {
              quality: 0.8,
              success: (compressedFile) => {
                if (compressedFile instanceof File) {
                  handleUpload(compressedFile);
                  resolve(compressedFile);
                } else {
                  const compressedFileFromBlob = new File([compressedFile], removeExtension(element.name), {
                    type: compressedFile.type,
                  });
                  handleUpload(compressedFileFromBlob);
                  resolve(compressedFileFromBlob);
                }
              },
              error: reject,
            });
          });

          uploadPromises.push(promise);
        } else {
          ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats are supported`);
        }
      }

      // Wait for all promises to resolve
      const result = await Promise.all(uploadPromises);


      // Set the file input key outside the loop
      setFileInputKey(Date.now());
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

  // // *For Remove Picture
  // const removePicture = (index) => {
  //   try {
  //     let shallowPicture = [...pictures]
  //     shallowPicture.splice(index, 1)
  //     setPictures(shallowPicture)
  //   } catch (error) {
  //     ErrorToaster(error)
  //   }
  // }

  // *For Create Vehicle Booking
  const createVehicleBooking = async (formData) => {
    setLoading(true);
    try {
      let obj = {
        customer_id: selectedCustomer?.id,
        customer_name: selectedCustomer?.name,
        customer_phone: phoneNumber,
        buyer_id: selectedBuyerId?.id,
        towed_by: selectedVehicleTower?.id,
        buyer_account_id: selectedBuyerId?.account_id,
        vin: formData.vin,
        lot_number: formData.lotNumber,
        other_charges: formData.otherCharges ? formData.otherCharges : 0,
        make: selectedMake?.id,
        make_name: selectedMake?.name,
        model: selectedModel?.id,
        model_name: selectedModel?.name,
        color: selectedColor?.id,
        country_id: selectedCountry?.id,
        location_id: selectedState ? selectedState?.id : null,
        city_id: selectedCity ? selectedCity?.id : null,
        key: key,
        title_status: selectedTitleStatus?.id,
        title_receive_date: getYearMonthDateFormate(titleReceiveDate),
        value: formData.value,
        currency: selectedCurrency?.id,
        ex_rate: selectedCurrency?.rate,
        purchase_date: getYearMonthDateFormate(purchaseDate),
        auctioneer: formData.auctioneer,
        pickup_date: getYearMonthDateFormate(pickupDate),
        delivery_date: getYearMonthDateFormate(deliveryDate),
        pictures: pictures,
        vehicle_type: selectedRate?.id,
        warehouse_id: selectedWarehouse?.id,
        notes: getValues('notes')
      };
      console.log(obj);
      const { message } = await VehicleBookingServices.createVehicleBooking(
        obj
      );
      SuccessToaster(message);
      navigate("/vehicle-booking-list");
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  // *For Create Make
  const createMake = async (name) => {
    try {
      let obj = {
        name: name,
      };
      const { data } = await SystemServices.createMake(obj);
      await getMakes();
      setSelectedMake(data?.make);
      setValue("make", data?.make?.name);
      return data?.make?.id;
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Create Model
  const createModel = async (name, makeid = null) => {
    try {
      let obj = {
        name: name,
        make_id: makeid || selectedMake?.id,
      };
      const { data } = await SystemServices.createModel(obj);
      await getModels(obj?.make_id);
      setSelectedModel(data?.model);
      setValue("model", data?.model?.name);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Vehicle Towers
  const getVehicleTowers = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await SystemServices.getVehicleTowers(params);
      setVehicleTowers(data?.towing?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Vehicle Towers
  const getWarehouses = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await SystemServices.getWarehouses(params);
      setWarehouses(data?.warehouses)
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const handleExternalData = async () => {
    if(extractVinLength){
      setLoader(true);
      try {
        let params = {
          vin: getValues("externalVin"),
        };
        const { data } = await SystemServices.handleExternalData(params);
        let lastIndex = data?.data?.sale_history?.length - 1
        console.log(data?.data?.sale_history[lastIndex]);
  
        if (data.statusCode == 404) {
          ErrorToaster('Vin Not Found')
        }
  
        else {
          setValue("vin", data?.data?.vin);
          setValue("lotNumber", data?.data?.lot_id);
  
          let Curr = currencies.find(item => item?.name == 'USD')
          handlePurchaseDate(data?.data?.sale_history[lastIndex]?.sale_date)
          if (selectedBuyerId?.auction?.name == "Copart") {
            setValue("currency", { id: 'usd', name: 'USD' });
            setSelectedCurrency({ id: 'usd', name: 'USD' });
  
          }
          else if (selectedBuyerId?.auction?.name == "IAAIs") {
            setValue("currency", { id: 'aed', name: 'AED' });
            setSelectedCurrency({ id: 'aed', name: 'AED' });
          }
  
          setValue("value", data?.data?.sale_history[lastIndex]?.purchase_price);
          let getMake = data?.data?.year + " " + data?.data?.make;
  
          let foundMake = makes.find(
            (car) => car.name.toLowerCase() === getMake.toLowerCase()
          );
          console.log(foundMake);
          console.log(makes);
          console.log(getMake);
          let totalModels = models
          if (foundMake) {
            totalModels = await getModels(foundMake?.id)
            console.log(totalModels);
          }
          let foundModel = totalModels?.find(
            (car) => car.name.toLowerCase() === data?.data?.model.toLowerCase()
          );
          console.log(models);
          console.log(foundModel, 'foundModelfoundModelfoundModelfoundModel');
          const foundColor = colors.find(
            (color) => color.name.toLowerCase() === data?.data?.color.toLowerCase()
          );
          const foundLocation = allLocations.find(
            (location) =>
              location.state_code.toLowerCase() === data?.data?.state.toLowerCase()
          );
          let newModels;
  
          let newMake = false;
          if (!foundMake) {
            let makeid = await createMake(getMake);
  
            if (makeid) {
              await createModel(data?.data?.model, makeid);
            }
          } else {
            setSelectedMake(foundMake);
            setValue("make", foundMake);
          }
          if (foundMake && !foundModel) {
            if (selectedMake?.id) {
              await createModel(data?.data?.model);
            }
          } else if (foundModel) {
            console.log(foundModel);
            setSelectedModel(foundModel);
            setValue("model", foundModel);
          }
          if (!foundColor) {
            createColor(data?.data?.color);
            getColors();
          }
  
          setSelectedColor({ id: data?.data?.color, name: data?.data?.color });
          setValue("color", { id: data?.data?.color, name: data?.data?.color });
          setKey(data?.data?.keys.toLowerCase());
          setSelectedCountry({
            id: foundLocation?.country_id,
            name: foundLocation?.country_name,
          });
          setValue("country", {
            id: foundLocation?.country_id,
            name: foundLocation?.country_name,
          });
          if (foundLocation?.country_id) {
            getStates(foundLocation?.country_id);
          }
          setPictures(data?.data?.link_img_hd);
          handlePickupDate(data?.data?.auction_date);
          setSelectedTitleStatus({ id: data?.data?.title, name: data?.data?.title });
  
          setExternalData(data);
        }
  
  
      } catch (error) {
        ErrorToaster(error);
      } finally {
        setLoader(false);
      }

    }
    else{
      ErrorToaster("Extracted Vin Must Be 17 Characters Long")
    }
  };
  // *For TTs
  const handleBooking = async (value) => {
    try {
      let params = {
        page: 1,
        limit: 15,
        search: value,
      };

      const { data } = await ClientServices.getVehicleTT(params);

      if (data?.details) {
        setValue("otherCharges", parseFloat(data?.details?.value).toFixed(2));
      }
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
      setValue("color", data?.color);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Upload Excel CSV
  const uploadExcel = (e) => {
    try {
      if (e.target.files.length) {
        const inputFile = e.target.files[0];
        if ("text/csv" === inputFile.type) {
          const reader = new FileReader();
          reader.onload = async ({ target }) => {
            const csv = Papa.parse(target.result, { header: true });
            const [data] = csv?.data;
            if (data && data["VIN"]) {
              setValue("vin", data["VIN"]);
              setValue("lotNumber", data["Lot Number"]);
              setValue("currency", data["Currency"]?.toLowerCase());
              setSelectedCurrency(data["Currency"]?.toLowerCase());
              setValue(
                "value",
                parseFloat(data["Estimated Value"].replace(/[^0-9.]/g, ""))
              );
              setKey(data["Keys"]?.toLowerCase());
              const findMake = makes.find(
                (e) => e?.name?.toLowerCase() === data["Make"]?.toLowerCase()
              );
              if (findMake) {
                setSelectedMake(findMake?.id);
                setValue("make", findMake?.id);
                getModels(findMake?.id, "", data["Model Detail"]);
              } else {
                createMake({ name: data["Make"] });
              }
              const findColor = colors.find(
                (e) => e?.name?.toLowerCase() === data["Color"]?.toLowerCase()
              );
              if (findColor) {
                setSelectedColor(findColor?.id);
                setValue("color", findColor?.id);
              } else {
                createColor({ name: data["Color"] });
              }
            } else {
              ErrorToaster("Please upload a valid CSV file.");
            }
          };
          reader.readAsText(inputFile);
        } else {
          ErrorToaster(`Only CSV formats is supported`);
        }
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  useEffect(() => {
    getCustomerBooking();
    getCurrencies();
    getMakes();
    getColors();
    getVehicleTowers();
    getCountries();
    getAllLocations();
    getWarehouses()
    setValue('rateType', { id: 3, name: "Auto" })
  }, []);

  // useEffect(() => {
  //   if (pictures.length > 0) {
  //     new Viewer(viewerRef?.current, {
  //       // options, such as zoom, navbar, etc.
  //     });

  //     // Clean up when the component unmounts
  //     // return () => {
  //     //   viewer.destroy();
  //     // };
  //   }
  // }, [pictures]);

  return (
    <Box
      className="your-component-container"
      sx={{
        m: 4,
        p: 5,
        bgcolor: Colors.white,
        borderRadius: 3,
        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
      }}
    >
      {loader && (
        <div className="bookingoverlay">
          {" "}
          <CircularProgress />{" "}
        </div>
      )}
      <Box component="form" onSubmit={handleSubmit(createVehicleBooking)}>
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
              Book A Vehicle
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getCustomerBooking(v)}
              label={"Select Customer"}
              options={customers}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value);
                setCustomerDetail(value);
              }}
              error={errors?.customer?.message}
              register={register("customer", {
                required: "Please select customer.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={8}></Grid>
          <Grid item xs={12} sm={2.5}>
            <SelectField
              disabled={selectedCustomer ? false : true}
              label={"Buyer ID"}
              options={buyerId}
              selected={selectedBuyerId}
              onSelect={(value) => {
                setSelectedBuyerId(value);
                setValue("auctioneer", value?.auction?.name);
              }}
              error={errors?.buyerId?.message}
              register={register("buyerId", {
                required: "Please select buyer id.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <InputField
              disabled={true}
              label={"Customer ID"}
              placeholder={"Customer ID"}
              register={register("customerId")}
            />
          </Grid>
          <Grid item xs={12} sm={3.5}>
            <InputPhone
              disabled={true}
              label={"Contact Number"}
              name={"contactNumber"}
              disableDropdown={true}
              countryCodeEditable={false}
              register={register("customerPhone")}
              control={control}
            />
          </Grid>
          <Grid item xs={12} sm={3.5}>
            <InputField
              disabled={true}
              label={"Email"}
              type={"email"}
              placeholder={"Email Address"}
              register={register("email")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                mb: 2,
              }}
            >
              Add Vehicle
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            {console.log(selectedBuyerId?.auction?.name)}
            {console.log(getValues('externalVin')?.length)}
            <InputField
              label={"Extract through VIN"}
              placeholder={"Extract through VIN"}
              register={register("externalVin", {
              
                onChange: (e) => {
                  if (e.target.value?.length == 17) {

                    setExtractVinLength(true)
                  } else {

                    setExtractVinLength(false)
                  }
                },
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PrimaryButton
                      disabled={
                        selectedBuyerId?.auction?.name != "Copart" &&
                        selectedBuyerId?.auction?.name != "IAAI" &&
                        !extractVinLength
                      }
                      title="Search"
                      type="button"
                      onClick={handleExternalData}
                      startIcon={<Search />}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* <Grid item xs={12} sm={4}>
            <Box sx={{ position: "relative" }}>
              <Input type="file" accept="text/csv" onChange={uploadExcel} />
              <InputField
                label={"Upload through Excel"}
                placeholder={"Upload through Excel"}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <PrimaryButton
                        title="Upload"
                        type="button"
                        startIcon={<Add />}
                        style={{ backgroundColor: Colors.bluishCyan }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid> */}
          <Grid item xs={12} md={6}>
            <SelectField
              label={"Vehicle Type"}
              options={rateTypeOptions}
              selected={selectedRate}
              error={errors?.rateType?.message}
              register={register("rateType", {
                required: "Please select type.",
              })}
              onSelect={(value) => setSelectedRate(value)}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                mb: 2,
              }}
            >
              Vehicle Details
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={"VIN"}
              placeholder={"VIN"}
              error={errors?.vin?.message}
              register={register("vin", {
                required: "Please enter VIN.",
                onChange: (e) => {
                  console.log(e.target.value?.length);
                  if (e.target.value?.length == 17) {
                    setVinLength(false);
                    console.log('asassas');

                  } else {
                    setVinLength(true);
                    handleBooking(e.target.value);
                  }
                },
              })}
            />
            {vinLength ? (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontFamily: FontFamily.NunitoRegular,
                  color: "red",
                }}
              >
                Vin must be 17 Characters Long
              </Typography>
            ) : (
              ""
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              type={"number"}
              label={"Lot Number"}
              placeholder={"Lot Number"}
              error={errors?.lotNumber?.message}
              register={register("lotNumber", {
                required: "Please enter lot number.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={"Purchase Date"}
              value={purchaseDate}
              error={errors?.purchaseDate?.message}
              register={register("purchaseDate", {
                required: "Please select purchase date",
              })}
              onChange={(date) => handlePurchaseDate(date)}
            />
          </Grid>
          <Grid container spacing={2} sx={{ m: 0.1 }}>
            <Grid item xs={12} sm={3}>
              <SelectField
                label={"Currency"}
                options={currencies}
                selected={selectedCurrency}
                onSelect={(value) => setSelectedCurrency(value)}
                error={errors?.currency?.message}
                register={register("currency", {
                  required: "Please select currency.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <InputField
                label={"Value"}
                placeholder={"Value"}
                type={"number"}
                error={errors?.value?.message}
                register={register("value", {
                  required: "Please enter value.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <InputField
                type={"number"}
                label={"Other Charges"}
                placeholder={"Other Charges"}
                InputProps={{ inputProps: { min: 0 } }}
                register={register("otherCharges")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputField

                label={"Notes"}
                placeholder={"Notes"}

                register={register("notes")}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              addNew={(newValue) => createMake(newValue)}
              onSearch={(v) => getMakes(v)}
              label={"Make"}
              options={makes}
              selected={selectedMake}
              onSelect={(value) => {
                setSelectedMake(value);
                getModels(value?.id);
                setSelectedModel(null);
              }}
              error={errors?.make?.message}
              register={register("make", {
                required: "Please select make.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              disabled={selectedMake ? false : true}
              addNew={(newValue) => createModel(newValue)}
              onSearch={(v) => getModels(selectedMake?.id, v)}
              label={"Model"}
              options={models}
              selected={selectedModel}
              onSelect={(value) => setSelectedModel(value)}
              error={errors?.model?.message}
              register={register("model", {
                required: "Please select model.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              addNew={(newValue) => createColor(newValue)}
              onSearch={(v) => getColors(v)}
              label={"Color"}
              options={colors}
              selected={selectedColor}
              onSelect={(value) => setSelectedColor(value)}
              error={errors?.color?.message}
              register={register("color", {
                required: "Please select color.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              label={"Country"}
              options={countries}
              selected={selectedCountry}
              onSelect={(value) => {
                setSelectedCountry(value);
                getStates(value?.id);
                setSelectedState(null);
                setSelectedCity(null);
              }}
              error={errors?.country?.message}
              register={register("country", {
                required: "Please select country.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              disabled={selectedCountry ? false : true}
              label={"Location"}
              options={states}
              selected={selectedState}
              onSelect={(value) => {
                setSelectedState(value);
                setSelectedCity(null);
              }}
              register={register("state & City")}
            />
          </Grid>
          {/* <Grid item xs={12} sm={3}>
            <SelectField
              disabled={selectedState ? false : true}
              label={'City'}
              options={cities}
              selected={selectedCity}
              onSelect={(value) => setSelectedCity(value)}
              register={register("city")}
            />
          </Grid> */}
          <Grid item xs={12} sm={3}>
            <SelectField
              label={"Title Status"}
              options={TitleStatus}
              selected={selectedTitleStatus}
              onSelect={(value) => setSelectedTitleStatus(value)}
              register={register("titleStatus")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label={"Title Receive Date"}
              value={titleReceiveDate}
              onChange={(date) => handleTitleReceiveDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputLabel>Key</InputLabel>
            <FormControl sx={{ mt: 1.5 }}>
              <RadioGroup
                row
                value={key}
                onChange={(e) => setKey(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel
                  value="N/A"
                  control={<Radio />}
                  label="None"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getVehicleTowers(v)}
              label={"Towed By"}
              options={vehicleTowers}
              selected={selectedVehicleTower}
              onSelect={(value) => setSelectedVehicleTower(value)}
              error={errors?.vehicleTower?.message}
              register={register("vehicleTower", {})}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getVehicleTowers(v)}
              label={"Warehouse"}
              options={warehouses}
              selected={selectedWarehouse}
              onSelect={(value) => setSelectedWarehouse(value)}
              error={errors?.warehouse?.message}
              register={register("warehouse", {})}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"Auctioneer"}
              placeholder={"Auctioneer"}
              register={register("auctioneer")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={"Pickup Date"}
              value={pickupDate}
              onChange={(date) => handlePickupDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={"Delivery Date"}
              value={deliveryDate}
              onChange={(date) => handleDeliveryDate(date)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography
              variant="body1"
              sx={{ color: Colors.charcoalGrey, mb: 1 }}
            >
              Upload Pictures
            </Typography>
            <UploadFile
              multiple={true}
              accept={allowFilesType.join(",")}
              key={fileInputKey}
              register={register("picture", {
                onChange: (e) => handleUploadDocument(e),

              })}
            />
          </Grid>
          {pictures.length > 0 && (
            <Grid item xs={12}>
              {" "}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: Colors.charcoalGrey,
                  fontFamily: FontFamily.NunitoRegular,
                }}
              >
                Please Select Primary Picture
              </Typography>
            </Grid>
          )}
          {pictures.length > 0 && (
            <Grid item xs={12} sm={12}>
              <ImageList cols={10} ref={viewerRef}>
                {pictures.map((item, index) => (
                  <ImageListItem key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <DeleteIcon sx={{ color: Colors?.danger, textAlign: 'right' }} onClick={(event) => removePicture(event, index)} />
                    </Box>
                    <Box
                      onClick={() => handlePictureClick(index)}
                      sx={{
                        cursor: "pointer",
                        position: "relative",
                        textAlign: "center",
                        border:
                          index === selectedPictureIndex
                            ? "2px solid red"
                            : "none",
                        transition: "border 0.3s ease", // Add a transition effect to the border
                      }}
                    >
                      <Box
                        component={"img"}
                        src={
                          item.includes("https")
                            ? item
                            : process.env.REACT_APP_IMAGE_BASE_URL + item
                        }
                        sx={{ height: 80, width: 80, objectFit: "contain" }}
                      />
                    </Box>
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          )}

          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
            <PrimaryButton
              disabled={pictureLoading}
              title="Submit"
              loading={loading}
              onClick={handleSubmit(createVehicleBooking)}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default CreateVehicleBooking;
