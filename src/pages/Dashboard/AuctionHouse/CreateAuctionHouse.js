import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { FontFamily } from "assets";
import InputField from "components/Input";
import AuctionHouseServices from "services/AuctionHouse";

function CreateAuctionHouse() {

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Create Auction House
  const createAuctionHouse = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        name: formData?.auctionHouse,
      }
      const { message } = await AuctionHouseServices.createAuctionHouse(obj)
      SuccessToaster(message)
      navigate('/auction-house-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(createAuctionHouse)} >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Add Auction House
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