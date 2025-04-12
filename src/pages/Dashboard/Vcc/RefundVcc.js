import React, { Fragment, useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { CheckIcon, FontFamily, PendingIcon } from "assets";
import Colors from "assets/Style/Colors";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { PrimaryButton } from "components/Buttons";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import moment from "moment";
import VccServices from "services/Vcc";
import SelectField from "components/Select";
import VccPurpose from "data/Vcc_Purpose";
import SimpleDialog from "components/Dialog/SimpleDialog";
import InputPhone from "components/InputPhone";
import UploadFile from "components/UploadFile";
import { CleanTypes, getFileSize } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import Uploading from "components/Uploading";
import RefundFormDialog from "components/Dialog/RefundFormDialog";

function RefundVcc() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    setValue: setValue2,
    control: control2,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  // *For Upload File types
  const allowFilesType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/pdf",
  ];

  // *For Vcc Id
  const [vccId, setVccId] = useState();

  // *For Booking Id
  const [bookingId, setBookingId] = useState();

  // *For Vcc Purpose
  const [selectedVccPurpose, setSelectedVccPurpose] = useState(null);

  // *For Vins & Lots
  const [vins, setVins] = useState([]);
  const [selectedVin, setSelectedVin] = useState(null);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  // *For Dialog
  const [issueVccDialog, setIssueVccDialog] = useState(false);

  // *For Uploaded Documents
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [documentDetail, setDocumentDetail] = useState([]);
  const [documentLink, setDocumentLink] = useState("");
  const [vehicleDetail, setvehicleDetail] = useState();

  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [refundFormDialog, setRefundFormDialog] = useState(false);

  const [vccDeposit, setVccDeposit] = useState();

  // *For Deposit Status
  const [isDepositPaid, setIsDepositPaid] = useState();

  // *For Get Vins & Lots
  const getVinsLots = async () => {
    try {
      const { data } = await VccServices.getVinsLots();

      let vin = data?.vins.map((item) => {
        return { id: item, name: item };
      });
      let lot = data?.lots.map((item) => {
        return { id: item, name: item };
      });
      const uniqueVins = Array.from(new Set(vin.map((item) => item.id))).map(
        (id) => vin.find((item) => item.id === id)
      );
      const uniqueLots = Array.from(new Set(lot.map((item) => item.id))).map(
        (id) => lot.find((item) => item.id === id)
      );

      setVins(uniqueVins);
      setLots(uniqueLots);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Vcc Vehicle List
  const getVccVehicles = async (vin, lot) => {
    setVehicleLoading(true);
    try {
      let params = {
        page: 1,
        limit: 10,
        vin: vin,
        lot: lot,
      };
      const {
        data: {
          vehicles: { rows },
        },
      } = await VccServices.getVccVehicles(params);
      const detail = rows[0];
      setvehicleDetail(detail);
      if (detail?.vcc?.is_approved != null) {
        setIsDepositPaid(detail?.vcc?.deposit ? true : false);
        setVccId(detail?.vcc?.id);
        setBookingId(detail?.booking_id);
        setValue("vccDeclaration", detail?.vcc?.vcc_declaration);
        setValue("vccDate", moment(detail?.vcc?.vcc_date).format("MM-DD-YYYY"));
        setValue(
          "vccExpDate",
          moment(detail?.vcc?.vcc_expiry_date).format("MM-DD-YYYY")
        );
        setValue("serialNumber", detail?.vcc?.id);
        setValue("customer", detail?.booking?.customer?.name);
        setSelectedCustomer(detail?.id)
        setValue("make", detail?.booking?.veh_make?.name);
        setValue("model", detail?.booking?.veh_model?.name);
        setValue("color", detail?.booking?.color);
        setValue("lot", detail?.booking?.lot_number);
        setValue("vin", detail?.booking?.vin);
        setValue("vat", detail?.vcc?.custom_charges_aed ? "Paid" : "Unpaid");
        setValue("vatCharges", detail?.vcc?.vat_charges_aed);
        setValue("customCharges", detail?.vcc?.custom_charges_aed);
        setValue("vccDeposit", detail?.vcc?.deposit?.amount ?? "UnPaid");
        setValue("shippingCharges", "UnPaid");
        setIsDisabled(false);
        setVccDeposit(detail?.vcc?.deposit?.amount ? true : false);
      }
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setVehicleLoading(false);
    }
  };

  // *For Reset Data
  const resetData = () => {
    reset();
    setVccId();
    setBookingId();
    setIsDepositPaid();
    setIsDisabled(true);
  };

  // *For Send Approval
  const sendApproval = async () => {
    setLoading(true);
    try {
      let obj = {
        vcc_id: vccId,
        vcc_purpose: selectedVccPurpose?.id,
        deposit_paid: isDepositPaid,
      };
      const { message } = await VccServices.sendApproval(obj);
      SuccessToaster(message);
      navigate("/vcc-approval-list");
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  // *For Upload Document
  const handleUploadDocument = async (e) => {
    try {
      e.preventDefault();
      const file = e.target.files[0];
      let arr = [
        {
          id: uuidv4(),
          name: file?.name,
          file: "",
          type: file?.type.split("/")[1],
          size: getFileSize(file.size),
          isUpload: false,
        },
      ];
      if (allowFilesType.includes(file.type)) {
        setDocumentDetail(arr);
        handleUpload(file, arr);
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Dialog
  const handleDialog = (data) => {
    setRefundFormDialog(true);
  };

  const handleUpload = async (file, docs) => {
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("document", file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round(
            (uploadedBytes * 100) / progressEvent.total
          );

          setProgress(percentCompleted);
          setUploadedSize(getFileSize(uploadedBytes));
        },
      });
      if (data) {
        docs[0].isUpload = true;
        docs[0].file = data?.data?.nations;
        setDocumentDetail(docs);
        setDocumentLink(data?.data?.nations);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Remove Uploaded Document
  const removeDoc = () => {
    try {
      setDocumentDetail([]);
      setDocumentLink("");
      setValue2("scanned", "");
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Issue Vcc
  const issueVcc = async (formData) => {
    setIssueLoading(true);
    try {
      let obj = {
        vcc_id: vccId,
        booking_id: bookingId,
        vcc_purpose: selectedVccPurpose?.id,
        scanned_copy: documentLink,
        receiver_phone: formData?.contactNumber ?? "",
        vcc_received_by: formData?.receivedBy,
        comments: formData?.comment,
        deposit_paid: vccDeposit,
      };
      const { message } = await VccServices.issueVcc(obj);
      SuccessToaster(message);
      setIssueVccDialog(false);
      navigate("/vcc-issuer-list");
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setIssueLoading(false);
    }
  };

  // *For Refund Exit Paper
  const refundExitPaper = async (data) => {
    setLoading(true);
    try {
      let obj = {
        vehicle_id: vehicleDetail?.vehicle_id,
        vcc_id: vehicleDetail?.id,
        is_refunded: true,
        make_name: vehicleDetail?.booking?.veh_make?.name,
        model_name: vehicleDetail?.booking?.veh_model?.name,
        color: vehicleDetail?.booking?.color,
        vin: vehicleDetail?.booking?.vin,
        lot_number: vehicleDetail?.booking?.lot_number,
        customer_id: vehicleDetail?.booking?.customer?.id,
        customer_phone: vehicleDetail?.booking?.customer?.uae_phone,
        ...data,
      };
      const { message } = await VccServices.refundExitPaper(obj);
      SuccessToaster(message);

      setRefundFormDialog(false);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVinsLots();
  }, []);

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
      {/* ========== Refund Form Dialog ========== */}
      <RefundFormDialog
        open={refundFormDialog}
        onClose={() => setRefundFormDialog(false)}
        loading={loading}
        selectedVehicle={selectedCustomer}
        depositId={vehicleDetail?.vcc?.deposit?.id}
        depositAmount={vehicleDetail?.vcc?.deposit?.amount}
        customerId={vehicleDetail?.booking?.customer?.id}
        onSubmit={(data) => refundExitPaper(data)}
      />
      {/* ========== Issue Vcc ========== */}
      <SimpleDialog
        open={issueVccDialog}
        onClose={() => setIssueVccDialog(false)}
        title={"VCC Issued"}
      >
        <Box component="form" onSubmit={handleSubmit2(issueVcc)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InputField
                label={"Received By"}
                placeholder={"Received By"}
                error={errors2?.receivedBy?.message}
                register={register2("receivedBy", {
                  required: "Please enter received by.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InputPhone
                label={"Contact Number"}
                name={"contactNumber"}
                control={control2}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography
                variant="body1"
                sx={{ color: Colors.charcoalGrey, mb: 1 }}
              >
                Upload Scanned Copy
              </Typography>
              <UploadFile
                accept={allowFilesType}
                register={register2("scanned", {
                  onChange: (e) => handleUploadDocument(e),
                })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              {documentDetail.length > 0 && (
                <Typography
                  variant="body1"
                  sx={{ color: Colors.charcoalGrey, mb: 1 }}
                >
                  Uploaded Files
                </Typography>
              )}
              <Box sx={{ maxHeight: 300, overflow: "auto", pr: 1 }}>
                {documentDetail?.map((item, index) => (
                  <Uploading
                    key={index}
                    data={item}
                    uploadedSize={uploadedSize}
                    progress={progress}
                    removeDoc={() => removeDoc()}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={12}>
              <InputField
                label={"Comments"}
                placeholder={"Comments"}
                multiline={true}
                rows={4}
                register={register2("comment")}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton
                title="Submit"
                type="submit"
                loading={issueLoading}
              />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <Box component="form" onSubmit={handleSubmit(sendApproval)}>
        <Grid container spacing={2} alignItems={"center"}>
          <Grid item xs={12} sm={12}>
            <Typography
              variant="h5"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                mb: 4,
              }}
            >
              VCC Refund
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              disabled={selectedLot ? true : false}
              label={"VIN"}
              options={vins}
              selected={selectedVin}
              onSelect={(value) => {
                setSelectedVin(value);
                getVccVehicles(value?.id, "");
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <SelectField
              disabled={selectedVin ? true : false}
              label={"LOT"}
              options={lots}
              selected={selectedLot}
              onSelect={(value) => {
                setSelectedLot(value);
                getVccVehicles("", value?.id);
              }}
            />
          </Grid>
          {(selectedVin || selectedLot) && (
            <Fragment>
              {!vehicleLoading ? (
                <Fragment>
                  <Grid item xs={12} sm={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Vcc Serial Number"}
                      placeholder={"Vcc Serial Number"}
                      register={register("serialNumber")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Customer"}
                      placeholder={"Customer"}
                      register={register("customer")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Make"}
                      placeholder={"Make"}
                      register={register("make")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Model"}
                      placeholder={"Model"}
                      register={register("model")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"VIN"}
                      placeholder={"VIN"}
                      register={register("vin")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Lot"}
                      placeholder={"Lot"}
                      register={register("lot")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Color"}
                      placeholder={"Color"}
                      register={register("color")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Vcc Deposit"}
                      placeholder={"Vcc Deposit"}
                      register={register("vccDeposit")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Shipping Charges"}
                      placeholder={"Shipping Charges"}
                      register={register("shippingCharges")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"VAT Charges"}
                      placeholder={"VAT Charges"}
                      register={register("vatCharges")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"Custom Charges"}
                      placeholder={"Custom Charges"}
                      register={register("customCharges")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"VCC Declaration"}
                      placeholder={"VCC Declaration"}
                      register={register("vccDeclaration")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"VCC Date"}
                      placeholder={"VCC Date"}
                      register={register("vccDate")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <InputField
                      disabled={true}
                      label={"VCC Exp Date"}
                      placeholder={"VCC Exp Date"}
                      register={register("vccExpDate")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: Colors.charcoalGrey,
                        fontFamily: FontFamily.NunitoRegular,
                        mb: 2,
                      }}
                    >
                      Custom & VAT Charges
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                        path: {
                          fill: vehicleDetail?.vcc?.custom_vat_payment
                            ? Colors.bluishCyan
                            : "",
                        },
                      }}
                    >
                      {!vehicleDetail?.vcc?.custom_vat_payment  ? (
                        <PendingIcon />
                      ) : (
                        <CheckIcon />
                      )}
                      <Typography
                        variant="body1"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {vehicleDetail?.vcc?.custom_vat_payment
                          ? "Paid"
                          : "Unpaid"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: Colors.charcoalGrey,
                        fontFamily: FontFamily.NunitoRegular,
                        mb: 2,
                      }}
                    >
                      Received Exit Paper
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                        path: {
                          fill: vehicleDetail?.vcc?.exit_paper_received
                            ? Colors.bluishCyan
                            : "",
                        },
                      }}
                    >
                      {vehicleDetail?.vcc?.exit_paper_received ? (
                        <CheckIcon />
                      ) : (
                        <PendingIcon />
                      )}
                      <Typography
                        variant="body1"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {vehicleDetail?.vcc?.exit_paper_received
                          ? "Received"
                          : "Not Received"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: Colors.charcoalGrey,
                        fontFamily: FontFamily.NunitoRegular,
                        mb: 2,
                      }}
                    >
                     Received Makasa
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                        path: {
                          fill: vehicleDetail?.vcc?.makasa_received
                            ? Colors.bluishCyan
                            : "",
                        },
                      }}
                    >
                      {vehicleDetail?.vcc?.makasa_received ? (
                        <CheckIcon />
                      ) : (
                        <PendingIcon />
                      )}
                      <Typography
                        variant="body1"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {vehicleDetail?.vcc?.makasa_received
                          ? "Received"
                          : "Not Received"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
                    <Box component={"span"} sx={{ mx: 2 }} />
                    <PrimaryButton
                      disabled={
                        vehicleDetail?.vcc?.exit_paper_received ||  vehicleDetail?.vcc?.makasa_received || vehicleDetail?.vcc?.custom_vat_payment ? false : true
                      }
                      title="Refund"
                      onClick={() => handleDialog(vehicleDetail)}
                      loading={loading}
                    />
                  </Grid>
                </Fragment>
              ) : (
                <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "center" }}>
                  <CircularProgress />
                </Grid>
              )}
            </Fragment>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default RefundVcc;
