import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { FontFamily } from "assets";
import InputField from "components/Input";
import AuctionHouseServices from "services/AuctionHouse";

function CreateAuctionHouse() {

  const navigate = useNavigate();
  const { state } = useLocation();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Update Auction House
  const updateAuctionHouse = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        id: state?.id,
        account_id: state?.account_id,
        name: formData?.auctionHouse,
      }
      const { message } = await AuctionHouseServices.updateAuctionHouse(obj)
      SuccessToaster(message)
      navigate('/auction-house-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (state) {
      setValue('auctionHouse', state?.name)
    }
  }, [state]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(updateAuctionHouse)} >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Edit Auction House
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputField
              label={'Auction House'}
              placeholder={'Auction House'}
              error={errors?.auctionHouse?.message}
              register={register("auctionHouse", {
                required: 'Please enter auction house name.',
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

export default CreateAuctionHouse;