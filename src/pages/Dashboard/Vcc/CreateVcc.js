import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  InputLabel,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import { FontFamily, SearchIcon, VccIcon } from "assets";
import Colors from "assets/Style/Colors";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import { CircleLoading } from "components/Loaders";
import { CancelOutlined, Edit } from "@mui/icons-material";
import UploadFile from "components/UploadFile";
import Pagination from "components/Pagination";
import { PrimaryButton } from "components/Buttons";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import moment from "moment";
import DatePicker from "components/DatePicker";
import { CleanTypes, Debounce, formatPermissionData, getFileSize, handleExportWithComponent } from "utils";
import VccServices from "services/Vcc";
import SimpleDialog from "components/Dialog/SimpleDialog";
import SelectField from "components/Select";
import VccPurpose from 'data/Vcc_Purpose';
import instance from "config/axios";
import routes from "services/System/routes";
import { v4 as uuidv4 } from 'uuid';
import Uploading from "components/Uploading";
import { Link } from "react-router-dom";
import { PDFExport } from "@progress/kendo-react-pdf";
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
    display: 'flex',
    height: 100,
    '& svg': {
      width: '40px !important',
      height: '40px !important'
    }
  },
  anchorLink: {
    textDecoration: 'underline',
    color: Colors.twitter,
    cursor: 'pointer'
  }
})


