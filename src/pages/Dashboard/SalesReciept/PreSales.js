import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
  IconButton,
  CircularProgress,
  Chip,
  Grid,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Tooltip,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import {
  AllocateIcon,
  CheckIcon,
  EyeIcon,
  FontFamily,
  Images,
  MessageIcon,
  PendingIcon,
  RequestBuyerIdIcon,
} from "assets";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import Colors from "assets/Style/Colors";
import { CircleLoading } from "components/Loaders";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import FinanceStatusDialog from "components/Dialog/FinanceStatusDialog";
import AllocateStatusDialog from "components/Dialog/AllocateStatusDialog";
import AllocateDialog from "components/Dialog/AllocateDialog";
import CustomerServices from "services/Customer";
import { makeStyles } from "@mui/styles";
import Pagination from "components/Pagination";
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  Debounce,
  encryptData,
  formatPermissionData,
  handleExportWithComponent,
} from "utils";
import InputField from "components/Input";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addPermission } from "redux/slices/navigationDataSlice";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { PrimaryButton } from "components/Buttons";
import SelectField from "components/Select";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PDFExport } from "@progress/kendo-react-pdf";
import moment from "moment";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import DataTable from "components/DataTable";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // for invoice
import PaymentIcon from "@mui/icons-material/Payment"; // for payment receipt
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Barcode from "react-barcode";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",
    border: "1px solid #EEEEEE",
    padding: "15px",
    textAlign: "left",
    whiteSpace: "nowrap",
    color: "#434343",
    paddingRight: "50px",
    background: "transparent",
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: "Public Sans",

    textWrap: "nowrap",
    padding: "5px !important",
    paddingLeft: "15px !important",

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

