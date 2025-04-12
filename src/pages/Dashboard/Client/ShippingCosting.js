import React, { Fragment, useState, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  Checkbox,
  TableBody,
  TableRow,
  tableCellClasses,
  CircularProgress,
  Dialog,
  Paper,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import SelectField from "components/Select";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { EyeIcon, FontFamily, IdCardIcon } from "assets";
import InputField from "components/Input";
import { EditNote } from "@mui/icons-material";
import { CircleLoading } from "components/Loaders";
import ClientServices from "services/Client";
import { makeStyles } from "@mui/styles";
import styled from "@emotion/styled";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import Pagination from "components/Pagination";
import { useForm } from "react-hook-form";
import moment from "moment";
import EditNotes from "components/Dialog/EditNotes";
import { findDifferences } from "utils";
import { useNavigate } from "react-router-dom";
import CurrencyServices from "services/Currency";
import { useSelector } from "react-redux";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

function ShippingCosting() {
  const navigate = useNavigate();
  const { usdExchangeRate, cadExchangeRate } = useSelector(
    (state) => state.navigationReducer
  );

  // *For Client Dropdown
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [clientCosting, setClientCosting] = useState([]);
  const [copyClientCosting, setCopyClientCosting] = useState();
  const [selectedClientBooking, setSelectedClientBooking] = useState([]);

  //for table ID
  const [tableId, setTableId] = useState();

  const componentRef = useRef();


  // *for Button Disable
  const [disableButton, setDisableButton] = useState(false);

  // Old Array
  const [oldArray, setOldArray] = useState();

  const [showDue, setShowDue] = useState(true);

  // *For Total Amount
  const [totalAmount, setTotalAmount] = useState([]);

  const [oldTable, setOldTable] = useState(false);

  // *For Filters
  const [filters, setFilters] = useState({});

  const [wrongVins, setWrongVins] = useState([]);

  // *For Currencies
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleOpenDialog = (item) => {
    setTableId(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const tableHead = [
    "Checkbox",
    "Client Code",
    "Client Name",
    "BUY DATE",
    "Buyer ID",
    "MODEL",
    "Make",
    "Vin#",
    "Lot#",
    "Location",
    "Container #",
    "Arrived Date",
    "SHIPPING CHARGE",
    "LATE FEE",
    "STORAGE",
    "CATEGORY A",
    "BROKER FEE",
    "TITLE FEE",
    "OTHER CHARGES",
    "CUSTOM DUTY",
    "VAT",
    "TOTAL SHIPPING",
    "DISCOUNT",
    "NET DUE AMOUNT (USD)",
    "Notes",
    "Action"
  ];
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const {
    register: register2,
    getValues: getValues2,
    setValue: setValue2,
    handleSubmit: handleSubmit2,
    reset,
  } = useForm();

  const classes = useStyles();

  // *For Apply Filters
  const applyFilter = async () => {
    try {
      let data = {
        customer_id: selectedClient?.id,
        payable: true,
        container: getValues("container"),
        vin: getValues("vin"),
        lot: getValues("lot"),
      };

      getClientCosting(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const generatePdf = () => {
    const element = document.getElementById("your-html-element-id"); // Replace with your HTML element ID

    html2pdf(element);
  };
  // *For Get Currencies
  const getCurrencies = async (currency) => {
    try {
      let params = {
        detailed: true,
      };
      const { data } = await CurrencyServices.getCurrencies(params);

      setCurrencyExchangeRate(data.currencies[2].conversion_rate);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Clients
  const getClientDropdown = async () => {
    try {
      const { data } = await ClientServices.getClientDropdown();

      setClients(data?.customers?.rows);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Select and DeSelect client
  const handleSelectClientBooking = (id) => {
    try {
      const shallowCopy = [...selectedClientBooking];
      const currentIndex = selectedClientBooking.indexOf(id);
      if (currentIndex === -1) {
        shallowCopy.push(id);
      } else {
        shallowCopy.splice(currentIndex, 1);
      }
      setSelectedClientBooking(shallowCopy);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Client Costing
  const getClientCosting = async (page, limit, filter) => {

    setLoader(true);
    try {
      const Page = page ? page : currentPage;
      const Limit = limit ? limit : pageLimit;
      const Filter = { ...filters, ...filter };
      setCurrentPage(Page);
      setPageLimit(Limit);
      setFilters(Filter);
      let params = {
        page: Page,
        limit: Limit,
      };
      params = { ...params, ...Filter };

      const { data } = await ClientServices.getClientCosting(params);

      setClientCosting(data?.costings?.rows);
      const newArray = data?.costings?.rows.map((item) => ({
        id: item.id,
        shipping_charges: parseFloat(item.shipping_charges), // Convert to number if needed
        broker_fee: parseFloat(item.broker_fee), // Convert to number if needed
        category_a: parseFloat(item.category_a), // Convert to number if needed
      }));

      setOldArray(newArray);

      const shallowCopy = [];
      const clientCostArray = [];

      data?.costings?.rows.forEach((e) => {
        const date = moment(e?.vehicle?.vcc?.vcc_expiry_date).format(
          "MM-DD-YYYY"
        );

        const targetDate = moment(date, "MM-DD-YYYY");
        let daysRemaining = targetDate > moment()

        let val =
          (parseFloat(e?.shipping_charges) ||
            parseFloat(e?.shipping_placeholder_charges) ||
            0) +
          (parseFloat(e?.late_fee) || 0) +
          (parseFloat(e?.storage) || 0) +
          //(parseFloat(e?.category_a) || 0) +
          // (parseFloat(e?.broker_fee) || 0) +
          (parseFloat(e?.title_fee) || 0) +
          (parseFloat(e?.other_charge) || 0) +
          parseFloat(e?.vehicle?.vcc?.custom_due ? e?.custom_duty == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate : e?.custom_duty : 0) +
          parseFloat(e?.vehicle?.vcc?.vat_due ? e?.vat == 0 ? e?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate : e?.vat : 0)

        let categoryAVal = 0;
        let brokerVal = 0;

        if (parseFloat(e?.category_a) > 0) {
          categoryAVal = parseFloat(e?.category_a);
        } else if (e?.booking?.buyer?.type == "A") {
          categoryAVal = categoryAVal;
        }

        if (parseFloat(e?.broker_fee) > 0) {
          brokerVal = parseFloat(e?.broker_fee);
        } else if (e?.booking?.buyer?.type == "B") {
          brokerVal = brokerVal;
        }

        val += categoryAVal;
        val += brokerVal;

        let copyClientCost = {
          costing_id: e?.id,
        };
        let obj = {
          id: e?.id,
          shipping_charges:
            e?.shipping_charges == 0
              ? e?.shipping_placeholder_charges
                ? e?.shipping_placeholder_charges
                : 0.0
              : e?.shipping_charges,
          late_fee: e?.late_fee,
          storage: e?.storage,
          category_a: e?.category_a,
          broker_fee: e?.broker_fee,
          title_fee: e?.title_fee,
          other_charge: e?.other_charge,
          custom_duty:
            parseFloat(e?.vehicle?.vcc?.custom_due ? e?.custom_duty == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate : e?.custom_duty : 0),
          total: e?.total,
          vat: parseFloat(e?.vehicle?.vcc?.vat_due ? e?.vat == 0 ? e?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate : e?.vat : 0),
          grand_total: e?.subtotal,
          paid: e?.invoice?.paid,
          vin: e?.booking?.vin,
          discount: e?.discount,
        };

        obj.amount = val.toFixed(2);
        obj.grand_total = val.toFixed(2);

        if (true) {
          copyClientCost.shipping_charges =
            e?.shipping_charges == 0
              ? e?.shipping_placeholder_charges
                ? e?.shipping_placeholder_charges
                : 0.0
              : e?.shipping_charges;
          copyClientCost.late_fee = e?.late_fee;
          copyClientCost.storage = e?.storage;
          copyClientCost.category_a = e?.category_a;
          copyClientCost.broker_fee = e?.broker_fee;
          copyClientCost.title_fee = e?.title_fee;
          copyClientCost.other_charge = e?.other_charge;
          copyClientCost.custom_duty =
            parseFloat(e?.vehicle?.vcc?.custom_due ? e?.custom_duty == 0 ? e?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate : e?.custom_duty : 0);
          copyClientCost.discount = e?.discount;
          copyClientCost.vat = parseFloat(e?.vehicle?.vcc?.vat_due ? e?.vat == 0 ? e?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate : e?.vat : 0);
        }

        shallowCopy.push(obj);
        clientCostArray.push(copyClientCost);
      });
      reset();
      setTotalAmount(shallowCopy);

      setCopyClientCosting(clientCostArray);

      setTotalCount(data?.costings?.count);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };
  const [valuesObject, seValuesObject] = useState([]);
  let arrayOfObjects = [...valuesObject];
  // Function to add or update values in the array
  function addOrUpdateValue(id, value, value2, value3) {
    // Check if the id already exists in the array
    const index = arrayOfObjects.findIndex((obj) => obj.id === id);

    // If the id exists, update the value
    if (index !== -1) {
      arrayOfObjects[index].value = value;
      arrayOfObjects[index].value2 = value2;
      arrayOfObjects[index].value3 = value3;
    } else {
      // If the id doesn't exist, add a new object
      arrayOfObjects.push({ id, value, value2, value3 });
    }
  }

  // Print the array of objects

  const handleCalc = (fieldName, id, currency, val, item) => {
    // Example usage (replace this with your actual data)

    const ids = id;
    const values = getValues2(`${ids}-category_a`);
    const values2 = getValues2(`${ids}-broker_fee`);
    const values3 = getValues2(`${ids}-shipping_charges`);

    // Call the function to add or update values
    addOrUpdateValue(ids, values, values2, values3);

    seValuesObject(arrayOfObjects);

    setShowDue(false);
    try {
      const shallowCopy = [...totalAmount];

      const index = totalAmount.findIndex((e) => e.id === id);

      let usd;
      let value = val ? val : 0;
      if (currency === "cad") {
        const aed = value * cadExchangeRate;
        usd = aed / usdExchangeRate;
      }
      if (currency === "aed") {
        usd = value / usdExchangeRate;
      }
      if (currency === "usd") {
        usd = value;
      }

      shallowCopy[index][fieldName] = parseFloat(usd);

      if (
        !shallowCopy[index].conditionApplied &&
        shallowCopy[index].category_a == 0 &&
        item?.booking?.buyer?.type == "A"
      ) {
        shallowCopy[index].category_a = shallowCopy[index].category_a;

        shallowCopy[index].conditionApplied = true;
      }

      if (
        !shallowCopy[index].conditionApplied2 &&
        shallowCopy[index].broker_fee == 0 &&
        item?.booking?.buyer?.type == "B"
      ) {
        shallowCopy[index].broker_fee = shallowCopy[index].broker_fee;

        shallowCopy[index].conditionApplied2 = true;
      }

      let total = 0;

      for (let key in shallowCopy[index]) {
        if (
          key === "shipping_charges" ||
          key == "category_a" ||
          key == "broker_fee" ||
          key == "title_fee" ||
          key == "other_charge"
        ) {
          total += parseFloat(shallowCopy[index][key]);
        }
      }

      shallowCopy[index].amount = parseFloat(total);

      let myTotal =
        parseFloat(shallowCopy[index].amount) +
        parseFloat(shallowCopy[index]["storage"]) +
        parseFloat(shallowCopy[index]["late_fee"]) +
        parseFloat(shallowCopy[index]["custom_duty"]);

      shallowCopy[index].grand_total =
        myTotal + parseFloat(shallowCopy[index]["vat"]);

      // if (fieldName != "discount") {

      // 	shallowCopy[index].grand_total = myTotal + parseFloat(shallowCopy[index]['vat'])
      // }

      shallowCopy[index].amount =
        myTotal +
        parseFloat(shallowCopy[index]["vat"]) -
        parseFloat(shallowCopy[index].discount);

      setTotalAmount(shallowCopy);


      let Vins = [];

      shallowCopy.forEach((item) => {
        if (item.amount < parseFloat(item.paid)) {
          Vins.push(item.vin);
        }
      });


      if (Vins.length > 0) {
        setButtonDisabled(true);
      } else {
        setButtonDisabled(false);
      }

      setWrongVins(Vins);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead.length).keys(),
  ]);

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Add logic for fetching data for the new page
  };

  // *For Update Vendor Costing
  const updateClientCosting = async (formData) => {
    setLoading(true);
    try {
      const costings = [];
      let costingId = Object.keys(formData)[0].split("-")[0];

      let costObj = {};

      for (let key in formData) {
        const costingDetail = clientCosting.find((e) => e.id == costingId);
        if (costingId === key.split("-")[0]) {


          const date = moment(
            costingDetail?.vehicle?.vcc?.vcc_expiry_date
          ).format("MM-DD-YYYY");

          const targetDate = moment(date, "MM-DD-YYYY");
          let daysRemaining = targetDate > moment()
          const objKey = key.split("-")[1];
          costObj["costing_id"] = costingId;
          costObj["booking_id"] = costingDetail?.booking_id;
          costObj["customer_id"] = costingDetail?.booking?.customer_id;
          costObj["customer_phone"] = costingDetail?.booking?.customer?.uae_phone;
          costObj["custom_duty"] = parseFloat(costingDetail?.vehicle?.vcc?.custom_due ? costingDetail?.custom_duty == 0 ? costingDetail?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate : costingDetail?.custom_duty : 0);
          costObj["vat"] = parseFloat(costingDetail?.vehicle?.vcc?.vat_due ? costingDetail?.vat == 0 ? costingDetail?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate : costingDetail?.vat : 0);
          costObj["vendor_type"] = selectedClient?.type;
          costObj["vendor_account_id"] = selectedClient?.account_id;
          costObj["container_no"] = costingDetail?.shipping?.container_no;
          costObj["vehicle_make"] = costingDetail?.booking?.veh_make?.name;
          costObj["vehicle_model"] = costingDetail?.booking?.veh_model?.name;
          costObj["vin"] = costingDetail?.booking?.vin;
          costObj["lot_number"] = costingDetail?.booking?.lot_number;
          costObj["color"] = costingDetail?.booking?.color;
          costObj["loading_port"] = costingDetail?.shipping?.loading_port?.name;
          costObj["location"] = costingDetail?.shipping?.location
            ? `${costingDetail?.shipping?.location?.state_code}-${costingDetail?.shipping?.location?.city_name}`
            : null;
          costObj["country_code"] = costingDetail?.shipping?.location
            ? costingDetail?.shipping?.location?.country_code
            : null;
          costObj["destination"] = costingDetail?.shipping?.dest?.name;
          costObj["galaxy_arrival_date"] =
            costingDetail?.vehicle?.arrived_galaxy_date;
          costObj[objKey] = formData[key] === "" ? 0 : formData[key];
        } else {
          const date = moment(
            costingDetail?.vehicle?.vcc?.vcc_expiry_date
          ).format("MM-DD-YYYY");
          const targetDate = moment(date, "MM-DD-YYYY");
          let daysRemaining = targetDate.diff(moment(), "days");
          if (daysRemaining < 0) {
            daysRemaining = 0;
          }
          costings.push(costObj);
          costingId = key.split("-")[0];
          costObj = {};
          const objKey = key.split("-")[1];
          costObj["costing_id"] = costingId;
          costObj["vendor_type"] = selectedClient?.type;
          costObj["booking_id"] = costingDetail?.booking_id;
          costObj["customer_id"] = costingDetail?.booking?.customer_id;
          costObj["customer_phone"] = costingDetail?.booking?.customer?.uae_phone;
          costObj["custom_duty"] =
            parseFloat(costingDetail?.vehicle?.vcc?.custom_due ? costingDetail?.custom_duty == 0 ? costingDetail?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate : costingDetail?.custom_duty : 0);
          costObj["vat"] = parseFloat(costingDetail?.vehicle?.vcc?.vat_due ? costingDetail?.vat == 0 ? costingDetail?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate : costingDetail?.vat : 0);
          costObj["vendor_account_id"] = selectedClient?.account_id;
          costObj["container_no"] = costingDetail?.shipping?.container_no;
          costObj["vehicle_make"] = costingDetail?.booking?.veh_make?.name;
          costObj["vehicle_model"] = costingDetail?.booking?.veh_model?.name;
          costObj["vin"] = costingDetail?.booking?.vin;
          costObj["lot_number"] = costingDetail?.booking?.lot_number;
          costObj["color"] = costingDetail?.booking?.color;
          costObj["loading_port"] = costingDetail?.shipping?.loading_port?.name;
          costObj["location"] = costingDetail?.shipping?.location
            ? `${costingDetail?.shipping?.location?.state_code}-${costingDetail?.shipping?.location?.city_name}`
            : null;
          costObj["country_code"] = costingDetail?.shipping?.location
            ? costingDetail?.shipping?.location?.country_code
            : null;
          costObj["destination"] = costingDetail?.shipping?.dest?.name;
          costObj["galaxy_arrival_date"] =
            costingDetail?.vehicle?.arrived_galaxy_date;
          costObj[objKey] = formData[key] === "" ? 0 : formData[key];
        }
      }
      costings.push(costObj);
      const costShallowCopy = [...costings];

      let newArray = costShallowCopy.map(
        ({
          vendor_type,
          vendor_account_id,
          container_no,
          vehicle_make,
          vehicle_model,
          vin,
          lot_number,
          color,
          location,
          country_code,
          destination,
          galaxy_arrival_date,
          booking_id,
          custom_duty,
          vat,

          customer_id,
          customer_phone,
          ...rest
        }) => rest
      );

      const difference = findDifferences(newArray, copyClientCosting);

      const newArr = [];

      difference.forEach((e) => {
        if (selectedClientBooking.indexOf(parseInt(e?.costing_id)) !== -1) {
          const findData = costings.find(
            (j) => j?.costing_id === e?.costing_id
          );
          let obj = {
            ...e,

            booking_id: findData?.booking_id,
            customer_id: findData?.customer_id,
            customer_phone: findData?.customer_phone,
            container_no: findData?.container_no,
            vehicle_make: findData?.vehicle_make,
            vehicle_model: findData?.vehicle_model,
            vin: findData?.vin,
            lot_number: findData?.lot_number,
            color: findData?.color,
            loading_port: findData?.loading_port,
            location: findData?.location,
            country_code: findData?.country_code,
            destination: findData?.destination,
            galaxy_arrival_date: findData?.galaxy_arrival_date,
            custom_duty: findData.custom_duty || e.custom_duty, // Use default value from e if not present in findData
            vat: findData.vat || e.vat, // Use default value from e if not present in findData
          };

          newArr.push(obj);
        }
      });

      const idToValueMap = {};
      const idToValue2Map = {};
      const idToValue3Map = {};
      valuesObject.forEach((item) => {
        idToValueMap[item.id] = item.value;
        idToValue2Map[item.id] = item.value2;
        idToValue3Map[item.id] = item.value3;
      });

      const updatedArray = newArr.map((item) => {
        const matchingValue = idToValueMap[item.costing_id];
        const matchingValue2 = idToValue2Map[item.costing_id];
        const matchingValue3 = idToValue3Map[item.costing_id];

        if (matchingValue !== undefined) {
          if (item.category_a !== undefined) {
            item = { ...item, category_a: matchingValue };
          } else {
            item = { ...item, category_a: matchingValue };
          }
        }

        if (matchingValue2 !== undefined) {
          if (item.value2 !== undefined) {
            item = { ...item, broker_fee: matchingValue2 };
          } else {
            item = { ...item, broker_fee: matchingValue2 };
          }
        }
        if (matchingValue3 !== undefined) {
          if (item.value3 !== undefined) {
            item = { ...item, shipping_charges: matchingValue3 };
          } else {
            item = { ...item, shipping_charges: matchingValue3 };
          }
        }

        return item;
      });

      // Update newArray by removing specified keys only if old and new values are the same
      const updatedArray2 = updatedArray.map((obj2) => {
        const obj1 = oldArray.find(
          (item) => item.id.toString() === obj2.costing_id
        );
        if (obj1 && obj1.broker_fee == obj2.broker_fee) {
          delete obj2.broker_fee;
        }
        if (obj1 && obj1.shipping_charges == obj2.shipping_charges) {
          delete obj2.shipping_charges;
        }
        if (obj1 && obj1.category_a == obj2.category_a) {
          delete obj2.category_a;
        }
        return obj2;
      });

      let obj = {
        costings: updatedArray2,
      };

      const { message } = await ClientServices.updateClientCosting(obj);
      SuccessToaster(message);
      setSelectedClientBooking([])
      navigate("/shipping-costing")
      let data = {
        container_id: selectedClient?.id,
      };
      getClientCosting(1, "", data);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCellContent = (colIndex, item, isActive) => {

    const date = moment(item?.vehicle?.vcc?.vcc_expiry_date).format(
      "MM-DD-YYYY"
    );
    const targetDate = moment(date, "MM-DD-YYYY");
    let daysRemaining = targetDate > moment()


    switch (colIndex) {
      case 0:
        return (
          <Checkbox
            checked={isActive}
            onChange={() => handleSelectClientBooking(item?.id)}
          />
        );
      case 1:
        return item?.booking?.customer?.ref_id ?? "-";
      case 2:
        return item?.booking?.customer?.name ?? "-";
      case 3:
        return item?.booking?.purchase_date
          ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY")
          : "-";
      case 4:
        return item?.booking?.buyer?.name ?? "-";
      case 5:
        return item?.booking?.veh_model?.name ?? "-";
      case 6:
        return item?.booking?.veh_make?.name ?? "-";
      case 7:
        return item?.booking?.vin ?? "-";
      case 8:
        return item?.booking?.lot_number ?? "-";
      case 9:
        return item?.shipping?.loading_port?.name ?? "-";
      case 10:
        return item?.shipping?.container_no ?? "-";
      case 11:
        return item?.vehicle?.arrived_galaxy_date
          ? moment(item?.vehicle?.arrived_galaxy_date).format("DD-MMM-YYYY")
          : "-";
      case 12:
        return isActive ? (
          <InputField
            size={"small"}
            type={"number"}
            defaultValue={
              item?.shipping_charges === "0"
                ? item?.shipping_placeholder_charges
                  ? parseFloat(item?.shipping_placeholder_charges).toFixed(2)
                  : 0.0
                : parseFloat(item?.shipping_charges).toFixed(2)
            }
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            register={register2(`${item?.id}-shipping_charges`, {
              onChange: (e) =>
                handleCalc(
                  "shipping_charges",
                  item?.id,
                  item?.shipping_currency,
                  e.target.value,
                  item
                ),
            })}
            inputStyle={{
              width: "100px",
            }}
          />
        ) : item?.shipping_charges === "0" ? (
          item?.shipping_placeholder_charges ? (
            parseFloat(item?.shipping_placeholder_charges).toFixed(2)
          ) : (
            parseFloat(0).toFixed(2)
          )
        ) : (
          parseFloat(item?.shipping_charges).toFixed(2) ?? "-"
        );
      case 13:
        return parseFloat(item?.late_fee).toFixed(2) ?? "-";
      case 14:
        return parseFloat(item?.storage).toFixed(2) ?? "-";
      case 15:
        return isActive ? (
          <InputField
            size={"small"}
            type={"number"}
            defaultValue={
              item?.booking?.buyer?.type == "A" && item?.category_a == 0
                ? parseFloat(item?.category_a).toFixed(2)
                : parseFloat(item?.category_a).toFixed(2)
            }
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            register={register2(`${item?.id}-category_a`, {
              onChange: (e) =>
                handleCalc(
                  "category_a",
                  item?.id,
                  item?.shipping_currency,
                  e.target.value,
                  item
                ),
            })}
            inputStyle={{
              width: "100px",
            }}
          />
        ) : item?.booking?.buyer?.type == "A" && item?.category_a == 0 ? (
          parseFloat(item?.category_a).toFixed(2)
        ) : (
          parseFloat(item?.category_a).toFixed(2) ?? "-"
        );
      case 16:
        return isActive ? (
          <InputField
            size={"small"}
            type={"number"}
            defaultValue={
              item?.booking?.buyer?.type == "B" && item?.broker_fee == 0
                ? parseFloat(item?.broker_fee).toFixed(2)
                : parseFloat(item?.broker_fee).toFixed(2)
            }
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            register={register2(`${item?.id}-broker_fee`, {
              onChange: (e) =>
                handleCalc(
                  "broker_fee",
                  item?.id,
                  item?.shipping_currency,
                  e.target.value,
                  item
                ),
            })}
            inputStyle={{
              width: "100px",
            }}
          />
        ) : item?.booking?.buyer?.type == "B" && item?.broker_fee == 0 ? (
          parseFloat(item?.broker_fee).toFixed(2)
        ) : (
          parseFloat(item?.broker_fee).toFixed(2) ?? "-"
        );
      case 17:
        return isActive ? (
          <InputField
            size={"small"}
            type={"number"}
            defaultValue={parseFloat(item?.title_fee).toFixed(2)}
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            register={register2(`${item?.id}-title_fee`, {
              onChange: (e) =>
                handleCalc(
                  "title_fee",
                  item?.id,
                  item?.shipping_currency,
                  e.target.value,
                  item
                ),
            })}
            inputStyle={{
              width: "100px",
            }}
          />
        ) : (
          parseFloat(item?.title_fee).toFixed(2) ?? "-"
        );
      case 18:
        return isActive ? (
          <InputField
            size={"small"}
            type={"number"}
            defaultValue={parseFloat(item?.other_charge).toFixed(2)}
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            inputStyle={{
              width: "100px",
            }}
            register={register2(`${item?.id}-other_charge`, {
              onChange: (e) =>
                handleCalc(
                  "other_charge",
                  item?.id,
                  item?.shipping_currency,
                  e.target.value,
                  item
                ),
            })}
          />
        ) : (
          parseFloat(item?.other_charge).toFixed(2) ?? "-"
        );

      case 19:
        return parseFloat(item?.vehicle?.vcc?.custom_due ? item?.custom_duty == 0 ? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate : item?.custom_duty : 0).toFixed(2);
      case 20:
        return parseFloat(item?.vehicle?.vcc?.vat_due ? item?.vat == 0 ? item?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate : item?.vat : 0).toFixed(2);
      case 21:
        return showDue
          ? parseFloat(
            parseFloat(
              totalAmount.find((e) => e?.id === item?.id)?.grand_total
            )
          ).toFixed(2)
          : parseFloat(
            totalAmount.find((e) => e?.id === item?.id)?.grand_total
          ).toFixed(2);
      case 22:
        return isActive ? (
          <InputField
            size={"small"}
            type={"number"}
            defaultValue={parseFloat(item?.discount).toFixed(2)}
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            inputStyle={{
              width: "100px",
            }}
            register={register2(`${item?.id}-discount`, {
              onChange: (e) =>
                handleCalc(
                  "discount",
                  item?.id,
                  item?.shipping_currency,
                  e.target.value,
                  item
                ),
            })}
          />
        ) : (
          parseFloat(item?.discount).toFixed(2) ?? "-"
        );
      case 23:
        return showDue
          ? parseFloat(
            parseFloat(
              totalAmount.find((e) => e?.id === item?.id)?.grand_total
            ) -
            parseFloat(
              totalAmount.find((e) => e?.id === item?.id)?.discount
            )
          ).toFixed(2)
          : parseFloat(
            parseFloat(
              totalAmount.find((e) => e?.id === item?.id)?.grand_total
            ) -
            parseFloat(
              totalAmount.find((e) => e?.id === item?.id)?.discount
            )
          ).toFixed(2);
      case 24:
        return (
          <EditNote
            sx={{
              color: "#E3E3E3",
              cursor: "pointer",
            }}
            onClick={() => {
              handleOpenDialog(item);
            }}
          />
        );
      case 25:
        return <Box
          onClick={item?.invoice ? () =>
            navigate(
              `/client-invoice-detail/${item?.invoice?.id}`,
              {
                state: {
                  shipping: true,
                },
              }
            )
            : () => { ErrorToaster('Invoice Not Available') }
          }
        >
          <IconButton
            sx={{
              bgcolor:
                Colors.primary,
              "&:hover": {
                bgcolor:
                  Colors.primary,
              },
            }}
          >
            <EyeIcon />
          </IconButton>
          <Typography variant="body2">
            View
          </Typography>
        </Box>;

      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    const headers = tableHead.filter((item) => item !== "Checkbox" && item !== "Notes" && item !== "Action");
    const rows = clientCosting?.map((item) => [
      item?.booking?.customer?.ref_id ?? "-",
      item?.booking?.customer?.name ?? "-",
      item?.booking?.purchase_date ? moment(item?.booking?.purchase_date).format("DD-MMM-YYYY") : "-",
      item?.booking?.buyer?.name ?? "-",
      item?.booking?.veh_model?.name ?? "-",
      item?.booking?.veh_make?.name ?? "-",
      item?.booking?.vin ?? "-",
      item?.booking?.lot_number ?? "-",
      item?.shipping?.loading_port?.name ?? "-",
      item?.shipping?.container_no ?? "-",
      item?.vehicle?.arrived_galaxy_date ? moment(item?.vehicle?.arrived_galaxy_date).format("DD-MMM-YYYY") : "-",
      item?.shipping_charges === "0" ? (item?.shipping_placeholder_charges
        ? (parseFloat(item?.shipping_placeholder_charges).toFixed(2))
        : (parseFloat(0).toFixed(2))) : (parseFloat(item?.shipping_charges).toFixed(2) ?? "-"),
      parseFloat(item?.late_fee).toFixed(2) ?? "-",
      parseFloat(item?.storage).toFixed(2) ?? "-",
      item?.booking?.buyer?.type == "A" && item?.category_a == 0
        ? (parseFloat(item?.category_a).toFixed(2))
        : (parseFloat(item?.category_a).toFixed(2) ?? "-"),
      item?.booking?.buyer?.type == "B" && item?.broker_fee == 0
        ? (parseFloat(item?.broker_fee).toFixed(2))
        : (parseFloat(item?.broker_fee).toFixed(2) ?? "-"),
      parseFloat(item?.title_fee).toFixed(2) ?? "-",
      parseFloat(item?.other_charge).toFixed(2) ?? "-",
      parseFloat(item?.vehicle?.vcc?.custom_due ? item?.custom_duty == 0
        ? item?.vehicle?.vcc?.custom_charges_aed / currencyExchangeRate
        : item?.custom_duty : 0).toFixed(2),
      parseFloat(item?.vehicle?.vcc?.vat_due ? item?.vat == 0
        ? item?.vehicle?.vcc?.vat_charges_aed / currencyExchangeRate
        : item?.vat : 0).toFixed(2),
      showDue
        ? parseFloat(parseFloat(totalAmount.find((e) => e?.id === item?.id)?.grand_total)).toFixed(2)
        : parseFloat(totalAmount.find((e) => e?.id === item?.id)?.grand_total).toFixed(2),
      parseFloat(item?.discount).toFixed(2) ?? "-",
      showDue
        ? parseFloat(parseFloat(totalAmount.find((e) => e?.id === item?.id)?.grand_total) -
          parseFloat(totalAmount.find((e) => e?.id === item?.id)?.discount)).toFixed(2)
        : parseFloat(parseFloat(totalAmount.find((e) => e?.id === item?.id)?.grand_total) -
          parseFloat(totalAmount.find((e) => e?.id === item?.id)?.discount)).toFixed(2)
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(new Blob([buf]), "data.xlsx");
  };

  useEffect(() => {
    getClientDropdown();
    getCurrencies();
  }, []);
  return (
    <Fragment>
      <Grid
        container
        spacing={1}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {/* //*Dialog Box */}
        <Box>
          <EditNotes
            item={tableId}
            open={isDialogOpen}
            onClose={handleCloseDialog}
          />
        </Box>

        <Grid item xs={12} sm={12} md={11}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mr: 4,
              my: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: Colors.charcoalGrey,
                fontFamily: FontFamily.NunitoRegular,
              }}
            >
              Client Shipping Costing
            </Typography>
            {clientCosting?.length > 0 && (
              <PrimaryButton
                title={"Download Excel"}
                onClick={() => downloadExcel()}
              />
            )}
          </Box>
        </Grid>
        <Grid item md={11}>
          <Box
            sx={{
              m: "20px 0 20px 0",
              p: "20px",
              bgcolor: Colors.feta,
              border: `1px solid ${Colors.iron}`,
              borderRadius: "9px",
            }}
          >
            <Grid
              container
              spacing={1}
              alignItems={"center"}
              justifyContent={"space-between"}
              component={"form"}
              onSubmit={handleSubmit(applyFilter)}
            >
              {/* <Grid item xs={12} md={2}>
								<InputField
									size={"small"}
									label={"Client Ident. No"}
									placeholder={"Client Ident. No"}
									register={register("ClientIdent")}
								/>
							</Grid> */}
              <Grid item xs={12} md={2}>
                <SelectField
                  size="small"
                  label={"Client"}
                  options={clients}
                  selected={selectedClient}
                  onSelect={(value) => {
                    setSelectedClient(value);
                  }}
                  error={errors?.vendor?.message}
                  register={register("client")}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <InputField
                  size={"small"}
                  label={"Lot"}
                  placeholder={"Lot"}
                  register={register("lot")}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <InputField
                  size={"small"}
                  label={"Vin"}
                  placeholder={"Vin"}
                  register={register("vin")}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <InputField
                  size={"small"}
                  label={"Container"}
                  placeholder={"Container"}
                  register={register("container")}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    mt: "12px",
                  }}
                >
                  <PrimaryButton title={"Search"} type={"submit"} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>



        <Grid item md={11}>
          {clientCosting.length > 0 && (
            <Box>
              <Grid container mb={2}>
                <Grid item xs={5}>
                  <FormControl>
                    <InputLabel>Columns</InputLabel>
                    <Select
                      size={"small"}
                      multiple
                      value={visibleColumns}
                      label={"Columns"}
                      onChange={handleColumnChange}
                      renderValue={() => "Show/Hide"}
                    >
                      {tableHead.map((column, index) => {
                        if (
                          column !== "Checkbox" &&
                          column !== "SHIPPING CHARGE" &&
                          column !== "LATE FEE" &&
                          column !== "STORAGE" &&
                          column !== "CATEGORY A" &&
                          column !== "BROKER FEE" &&
                          column !== "TITLE FEE" &&
                          column !== "OTHER CHARGE" &&
                          column !== "CUSTOM DUTY" &&
                          column !== "VAT" &&
                          column !== "TOTAL SHIPPING" &&
                          column !== "DISCOUNT" &&
                          column !== "NET DUE AMOUNT" &&
                          column !== "Notes" &&
                          column !== "OTHER CHARGES"
                        ) {
                          return (
                            <MenuItem key={index} value={index}>
                              <Checkbox
                                checked={visibleColumns.includes(index)}
                              />
                              <ListItemText primary={column} />
                            </MenuItem>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {loader ? (
                <CircularProgress />
              ) : (
                clientCosting.length > 0 && (
                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                      borderRadius: 2,
                      maxHeight: "calc(100vh - 330px)",
                    }}
                  >
                    <Table stickyHeader sx={{ minWidth: 500 }}>
                      {/* Table Header */}
                      <TableHead>
                        <TableRow>
                          {visibleColumns.map((index) => (
                            <Cell
                              key={index}
                              sx={{
                                bgcolor: `${index < 11 ? Colors.primary : Colors.blue
                                  } !important`,
                              }}
                            >
                              {tableHead[index]}
                            </Cell>
                          ))}
                        </TableRow>
                      </TableHead>

                      {/* Table Body */}
                      <TableBody>
                        {!loader ? (
                          clientCosting?.length > 0 ? (
                            <Fragment>
                              {clientCosting.map((item, rowIndex) => {
                                const isActive =
                                  selectedClientBooking.indexOf(item?.id) !==
                                  -1;
                                return (
                                  <Row
                                    key={rowIndex}
                                    sx={{
                                      bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                    }}
                                  >
                                    {visibleColumns.map((colIndex) => (
                                      <Cell key={colIndex}>
                                        {renderCellContent(
                                          colIndex,
                                          item,
                                          isActive
                                        )}
                                      </Cell>
                                    ))}
                                  </Row>
                                );
                              })}
                            </Fragment>
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={visibleColumns.length + 1}
                                align="center"
                                sx={{ fontWeight: 600 }}
                              >
                                No Data Found
                              </TableCell>
                            </TableRow>
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={visibleColumns.length + 2}
                              align="center"
                              sx={{ fontWeight: 600 }}
                            >
                              <Box className={classes.loaderWrap}>
                                <CircularProgress />
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}

              {/* Pagination */}
              {clientCosting.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageLimit}
                  onPageSizeChange={(size) =>
                    getClientCosting(1, size.target.value)
                  }
                  tableCount={clientCosting?.length}
                  totalCount={totalCount}
                  onPageChange={(page) => getClientCosting(page, "")}
                />
              )}
            </Box>
          )}
        </Grid>
        {clientCosting.length > 0 && (
          <>
            {wrongVins.length > 0 && (
              <Grid item md={11}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",

                    gap: "20px",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: FontFamily.NunitoRegular,
                      color: "red",
                    }}
                  >
                    {wrongVins.length > 1 ? "Vins" : "Vin"}{" "}
                    {wrongVins.join(",")} Costing Amount{" "}
                    {wrongVins.length > 1 ? "are" : "is"} Less than Paid Amount
                  </Typography>
                </Box>
              </Grid>
            )}
            <Grid item md={11}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "20px",
                }}
              >
                <PrimaryButton
                  disabled={buttonDisabled}
                  loading={loading}
                  title="Update"
                  onClick={handleSubmit2(updateClientCosting)}
                />
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Fragment>
  );
}

export default ShippingCosting;
