import React, { Fragment, useEffect, useRef, useState } from "react";
import { Box, Dialog, Divider, FormControl, FormControlLabel, Grid, IconButton, ImageList, ImageListItem, InputLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { CancelOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import InputField from "components/Input";
import UploadFile from 'components/UploadFile';
import DatePicker from "components/DatePicker";
import CustomerServices from "services/Customer";
import VehicleBookingServices from "services/VehicleBooking";
import instance from "config/axios";
import routes from "services/System/routes";
import InputPhone from "components/InputPhone";
import SystemServices from "services/System";
import TitleStatus from 'data/Title_Status';
import { CleanTypes, Debounce, compareObjects, getYearMonthDateFormate } from "utils";
import Compressor from "compressorjs";
import Viewer from "viewerjs";
import { CircleLoading } from "components/Loaders";
import DeleteIcon from '@mui/icons-material/Delete';


function UpdateVehicleBooking() {

  const { id } = useParams();
  const navigate = useNavigate();
  const viewerRef = useRef();

  const { register, handleSubmit,getValues, formState: { errors }, setValue, control } = useForm();
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm();

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);

  // *For Upload File types
  const allowFilesType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']

  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // *For Buyer Id
  const [buyerId, setBuyerId] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);

  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // *For Currency
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // *For Make
  const [makes, setMakes] = useState([]);
  const [selectedMake, setSelectedMake] = useState(null);

  // *For Models
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  // *For Color 
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // *For States
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  // *For Title Status
  const [selectedTitleStatus, setSelectedTitleStatus] = useState(null);

  // *For Key
  const [key, setKey] = useState('yes');
   // *For Key
   const [relist, setRelist] = useState(false);

  // *For Pictures
  const [pictures, setPictures] = useState([]);

  // *For Handle Date
  const [titleReceiveDate, setTitleReceiveDate] = useState();
  const [purchaseDate, setPurchaseDate] = useState();
  const [pickupDate, setPickupDate] = useState();
  const [deliveryDate, setDeliveryDate] = useState();

  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [allData  , setAllData] = useState()

  const [warehouses, setWarehouses] = useState([])

  // *For Save Prev & Updated Data
  const [prevData, setPrevData] = useState();
  const [updatedData, setUpdatedData] = useState();
  const [compareData, setCompareData] = useState([]);

  // *For Vehicle Towers
  const [vehicleTowers, setVehicleTowers] = useState([]);
  const [selectedVehicleTower, setSelectedVehicleTower] = useState(null);

  const [selectedRate, setSelectedRate] = useState();

  // *For Dialog Box
  const [reviewUpdateDialog, setReviewUpdateDialog] = useState(false);

  const [selectedPictureIndex, setSelectedPictureIndex] = useState(0);


  const handlePictureClick = (index) => {
    viewerRef.current && viewerRef.current.click();

    // Move the clicked picture to index 0
    const updatedPictures = [...pictures];
    const clickedPicture = updatedPictures.splice(index, 1)[0];
    updatedPictures.unshift(clickedPicture);

    setPictures(updatedPictures);
    setSelectedPictureIndex(0);

  };


  // *For Handle Date
  const handleTitleReceiveDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setTitleReceiveDate('invalid')
        return
      }
      setTitleReceiveDate(newDate ? new Date(newDate) : newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handlePurchaseDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setPurchaseDate('invalid')
        return
      }
      setPurchaseDate(newDate ? new Date(newDate) : newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handlePickupDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setPickupDate('invalid')
        return
      }
      setPickupDate(newDate ? new Date(newDate) : newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleDeliveryDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setDeliveryDate('invalid')
        return
      }
      setDeliveryDate(newDate ? new Date(newDate) : newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  

  // *For Get Currencies
  const getCurrencies = async (defaultId) => {
    try {
      let params = {
        detailed: true
      }
      const { data } = await SystemServices.getCurrencies(params)
      const currenciesArray = []
      data?.currencies?.forEach(element => {
        let obj = {
          id: element?.currency,
          name: element?.currency.toUpperCase(),
          rate: element?.conversion_rate
        }
        currenciesArray.push(obj)
      });
      console.log(currenciesArray,'currenciesArray');
     let finalCurrencies= currenciesArray.filter(item => item?.id != 'cad')
      setCurrencies(finalCurrencies)
      if (defaultId) {
        setSelectedCurrency(currenciesArray.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }
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
  // *For Get Makes
  const getMakes = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getMakes(params)
      setMakes(data?.makes?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Colors
  const getModels = async (id, search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        make_id: id,
        search: search
      }
      const { data } = await SystemServices.getModels(params)
      setModels(data?.models?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Colors
  const getColors = async () => {
    try {
      const { data } = await SystemServices.getColors()
      setColors(data?.colors.map((item) => { return { id: item, name: item } }))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Countries
  const getCountries = async (defaultId) => {
    try {
      const { data } = await SystemServices.getBusinessCountries()
      setCountries(data?.countries)
      if (defaultId) {
        setSelectedCountry(data?.countries.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get States
  const getStates = async (countryId, defaultId) => {
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId)
      const stateArr = data?.locations?.map((item) => { return { id: item.id, name: item?.state_code + '-' + item?.city_name } })
      setStates(stateArr)
      if (defaultId) {
        setSelectedState(stateArr.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Customer Booking
  const getCustomerBooking = async (search, defaultId) => {
    try {
      let params = {
        name: search ?? ''
      }
      const { data } = await CustomerServices.getCustomerBooking(params)
      setCustomers(data?.customers)
      if (defaultId) {
        const detail = data?.customers.find(e => e?.id === defaultId)
        setSelectedCustomer(detail)
        setValue('customerId', detail?.ref_id)
        setValue('contactNumber', detail?.uae_phone)
        setValue('email', detail?.email)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Customer Buyer ID
  const getCustomerBuyerId = async (id, defaultId) => {
    try {
      let params = { customerID: id }
      const { data } = await CustomerServices.getCustomerBuyerId(params)
      setBuyerId(data?.details)
      if (defaultId) {
        setSelectedBuyerId(data?.details.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Set Customer Detail
  const setCustomerDetail = (data) => {
    if (data) {
      getCustomerBuyerId(data?.id);
      setValue('customerId', data?.ref_id)
      setValue('contactNumber', data?.uae_phone)
      setValue('email', data?.email)
    }
  }

  // *For Upload Document
  const allPictures = [...pictures]
  const handleUploadDocument = async (e) => {
    setPictureLoading(true)
    try {
      e.preventDefault();
      const files = Array.from(e.target.files)
      setFileInputKey(Date.now());
      files.forEach(async element => {
        if (allowFilesType.includes(element.type)) {
          new Compressor(element, {
            quality: 0.8,
            success: (compressedImage) => {
              // compressedResult has the compressed file.
              // Use the compressed file to upload the images to your server.        

              handleUpload(compressedImage)
            },
          });
        } else {
          ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
        }
      })
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await instance.post(routes.uploadDocuments, formData);
      if (data) {
        allPictures.push(data?.data?.nations)
        Debounce(() => setPictures(allPictures))
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setPictureLoading(false)
    }
  }

  // *For Remove Picture
  const removePicture = (event,index) => {
    event.preventDefault()
    try {
      let shallowPicture = [...pictures]
      shallowPicture.splice(index, 1)
      setPictures(shallowPicture)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vehicle Booking Detail
  const getVehicleBookingDetail = async () => {
    setLoader(true)
    try {
      let params = { booking_id: id }
      const { data } = await VehicleBookingServices.getVehicleBookingDetail(params)
      const { details } = data

      let prevObj = {
        customer_id: details?.customer?.name,
        buyer_id: details?.buyer?.name,
        vin: details?.vin,
        lot_number: details?.lot_number,
        currency: details?.currency.toUpperCase(),
        value: details?.value,
        other_charges: details?.other_charges,
        make: details?.veh_make?.name,
        model: details?.veh_model?.name,
        color: details?.color,
        country_id: details?.location?.country_name,
        state_id: details?.location?.state_id,
        key: details?.key,
        is_relist: details?.is_relist,
        vehicle_type:  rateTypeOptions.find(item => item?.id == details?.vehicle_type).name,
        title_status: details?.title_status,
        title_receive_date: details?.title_receive_date,
        purchase_date: details?.purchase_date,
        auctioneer: details?.auctioneer,
        pickup_date: details?.pickup_date,
        delivery_date: details?.delivery_date,
        pictures: details?.pictures,
        towed_by: details?.tower?.name,
        warehouse_id:details?.warehouse?.name,
        notes:details?.notes
      }
      setSelectedRate(rateTypeOptions.find(item => item?.id == details?.vehicle_type ))
      setPrevData(prevObj)
      setValue('customer', details?.customer_id)
      setValue('customerId', details?.customer_id)
      setValue('rate', rateTypeOptions.find(item => item?.id == details?.vehicle_type))
      setValue('vin', details?.vin)
      setValue('lotNumber', details?.lot_number)
      setValue('currency', details?.currency.toUpperCase())
      setValue('value', details?.value)
      setValue('otherCharges', details?.other_charges)
      setValue('make', details?.veh_make?.name)
      setValue('model', details?.veh_model?.name)
      setValue('color', details?.color)
      setValue('notes', details?.notes)
      setValue('country', details?.location?.country_name)
      setValue('state', details?.location?.state_code + details?.location?.city_name)
      setValue('city', details?.location?.name)
      setValue('titleStatus', details?.title_status)
      setValue('auctioneer', details?.auctioneer)
      setValue('buyerId', details?.buyer_id)
      setValue('vehicleTower', details?.tower?.name ? details?.tower?.name : '' )
      setValue('warehouse', details?.warehouse?.name)
     if(details?.tower){
      setSelectedVehicleTower({ id: details?.tower?.id, name: details?.tower?.name })
     }
      
      setKey(details?.key)
      setRelist(details?.is_relist)
      setSelectedMake(details?.veh_make)
      getModels(details?.veh_make?.id)
      setSelectedModel(details?.veh_model)
      setPictures(details?.pictures)
      setSelectedTitleStatus({ id: details?.title_status, name: details?.title_status })
      getCurrencies(details?.currency)
      getCountries(details?.location?.country_id)
      if (details?.location?.country_id) {
        getStates(details?.location?.country_id, details?.location?.id)
      }
      setSelectedColor({ id: details?.color, name: details?.color })
      getCustomerBooking('', details?.customer_id)
      getCustomerBuyerId(details?.customer_id, details?.buyer_id)
      handleTitleReceiveDate(details?.title_receive_date)
      handlePurchaseDate(details?.purchase_date)
      setSelectedWarehouse(details?.warehouse)
      handlePickupDate(details?.pickup_date)
      handleDeliveryDate(details?.delivery_date)
console.log(data,'sdasdajhsdajhsda');
      setAllData(data?.details?.customer)
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Check Updated data
  const checkUpdatedData = async (formData) => {
    try {
      let obj = {
        customer_id: selectedCustomer?.name,
        buyer_id: selectedBuyerId?.name,
        vin: formData.vin,
        lot_number: formData.lotNumber,
        other_charges: formData.otherCharges ? formData.otherCharges : 0,
        make: selectedMake?.name,
        model: selectedModel?.name,
        color: selectedColor?.name,
        country_id: selectedCountry?.name,
        location_id: selectedState ? selectedState?.name : null,
        key: key,
        is_relist: relist,
        title_status: selectedTitleStatus?.name,
        vehicle_type:  rateTypeOptions.find(item => item?.id == selectedRate?.id).name,
        title_receive_date: getYearMonthDateFormate(titleReceiveDate),
        value: formData.value,
        currency: selectedCurrency?.name,
        purchase_date: getYearMonthDateFormate(purchaseDate),
        auctioneer: formData.auctioneer,
        pickup_date: getYearMonthDateFormate(pickupDate),
        delivery_date: getYearMonthDateFormate(deliveryDate),
        pictures: pictures,
        towed_by: selectedVehicleTower?.name,
        warehouse_id: selectedWarehouse?.name,
        notes:getValues('notes')

      }
      let updateDataObj = {
        customer_id: selectedCustomer?.id,
        buyer_id: selectedBuyerId?.id,
        vin: formData.vin,
        lot_number: formData.lotNumber,
        other_charges: formData.otherCharges ? formData.otherCharges : 0,
        make: selectedMake?.id,
        model: selectedModel?.id,
        color: selectedColor?.id,
        country_id: selectedCountry?.id,
        location_id: selectedState ? selectedState?.id : null,
        key: key,
        is_relist: relist,
        title_status: selectedTitleStatus?.id,
        title_receive_date: getYearMonthDateFormate(titleReceiveDate),
        value: formData.value,
        currency: selectedCurrency?.id,
        vehicle_type:  rateTypeOptions.find(item => item?.id == selectedRate?.id).id,
        purchase_date: getYearMonthDateFormate(purchaseDate),
        auctioneer: formData.auctioneer,
        pickup_date: getYearMonthDateFormate(pickupDate),
        delivery_date: getYearMonthDateFormate(deliveryDate),
        pictures: pictures,
        towed_by: selectedVehicleTower?.id,
        warehouse_id: selectedWarehouse?.id,
        notes:getValues('notes')
      }
      const data = compareObjects(prevData, obj)

      const prevValueArray = data.map(item => ({ key: item.key, value: item.prevValue }));
      const updateValueArray = data.map(item => ({ key: item.key, value: item.updateValue }));

      setUpdatedData({ ...updateDataObj, make_name: formData?.make, model_name: formData?.model, new_data: updateValueArray, old_data: prevValueArray })

      setCompareData(data)


      if (data.length > 0) {
        setReviewUpdateDialog(true)
      } else {
        ErrorToaster('No data to update')
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Vehicle Booking
  const updateVehicleBooking = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        ...updatedData,
        booking_id: id,

        ex_rate: selectedCurrency?.rate,
        comment: formData.comment
      }
      const { message } = await VehicleBookingServices.updateVehicleBooking(obj)
      SuccessToaster(message)
      setReviewUpdateDialog(false)
      navigate('/approval-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Create Make
  const createMake = async (name) => {
    try {
      let obj = {
        name: name
      }
      const { data } = await SystemServices.createMake(obj)
      getMakes()
      setSelectedMake(data?.make)
      setValue('make', data?.make?.name)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create Model
  const createModel = async (name) => {
    try {
      let obj = {
        name: name,
        make_id: selectedMake?.id
      }
      const { data } = await SystemServices.createModel(obj)
      getModels(obj?.make_id)
      setSelectedModel(data?.model)
      setValue('model', data?.model?.name)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const rateTypeOptions = [
    { id: 1, name: "Normal Bike" },
    { id: 2, name: "Oversize Bike" },
    { id: 3, name: "Auto" },
    { id: 4, name: "Container Price" },
    { id: 5, name: "Scrap Price" },
    { id: 6, name: "Cutting" },
  ];


  // *For Get Vehicle Towers
  const getVehicleTowers = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getVehicleTowers(params)
      setVehicleTowers(data?.towing?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create Color
  const createColor = async (name) => {
    try {
      let obj = {
        color: name
      }
      const { data } = await SystemServices.createColor(obj)
      getColors()
      setSelectedColor({ id: data?.color, name: data?.color })
      setValue('color', data?.color)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    if (id) {
      getVehicleBookingDetail()
      getMakes()
      getColors()
      getVehicleTowers()
      getWarehouses()
    }
  }, [id]);

  useEffect(() => {
    if (pictures.length > 0) {
      const viewer = new Viewer(viewerRef?.current, {
        // options, such as zoom, navbar, etc.
      });

      // Clean up when the component unmounts
      return () => {
        viewer.destroy();
      };
    }
  }, [pictures]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Dialog
        open={reviewUpdateDialog}
        sx={{ '& .MuiDialog-paper': { width: '40%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
      >
        <IconButton onClick={() => setReviewUpdateDialog(false)} sx={{ position: 'absolute', right: 13, top: 13 }}>
          <CancelOutlined />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
            Review Updates
          </Typography>
          <Box component="form" onSubmit={handleSubmit2(updateVehicleBooking)} sx={{ mt: 4 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1.5 }}>
                  Old Data
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1.5 }}>
                  New Data
                </Typography>
              </Grid>
              {compareData?.map((item, index) => (
                <Fragment>
                  <Grid item xs={12} sm={6}>
                    {item?.key?.includes('pictures') ? (
                      <Fragment>
                        <Typography variant="body1">{item?.key.split('_').join(' ')}</Typography>
                        {item?.prevValue.map((item, index) => (
                          <ImageListItem key={index}>
                            <Box sx={{ position: 'relative', textAlign: 'center' }}>
                              <Box
                                component={'img'}
                                src={process.env.REACT_APP_IMAGE_BASE_URL + item}
                                sx={{ height: 200, width: 200, objectFit: 'contain' }}
                              />
                            </Box>
                          </ImageListItem>
                        ))}
                      </Fragment>
                    ) : (
                      <InputField
                        disabled={true}
                        value={item?.prevValue}
                        label={item?.key.split('_').join(' ')}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {item?.key?.includes('pictures') ? (
                      <Fragment>
                        <Typography variant="body1">{item?.key.split('_').join(' ')}</Typography>
                        {item?.updateValue.map((item, index) => (
                          <ImageListItem key={index}>
                            <Box sx={{ position: 'relative', textAlign: 'center' }}>
                              <Box
                                component={'img'}
                                src={process.env.REACT_APP_IMAGE_BASE_URL + item}
                                sx={{ height: 200, width: 200, objectFit: 'contain' }}
                              />
                            </Box>
                          </ImageListItem>
                        ))}
                      </Fragment>
                    ) : (
                      <InputField
                        disabled={true}
                        value={item?.updateValue}
                        label={item?.key.split('_').join(' ')}
                      />
                    )}
                  </Grid>
                </Fragment>
              ))}
              <Grid item xs={12} sm={12}>
                <InputField
                  multiline={true}
                  rows={4}
                  label={'Comment'}
                  placeholder={'Comment'}
                  error={errors2?.comment?.message}
                  register={register2("comment", {
                    required: 'Please enter the comment.',
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
                <PrimaryButton
                  title="Send edit for approval"
                  type='submit'
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Dialog>

      {!loader ? (
        <Box component="form" onSubmit={handleSubmit(checkUpdatedData)} >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
                Edit Vehicle Bookings
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <SelectField
           
                onSearch={(v) => getCustomerBooking(v)}
                label={'Select Customer'}
                options={customers}
                selected={selectedCustomer}
                onSelect={(value) => { setSelectedCustomer(value); setCustomerDetail(value) ; setSelectedBuyerId(null) }}
                error={errors?.customer?.message}
                register={register("customer", {
                  required: 'Please select customer.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            </Grid>
      {      console.log(selectedCustomer?.id , allData?.id)}
            <Grid item xs={12} sm={2.5}>
              <SelectField
                disabled={selectedCustomer?.id == allData?.id ? true : false }
                label={'Buyer ID'}
                options={buyerId}
                selected={selectedBuyerId}
                onSelect={(value) => setSelectedBuyerId(value)}
                error={errors?.buyerId?.message}
                register={register("buyerId", {
                  required: 'Please select buyer id.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <InputField
                disabled={true}
                label={'Customer ID'}
                placeholder={'Customer ID'}
                register={register("customerId")}
              />
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <InputPhone
                disabled={true}
                label={'Contact Number'}
                name={'contactNumber'}
                disableDropdown={true}
                countryCodeEditable={false}
                control={control}
              />
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <InputField
                disabled={true}
                label={'Email'}
                type={'email'}
                placeholder={'Email Address'}
                register={register("email")}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                Vehicle Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputField
                label={'VIN'}
                placeholder={'VIN'}
                error={errors?.vin?.message}
                register={register("vin", {
                  required: 'Please enter VIN.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputField
                label={'Lot Number'}
                placeholder={'Lot Number'}
                error={errors?.lotNumber?.message}
                register={register("lotNumber", {
                  required: 'Please enter lot number.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label={'Purchase Date'}
                value={purchaseDate}
                error={(purchaseDate === null || purchaseDate === 'invalid') ? true : false}
                errorMessage={'Please enter purchase date.'}
                onChange={(date) => handlePurchaseDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <SelectField
                label={'Currency'}
                options={currencies}
                selected={selectedCurrency}
                onSelect={(value) => setSelectedCurrency(value)}
                error={errors?.currency?.message}
                register={register("currency", {
                  required: 'Please select currency.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <InputField
                type={'number'}
                label={'Value'}
                placeholder={'Value'}
                InputProps={{ inputProps: { min: 0 } }}
                error={errors?.value?.message}
                register={register("value", {
                  required: 'Please enter value.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <InputField
                type={'number'}
                label={'Other Charges'}
                placeholder={'Other Charges'}
                InputProps={{ inputProps: { min: 0 } }}
                error={errors?.otherCharges?.message}
                register={register("otherCharges", {
                  required: 'Please enter other charges.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputField
            
                label={"Notes"}
                placeholder={"Notes"}
             
                register={register("notes")}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                addNew={(newValue) => createMake(newValue)}
                onSearch={(v) => getMakes(v)}
                label={'Make'}
                options={makes}
                selected={selectedMake}
                onSelect={(value) => { setSelectedMake(value); getModels(value?.id); setSelectedModel(null) }}
                error={errors?.make?.message}
                register={register("make", {
                  required: 'Please select make.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                disabled={selectedMake ? false : true}
                addNew={(newValue) => createModel(newValue)}
                onSearch={(v) => getModels(selectedMake?.id, v)}
                label={'Model'}
                options={models}
                selected={selectedModel}
                onSelect={(value) => setSelectedModel(value)}
                error={errors?.model?.message}
                register={register("model", {
                  required: 'Please select model.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                addNew={(newValue) => createColor(newValue)}
                onSearch={(v) => getColors(v)}
                label={'Color'}
                options={colors}
                selected={selectedColor}
                onSelect={(value) => setSelectedColor(value)}
                error={errors?.color?.message}
                register={register("color", {
                  required: 'Please select color.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                label={'Country'}
                options={countries}
                selected={selectedCountry}
                onSelect={(value) => { setSelectedCountry(value); getStates(value?.id); setSelectedState(null) }}
                error={errors?.country?.message}
                register={register("country", {
                  required: 'Please select country.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
            
                label={'Vehicle Type'}
                options={rateTypeOptions}
                selected={selectedRate}
                onSelect={(value) => { setSelectedRate(value) }}
                error={errors?.rate?.message}
                register={register("rate")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                disabled={selectedCountry ? false : true}
                label={'Location'}
                options={states}
                selected={selectedState}
                onSelect={(value) => { setSelectedState(value) }}
                register={register("state")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                label={'Title Status'}
                options={TitleStatus}
                selected={selectedTitleStatus}
                onSelect={(value) => setSelectedTitleStatus(value)}
                register={register("titleStatus")}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label={'Title Receive Date'}
                value={titleReceiveDate}
                error={(titleReceiveDate === null || titleReceiveDate === 'invalid') ? true : false}
                errorMessage={'Please enter title receive date.'}
                onChange={(date) => handleTitleReceiveDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <InputLabel>Key</InputLabel>
              <FormControl sx={{ mt: 1.5 }}>
                <RadioGroup row value={key} onChange={(e) => setKey(e.target.value)}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel value="N/A" control={<Radio />} label="None" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <SelectField
                onSearch={(v) => getVehicleTowers(v)}
                label={'Towed By'}
                options={vehicleTowers}
                selected={selectedVehicleTower}
                onSelect={(value) => setSelectedVehicleTower(value)}
                error={errors?.vehicleTower?.message}
                register={register("vehicleTower", {

                })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
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
     
            <Grid item xs={12} sm={3}>
              <InputLabel>Relist</InputLabel>
              <FormControl sx={{ mt: 1.5 }}>
                <RadioGroup row value={relist} onChange={(e) => setRelist(e.target.value)}>
                  <FormControlLabel value={true} control={<Radio />} label="Yes" />
                  <FormControlLabel value={false} control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputField
                disabled={true}
                label={'Auctioneer'}
                placeholder={'Auctioneer'}
                register={register("auctioneer")}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label={'Pickup Date'}
                value={pickupDate}
                error={(pickupDate === null || pickupDate === 'invalid') ? true : false}
                errorMessage={'Please enter pickup date.'}
                onChange={(date) => handlePickupDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label={'Delivery Date'}
                value={deliveryDate}
                error={(deliveryDate === null || deliveryDate === 'invalid') ? true : false}
                errorMessage={'Please enter delivery date.'}
                onChange={(date) => handleDeliveryDate(date)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                Upload Pictures
              </Typography>
              <UploadFile
                multiple={true}
                accept={allowFilesType}
                register={register("picture", {
                  onChange: (e) => handleUploadDocument(e)
                })}
              />
            </Grid>
            {pictures.length > 0 && <Grid item xs={12}>    <Typography variant="body1" sx={{ fontWeight: 700, color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
              Please Select Primary Picture
            </Typography></Grid>}
            {pictures.length > 0 && (
              <Grid item xs={12} sm={12}>
                <ImageList cols={10} ref={viewerRef}>
                  {pictures.map((item, index) => (
                    <ImageListItem key={index}>
                      <Box sx={{display:'flex',justifyContent:'flex-end'}}>
                      <DeleteIcon sx={{color:Colors?.danger,textAlign:'right'}} onClick={(event) => removePicture(event,index)} />
                      </Box>
                      <Box
                      
                     
                        sx={{
                          cursor: 'pointer',
                          position: 'relative',
                          textAlign: 'center',
                          border: index === selectedPictureIndex ? '2px solid red' : 'none',
                          transition: 'border 0.3s ease', // Add a transition effect to the border


                        }}
                      >

                        <Box    onClick={() => handlePictureClick(index)}
                          component={'img'}
                          src={process.env.REACT_APP_IMAGE_BASE_URL + item}
                          sx={{ height: 80, width: 80, objectFit: 'contain' }}
                        />

                      </Box>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Grid>
            )}
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
              <PrimaryButton
                title="Back"
                style={{ backgroundColor: Colors.greyShade, marginRight: '8px' }}
                onClick={() => navigate(-1)}
              />
              <PrimaryButton
                disabled={pictureLoading}
                title="Submit"
                type='submit'
              />
            </Grid>
          </Grid>
        </Box>
      ) : (
        <CircleLoading />
      )}

    </Box>
  );
}

export default UpdateVehicleBooking;