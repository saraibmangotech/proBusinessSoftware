import React, { useRef, Fragment, useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
  InputLabel,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SelectField from "components/Select";
import { ErrorToaster } from "components/Toaster";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { FontFamily, Images } from "assets";
import InputField from "components/Input";
import instance from "config/axios";
import { getFileSize, CleanTypes } from "utils";
import UploadFile from "components/UploadFile";
import Uploading from "components/Uploading";
import ThankyouDialog from "components/Dialog/ThankyouDialog";
import AuctionHouseServices from "services/AuctionHouse";
import routes from "services/System/routes";
import CustomerServices from "services/Customer";
import { useAuth } from "context/UseContext";
import SystemServices from "services/System";
import Storage from "utils/Storage";
import ImageLightBox from "components/ImageLightBox";
import FinanceServices from "services/Finance";
import BankServices from "services/Bank";
import InfoIcon from '@mui/icons-material/Info';



function RequestBuyerId() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const { state } = useLocation();
  const { setStorageItem } = Storage();
  const viewerRef = useRef();
  const pdfContent = Images?.guidelinePDF; // Replace with actual PDF content
  console.log(pdfContent);
  const pdfFileName = "example.pdf";
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();
  const [loading, setLoading] = useState(false);

  // *For Upload File types
  const allowFilesType = ["image/png", "image/jpg", "image/jpeg"];

  // *For Dialog Box
  const [thankyouDialog, setThankyouDialog] = useState(false);

  // *For Auction House
  const [auctionHouses, setAuctionHouses] = useState([]);
  const [selectedAuctionHouses, setSelectedAuctionHouses] = useState();

  // *For Payment Method
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentType, setPaymentType] = useState("aed");

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  // *For Deposit Slip
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [slipLink, setSlipLink] = useState("");

  // *For Accept Agreement
  const [isAccept, setIsAccept] = useState(false);

  // *For Request Id
  const [requestId, setRequestId] = useState();
  const [requestedAuctionHouses, setRequestedAuctionHouses] = useState([]);
  const [allocatedIdsCount, setAllocatedIdsCount] = useState(0);

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

  // *For Bank Account
  const [bankAccountId, setBankAccountId] = useState();

  // *For Get Banks
  const getBanks = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
      };
      const { data } = await BankServices.getBanks(params);
      const bankArray = [];
      data?.banks?.rows
        .filter((e) => e.currency == "aed")
        .forEach((e) => {
          let obj = {
            ...e,
            name: e?.name + " " + e?.currency.toUpperCase(),
          };
          bankArray.push(obj);

        });
      console.log(bankArray);
      setBankAccounts(bankArray);
      if (user?.user_type == "C") {

        setSelectedBankAccount(bankArray[0])
        setValue('bank', bankArray[0])
        setValue("bidDeposit", 10000)
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Payment Accounts
  const getPaymentAccounts = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
      };
      const { data } = await FinanceServices.getPaymentAccounts(params);
      // *Filter only vehicle account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(
        (e) => e.unit === "Vehicle" && e?.currency == 'aed'
      );
      // *1003 is the cashier role ID if the login user is a cashier then show only their account
      if (user?.role_id === 1003) {
        const userId = user?.ref_id.split("-")[1];
        const filterCashier = vehicleAcc.filter((e) => e.user_id == userId);
        setCashierAccounts(filterCashier);
        // *Select Default AED cashier account
        const cashierDetail = filterCashier.find(
          (e) => e.currency === paymentType
        );
        setValue("cash", cashierDetail?.name);
        setSelectedCashierAccount(cashierDetail);
      } else {
        setCashierAccounts(vehicleAcc);
        // *Select Default AED cashier account
        const cashierDetail = vehicleAcc.find(
          (e) => e.currency === paymentType
        );
        setValue("cash", cashierDetail?.name);
        setSelectedCashierAccount(cashierDetail);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

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
  const handleDownload = () => {
    // const blob = new Blob([pdfContent], { type: 'application/pdf' });
    // console.log(blob,'blobblobblob');
    // const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = ".." + pdfContent;
    console.log(a.href)
    a.target = "blank"
    a.download = "guideline.pdf";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    //URL.revokeObjectURL(url);
  };
  // *For Upload Document
  const handleUploadDocument = async (e) => {
    try {
      e.preventDefault();
      const file = e.target.files[0];
      let arr = [
        {
          name: file?.name,
          file: "",
          type: file?.type.split("/")[1],
          size: getFileSize(file.size),
          isUpload: false,
        },
      ];
      if (allowFilesType.includes(file.type)) {
        setSlipDetail(arr);
        handleUpload(file, arr);
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`);
      }
    } catch (error) {
      ErrorToaster(error);
    }
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
        setSlipDetail(docs);
        console.log(docs,'asdasdasd');
        setSlipLink(data?.data?.nations);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Remove Uploaded Document
  const removeDoc = () => {
    try {
      setSlipDetail([]);
      setSlipLink("");
      setValue("depositSlip", "");
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Request Buyer ID
  const requestBuyerId = async () => {
    console.log("sdaasdjaas");
    setLoading(true);
    try {
      const auctionHouseIds = [];
      selectedAuctionHouses.forEach((e) => {
        auctionHouseIds.push(e?.id);
      });
      let obj = {
        auction_houses: auctionHouseIds,
      };
      if (id) {
        obj.customer_id = id;
      }
      let result;
      if (requestId) {
        obj.request_id = requestId;
        obj.allocated_ids = allocatedIdsCount; // *Send only allocated ids count
        result = await CustomerServices.requestBuyerIdAgain(obj);
      } else {
        obj.deposit_slip = slipLink;
        obj.deposit_medium = paymentMethod;
        if (paymentMethod === "cash") {
          obj.account_id = selectedCashierAccount?.id;
          obj.deposit_amount = getValues("bidDeposit");
        } else {
          obj.account_id = bankAccountId;
          obj.deposit_amount = getValues("bidDeposit");
        }
        console.log(obj);
        result = await CustomerServices.requestBuyerId(obj);
      }
      setStorageItem("journey", result?.data);
      setThankyouDialog(true);
      setTimeout(() => {
        closeDialog();
      }, 2000);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  // *For Close Thank You Dialog
  const closeDialog = () => {
    setThankyouDialog(false);
    if (id) {
      navigate("/customer-queue");
    } else {
      navigate("/dashboard");
    }
  };

  // *For Get Customer Detail
  const getBuyerIdDetail = async () => {
    try {
      let params = { customerID: state?.customerId };
      const { data } = await CustomerServices.getBuyerIdDetail(params);
      if (data?.details?.request) {
        const ids = [];
        let count = 0;
        setRequestId(data?.details?.request?.id);
        data?.details?.request?.details.forEach((e) => {
          // *save requested auction houses
          ids.push(e?.auction?.id);

          // *check buyer id is allocated or not
          if (e?.allocated_buyer_id) {
            count += 1;
          }
        });
        setAllocatedIdsCount(count);
        setRequestedAuctionHouses(ids);
      }
    } catch (error) {
      // ErrorToaster(error)
    }
  };

  useEffect(() => {
    if (paymentType) {
      const cashierDetail = cashierAccounts.find(
        (e) => e.currency === paymentType
      );
      setValue("cash", cashierDetail?.name);
      setSelectedCashierAccount(cashierDetail);
    }
  }, [paymentType]);

  useEffect(() => {
    getAuctionHouses();
    getBuyerIdDetail();
    getPaymentAccounts();

    getBanks();
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
      {/* ========== Thank You Dialog  ========== */}
      <ThankyouDialog
        open={thankyouDialog}
        onClose={() => closeDialog()}
        message1={"Thank you"}
        message2={"Request for Buyer ID is in progress"}
      />

      <Box component="form" onSubmit={handleSubmit(requestBuyerId)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <Typography
              variant="h5"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
                mb: 4,
              }}
            >
              Request Buyer ID
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              multiple={true}
              onSearch={(v) => getAuctionHouses(v)}
              label={"Auctions Houses"}
              options={auctionHouses} // *For remove requested auction house in list
              selected={selectedAuctionHouses}
              onSelect={(value) => {
                setSelectedAuctionHouses(value);
              }}
              error={errors?.auctionHouses?.message}
              register={register("auctionHouses")}
            />
          </Grid>
          {!requestId && (
            <Fragment>
              <Grid item xs={12} sm={12}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: Colors.charcoalGrey,
                    fontFamily: FontFamily.NunitoRegular,
                  }}
                >
                  Payment Method
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl>
                  <RadioGroup
                    row
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {user?.user_type !== "C" && (
                      <FormControlLabel
                        value="cash"
                        control={<Radio />}
                        label="Cash"
                      />
                    )}
                    <FormControlLabel
                      value="bank"
                      control={<Radio />}
                      label="Bank"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {paymentMethod === "bank" && (
                <Fragment>
                  <Grid item xs={12} sm={4}>
                    <SelectField
                      disabled={user?.user_type == "C" ? true : false}
                      label={"Bank Account"}
                      options={bankAccounts}
                      selected={selectedBankAccount}
                      onSelect={(value) => {
                        setSelectedBankAccount(value);

                        setBankAccountId(value?.guc_account_id);
                      }}
                      register={register("bank", {
                        required:
                          paymentMethod === "bank"
                            ? "Please enter your bank."
                            : false,
                      })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <InputField
                      disabled={true}
                      label={"Account Title"}
                      placeholder={"Account Title"}
                      value={selectedBankAccount?.account_title}
                      error={errors?.accountTitle?.message}
                      register={register("accountTitle")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputField
                      disabled={true}
                      label={"IBN"}
                      placeholder={"IBN"}
                      value={selectedBankAccount?.account_ibn}
                      error={errors?.ibn?.message}
                      register={register("ibn")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputField
                      disabled={user?.user_type == "C" ? true : false}

                      label={"Bidding Activation Deposit (AED)"}
                      placeholder={"Bidding Activation Deposit (AED)"}
                      error={errors?.bidDeposit?.message}
                      register={register("bidDeposit", {
                        required: "Please enter your activation deposit."

                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}></Grid>
                  <Grid item xs={12} sm={5}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ color: Colors.charcoalGrey, mb: 1 }}
                      >
                        Deposit Slip (Only Jpeg,png & pdf Allow)

                      </Typography>
                      {/* <InfoIcon sx={{ color: Colors.primary, cursor: 'pointer' }} onClick={handleDownload} /> */}
                    </Box>
                    <UploadFile
                      accept={"image/png, image/jpg, image/jpeg"}
                      error={errors?.depositSlip?.message}
                      register={register("depositSlip", {
                        required:
                          paymentMethod === "bank"
                            ? "Please upload you deposit slip."
                            : false,
                        onChange: (e) => handleUploadDocument(e),
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {slipDetail.length > 0 && (
                      <Typography
                        variant="body1"
                        sx={{ color: Colors.charcoalGrey, mb: 1 }}
                      >
                        Uploaded Files
                      </Typography>
                    )}
                    <Box sx={{ maxHeight: 300, overflow: "auto", pr: 1 }}>
                      {slipDetail?.map((item, index) => (
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
                  {slipLink && (
                    <Grid item xs={12} sm={12}>
                      <ImageLightBox viewerRef={viewerRef} />
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                      >
                        <Box sx={{ position: "relative" }}>
                          <Box
                            ref={viewerRef}
                            onClick={() =>
                              viewerRef.current && viewerRef.current.click()
                            }
                            component={"img"}
                            src={
                              process.env.REACT_APP_IMAGE_BASE_URL + slipLink
                            }
                            sx={{ height: 180, width: "auto" }}
                          />
                          <IconButton
                            sx={{
                              position: "absolute",
                              top: "0",
                              right: "0",
                              width: 20,
                              height: 20,
                              ml: 0.5,
                            }}
                            onClick={() => removeDoc()}
                          >
                            <Delete
                              sx={{ color: Colors.danger, fontSize: 20 }}
                            />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Fragment>
              )}
              {paymentMethod === "cash" && (
                <Fragment>
                  <Grid item xs={12} sm={4}>
                    <InputLabel>Cash in Hand</InputLabel>
                    <FormControl>
                      <RadioGroup
                        row
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                      >
                        <FormControlLabel
                          value="aed"
                          control={<Radio />}
                          label="AED"
                        />

                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SelectField
                      disabled={user?.role_id === 1003 ? true : false}
                      label={"Cashier Account"}
                      options={cashierAccounts}
                      selected={selectedCashierAccount}
                      onSelect={(value) => setSelectedCashierAccount(value)}
                      error={errors?.cash?.message}
                      register={register("cash", {
                        required:
                          paymentMethod === "cash"
                            ? "Please select cash account."
                            : false,
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <InputField
                      disabled={paymentMethod === "bank" ? true : false}
                      type={"number"}
                      label={"Bidding Activation Deposit (AED)"}
                      placeholder={"Bidding Activation Deposit (AED)"}
                      error={errors?.bidDeposit?.message}
                      register={register("bidDeposit", {
                        required: "Please enter your activation deposit."

                      })}
                    />
                  </Grid>
                </Fragment>
              )}
            </Fragment>
          )}
          <Grid item xs={12} sm={12}>
            <Checkbox
              checked={isAccept}
              onChange={() => setIsAccept(!isAccept)}
            />
            <Typography
              component={"span"}
              variant="body2"
              sx={{
                color: Colors.black,
                fontFamily: FontFamily.NunitoRegular,
                mb: 1,
              }}
            >
              T&C * Bidding activation deposit will be used for booking vehicles
            </Typography>
          </Grid>
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
            <PrimaryButton
              title="Back"
              style={{ backgroundColor: Colors.greyShade, marginRight: "8px" }}
              onClick={() => navigate(-1)}
            />
            <PrimaryButton
              title="Submit"
              type="submit"
              loading={loading}
              disabled={!isAccept}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default RequestBuyerId;
