import React, { Fragment, useEffect, useState } from "react";
import { Box, Grid, Typography, FormControl, FormControlLabel, tableCellClasses, Radio, RadioGroup, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import SystemServices from "services/System";
import RateType from "data/Rate_Type";
import DatePicker from "components/DatePicker";
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import moment from "moment";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    background: Colors.primary,
    color: Colors.white
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: 'center',
    textWrap: 'nowrap',
    padding: '5px !important',

    '.MuiBox-root': {
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      '.MuiBox-root': {
        cursor: 'pointer'
      }
    },
    'svg': {
      width: 'auto',
      height: '24px'
    },
    '.MuiTypography-root': {
      textTransform: 'capitalize',
      fontFamily: FontFamily.NunitoRegular,
      textWrap: 'nowrap',
    },
    '.MuiButtonBase-root': {
      padding: '8px',
      width: '28px',
      height: '28px',
    }
  },
}));

const useStyles = makeStyles({
  loaderWrap: {
    display: 'flex',
    height: 100,
    '& svg': {
      width: '40px !important',
      height: '40px !important'
    }
  }
})

function ClientShippingRate() {

  const navigate = useNavigate();

  const tableHead = ['Country', 'Location', 'Destination', 'Rate Type', 'Month', 'Price']

  const { register, handleSubmit, formState: { errors } } = useForm();

  const [loading, setLoading] = useState(false);

  // *For Type
  const [selectedType, setSelectedType] = useState('import');

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // *For Business Location
  const [businessLocation, setBusinessLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // *For Destination
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // *For Rate Type
  const [selectedRateType, setSelectedRateType] = useState(null);

  // *For Make
  const [makes, setMakes] = useState([]);
  const [selectedMake, setSelectedMake] = useState(null);

  // *For Models
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  // *For Handle Date
  const [selectMonth, setSelectMonth] = useState();

  // *For Handle Date
  const handleSelectMonth = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setSelectMonth('invalid')
        return
      }
      setSelectMonth(new Date(newDate))
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

  // *For Get BUsiness Location
  const getBusinessLocation = async (countryId) => {
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId)
      const formattedData = []
      data?.locations?.forEach(e => {
        let obj = {
          id: e.id,
          name: e?.state_code + '-' + e?.city_name
        }
        formattedData.push(obj)
      })
      setBusinessLocation(formattedData)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Destinations
  const getDestinations = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getDestinations(params)
      setDestinations(data?.destinations?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Makes
  const getMakes = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search
      }
      const { data } = await SystemServices.getMakes(params)
      setMakes(data?.makes?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Colors
  const getModels = async (id, search, excelValue) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        make_id: id,
        search: search
      }
      const { data } = await SystemServices.getModels(params)
      setModels(data?.models?.rows)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For View Shipping Prices
  const viewShippingPrice = async () => {
    try {
      setLoading(true)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    getBusinessCountries()
    getDestinations()
    getMakes()
  }, []);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Box component="form" onSubmit={handleSubmit(viewShippingPrice)} sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItem={'center'}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
              Client Shipping Rate
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular }}>
              Select Type
            </Typography>
            <FormControl>
              <RadioGroup row value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setLoading(false) }}>
                <FormControlLabel value="import" control={<Radio />} label="Import" />
                <FormControlLabel value="export" control={<Radio />} label="Export" />
              </RadioGroup>
            </FormControl>
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
              register={register("location")}
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
          {selectedType === 'export' ? (
            <Fragment>
              <Grid item xs={12} sm={4}>
                <SelectField
                  onSearch={(v) => getMakes(v)}
                  label={'Make'}
                  options={makes}
                  selected={selectedMake}
                  onSelect={(value) => { setSelectedMake(value); getModels(value?.id); setSelectedModel(null) }}
                  error={errors?.make?.message}
                  register={register("make", {
                    required: selectedType === 'export' ? 'Please select make.' : false,
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SelectField
                  disabled={selectedMake ? false : true}
                  onSearch={(v) => getModels(selectedMake?.id, v)}
                  label={'Model'}
                  options={models}
                  selected={selectedModel}
                  onSelect={(value) => setSelectedModel(value)}
                  error={errors?.model?.message}
                  register={register("model", {
                    required: selectedType === 'export' ? 'Please select model.' : false,
                  })}
                />
              </Grid>
            </Fragment>
          ) : (
            <Grid item xs={12} sm={4}>
              <SelectField
                label={'Rate Type'}
                options={RateType}
                selected={selectedRateType}
                onSelect={(value) => setSelectedRateType(value)}
                error={errors?.rateType?.message}
                register={register("rateType", {
                  required: selectedType === 'import' ? 'Please select rate type.' : false,
                })}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Select Month'}
              openTo="month"
              views={['month']}
              disablePast={true}
              value={selectMonth}
              onChange={(date) => handleSelectMonth(date)}
            />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
            <PrimaryButton
              title="View Price"
              type='submit'
            // loading={loading}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ========== Table ========== */}
      {loading &&
        <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}>
          <Table stickyHeader sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                <Cell>Country</Cell>
                <Cell>Location</Cell>
                <Cell>Destination</Cell>
                {selectedType === 'import' ? (
                  <Cell>
                    Rate Type
                  </Cell>
                ) : (
                  <Fragment>
                    <Cell>
                      Make
                    </Cell>
                    <Cell>
                      Model
                    </Cell>
                  </Fragment>
                )}
                <Cell>Month</Cell>
                <Cell>Price</Cell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Row>
                <Cell>
                  {selectedCountry?.name}
                </Cell>
                <Cell>
                  {selectedLocation?.name}
                </Cell>
                <Cell>
                  {selectedDestination?.name}
                </Cell>
                {selectedType === 'import' ? (
                  <Cell>
                    {selectedRateType?.name}
                  </Cell>
                ) : (
                  <Fragment>
                    <Cell>
                      {makes?.name}
                    </Cell>
                    <Cell>
                      {models?.name}
                    </Cell>
                  </Fragment>
                )}
                <Cell>
                  {moment(selectMonth).format('MMM')}
                </Cell>
                <Cell>
                  40000
                </Cell>
              </Row>
            </TableBody>
          </Table>
        </TableContainer>
      }

    </Box>
  );
}

export default ClientShippingRate;