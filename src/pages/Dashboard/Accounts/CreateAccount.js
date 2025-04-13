import React, { useEffect, useState } from "react";
import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import {  SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import FinanceServices from "services/Finance";
import DatePicker from "components/DatePicker";
import SystemServices from "services/System";
import { showErrorToast } from "components/NewToaster";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";

function CreateAccount() {
  const [handleBlockedNavigation] =
  useCallbackPrompt(false)
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, resetField } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Unit
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState();

  // *For Account Nature
  const [accountNature, setAccountNature] = useState('primary');


  // *For Major Categories
  const [majorCategories, setMajorCategories] = useState([]);
  const [selectedMajorCategory, setSelectedMajorCategory] = useState();



  // *For Currency
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [paymentType, setPaymentType] = useState("debit");

  //for Nature
  const [selectedNature, setSelectedNature] = useState(null)

  // *For Sub Categories
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // *For Parent Account
  const [parentAccounts, setParentAccounts] = useState([]);
  const [selectedParentAccount, setSelectedParentAccount] = useState();

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
      showErrorToast(error)
    }
  }

  // *For Get Units
  const getUnits = async () => {
    try {
      const { data } = await FinanceServices.getUnits()
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
      showErrorToast(error)
    }
  }

  // *For Get Major Categories
  const getMajorCategories = async () => {
    try {
      const { data } = await FinanceServices.getMajorCategories()
      setMajorCategories(data?.categories)
    } catch (error) {
      showErrorToast(error)
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
      showErrorToast(error)
    }
  }

  // *For Get Sub Categories
  const getSubCategories = async (id) => {
    try {
      let params = {
        category_id: id
      }
      const { data } = await FinanceServices.getSubCategories(params)
      setSubCategories(data?.categories)
    } catch (error) {
      showErrorToast(error)
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
      const { data } = await FinanceServices.getAccountCode(params)
      setValue('accountCode', data?.code?.account_code)
    } catch (error) {
      showErrorToast(error)
    }
  }

  // *For Get Account By SubCategory
  const getAccountBySubCategory = async (id) => {
    try {
      let params = {
        sub_category: id,
      }
      const { data } = await FinanceServices.getAccountBySubCategory(params)
      setParentAccounts(data?.accounts?.rows)
    } catch (error) {
      showErrorToast(error)
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
    console.log(paymentType);
    console.log(selectedNature);
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
        nature: selectedNature?.id,
        currency: selectedCurrency?.id,
        comments: formData?.comments
      }
      if (accountNature === 'subAccount') {
        obj.primary_series = primarySeries
        obj.primary_account_id = selectedParentAccount?.id
      }
      const { message } = await FinanceServices.createAccount(obj)
      SuccessToaster(message)
      navigate('/account-list')
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  
    getMajorCategories()
    
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
    <Box sx={{  p: 3, borderRadius: 3}}>

      
      <Box component="form" onSubmit={handleSubmit(createAccount)} >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Create Account</Typography>
        <Box sx={{ display: 'flex', gap: '5px' }} >

          <PrimaryButton
           bgcolor={'#bd9b4a'}
            title="Save"
            type={'submit'}

          />


        </Box>

      </Box>
        <Grid container spacing={2} >
        
          <Grid item xs={12} sm={12}>
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
              size={'small'}
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
              size={'small'}
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
                size={'small'}
                options={parentAccounts}
                selected={selectedParentAccount}
                onSelect={(value) => {
                  handleParentAccount(value)
                  console.log(value);
                  setValue('currency', value?.currency ? value?.currency?.toUpperCase() : 'USD')
                  setValue('nature', value?.nature ? value?.nature?.toUpperCase() : 'Debit')
                  setSelectedNature({ id: value?.nature ? value?.nature : 'debit', name: value?.nature ? value?.nature?.toUpperCase() : 'Debit' })
                  setSelectedCurrency({ id: value?.currency ? value?.currency : 'usd', name: value?.currency ? value?.currency?.toUpperCase() : 'USD' })
                }

                }

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
              size={'small'}
              placeholder={'Account Code'}
              register={register("accountCode")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Account Name'}
              placeholder={'Account Name'}
              size={'small'}
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
              size={'small'}
              error={errors?.openingBalance?.message}
              register={register("openingBalance", {
                required: 'Please enter opening balance.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Balance Date'}
              size={'small'}
              value={balanceDate}
              onChange={(date) => handleBalanceDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            {console.log(accountNature)}
            <SelectField
              label={'Nature'}
              size={'small'}
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
          
          <Grid item xs={12} sm={4}>
            <InputField
              label={'Comments'}
              size={'small'}
              placeholder={'Comments'}
              error={errors?.comments?.message}
              register={register("comments", {
                required: 'Please enter comments.',
              })}
            />
          </Grid>
         
        </Grid>
      </Box>

    </Box>
  );
}

export default CreateAccount;