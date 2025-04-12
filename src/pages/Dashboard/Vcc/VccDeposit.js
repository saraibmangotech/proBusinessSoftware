import React, { Fragment, useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { Search } from "@mui/icons-material";
import { PrimaryButton } from "components/Buttons";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import moment from "moment";
import VccServices from "services/Vcc";
import SelectField from "components/Select";
import FinanceServices from "services/Finance";
import BankServices from "services/Bank";
import { useAuth } from "context/UseContext";

function VccDeposit() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // *For Vcc Id
  const [vccId, setVccId] = useState();
  const [vccDetail, setVccDetail] = useState();

  // *For Vins & Lots
  const [vins, setVins] = useState([]);
  const [selectedVin, setSelectedVin] = useState(null);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  // *For Payment Method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentType, setPaymentType] = useState("aed");

  const [vccStatus, setVccStatus] = useState(false);

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

  // *For Vault Account
  const [vaultAccounts, setVaultAccounts] = useState([]);
  const [selectedVaultAccount, setSelectedVaultAccount] = useState(null);
  const [vaultBalance, setVaultBalance] = useState();

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
  const getVccVehicles = async () => {
    setVehicleLoading(true);
    try {
      let params = {
        page: 1,
        limit: 10,
        vin: selectedVin?.id,
        lot: selectedLot?.id,
      };
      const {
        data: {
          vehicles: { rows },
        },
      } = await VccServices.getVccVehicles(params);
      const detail = rows[0];
      setVccDetail(detail);
      setVccStatus(detail?.vcc_issued ? true : false);
      getVaultCustomers(detail?.booking?.customer?.id);
      if (detail?.vcc?.deposit === null || detail?.vcc_refunded) {
        setVccId(detail?.vcc?.id);
        setValue("customerName", detail?.booking?.customer?.name);
        setValue("vccDeclaration", detail?.vcc?.vcc_declaration);
        setValue("vccDate", moment(detail?.vcc?.vcc_date).format("MM-DD-YYYY"));
        setValue(
          "vccExpDate",
          moment(detail?.vcc?.vcc_expiry_date).format("MM-DD-YYYY")
        );
        setValue("serialNumber", detail?.vcc?.id);
        setValue("make", detail?.booking?.veh_make?.name);
        setValue("model", detail?.booking?.veh_model?.name);
        setValue("color", detail?.booking?.color);
        setValue("lot", detail?.booking?.lot_number);
        setValue("vin", detail?.booking?.vin);
        setValue("container", detail?.container_no);
      } else {
        ErrorToaster("Deposit already paid for this vehicle.");
      }
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setVehicleLoading(false);
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
      // *Filter only shipping account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(
        (e) => e.unit === "Shipping"
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

  // *For Get Banks
  const getBanks = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
      };
      const { data } = await BankServices.getBanks(params);
      setBankAccounts(data?.banks?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Vault Customers
  const getVaultCustomers = async (id) => {
    try {
      let params = {
        page: 1,
        limit: 1000,
        customer_id: id,
      };
      const { data } = await FinanceServices.getVaultCustomers(params);
      const filterData = data?.customers?.rows[0]?.accounts.filter(
        (e) => e.unit === "Shipping"
      );
      setVaultAccounts(filterData);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Select Vault Detail
  const handleSelectVault = (data) => {
    setSelectedVaultAccount(data);
    const debit = data?.total_dr ? data?.total_dr : 0;
    const credit = data?.total_cr ? data?.total_cr : 0;
    const balance =
      data?.nature === "credit"
        ? parseFloat(credit) - parseFloat(debit)
        : parseFloat(debit) - parseFloat(credit);
    setValue("vaultBalance", balance);
    setVaultBalance(balance);
  };

  // *For Deposit Vcc
  const depositVcc = async (formData) => {

    setLoading(true);
    try {
      let obj = {
        vcc_id: vccId,
        amount: formData?.depositAmount,
        payment_medium: selectedPaymentMethod?.id,
        vcc_issued: vccStatus,
        make_name: vccDetail?.booking?.veh_make?.name,
        model_name: vccDetail?.booking?.veh_model?.name,
        color: vccDetail?.booking?.color,
        vin: vccDetail?.booking?.vin,
        lot_number: vccDetail?.booking?.lot_number,
        customer_id: vccDetail?.booking?.customer?.id,
        customer_phone: vccDetail?.booking?.customer?.uae_phone,
        vin: vccDetail?.booking?.vin

      };
      if (selectedPaymentMethod?.id === "bank") {
        obj.bank_id = selectedBankAccount?.id;
        obj.bank_name = selectedBankAccount?.name;
        obj.payment_id = selectedBankAccount?.guc_account_id;
      }
      if (selectedPaymentMethod?.id === "cash") {
        obj.payment_id = selectedCashierAccount?.id;
      }
      if (selectedPaymentMethod?.id === "vault") {
        if (vaultBalance < formData?.depositAmount) {
          ErrorToaster("Low Balance (please top up your wallet account)");
          return;
        }
        obj.payment_id = selectedVaultAccount?.id;
      }

      const { message } = await VccServices.depositVcc(obj);
      SuccessToaster(message);
      navigate("/vcc-approval-list");
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
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
    getVinsLots();
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
      <Box component="form" onSubmit={handleSubmit(depositVcc)}>
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
              Rcv VCC Deposit
            </Typography>
          </Grid>
          <Grid item xs={12} sm={5}>
            <SelectField
              disabled={selectedLot ? true : false}
              label={"VIN"}
              options={vins}
              selected={selectedVin}
              onSelect={(value) => setSelectedVin(value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <SelectField
              disabled={selectedVin ? true : false}
              label={"LOT"}
              options={lots}
              selected={selectedLot}
              onSelect={(value) => setSelectedLot(value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <PrimaryButton
              disabled={selectedVin || selectedLot ? false : true}
              title="Search"
              type="button"
              loading={vehicleLoading}
              buttonStyle={{
                justifyContent: "space-evenly",
                path: { fill: Colors.white },
              }}
              startIcon={<Search />}
              onClick={() => getVccVehicles()}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"Customer Name"}
              placeholder={"Customer Name"}
              register={register("customerName")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"VIN"}
              placeholder={"VIN"}
              register={register("vin")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"LOT"}
              placeholder={"LOT"}
              register={register("lot")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"Make"}
              placeholder={"Make"}
              register={register("make")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"Model"}
              placeholder={"Model"}
              register={register("model")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"Color"}
              placeholder={"Color"}
              register={register("color")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"Container"}
              placeholder={"Container"}
              register={register("container")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"VCC Serial Number"}
              placeholder={"VCC Serial Number"}
              register={register("serialNumber")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"VCC Declaration"}
              placeholder={"VCC Declaration"}
              register={register("vccDeclaration")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"VCC Date"}
              placeholder={"VCC Date"}
              register={register("vccDate")}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              disabled={true}
              label={"VCC Exp Date"}
              placeholder={"VCC Exp Date"}
              register={register("vccExpDate")}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <InputField
              type={"number"}
              label={"VCC Deposit Amount (AED)"}
              placeholder={"VCC Deposit Amount"}
              InputProps={{ inputProps: { min: 0 } }}
              error={errors?.depositAmount?.message}
              register={register("depositAmount", {
                required: "Please enter deposit amount.",
              })}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SelectField
              label={"Deposit Method"}
              options={[
                {
                  id: "cash",
                  name: "Cash",
                },
                {
                  id: "bank",
                  name: "Bank",
                },
                {
                  id: "vault",
                  name: "Shipping Wallet",
                },
              ]}
              selected={selectedPaymentMethod}
              onSelect={(value) => setSelectedPaymentMethod(value)}
              error={errors?.paymentMethod?.message}
              register={register("paymentMethod", {
                required: "Please select deposit method.",
              })}
            />
          </Grid>
          {selectedPaymentMethod?.id === "cash" && (
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
                    <FormControlLabel
                      value="usd"
                      control={<Radio />}
                      label="USD"
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
                      selectedPaymentMethod?.id === "cash"
                        ? "Please select cash account."
                        : false,
                  })}
                />
              </Grid>
            </Fragment>
          )}
          {selectedPaymentMethod?.id === "bank" && (
            <Grid item xs={12} sm={4}>
              <SelectField
                label={"Bank Account"}
                options={bankAccounts}
                selected={selectedBankAccount}
                onSelect={(value) => setSelectedBankAccount(value)}
                error={errors?.bank?.message}
                register={register("bank", {
                  required:
                    selectedPaymentMethod?.id === "bank"
                      ? "Please select bank account."
                      : false,
                })}
              />
            </Grid>
          )}
          {selectedPaymentMethod?.id === "vault" && (
            <Fragment>
              <Grid item xs={12} sm={4}>
                <SelectField
                  label={"Wallet Account"}
                  options={vaultAccounts}
                  selected={selectedVaultAccount}
                  onSelect={(value) => handleSelectVault(value)}
                  error={errors?.vault?.message}
                  register={register("vault", {
                    required:
                      selectedPaymentMethod?.id === "vault"
                        ? "Please select wallet account."
                        : false,
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <InputField
                  disabled={true}
                  label={"Wallet Balance"}
                  placeholder={"Wallet Balance"}
                  register={register("vaultBalance")}
                />
              </Grid>
            </Fragment>
          )}
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
            <PrimaryButton
              disabled={selectedVin || selectedLot ? false : true}
              title="Submit"
              type="submit"
              loading={loading}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default VccDeposit;
