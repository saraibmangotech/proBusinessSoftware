import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import CustomerServices from "services/Customer";
import SelectField from "components/Select";
import SystemServices from "services/System";
import { PrimaryButton } from "components/Buttons";
import InputPhone from "components/InputPhone";
import DatePicker from "components/DatePicker";
import UploadedFile from "components/UploadedFile";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import AuthServices from "services/Auth";
import UserServices from "services/User";
import { getValue } from "@testing-library/user-event/dist/utils";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import VisaServices from "services/Visa";
import { CircleLoading } from "components/Loaders";
import { PDFExport } from "@progress/kendo-react-pdf";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DeleteIcon from "@mui/icons-material/Delete";
import { CleanTypes, getFileSize } from "utils";

import EditIcon from "@mui/icons-material/Edit";
import moment from "moment";
import styled from "@emotion/styled";
import { handleDownload } from "utils";
import { baseUrl } from "config/axios";
import axios from "axios";
import ExportServices from "services/Export";
import { useAuth } from "context/UseContext";
import UploadFileSingle from "components/UploadFileSingle";
import SimpleDialog from "components/Dialog/SimpleDialog";
import instance from "config/axios";
import routes from "services/System/routes";

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
    paddingLeft: "15px !important",
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

function CandidateDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  console.log(state);
  const navigate = useNavigate();
  // const tableHead1 = [
  //     { name: 'Date ', key: 'name' },
  //     { name: 'Status', key: 'visa_eligibility' },
  //      { name: 'Document', key: 'deposit_total' },

  //     ]
  const tableHead1 = [
    { name: "Date", key: "date" },
    { name: "Status", key: "visa_eligibility" },
    { name: "Document", key: "deposit_total" },
    { name: "Action", key: "deposit_total" },
  ];
  const tableHead2 = [
    { name: "Date", key: "date" },
    { name: "Status", key: "visa_eligibility" },
    { name: "Document", key: "deposit_total" },
  ];

  const allowFilesType = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const {
    register,
    handleSubmit,
    getValues,

    control,
    setValue,
    formState: { errors },
  } = useForm();
  const [loader, setLoader] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [candidateDetail, setCandidateDetail] = useState();
  const [visaCopy, setVisaCopy] = useState(null);
  const [emiratesCopy, setEmiratesCopy] = useState(null);
  const [document, setDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const docRef = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [slipDetail, setSlipDetail] = useState([]);
  const [docs, setDocs] = useState([]);
  const [documentId, setDocumentId] = useState("");
  const [selectedCanndidate, setSelectedCanndidate] = useState(null);
  console.log(document)

  const DeleteStatus = async (item) => {
    console.log(item);

    try {
      let obj = {
        id: item?.id,
        candidate_id: candidateDetail?.id,
        candidate_name: candidateDetail?.name,
        visa_id: candidateDetail?.visa_id,
        visa_charges: candidateDetail?.visa_charges,
        status: item?.status,
      };

      const promise = VisaServices.DeleteStatus(obj);

      showPromiseToast(
        promise,
        "Saving...",
        "Added Successfully",
        "Something Went Wrong"
      );

      // Await the promise and then check its response
      const response = await promise;
      console.log(response);
      setStatuses(response?.data?.statuses?.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.log(error);
    }
  };

  // *For Get Customer Detail
  const getCandidateDetail = async () => {
    try {
      let params = { candidate_id: id };
      const { data } = await CustomerServices.getCandidateDetail(params);
      console.log(data);
      setCandidateDetail(data);
    
      console.log(
        data?.statuses?.find((item) => item?.status == "Complete (EID)")
      );
      setVisaCopy(
        data?.statuses?.find((item) => item?.status == "Stamping")?.document
      );

      setEmiratesCopy(
        data?.statuses?.find((item) => item?.status == "Complete (EID)")
          ?.document
      );

      setStatuses(data?.statuses?.sort((a, b) => a.id - b.id));
   


      const processedDocuments =
        data?.documents?.map((doc) => ({
          ...doc,
          paths: doc.path ? doc.path.split(",") : [], // Split the path by commas
        })) || [];
      console.log(processedDocuments);

      setDocs(processedDocuments);
    } catch (error) {
      showErrorToast(error);
    }
  };
  useEffect(() => {
    getCandidateDetail();
  }, []);

 

  const handleUploadDocument = async (e) => {
    try {
      e.preventDefault();
      const inputElement = e.target;
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
        let maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          showErrorToast("File Size Must Be Less than 10 MB");
        } else {
          const path = await handleUpload(file, arr);

          return path;
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

        return data?.data?.path;
      }
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const downloadAll = async () => {
    try {
      //   // Assuming `ExportServices.getAllDoc` returns the URL of the document
      //   const data = await ExportServices.getAllDoc(
      //     candidateDetail?.documents[0]?.reference,
      //     candidateDetail?.documents[0]?.reference_id
      //   );
      window.open(
        process.env.REACT_APP_BASE_URL +
          `/system/downloadZip?reference=${candidateDetail?.documents[0]?.reference}&reference_id=${candidateDetail?.documents[0]?.reference_id}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error fetching the document:", error);
    }
  };

  const updateDocument = async() => {
    const params= {
        id:documentId,
        document:document
    }
    try{
        const  data  = await VisaServices.UpdateStatusDocument(params);
        console.log(data)
        SuccessToaster(data?.message)
        setOpenEditDialog(false)
        getCandidateDetail()
    }catch(error){
        ErrorToaster(error)
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
          CANDIDATE DETAIL
        </Typography>
        <PrimaryButton
          title="Back"
          style={{ backgroundColor: Colors.greyShade }}
          onClick={() => navigate(-1)}
        />
      </Box>

      <Box p={2}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            {/* Security Deposit Section */}
            <Grid item xs={12} sm={6}>
              <Box mb={2} mt={2}>
                <Typography
                  mb={2}
                  mt={2}
                  sx={{ color: "#03091A", fontWeight: "bold" }}
                  variant="h6"
                >
                  {" "}
                  Details :
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Passport Name :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.name}
                  </span>
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Email :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.email}
                  </span>
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Phone Number :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.phone}
                  </span>
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Employee ID :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.employee_id}
                  </span>
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Nationality :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.nationality?.name}
                  </span>
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Visa Designation :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.visa_designation}
                  </span>
                </Typography>
                <Typography mb={2} mt={2} variant="body1">
                  Passport Number :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.passport_number}
                  </span>
                </Typography>
                {
                  <Typography mb={2} mt={2} variant="body1">
                    Passport Expiry :{" "}
                    <span style={{ color: "#0F2772" }}>
                      {moment(candidateDetail?.passport_expiry).format(
                        "MM-DD-YYYY"
                      )}{" "}
                    </span>
                  </Typography>
                }
                {/* <Typography mb={2} mt={2} variant="body1">Guarantor Name: <span style={{ color: "#0F2772" }}>{visaDetail?.total_deposit_charges} </span></Typography>
                            <Typography mb={2} mt={2} variant="body1">Guarantor Number: <span style={{ color: "#0F2772" }}>{visaDetail?.total_deposit_charges} <sub>AED</sub></span></Typography> */}
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography
                mb={2}
                mt={2}
                sx={{ color: "#03091A", fontWeight: "bold" }}
                variant="h6"
              >
                Job Details :
              </Typography>

              <Typography mb={2} mt={2} variant="body1">
                Basic Salary :{" "}
                <span style={{ color: "#0F2772" }}>
                  {candidateDetail?.salary_basic}
                </span>
                <sub>AED</sub>
              </Typography>
              <Typography mb={2} mt={2} variant="body1">
                Allowance :{" "}
                <span style={{ color: "#0F2772" }}>
                  {candidateDetail?.salary_allowance}
                </span>
                <sub>AED</sub>
              </Typography>
              <Typography mb={2} mt={2} variant="body1">
                Total Salary :{" "}
                <span style={{ color: "#0F2772" }}>
                  {candidateDetail?.salary_total}
                </span>
                <sub>AED</sub>
              </Typography>
              {/* {<Typography mb={2} mt={2} variant="body1">End Consumer : <span style={{ color: "#0F2772" }}>{candidateDetail?.end_consumer}</span></Typography>} */}
              {candidateDetail?.end_consumer_company && (
                <Typography mb={2} mt={2} variant="body1">
                  End Consumer Company:{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.end_consumer_company}{" "}
                  </span>
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography
                mb={2}
                mt={2}
                sx={{ color: "#03091A", fontWeight: "bold" }}
                variant="h6"
              >
                Visa Details :
              </Typography>
              <Typography mb={2} mt={2} variant="body1">
                Visa Type :{" "}
                <span style={{ color: "#0F2772" }}>
                  {candidateDetail?.visa_type}
                </span>
              </Typography>
              <Typography mb={2} mt={2} variant="body1">
                Visa Tenure :{" "}
                <span style={{ color: "#0F2772" }}>
                  {candidateDetail?.visa_tenure}
                </span>
              </Typography>
              {candidateDetail?.visa_type == "In" ? (
                <Typography mb={2} mt={2} variant="body1">
                  Inside Rate :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.inside_rate}
                  </span>
                  <sub>AED</sub>
                </Typography>
              ) : (
                <Typography mb={2} mt={2} variant="body1">
                  Outside Rate :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.outside_rate}
                  </span>
                  <sub>AED</sub>
                </Typography>
              )}
              {/* <Typography mb={2} mt={2} variant="body1">Renewal Rate : <span style={{ color: "#0F2772" }}>{candidateDetail?.renewal_rate}</span><sub>AED</sub></Typography> */}
              {candidateDetail?.vip_medical_extra && (
                <Typography mb={2} mt={2} variant="body1">
                  Vip Medical Charges :{" "}
                  <span style={{ color: "#0F2772" }}>
                    {candidateDetail?.vip_medical_extra
                      ? candidateDetail?.vip_medical_extra
                      : 0}
                  </span>
                  <sub>AED</sub>
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              {visaCopy && (
                <>
                  {" "}
                  <Typography
                    mb={2}
                    mt={2}
                    sx={{ fontWeight: "bold" }}
                    variant="body1"
                  >
                    Visa Copy :
                  </Typography>
                  <Box
                    component={"div"}
                    sx={{ width: "30%", cursor: "pointer" }}
                    onClick={() => {
                      if (
                        visaCopy?.split("_").pop().includes("doc") ||
                        visaCopy?.split("_").pop().includes("xls")
                      ) {
                        handleDownload(visaCopy, visaCopy?.split("_").pop());
                      } else {
                        window.open(
                          process.env.REACT_APP_IMAGE_BASE_URL + visaCopy,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Box>
                      {visaCopy ? (
                        <Box
                          component={"img"}
                          src={Images.docIcon}
                          width={"35px"}
                        />
                      ) : (
                        <DoDisturbIcon
                          sx={{ fontSize: "35px", color: "gray" }}
                        />
                      )}
                    </Box>
                    <Link rel="noopener noreferrer">
                      {visaCopy?.split("_").pop()}
                    </Link>
                  </Box>
                </>
              )}
            </Box>
            <Box>
              {emiratesCopy && (
                <>
                  <Typography
                    mb={2}
                    mt={2}
                    sx={{ fontWeight: "bold" }}
                    variant="body1"
                  >
                    Emirates Copy :
                  </Typography>
                  <Box
                    component={"div"}
                    sx={{ width: "30%", cursor: "pointer" }}
                    onClick={() => {
                      if (
                        emiratesCopy?.split("_").pop().includes("doc") ||
                        emiratesCopy?.split("_").pop().includes("xls")
                      ) {
                        handleDownload(
                          emiratesCopy,
                          emiratesCopy?.split("_").pop()
                        );
                      } else {
                        window.open(
                          process.env.REACT_APP_IMAGE_BASE_URL + emiratesCopy,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Box>
                      {emiratesCopy ? (
                        <Box
                          component={"img"}
                          src={Images.docIcon}
                          width={"35px"}
                        />
                      ) : (
                        <DoDisturbIcon
                          sx={{ fontSize: "35px", color: "gray" }}
                        />
                      )}
                    </Box>
                    <Link rel="noopener noreferrer">
                      {emiratesCopy?.split("_").pop()}
                    </Link>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
        {docs?.length > 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                mb={2}
                mt={2}
                sx={{ color: "#03091A", fontWeight: "bold" }}
                variant="h6"
              >
                Documents :
              </Typography>
              <Box
                sx={{
                  background: Colors.DarkBlue,
                  color: Colors.white,
                  padding: "8px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                onClick={downloadAll}
              >
                {" "}
                Download All
              </Box>
            </Box>
          </>
        )}
        <Grid container spacing={2} mt={2}>
          {docs
            ?.sort((a, b) => (a.path ? 0 : 1) - (b.path ? 0 : 1)) // Sort documents with empty path last
            .map((doc, index) => (
              <>
                <Grid
                  item
                  md={6}
                  lg={6}
                  sx={{ cursor: "pointer", paddingTop: "35px !important" }}
                  component={"div"}

                  // Use index2 instead of index to avoid duplicate keys
                >
                  {/* Conditionally render name only for the first doc */}
                  {
                    <>
                      <Box sx={{ fontSize: "15px", fontWeight: "bold" }}>
                        {doc?.name}
                      </Box>
                      {doc.paths.length > 0 && doc?.expiry_date != null && (
                        <Box sx={{ mt: 1, fontSize: "13px" }}>
                          <span
                            style={{ color: Colors.gray, fontWeight: "bold" }}
                          >
                            Expiry Date :{" "}
                          </span>
                          <span>
                            {moment(doc?.expiry_date).format("YYYY-MM-DD")}
                          </span>
                        </Box>
                      )}
                    </>
                  }
                  <Box
                    sx={{
                      display: "flex",
                      gap: "10px",
                      mt: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    {doc?.paths.length > 0 ? (
                      doc?.paths.map((item, index2) => {
                        return (
                          <>
                            <Box
                              component={"div"}
                              sx={{ width: "30%" }}
                              onClick={() => {
                                if (
                                  item.split("_").pop().includes("doc") ||
                                  item.split("_").pop().includes("xls")
                                ) {
                                  handleDownload(item, item.split("_").pop());
                                } else {
                                  window.open(
                                    process.env.REACT_APP_IMAGE_BASE_URL + item,
                                    "_blank"
                                  );
                                }
                              }}
                            >
                              <Box key={index2}>
                                {item ? (
                                  <Box
                                    component={"img"}
                                    src={Images.docIcon}
                                    width={"35px"}
                                  />
                                ) : (
                                  <DoDisturbIcon
                                    sx={{ fontSize: "35px", color: "gray" }}
                                  />
                                )}
                              </Box>
                              <Link rel="noopener noreferrer">
                                {item.split("_").pop()}
                              </Link>
                            </Box>
                          </>
                        );
                      })
                    ) : (
                      <DoDisturbIcon sx={{ fontSize: "35px", color: "gray" }} />
                    )}
                  </Box>
                </Grid>
              </>
            ))}
        </Grid>

        <Grid container mt={2}>
          <Grid item md={12}>
            {
              <Box>
                {statuses?.length > 0 && (
                  <Typography
                    mb={2}
                    mt={2}
                    sx={{ color: "#03091A", fontWeight: "bold" }}
                    variant="h6"
                  >
                    Status History :
                  </Typography>
                )}

                {statuses?.length > 0 && (
                  <Fragment>
                    <PDFExport
                      landscape={true}
                      paperSize="A4"
                      margin={5}
                      fileName="Import Customers"
                    >
                      <TableContainer
                        component={Paper}
                        sx={{
                          maxHeight: "calc(100vh - 200px)",
                          backgroundColor: "transparent",
                          boxShadow: "none !important",
                          borderRadius: "0px !important",
                        }}
                      >
                        <Table stickyHeader sx={{ minWidth: 500 }}>
                          <TableHead>
                            <Row>
                              {user?.user_type == "C"
                                ? tableHead2.map((cell, index) => (
                                    <Cell
                                      style={{ textAlign: "center" }}
                                      className="pdf-table"
                                      key={index}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "flex-end",
                                        }}
                                      >
                                        {cell?.name}
                                      </Box>
                                    </Cell>
                                  ))
                                : tableHead1.map((cell, index) => (
                                    <Cell
                                      style={{ textAlign: "center" }}
                                      className="pdf-table"
                                      key={index}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "flex-end",
                                        }}
                                      >
                                        {cell?.name}
                                      </Box>
                                    </Cell>
                                  ))}
                            </Row>
                          </TableHead>
                          <TableBody>
                            {statuses &&
                              statuses?.map((item, index) => {
                                let statusLength = index + 1;
                                return (
                                  <Row
                                    key={index}
                                    sx={{
                                      border: "1px solid #EEEEEE !important",
                                    }}
                                  >
                                    <Cell
                                      style={{ textAlign: "left" }}
                                      className="pdf-table"
                                    >
                                      {item?.date
                                        ? moment(item?.date).format(
                                            "MM-DD-YYYY"
                                          )
                                        : moment(item?.createdAt).format(
                                            "MM-DD-YYYY"
                                          )}
                                    </Cell>
                                    <Cell
                                      style={{ textAlign: "left" }}
                                      className="pdf-table"
                                    >
                                      <Box
                                        component={"div"}
                                        sx={{
                                          cursor: "pointer",
                                          display: "flex !important",
                                          justifyContent:
                                            "flex-start !important",
                                        }}
                                      >
                                        <Box
                                          component={"img"}
                                          src={
                                            item?.status == "Medical"
                                              ? Images.blueCircle
                                              : item?.status == "Stamping"
                                              ? Images.successIcon
                                              : item?.status == "Emirates Id"
                                              ? Images.lightGreenCircle
                                              : item?.status == "Entry permit "
                                              ? Images.pendingIcon
                                              : Images.orangeCircle
                                          }
                                          width={"13px"}
                                        ></Box>
                                        {item?.status}
                                      </Box>
                                    </Cell>
                                    <Cell
                                      style={{ textAlign: "left" }}
                                      className="pdf-table"
                                    >
                                      <>
                                        {item?.document && (
                                          <Grid
                                            item
                                            md={6}
                                            lg={4}
                                            sx={{
                                              cursor: "pointer",
                                              display: "flex",
                                              gap: "5px",
                                            }}
                                            component={"div"}
                                            onClick={() => {
                                              if (
                                                item?.document
                                                  ?.split("_")
                                                  .pop()
                                                  .includes("doc") ||
                                                item?.document
                                                  ?.split("_")
                                                  .pop()
                                                  .includes("xls")
                                              ) {
                                                handleDownload(
                                                  item?.document,
                                                  item?.document
                                                    ?.split("_")
                                                    .pop()
                                                );
                                              } else {
                                                window.open(
                                                  process.env
                                                    .REACT_APP_IMAGE_BASE_URL +
                                                    item?.document,
                                                  "_blank"
                                                );
                                              }
                                            }}
                                            key={index}
                                          >
                                            {item?.document && (
                                              <Box>
                                                <Box
                                                  component={"img"}
                                                  src={Images.docIcon}
                                                  width={"25px"}
                                                />
                                              </Box>
                                            )}
                                            <p
                                              style={{
                                                textAlign: "center",
                                                lineHeight: "20px",
                                                color: "#0F2772",
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                              }}
                                            >
                                              {item?.document?.split("_").pop()}
                                            </p>
                                          </Grid>
                                        )}
                                      </>
                                    </Cell>
                                    {user?.user_type !== "C" && (
                                      <Cell
                                        style={{ textAlign: "left" }}
                                        className="pdf-table"
                                      >
                                        <IconButton
                                          onClick={() =>{
                                            setDocumentId(item?.id)
                                             setDocument(item?.document)
                                              setOpenEditDialog(true)
                                            }
                                          }
                                        >
                                          <EditIcon
                                            sx={{ cursor: "pointer" }}
                                          />
                                        </IconButton>
                                        {statuses.length == statusLength &&
                                          statusLength != 1 && (
                                            <IconButton
                                              onClick={() => DeleteStatus(item)}
                                            >
                                              <DeleteIcon
                                                sx={{ cursor: "pointer" }}
                                              />
                                            </IconButton>
                                          )}
                                      </Cell>
                                    )}
                                  </Row>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </PDFExport>
                  </Fragment>
                )}

                {loader && <CircleLoading />}
              </Box>
            }
          </Grid>
        </Grid>
      </Box>

      <SimpleDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title={"Update Document"}
      >
        <Box component="form" onSubmit={handleSubmit(updateDocument)}>
          <Grid container>
            <Grid item mt={2} xs={12}>
              <Box sx={{ fontWeight: "bold" }}>"Upload Document"</Box>
              <UploadFileSingle
                Memo={true}
                accept={allowFilesType}
                className={"validationClass"}
                error={errors?.document?.message}
                disabled={isUploading}
                inputRef={docRef}
                file={document}
                register={register("document", {
                  required: !docRef.current ? "upload document" : false,
                  onChange: async (e) => {
                    setIsUploading(true);
                    if (e.target.files.length === 0) {
                      setDocument(null);
                      setIsUploading(false);
                      return;
                    }
                    const path = await handleUploadDocument(e);
                    if (path) {
                      setDocument(path);
                      setIsUploading(false);
                    }
                  },
                })}
              />
            </Grid>
            <Grid container sx={{ justifyContent: "center", mt: 2 }}>
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
                  disabled={disabled}
                  className="disbaledClass"
                  bgcolor={Colors.primary}
                  title={isUploading ? <CircularProgress size={20} /> :"Upload"} 
                  type="submit"
                />
                <PrimaryButton
                  onClick={() => setOpenEditDialog(false)}
                  bgcolor={"#FF1F25"}
                  title="No,Cancel"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
    </Box>
  );
}

export default CandidateDetail;
