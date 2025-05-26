import React, { useEffect, useState } from "react";
import { Box, Divider, Grid, IconButton, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import { CleanTypes, getYearMonthDateFormate, getFileSize } from "utils";
import { CancelOutlined } from "@mui/icons-material";
import ShippingServices from "services/Shipping";
import SystemServices from "services/System";
import DatePicker from "components/DatePicker";
import UploadFile from "components/UploadFile";
import instance from "config/axios";
import Uploading from 'components/Uploading';
import routes from "services/System/routes";

function UpdateShippingVehicle() {

  const { state } = useLocation();
  console.log(state);

  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { register: register4, handleSubmit: handleSubmit4, formState: { errors: errors4 }, setValue: setValue4 } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Upload File types

  const allowFilesType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']
  const allowOnlyImage = ['image/png', 'image/jpg', 'image/jpeg']

  // *For Shipping Yards
  const [galaxyYards, setGalaxyYards] = useState([]);
  const [selectedGalaxyYard, setSelectedGalaxyYard] = useState(null);
  // *For Uploaded Documents

  const [uploadedSize, setUploadedSize] = useState(0);
  const [documentsDetail, setDocumentsDetail] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  // *For Uploaded Documents
  const [progress4, setProgress4] = useState(0);
  const [uploadedSize4, setUploadedSize4] = useState(0);
  const [passportDetail, setPassportDetail] = useState([]);
  const [passportLink, setPassportLink] = useState('');
  const [pictureDetail, setPictureDetail] = useState([]);
  const [pictureLink, setPictureLink] = useState('');
  const [licenseDetail, setLicenseDetail] = useState([]);
  const [licenseLink, setLicenseLink] = useState('');
  const [certificateDetail, setCertificateDetail] = useState([]);
  const [certificateLink, setCertificateLink] = useState('');

  // *For Handle Date
  const [loadingDate, setLoadingDate] = useState();
  const [exportDate, setExportDate] = useState();
  const [etaDate, setEtaDate] = useState();
  const [arrivedDate, setArrivedDate] = useState();
  const [arrivedGalaxyDate, setArrivedGalaxyDate] = useState();
  const [auctionDate, setAuctionDate] = useState();

  // *For Uploaded Documents
  const [progress, setProgress] = useState(0);
  const [blLink, setBlLink] = useState('');
  const [invoiceLink, setInvoiceLink] = useState('');

  // *For Handle Date
  const handleLoadingDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setLoadingDate('invalid')
        return
      }
      setLoadingDate(newDate ? new Date(newDate) : newDate)
      setValue('loadingDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleExportDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setExportDate('invalid')
        return
      }
      setExportDate(newDate ? new Date(newDate) : newDate)
      setValue('exportDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleEtaDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setEtaDate('invalid')
        return
      }
      setEtaDate(newDate ? new Date(newDate) : newDate)
      setValue('etaDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleArrivedDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setArrivedDate('invalid')
        return
      }
      setArrivedDate(newDate ? new Date(newDate) : newDate)
      setValue('arrivedDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }
  // *For Upload Document
  const handleUploadDocument4 = async (e, type) => {
    try {
      e.preventDefault();
      const file = e.target.files[0]
      let arr = [{
        name: file?.name,
        file: '',
        type: file?.type.split('/')[1],
        size: getFileSize(file.size),
        isUpload: false
      }]

      // *For Check Image Format
      if (type !== 'picture' && allowFilesType.includes(file.type)) {
        handleUpload4(file, arr, type)
        if (type === 'passport') {
          setPassportDetail(arr)
        } else if ('license') {
          setLicenseDetail(arr)
        } else {
          setCertificateDetail(arr)
        }
      } else if (type === 'picture' && allowOnlyImage.includes(file.type)) {
        setPictureDetail(arr)
        handleUpload4(file, arr, type)
      } else {
        setPictureDetail(arr)
        handleUpload4(file, arr, type)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload4 = async (file, docs, type) => {
    setProgress4(0)
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

          setProgress4(percentCompleted);
          setUploadedSize4(getFileSize(uploadedBytes))
        },
      });
      if (data) {
        docs[0].isUpload = true
        docs[0].file = data?.data?.nations
        if (type === 'passport') {
          setPassportDetail(docs)
          setPassportLink(data?.data?.nations)
        } else if (type === 'picture') {
          setPictureDetail(docs)
          setPictureLink(data?.data?.nations)
        } else if (type === 'license') {
          setLicenseDetail(docs)
          setLicenseLink(data?.data?.nations)
        } else {
          setCertificateDetail(docs)
          setCertificateLink(data?.data?.nations)
        }
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleArrivedGalaxyDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setArrivedGalaxyDate('invalid')
        return
      }
      setArrivedGalaxyDate(newDate ? new Date(newDate) : newDate)
      setValue('arrivedGalaxyDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }
  // *For Remove Uploaded Document
  const removeDoc4 = (type) => {
    try {
      if (type === 'passport') {
        setPassportDetail([])
        setPassportLink('')
        setValue4('passport', '')
      } else if ('picture') {
        setPictureDetail([])
        setPictureLink('')
        setValue4('picture', '')
      } else if ('license') {
        setLicenseDetail([])
        setLicenseLink('')
        setValue4('license', '')
      } else {
        setCertificateDetail([])
        setCertificateLink('')
        setValue4('certificate', '')
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }
  const handleAuctionDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setAuctionDate('invalid')
        return
      }
      setAuctionDate(newDate ? new Date(newDate) : newDate)
      setValue('auctionDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Get Galaxy Yards
  const getGalaxyYards = async () => {
    try {
      let params = {
        page: 1,
        limit: 999999,
      }
      const { data } = await SystemServices.getGalaxyYards(params)
      setGalaxyYards(data?.yards?.rows)
      setSelectedGalaxyYard(data?.yards?.rows.find(e => e?.id === state?.g_yard?.id))
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Upload Document
  const handleUploadDocument = async (e, type) => {
    try {
      e.preventDefault();
      const file = e.target.files[0]
      if (allowFilesType.includes(file.type)) {
        handleUpload(file, type)
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload = async (file, type) => {
    setProgress(0)
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

          setProgress(percentCompleted);
        },
      });
      if (data) {
        if (type === 'bl') {
          setBlLink(data?.data?.nations)
        } else {
          setInvoiceLink(data?.data?.nations)
        }
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Remove Uploaded Document
  const removeDoc = (type) => {
    try {
      if (type === 'bl') {
        setBlLink('')
        setValue('bl', '')
      } else {
        setInvoiceLink('')
        setValue('invoice', '')
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Shipping Vehicle
  const updateShippingVehicle = async (formData) => {
    setLoading(true)
    try {
      let obj = {
        vehicle_id: state?.id,
        customer_id: state?.booking?.customer?.id,
        galaxy_yard: selectedGalaxyYard?.id,
        loading_date: getYearMonthDateFormate(loadingDate),
        export_date: getYearMonthDateFormate(exportDate),
        eta: getYearMonthDateFormate(etaDate),
        arrived_port_date: getYearMonthDateFormate(arrivedDate),
        arrived_galaxy_date: getYearMonthDateFormate(arrivedGalaxyDate),
        picked_auction_date: getYearMonthDateFormate(auctionDate),
        bl: passportLink,
        auction_invoice: pictureLink,
        vin: state?.booking?.vin,
        shipping_id:state?.shipping_id
      }
      const { message } = await ShippingServices.updateShippingVehicle(obj)
      SuccessToaster(message)
      navigate('/shipping-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (state) {
      console.log(state, 'state');
      getGalaxyYards()
      setValue('vin', state?.booking?.vin)
      setValue('lot', state?.booking?.lot_number)
      setValue('containerNo', state?.shipping?.container_no)
      setValue('containerSize', state?.shipping?.container?.name)
      setValue('bookingNo', state?.shipping?.booking_no)
      setValue('shippingLine', state?.shipping?.ship_line?.name)
      setValue('vendorYard', state?.shipping?.vendor_yard)
      setValue('country', state?.shipping?.location?.country_name)
      setValue('location', `${state?.shipping?.location?.state_code}-${state?.shipping?.location?.city_name}`)
      setValue('destination', state?.shipping?.dest?.name)
      setValue('shippingVendor', state?.shipping?.ship_vendor?.name)
      setValue('serviceProvider', state?.shipping?.ship_vendor?.name)
      setValue('tower', state?.booking?.tower?.name)
      setValue('clearer', state?.shipping?.clearer?.name)
      setValue('galaxyYard', state?.g_yard?.name)
      handleLoadingDate(state?.loading_date)
      handleExportDate(state?.export_date)
      handleEtaDate(state?.eta)
      handleArrivedDate(state?.arrived_port_date)
      handleArrivedGalaxyDate(state?.arrived_galaxy_date)
      handleAuctionDate(state?.picked_auction_date)
      setBlLink(state?.bl)
      setInvoiceLink(state?.auction_invoice)
    }
  }, [state]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Update Shipping Vehicle
      </Typography>

      <Box component={'form'} onSubmit={handleSubmit(updateShippingVehicle)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'VIN'}
              placeholder={'VIN'}
              register={register("vin")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'LOT'}
              placeholder={'LOT'}
              register={register("lot")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Container No'}
              placeholder={'Container No'}
              register={register("containerNo")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Container Size'}
              placeholder={'Container Size'}
              register={register("containerSize")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Booking No'}
              placeholder={'Booking No'}
              register={register("bookingNo")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Shipping Line'}
              placeholder={'Shipping Line'}
              register={register("shippingLine")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Vendor Yard'}
              placeholder={'Vendor Yard'}
              register={register("vendorYard")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Service Provider'}
              placeholder={'Service Provider'}
              register={register("serviceProvider")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Country'}
              placeholder={'Country'}
              register={register("country")}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'State & City'}
              placeholder={'Location'}
              register={register("location")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Destination'}
              placeholder={'Destination'}
              register={register("destination")}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Towed By'}
              placeholder={'Towed By'}
              register={register("tower")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              disabled={true}
              label={'Cleared By'}
              placeholder={'Cleared By'}
              register={register("clearer")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Loading Date'}
              value={loadingDate}
              register={register("loadingDate")}
              onChange={(date) => handleLoadingDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Export Date'}
              value={exportDate}

              register={register("exportDate")}
              onChange={(date) => handleExportDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'ETA Date'}
              value={etaDate}

              register={register("etaDate")}
              onChange={(date) => handleEtaDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Arrived at port date'}
              value={arrivedDate}

              register={register("arrivedDate")}
              onChange={(date) => handleArrivedDate(date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Arrived at galaxy yard date'}
              value={arrivedGalaxyDate}

              register={register("arrivedGalaxyDate")}
              onChange={(date) => handleArrivedGalaxyDate(date)}
            />
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <DatePicker
              label={'Date picked from Auction'}
              value={auctionDate}
              disablePast={true}
              register={register("auctionDate")}
              onChange={(date) => handleAuctionDate(date)}
            />
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <SelectField
              label={'Galaxy Yard'}
              options={galaxyYards}
              selected={selectedGalaxyYard}
              onSelect={(value) => setSelectedGalaxyYard(value)}
              register={register("galaxyYard")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body1"
              sx={{ color: Colors.charcoalGrey, mb: 1 }}
            >
              Upload Bl
            </Typography>
            <UploadFile
              accept={allowFilesType}
              error={errors?.passport?.message}
              register={register("passport", {
                required:

                  "Please upload bl."
                ,
                onChange: (e) =>
                  handleUploadDocument4(
                    e,
                    "passport"
                  ),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
          {passportDetail.length > 0 && (
            <Typography
              variant="body1"
              sx={{
                color: Colors.charcoalGrey,
                my: 1,
              }}
            >
              Uploaded Files
            </Typography>
          )}
          <Box
            sx={{
              maxHeight: 300,
              overflow: "auto",
              pr: 1,
            }}
          >
            {passportDetail?.map((item, index) => (
              <Uploading
                key={index}
                data={item}
                uploadedSize={uploadedSize4}
                progress={progress4}
                removeDoc={() =>
                  removeDoc4("passport")
                }
              />
            ))}
          </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body1"
              sx={{ color: Colors.charcoalGrey, mb: 1 }}
            >
              Upload Auction Invoice
            </Typography>
            <UploadFile
              accept={allowFilesType}
              error={errors4?.picture?.message}
              register={register("picture", {
           
                onChange: (e) =>
                  handleUploadDocument4(
                    e,
                    "picture"
                  ),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {pictureDetail.length > 0 && (
              <Typography
                variant="body1"
                sx={{ color: Colors.charcoalGrey, mb: 1 }}
              >
                Uploaded Files
              </Typography>
            )}
            <Box sx={{ maxHeight: 300, overflow: "auto", pr: 1 }}>
              {pictureDetail?.map((item, index) => (
                <Uploading
                  key={index}
                  data={item}
                  uploadedSize={uploadedSize4}
                  progress={progress4}
                  removeDoc={() => removeDoc4("picture")}
                />
              ))}
            </Box>
          </Grid>
          {/* <Grid item xs={12} sm={3}>
            <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
              Upload BL
            </Typography>
            <UploadFile
              accept={allowFilesType}
              register={register("bl", {
                onChange: (e) => handleUploadDocument(e, 'bl')
              })}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            {blLink &&
              <Box sx={{ display: "flex", flexWrap: 'wrap', gap: '8px' }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component={'img'}
                    src={process.env.REACT_APP_IMAGE_BASE_URL + blLink}
                    sx={{ height: 150, width: 'auto' }}
                  />
                  <IconButton sx={{ position: 'absolute', top: '0', right: '5px', width: 15, height: 15, ml: 0.5 }} onClick={() => removeDoc('bl')}>
                    <CancelOutlined sx={{ color: Colors.danger, fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Box>
            }
          </Grid> */}
          {/* <Grid item xs={12} sm={3}>
            <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
              Upload Auction Invoice
            </Typography>
            <UploadFile
              accept={allowFilesType}
              register={register("invoice", {
                onChange: (e) => handleUploadDocument(e, 'invoice')
              })}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            {invoiceLink &&
              <Box sx={{ display: "flex", flexWrap: 'wrap', gap: '8px' }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component={'img'}
                    src={process.env.REACT_APP_IMAGE_BASE_URL + invoiceLink}
                    sx={{ height: 150, width: 'auto' }}
                  />
                  <IconButton sx={{ position: 'absolute', top: '0', right: '5px', width: 15, height: 15, ml: 0.5 }} onClick={() => removeDoc('invoice')}>
                    <CancelOutlined sx={{ color: Colors.danger, fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Box>
            }
          </Grid> */}
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

export default UpdateShippingVehicle;