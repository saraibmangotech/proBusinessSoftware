import React, { useEffect, useRef, useState } from "react";
import { Box, Divider, Grid, IconButton, InputAdornment, Tooltip, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import { getYearMonthDateFormate } from "utils";
import { Add, CancelOutlined } from "@mui/icons-material";
import ShippingServices from "services/Shipping";
import SystemServices from "services/System";
import DatePicker from "components/DatePicker";
import AddGalaxyYard from "components/Dialog/AddGalaxyYard";
import AddServiceProvider from "components/Dialog/AddServiceProvider";
import jsPDF from "jspdf";

function CreateShipping() {

  const navigate = useNavigate();
  const contentRef = useRef();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, reset: reset2 } = useForm();

  const [loading, setLoading] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);

  // *For Shipping Line
  const [shippingLines, setShippingLines] = useState([]);
  const [selectedShippingLine, setSelectedShippingLine] = useState(null);


  // *For Shipping Vendors
  const [shippingVendors, setShippingVendors] = useState([]);
  const [selectedShippingVendor, setSelectedShippingVendor] = useState(null);

  // *For Shipping Yards
  const [galaxyYards, setGalaxyYards] = useState([]);
  const [selectedGalaxyYard, setSelectedGalaxyYard] = useState(null);

  // *For Shipping Yards
  const [shippingVins, setShippingVins] = useState([]);
  const [selectedShippingVin, setSelectedShippingVin] = useState(null);

  // *For Clearers
  const [clearers, setClearers] = useState([]);
  const [selectedClearer, setSelectedClearer] = useState(null);

  // *For Vehicle Towers
  const [vehicleTowers, setVehicleTowers] = useState([]);
  const [selectedVehicleTower, setSelectedVehicleTower] = useState(null);

  // *For Container Sizes
  const [containerSizes, setContainerSizes] = useState([]);
  const [selectedContainerSize, setSelectedContainerSize] = useState(null);

  // *For Destination
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // *For Loading Port
  const [loadingPort, setLoadingPort] = useState([]);
  const [selectedLoadingPort, setSelectedLoadingPort] = useState(null);

  // *For Vehicle Detail
  const [vehicleDetail, setVehicleDetail] = useState([]);

  // *For Handle Date
  const [loadingDate, setLoadingDate] = useState();
  const [exportDate, setExportDate] = useState();
  const [etaDate, setEtaDate] = useState();
  const [arrivedDate, setArrivedDate] = useState();
  const [arrivedGalaxyDate, setArrivedGalaxyDate] = useState();
  const [auctionDate, setAuctionDate] = useState();

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // *For Business Location
  const [businessLocation, setBusinessLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // *For Handle Date
  const handleLoadingDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setLoadingDate('invalid')
        return
      }
      setLoadingDate(newDate)
      setValue('loadingDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }


  const generatePDF = async() => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'px',
    });
    doc.html(contentRef.current, {
      async callback(doc) {
        await doc.save('document');
      },
    });
  };


  const handleExportDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setExportDate('invalid')
        return
      }
      setExportDate(newDate)
      setValue('exportDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleEtaDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setEtaDate('invalid')
        return
      }
      setEtaDate(newDate)
      setValue('etaDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleArrivedDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setArrivedDate('invalid')
        return
      }
      setArrivedDate(newDate)
      setValue('arrivedDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleArrivedGalaxyDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setArrivedGalaxyDate('invalid')
        return
      }
      setArrivedGalaxyDate(newDate)
      setValue('arrivedGalaxyDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleAuctionDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setAuctionDate('invalid')
        return
      }
      setAuctionDate(newDate)
      setValue('auctionDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Business Countries
  const getBusinessCountries = async () => {
    try {
      const { data } = await SystemServices.getBusinessCountries()
      setCountries(data?.countries)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get BUsiness Location
  const getBusinessLocation = async (countryId) => {
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId)
      const formattedData = []
      data?.locations?.forEach(e => {
        let obj = {
          id: e.id,
          name: e?.state_code + '-' + e?.city_name
        }
        formattedData.push(obj)
      })
      setBusinessLocation(formattedData)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Shipping Lines
  const getShippingLines = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      }
      const { data } = await SystemServices.getShippingLines(params)
      setShippingLines(data?.lines?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Shipping Lines
  const getShippingVendors = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getShippingVendors(params)
      setShippingVendors(data?.vendors?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Galaxy Yards
  const getGalaxyYards = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getGalaxyYards(params)
      setGalaxyYards(data?.yards?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Shipping Vins
  const getShippingVin = async () => {
    try {
      let params = {
        unused: true
      }
      const { data } = await ShippingServices.getShippingVin(params)
      setShippingVins(data?.filters?.vins.map((item) => { return { id: item, name: item } }))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create Galaxy Yards
  const createGalaxyYard = async (name) => {
    try {
      let obj = {
        name: name
      }
      const { data } = await SystemServices.createGalaxyYard(obj)
      getGalaxyYards()
      setSelectedGalaxyYard(data?.model)
      setValue('galaxyYard', data?.model?.name)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Clearers
  const getClearers = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getClearers(params)
      setClearers(data?.clearers?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

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

  // *For Get Container Size
  const getContainerSizes = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getContainerSizes(params)
      setContainerSizes(data?.cont?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Destinations
  const getDestinations = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getDestinations(params)
      setDestinations(data?.destinations?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Loading Port
  const getLoadingPorts = async () => {
    try {
      const { data } = await SystemServices.getLoadingPorts()
      setLoadingPort(data?.ports)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vin Details
  const getVinDetails = async () => {
    setVinLoading(true)
    try {
      let params = {
        vin: selectedShippingVin?.id
      }
      const { data } = await ShippingServices.getVinDetails(params)
      const vehicles = [...vehicleDetail]
      const index = vehicleDetail.findIndex(e => e?.id === data?.booking?.id)
      if (index === -1) {
        vehicles.push(data?.booking)
        console.log(vehicles, 'data');
        let selectedData = vehicles[vehicles.length - 1]?.location
        setSelectedCountry({ id: selectedData?.country_id, name: selectedData?.country_name })
        getBusinessLocation(selectedData?.country_id)
        setValue('country', { id: selectedData?.country_id, name: selectedData?.country_name })
        setSelectedLocation({ id: selectedData?.id, name: selectedData?.state_code + "-" + selectedData?.city_name })
        setValue('location', { id: selectedData?.id, name: selectedData?.state_code + "-" + selectedData?.city_name })

        setVehicleDetail(vehicles)
        reset2()
      } else {
        ErrorToaster('Vehicle already added.')
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setVinLoading(false)
    }
  }

  // *For Remove Vehicle VIN Detail
  const removeVehicleDetail = (index) => {
    try {
      let newVehicleDetail = [...vehicleDetail]
      newVehicleDetail.splice(index, 1)
      setVehicleDetail(newVehicleDetail)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create Shipping
  const createShipping = async (formData) => {
    setLoading(true)
    try {
      if (vehicleDetail.length === 0) return ErrorToaster('Please select add vin')

      const vehicles = []
      console.log(vehicleDetail, 'vehicleDetail');
      vehicleDetail.forEach(e => {
        let newObj = {
          booking_id: e.id,
          vin: e.vin,
          customer_id: e.customer_id,
          towed_by: e?.towed_by,
          towing_currency: e?.tower?.currency

        }
        vehicles.push(newObj)
        console.log(newObj, 'newObj');
      })

      let obj = {
        vehicles: vehicles,
        container_no: formData?.containerNo,
        booking_no: formData?.bookingNo,
        shipping_line: selectedShippingLine?.id,
        vendor_yard: formData?.vendorYard,
        container_size: selectedContainerSize?.id,
        destination: selectedDestination?.id,
        country_id: selectedCountry?.id,
        location_id: selectedLocation?.id,
        service_provider: null,
        shipping_vendor: selectedShippingVendor?.id,
        shipping_currency: selectedShippingVendor?.currency,
        clearer: selectedClearer?.id,
        clearance_currency: selectedClearer?.currency,
        towing_currency: selectedVehicleTower?.currency,
        galaxy_yard: selectedGalaxyYard ? selectedGalaxyYard?.id : null,
        loading_port_id: selectedLoadingPort?.id,
        loading_date: getYearMonthDateFormate(loadingDate),
        export_date: getYearMonthDateFormate(exportDate),
        eta: getYearMonthDateFormate(etaDate),
        arrived_port_date: getYearMonthDateFormate(arrivedDate),
        arrived_galaxy_date: getYearMonthDateFormate(arrivedGalaxyDate),
        picked_auction_date: getYearMonthDateFormate(auctionDate),
        notes: formData?.note
      }
      const { message } = await ShippingServices.createShipping(obj)
      SuccessToaster(message)
      navigate('/shipping-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  // *For Handle Select Shipping Vendor and Filter Loading Port 
  const handleSelectShippingVendor = (data) => {
    try {

      const filteredPort = loadingPort.filter(e => e?.country_id === data?.country_id)
      setSelectedShippingVendor(data)

      if (filteredPort.length === 0) {
        getLoadingPorts();
      } else {
        setLoadingPort(filteredPort);
      }

    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    getBusinessCountries()
    getShippingLines()
    getShippingVendors()
    getGalaxyYards()
    getClearers()
    getVehicleTowers()
    getContainerSizes()
    getDestinations()
    getLoadingPorts()
    getShippingVin()
  }, []);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}  >


      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Book Containers
      </Typography>

      <Box component={'form'} onSubmit={handleSubmit2(getVinDetails)} sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems={'center'}>
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'VIN'}
              options={shippingVins}
              selected={selectedShippingVin}
              onSelect={(value) => setSelectedShippingVin(value)}
              error={errors2?.shippingVin?.message}
              register={register2("shippingVin", {
                required: 'Please select vin.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <PrimaryButton
              disabled={vehicleDetail.length === 4 && true}
              title="Add"
              type='submit'
              loading={vinLoading}
              startIcon={<Add />}
            />
          </Grid>
        </Grid>
      </Box>

      {vehicleDetail.length > 0 &&
        vehicleDetail.map((item, index) => (
          <Box key={index} sx={{ mt: 3, mb: 4, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Box sx={{ width: '100px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>VIN#</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.vin}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.vin}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ width: '100px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>Buyer ID</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.buyer?.name ?? '-'}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.buyer?.name ?? '-'}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ width: '100px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>Customer ID</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.customer?.id}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.customer?.id}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ width: '150px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>Customer</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.customer?.name}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.customer?.name}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ width: '120px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>Lot Number</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.lot_number}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.lot_number}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ width: '150px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>Country From</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.country?.name ? item?.country?.name : '-'}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.country?.name ? item?.country?.name : '-'}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ width: '150px' }}>
                <Typography noWrap variant="body2" sx={{ mb: 1 }}>Location</Typography>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: Colors.flashWhite, border: '1px solid #B2B5BA', borderRadius: '4px' }}>
                  <Tooltip title={item?.location?.state_name ? item?.location?.state_name : '-'}>
                    <Typography noWrap variant="body2" sx={{ color: Colors.smokeyGrey }}>
                      {item?.location?.state_code ? item?.location?.state_code + "-" + item?.location?.city_name : '-'}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <Box>
                <IconButton aria-label="delete" sx={{ mt: 2 }} onClick={() => removeVehicleDetail(index)}>
                  <CancelOutlined sx={{ color: Colors.danger }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ))}

      <Box component={'form'} onSubmit={handleSubmit(createShipping)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <InputField
              label={'Container No'}
              placeholder={'Container No'}
              error={errors?.containerNo?.message}
              register={register("containerNo", {
                required: 'Please enter a container no.'
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              onSearch={(v) => getContainerSizes(v)}
              label={'Container Size'}
              options={containerSizes}
              selected={selectedContainerSize}
              onSelect={(value) => setSelectedContainerSize(value)}
              error={errors?.containerSize?.message}
              register={register("containerSize", {
                required: 'Please select container size.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              label={'Booking No'}
              placeholder={'Booking No'}
              error={errors?.bookingNo?.message}
              register={register("bookingNo", {
                required: 'Please enter a booking no.'
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              onSearch={(v) => getShippingLines(v)}
              label={'Shipping Line'}
              options={shippingLines}
              selected={selectedShippingLine}
              onSelect={(value) => setSelectedShippingLine(value)}
              error={errors?.shippingLine?.message}
              register={register("shippingLine", {
                required: 'Please select shipping line.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <InputField
              label={'Vendor Yard'}
              placeholder={'Vendor Yard'}
              error={errors?.vendorYard?.message}
              register={register("vendorYard", {
                required: 'Please enter a vendor yard.'
              })}
            />
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getShippingVendors(v)}
              label={'Service Provider'}
              options={shippingVendors}
              selected={selectedShippingVendor}
              onSelect={(value) => handleSelectShippingVendor(value)}
              error={errors?.shippingVendor?.message}
              register={register("shippingVendor", {
                required: 'Please select shipping vendor.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              disabled={selectedShippingVendor ? false : true}
              label={'Loading Port'}
              options={loadingPort}
              selected={selectedLoadingPort}
              onSelect={(value) => setSelectedLoadingPort(value)}
              error={errors?.loadingPort?.message}
              register={register("loadingPort", {
                required: 'Please select loading port.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <SelectField
              label={'Country'}
              options={countries}
              selected={selectedCountry}
              onSelect={(value) => { setSelectedCountry(value); getBusinessLocation(value?.id); setSelectedLocation(null) }}
              error={errors?.country?.message}
              register={register("country", {
                required: 'Please select country.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              disabled={selectedCountry ? false : true}
              label={'Location'}
              options={businessLocation}
              selected={selectedLocation}
              onSelect={(value) => setSelectedLocation(value)}
              error={errors?.location?.message}
              register={register("location", {
                required: 'Please select location.',
              })}
            />
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getDestinations(v)}
              label={'Destination'}
              options={destinations}
              selected={selectedDestination}
              onSelect={(value) => setSelectedDestination(value)}
              error={errors?.destination?.message}
              register={register("destination", {
                required: 'Please select destination.',
              })}
            />
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getVehicleTowers(v)}
              label={'Towed By'}
              options={vehicleTowers}
              selected={selectedVehicleTower}
              onSelect={(value) => setSelectedVehicleTower(value)}
              error={errors?.vehicleTower?.message}
              register={register("vehicleTower", {
                required: 'Please select vehicle tower.',
              })}
            />
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <SelectField
              onSearch={(v) => getClearers(v)}
              label={'Cleared By'}
              options={clearers}
              selected={selectedClearer}
              onSelect={(value) => setSelectedClearer(value)}
              error={errors?.clearer?.message}
              register={register("clearer")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Loading Date'}
              value={loadingDate}
              register={register("loadingDate")}
              onChange={(date) => handleLoadingDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Export Date'}
              value={exportDate}

              register={register("exportDate")}
              onChange={(date) => handleExportDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'ETA Date'}
              value={etaDate}

              register={register("etaDate")}
              onChange={(date) => handleEtaDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Arrived at port date'}
              value={arrivedDate}

              register={register("arrivedDate")}
              onChange={(date) => handleArrivedDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Arrived at galaxy yard date'}
              value={arrivedGalaxyDate}

              register={register("arrivedGalaxyDate")}
              onChange={(date) => handleArrivedGalaxyDate(date)}
            />
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Date picked from Auction'}
              value={auctionDate}
              disablePast={true}
              register={register("auctionDate")}
              onChange={(date) => handleAuctionDate(date)}
            />
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <SelectField
              disabled={arrivedGalaxyDate ? false : true}
              addNew={(newValue) => createGalaxyYard(newValue)}
              onSearch={(v) => getGalaxyYards(v)}
              label={'Galaxy Yard'}
              options={galaxyYards}
              selected={selectedGalaxyYard}
              onSelect={(value) => setSelectedGalaxyYard(value)}
              register={register("galaxyYard")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputField
              label={'Note'}
              placeholder={'Note'}
              register={register("note")}
            />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
            <PrimaryButton
              title="Submit"
              type='submit'
              loading={loading}
            />
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
}

export default CreateShipping;