function CreateVcc() {
  const classes = useStyles();
  const contentRef = useRef(null);
  const tableHead = [
    "Select",
    "Serial Number",
    "Customer",
    "Make",
    "Model",
    "LOT",
    "VIN",
    "Color",
    "Container",
    "VCC Declaration Number",
    "Purpose",
    "Declaration Date",
    "VCC Expiry Date",
    "Time Left",
    "Custom Charges",
    "VAT Charges",
    "Attached Vcc",
    "Attached Declaration",
  ];

  const [visibleColumns, setVisibleColumns] = useState([
    ...Array(tableHead?.length).keys(),
  ]);

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
    reset: reset2,
  } = useForm();
  const {
    register: register3,
    handleSubmit: handleSubmit3,
    formState: { errors: errors3 },
    reset: reset3,
  } = useForm();
  const {
    register: register4,
    handleSubmit: handleSubmit4,
    formState: { errors: errors4 },
    reset: reset4,
  } = useForm();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  // *For Dialog Box
  const [vccDeclareDialog, setVccDeclareDialog] = useState(false);
  const [vccVatChargesDialog, setVccVatChargesDialog] = useState(false);

  // *For Vehicle List
  const [vehicleList, setVehicleList] = useState();
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [vccDetail, setVccDetail] = useState();
  const [purposeDialog, setPurposeDialog] = useState(false);
  // *For Upload File types
  const allowFilesType = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']

  const [vccId, setVccId] = useState();


  const [selectedVccPurpose, setSelectedVccPurpose] = useState(null);

  // *For Uploaded Documents
  const [progress, setProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [documentDetail, setDocumentDetail] = useState([]);
  const [documentLink, setDocumentLink] = useState('')
  const [progress2, setProgress2] = useState(0);
  const [uploadedSize2, setUploadedSize2] = useState(0);
  const [documentDetail2, setDocumentDetail2] = useState([]);
  const [documentLink2, setDocumentLink2] = useState('')

  // *For Pagination
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [declarationDialog, setDeclarationDialog] = useState(false);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Handle Date
  const [vccDate, setVccDate] = useState();
  const [vccExpDate, setVccExpDate] = useState();

  // *For Permissions
  const [permissions, setPermissions] = useState();

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  // *For Handle Date
  const handleVccDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setVccDate("invalid");
        return;
      }
      setVccDate(newDate);
      setValue("vccDate", newDate);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleVccExpDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setVccExpDate("invalid");
        return;
      }
      setVccExpDate(newDate);
      setValue("vccExpDate", newDate);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Vcc Vehicle List
  const getVccVehicles = async (page, limit, filter) => {
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
      const { data } = await VccServices.getVccVehicles(params);
      setVehicleList(data?.vehicles?.rows);
      setTotalCount(data?.vehicles?.count);
      setPermissions(formatPermissionData(data?.permissions));
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  const handleClick = (item) => {

    if (item?.vcc?.vcc_declaration) {
      setDeclarationDialog(true);


      setVccId(item?.vcc?.id);
    }
  };

  // *For Update Approval Status
  const updateDeclaration = async (data) => {
    try {
      let obj = {
        vcc_id: vccId,
        vcc_declaration: data?.comment,
      };
      const { message } = await VccServices.updateDeclaration(obj);
      setDeclarationDialog(false);
      SuccessToaster(message);
      getVccVehicles();
      reset4();
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Handle Filter
  const handleFilter = (data) => {
    Debounce(() => getVccVehicles(1, "", data));
  };

  // *For Select and DeSelect Vehicles
  const handleCheck = (data) => {
    console.log(data, 'data');
    try {
      const shallowCopy = [...selectedVehicles];
      const currentIndex = selectedVehicles.findIndex(
        (e) => e.vehicleId === data?.id
      );
      if (currentIndex === -1) {
        let obj = {
          vehicleId: data?.id,
          bookingId: data?.booking_id,
          customer_name: data?.booking?.customer?.name,
          customer_phone: data?.booking?.customer?.uae_phone,
          customer_id: data?.booking?.customer?.id,
          vin: data?.booking?.vin,
        };
        shallowCopy.push(obj);
      } else {
        shallowCopy.splice(currentIndex, 1);
      }
      setSelectedVehicles(shallowCopy);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleClick2 = (item) => {
    console.log(item);

    if (!item?.vcc?.exit_paper_received && !item?.mobaya_issued_date && !item?.vcc?.makasa_received) {

      if (item?.vcc?.vcc_purpose) {
        setPurposeDialog(true);
        setSelectedVccPurpose({ id: item?.vcc?.vcc_purpose, name: item?.vcc?.vcc_purpose })
        setValue2('vccPurpose', { id: item?.vcc?.vcc_purpose, name: item?.vcc?.vcc_purpose })
      }
    }

    setVccId(item?.vcc?.id);

  };


  // *For Declare Vcc
  const declareVcc = async (formData) => {
    setLoading(true);
    try {
      const declarations = [];
      console.log(selectedVehicles, 'selectedVehicles');
      selectedVehicles.forEach((e) => {
        let newObj = {
          vehicle_id: e.vehicleId,
          booking_id: e.bookingId,
          vin: e?.vin,
          customer_name: e?.customer_name,
          customer_phone: e?.customer_phone,
          customer_id: e?.customer_id
        };
        declarations.push(newObj);
      });
      let obj = {
        vcc_declaration: formData?.declaration,
        vcc_date: vccDate,
        vcc_expiry_date: new Date(moment(vccDate).add(150, "days")),
        vcc_doc: documentLink,
        declaration_doc: documentLink2,
        declarations: declarations,
      };
      console.log(obj, 'obj');
      const { message } = await VccServices.declareVcc(obj);
      SuccessToaster(message);
      setSelectedVehicles([]);
      getVccVehicles();
      handleCloseVccDialog();
      setVccDeclareDialog(false);
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
      const file = e.target.files[0]
      let arr = [{
        id: uuidv4(),
        name: file?.name,
        file: '',
        type: file?.type.split('/')[1],
        size: getFileSize(file.size),
        isUpload: false
      }]
      if (allowFilesType.includes(file.type)) {
        setDocumentDetail(arr)
        handleUpload(file, arr)
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload = async (file, docs) => {
    setProgress(0)
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

          setProgress(percentCompleted);
          setUploadedSize(getFileSize(uploadedBytes))
        },
      });
      if (data) {
        docs[0].isUpload = true
        docs[0].file = data?.data?.nations
        setDocumentDetail(docs)
        setDocumentLink(data?.data?.nations)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }
  const handleUploadDocument2 = async (e) => {
    try {
      e.preventDefault();
      const file = e.target.files[0]
      let arr = [{
        id: uuidv4(),
        name: file?.name,
        file: '',
        type: file?.type.split('/')[1],
        size: getFileSize(file.size),
        isUpload: false
      }]
      if (allowFilesType.includes(file.type)) {
        setDocumentDetail2(arr)
        handleUpload2(file, arr)
      } else {
        ErrorToaster(`Only ${CleanTypes(allowFilesType)} formats is supported`)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleUpload2 = async (file, docs) => {
    setProgress2(0)
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total);

          setProgress2(percentCompleted);
          setUploadedSize2(getFileSize(uploadedBytes))
        },
      });
      if (data) {
        docs[0].isUpload = true
        docs[0].file = data?.data?.nations
        setDocumentDetail2(docs)
        setDocumentLink2(data?.data?.nations)
      }
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Purpose
  const updatePurpose = async () => {

    try {
      let obj = {
        vcc_id: vccId,
        vcc_purpose: selectedVccPurpose?.id,

      };
      console.log(obj);
      const { message } = await VccServices.purposeVcc(obj);

      SuccessToaster(message);
      setPurposeDialog(false)
      getVccVehicles();
      reset2();
    } catch (error) {
      ErrorToaster(error);
    }
  };
  // *For Handle Close Vcc Dialog
  const handleCloseVccDialog = () => {
    reset();
    handleVccDate();
    handleVccExpDate();
  };

  // *For Add Custom VAT Charges
  const customVatCharges = async (formData) => {
    setLoading(true);
    try {
      let obj = {
        vcc_id: vccDetail?.vcc?.id,
        custom_charges_aed: formData?.customCharges,
        vat_charges_aed: formData?.vatCharges,
        make_name: vccDetail?.booking?.veh_make?.name,
        model_name: vccDetail?.booking?.veh_model?.name,
        color: vccDetail?.booking?.color,
        vin: vccDetail?.booking?.vin,
        lot_number: vccDetail?.booking?.lot_number,
        customer_id: vccDetail?.booking?.customer?.id,
      };
      const { message } = await VccServices.customVatCharges(obj);
      SuccessToaster(message);
      getVccVehicles();
      reset3();
      setVccVatChargesDialog(false);
    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoading(false);
    }
  };
  // *For Remove Uploaded Document
  const removeDoc = () => {
    try {
      setDocumentDetail([])
      setDocumentLink('')
      setValue2('scanned', '')
    } catch (error) {
      ErrorToaster(error)
    }
  }
  // *For Remove Uploaded Document
  const removeDoc2 = () => {
    try {
      setDocumentDetail2([])
      setDocumentLink2('')
      setValue2('scanned2', '')
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleColumnChange = (event) => {
    const selectedColumns = event.target.value;
    // Sort the selected columns to maintain the correct order
    const sortedColumns = selectedColumns.sort((a, b) => a - b);
    setVisibleColumns(sortedColumns);
  };

  const renderCellContent = (colIndex, item, isActive) => {
    const date = moment(item?.vcc?.vcc_expiry_date).format("MM-DD-YYYY");
    const targetDate = moment(date, "MM-DD-YYYY");
    let daysRemaining = targetDate.diff(moment(), "days");
    if (daysRemaining < 0) {
      daysRemaining = 0;
    }
    switch (colIndex) {
      case 0:
        return (
          <Checkbox
            className="pdf-hide"
            disabled={item?.vcc?.id ? true : false}
            checked={
              selectedVehicles.findIndex((e) => e.vehicleId === item?.id) !== -1
            }
            onChange={() => handleCheck(item)}
          />
        );
      case 1:
        return item?.vcc?.id ?? "-";
      case 2:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.customer?.name ?? "-"}
              arrow
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [10, -2],
                      },
                    },
                  ],
                },
              }}
            >
              {
                item?.booking?.customer?.name?.length > 12
                  ? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.customer?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.customer?.name ?? "-";
      case 3:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.veh_make?.name ?? "-"}
              arrow
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [10, -2],
                      },
                    },
                  ],
                },
              }}
            >
              {
                item?.booking?.veh_make?.name?.length > 12
                  ? item?.booking?.veh_make?.name?.slice(0, 8) + "..." : item?.booking?.veh_make?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.veh_make?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.veh_make?.name ?? "-";
      case 4:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={item?.booking?.veh_model?.name ?? "-"}
              arrow
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [10, -2],
                      },
                    },
                  ],
                },
              }}
            >
              {
                item?.booking?.veh_model?.name?.length > 12
                  ? item?.booking?.veh_model?.name?.slice(0, 8) + "..." : item?.booking?.veh_model?.name
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.veh_model?.name ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.veh_model?.name ?? "-";
      case 5:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={copied ? "copied" : (item?.booking?.lot_number ?? "-")}
              arrow
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [10, -2],
                      },
                    },
                  ],
                },
              }}
              onClick={() => copyContent(item?.booking?.lot_number ?? "-")}
            >
              {
                item?.booking?.lot_number?.length > 12
                  ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.lot_number ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.lot_number ?? "-";
      case 6:
        return (
          <Box>
            <Tooltip
              className="pdf-hide"
              title={copied ? "copied" : (item?.booking?.vin ?? "-")}
              arrow
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [10, -2],
                      },
                    },
                  ],
                },
              }}
              onClick={() => copyContent(item?.booking?.vin ?? "-")}
            >
              {
                item?.booking?.vin?.length > 12
                  ? item?.booking?.vin?.slice(0, 8) + "..." : item?.booking?.vin
              }
            </Tooltip>
            <Box
              component={"div"}
              className='pdf-show'
              sx={{ display: "none !important" }}
            >
              {item?.booking?.vin ?? "-"}
            </Box>
          </Box>
        )
      // item?.booking?.vin ?? "-";
      case 7:
        return item?.booking?.color ?? "-";
      case 8:
        return item?.container_no ?? "-";
      case 9:
        return <Box className={item?.vcc?.id ? classes.anchorLink : ''} onClick={item?.vcc?.id ? () => handleClick(item) : () => { }}>
          <Typography className='pdf-table2' variant="body2">{item?.vcc?.vcc_declaration ?? "-"}</Typography>
        </Box>;
      case 10:
        return <Box className={classes.anchorLink} onClick={() => handleClick2(item)}>
          <Typography className='pdf-table2' variant="body2">{item?.vcc?.vcc_purpose ?? "-"}</Typography>
        </Box>;

      case 11:
        return item?.vcc?.vcc_date
          ? moment(item?.vcc?.vcc_date).format("MM-DD-YYYY")
          : "-";
      case 12:
        return item?.vcc?.vcc_expiry_date
          ? moment(item?.vcc?.vcc_expiry_date).format("MM-DD-YYYY")
          : "-";
      case 13:
        return item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : "-";
      case 14:
        return item?.vcc?.custom_charges_aed ?? "-";
      case 15:
        return item?.vcc?.vat_charges_aed ?? "-";
      case 16:
        return <Link className="pdf-hide" target="_blank" to={process.env.REACT_APP_IMAGE_BASE_URL + item.vcc?.vcc_doc}>
          <Typography variant="caption" sx={{ color: Colors.textSecondary, ':hover': { color: Colors.primary } }}>
            View Vcc
          </Typography>
        </Link>;
      case 17:
        return <Link className="pdf-hide" target="_blank" to={process.env.REACT_APP_IMAGE_BASE_URL + item.vcc?.vcc_declaration}>
          <Typography variant="caption" sx={{ color: Colors.textSecondary, ':hover': { color: Colors.primary } }}>
            View Declaration
          </Typography>
        </Link>;

      default:
        return "-";
    }
  };

  const downloadExcel = () => {
    // Define headers and data separately
    const headers = tableHead.filter((item) =>
      item !== "Select" && item !== "Attached Vcc" && item !== "Attached Declaration"
    );
    const rows = vehicleList?.map((item) => {
      const date = moment(item?.vcc?.vcc_expiry_date).format("MM-DD-YYYY");
      const targetDate = moment(date, "MM-DD-YYYY");
      let daysRemaining = targetDate.diff(moment(), "days");
      if (daysRemaining < 0) {
        daysRemaining = 0;
      }
      return [
        item?.vcc?.id ?? "-",
        item?.booking?.customer?.name ?? "-",
        item?.booking?.veh_make?.name ?? "-",
        item?.booking?.veh_model?.name ?? "-",
        item?.booking?.lot_number ?? "-",
        item?.booking?.vin ?? "-",
        item?.booking?.color ?? "-",
        item?.container_no ?? "-",
        item?.vcc?.vcc_declaration ?? "-",
        item?.vcc?.vcc_purpose ?? "-",
        item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format("MM-DD-YYYY") : "-",
        item?.vcc?.vcc_expiry_date ? moment(item?.vcc?.vcc_expiry_date).format("MM-DD-YYYY") : "-",
        item?.vcc?.vcc_expiry_date ? `${daysRemaining} days` : "-",
        item?.vcc?.custom_charges_aed ?? "-",
        item?.vcc?.vat_charges_aed ?? "-"
      ]
    });
    // Extract values from objects and create an array for each row

    // Create a workbook with a worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Convert the workbook to an array buffer
    const buf = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file using FileSaver.js
    saveAs(new Blob([buf]), "data.xlsx");
  };

  useEffect(() => {
    getVccVehicles();
  }, []);

  return (
    <Box sx={{ m: 4 }}>

      {/* ========== VCC Purpose ========== */}
      <SimpleDialog
        open={purposeDialog}
        onClose={() => setPurposeDialog(false)}
        title={"Select Purpose"}
      >
        <Box component="form" onSubmit={handleSubmit2(updatePurpose)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                label={'Select VCC Purpose'}
                options={VccPurpose}
                selected={selectedVccPurpose}
                onSelect={(value) => setSelectedVccPurpose(value)}
                error={errors2?.vccPurpose?.message}
                register={register2("vccPurpose", {
                  required: 'Please select vcc purpose.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <SimpleDialog
        open={purposeDialog}
        onClose={() => setPurposeDialog(false)}
        title={"Select Purpose"}
      >
        <Box component="form" onSubmit={handleSubmit2(updatePurpose)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                label={'Select VCC Purpose'}
                options={VccPurpose}
                selected={selectedVccPurpose}
                onSelect={(value) => setSelectedVccPurpose(value)}
                error={errors2?.vccPurpose?.message}
                register={register2("vccPurpose", {
                  required: 'Please select vcc purpose.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <SimpleDialog
        open={declarationDialog}
        onClose={() => setDeclarationDialog(false)}
        title={"Declaration Number"}
      >
        <Box component="form" onSubmit={handleSubmit4(updateDeclaration)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <InputField
                label={"Declaration Number"}
                placeholder={"Declaration Number"}
                multiline={true}
                error={errors4?.comment?.message}
                register={register4("comment", {
                  required: "Please enter comment.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Submit" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <Dialog
        open={vccDeclareDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "40%",
            height: "auto",
            borderRadius: 2,
            py: { xs: 2, md: 4 },
            px: { xs: 3, md: 6 },
          },
        }}
      >
        <IconButton
          onClick={() => {
            setVccDeclareDialog(false);
            handleCloseVccDialog();
          }}
          sx={{ position: "absolute", right: 13, top: 13 }}
        >
          <CancelOutlined />
        </IconButton>
        <Box>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              color: Colors.charcoalGrey,
              fontFamily: FontFamily.NunitoRegular,
              mt: 1,
              mb: 1.5,
            }}
          >
            Add VCC Declaration
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(declareVcc)}
            sx={{ mt: 4 }}
          >
            <Grid container spacing={1} alignItems={"flex-start"}>
              <Grid item xs={12} sm={12}>
                <InputField
                  size={"small"}
                  custom={{ color: '#323B4B' }}
                  label={"VCC Declaration"}
                  placeholder={"VCC Declaration"}
                  error={errors?.declaration?.message}
                  register={register("declaration", {
                    required: "Please enter vcc declaration.",
                  })}
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <DatePicker
                  size={"small"}
                  label={"Date"}
                  value={vccDate}
                  error={errors?.vccDate?.message}
                  register={register("vccDate", {
                    required: "Please enter date.",
                  })}
                  onChange={(date) => handleVccDate(date)}
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <DatePicker
                  disabled={true}
                  size={"small"}
                  label={"Expiry Date"}
                  value={new Date(moment(vccDate).add(150, "days"))}
                  disablePast={true}
                  register={register("vccExpDate")}
                  onChange={(date) => handleVccExpDate(date)}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                  Attach VCC
                </Typography>
                <UploadFile
                  custom={true}
                  style={{ backgroundColor: "#e7efeb", width: '100%', height: '60px', display: 'flex', justifyContent: 'space-between', padding: '20px', border: '1px dashed #aeb1b0', borderRadius: '10px' }}
                  accept={allowFilesType}
                  error={errors?.scanned?.message}
                  register={register("scanned", {
                    required: "Please attach VCC.",
                    onChange: (e) => handleUploadDocument(e)
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                {documentDetail.length > 0 &&
                  <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                    Uploaded Files
                  </Typography>
                }
                <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                  {documentDetail?.map((item, index) => (
                    <Uploading key={index} data={item} uploadedSize={uploadedSize} progress={progress} removeDoc={() => removeDoc()} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                  Attach Decelaration
                </Typography>
                <UploadFile
                  custom={true}
                  style={{ backgroundColor: "#e7efeb", width: '100%', height: '60px', display: 'flex', justifyContent: 'space-between', padding: '20px', border: '1px dashed #aeb1b0', borderRadius: '10px' }}
                  accept={allowFilesType}
                  error={errors?.scanned2?.message}
                  register={register("scanned2", {
                    required: "Please attach Decelaration.",
                    onChange: (e) => handleUploadDocument2(e)
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                {documentDetail2.length > 0 &&
                  <Typography variant="body1" sx={{ color: Colors.charcoalGrey, mb: 1 }}>
                    Uploaded Files
                  </Typography>
                }
                <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                  {documentDetail2?.map((item, index) => (
                    <Uploading key={index} data={item} uploadedSize={uploadedSize} progress={progress} removeDoc={() => removeDoc2()} />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
                <PrimaryButton
                  fullWidth={true}
                  title="Submit"
                  type={"submit"}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={vccVatChargesDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "40%",
            height: "auto",
            borderRadius: 2,
            py: { xs: 2, md: 4 },
            px: { xs: 3, md: 6 },
          },
        }}
      >
        <IconButton
          onClick={() => {
            setVccVatChargesDialog(false);
            reset3();
          }}
          sx={{ position: "absolute", right: 13, top: 13 }}
        >
          <CancelOutlined />
        </IconButton>
        <Box>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              color: Colors.charcoalGrey,
              fontFamily: FontFamily.NunitoRegular,
              mt: 1,
              mb: 1.5,
            }}
          >
            Custom VAT Charges
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit3(customVatCharges)}
            sx={{ mt: 4 }}
          >
            <Grid container spacing={1} alignItems={"flex-start"}>
              <Grid item xs={12} sm={12}>
                <InputField
                  size={"small"}
                  type={"number"}
                  label={"Custom Charges in AED"}
                  placeholder={"Custom Charges in AED"}
                  InputProps={{ inputProps: { min: 0 } }}
                  error={errors3?.customCharges?.message}
                  register={register3("customCharges", {
                    required: "Please enter custom charges.",
                    onChange: (e) => console.log(e.target.value),
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <InputField
                  size={"small"}
                  type={"number"}
                  label={"VAT Charges in AED"}
                  placeholder={"VAT Charges in AED"}
                  InputProps={{ inputProps: { min: 0 } }}
                  error={errors3?.vatCharges?.message}
                  register={register3("vatCharges", {
                    required: "Please enter vat charges.",
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
                <PrimaryButton
                  title="Submit"
                  type={"submit"}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Dialog>

      <Grid container spacing={1} alignItems={"center"} sx={{
        mr: 4,
        my: 4,
      }}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="h5"
            sx={{
              color: Colors.charcoalGrey,
              fontFamily: FontFamily.NunitoRegular,
            }}
          >
            Add VCC
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ textAlign: "right" }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {vehicleList?.length > 0 && (
              <Fragment>
                <PrimaryButton
                  title="Download Excel"
                  type="button"
                  style={{ backgroundColor: Colors.bluishCyan }}
                  onClick={() => downloadExcel()}
                />

                <PrimaryButton
                  title="Download PDF"
                  type="button"
                  style={{ backgroundColor: Colors.bluishCyan }}
                  onClick={() => handleExportWithComponent(contentRef)}
                />
              </Fragment>


            )}
            {permissions?.declare && (
              <PrimaryButton
                disabled={selectedVehicles.length > 0 ? false : true}
                title="Add"
                type="button"
                buttonStyle={{
                  justifyContent: "space-evenly",
                  path: { fill: Colors.white },
                }}
                startIcon={<VccIcon />}
                onClick={() => setVccDeclareDialog(true)}
              />

            )}
          </Box>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={3}>
            <InputField
              size={"small"}
              inputStyle={{ backgroundColor: '#f5f5f5' }}
              label={'Search'}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              placeholder={"Search"}
              register={register2("search", {
                onChange: (e) => handleFilter({ search: e.target.value }),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={"small"}
              label={"Container"}
              placeholder={"Container"}
              register={register2("container", {
                onChange: (e) => handleFilter({ container: e.target.value }),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={"small"}
              label={"VIN"}
              placeholder={"VIN"}
              register={register2("vin", {
                onChange: (e) => handleFilter({ vin: e.target.value }),
              })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <InputField
              size={"small"}
              label={"Lot"}
              placeholder={"Lot"}
              register={register2("lot", {
                onChange: (e) => handleFilter({ lot: e.target.value }),
              })}
            />
          </Grid>
        </Grid>


        <Grid item md={11}>
          {vehicleList && (
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
                        if (column !== "Select" && column !== "Status") {
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

              {vehicleList && (
                <Fragment>
                  <PDFExport ref={contentRef} landscape={true} paperSize="A4" margin={5} fileName="VCC" >
                    <Box className='pdf-show' sx={{ display: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
                          VCC
                        </Typography>
                        <Box sx={{ fontWeight: 400, fontSize: "12px", mt: 1.5, color: Colors.charcoalGrey, }}><span>Date: &nbsp;&nbsp;</span>{moment().format('MM-DD-YYYY')}</Box>
                      </Box>
                    </Box>
                    <TableContainer
                      component={Paper}
                      sx={{
                        boxShadow: "0px 8px 18px 0px #9B9B9B1A",
                        borderRadius: 2,
                        maxHeight: "calc(100vh - 330px)",
                      }}
                      className="table-box"
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        {/* Table Header */}
                        <TableHead className='pdf-table'>
                          <TableRow>
                            {visibleColumns.map((index) => (
                              <Cell className='pdf-table2' key={index}>{tableHead[index]}</Cell>
                            ))}
                          </TableRow>
                        </TableHead>

                        {/* Table Body */}
                        <TableBody>
                          {!loader ? (
                            vehicleList?.length > 0 ? (
                              <Fragment>
                                {vehicleList?.map((item, rowIndex) => {
                                  const isActive = true;
                                  return (
                                    <Row
                                      key={rowIndex}
                                      sx={{
                                        bgcolor: rowIndex % 2 !== 0 && "#EFF8E7",
                                      }}
                                    >
                                      {visibleColumns.map((colIndex) => (
                                        <Cell className='pdf-table2' key={colIndex}>
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
                              <Row>
                                <Cell
                                  colSpan={tableHead.length + 1}
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  No Data Found
                                </Cell>
                              </Row>
                            )
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={visibleColumns?.length + 2}
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
                  </PDFExport>
                  {/* ========== Pagination ========== */}
                  <Pagination
                    currentPage={currentPage}
                    pageSize={pageLimit}
                    onPageSizeChange={(size) =>
                      getVccVehicles(1, size.target.value)
                    }
                    tableCount={vehicleList?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVccVehicles(page, "")}
                  />
                </Fragment>
              )}

              {loader && <CircleLoading />}
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default CreateVcc;
