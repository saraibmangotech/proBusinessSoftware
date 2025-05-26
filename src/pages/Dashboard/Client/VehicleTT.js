import React, { Fragment, useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
  CircularProgress,
  InputLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  InputAdornment,
} from "@mui/material";
import SelectField from "components/Select";
import InputField from "components/Input";
import { PrimaryButton } from "components/Buttons";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import Colors from "assets/Style/Colors";
import { FontFamily } from "assets";
import { ErrorToaster } from "components/Toaster";
import { useForm } from "react-hook-form";
import AuctionHouseServices from "services/AuctionHouse";
import ClientServices from "services/Client";
import CurrencyServices from "services/Currency";
import { SuccessToaster } from "components/Toaster";
import { useAuth } from "context/UseContext";
import FinanceServices from "services/Finance";
import VehicleTTApproval from "components/Dialog/VehicleTTApproval";
import BankServices from "services/Bank";
import { useNavigate } from "react-router-dom";
import { logDOM } from "@testing-library/react";
import { useSelector } from "react-redux";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    padding: "15px",
    textAlign: "center",
    whiteSpace: "nowrap",
    background: Colors.primary,
    color: Colors.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: "center",
    textWrap: "nowrap",
    padding: '5px !important',

    ".MuiBox-root": {
      display: "flex",
      gap: "6px",
      alignItems: "center",
      justifyContent: "center",
      ".MuiBox-root": {
        cursor: "pointer",
      },
    },
    svg: {
      width: "auto",
      height: "24px",
    },
    ".MuiTypography-root": {
      textTransform: "capitalize",
      fontFamily: FontFamily.NunitoRegular,
      textWrap: "nowrap",
    },
    ".MuiButtonBase-root": {
      padding: "8px",
      width: "28px",
      height: "28px",
    },
  },
}));

const useStyles = makeStyles({
  loaderWrap: {
    display: "flex",
    height: 100,
    "& svg": {
      width: "40px !important",
      height: "40px !important",
    },
  },
});

