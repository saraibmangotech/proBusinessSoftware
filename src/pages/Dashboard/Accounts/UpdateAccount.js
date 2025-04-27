import React, { useEffect, useState } from "react";
import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import FinanceServices from "services/Finance";

function UpdateAccount() {

  const navigate = useNavigate();
  const { state } = useLocation();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Account Nature
  const [accountNature, setAccountNature] = useState('primary');

  // *For Parent Account
  const [parentAccounts, setParentAccounts] = useState([]);
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);

  // *For Get Account By SubCategory
  const getAccountBySubCategory = async (id) => {
    try {
      let params = {
        sub_category: id,
      }
      const { data } = await FinanceServices.getAccountBySubCategory(params)
      setParentAccounts(data?.accounts?.rows)
      setSelectedParentAccount(data?.accounts?.rows.find(e => e.primary_account_id === state?.primary_account_id))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Account
  const updateAccount = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        id: state?.id,
        name: formData?.accountName,
        ref_id: formData?.ref_id
      }
      const { message } = await FinanceServices.updateAccount(obj)
      SuccessToaster(message)
      navigate('/account-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setValue('unit', state?.unit)
    console.log(state,"state")
    setAccountNature(state?.primary_account_id ? 'subAccount' : 'primary')
    setValue('majorCategory', state?.cat?.name)
    setValue('subCategory', state?.sub_cat?.name)
    setValue('subCategory', state?.sub_cat?.name)
    setValue('accountCode', state?.account_code)
    setValue('ref_id', state?.ref_id)
    setValue('accountName', state?.name)
    if (state?.primary_account_id) {
      getAccountBySubCategory(state?.sub_category)
    }
  }, []);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Update Account
      </Typography>

      <Box component="form" onSubmit={handleSubmit(updateAccount)} >
        <Grid container spacing={2} >
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={'Unit'}
              placeholder={'Unit'}
              error={errors?.unit?.message}
              register={register("unit")}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
              Nature
            </Typography>
            <FormControl>
              <RadioGroup row value={accountNature} >
                <FormControlLabel value="primary" control={<Radio />} label="Primary" />
                <FormControlLabel value="subAccount" control={<Radio />} label="Sub Account" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={'Major Category'}
              placeholder={'Major Category'}
              error={errors?.majorCategory?.message}
              register={register("majorCategory")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={'Sub Category'}
              placeholder={'Sub Category'}
              error={errors?.subCategory?.message}
              register={register("subCategory")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            {accountNature === 'subAccount' &&
              <SelectField
                disabled={true}
                label={'Parent Account'}
                options={parentAccounts}
                selected={selectedParentAccount}
                register={register("parentAccount")}
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
            <InputField
              label={'Reference ID'}
              placeholder={'Reference ID'}
              error={errors?.ref_id?.message}
              register={register("ref_id", {
                required: 'Please enter Reference ID.',
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

export default UpdateAccount;