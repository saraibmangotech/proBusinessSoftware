import React, { Fragment, useEffect, useRef, useState } from "react";
import { Box, Container, RadioGroup, FormControlLabel, Radio, Typography, Divider, Grid } from '@mui/material';
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import ClientServices from "services/Client";
import { ErrorToaster } from "components/Toaster";
import SelectField from "components/Select";
import { useForm } from "react-hook-form";
import SystemServices from "services/System";
import DatePicker from "components/DatePicker";
import moment from "moment";
import { CSVLink } from "react-csv";
import ExportServices from "services/Export";

function Quote() {

  const csvLink = useRef();

  // *For Export CSV Table
  const [csvData, setCsvData] = useState([]);

  const [type, setType] = useState('import');

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    reset,
    setValue: setValue2,
    getValues: getValues2,
    formState: { errors: errors2 },

  } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Countries
  const [businessCountries, setBusinessCountries] = useState([]);
  const [selectedBusinessCountry, setSelectedBusinessCountry] = useState(null);

  // *For Countries
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [allFiltersData, setAllFiltersData] = useState([])

  // *For Destination
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [exportData, setExportData] = useState([])

  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)

  // *For Business Location
  const [businessLocation, setBusinessLocation] = useState([]);
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState(null);
  const [exportDate, setExportDate] = useState(null)


  const [vehicleTypes, setVehicleTypes] = useState([])
  const [selectedVehicletype, setSelectedVehicleType] = useState(null)


  const [selectedLocation, setSelectedLocation] = useState(null);

  const [selectedType, setSelectedType] = useState(null);

  const [importRates, setImportRates] = useState(null);
  const [exportRates, setExportRates] = useState(null)

  const types = [
    { id: 1, name: "Normal Bike" },
    { id: 2, name: "Oversize Bike" },
    { id: 3, name: "Auto" },
    { id: 4, name: "Container Price" },
    { id: 5, name: "Scrap Price" },
    { id: 6, name: "Cutting" },
  ];

  // *For Handle Date
  const handleSelectMonth = (newDate) => {
    try {
      if (newDate === "Invalid Date") {
        return;
      }
      const selectedMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 2);
      const formattedDate = `${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${selectedMonth.getDate().toString().padStart(2, "0")}`;

      setValue("month", formattedDate);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Date
  const handleSelectMonthExport = (newDate) => {
    try {
      if (newDate === "Invalid Date") {
        return;
      }
      const selectedMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 2);
      const formattedDate = `${selectedMonth.getFullYear()}-${(selectedMonth.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${selectedMonth.getDate().toString().padStart(2, "0")}`;

      setValue2("monthexport", formattedDate);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Get Business Countries
  const getBusinessCountries = async () => {
    try {
      const { data } = await SystemServices.getBusinessCountries();
      setBusinessCountries(data?.countries.filter(e => e.name !== "Copart UAE"));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const getExportDropdowns = async () => {
    try {
      const { data } = await ExportServices.getExportDropdowns();

      setAllFiltersData(data?.filters)
      const countries = data?.filters.map((country, index) => ({
        id: country.country_name,
        name: country.country_name
      }));

      setCountries(countries)
    } catch (error) {
      ErrorToaster(error);
    }
  };


  // *For Get Business Location
  const getBusinessLocation = async (countryId) => {
    try {
      const { data } = await SystemServices.getBusinessLocation(countryId);
      const formattedData = [];
      data?.locations?.forEach((e) => {
        let obj = {
          id: e.id,
          name: e?.state_code + "-" + e?.city_name,
        };
        formattedData.push(obj);
      });
      setBusinessLocation(formattedData);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Destination
  const getDestinations = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 100,
        search: search,
      };
      const { data } = await SystemServices.getDestinations(params);
      setDestinations(data?.destinations?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get client rates
  const getImportRates = async () => {
    setLoading(true)
    try {
      let params = {
        date: getValues("month"),
        country_id: selectedBusinessCountry?.id,
        location_id: selectedBusinessLocation?.id,
        destination_id: selectedDestination?.id,
        type_id: selectedType?.id,
      };
      const { data } = await ClientServices.getClientRates(params);
      if (data?.rates?.length < 1) {
        ErrorToaster('Rates Not Available')

      }
      else {

        if (data?.rates.length > 1) {
          setImportRates(null)

          // *For Download CSV File
          const title = ['sep=,'];
          const head = ['Sr', 'Country', 'State/City', 'Destination', 'Month Year', 'Type', '$ Cost'];
          const body = []
          body.push(title);
          body.push(head);
          for (let index = 0; index < data?.rates?.length; index++) {
            const rate = data?.rates[index];
            const stateCity = rate?.location?.state_code + ' ' + rate?.location?.city_name
            const monthYear = moment(rate?.month_year).format('MMMM YYYY');

            let newRow = [index + 1, rate?.location?.country_name, stateCity, rate?.destination?.name, monthYear, rate?.type?.name, rate?.cost]
            body.push(newRow)
          }
          setCsvData(body)
        } else {
          setImportRates(data?.rates[0])
        }
      }
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false)
    }
  };

  // *For Get client rates
  const getExportRates = async (formData) => {
    setLoading(true)
    try {
      let params = {
        date: getValues2("monthexport"),
        country_name: selectedCountry?.name,
        city_name: selectedLocation?.name,
        vehicle_type: selectedVehicletype?.name,
        vehicle_model: selectedModel?.name,

      };
      const { data } = await ExportServices.getExportRates(params);

      if (data?.rates?.length < 1) {
        ErrorToaster('Rates Not Available')

      }
      else {

        setExportRates(data?.rates[0])
      }

    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getBusinessCountries()
    getDestinations()
    getExportDropdowns()
  }, []);

  useEffect(() => {
    if (csvData.length > 0) {
      csvLink?.current?.link.click();
    }
  }, [csvData]);

  return (
    <Fragment>

      {/* ========== Export CSV File ========== */}
      <CSVLink
        ref={csvLink}
        data={csvData}
        filename={`import-shipping-rates ${moment().format('DD-MMM-YYYY h:mm A')}.csv`}
        target="_blank"
      />

      <Box sx={{ position: 'relative', overflow: 'hidden', width: 1, height: { xs: 300, sm: 400, md: 500 }, bgcolor: Colors.mirage }}>
        <Box
          component="img"
          src={Images.quote}
          alt='banner shade'
          sx={{
            objectFit: 'cover',
            position: 'absolute',
            width: '100%',
            height: { xs: '300px', sm: '400px', md: '500px' },
            left: 0,
            top: 0,
          }}
        />
        <Container>
          <Box sx={{ marginTop: { xs: '28%', sm: '25%', md: '18%' } }}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={8} md={8} sx={{ zIndex: 5 }}>
                <Typography variant="h1" sx={{ textTransform: 'capitalize' }}>
                  Quote
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 2, md: 4 }, mt: { xs: 2, md: 4 } }}>
        <Container>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ textTransform: 'capitalize', mb: 1 }}>
              Calculate Export Shipping Rates
            </Typography>
            <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
              Check the estimated shipping price for your package
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: Colors.whiteSmoke,
              width: { md: '75%' },
              mx: 'auto',
              my: { xs: 2, md: 4 },
              py: { xs: 3, md: 7 },
              px: { xs: 4, md: 15 },
              borderRadius: 2,
            }}
          >
            <RadioGroup row
              value={type}
              onChange={(event) => setType(event.target.value)}
              sx={{ mb: 3 }}
            >
              <FormControlLabel value="import" control={<Radio />} label="Import" />
              <FormControlLabel value="export" control={<Radio />} label="Export" />
            </RadioGroup>
            {type == 'import' && <Box component={"form"} onSubmit={handleSubmit(getImportRates)}>
              <Grid container spacing={1} alignItems={'center'} justifyContent={'space-between'}>
                <Grid item xs={12} sm={6} md={6}>
                  <SelectField
                    label={'Country'}
                    size={"small"}
                    options={businessCountries}
                    selected={selectedBusinessCountry}
                    error={errors?.country?.message}
                    register={register("country", {
                      required: "Please select country.",
                    })}
                    onSelect={(value) => {
                      setSelectedBusinessCountry(value);
                      getBusinessLocation(value?.id);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <SelectField
                    size={"small"}
                    disabled={selectedBusinessCountry ? false : true}
                    label={"State & City"}
                    options={businessLocation}
                    selected={selectedBusinessLocation}
                    register={register("city")}
                    onSelect={(value) => setSelectedBusinessLocation(value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <SelectField
                    size="small"
                    label={"Destination Port"}
                    options={destinations}
                    selected={selectedDestination}
                    register={register("destination")}
                    onSelect={(value) => setSelectedDestination(value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <DatePicker
                    size={"small"}
                    label={"Price for the Month"}
                    openTo="month"
                    views={['month', 'year']}
                    minDate={new Date('2023-11-01')}
                    error={errors?.month?.message}
                    register={register("month", {
                      required: "Please enter month.",
                    })}
                    onChange={(date) => handleSelectMonth(date)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <SelectField
                    size="small"
                    label={"Vehicle Type"}
                    options={types}
                    selected={selectedType}
                    error={errors?.type?.message}
                    register={register("type", {
                      required: "Please select vehicle type.",
                    })}
                    onSelect={(value) => setSelectedType(value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6} sx={{ mt: 1.5 }}>
                  <PrimaryButton
                    fullWidth
                    type="submit"
                    loading={loading}
                    title={'Check Rates'}
                  />
                </Grid>
              </Grid>
            </Box>}
            {type == 'import' && importRates &&
              <Fragment>
                <Typography variant="h4" sx={{ my: 3 }}>
                  Shipping Rates
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ my: 1 }}>
                  <Grid container spacing={1} alignItems={'center'} justifyContent={'space-between'}>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Country :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {importRates?.location?.country_name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          State & City :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {importRates?.location?.state_code} {importRates?.location?.city_name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Destination :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {importRates?.destination?.name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Vehicle Type :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {importRates?.type?.name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Month Year :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {moment(importRates?.month_year).format('MMMM YYYY')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Cost :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          $ {parseInt(importRates?.cost).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Fragment>
            }

            {type == 'export' && <Box component={"form"} onSubmit={handleSubmit2(getExportRates)}>
              <Grid
                container
                spacing={1}
                alignItems={"center"}

              >
                <Grid item xs={12} md={6}>
                  <SelectField
                    label={"Select Destination Country"}
                    size={"small"}
                    options={countries}
                    selected={selectedCountry}
                    error={errors2?.country?.message}
                    register={register2("country", {
                      required: "Please select country.",
                    })}
                    onSelect={(value) => {
                      setSelectedCountry(value);

                      const cities = allFiltersData?.filter(item => item?.country_name == value?.name)[0]?.cities


                      setBusinessLocation(cities)
                      if (!value) {
                        setSelectedLocation(null)
                        setSelectedVehicleType(null)
                        setSelectedModel(null)
                      }



                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <SelectField
                    size={"small"}
                    disabled={selectedCountry ? false : true}
                    label={"State & City"}
                    options={businessLocation}
                    selected={selectedLocation}
                    register={register2("cityexport", { required: "Please select city.", })}
                    onSelect={(value) => {
                      if (!value) {

                        setSelectedVehicleType(null)
                        setSelectedModel(null)
                      }
                      setSelectedLocation(value)
                      const cities = allFiltersData?.filter(item => item?.country_name == selectedCountry?.name)[0]?.cities

                      const types = cities?.filter(item => item?.city_name == value?.name)[0]?.types
                      setVehicleTypes(types)




                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SelectField
                    size="small"
                    label={"Vehicle Type"}
                    options={vehicleTypes}
                    selected={selectedVehicletype}
                    error={errors2?.vehicleTypeExport?.message}
                    register={register2("vehicleTypeExport", { required: "Please select type.", })}
                    onSelect={(value) => {
                      setSelectedVehicleType(value)
                      if (!value) {

                        setSelectedModel(null)
                      }

                      const cities = allFiltersData?.filter(item => item?.country_name == selectedCountry?.name)[0]?.cities

                      const allmodels = value?.models.map((item) => ({
                        id: item,
                        name: item
                      }));

                      setModels(allmodels)

                    }}
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                  <SelectField
                    size="small"
                    label={"Vehicle Model"}
                    options={models}
                    selected={selectedModel}
                    error={errors2?.model?.message}
                    register={register2("model", {
                      required: "Please select model.",
                    })}
                    onSelect={(value) => setSelectedModel(value)}
                  />
                </Grid>
                <Grid item xs={12} md={6} mb={"1%"}>
                  <DatePicker
                    size={"small"}
                    label={" Price for the Month"}
                    // value={selectMonth}
                    openTo="month"
                    views={['month', 'year']}

                    minDate={new Date('2023-11-01')}
                    error={errors2?.monthexport?.message}
                    register={register2("monthexport", {
                      required: "Please enter month.",
                    })}
                    onChange={(date) => handleSelectMonthExport(date)}
                  />

                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      mt: "12px",
                    }}
                  >
                    <PrimaryButton fullWidth type="submit" loading={loading} title="Check Rates" />
                  </Box>
                </Grid>
              </Grid>
            </Box>}

            {type == 'export' && exportRates != null &&
              <Fragment>
                <Typography variant="h4" sx={{ my: 3 }}>
                  Shipping Rates
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ my: 1 }}>
                  <Grid container spacing={1} alignItems={'center'} justifyContent={'space-between'}>
                  <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          From :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          UAE
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Destination :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {exportRates?.country_name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          State & City :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {exportRates?.city_name} {exportRates?.city_name}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Vehicle Type :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {exportRates?.vehicle_type}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Vehicle Model :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {exportRates?.vehicle_model}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Month Year :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          {moment(exportRates?.month_year).format('MMMM YYYY')}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Cost :
                        </Typography>
                        <Typography variant="body1" sx={{ color: Colors.smokeyGrey, fontFamily: FontFamily.NunitoRegular }}>
                          $ {parseInt(exportRates?.price_usd).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Fragment>
            }
          </Box>

        </Container>
      </Box>

    </Fragment>
  )
}

export default Quote;