function VehicleTT() {
  const classes = useStyles();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { cadExchangeRate } = useSelector((state) => state.navigationReducer);
  const { usdExchangeRate } = useSelector((state) => state.navigationReducer);

  const tableHead = [
    "Sr.",
    "Buyer ID",
    "Model",
    "Make",
    "Lot#.",
    "Vin#.",
    "Currency",
    "FCY Amount",
    "LCY Amount",
    "Action",
  ];

  const {
    register,
    handleSubmit,
    getValues,
    setValue: setValue2,
    formState: { errors },
  } = useForm();
  const {
    register: register2,
    setValue,

    handleSubmit: handleSubmit2,
    reset,
  } = useForm();

  const {
    register: register3,
    setValue: setValue3,
    getValues: getValue3,

    handleSubmit: handleSubmit3,
    formState: { errors: errors3 },
  } = useForm();

  // *For Vin and Lot
  const [vin, setVin] = useState([]);
  const [selectedVin, setSelectedVin] = useState(null);
  const [lot, setLot] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  //*FCY Total
  const [fcyTotal, setFcyTotal] = useState();

  // *Account Options
  const [accountOptions, setAccountOptions] = useState();
  const [selectedAccount, setSelectedAccount] = useState();

  // *For Currencies
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

  // *For Auction House
  const [auctionHouses, setAuctionHouses] = useState([]);
  const [selectedAuctionHouses, setSelectedAuctionHouses] = useState(null);

  // *For buyer id
  const [buyerIds, setBuyerIds] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const [ttData, setTtData] = useState(null);

  const [lcyAmounts, setLcyAmounts] = useState([]);
  const [fcyAmounts, setFcyAmounts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalFcyAmount, setTotalFcyAmount] = useState(0);

  const [selectedVia, setSelectedVia] = useState(null)

  const [items, setItems] = useState([]);

  const [lcyList, setLcyList] = useState();

  // *For Bank Account
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);

  const [selectedCurr, setSelectedCurr] = useState(null);
  const [tempCurr, setTempCurr] = useState(null);

  const [accountBalance, setAccountBalance] = useState(0);

  // *Grand Total

  const [subTotal, setSubTotal] = useState();

  const [paymentType, setPaymentType] = useState("aed");

  const [exchangeLoss, setExchangeLoss] = useState();

  //* ForLoader
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Cashier Account
  const [cashierAccounts, setCashierAccounts] = useState([]);
  const [selectedCashierAccount, setSelectedCashierAccount] = useState(null);

  // *for payment Medium
  const [paymentMedium, setPaymentMedium] = useState();

  const [isDialogOpen, setDialogOpen] = useState(false);

  // for modal data
  const [modalData, setModalData] = useState();

  const handleOpenDialog = (item) => {
    // setTableId(item)
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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

  const addItem = (item) => {
    console.log([item, ...items]);
    if(item){

      setItems([item, ...items]);
  
      // *Check For Same Buyer Id
      const allObjectsHaveSameBuyerId = [item, ...items].every(
        (obj, index, array) => {
          if (obj.hasOwnProperty("buyer_id")) {
            const hasDifferentBuyerId = array.some((otherObj, otherIndex) => {
              return (
                index !== otherIndex &&
                otherObj.hasOwnProperty("buyer_id") &&
                otherObj.buyer_id !== obj.buyer_id
              );
            });
  
            return !hasDifferentBuyerId;
          }
  
          return false;
        }
      );
  
      if (allObjectsHaveSameBuyerId) {
        let array = [item, ...items];
  
        setAccountOptions([
          { id: 1, name: "Cash" },
          { id: 2, name: "Bank" },
          { id: array[0].buyer?.account_id, name: "Buyer ID" },
        ]);
      } else {
        setAccountOptions([
          { id: 1, name: "Cash" },
          { id: 2, name: "Bank" },
        ]);
      }
      const uniqueAllArray = [item, ...items];
      const uniqueArrayfilter = [];
      uniqueAllArray.forEach((item) => {
        // Check if an object with the same id already exists in uniqueArray
        const existingItem = uniqueArrayfilter.find(
          (uItem) => uItem.id === item.id
        );
  
        // If not found, push the item to uniqueArray
        if (!existingItem) {
          uniqueArrayfilter.push(item);
        }
      });
      const uniqueArray = uniqueArrayfilter.sort((a, b) => {
        // Check if a.vin is undefined, and if so, place it at the end
        if (!a?.vin) {
          return 1;
        }
  
        // Check if b.vin is undefined, and if so, place it at the end
        if (!b?.vin) {
          return -1;
        }
  
        // Compare the vin values for sorting
        return a.vin.localeCompare(b.vin);
      });
  
      let lcys = [...lcyAmounts];
      let fcys = [...fcyAmounts];
  
      let loss = 0;
  
      for (let i = 0; i < uniqueArray.length; i++) {
        const element = uniqueArray[i];
  
        uniqueArray[i].fcyAmounts = element?.vin
          ? parseFloat(element.value) + parseFloat(element.other_charges) ?? 0
          : 0;
        uniqueArray[i].lcyAmounts =
          element?.vin && !isNaN(element?.lcyAmounts)
            ? (parseFloat(element.value) + parseFloat(element.other_charges)) *
            currencyExchangeRate ?? 0
            : 0;
  
        lcys[i] =
          (parseFloat(element.value) + parseFloat(element.other_charges)) *
          currencyExchangeRate ?? 0;
        fcys[i] =
          parseFloat(element.value) + parseFloat(element.other_charges) ?? 0;
      }
      const totalFcAmount = uniqueArray.reduce((acc, curr) => {
        let fcTotal = curr.fcyAmounts
          ? parseFloat(curr.fcyAmounts)
          : 0 + curr.other_charges
            ? parseFloat(curr.other_charges)
            : 0;
        return acc + fcTotal;
      }, 0);
  
      const totalLcAmount = uniqueArray.reduce((acc, curr) => {
        let fcTotal = curr.lcyAmounts
          ? parseFloat(curr.lcyAmounts) * currencyExchangeRate
          : 0;
  
        return acc + fcTotal;
      }, 0);
  
      const totalAed = totalFcAmount * currencyExchangeRate;
      if (selectedCurr == "usd") {
        const totalExchangeLoss = totalAed - totalFcAmount * usdExchangeRate;
        setExchangeLoss(totalExchangeLoss);
  
        setTotalAmount(totalLcAmount);
        setTotalFcyAmount(totalFcAmount);
        setLcyAmounts(lcys);
        setFcyAmounts(fcys);
  
        setLcyList(lcys);
        FirstTimeGetTotal(totalFcAmount * currencyExchangeRate);
  
        if (uniqueArray.length > 0) {
  
  
          const filteredArray = uniqueArray.filter((item) =>
            item.auction ? item.auction.id === selectedAuctionHouses?.id : item.id
          );
  
          setTtData(filteredArray);
  
          setItems(filteredArray);
        }
        return [item, ...items];
      } else {
        const totalExchangeLoss = totalAed - totalFcAmount * cadExchangeRate;
        setExchangeLoss(totalExchangeLoss);
  
        setTotalAmount(totalLcAmount);
        setTotalFcyAmount(totalFcAmount);
        setLcyAmounts(lcys);
        setFcyAmounts(fcys);
  
        setLcyList(lcys);
        FirstTimeGetTotal(totalFcAmount * currencyExchangeRate);
  
        if (uniqueArray.length > 0) {
  
  
          const filteredArray = uniqueArray.filter((item) =>
            item.auction ? item.auction.id === selectedAuctionHouses?.id : item.id
          );
  
          setTtData(filteredArray);
  
          setItems(filteredArray);
        }
        return [item, ...items];
      }
    }
  };

  // *For Get Payment Accounts
  const getPaymentAccounts = async () => {
    try {
      let params = {
        page: 1,
        limit: 999999,
      };
      const { data } = await FinanceServices.getPaymentAccounts(params);
      // *Filter only vehicle account
      const vehicleAcc = data?.cashierAccounts?.rows?.filter(
        (e) => e.unit === "Vehicle"
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
        handleBalance(cashierDetail);
      } else {
        setCashierAccounts(vehicleAcc);
        // *Select Default AED cashier account
        const cashierDetail = vehicleAcc.find(
          (e) => e.currency === paymentType
        );
        setValue("cash", cashierDetail?.name);
        setSelectedCashierAccount(cashierDetail);
        handleBalance(cashierDetail);
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
        limit: 999999,
      };
      const { data } = await BankServices.getBanks(params);
      setBankAccounts(data?.banks?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const GetTotal = async () => {
    const total =
      parseFloat(getValues("vat")) +
      parseFloat(getValues("TTCharges")) +
      parseFloat(totalFcyAmount * currencyExchangeRate);
    setSubTotal(total);
  };
  const FirstTimeGetTotal = async (val) => {
    const total = 0 + 0 + val;
    setSubTotal(total);
  };

  // *For Get Currencies
  const getCurrencies = async (currency) => {
    try {
      let params = {
        detailed: true,
      };
      const { data } = await CurrencyServices.getCurrencies(params);

      if (selectedCurr == "usd") {
        setCurrencyExchangeRate(data.currencies[2].conversion_rate);
      } else {
        setCurrencyExchangeRate(data.currencies[1].conversion_rate);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Vin
  const getVin = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        search: search,
      };
      const { data } = await ClientServices.getTTVin(params);

      let arrayOfObjects = data?.details?.vins.map((item) => {
        return { id: item.vin, name: item.vin, ...item };
      });

      let arrayOfObjects1 = data?.details?.lots.map((item) => {
        return { id: item.lot, name: item.lot, ...item };
      });


      setVin(arrayOfObjects);
      setLot(arrayOfObjects1);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let currency = null;

      if (!selectedCurr) {
        setSelectedCurr(tempCurr);
        currency = tempCurr;

      }

      let data = {
        search: getValues("vin") ? getValues("vin") : getValues("lot"),
      };
      if (getValues("vin") == "" && getValues("lot") == " ") {
      } else {
        getVehicleTT(1, "", data, currency);
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For TTs
  const getVehicleTT = async (page, search, filter, currency = null) => {
    const Filter = { ...filter };

    try {
      let params = {
        page: 1,
        limit: 15,
      };
      params = { ...params, ...Filter };
      const { data } = await ClientServices.getVehicleTT(params);

      if (data?.details?.invoice?.balance == 0) {
        if (selectedCurr) {
          currency = selectedCurr;
        }


        if (currency == data?.details?.currency) {
          addItem(data?.details);
        } else {
          ErrorToaster("Cant Add Different Currency Vehicles");
        }
      }

      if (data?.details?.invoice?.balance > 0 && !data?.details?.approval) {
        setModalData(data?.details);
        handleOpenDialog();
      }
      if (
        data?.details?.invoice?.balance > 0 &&
        data?.details?.approval?.is_approved
      ) {
        if (selectedCurr) {
          currency = selectedCurr;
        }

        if (currency == data?.details?.currency) {
          addItem(data?.details);
        }
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *Main Total
  const mainTotal = (e, index) => {
    const newValue = parseFloat(e) || 0;
    const updatedLcyAmounts = [...lcyAmounts];

    const copyData = [...ttData];
    copyData[index].fcyAmounts = newValue;
    copyData[index].lcyAmounts = (newValue * currencyExchangeRate).toFixed(2);
    copyData[index].lcy_amounts = (newValue * currencyExchangeRate).toFixed(2);
    setTtData(copyData);
    updatedLcyAmounts[index] = (newValue * currencyExchangeRate).toFixed(2);
    setLcyAmounts(updatedLcyAmounts);

    setLcyList(updatedLcyAmounts);

    const newTotalAmount = updatedLcyAmounts.reduce(
      (acc, val) => acc + parseFloat(val || 0),
      0
    );

    setTotalAmount(newTotalAmount);
    setTotalFcyAmount(newTotalAmount / currencyExchangeRate);
    setFcyTotal(e);
    const totalAed = totalFcyAmount * currencyExchangeRate;
    if (selectedCurr == "usd") {
      const totalExchangeLoss = totalAed - totalFcyAmount * usdExchangeRate;
      setExchangeLoss(totalExchangeLoss);
    } else {
      const totalExchangeLoss = totalAed - totalFcyAmount * cadExchangeRate;
      setExchangeLoss(totalExchangeLoss);
    }
    const total =
      parseFloat(getValues("vat")) +
      parseFloat(getValues("TTCharges")) +
      parseFloat(newTotalAmount);
    setSubTotal(total);
  };

  const AddBuyer = (value, currency) => {
    let curry = null;

    if (!selectedCurr) {
      setSelectedCurr("usd");
      curry = "usd";
    } else {
      curry = selectedCurr;
    }
    if (curry == "usd") {
      const findBuyerById = (id) => {
        const buyer = buyerIds.find((buyer) => buyer.id === id);
        return buyer || null; // Return null if the buyer is not found
      };

      findBuyerById(value?.id);

      addItem(findBuyerById(value?.id));

    } else {
      ErrorToaster("Can Not Add Buyer Id For CAD Vehicles");
    }
  };

  function handleDelete(item) {
    const filterData = ttData.filter((v) => v.id != item?.id);

    if (filterData?.length == 0) {
      setSelectedCurr(null);
      setSelectedVin(null);
      setSelectedLot(null);
    }
    const totalFcAmount = filterData.reduce((acc, curr) => {
      let fcTotal = curr.fcyAmounts
        ? parseFloat(curr.fcyAmounts)
        : 0 + curr.other_charges
          ? parseFloat(curr.other_charges)
          : 0;
      return acc + fcTotal;
    }, 0);
    setTotalFcyAmount(totalFcAmount);

    const total =
      parseFloat(getValues("vat")) +
      parseFloat(getValues("TTCharges")) +
      parseFloat(totalFcAmount * currencyExchangeRate);
    setSubTotal(total);

    setTtData(filterData);

    setItems(filterData);
  }

  // *For Get Buyer ID
  const OnTTRateChange = (value) => {
    const updatedTtData = ttData.map((val) => {
      // Create a deep copy of each object in ttData
      const updatedVal = { ...val, lcy_amount: val.fcyAmounts * value };
      return updatedVal;
    });

    setItems((prev) =>
      prev.map((val) => {
        // Create a deep copy of each object in ttData
        const updatedVal = { ...val, lcyAmounts: val.fcyAmounts * value };
        return updatedVal;
      })
    );
    // Assuming setTtData is the correct function for updating ttData state
    // settsss(updatedTtData);

    // Assuming setCurrencyExchangeRate is the correct function for updating currencyExchangeRate state

    const total =
      parseFloat(getValues("vat")) +
      parseFloat(getValues("TTCharges")) +
      parseFloat(totalFcyAmount * value);
    setSubTotal(total);

    const totalAed = totalFcyAmount * value;

    if (selectedCurr == "usd") {
      const totalExchangeLoss = totalAed - totalFcyAmount * usdExchangeRate;
      setExchangeLoss(totalExchangeLoss);
    } else {
      const totalExchangeLoss = totalAed - totalFcyAmount * cadExchangeRate;
      setExchangeLoss(totalExchangeLoss);
    }
  };

  // *For Get Buyer ID
  const getBuyerId = async (search) => {
    try {
      let params = {
        page: 1,
        limit: 50,
        auctions: search,
      };
      const { data } = await ClientServices.getBuyerId(params);

      setBuyerIds(data?.buyer_ids?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleBalance = async (value) => {

    try {

      if (value.name == "Cash") {
        const cashierDetail = cashierAccounts.find(
          (e) => e.currency === paymentType
        );
        setValue("cash", cashierDetail?.name);
        setSelectedCashierAccount(cashierDetail);
        value.id = cashierDetail.id;

      }





      let params = {
        page: 1,
        limit: 50,
        id: value?.gwc_account_id ? value?.guc_account?.id : value.id,
      };
      const { data } = await FinanceServices.AccountBlance(params);

      if (!value?.gwc_account_id) {


        let balance =
          parseFloat(data?.balance?.totalDebit) -
          parseFloat(data?.balance?.totalCredit);
        setAccountBalance(parseFloat(balance).toFixed(2));


      } else if (value?.gwc_account_id) {
        let balance =
          parseFloat(data.balance?.totalDebit) -
          parseFloat(data.balance?.totalCredit);
        setAccountBalance(parseFloat(balance).toFixed(2));
      }
      else if (value?.name == 'Buyer Id') {
        let balance =
          parseFloat(data.balance?.totalDebit) -
          parseFloat(data.balance?.totalCredit);
        setAccountBalance(parseFloat(balance).toFixed(2));
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };
  //*Create Container

  const AddTT = async (formData) => {
    const updatedItems = [...items];

    if (lcyList && lcyList.length > 0) {
      lcyList.forEach((value, index) => {
        if (index < updatedItems.length) {
          updatedItems[index].lcy_amount = parseFloat(value).toFixed(2);
          updatedItems[index].fcy_amount = parseFloat(
            value / currencyExchangeRate
          ).toFixed(2);
        }
      });
    } else {
      updatedItems.forEach((value, index) => {
        if (index < updatedItems.length) {
          updatedItems[index].lcy_amount = 0.0;
          updatedItems[index].fcy_amount = 0.0;
        }
      });
    }

    const idsArray = updatedItems.map((item) => ({
      booking_id: item?.vin ? item?.id : null,
      buyer_id: item?.vin ? null : item?.id,
      buyer_id_name: item?.vin ? item?.buyer?.name : item?.name,
      account_id: item?.account_id
        ? item?.account_id
        : item?.buyer?.account_id
          ? item?.buyer?.account_id
          : null,
      fcy_amount: item?.fcyAmounts,
      lcy_amount: item?.fcyAmounts * currencyExchangeRate,
      vehicle_make: item?.veh_make?.name,
      vehicle_model: item?.veh_model?.name,
      vin: item?.vin,
      lot_number: item?.lot_number,
      color: item?.color,
    }));
    setLoading(true);

    try {
      let obj = {
        external_ref_no: getValue3("reference"),
        via: selectedVia?.name,
        ex_rate: currencyExchangeRate,
        ex_loss: isNaN(parseFloat(exchangeLoss).toFixed(2))
          ? 0.0
          : parseFloat(exchangeLoss).toFixed(2),
        account_id: selectedAccount?.id,
        notes: getValue3("notes"),
        total_fcy_amount: parseFloat(totalFcyAmount).toFixed(2),
        total_lcy_amount: parseFloat(
          totalFcyAmount * currencyExchangeRate
        ).toFixed(2),
        tt_charges: getValues("TTCharges"),
        vat_charges: getValues("vat"),
        total_paid_aed: isNaN(parseFloat(subTotal).toFixed(2))
          ? 0.0
          : parseFloat(subTotal).toFixed(2),
        entries: idsArray,
        payment_medium: "",
        currency: selectedCurr
      };

      if (selectedAccount?.name === "Bank") {
        obj.account_id = selectedBankAccount?.guc_account_id;
        obj.payment_medium = selectedBankAccount.name + "- Bank";
        setPaymentMedium(selectedBankAccount.name + "- Bank");
      } else if (selectedAccount?.name === "Cash") {
        obj.account_id = selectedCashierAccount?.id;
        obj.payment_medium = "Cash";
        setPaymentMedium("Cash");
      } else {
        obj.account_id = selectedAccount?.id;

        obj.payment_medium = selectedAccount?.name + "-" + selectedAccount?.id;
        setPaymentMedium(selectedAccount?.name + selectedAccount?.id);
      }

      const { message } = await ClientServices.AddTT(obj);
      SuccessToaster(message);
      navigate("/vehicle-tt-list");
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
      handleBalance(cashierDetail);
    }
  }, [paymentType]);

  useEffect(() => {
    getVin();
    getAuctionHouses();

    getPaymentAccounts();
    getBanks();
  }, []);

  useEffect(() => {
    if (ttData?.length > 0) {
      getCurrencies();
    }
  }, [ttData]);

  return (
    <Fragment>
      <Box>
        <Box>
          <VehicleTTApproval
            item={modalData}
            open={isDialogOpen}
            onClose={handleCloseDialog}
          />
        </Box>

        <Grid
          container
          spacing={1}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Grid item xs={12} sm={12} md={12}>
            <Grid container alignItems={"center"} justifyContent={"center"}>
              <Grid item md={10}>
                <Typography
                  variant="h4"
                  sx={{
                    color: Colors.charcoalGrey,
                    fontFamily: FontFamily.NunitoRegular,
                    mt: 4,
                    ml: "5px",
                  }}
                >
                  Create Vehicle TT
                </Typography>
              </Grid>
              <Grid
                item
                md={11}
                component={"form"}
                onSubmit={handleSubmit(applyFilter)}
              >
                <Box
                  sx={{
                    m: 4,
                    p: 2,
                    bgcolor: Colors.feta,
                    border: `1px solid ${Colors.iron}`,
                    borderRadius: "9px",
                  }}
                >
                  <Grid
                    container
                    spacing={3}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Grid item xs={12} md={2}>
                      <SelectField
                        size="small"
                        label={"Vin"}
                        options={vin}
                        selected={selectedVin}
                        onSelect={(value) => {
                          setTempCurr(value?.currency);
                          setSelectedVin(value);
                        }}
                        error={errors?.vin?.message}
                        register={register("vin", {})}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <SelectField
                        size="small"
                        options={lot}
                        label={"Lot"}
                        selected={selectedLot}
                        onSelect={(value) => {
                          setTempCurr(value?.currency);
                          setSelectedLot(value);
                        }}
                        error={errors?.lot?.message}
                        register={register("lot", {})}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box
                        sx={{
                          mt: "12px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <PrimaryButton type="submit" title="Add" />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <SelectField
                        size={"small"}
                        onSearch={(v) => getAuctionHouses(v)}
                        label={"Auctions Houses"}
                        options={auctionHouses}
                        selected={selectedAuctionHouses}
                        onSelect={(value) => {
                          setSelectedAuctionHouses(value);
                          if (value) {
                            getBuyerId(value.id);
                          } else {
                            getBuyerId("");
                          }
                        }}
                        error={errors?.auctionHouses2?.message}
                        register={register2("auctionHouses", {
                          required: "Please select auction house.",
                        })}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <SelectField
                        size="small"
                        label={"Buyer ID"}
                        options={buyerIds}
                        selected={selectedBuyerId}
                        onSelect={(value) => {
                          setSelectedBuyerId(value);
                          AddBuyer(value, "usd");
                        }}
                        error={errors?.buyerId2?.message}
                        register={register2("buyerId", {
                          required: "Please select buyerId .",
                        })}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={10}>
            {ttData && (
              <Fragment>
                {/* ========== Table ========== */}
                <TableContainer
                  component={Paper}
                  sx={{
                    boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                    borderRadius: 2,
                    maxHeight: "calc(100vh - 330px)",
                  }}
                >
                  <Table stickyHeader sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        {tableHead.map((item, index) => (
                          <Cell key={index}>{item}</Cell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!loader && ttData?.length > 0 ? (
                        <Fragment>
                          {ttData.map((item, index) => (
                            <Row
                              key={index}
                              sx={{
                                bgcolor: index % 2 !== 0 && "#EFF8E7",
                              }}
                            >
                              {/* Render your data rows here */}
                              <Cell>{index + 1 ?? "-"}</Cell>
                              <Cell>
                                {item?.buyer?.name
                                  ? item?.buyer?.name
                                  : item?.name ?? "-"}
                              </Cell>

                              {/* Check if veh_make, veh_model, vin, and lot_number exist before rendering */}
                              {item?.veh_make &&
                                item?.veh_model &&
                                item?.vin &&
                                item?.lot_number ? (
                                // Render cells if all properties are available
                                <Fragment>
                                  <Cell>{item?.veh_make?.name ?? "-"}</Cell>
                                  <Cell>{item?.veh_model?.name ?? "-"}</Cell>
                                  <Cell>{item?.lot_number ?? "-"}</Cell>
                                  <Cell>{item?.vin ?? "-"}</Cell>
                                  <Cell>{item?.currency ?? "-"}</Cell>
                                </Fragment>
                              ) : (
                                <Cell colSpan={5}>Funds to Buyer ID</Cell>
                              )}

                              <Cell
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  p: 0,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "80%",
                                    display: "flex",
                                    justifyContent: "center",
                                    height: "55px",
                                  }}
                                >
                                  {item?.vin ? (
                                    item?.fcyAmounts
                                  ) : (
                                    <InputField
                                      size="small"
                                      value={item?.fcyAmounts}
                                      register={register3(
                                        index + "fcy_amount",
                                        {
                                          onChange: (e) => {
                                            mainTotal(e.target.value, index);
                                          },
                                          required: true, // Add this line to make the input required
                                        }
                                      )}
                                    />
                                  )}
                                </Box>
                              </Cell>

                              <Cell>
                                {item?.fcyAmounts
                                  ? parseFloat(
                                    item?.fcyAmounts * currencyExchangeRate
                                  ).toFixed(2)
                                  : "0.00"}
                              </Cell>
                              <Cell>
                                <button
                                  style={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                    color: "red",
                                  }}
                                  onClick={() => handleDelete(item)}
                                >
                                  Remove
                                </button>
                              </Cell>
                            </Row>
                          ))}
                        </Fragment>
                      ) : (
                        <Row>
                          <Cell
                            colSpan={tableHead.length + 1}
                            align="center"
                            sx={{ fontWeight: 600 }}
                          >
                            {loader ? (
                              <Box className={classes.loaderWrap}>
                                <CircularProgress />
                              </Box>
                            ) : (
                              "No Data Found"
                            )}
                          </Cell>
                        </Row>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* <Pagination
									currentPage={1}
									pageSize={5}
									// onPageSizeChange={(size) =>
									// 	getInvoiceList(1, size.target.value)
									// }
									tableCount={3}
									totalCount={3}
									// onPageChange={(page) => getInvoiceList(page, "")}
								/> */}
                <Box component={"form"} onSubmit={handleSubmit3(AddTT)}>
                  <Grid container>
                    <Grid item sm={6}></Grid>
                    <Grid item sm={6}>
                      <Box
                        sx={{
                          my: 2,
                          p: 2,
                          bgcolor: Colors.whiteSmoke,
                          py: 0,
                        }}
                      >
                        <Grid
                          container
                          spacing={1}
                          display={"flex"}
                          justifyContent={"flex-end"}
                          alignItems={"center"}
                        >
                          <Grid item xs={12} sm={3}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "flex-start",
                              }}
                            >
                              <Typography
                                variant="h5"
                                sx={{
                                  fontFamily: FontFamily.NunitoRegular,
                                  fontSize: "18px",
                                }}
                              >
                                Total
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={9}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 1,
                                  width: "150px",

                                  borderRadius: "4px",
                                }}
                              >
                                {" "}
                                <InputField
                                  disabled={true}
                                  value={parseFloat(totalFcyAmount).toFixed(2)}
                                  size="small"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">USD</InputAdornment>
                                    , inputProps: { min: 0 }
                                  }}
                                  inputStyle={{ width: "150px" }}
                                />
                              </Box>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 1,
                                  width: "130px",

                                  borderRadius: "4px",
                                }}
                              >
                                <InputField
                                  disabled={true}
                                  value={parseFloat(
                                    totalFcyAmount * currencyExchangeRate
                                  ).toFixed(2)}
                                  size="small"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">AED</InputAdornment>
                                    , inputProps: { min: 0 }
                                  }}
                                  inputStyle={{ width: "150px" }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container sm={12}>
                    <Grid item sm={6}>
                      <Grid container sm={12}>
                        <Grid
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          item={6}
                        >
                          <Grid
                            container
                            display={"flex"}
                            alignItems={"center"}
                            spacing={1}
                          >
                            <Grid item={6}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: FontFamily.NunitoRegular,
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                  width: "150px",
                                }}
                              >
                                TT Rate (AG:AED)
                              </Typography>
                            </Grid>
                            <Grid item={6}>
                              <InputField
                                size={"small"}
                                value={currencyExchangeRate}
                                register={register("exchangeRate", {
                                  onChange: (e) => {
                                    OnTTRateChange(e.target.value);
                                    setCurrencyExchangeRate(e.target.value);
                                  },
                                })}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid container sm={12}>
                        <Grid
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          item={6}
                        >
                          <Grid
                            container
                            display={"flex"}
                            alignItems={"center"}
                            spacing={4}
                          >
                            <Grid item={6}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: FontFamily.NunitoRegular,
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                  width: "125px",
                                }}
                              >
                                Ex. Loss in AED
                              </Typography>
                            </Grid>
                            <Grid item={6}>
                              <InputField
                                disabled={true}
                                size={"small"}
                                value={
                                  isNaN(parseFloat(exchangeLoss).toFixed(2))
                                    ? "0.00"
                                    : parseFloat(exchangeLoss).toFixed(2)
                                }
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item sm={6}>
                      <Box
                        sx={{
                          my: 2,
                          p: 2,
                          bgcolor: Colors.whiteSmoke,
                          py: 0,
                        }}
                      >
                        <Grid
                          container
                          spacing={1}
                          display={"flex"}
                          justifyContent={"flex-end"}
                          alignItems={"center"}
                        >
                          <Grid item xs={12} sm={5}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "flex-start",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: FontFamily.NunitoRegular,
                                  fontSize: "14px",
                                }}
                              >
                                TT & Bank Charges
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  textAlign: "right",
                                  p: 1,
                                  width: "130px",

                                  borderRadius: "4px",
                                }}
                              >
                                <InputField
                                  size={"small"}
                                  defaultValue={0}
                                  register={register("TTCharges", {
                                    onChange: (e) => {
                                      GetTotal();
                                    },
                                  })}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">AED</InputAdornment>
                                    , inputProps: { min: 0 }
                                  }}
                                  inputStyle={{ width: "130px" }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "flex-start",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: FontFamily.NunitoRegular,
                                  fontSize: "14px",
                                }}
                              >
                                VAT on Bank Charges
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  textAlign: "right",
                                  p: 1,
                                  width: "130px",

                                  borderRadius: "4px",
                                }}
                              >
                                <InputField
                                  size={"small"}
                                  defaultValue={0}
                                  register={register("vat", {
                                    onChange: (e) => {
                                      GetTotal();
                                    },
                                  })}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">AED</InputAdornment>
                                    , inputProps: { min: 0 }
                                  }}
                                  inputStyle={{ width: "130px" }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container sm={12}>
                    <Grid item sm={6}>
                      <Grid container sm={12}>
                        <Grid
                          container
                          display={"flex"}
                          alignItems={"center"}
                          sm={12}
                          spacing={1}
                        >
                          <Grid item={12} sx={{ width: "230px" }}>
                            <SelectField
                              label={"TT Fund From Account"}
                              options={accountOptions}
                              selected={selectedAccount}
                              onSelect={(value) => {
                                setSelectedAccount(value);
                                setSelectedPaymentMethod(value);

                                handleBalance(value)

                              }}
                              error={errors3?.account?.message}
                              register={register3("account", {
                                required: "Please select account.",
                              })}
                              size={"small"}
                            />
                          </Grid>
                          <Grid item={12} sx={{ width: "230px" }}>
                            <SelectField
                              label={"Via"}
                              options={[{ id: 'LULU INTL. EXCHANGE', name: 'LULU INTL. EXCHANGE' }, { id: 'AL ANSARI  EXCHANGE', name: 'AL ANSARI  EXCHANGE' }, { id: 'AL FARDAN EXCHANGE', name: 'AL FARDAN EXCHANGE' }, { id: 'AL ROSTAMANI EXCHANGE', name: 'AL ROSTAMANI EXCHANGE' }, { id: 'WALL STREET EXG', name: 'WALL STREET EXG' }]}
                              selected={selectedVia}
                              onSelect={(value) => {
                                setSelectedVia(value);
                              }}
                              error={errors3?.via?.message}
                              register={register3("via", {
                                required: "Please select via.",
                              })}
                              size={"small"}
                            />
                          </Grid>
                          {selectedAccount?.name === "Cash" && (
                            <Fragment>
                              <Grid item xs={12} sm={6}>
                                <InputLabel>Cash in Hand</InputLabel>
                                <FormControl>
                                  <RadioGroup
                                    row
                                    value={paymentType}
                                    onChange={(e) =>
                                      setPaymentType(e.target.value)
                                    }
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
                              <Grid item xs={9} sm={9}>
                                <SelectField
                                  disabled={
                                    user?.role_id === 1003 ? true : false
                                  }
                                  size={"small"}
                                  label={"Cashier Account"}
                                  options={cashierAccounts}
                                  selected={selectedCashierAccount}
                                  onSelect={(value) => {
                                    setSelectedCashierAccount(value);
                                    handleBalance(value);
                                  }}
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
                          {selectedAccount?.name === "Bank" && (
                            <>
                              <Grid item xs={12} sm={6}>
                                <SelectField
                                  size={"small"}
                                  label={"Bank Account"}
                                  options={bankAccounts}
                                  selected={selectedBankAccount}
                                  onSelect={(value) => {
                                    setSelectedBankAccount(value);
                                    handleBalance(value);
                                  }}
                                  error={errors?.bank?.message}
                                  register={register("bank", {
                                    required:
                                      selectedAccount?.name === "Bank"
                                        ? "Please select bank account."
                                        : false,
                                    onChange: (e) => {
                                      setPaymentMedium(
                                        `${selectedBankAccount}-Bank`
                                      );
                                    },
                                  })}
                                />
                              </Grid>

                            </>
                          )}
                          {selectedAccount && <Grid item xs={9} sm={9}>
                            <InputField
                              disabled={true}
                              size="small"
                              value={accountBalance}
                              label={"Balance"}
                              register={register3("Balance")}
                            />
                          </Grid>}
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item sm={6}>
                      <Box
                        sx={{
                          my: 2,
                          p: 2,
                          bgcolor: Colors.whiteSmoke,
                          py: 0,
                        }}
                      >
                        <Grid
                          container
                          spacing={1}
                          display={"flex"}
                          justifyContent={"flex-end"}
                          alignItems={"center"}
                        >
                          <Grid item xs={12} sm={5}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "flex-start",
                              }}
                            >
                              <Typography
                                variant="h5"
                                sx={{
                                  fontFamily: FontFamily.NunitoRegular,
                                  fontSize: "15px",
                                }}
                              >
                                Total Amount Paid (AED)
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  textAlign: "right",
                                  p: 1,
                                  width: "130px",

                                  borderRadius: "4px",
                                }}
                              >
                                {isNaN(parseFloat(subTotal))
                                  ? "-"
                                  : parseFloat(subTotal).toFixed(2)}
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container sm={12}>
                    <Grid container>
                      <Grid item xs={4}>
                        <InputField
                          size={"small"}
                          label={"Account Notes"}
                          register={register3("notes", {})}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={4}>
                      <InputField
                        size={"small"}
                        label={"External Ref No:"}
                        register={register3("reference", {})}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
                    <PrimaryButton
                      title="Update"
                      type="submit"
                      loading={loading}
                    />
                  </Grid>
                </Box>
              </Fragment>
            )}
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
}

export default VehicleTT;
