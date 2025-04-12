import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import BuyerServices from "services/Buyer";
import AuctionHouseServices from "services/AuctionHouse";
import { emailRegex } from "utils";

function UpdateBuyerId() {

  const navigate = useNavigate();
  const { state } = useLocation();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Auction House
  const [auctionHouses, setAuctionHouses] = useState([]);
  const [selectedAuctionHouses, setSelectedAuctionHouses] = useState(null);

  // *For Select Type
  const [selectedType, setSelectedType] = useState(null);

  // *For Get Auction Houses
  const getAuctionHouses = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await AuctionHouseServices.getAuctionHouses(params)
      setAuctionHouses(data?.auction_houses.rows)
      setSelectedAuctionHouses(data?.auction_houses.rows.find(e => e?.id === state?.auction?.id))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Buyer ID
  const updateBuyerId = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        id: state?.id,
        name: formData?.buyerId,
        type: selectedType ? selectedType?.id : 'N/A',
        email: formData?.email,
        auction_house_id: selectedAuctionHouses?.id,
      }
      const { message } = await BuyerServices.updateBuyerId(obj)
      SuccessToaster(message)
      navigate('/buyer-id-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (state) {
      getAuctionHouses()
      setValue('buyerId', state?.name)
      setValue('type', state?.type)
      setValue('email', state?.email)
      setValue('auctionHouses', state?.auction?.name)
      setSelectedType({ id: state?.type, name: state?.type })
    }
  }, [state]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(updateBuyerId)} >
        <Grid container spacing={0} alignItem={'center'} justifyContent={'center'}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Edit Buyer ID
            </Typography>
          </Grid>
          <Grid container spacing={1} item xs={12} sm={9}>
            <Grid item xs={12} sm={6}>
              <InputField
                label={'Buyer ID'}
                placeholder={'Buyer ID'}
                error={errors?.buyerId?.message}
                register={register("buyerId", {
                  required: 'Please enter buyer ID.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SelectField
                onSearch={(v) => getAuctionHouses(v)}
                label={'Auctions Houses'}
                options={auctionHouses}
                selected={selectedAuctionHouses}
                onSelect={(value) => setSelectedAuctionHouses(value)}
                error={errors?.auctionHouses?.message}
                register={register("auctionHouses", {
                  required: 'Please select auction house.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SelectField
                label={'Category'}
                options={[{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'N/A', name: 'N/A' }]}
                selected={selectedType}
                onSelect={(value) => setSelectedType(value)}
                register={register("type")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputField
                label={'Email'}
                type={'email'}
                placeholder={'Email Address'}
                error={errors?.email?.message}
                register={register("email", {
                  pattern: {
                    value: emailRegex,
                    message: 'Please enter a valid email.',
                  }
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
        </Grid>
      </Box>

    </Box>
  );
}

export default UpdateBuyerId;