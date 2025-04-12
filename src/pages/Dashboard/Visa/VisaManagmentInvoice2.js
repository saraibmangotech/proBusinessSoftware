import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { PDFExport } from "@progress/kendo-react-pdf";
import styled from "@emotion/styled";
import Colors from "assets/Style/Colors";
import { handleExportWithComponent, handleExportWithComponent2 } from "utils";
import VisaServices from "services/Visa";
import { useNavigate, useParams } from "react-router-dom";
import { showErrorToast } from "components/NewToaster";
import moment from "moment";
import { Images } from "assets";

// Header and Footer Styles
const HeaderTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  color: "#2c5b8f",
  textAlign: "center",
}));

function VisaInvoice() {
  let serialNumber = 0; // Initialize index
  let serialNumberNew = 0; // Initialize index
  const contentRef = useRef(null);
  const contentRef2 = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [previewLoader, setPreviewLoader] = useState(false)
  const [detail, setDetail] = useState();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalTax, setTotalTax] = useState(0);

  const calculateTotalTax = (candidates) => {
    return candidates.reduce((totalTax, candidate) => {
      const visaCharges = parseFloat(candidate.visa_charges);
      const tax = visaCharges * 0.05;
      return totalTax + tax;
    }, 0);
  };

  const getVisaDetail = async () => {
    try {
      const { data } = await VisaServices.getVisaDetail({ visa_id: id });
      setDetail(data?.details);
      setCandidates(data?.details?.candidates);
      const totalTax = calculateTotalTax(data?.details?.candidates);
      setTotalTax(totalTax);
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (id) getVisaDetail();
  }, [id]);

  function chunkCandidates(candidates, baseChunkSize) {
    const chunks = [];
    let currentChunk = [];

    for (let i = 0; i < candidates?.length; i++) {
      currentChunk.push(candidates[i]);

      // Check if we've reached the base chunk size
      if (currentChunk.length === baseChunkSize) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    }

    // Handle the last chunk
    if (currentChunk.length > 0) {
      if (currentChunk.length > 7) {
        // If last chunk has more than 7 candidates, move the rest to a new page
        chunks.push(currentChunk.slice(0, 7));
        chunks.push(currentChunk.slice(7));
      } else {
        // If last chunk has 7 or fewer candidates, keep it as is
        chunks.push(currentChunk);
      }
    }

    return chunks;
  }

  const chunks = chunkCandidates(candidates, 14);

  const pageTemplate = ({ pageNum, totalPages }) => {
    return (
      <>
        {/* Header */}
        <Box
          style={{
            position: "absolute",
            top: "20px",
            left: "0",
            right: "0",
            textAlign: "center",

            paddingLeft: "10px",
          }}
        >
          <Box
            style={{
              alignItems: "center",
            }}
          >
            <Box>
              <img
                style={{ width: "300px", height: "20px" }}
                src={Images.pdfLogo}
              />
              <Box
                style={{
                  color: "#155368",
                  flexDirection: "column",
                }}
              >
                <Typography
                  style={{
                    textAlign: "center",
                  }}
                >
                  <span className="pdf-myfont" style={{ display: "block", color: "#155368 !important", fontWeight: "bold", }}>MABDE TRADING L.L.C</span>
                </Typography>
                <Typography
                  className="pdf-myfont"
                  style={{
                    color: "#155368",
                    fontWeight: "bold",
                    textAlign: "center",

                  }}
                >
                  <span className="pdf-myfont" style={{ display: "block", color: "#155368 !important" }}>
                    TEL: 04-3400000, FAX: 04-3488448
                  </span>
                </Typography>
                <Typography
                  className="pdf-myfont"
                  style={{
                    color: "#155368",
                    fontWeight: "bold",

                    textAlign: "center",
                  }}
                >
                  <span className="pdf-myfont" style={{ display: "block", color: "#155368 !important" }}>
                    P.O.BOX 81, DUBAI, UAE
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bill To Section */}
          <Box component={'div'} mb={2} style={{ marginLeft: '25px' }}>
            <Typography
              className="pdf-myfont"
              style={{
                border: "2px solid black",
                fontWeight: "bold",
                width: "100px",
                textAlign: "center",

              }}
            >
              Bill To:
            </Typography>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  className="pdf-myfont"
                  style={{
                    fontWeight: "bold !important",
                    marginTop: "24px !important",
                    textAlign: "left !important",
                  }}
                >
                  {detail?.customer?.name}
                </Typography>
                {/* Address and Invoice Details */}

                <Box
                  mb={2}
                  component={'div'}
                  className="pdf-myfont"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    
                  }}
                >
                  <Box style={{ textAlign: "left !important"}}>
                    <Typography className="pdf-myfont">{detail?.customer?.address}</Typography>
                    <Typography className="pdf-myfont" style={{ mt: 1 }}>
                      Vat number:{detail?.customer?.vat_no}
                    </Typography>
                  </Box>

                </Box>
              </Box>
              <Box style={{ textAlign: "left !important", marginRight: '35px', marginTop: '15px' }}>
                <Typography className="pdf-myfont" style={{ fontWeight: "bold !important" }}>
                  Tax Invoice Number: MT/VR/{id}
                </Typography>
                <Typography className="pdf-myfont" style={{ mt: 1 }}>
                  Vat Reg. No. 100511270900003
                </Typography>
                <Typography
                  className="pdf-myfont"
                  style={{
                    fontWeight: "bold !important",
                    marginTop: "16px !important",
                  }}
                >
                  Date: {moment(detail?.created_at).format("DD-MM-YYYY")}
                </Typography>
                <Typography
                  className="pdf-myfont"
                  style={{
                    fontWeight: "bold !important",
                    marginTop: "16px !important",
                  }}
                >
                  Description: <span style={{ fontWeight: "400 !important", }}>Visa Processing Charges</span>
                </Typography>
              </Box>
            </Box>
          </Box>



          <Box className="pdf-center" style={{ textAlign: "center" }} mb={1}>
            <Typography
              className="pdf-myfont"
              style={{
                fontSize: "15px !important",
                fontWeight: "bold !important",

                letterSpacing: "5px",
                textAlign: "center",
                marginLeft: (detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid') ? "50px !important" : '90px !important',

              }}
            >
              {detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid' ? "TAX INVOICE" : "PERFORMA INVOICE"}
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        {<>
          {pageNum == totalPages && <Box
            style={{
              position: "absolute",
              bottom: "5px",
              left: "0",
              right: "0",
              textAlign: "center",
              paddingLeft: "30px",
            }}
          >
            <Box
              component={'div'}
              id="pdf-padding"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                margin: "12px",
                marginTop: "25px !important"
              }}
            >
              <Box style={{ textAlign: "left !important" }}>

                <Typography

                  className="pdf_font"
                  component={"span"}
                  style={{ display: "inline-block", width: "120px" }}
                >
                  Account Name:
                </Typography>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{
                    display: "inline-block",
                    fontWeight: "bold !important",
                  }}
                >
                  MABDE TRADING LLC
                </Typography>
              </Box>
              <Box style={{ textAlign: "left !important" }}>

                <Typography

                  className="pdf_font"
                  component={"span"}
                  style={{ display: "inline-block", width: "120px" }}
                >
                  Account #:
                </Typography>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{
                    display: "inline-block",
                    fontWeight: "bold !important",
                  }}
                >
                  0332676739001
                </Typography>
              </Box>
              <Box style={{ textAlign: "left !important" }}>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{ display: "inline-block", width: "120px" }}
                >
                  Bank details:
                </Typography>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{
                    display: "inline-block",
                    fontWeight: "bold !important",
                  }}
                >
                  The National Bank of Ras Al Khaimah
                </Typography>
              </Box>
              <Box style={{ textAlign: "left !important" }}>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{ display: "inline-block", width: "120px" }}
                >
                  Branch:
                </Typography>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{
                    display: "inline-block",
                    fontWeight: "bold !important",
                  }}
                >
                  Umm Hurair.
                </Typography>
              </Box>
              <Box style={{ textAlign: "left !important" }}>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{ display: "inline-block", width: "120px" }}
                >
                  Iban:
                </Typography>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{
                    display: "inline-block",
                    fontWeight: "bold !important",
                  }}
                >
                  AE540400000332676739001
                </Typography>
              </Box>
              <Box style={{ textAlign: "left !important" }}>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{ display: "inline-block", width: "120px" }}
                >
                  Swift Code:
                </Typography>
                <Typography
                  className="pdf_font"
                  component={"span"}
                  style={{
                    display: "inline-block",
                    fontWeight: "bold !important",
                  }}
                >
                  NRAKAEAK.
                </Typography>
              </Box>
            </Box>

            {/* Terms and Conditions */}
            <Box style={{ textAlign: "left !important", margin: '12px' }}>
              <Typography className="pdf-myfont" style={{ color: `${Colors.danger} !important` }}>
                Terms & Conditions:
              </Typography>
              <Typography className="pdf-myfont">Immediate payment.</Typography>
            </Box>

            {/* Signature Section */}
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", margin: '12px'
              }}
            >
              <Box>
                <Typography className="pdf-myfont">Authorized Signature</Typography>
                <Typography className="pdf-myfont" style={{ color: '#155368 !important', fontWeight: "bold" }}>
                  MABDE TRADING LLC.
                </Typography>
              </Box>
              {/* <Box component={'div'} style={{ width: "35%" }}>
              <Typography
                className="pdf-myfont"
                style={{

                  fontWeight: "bold",
                  textAlign: "center",
                  margin: '5px',
                  marginRight: '12px !important',
                  color: '#155368 !important'
                }}
              >
                TEL: 04/3440000 FAX: 04/3448488
              </Typography>
              <Typography
                className="pdf-myfont"
                style={{

                  fontWeight: "bold",
                  textAlign: "center",
                  color: '#155368 !important'
                }}
              >
                P.O.BOX: 51 DUBAI, U.A.E
              </Typography>

            </Box> */}
            </Box>
          </Box>}
          <Typography
            className="pdf-myfont"
            style={{
              color: Colors.primary,
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            Page {pageNum}/{totalPages}
          </Typography>
        </>
        }
      </>
    );
  };

  return (
    <Box style={{ p: 3 }}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 2, p: 3 }}
      >
        <Typography className="pdf-myfont" style={{ fontSize: "24px", fontWeight: "bold" }}>
          {detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid' ? "Invoice" : "Performa Invoice"}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            sx={{
              border: "2px solid rgba(229, 37, 42, 1)",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "rgba(229, 37, 42, 1)",
              backgroundColor: "rgba(229, 37, 42, 0.1)",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => { handleExportWithComponent(contentRef); serialNumber = 0 }}
            endIcon={
              <img
                src={Images.pdfImg}
                alt="PDF Icon"
                style={{ width: "18px", height: "23px", marginLeft: "6px" }}
              />
            }
          >
            Download PDF
          </Button>
          <Button
            sx={{
              border: "2px solid rgba(229, 37, 42, 1)",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "rgba(229, 37, 42, 1)",
              backgroundColor: "rgba(229, 37, 42, 0.1)",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => {
              serialNumberNew = 0
              setPreviewLoader(true)
              handleExportWithComponent2(contentRef2)
             
              setTimeout(() => {
                setPreviewLoader(false)
              }, "10000");
            }}
            endIcon={
              <img
                src={Images.pdfImg}
                alt="PDF Icon"
                style={{ width: "18px", height: "23px", marginLeft: "6px" }}
              />
            }
          >

            {previewLoader ? <Box sx={{ padding: '0px 38px', display: 'flex' }}><CircularProgress sx={{ color: 'red' }} size={20} /></Box> : 'Preview PDF'}
          </Button>
        </Box>
      </Box>
      <Box>
        <PDFExport
          ref={contentRef}
          paperSize="A4"
          margin={40}

          fileName="Visa Invoice"
          pageTemplate={pageTemplate}
        >
          <Box id="pdf_data">
            {chunks.map((chunk, index) => (
              <Box key={index} style={{ pageBreakAfter: "always" }}>
                {/* Table */}
                <TableContainer id="pd-mytable">
                  <Table>
                    <TableHead>
                      <TableRow id="table-header">
                        <TableCell
                          id="table-cell-new"
                          className="pdf-col pdf-myfont"

                        >
                          Sr No
                        </TableCell>
                        <TableCell id="table-cell-new">Candidate</TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Passport#
                        </TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Visa Rate
                        </TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Tax
                        </TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Total
                        </TableCell>
                        {/* <TableCell id="table-cell-new ">Amount AED</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>


                      {chunk.map((row) => (
                        <TableRow id="table-header" >
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {++serialNumber}
                          </TableCell>
                          <TableCell id="table-cell-new" className="pdf-myfont">
                            {row?.name}-{row?.visa_tenure}-{row?.visa_type}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {row?.passport_number}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {parseFloat(parseFloat(row?.visa_charges)).toFixed(2)}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {parseFloat(parseFloat(row?.visa_charges) * 0.05).toFixed(2)}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {parseFloat(parseFloat(row?.visa_charges) + parseFloat(row?.visa_charges) * 0.05).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}

                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>

          <Box id="pdf_data" className="pdf_margin">
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new" className="pdf-myfont">Sub Total</TableCell>
                    <TableCell id="table-cell-new" className="pdf-myfont">
                      {" "}
                      {parseFloat(
                        parseFloat(detail?.total_visa_charges)
                      ).toFixed(2)}{" "}
                      AED
                    </TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new" className="pdf-myfont">Total Tax</TableCell>
                    <TableCell id="table-cell-new" className="pdf-myfont">
                      {parseFloat(totalTax).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new" className="pdf-myfont">Total</TableCell>
                    <TableCell id="table-cell-new" className="pdf-myfont">
                      {parseFloat(parseFloat(detail?.total_visa_charges) + (parseFloat(detail?.total_visa_charges) * 0.05)).toFixed(2)} AED
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </PDFExport>
        <PDFExport
          ref={contentRef2}
          paperSize="A4"
          margin={40}
          forceProxy={true}
          proxyURL={`${process.env.REACT_APP_BASE_URL}/system/forwardPDF`}
          proxyTarget="_blank"
          fileName="Visa Invoice"
          pageTemplate={pageTemplate}
        >
          <Box id="pdf_data">
            {chunks.map((chunk, index) => (
              <Box key={index} style={{ pageBreakAfter: "always" }}>
                {/* Table */}
                <TableContainer id="pd-mytable">
                  <Table>
                    <TableHead>
                      <TableRow id="table-header">
                        <TableCell
                          id="table-cell-new"
                          className="pdf-col pdf-myfont"

                        >
                          Sr No
                        </TableCell>
                        <TableCell id="table-cell-new">Candidate</TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Passport#
                        </TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Visa Rate
                        </TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Tax
                        </TableCell>
                        <TableCell id="table-cell-new" className="pdf-col">
                          Total
                        </TableCell>
                        {/* <TableCell id="table-cell-new ">Amount AED</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chunk.map((row) => (
                        <TableRow id="table-header" >
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {++serialNumberNew}
                          </TableCell>
                          <TableCell id="table-cell-new" className="pdf-myfont">
                            {row?.name}-{row?.visa_tenure}-{row?.visa_type}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {row?.passport_number}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {parseFloat(parseFloat(row?.visa_charges)).toFixed(2)}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {parseFloat(parseFloat(row?.visa_charges) * 0.05).toFixed(2)}
                          </TableCell>
                          <TableCell className="pdf-myfont" id="table-cell-new">
                            {parseFloat(parseFloat(row?.visa_charges) + parseFloat(row?.visa_charges) * 0.05).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>

          <Box id="pdf_data" className="pdf_margin">
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new" className="pdf-myfont">Sub Total</TableCell>
                    <TableCell id="table-cell-new" className="pdf-myfont">
                      {" "}
                      {parseFloat(
                        parseFloat(detail?.total_visa_charges)
                      ).toFixed(2)}{" "}
                      AED
                    </TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new" className="pdf-myfont">Total Tax</TableCell>
                    <TableCell id="table-cell-new" className="pdf-myfont">
                      {parseFloat(totalTax).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow id="table-header">
                    <TableCell id="table-cell-new" colSpan={4} />
                    <TableCell id="table-cell-new" className="pdf-myfont">Total</TableCell>
                    <TableCell id="table-cell-new" className="pdf-myfont">
                      {parseFloat(parseFloat(detail?.total_visa_charges) + (parseFloat(detail?.total_visa_charges) * 0.05)).toFixed(2)} AED
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </PDFExport>
      </Box>

      <Box className="border-custom" sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box>
            <img
              style={{ width: "445px", height: "50px" }}
              src={Images.pdfLogo}
            />

            <Box sx={{ color: "#155368" }}>
              <HeaderTypography>MABDE TRADING L.L.C</HeaderTypography>
              <StyledTypography
                style={{ color: "#155368", fontWeight: "bold" }}
              >
                TEL: 04-3400000, FAX: 04-3488448 <br />
                P.O.BOX 81, DUBAI, UAE
              </StyledTypography>
            </Box>
          </Box>
        </Box>

        {/* Bill To Section */}
        <Box mb={4}>
          <Typography
            sx={{
              border: "2px solid black",
              fontWeight: "bold",
              width: "100px",
              textAlign: "center",
            }}
          >
            Bill To:
          </Typography>
          <Typography sx={{ fontWeight: "bold", mt: 3 }}>
            {detail?.customer?.name}
          </Typography>
        </Box>

        {/* Address and Invoice Details */}
        <Box
          mb={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography>{detail?.customer?.address}</Typography>
            <Typography sx={{ mt: 2 }}>
              Vat number:{detail?.customer?.vat_no}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
              Tax Invoice Number: MT/VR/{id}
            </Typography>
            <Typography sx={{ mt: 2 }}>Vat Reg. No. 100511270900003</Typography>
            <Typography sx={{ fontWeight: "bold", mt: 2 }}>
              Date: {moment(detail?.created_at).format("DD-MM-YYYY")}
            </Typography>
          </Box>
        </Box>

        {/* Tax Invoice Title */}
        <Box style={{ textAlign: "center" }} mb={4}>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textDecoration: "underline",
              letterSpacing: "11px",
              textAlign: "center",

            }}
          >
            {detail?.payment_status && detail?.payment_status.toLowerCase() == 'paid' ? "TAX INVOICE" : "PERFORMA INVOICE"}
          </Typography>
        </Box>

        {/* Table of Charges */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell className="table-cell" sx={{ width: "72px" }}>
                  Sr No
                </TableCell>
                <TableCell className="table-cell">Candidate</TableCell>
                <TableCell className="table-cell">Passport#</TableCell>
                <TableCell className="table-cell">Visa Rate</TableCell>
                <TableCell className="table-cell">Tax</TableCell>
                <TableCell className="table-cell">Total</TableCell>
                {/* <TableCell className="table-cell">Amount AED</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((row, index) => (
                <>
                  <TableRow key={index + 1}>
                    <TableCell className="table-cell">{index + 1}</TableCell>
                    <TableCell className="table-cell">
                      {row?.name}-{row?.visa_tenure}-{row?.visa_type}
                    </TableCell>
                    <TableCell className="table-cell">
                      {row?.passport_number}
                    </TableCell>
                    <TableCell className="table-cell">
                      {parseFloat(
                        parseFloat(row?.visa_charges)
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className="table-cell">
                      {parseFloat(parseFloat(row?.visa_charges) * 0.05).toFixed(
                        2
                      )}
                    </TableCell>
                    <TableCell className="table-cell">
                      {parseFloat(parseFloat(row?.visa_charges) + parseFloat(row?.visa_charges) * 0.05).toFixed(2)}
                    </TableCell>
                    {/* <TableCell className="table-cell">{row.amount}</TableCell> */}
                  </TableRow>
                </>
              ))}

              <TableRow id="table-header">
                <TableCell id="table-cell" colSpan={3} />
                <TableCell id="table-cell">Sub Total</TableCell>
                <TableCell id="table-cell">
                  {parseFloat(detail?.total_visa_charges).toFixed(2)}

                </TableCell>
              </TableRow>
              <TableRow id="table-header">
                <TableCell id="table-cell" colSpan={3} />
                <TableCell id="table-cell">Total Tax</TableCell>
                <TableCell id="table-cell">
                  {parseFloat(totalTax).toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow id="table-header">
                <TableCell id="table-cell" colSpan={3} />
                <TableCell id="table-cell">Total </TableCell>
                <TableCell id="table-cell">
                  {" "}
                  {parseFloat(
                    parseFloat(detail?.total_visa_charges) +
                    parseFloat(detail?.total_visa_charges) * 0.05
                  ).toFixed(2)}{" "}
                  AED{" "}

                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer - Bank Details */}
        <Box
          mt={4}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box style={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Account Name:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              MABDE TRADING LLC
            </Typography>
          </Box>
          <Box style={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Account #:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              0332676739001.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Bank details:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              The National Bank of Ras Al Khaimah
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Branch:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              Umm Hurair.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Iban:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              AE540400000332676739001
            </Typography>
          </Box>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Typography sx={{ flex: 0.1 }}>Swift Code:</Typography>
            <Typography sx={{ flex: 1, fontWeight: "bold" }}>
              NRAKAEAK.
            </Typography>
          </Box>
        </Box>

        {/* Terms and Conditions */}
        <Box mt={4}>
          <Typography sx={{ color: Colors.danger }}>
            Terms & Conditions:
          </Typography>
          <Typography>Immediate payment.</Typography>
        </Box>

        {/* Signature Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box mt={4}>
            <Typography>Authorized Signature</Typography>
            <Typography sx={{ color: Colors.primary, fontWeight: "bold" }}>
              MABDE TRADING LLC.
            </Typography>
          </Box>
          {/* <Box mt={4}>
            <Typography
              sx={{
                color: Colors.primary,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              TEL: 04/3440000 FAX: 04/3448488
            </Typography>
            <Typography
              sx={{
                color: Colors.primary,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              P.O.BOX: 51 DUBAI, U.A.E
            </Typography>
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
}

export default VisaInvoice;
