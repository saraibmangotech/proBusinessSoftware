import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import { Divider } from "@mui/material";
import SystemServices from "services/System";
import VendorServices from "services/Vendor";
import VendorTypes from 'data/Vendor_Types';

function CreateVendor() {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  // *For Currency
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // *For Type
  const [selectedType, setSelectedType] = useState(null);

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // *For Get Currencies
  const getCurrencies = async () => {
    try {
      const { data } = await SystemServices.getCurrencies()
      const currenciesArray = []
      data?.currencies?.forEach(element => {
        let obj = {
          id: element,
          name: element.toUpperCase()
        }
        currenciesArray.push(obj)
      });
      setCurrencies(currenciesArray)
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

  // *For Create Vendor
  const createVendor = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        name: formData?.vendorName,
        type: selectedType?.id,
        details: formData?.detail,
        currency: selectedCurrency?.id,
        country_id: selectedCountry?.id,
      }
      const { message } = await VendorServices.createVendor(obj)
      SuccessToaster(message)
      navigate('/vendor-center')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCurrencies()
    getBusinessCountries()
  }, []);

  return (
    <Box
      sx={{
        m: 4,
        p: 5,
        bgcolor: Colors.white,
        borderRadius: 3,
        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
      }}
    >
      <Box component="form" onSubmit={handleSubmit(createVendor)}>
        <Grid
          container
          spacing={0}
        >
          <Grid item xs={12} sm={12}>
            <Typography
              variant="h5"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                mb: 4,
              }}
            >
              Create Vendor
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid container columnSpacing={4} item xs={12} sm={12}>
            <Grid item xs={12} sm={4}>
              <InputField
                label={"Vendor Name"}
                placeholder={"Vendor Name"}
                error={errors?.vendorName?.message}
                register={register("vendorName", {
                  required: "Please enter vendor name.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={'Vendor Type'}
                options={VendorTypes}
                selected={selectedType}
                onSelect={(value) => setSelectedType(value)}
                error={errors?.type?.message}
                register={register("type", {
                  required: 'Please select type.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={'Vendor Currency'}
                options={currencies}
                selected={selectedCurrency}
                onSelect={(value) => setSelectedCurrency(value)}
                error={errors?.currency?.message}
                register={register("currency", {
                  required: 'Please select currency.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={'Country'}
                options={countries}
                selected={selectedCountry}
                onSelect={(value) => setSelectedCountry(value)}
                error={errors?.country?.message}
                register={register("country", {
                  required: 'Please select country.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputField
                disabled={true}
                label={"SOA Category"}
                value={"Shipping Vendor Payable"}
                style={{ backgroundColor: Colors.feta }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputField
                label={"Vendor Details"}
                placeholder={"Towing and Shipping from USA"}
                multiline
                rows={4}
                error={errors?.vendorDetails?.message}
                register={register("vendorDetails", {
                  message: "Please enter vendor details.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" loading={loading} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default CreateVendor;
