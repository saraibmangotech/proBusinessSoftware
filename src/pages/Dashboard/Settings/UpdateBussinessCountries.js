import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import BuyerServices from "services/Buyer";
import AuctionHouseServices from "services/AuctionHouse";
import { emailRegex } from "utils";
import SystemServices from "services/System";

function UpdateBusinessCountries() {
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log(state);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Auction House
  const [auctionHouses, setAuctionHouses] = useState([]);
  const [selectedAuctionHouses, setSelectedAuctionHouses] = useState(null);

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [stateDisabled, setstateDisabled] = useState(true);

  // *For States
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);

  const [countryCode, setCountryCode] = useState();

  // *For Cities
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // *For Select Type
  const [selectedType, setSelectedType] = useState(null);

  // *For Loading Port
  const [loadingPort, setLoadingPort] = useState([]);
  const [selectedLoadingPort, setSelectedLoadingPort] = useState(null);

  // *For Get Auction Houses
  const getAuctionHouses = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await AuctionHouseServices.getAuctionHouses(params);
      setAuctionHouses(data?.auction_houses.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Create Buyer ID
  const updateBusinessLocation = async (formData) => {
    setLoading(true);
    console.log(selectedState);
    try {
      let obj = {
        country_name: selectedCountry?.name,
        country_code: countryCode,
        country_id: selectedCountry?.id,
        city_name: getValues("city"),
        state_code: selectedState
          ? selectedState?.name
          : selectedLoadingPort?.code,
        port_id: selectedLoadingPort?.id,
        location_id: state?.id,
      };
      console.log(obj, "obj");
      const { message } = await BuyerServices.updateBusinessLocation(obj);
      SuccessToaster(message);
      navigate("/business-locations");
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  // *For Create Make
  const createState = async (name) => {

    let obj = { id: name, name: name };
    setSelectedState({ id: name, name: name });
    const newArray = [...states, obj];

    setStates(newArray);
  };

  // *For Get States
  const getStates = async (countryId) => {
    console.log(countryId, "countryId");
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId);

      setCountryCode(data?.locations[0]?.country_code);

      // Create an object to store unique items based on state_code
      const uniqueItems = {};

      // Filter out duplicates based on state_code
      const result = data?.locations.filter((item) => {
        if (!uniqueItems[item.state_code]) {
          uniqueItems[item.state_code] = true;
          return true;
        }
        return false;
      });

      setStates(
        result?.map((item) => {
          return {
            id: item.id,
            name: item?.state_code,
            country_code: item?.country_code,
          };
        })
      );
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Cities
  const getCities = async (stateId) => {
    try {
      const { data } = await SystemServices.getCities(stateId);
      setCities(data?.cities.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Loading Port
  const getLoadingPorts = async (id) => {
    try {
      const { data } = await SystemServices.getLoadingPorts();

      setLoadingPort(data?.ports?.filter((item) => item?.country_id == id));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Countries
  const getCountries = async () => {
    try {
      const { data } = await SystemServices.getBusinessCountries();
      setCountries(data?.countries);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  useEffect(() => {
    getAuctionHouses();
    getCountries();
    getLoadingPorts();
  }, []);
  useEffect(() => {
    setSelectedCountry({ id: state?.country_id, name: state?.country_name });
    setSelectedLoadingPort({ id: state?.port?.id, name: state?.port?.name });
    setSelectedState({ id: state?.state_code, name: state?.state_code });
    getStates(state?.country_id);
    getLoadingPorts(state?.country_id);
    setValue("country", state?.country_id);
    setValue("port", state?.port?.id);
    setValue("city", state?.city_name);
    setValue("state", state?.state_code);
  }, [state]);

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
      <Box component="form" onSubmit={handleSubmit(updateBusinessLocation)}>
        <Grid container spacing={2} alignItem={"center"}>
          <Grid item xs={12} sm={12}>
            <Typography
              variant="h5"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                mb: 4,
              }}
            >
              Add Business Countires
            </Typography>
          </Grid>
          <Grid container spacing={1} item xs={12} sm={12}>
            <Grid item xs={12} sm={4}>
              <SelectField
                label={"Country"}
                options={countries}
                selected={selectedCountry}
                onSelect={(value) => {
                  setSelectedCountry(value);
                  getStates(value?.id);
                  setSelectedState(null);
                  setSelectedCity(null);
                  getLoadingPorts(value?.id);
                  console.log(value);
                  if (value?.id == 39) {
                    setstateDisabled(false);
                  } else {
                    setstateDisabled(true);
                  }
                }}
                error={errors?.country?.message}
                register={register("country", {
                  required: "Please select country.",
                })}
              />
            </Grid>
            {stateDisabled && (
              <Grid item xs={12} sm={4}>
                <SelectField
                  disabled={stateDisabled ? false : true}
                  label={"States"}
                  options={states}
                  selected={selectedState}
                  addNew={(newValue) => createState(newValue)}
                  error={errors?.state?.message}
                  onSelect={(value) => {
                    setSelectedState(value);
                    setSelectedLoadingPort(null);
                  }}
                  register={register("state", {
                    required:
                      stateDisabled == true ? "Please select state." : false,
                  })}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <SelectField
                disabled={selectedCountry ? false : true}
                label={"Ports"}
                options={loadingPort}
                selected={selectedLoadingPort}
                error={errors?.port?.message}
                onSelect={(value) => setSelectedLoadingPort(value)}
                register={register("port", {
                  required: "Please select port.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <InputField
                label={"City Name"}
                placeholder={"City Name"}
                error={errors?.buyerId?.message}
                register={register("city", {
                  required: "Please enter city.",
                })}
              />
            </Grid>

            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Update" type="submit" loading={loading} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default UpdateBusinessCountries;
