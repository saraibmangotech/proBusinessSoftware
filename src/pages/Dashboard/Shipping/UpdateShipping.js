import React, { useEffect, useState } from "react";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import ShippingServices from "services/Shipping";
import SystemServices from "services/System";

function UpdateShipping() {

  const { state } = useLocation();
  console.log(state);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const [loading, setLoading] = useState(false);

  // *For Shipping Line
  const [shippingLines, setShippingLines] = useState([]);
  const [selectedShippingLine, setSelectedShippingLine] = useState(null);

  // *For Shipping Vendors
  const [shippingVendors, setShippingVendors] = useState([]);
  const [selectedShippingVendor, setSelectedShippingVendor] = useState(null);

  // *For Clearers
  const [clearers, setClearers] = useState([]);
  const [selectedClearer, setSelectedClearer] = useState(null);

  // *For Vehicle Towers
  const [vehicleTowers, setVehicleTowers] = useState([]);
  const [selectedVehicleTower, setSelectedVehicleTower] = useState(null);

  // *For Container Sizes
  const [containerSizes, setContainerSizes] = useState([]);
  const [selectedContainerSize, setSelectedContainerSize] = useState(null);

  // *For Service Provider
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState(null);

  // *For Destination
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // *For Loading Port
  const [loadingPort, setLoadingPort] = useState([]);
  const [selectedLoadingPort, setSelectedLoadingPort] = useState(null);

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // *For Business Location
  const [businessLocation, setBusinessLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // *For Get Business Countries
  const getBusinessCountries = async (defaultId) => {
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

  // *For Get BUsiness Location
  const getBusinessLocation = async (countryId, defaultId) => {
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId)
      const formattedData = []
      data?.locations?.forEach(e => {
        let obj = {
          id: e.id,
          name: `${e?.state_code}-${e?.city_name}`
        }
        formattedData.push(obj)
      })
      setBusinessLocation(formattedData)
      if (defaultId) {
        setSelectedLocation(formattedData.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Shipping Lines
  const getShippingLines = async (search, defaultId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getShippingLines(params)
      setShippingLines(data?.lines?.rows)
      if (defaultId) {
        setSelectedShippingLine(data?.lines?.rows.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Shipping Lines
  const getShippingVendors = async (search, defaultId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getShippingVendors(params)
      setShippingVendors(data?.vendors?.rows)
      if (defaultId) {
        setSelectedShippingVendor(data?.vendors?.rows.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Clearers
  const getClearers = async (search, defaultId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getClearers(params)
      setClearers(data?.clearers?.rows)
      if (defaultId) {
        setSelectedClearer(data?.clearers?.rows.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Vehicle Towers
  const getVehicleTowers = async (search, defaultId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getVehicleTowers(params)
      setVehicleTowers(data?.towing?.rows)
      if (defaultId) {
        setSelectedVehicleTower(data?.towing?.rows.find(e => e?.id === defaultId))
      }
      setSelectedVehicleTower(state?.booking?.tower)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Container Size
  const getContainerSizes = async (search, defaultId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getContainerSizes(params)
      setContainerSizes(data?.cont?.rows)
      if (defaultId) {
        setSelectedContainerSize(data?.cont?.rows.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // // *For Get Service Provider
  // const getServiceProviders = async (search, defaultId) => {
  //   try {
  //     let params = {
  //       page: 1,
  //       limit: 50,
  //       search: search
  //     }
  //     const { data } = await SystemServices.getServiceProviders(params)
  //     setServiceProviders(data?.providers?.rows)
  //     if (defaultId) {
  //       setSelectedServiceProvider(data?.providers?.rows.find(e => e?.id === defaultId))
  //     }
  //   } catch (error) {
  //     ErrorToaster(error)
  //   }
  // }

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

  // *For Create Service Providers
  const createServiceProvider = async (name) => {
    try {
      let obj = {
        name: name
      }
      const { data } = await SystemServices.createServiceProvider(obj)
   
      setSelectedServiceProvider(data?.model)
      setValue('serviceProvider', data?.model?.name)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Destinations
  const getDestinations = async (search, defaultId) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getDestinations(params)
      setDestinations(data?.destinations?.rows)
      if (defaultId) {
        setSelectedDestination(data?.destinations?.rows.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }
  // *For Get Loading Port
  const getLoadingPorts = async (defaultId) => {
    try {
      const { data } = await SystemServices.getLoadingPorts()
      setLoadingPort(data?.ports)
      if (defaultId) {
        setSelectedLoadingPort(data?.ports.find(e => e?.id === defaultId))
      }
      setSelectedLoadingPort(state?.shipping?.loading_port)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Shipping
  const updateShipping = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        shipping_id: state?.shipping?.id,
        container_no: formData?.containerNo,
        booking_no: formData?.bookingNo,
        shipping_line: selectedShippingLine?.id,
        vendor_yard: formData?.vendorYard,
        container_size: selectedContainerSize?.id,
        loading_port_id: selectedLoadingPort?.id,
        destination: selectedDestination?.id,
        country_id: selectedCountry?.id,
        location_id: selectedLocation?.id,
        service_provider: selectedServiceProvider?.id,
        shipping_vendor: selectedShippingVendor?.id,
        shipping_currency: selectedShippingVendor?.currency,
        clearer: selectedClearer?.id,
        clearance_currency: selectedClearer?.currency,
        towed_by: selectedVehicleTower?.id,
        towing_currency: selectedVehicleTower?.currency,
        notes: formData?.note
      }
      const { message } = await ShippingServices.updateShipping(obj)
      SuccessToaster(message)
      navigate('/shipping-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (state) {
      setValue('containerNo', state?.shipping?.container_no)
      setValue('containerSize', state?.shipping?.container?.name)
      getContainerSizes('', state?.shipping?.container?.id)
      setValue('bookingNo', state?.shipping?.booking_no)
      setValue('shippingLine', state?.shipping?.ship_line?.name)
      getShippingLines(state?.shipping?.ship_line?.name, state?.shipping?.ship_line?.id)
      setValue('vendorYard', state?.shipping?.vendor_yard)
      setValue('serviceProvider', state?.shipping?.service?.name)
    
      setValue('country', state?.shipping?.location?.country_name)
      getBusinessCountries(state?.shipping?.location?.country_id)
      if (state?.shipping?.location?.country_id) {
        getBusinessLocation(state?.shipping?.location?.country_id, state?.shipping?.location?.id)
      }
      setValue('location', `${state?.shipping?.location?.state_code}-${state?.shipping?.location?.city_name}`)
      setValue('destination', state?.shipping?.dest?.name)
      getDestinations(state?.shipping?.dest?.name, state?.shipping?.dest?.id)
      setValue('shippingVendor', state?.shipping?.ship_vendor?.name)
      getShippingVendors(state?.shipping?.ship_vendor?.name, state?.shipping?.ship_vendor?.id)

      getVehicleTowers(state?.shipping?.tower?.name, state?.shipping?.tower?.id)
      setValue('clearer', state?.shipping?.clearer?.name)
      getClearers(state?.shipping?.clearer?.name, state?.shipping?.clearer?.id)
      getLoadingPorts(state?.shipping?.loading_port?.name, state?.shipping?.loading_port?.id)
      setValue('loadingPort', state?.shipping?.loading_port?.name)
      setValue('vehicleTower', state?.booking?.tower?.name)

    

    }
  }, [state]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Update Shipping
      </Typography>

      <Box component={'form'} onSubmit={handleSubmit(updateShipping)}>
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
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Vendor Yard'}
              placeholder={'Vendor Yard'}
              error={errors?.vendorYard?.message}
              register={register("vendorYard", {
                required: 'Please enter a vendor yard.'
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
    
              onSearch={(v) => getShippingVendors(v)}
              label={'Service Provider'}
              options={shippingVendors}
              selected={selectedShippingVendor}
              onSelect={(value) => handleSelectShippingVendor(value)}
              error={errors?.shippingVendor?.message}
              register={register("shippingVendor", {
                required: 'Please select service provider.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
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
          <Grid item xs={12} sm={4}>
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
              label={'State & City'}
              options={businessLocation}
              selected={selectedLocation}
              onSelect={(value) => setSelectedLocation(value)}
              error={errors?.location?.message}
              register={register("location", {
                required: 'Please select state & city.',
              })}
            />
          </Grid>
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
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Shipping Vendor'}
              options={shippingVendors}
              selected={selectedShippingVendor}
              onSelect={(value) => setSelectedShippingVendor(value)}
              error={errors?.shippingVendor?.message}
              register={register("shippingVendor", {
                required: 'Please select shipping vendor.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Towed By'}
              options={vehicleTowers}
              selected={selectedVehicleTower}
              onSelect={(value) => setSelectedVehicleTower(value)}
              error={errors?.vehicleTower?.message}
              register={register("vehicleTower", {
                required: 'Please select vehicle tower.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Cleared By'}
              options={clearers}
              selected={selectedClearer}
              onSelect={(value) => setSelectedClearer(value)}
              error={errors?.clearer?.message}
              register={register("clearer", {
                required: 'Please select clearer.',
              })}
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

export default UpdateShipping;