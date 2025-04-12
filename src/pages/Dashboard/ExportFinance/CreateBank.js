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
import SystemServices from "services/System";
import ExportFinanceServices from "services/ExportFinance";
import { logDOM } from "@testing-library/react";

function CreateBank() {

  const navigate = useNavigate();

  const { register, handleSubmit,setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Currency
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

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

  // *For Get Countries
  const getCountries = async () => {
    try {
      const { data } = await SystemServices.getCountries()
      let country = data?.nations?.rows?.find(item => item?.id == 231)
      setCountries(country)
      setSelectedCountry(country)
      setValue('country',country)
      console.log(country);
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Create Bank
  const createBank = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        name: formData?.bankName,
        account_title: formData?.accountTitle,
        account_number: formData?.accountNumber,
        account_ibn: formData?.ibn,
        currency: selectedCurrency?.id,
        country_id: selectedCountry?.id,
        country_name: selectedCountry?.name,
      }
      const { message } = await ExportFinanceServices.createBank(obj)
      SuccessToaster(message)
      navigate('/bank-list-export')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCurrencies()
    getCountries()
  }, []);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(createBank)} >
        <Grid container spacing={2} alignItem={'center'} justifyContent={'center'}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Create Bank
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Country'}
              options={countries}
              disabled={true}
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
              label={'Bank Name'}
              placeholder={'Bank Name'}
              error={errors?.bankName?.message}
              register={register("bankName", {
                required: 'Please enter bank name.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Account Title'}
              placeholder={'Account Title'}
              error={errors?.accountTitle?.message}
              register={register("accountTitle", {
                required: 'Please enter account title.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Account Number'}
              placeholder={'Account Number'}
              error={errors?.accountNumber?.message}
              register={register("accountNumber", {
                required: 'Please enter account number.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'IBN'}
              placeholder={'IBN'}
              error={errors?.ibn?.message}
              register={register("ibn", {
                required: 'Please enter ibn number.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
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

export default CreateBank;