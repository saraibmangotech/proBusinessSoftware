import React, { useEffect, useState } from "react";
import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import ExportFinanceServices from "services/ExportFinance";
import DatePicker from "components/DatePicker";
import SystemServices from "services/System";

function CreateAccount() {

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, resetField } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Unit
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();

  // *For Account Nature
  const [accountNature, setAccountNature] = useState('primary');

  //for Nature
  const [selectedNature, setSelectedNature] = useState(null)

  // *For Major Categories
  const [majorCategories, setMajorCategories] = useState([]);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState();

  // *For Sub Categories
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // *For Parent Account
  const [parentAccounts, setParentAccounts] = useState([]);
  const [selectedParentAccount, setSelectedParentAccount] = useState();

  // *For Currency
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // *For Account PreRequisite  
  const [headId, setHeadId] = useState();
  const [subHeadId, setSubHeadId] = useState();
  const [typeCode, setTypeCode] = useState();
  const [typeSeries, setTypeSeries] = useState();
  const [primarySeries, setPrimarySeries] = useState();

  const [balanceDate, setBalanceDate] = useState();

  // *For Handle Date
  const handleBalanceDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setBalanceDate('invalid')
        return
      }
      setBalanceDate(new Date(newDate))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Units
  const getUnits = async () => {
    try {
      const { data } = await ExportFinanceServices.getUnits()
      const unitsArray = []
      data?.units.forEach(element => {
        let obj = {
          id: element,
          name: element
        }
        unitsArray.push(obj)
      });
      setUnits(unitsArray)
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

      setCurrencies(currenciesArray)
      if (defaultId) {
        setSelectedCurrency(currenciesArray.find(e => e?.id === defaultId))
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Major Categories
  const getMajorCategories = async () => {
    try {
      const { data } = await ExportFinanceServices.getMajorCategories()
      setMajorCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Sub Categories
  const getSubCategories = async (id) => {
    try {
      let params = {
        category_id: id
      }
      const { data } = await ExportFinanceServices.getSubCategories(params)
      setSubCategories(data?.categories)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For handle Accounts PreRequisite
  const handleSelectSubCat = (item) => {
    setSelectedSubCategory(item)
    const { type } = subCategories.find(e => e.id === item?.id)
    setHeadId(type?.head_id)
    setSubHeadId(type?.id)
    setTypeCode(type?.type_code + type?.type_number)
    setTypeSeries(type?.series)
  }

  // *For Get Account Code
  const getAccountCode = async (code, series, primarySeries) => {
    try {
      let params = {
        type_code: code,
        type_series: series,
      }
      if (accountNature === 'subAccount') {
        params.primary_series = primarySeries
      }
      const { data } = await ExportFinanceServices.getAccountCode(params)
      setValue('accountCode', data?.code?.account_code)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Account By SubCategory
  const getAccountBySubCategory = async (id) => {
    try {
      let params = {
        sub_category: id,
      }
      const { data } = await ExportFinanceServices.getAccountBySubCategory(params)
      setParentAccounts(data?.accounts?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For handle Parent Accounts PreRequisite
  const handleParentAccount = (item) => {
    setSelectedParentAccount(item)
    const data = parentAccounts.find(e => e.id === item?.id)
    setPrimarySeries(data?.primary_series)
    getAccountCode(typeCode, typeSeries, data?.primary_series)
  }

  // *For Create Account
  const createAccount = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        name: formData?.accountName,
        head_id: headId,
        sub_head: subHeadId,
        category: selectedMajorCategory?.id,
        sub_category: selectedSubCategory?.id,
        type_code: typeCode,
        type_series: typeSeries,
        unit: selectedUnit?.id,
        opening_balance: parseInt(formData?.openingBalance),
        balance_date: balanceDate,
        nature:selectedNature?.id,
        currency:selectedCurrency?.id,
        comments: formData?.comments
      }
      if (accountNature === 'subAccount') {
        obj.primary_series = primarySeries
        obj.primary_account_id = selectedParentAccount?.id
      }
      const { message } = await ExportFinanceServices.createAccount(obj)
      SuccessToaster(message)
      navigate('/account-approval-export')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUnits()
    getMajorCategories()
    getCurrencies()
  }, []);

  useEffect(() => {
    if (accountNature === 'subAccount' && selectedSubCategory?.id) {
      getAccountBySubCategory(selectedSubCategory?.id)
      setSelectedParentAccount('')
      resetField('accountCode')
    } else if (accountNature === 'primary' && selectedSubCategory?.id) {
      getAccountCode(typeCode, typeSeries)
    }
  }, [selectedSubCategory, accountNature]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Add Account
      </Typography>

      <Box component="form" onSubmit={handleSubmit(createAccount)} >
        <Grid container spacing={2} >
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Unit'}
              options={units}
              selected={selectedUnit}
              onSelect={(value) => setSelectedUnit(value)}
              error={errors?.unit?.message}
              register={register("unit", {
                required: 'Please select unit.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
              Nature
            </Typography>
            <FormControl>
              <RadioGroup row value={accountNature} onChange={(e) => setAccountNature(e.target.value)}>
                <FormControlLabel value="primary" control={<Radio />} label="Primary" />
                <FormControlLabel value="subAccount" control={<Radio />} label="Sub Account" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Major Category'}
              options={majorCategories}
              selected={selectedMajorCategory}
              onSelect={(value) => { setSelectedMajorCategory(value); getSubCategories(value?.id); setSelectedSubCategory(null) }}
              error={errors?.majorCategory?.message}
              register={register("majorCategory", {
                required: 'Please select major category.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              disabled={selectedMajorCategory ? false : true}
              label={'Sub Category'}
              options={subCategories}
              selected={selectedSubCategory}
              onSelect={(value) => handleSelectSubCat(value)}
              error={errors?.subCategory?.message}
              register={register("subCategory", {
                required: 'Please select sub category.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            {accountNature === 'subAccount' &&
              <SelectField
                disabled={selectedSubCategory ? false : true}
                label={'Parent Account'}
                options={parentAccounts}
                selected={selectedParentAccount}
                onSelect={(value) => handleParentAccount(value)}
                error={errors?.parentAccount?.message}
                register={register("parentAccount", {
                  required: accountNature === 'subAccount' ? 'Please select parent account.' : false,
                })}
              />
            }
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={'Account Code'}
              placeholder={'Account Code'}
              register={register("accountCode")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Account Name'}
              placeholder={'Account Name'}
              error={errors?.accountName?.message}
              register={register("accountName", {
                required: 'Please enter account name.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Opening Balance (AED)'}
              placeholder={'Opening Balance (AED)'}
              error={errors?.openingBalance?.message}
              register={register("openingBalance", {
                required: 'Please enter opening balance.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Balance Date'}
              value={balanceDate}
              onChange={(date) => handleBalanceDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            {console.log(accountNature)}
            <SelectField
              label={'Nature'}
              disabled={accountNature == "subAccount" ? true : false}
              options={[{ id: 'debit', name: 'Debit' }, { id: 'credit', name: 'Credit' }]}
              selected={selectedNature}
              onSelect={(value) => setSelectedNature(value)}
              error={errors?.currency?.message}
              register={register("nature", {
                required: 'Please select nature.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <SelectField
              label={'Currency'}
              disabled={accountNature == "primary" ? false : true}
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
            <InputField
              label={'Comments'}
              placeholder={'Comments'}
              error={errors?.comments?.message}
              register={register("comments", {
                required: 'Please enter comments.',
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

export default CreateAccount;