function PreSalesList() {
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [tableLoader, setTableLoader] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm();

  const tableHead = [
    { name: "SR No.", key: "" },
    { name: "Customer ", key: "name" },
    { name: "Registration Date", key: "visa_eligibility" },
    { name: "Deposit Amount", key: "deposit_total" },
    { name: "Status", key: "" },
    { name: "Actions", key: "" },
  ];

  const [loader, setLoader] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState(false);

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);
  const [payReceiptData, setPayReceiptData] = useState([]);
  const [invoiceData2, setInvoiceData2] = useState(null)
  console.log(payReceiptData, "payReceiptData");
  const [data, setData] = useState([]);

  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const [invoiceData, setInvoiceData] = useState(null);

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("desc");
  const invoiceRef = useRef(null);
  const invoiceRef2 = useRef(null);
  const invoiceRef3 = useRef(null);
  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    // Temporarily hide the content while generating the PDF
    const invoiceElement = invoiceRef.current;
    invoiceElement.style.display = "block";

    // Capture the content using html2canvas
    const canvas = await html2canvas(invoiceElement, {
      scale: 1,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the generated PDF
    pdf.save("service_request.pdf");

    // Restore the content visibility after generating the PDF
    invoiceElement.style.display = "none"; // Show the content again
  };
  const generatePDF2 = async () => {
    if (!invoiceRef2.current) return;

    // Temporarily hide the content while generating the PDF
    const invoiceElement = invoiceRef2.current;
    invoiceElement.style.display = "block"; // Hide the element

    // Capture the content using html2canvas
    const canvas = await html2canvas(invoiceElement, {
      scale: 1,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the generated PDF
    pdf.save("invoice.pdf");

    // Restore the content visibility after generating the PDF
    invoiceElement.style.display = "none"; // Show the content again
  };

  const generatePDF3 = async () => {
    if (!invoiceRef3.current) return;

    // Temporarily hide the content while generating the PDF
    const invoiceElement = invoiceRef3.current;
    invoiceElement.style.display = "block"; // Hide the element

    // Capture the content using html2canvas
    const canvas = await html2canvas(invoiceElement, {
      scale: 1,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the generated PDF
    pdf.save("tax_invoice.pdf");

    // Restore the content visibility after generating the PDF
    invoiceElement.style.display = "none"; // Show the content again
  };

  const getData2 = async (id) => {
    try {
      let params = {
        id: id,
      };

      const { data } = await CustomerServices.getPreSaleDetail(params);
      console.log(data?.receipt);
      let invoice = {
        date: moment(data?.receipt?.date).format("DD-MM-YYYY"),
        invoiceType: data?.receipt?.invoice_number,
        id: data?.receipt?.id,
        trn: data?.receipt?.trn,
        tokenNumber: data?.receipt?.token_number,
        email:data?.receipt?.customer_email,
        customerName: data?.receipt?.customer_name,
        mobileNo: data?.receipt?.customer_mobile,
        customerReference: data?.receipt?.ref,
        customerAddress: data?.receipt?.customer_address,
        items: data?.receipt?.sale_receipt_items,
        totalSales: 367.25,
        netTaxableAmount: 27.5,
        totalVAT: 1.38,
        grossTotal: 396.13,
        customerCardPayment: 0.0,
        totalPayable: 396.13,
        total_amount: data?.receipt?.total_amount,
        payment_mode: data?.receipt?.payment_mode
      };
      setInvoiceData2(invoice);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // *For Get Customer Queue
  const getCustomerQueue = async (page, limit, filter) => {
    setLoader(true);

    try {
      let params = {
        is_presale: true,
      };

      const { data } = await CustomerServices.getPreSales(params);
      setData(data?.rows);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoader(false);
    }
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getCustomerQueue(1, "", data));
  };
  const getData = async (id) => {
    try {
      let params = {
        id: id,
      };

      const { data } = await CustomerServices.getPreSaleDetail(params);
      console.log(data?.receipt);
      let invoice = {
        date: moment(data?.receipt?.date).format("DD-MM-YYYY"),
        invoiceType: data?.receipt?.invoice_number,

        trn: data?.receipt?.trn,
        tokenNumber: data?.receipt?.token_number,
        customerName: data?.receipt?.customer_name,
        mobileNo: data?.receipt?.customer_mobile,
        email: data?.receipt?.customer_email,
        customerReference: data?.receipt?.ref,
        customerAddress: data?.receipt?.customer_address,
        items: data?.receipt?.sale_receipt_items,
        totalSales: 367.25,
        netTaxableAmount: 27.5,
        totalVAT: 1.38,
        grossTotal: 396.13,
        customerCardPayment: 0.0,
        totalPayable: 396.13,
      };
      setInvoiceData(invoice);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // *For Handle Filter

  const handleFilter = () => {
    let data = {
      search: getValues("search"),
    };
    Debounce(() => getCustomerQueue(1, "", data));
  };
  const handleDelete = async (item) => {
    try {
      let params = {
        id: selectedData?.id,
      };

      const { message } = await CustomerServices.DeletePreSale(params);

      SuccessToaster(message);
      getCustomerQueue();
    } catch (error) {
      showErrorToast(error);
    } finally {
      // setLoader(false)
    }
  };
  const UpdateStatus = async () => {
    try {
      let obj = {
        customer_id: selectedData?.id,
        is_active: status?.id,
      };

      const promise = CustomerServices.CustomerStatus(obj);
      console.log(promise);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      if (response?.responseCode === 200) {
        setStatusDialog(false);
        setStatus(null);
        getCustomerQueue();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (invoiceData2) {
      generatePDF3();
    }
  }, [invoiceData2]);
  const columns = [
    {
      header: "SR No.",
      accessorKey: "id",
    },
    {
      header: "Customer",
      accessorKey: "customer_name",
    },
    {
      header: "Token Number",
      accessorKey: "token_number",
    },
    {
      header: "Total Amount",
      accessorKey: "total_amount",
    },
    {
      header: "Payment Status",
      accessorKey: "is_paid",
      cell: ({ row }) => (
        <Box variant="contained" sx={{ display: "flex", gap: 2 }}>
          {row?.original?.is_paid == null
            ? "Unpaid"
            : row?.original?.is_paid == false
              ? "Credit"
              : "Paid"}
        </Box>
      ),
    },

    {
      header: "Created By",
      accessorKey: "creator",
      accessorFn: (row) => row?.creator,
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {row?.original?.creator?.name}
        </Box>
      ),
    },
    {
      id: "created_at",
      header: "Created At",
      // Remove accessorKey and fix accessorFn to use row directly
      accessorFn: (row) => moment(row.created_at).format("MM-DD-YYYY"),
      cell: ({ row }) => (
        <Box
          variant="contained"
          color="primary"
          sx={{ cursor: "pointer", display: "flex", gap: 2 }}
        >
          {moment(row.original.created_at).format("MM-DD-YYYY")}
        </Box>
      ),
    },

    {
      header: "Actions",
      cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {row?.original?.is_paid && <Box
            component={"img"}
            sx={{ cursor: "pointer" }}
            onClick={() => {
              navigate(`/update-presale/${row?.original?.id}`);
              localStorage.setItem("currentUrl", "/update-customer");
            }}
            src={Images.editIcon}
            width={"35px"}
          ></Box>}
          <Box>
            {!row?.original?.is_paid && (
              <Box
                sx={{ cursor: "pointer", mt: 1 }}
                component={"img"}
                src={Images.deleteIcon}
                onClick={() => {
                  setSelectedData(row?.original);
                  setConfirmationDialog(true);
                }}
                width={"35px"}
              ></Box>
            )}
          </Box>
          {row?.original?.is_paid && (
            <Tooltip title=" Invoice">
              <IconButton
                onClick={() => {
                  getData2(row?.original?.id);
                }}
                sx={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                  border: "1px solid #eee",
                  width: 40,
                  height: 40,
                }}
              >
                <ReceiptIcon color="black" fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Box>
            <Tooltip title="Sales Request">
              <IconButton
                onClick={() => {
                  getData(row?.original?.id);
                }}
                sx={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                  border: "1px solid #eee",
                  width: 40,
                  height: 40,
                }}
              >
                <ReceiptLongIcon color="black" fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Payment Receipt Button */}
          <Box>
            {row?.original?.is_paid && <Tooltip title="Payment Receipt">
              <IconButton
                onClick={() => {
                  if (row?.original?.is_paid == true) {
                    setPayReceiptData(row?.original);
                    Debounce(() => generatePDF2());
                  }
                }}
                sx={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                  border: "1px solid #eee",
                  width: 40,
                  height: 40,
                }}
              >
                <PaymentIcon color="black" fontSize="small" />
              </IconButton>
            </Tooltip>}
          </Box>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    if (invoiceData) {
      generatePDF();
    }
  }, [invoiceData]);

  useEffect(() => {
    getCustomerQueue();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        message={"Are You Sure?"}
        action={() => {
          setConfirmationDialog(false);
          handleDelete();
        }}
      />
      <SimpleDialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        title={"Change Status?"}
      >
        <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Select Status :"}
                options={[
                  { id: false, name: "Disabled" },
                  { id: true, name: "Enabled" },
                ]}
                selected={status}
                onSelect={(value) => {
                  setStatus(value);
                }}
                error={errors?.status?.message}
                register={register("status", {
                  required: "Please select status.",
                })}
              />
            </Grid>
            <Grid container sx={{ justifyContent: "center" }}>
              <Grid
                item
                xs={6}
                sm={6}
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "25px",
                }}
              >
                <PrimaryButton
                  bgcolor={Colors.primary}
                  title="Yes,Confirm"
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => setStatusDialog(false)}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          {" "}
          Sales List
        </Typography>
        {true && (
          <PrimaryButton
            bgcolor={"#bd9b4a"}
            title="Create"
            onClick={() => {
              navigate("/sales-receipt");
              localStorage.setItem("currentUrl", "/create-customer");
            }}
            loading={loading}
          />
        )}
      </Box>

      {/* Filters */}
      <Box>{<DataTable loading={loader} data={data} columns={columns} />}</Box>
      <Box className="showPdf" ref={invoiceRef} sx={{ padding: "20px 60px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', border: '1px solid black', marginBottom: 4, padding: '10px' }}>
          <img
            src={Images.headerRightImage}
            alt="Header"
            style={{ width: '180px' }}

          />
          <img
            src={Images.headerLeftImage}
            alt="Header"
            style={{ width: '150px' }}

          />
        </div>
        <p
          variant="body2"
          style={{
            fontWeight: "bold",
            fontSize: "20px",
            margin: 0,
            textAlign: 'center',
            textDecoration: 'underline',
            marginTop: '40px',
            marginBottom: '40px',
          }}
        >
          SERVICE REQUEST    طلب الخدمة
        </p>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000",
            my: 2,
            fontSize: "15px",
          }}
        >
          <Box
            sx={{
              width: "50%",
              p: 2,
              borderRight: "1px solid #000",
              display: "flex",
              flexDirection: "column",
            }}
          >


            <Grid container spacing={1}>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Invoice Type - Invoice No نوع الفاتورة - رقم الفاتورة
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.invoiceType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  Date/التاريخ والوقت
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.date}
                </Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Typist)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Typist
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Cashier)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Cashier
                </Typography>
              </Grid> */}



              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Token Number رقم الرمز المميز
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.tokenNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "50%", p: 2 }}>
            <Grid item xs={6}>
              <p
                variant="body2"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  margin: 0,
                  // textAlign:"center",
                  // marginBottom:2
                }}
              >
                Customer Information معلومات المتعاملين
              </p>
            </Grid>


            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                    // textAlign:"center",
                    // marginBottom:2
                  }}
                >
                  Name / الاسم
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.customerName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Phone/ الهاتف رق
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.mobileNo}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Email / الالكتروني البريد
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.email}
                </Typography>
              </Grid>


              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Customer Address عنوان العميل

                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.customerAddress}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  TRN:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData?.trn}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ my: 5 }}>
          <p
            variant="h6"
            style={{
              fontSize: "15px",
            }}
          >
            Particulars تفاصيل
          </p>

          <table className="mytable" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "transparent" }}>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "5%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Sl.No الرقم</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "30%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Service - الخدمات</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "8%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Qty - الكمية</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "18%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Govt Fee and Bank Charge - الرسوم الحكومية
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Service Charge Taxable - تكلفة الخدمة
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Tax Amt - قيمة المضافة</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Total - الإجمالي بالدرهم</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData?.items?.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item?.id}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {item?.service?.name}

                      </span>
                      <span style={{ fontSize: "12px" }}>
                        {item.service?.name_ar}
                      </span>

                    </div>
                    <span style={{ fontSize: "12px" }}>
                      {item?.application_id}
                      {item?.transaction_id && ` || ${item.transaction_id}`}
                      {item?.ref_id && ` || ${item.ref_id}`}
                    </span>

                    {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                          {item?.details}
                        </p> */}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {(
                      parseFloat(item?.govt_fee || 0) +
                      parseFloat(item?.bank_charge || 0)
                    ).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.center_fee).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(parseFloat(item?.center_fee) * 0.05).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.total).toFixed(2)}
                  </td>
                </tr>

              ))}
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    Total Govt.fee & Bank Charge إجمالي الرسوم الحكومية ورسوم البنك
                  </p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "8%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {invoiceData?.items
                      ?.reduce(
                        (total, item) =>
                          parseFloat(total) +
                          parseFloat(item?.govt_fee ?? 0) +
                          parseFloat(item?.bank_charge ?? 0),
                        0
                      )
                      ?.toFixed(2)}
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>Net Taxable Amount صافي المبلغ الخاضع للضريبة</p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {invoiceData?.items
                      ?.reduce(
                        (total, item) =>
                          total + parseFloat(item?.center_fee ?? 0),
                        0
                      ).toFixed(2)
                    }
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}> Total VAT إجمالي القيمة المضافة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {parseFloat(invoiceData?.items
                      ?.reduce(
                        (total, item) =>
                          total + parseFloat(item?.center_fee ?? 0),
                        0
                      ) * 0.05).toFixed(2)}
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Gross Total إجمالي القيمة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {parseFloat(invoiceData?.items
                      ?.reduce(
                        (total2, item) =>
                          parseFloat(total2) + parseFloat(item?.total ?? 0),
                        0
                      )
                      + parseFloat(invoiceData?.items
                        ?.reduce(
                          (total, item) =>
                            total + parseFloat(item?.center_fee ?? 0),
                          0
                        ) * 0.05)).toFixed(2)}
                  </p>
                </td>
              </tr>

              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Total Payable الإجمالي</p>

                </td>
                <td
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {parseFloat(invoiceData?.items
                      ?.reduce(
                        (total2, item) =>
                          parseFloat(total2) + parseFloat(item?.total ?? 0),
                        0
                      )
                      + parseFloat(invoiceData?.items
                        ?.reduce(
                          (total, item) =>
                            total + parseFloat(item?.center_fee ?? 0),
                          0
                        ) * 0.05)).toFixed(2)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>


        </Box>
        <Box class="footer" style={{ marginTop: '250px' }}>
          <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "200px" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box textAlign="center">

                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Authorized Signatory - المخول بالتوقيع
                </p>

              </Box>

              <Box textAlign="right" sx={{ fontSize: "12px" }}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Note - ملاحظات
                </p>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                </p>
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px" }}>
                  Kindly check the invoice and documents before leaving the
                  counter
                </Typography>
              </Box>
            </Box>


          </Box>

          <div className="w-full h-[115px] flex justify-center items-center mb-4 mt-4" >
            <img
              src={Images.footer}
              alt="Header"
              style={{ width: "100%" }}
              className="max-w-full h-auto"
            />
          </div>
          < hr style={{ color: 'black !important' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "15px", textAlign: 'right' }}
          >
            Powered By : MangoTechDevs.ae
          </Typography>
        </Box>
      </Box>

      <Box className="showPdf2" ref={invoiceRef2} sx={{ padding: "20px 60px" }}>
        <div className="w-full h-[115px] flex justify-center items-center mb-4">
          <img
            src={Images.header}
            alt="Header"
            style={{ width: "100%" }}
            className="max-w-full h-auto"
          />
        </div>
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <p
            variant="h6"
            style={{
              fontSize: "25px",
              fontWeight: "bold",
              fontFamily: "Atlassian Sans",
            }}
          >
            RECEIPT - الإيصال
          </p>
        </Box>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000",
            my: 2,
            fontSize: "15px",
          }}
        >
          <Box
            sx={{
              width: "50%",
              p: 2,
              borderRight: "1px solid #000",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  Receipt No
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {"RC" + payReceiptData?.id}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Customer/المتعامل
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.customer_name}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Payment Cash Method/طريقة الدفع
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.payment_mode}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Into Account/داخل الحساب
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Cashier
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "50%", p: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Payment Date
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {moment(payReceiptData?.paid_date).format(
                    "DD-MM-YYYY hh:mm:ss a"
                  )}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Printed at
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {moment().format("DD-MM-YYYY hh:mm:ss a")}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Mobile No./رقم الهاتف المتحرك
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {payReceiptData?.customer_mobile}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    fontFamily: "Atlassian Sans",
                    margin: "2px",
                  }}
                >
                  Remarks/ملاحظات
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  {/* {invoiceData.customerAddress} */}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ my: 5 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Sl.No الرقم
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Barcode الخدمات
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Invoice No الكمية
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  Invoice Amount تلفة المعاملة
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  This Alloc هذا التخصيص
                </th>
              </tr>
            </thead>
            <tbody>
              {/* {invoiceData.items.map((item) => ( */}
              <tr>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  1
                </td>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        margin: "0 auto",
                      }}
                    >
                      <Barcode
                        value={payReceiptData?.id}
                        width={1.4}
                        height={40}
                        displayValue={false}
                      />
                      <Typography variant="body2" sx={{ fontSize: "15px" }}>
                        {payReceiptData?.id}
                      </Typography>
                    </Box>
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {payReceiptData?.invoice_number}
                </td>

                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}
                </td>
              </tr>
              {/* ))} */}
            </tbody>
          </table>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "right",
                  }}
                >
                  TOTAL RECEIPT AMOUNT
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}

                  {/* {invoiceData.totalSales.toFixed(2)} */}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  TOTAL COLLECTED AMOUNT
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}

                  {/* {invoiceData.netTaxableAmount.toFixed(2)} */}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "right",
                  }}
                >
                  ALLOCATED AMOUNT
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "center",
                  }}
                >
                  {parseFloat(payReceiptData?.total_amount)?.toFixed(2)}

                  {/* {invoiceData.totalVAT.toFixed(2)} */}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "right",
                  }}
                >
                  BALANCE
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "center",
                  }}
                >
                  {payReceiptData?.balance_amount
                    ? parseFloat(payReceiptData?.balance_amount).toFixed(2)
                    : "0.00"}

                  {/* {invoiceData.grossTotal.toFixed(2)} */}
                </td>
              </tr>

              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.01rem",
                    textAlign: "center",
                  }}
                >
                  This receipt is generated electronically - تم دفع إلكترونيا
                  المعاملة
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
        <Box class="footer" style={{ paddingTop: "100px" }}>
          <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "100px" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box textAlign="center">
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: "15px" }}
                >
                  Muhammad Ahsan{" "}
                </Typography>
                <p
                  variant="body2"
                  style={{
                    fontSize: "15px",
                    margin: "2px",
                  }}
                >
                  Authorized Signatory
                </p>
                <p
                  variant="body2"
                  style={{
                    fontSize: "15px",
                    margin: "2px",
                  }}
                >
                  المخول بالتوقيع
                </p>
              </Box>

              <Box textAlign="right" sx={{ fontSize: "12px" }}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "15px",
                    margin: "2px",
                  }}
                >
                  الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                </p>
                <p
                  variant="body2"
                  dir="ltr"
                  style={{ fontSize: "15px", margin: "2px" }}
                >
                  Kindly check the invoice and documents before leaving the
                  counter
                </p>
              </Box>
            </Box>
          </Box>

          <div className="w-full h-[115px] flex justify-center items-center mb-4">
            <img
              src={Images.footer}
              alt="Header"
              style={{ width: "100%" }}
              className="max-w-full h-auto"
            />
          </div>
          < hr style={{ color: 'black !important' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "15px", textAlign: 'right' }}
          >
            Powered By : MangoTechDevs.ae
          </Typography>
        </Box>
      </Box>
      <Box className="showPdf" ref={invoiceRef3} sx={{ padding: "20px 60px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', border: '1px solid black', marginBottom: 4, padding: '10px' }}>
          <img
            src={Images.headerRightImage}
            alt="Header"
            style={{ width: '180px' }}

          />
          <img
            src={Images.headerLeftImage}
            alt="Header"
            style={{ width: '150px' }}

          />
        </div>
        <p
          variant="body2"
          style={{
            fontWeight: "bold",
            fontSize: "20px",
            margin: 0,
            textAlign: 'center',
            textDecoration: 'underline',
            marginTop: '40px',
            marginBottom: '40px',
          }}
        >
          TAX INVOICE / طلب الخدمة
        </p>
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000",
            my: 2,
            fontSize: "15px",
          }}
        >
          <Box
            sx={{
              width: "50%",
              p: 2,
              borderRight: "1px solid #000",
              display: "flex",
              flexDirection: "column",
            }}
          >


            <Grid container spacing={1}>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Invoice Type - Invoice No نوع الفاتورة - رقم الفاتورة
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.invoiceType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  Date/التاريخ والوقت
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.date}
                </Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Typist)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Typist
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "15px" }}
                >
                  Name Of Employee (Cashier)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "15px" }}>
                  Cashier
                </Typography>
              </Grid> */}



              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Token Number رقم الرمز المميز
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.tokenNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ width: "50%", p: 2 }}>
            <Grid item xs={6}>
              <p
                variant="body2"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  margin: 0,
                  // textAlign:"center",
                  // marginBottom:2
                }}
              >
                Customer Information معلومات المتعاملين
              </p>
            </Grid>


            <Grid container spacing={1}>
              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                    // textAlign:"center",
                    // marginBottom:2
                  }}
                >
                  Name / الاسم
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.customerName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Phone/ الهاتف رق
                </p>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.mobileNo}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Email / الالكتروني البريد
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.email}
                </Typography>
              </Grid>


              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  Customer Address عنوان العميل

                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.customerAddress}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  TRN:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontSize: "12px" }}>
                  {invoiceData2?.trn}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ my: 5 }}>
          <p
            variant="h6"
            style={{
              fontSize: "15px",
            }}
          >
            Particulars تفاصيل
          </p>

          <table className="mytable" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "transparent" }}>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "5%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Sl.No الرقم</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "30%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Service - الخدمات</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "8%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black', }}>Qty - الكمية</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "18%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Govt Fee and Bank Charge - الرسوم الحكومية
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>
                    Service Charge Taxable - تكلفة الخدمة
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Tax Amt - قيمة المضافة</p>
                </th>
                <th
                  style={{
                    border: "1px solid black !important",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px", color: 'black' }}>Total - الإجمالي بالدرهم</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceData2?.items?.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item?.id}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {item?.service?.name}

                      </span>
                      <span style={{ fontSize: "12px" }}>
                        {item.service?.name_ar}
                      </span>

                    </div>
                    <span style={{ fontSize: "12px" }}>
                      {item?.application_id}
                      {item?.transaction_id && ` || ${item.transaction_id}`}
                      {item?.ref_id && ` || ${item.ref_id}`}
                    </span>

                    {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                          {item?.details}
                        </p> */}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {(
                      parseFloat(item?.govt_fee || 0) +
                      parseFloat(item?.bank_charge || 0)
                    ).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.center_fee).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(parseFloat(item?.center_fee) * 0.05).toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black !important",
                      padding: "8px",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {parseFloat(item?.total).toFixed(2)}
                  </td>
                </tr>

              ))}
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    Total Govt.fee & Bank Charge إجمالي الرسوم الحكومية ورسوم البنك
                  </p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "8%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {invoiceData2?.items
                      ?.reduce(
                        (total, item) =>
                          parseFloat(total) +
                          parseFloat(item?.govt_fee ?? 0) +
                          parseFloat(item?.bank_charge ?? 0),
                        0
                      )
                      ?.toFixed(2)}
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>Net Taxable Amount صافي المبلغ الخاضع للضريبة</p>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {invoiceData2?.items
                      ?.reduce(
                        (total, item) =>
                          total + parseFloat(item?.center_fee ?? 0),
                        0
                      ).toFixed(2)
                    }
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}> Total VAT إجمالي القيمة المضافة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {parseFloat(invoiceData2?.items
                      ?.reduce(
                        (total, item) =>
                          total + parseFloat(item?.center_fee ?? 0),
                        0
                      ) * 0.05).toFixed(2)}
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Gross Total إجمالي القيمة</p>

                </td>
                <td
                  align="center"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>
                    {parseFloat(invoiceData2?.items
                      ?.reduce(
                        (total2, item) =>
                          parseFloat(total2) + parseFloat(item?.total ?? 0),
                        0
                      )
                      + parseFloat(invoiceData2?.items
                        ?.reduce(
                          (total, item) =>
                            total + parseFloat(item?.center_fee ?? 0),
                          0
                        ) * 0.05)).toFixed(2)}
                  </p>
                </td>
              </tr>

              <tr>
                <td
                  colSpan={6}
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "right",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 'bold' }}>     Total Payable الإجمالي</p>

                </td>
                <td
                  align="right"
                  style={{
                    border: "1px solid #000",
                    padding: "0.5rem",
                    textAlign: "center",
                    width: "10%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {parseFloat(invoiceData2?.items
                      ?.reduce(
                        (total2, item) =>
                          parseFloat(total2) + parseFloat(item?.total ?? 0),
                        0
                      )
                      + parseFloat(invoiceData2?.items
                        ?.reduce(
                          (total, item) =>
                            total + parseFloat(item?.center_fee ?? 0),
                          0
                        ) * 0.05)).toFixed(2)}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="mytable" style={{ width: "100%", borderCollapse: "collapse", marginTop: '100px' }}>
            <thead>
              <tr style={{ backgroundColor: "transparent" }}>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "5%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>Receipt No.</p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "30%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>Date </p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "8%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>Amount</p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "18%",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    Collected  By
                  </p>
                </th>
                <th
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    width: "15%",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    Payment Mode
                  </p>
                </th>

              </tr>
            </thead>
            <tbody>

              <tr >
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {invoiceData2?.id}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {invoiceData2?.date}
                  </div>
                  {/* <p style={{ fontSize: "9px", textAlign: "left" }}>
                                {item?.details}
                              </p> */}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  {invoiceData2?.total_amount}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  Cashier
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  {invoiceData2?.payment_mode}
                </td>

              </tr>

            </tbody>
          </table>
        </Box>
        <Box class="footer" style={{ marginTop: '0px' }}>
          <Box textAlign="center" pb={2} sx={{ my: "60px", mt: "100px" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box textAlign="center">

                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Authorized Signatory - المخول بالتوقيع
                </p>

              </Box>

              <Box textAlign="right" sx={{ fontSize: "12px" }}>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Note - ملاحظات
                </p>
                <p
                  variant="body2"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  الرجاء التأكد من الفاتورة والمستندات قبل مغادرة الكاونتر
                </p>
                <Typography variant="body2" dir="ltr" sx={{ fontSize: "12px" }}>
                  Kindly check the invoice and documents before leaving the
                  counter
                </Typography>
              </Box>
            </Box>


          </Box>

          <div className="w-full h-[115px] flex justify-center items-center mb-4 mt-4" >
            <img
              src={Images.footer}
              alt="Header"
              style={{ width: "100%" }}
              className="max-w-full h-auto"
            />
          </div>
          < hr style={{ color: 'black !important' }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "15px", textAlign: 'right' }}
          >
            Powered By : MangoTechDevs.ae
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default PreSalesList;
