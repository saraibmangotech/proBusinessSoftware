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
  TextField,
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
import {
  Debounce,
  encryptData,
  formatPermissionData,
  handleExportWithComponent,
} from "utils";
import InputField from "components/Input";
import { Controller, useForm } from "react-hook-form";
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
import CommissionServices from "services/Commission";
import LabelCustomInput from "components/Input/LabelCustomInput";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { adjustSectionValue } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import VisaServices from "services/Visa";
import DatePicker from "components/DatePicker";
import SystemServices from "services/System";
import UploadFile from 'components/UploadFile';
import { CleanTypes, getFileSize } from 'utils';
import instance from 'config/axios';
import routes from 'services/System/routes';


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
    paddingLeft: '15px !important',
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

function VisaList() {
  const {
    register,
    handleSubmit,
    getValues,
    control,
    setValue,
    formState: { errors },
  } = useForm();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    getValues: getValues2,
    formState: { errors: errors2 },
  } = useForm();
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [document, setDocument] = useState(null);


  const allowFilesType = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/msword',
'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const tableHead = [
    { name: "VR No.", key: "" },
    { name: "Date", key: "created_at" },
    { name: "Customer", key: "created_at" },
    { name: "Visa Quantity", key: "visa_quantity" },
    { name: "Visa Rate", key: "visa_rate" },
    { name: "Status", key: "" },
    { name: "Actions", key: "" },
  ];
  //   state for visaprocessing use it later saraib
  //  const [visaprocessingList, setVisaProcessingList] = useState([])
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
        let maxSize= 10 * 1024 * 1024
        if (file.size > maxSize){
          showErrorToast('File Size Must Be Less than 10 MB')
        } 
        else{

          handleUpload(file, arr);
          const path = await handleUpload(file, arr);
          console.log('Uploaded file path:', path);
          console.log(path, 'pathpathpath');
          return path
        }
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
      console.log(file);
      const { data } = await instance.post(routes.uploadDocuments, formData, {
        onUploadProgress: (progressEvent) => {
          const uploadedBytes = progressEvent.loaded;
          const percentCompleted = Math.round(
            (uploadedBytes * 100) / progressEvent.total
          );

          setProgress(percentCompleted);
          console.log(getFileSize(uploadedBytes));
          setUploadedSize(getFileSize(uploadedBytes));
        },
      });
      if (data) {
        docs[0].isUpload = true;
        docs[0].file = data?.data?.nations;
        setSlipDetail(docs);
        console.log(data, 'asddasasd');
        return data?.data?.path

      }
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const visaprocessingList = [
    {
      vr_no: 2,
      date: moment(),
      customer: "Talha",
      visa_qnty: 2,
      visa_rate: 23,
      status: "active",
    },
    {
      vr_no: 2,
      date: moment(),
      customer: "Talha",
      visa_qnty: 2,
      visa_rate: 23,
      status: "active",
    },
    {
      vr_no: 2,
      date: moment(),
      customer: "Talha",
      visa_qnty: 2,
      visa_rate: 23,
      status: "active",
    },
  ];
  const [loader, setLoader] = useState(false);

  const [sort, setSort] = useState("asc");

  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([
    { id: 1, name: "asdasd" },
    { id: 1, name: "asdasd" },
  ]);

  // *For setPermissions
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisa, setSelectedVisa] = useState(null);


  const [itemAmount, setItemAmount] = useState();
  const [status, setStatus] = useState();
  const [date, setDate] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [visas, setVisas] = useState([])

  // *For Filters
  const [filters, setFilters] = useState({});

  // *For Permissions
  const [permissions, setPermissions] = useState();

  const [loading, setLoading] = useState(false);

  // *For Get Customer Queue

  const UpdateStatus = async () => {
    try {
      let obj = {

        general_status: status.id,
        visa_id: selectedVisa?.id,
      };

      const promise = VisaServices.updateStatus(obj);
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
        getVisaRequestList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UpdatePaymentStatus = async (formData) => {
    try {
      let obj = {
        payment_date: date,
        payment_type: paymentType?.name,
        visa_id: selectedVisa?.id,
        amount: formData?.amount,
        bank_id: selectedBank?.id,
        description: formData?.description,
      };

      const promise = VisaServices.updatePaymentStatus(obj);
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
        setPaymentDialog(false);
        // getVisaRequestList();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setDate("invalid");
        return;
      }
      setDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Customer Queue
  const getVisaRequestList = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit,
        processing_status:'Approved'
      }
      params = { ...params, ...Filter }

      const { data } = await VisaServices.getVisaRequestList(params)
      console.log(data?.rows);
      setVisas(data?.rows)
      setTotalCount(data?.count)
      console.log(formatPermissionData(data?.permissions)) 
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach(e => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      })

    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }

  // *For Handle Filter
  const handleFilter = () => {
    let data = {
      search: getValues("search"),
    };
    Debounce(() => getVisaRequestList(1, '', data));
  };

  const handleSort = (key) => {
    let data = {
      sort_by: key,
      sort_order: sort,
    };
    Debounce(() => getVisaRequestList(1, '', data));
  };
  useEffect(() => {
    getVisaRequestList()
  }, [])


  return (
    <Box sx={{ p: 3 }}>
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
                  { id: "Pending", name: "Pending" },
                  { id: "In Progress", name: "In Progress" },

                  { id: "Completed", name: "Completed" },


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
      {/* <SimpleDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        title={"Change Payment Status?"}
      >
        <Box component="form" onSubmit={handleSubmit2(UpdatePaymentStatus)}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <DatePicker
                label={"Payment Date :"}
                value={date}
                size={"small"}
                error={errors2?.date?.message}
                register={register2("date", {
                  required: "Please enter  date.",
                })}
                onChange={(date) => {
                  handleDate(date);
                  setValue2("date", date);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Payment Type :"}
                options={[
                  { id: "cash", name: "Cash" },
                  { id: "bank", name: "Bank" },
   { id: "cheque", name: "Cheque" },
                  { id: "cheque", name: "Cheque" },
                ]}
                selected={paymentType}
                onSelect={(value) => {
                  setPaymentType(value);
                }}
                error={errors2?.status?.message}
                register={register2("status", {
                  required: "Please select status.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <SelectField
                size={"small"}
                label={"Bank :"}
                options={banks}
                selected={selectedBank}
                onSelect={(value) => {
                  setSelectedBank(value);
                }}
                error={errors2?.banks?.message}
                register={register2("bank", {
                  required: "Please select bank.",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <LabelCustomInput
                label={"Amount : "}
                StartLabel={"AED"}
                register={register2("amount", {
                  required: "Enter year inside rate",
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <InputField
                label={"Description :"}
                size={"small"}
                rows={5}
                placeholder={"Description"}
                error={errors2?.description?.message}
                register={register2("description", {
                  required: false,
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
                  onClick={() => setPaymentDialog(false)}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog> */}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Visa Processing Management
        </Typography>
      </Box>

      {/* Filters */}
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <LabelCustomInput
              type={"text"}
              bgcolor={"#FAFAFA"}
              color={Colors.primary}
              border={"3px solid #FAFAFA"}
              StartLabel={"Search"}
              placeholder={"Search"}
              register={register("search")}
            />
          </Grid>
          {/* <Grid item xs={3} >
                        <LabelCustomInput type={'text'} bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Customers'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'3px solid #FAFAFA'} StartLabel={'By Commission'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid>
                    <Grid item xs={3} >
                        <LabelCustomInput bgcolor={'#FAFAFA'} color={Colors.primary} border={'2px solid #FAFAFA'} StartLabel={'By Date'} placeholder={'Enter Name'}   register={register("payroll")} />
                    </Grid> */}
          <Grid
            item
            xs={6}
            display={"flex"}
            justifyContent={"flex-end"}
            gap={2}
          >
            <PrimaryButton
              bgcolor={Colors.white}
              textcolor={Colors.primary}
              // border={`1px solid ${Colors.primary}`}
              title="Reset"
              // onClick={() => { getVisaRequestList(); setValue('search', '') }}
              loading={loading}
            />
            <PrimaryButton
              bgcolor={Colors.buttonBg}
              title="Search"
              onClick={() => handleFilter()}
              loading={loading}
            />
          </Grid>
        </Grid>

        <Grid item md={11}>
          {visas && (
            <Box>
              <Grid container mb={2}></Grid>

              {visas && (
                <Fragment>
                  <PDFExport
                    ref={contentRef}
                    landscape={true}
                    paperSize="A4"
                    margin={5}
                    fileName="Import Customers"
                  >
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: "calc(100vh - 200px)",
                        mt: 5,
                        backgroundColor: "transparent",
                        boxShadow: "none !important",
                        borderRadius: "0px !important",
                      }}
                    >
                      <Table stickyHeader sx={{ minWidth: 500 }}>
                        <TableHead>
                          <Row>
                            {tableHead.map((cell, index) => (
                              <Cell
                                style={{
                                  textAlign:
                                    cell?.name == "VR No." ? "center" : "left",
                                  paddingRight:
                                    cell?.name == "VR No." ? "10px" : "50px",
                                }}
                                className="pdf-table"
                                key={index}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                  }}
                                >
                                  {cell?.name}{" "}
                                  {cell?.name == "Date" && (
                                    <>
                                      &nbsp;
                                      <span
                                        style={{
                                          height: "20px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Box
                                          component={"img"}
                                          onClick={() => {
                                            setSort(
                                              sort == "asc" ? "desc" : "asc"
                                            );
                                            handleSort(cell?.key);
                                          }}
                                          src={Images.sortIcon}
                                          width={"18px"}
                                        ></Box>
                                      </span>
                                    </>
                                  )}
                                </Box>
                              </Cell>
                            ))}
                          </Row>
                        </TableHead>
                        <TableBody>
                          {visas.length > 0 && visas?.map((item, index) => {
                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: "1px solid #EEEEEE !important",
                                }}
                              >
                                <Cell
                                  style={{ textAlign: "center" }}
                                  className="pdf-table"
                                >
                                  {item?.id}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {moment(item?.created_at).format("MM-DD-YYYY")}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.customer?.name}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.candidates_count}
                                </Cell>
                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  {item?.total_visa_charges ? item?.total_visa_charges : '0'}
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  <Box
                                    component={"div"}
                                    sx={{ cursor: "pointer" ,display:'flex !important',justifyContent:'flex-start !important' }}
                                    onClick={() => {
                                      if(permissions?.processing_status_update){
                                        setStatusDialog(true);
                                        setSelectedVisa(item);

                                      }
                                    }}
                                  >
                                    <Box
                                      component={"img"}
                                      src={
                                        item?.general_status == "Pending" ?
                                          Images.orangeCircle :
                                          item?.general_status == "Completed" ? Images.successIcon :
                                            Images.pendingIcon

                                      }
                                      width={"13px"}
                                    ></Box>
                                    {item?.general_status ? item?.general_status : 'Pending'}
                                  </Box>
                                </Cell>

                                <Cell
                                  style={{ textAlign: "left" }}
                                  className="pdf-table"
                                >
                                  <Box>
                                  { permissions?.processing_details && <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/visa-detail/${item?.id}`)} width={'35px'}></Box>}

                                    {/* <Box
                                      component={"img"}
                                      src={Images.editIcon}
                                      width={"35px"}
                                    ></Box> */}
                                    {/* <Box
                                      component={"img"}
                                      src={Images.deleteIcon}
                                      width={"35px"}
                                    ></Box> */}
                                   {permissions?.processing_invoice && <Box component={'img'} onClick={() => navigate(`/view-invoice/${item?.id}`)} sx={{ cursor: "pointer" }} src={Images.invoiceIcon} width={'35px'}></Box>}
                                    {/* <Box component={'img'} sx={{ cursor: "pointer" }} src={Images.editIcon} width={'35px'}></Box>
                                                                        <Box component={'img'} src={Images.deleteIcon} width={'35px'}></Box> */}
                                  </Box>
                                </Cell>
                              </Row>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </PDFExport>
                  {/* ========== Pagination ========== */}
                  <Pagination
                    currentPage={currentPage}
                    pageSize={pageLimit}
                    onPageSizeChange={(size) => getVisaRequestList(1, size.target.value)}
                    tableCount={visas?.length}
                    totalCount={totalCount}
                    onPageChange={(page) => getVisaRequestList(page, "")}
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

export default VisaList;
