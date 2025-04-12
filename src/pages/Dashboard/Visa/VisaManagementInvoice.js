import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Grid,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import VisaServices from "services/Visa";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { Images } from "assets";

// Custom Styled Components
const StyledBox = styled(Box)(({ theme }) => ({
    padding: "20px",

}));

const HeaderTypography = styled(Typography)(({ theme }) => ({
    fontSize: "14px",
    fontWeight: "bold",
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({

    fontWeight: "bold",
    fontSize: "12px",
    border: "1px solid #000",
}));

const TableDataCell = styled(TableCell)(({ theme }) => ({
    fontSize: "12px",
    border: "1px solid #000 !important",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: "12px",
    color: "#000",
}));



const VisaManagementInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const [detail, setDetail] = useState();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalTax, setTotalTax] = useState(0)

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
            setTotalTax(totalTax)
        } catch (error) {
            showErrorToast(error);
        }
    };

    useEffect(() => {
        if (id) getVisaDetail();
    }, [id]);

    const downloadPDF = async () => {
        if (contentRef.current) {
            // Capture the content of the ref as a canvas
            const canvas = await html2canvas(contentRef.current);
            const imgData = canvas.toDataURL("image/png");

            // Create a PDF document
            const pdf = new jsPDF();
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save("Invoice.pdf");
        }
    };

    return (
        <StyledBox>
            <Box sx={{display:'flex',justifyContent:'flex-end',mb:"10px"}}>
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
            </Box>
            <Box ref={contentRef} sx={{ border: '8px solid #7eb2ca', padding: '15px' }} >
                {/* Header */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "center",mb:2 }}>
                            <Box component={'img'} src={Images.logoDark} sx={{width:'220px'}}>
                                
                            </Box>

                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Box sx={{ color: '#155368' }}>
                                <HeaderTypography>
                                    MABDE TRADING L.L.C
                                </HeaderTypography>
                                <StyledTypography style={{ color: '#155368', fontWeight: 'bold' }}>
                                    TEL: 04-3400000, FAX: 04-3488448 <br />
                                    P.O.BOX 81, DUBAI, UAE
                                </StyledTypography>
                            </Box>

                        </Box>
                        {/* Bill To Section */}
                        <Grid item xs={12}>

                            <Box sx={{ mt: 2 }}>
                                <HeaderTypography>Bill To:</HeaderTypography>

                            </Box>
                        </Grid>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mt: '20px' }}>
                            <Box>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                    Name : {detail?.customer?.name}
                                </Typography>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                   Address : {detail?.customer?.address}
                                </Typography>
                             
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                   Email : {detail?.customer?.userDetail?.email}
                                </Typography>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                    Phone : {detail?.customer?.userDetail?.phone}
                                </Typography>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                VAT Reg. NO. : {detail?.customer?.vat_no}
                                </Typography>
                                {detail?.payment?.description != null && detail?.payment_status == "paid" &&
                                (

                                    <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                   Description : {detail?.payment?.description}
                                </Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                   Tax Invoice Number: MT/SDLS/VR24255
                                </Typography>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                    VAT Reg. NO. : 100511270900003
                                </Typography>
                                <Typography sx={{ fontWeight: 'bold' }} variant="body1" gutterBottom>
                                    Date:{moment(detail?.created_at).format('MM-DD-YYYY')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>



                    {/* Credit Note Summary */}
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
                            <HeaderTypography style={{ textDecoration: 'underline', fontSize: '25px' }}>{detail?.payment_status == 'paid'  ? "INVOICE" : "PERFORMA INVOICE"}</HeaderTypography>
                        </Box>
                    </Grid>

                    {/* Table Content */}
                    <Grid item xs={12}>
                        <TableContainer >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>S. No</TableHeaderCell>
                                        <TableHeaderCell>Candidate</TableHeaderCell>
                                        <TableHeaderCell>Visa Rate</TableHeaderCell>
                                        <TableHeaderCell>Tax</TableHeaderCell>
                                        <TableHeaderCell>Total</TableHeaderCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {candidates.map((candidate, index) => (
                                        <TableRow key={index}>
                                            <TableDataCell>{index + 1}</TableDataCell>
                                            <TableDataCell>{candidate?.name}-{candidate?.visa_tenure}-{candidate?.visa_type}</TableDataCell>
                                            <TableDataCell>{parseFloat(parseFloat(candidate?.visa_charges)-parseFloat(candidate?.visa_charges) * 0.05).toFixed(2)}</TableDataCell>
                                            <TableDataCell sx={{backgroundColor:'transparent !important'}}>{parseFloat(parseFloat(candidate?.visa_charges) * 0.05).toFixed(2)}</TableDataCell>
                                            <TableDataCell>{candidate?.visa_charges}</TableDataCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>


                    <Grid item xs={12} display={'flex'} justifyContent={"flex-end"}>
                        <Box sx={{ mt: 3 }}>
                            <StyledTypography sx={{ fontWeight: 'bold' ,fontSize:'17px !important'}}>
                            Sub Total: {parseFloat(parseFloat(detail?.total_visa_charges)-parseFloat(detail?.total_visa_charges) * 0.05).toFixed(2)} AED <br />
                                Total Tax: {parseFloat(totalTax).toFixed(2)} AED  <br />
                                 Total : {parseFloat(detail?.total_visa_charges).toFixed(2) } AED  <br />

                            </StyledTypography>

                        </Box>
                    </Grid>
                    <Grid item xs={12} display={'flex'} >
                        <Box sx={{ mt: 3 }}>

                            <StyledTypography sx={{ mt: 3, fontWeight: 'bold' }}>
                                Authorized Signature:
                            </StyledTypography>
                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </StyledBox>
    );
};

export default VisaManagementInvoice;
