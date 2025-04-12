import React, { Fragment, useEffect, useState } from "react";
import { Avatar, Box, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from "@mui/material";
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
import { showErrorToast } from "components/NewToaster";
import VisaServices from "services/Visa";
import { CircleLoading } from "components/Loaders";
import { PDFExport } from "@progress/kendo-react-pdf";

import moment from "moment";
import styled from "@emotion/styled";
import { formatPermissionData, handleDownload } from "utils";
import { Details } from "@mui/icons-material";
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
    border: 0,

}));

const Cell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',
        border: '1px solid #EEEEEE',
        padding: '15px',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        color: '#434343',
        paddingRight: '50px',
        background: 'transparent',
        fontWeight: 'bold',
        paddingLeft: '15px !important',

    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',

        textWrap: 'nowrap',
        padding: '5px !important',
        paddingLeft: '15px !important',

        '.MuiBox-root': {
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            '.MuiBox-root': {
                cursor: 'pointer'
            }
        },
        'svg': {
            width: 'auto',
            height: '24px',
        },
        '.MuiTypography-root': {
            textTransform: 'capitalize',
            fontFamily: FontFamily.NunitoRegular,
            textWrap: 'nowrap',
        },
        '.MuiButtonBase-root': {
            padding: '8px',
            width: '28px',
            height: '28px',
        }
    },
}));




function RenewDetail() {
    const { id } = useParams();
    const { state } = useLocation()
    const [permissions, setPermissions] = useState([])
    const dispatch=useDispatch()
    const [detail, setDetail] = useState()
    console.log(state);

    const tableHead1 = [{ name: 'Date ', key: 'name' }, { name: 'Status', key: 'visa_eligibility' }, { name: 'Document', key: 'deposit_total' }]






    // *For Get  Detail
    const getCustomerDetail = async () => {
        try {
            let params = { id: id };


            const { data } = await VisaServices.getListDetails(params);
            console.log(data?.details?.security_deposit_scenario);
            setDetail(data?.details)
            setPermissions(formatPermissionData(data?.permissions))
            console.log(formatPermissionData(data?.permissions));
            
            setPermissions(formatPermissionData(data?.permissions))
            data?.permissions.forEach(e => {
              if (e?.route && e?.identifier && e?.permitted) {
                dispatch(addPermission(e?.route));
              }
            })
        }

        catch (error) {
            showErrorToast(error);
        }
    };

    useEffect(() => {
        getCustomerDetail()
    }, [])





    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >RENEW DETAIL</Typography>

            </Box>

            <Box p={2}>
                <Grid container spacing={4}>
                    <Grid item xs={6} >
                        {/* Security Deposit Section */}
                        <Grid item xs={12} sm={6}>
                            <Box mb={2} mt={2}>
                                <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6"> Details :</Typography>
                                <Typography mb={2} mt={2} variant="body1">Passport Name : <span style={{ color: "#0F2772" }}>{detail?.candidate?.name}</span></Typography>
                                <Typography mb={2} mt={2} variant="body1">Nationality : <span style={{ color: "#0F2772" }}>{detail?.candidate?.nationality?.name}</span></Typography>
                                <Typography mb={2} mt={2} variant="body1">Visa Designation : <span style={{ color: "#0F2772" }}>{detail?.candidate?.visa_designation}</span></Typography>
                                <Typography mb={2} mt={2} variant="body1">Passport Number : <span style={{ color: "#0F2772" }}>{detail?.candidate?.passport_number}</span></Typography>
                                {<Typography mb={2} mt={2} variant="body1">Passport Expiry : <span style={{ color: "#0F2772" }}>{moment(detail?.candidate?.passport_expiry).format('MM-DD-YYYY')} </span></Typography>}
                                {/* <Typography mb={2} mt={2} variant="body1">Guarantor Name: <span style={{ color: "#0F2772" }}>{visaDetail?.total_deposit_charges} </span></Typography>
                            <Typography mb={2} mt={2} variant="body1">Guarantor Number: <span style={{ color: "#0F2772" }}>{visaDetail?.total_deposit_charges} <sub>AED</sub></span></Typography> */}

                            </Box>


                        </Grid>


                    </Grid>
                    <Grid item xs={6} >
                        <Box >
                            <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Job Details :</Typography>
                            <Typography mb={2} mt={2} variant="body1">Basic Salary : <span style={{ color: "#0F2772" }}>{detail?.candidate?.salary_basic}</span><sub>AED</sub></Typography>
                            <Typography mb={2} mt={2} variant="body1">Allowance : <span style={{ color: "#0F2772" }}>{detail?.candidate?.salary_allowance}</span><sub>AED</sub></Typography>
                            <Typography mb={2} mt={2} variant="body1">Total Salary : <span style={{ color: "#0F2772" }}>{detail?.candidate?.salary_total}</span><sub>AED</sub></Typography>

                            {<Typography mb={2} mt={2} variant="body1">End Consumer Company: <span style={{ color: "#0F2772" }}>{detail?.candidate?.end_consumer_company} </span></Typography>}
                        </Box>

                    </Grid>
                    <Grid item xs={6} >
                        <Box >
                            <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Visa Details :</Typography>
                            <Typography mb={2} mt={2} variant="body1">Visa Type : <span style={{ color: "#0F2772" }}>{detail?.candidate?.visa_type}</span></Typography>
                            <Typography mb={2} mt={2} variant="body1">Visa Tenure : <span style={{ color: "#0F2772" }}>{detail?.candidate?.visa_tenure}</span></Typography>
                            {detail?.candidate?.visa_type == 'In' ? < Typography mb={2} mt={2} variant="body1">Inside Rate : <span style={{ color: "#0F2772" }}>{detail?.candidate?.inside_rate}</span><sub>AED</sub></Typography> :
                                <Typography mb={2} mt={2} variant="body1">Outside Rate : <span style={{ color: "#0F2772" }}>{detail?.candidate?.outside_rate}</span><sub>AED</sub></Typography>}
                            {/* <Typography mb={2} mt={2} variant="body1">Renewal Rate : <span style={{ color: "#0F2772" }}>{detail?.candidate?.renewal_rate}</span><sub>AED</sub></Typography> */}

                        </Box>

                    </Grid>
                    <Grid item xs={6} >
                        <Box >
                            <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Processing Details :</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>

                                <Typography mt={2} sx={{ display: 'flex', alignItems: 'center' }} variant="body1">Payment Status :           <Box component={'img'} src={detail?.payment_status == 'paid' ? Images.successIcon : Images.errorIcon} width={'15px'}>

                                </Box> &nbsp; <span style={{ color: "#0F2772" }}>{detail?.payment_status == 'paid' ? 'Paid' : 'Unpaid'}</span></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>

                                <Typography mt={2} sx={{ display: 'flex', alignItems: 'center' }} variant="body1">Request Status :           <Box component={'img'} src={detail?.request_status == 'approved' ? Images.successIcon : Images.errorIcon} width={'15px'}>

                                </Box> &nbsp; <span style={{ color: "#0F2772" }}>{detail?.request_status}</span></Typography>
                            </Box>

                            <Typography mb={2} mt={2} variant="body1">Payment Type : <span style={{ color: "#0F2772" }}>{detail?.type}</span></Typography>
                          {detail?.document &&   <Typography mb={2} mt={2} variant="body1">Payment Document : <span style={{ color: "#0F2772" }}>
                              
                            {detail?.document && 
                            <Grid
                                detail
                                md={6}
                                lg={4}
                                sx={{ cursor: 'pointer', display: 'flex', gap: '5px' }}
                                component={'div'}
                                onClick={() =>{
                                    if(detail?.document?.split('_').pop().includes('doc') || detail?.document?.split('_').pop().includes('xls') ){

                                        handleDownload(detail?.document, detail?.document?.split('_').pop());
                                      }
                                      else{
                                        
                                        window.open(process.env.REACT_APP_IMAGE_BASE_URL+detail?.document, '_blank');
                                      }
                                }}
                                // onClick={() => handleDownload(detail?.document, detail?.document?.split('_').pop())}

                            >

                                {detail?.document && <Box>
                                    <Box component={'img'} src={Images.docIcon} width={'25px'} />
                                </Box>}
                                <p style={{ textAlign: 'center', lineHeight: '20px', color: '#0F2772', fontWeight: 'bold', fontSize: '12px' }}>
                                    {detail?.document?.split('_').pop()}
                                </p>
                            </Grid>}</span></Typography>}



                        </Box>

                    </Grid>
                </Grid>
                <Grid container mt={2} >

                    <Grid item md={12}>
                        {<Box>


                            <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Status History :</Typography>

                            {(
                                detail?.statuses?.length > 0 && (
                                    <Fragment>
                                        <PDFExport landscape={true} paperSize="A4" margin={5} fileName='Import Customers' >

                                            <TableContainer
                                                component={Paper}
                                                sx={{
                                                    maxHeight: 'calc(100vh - 200px)', backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

                                                }}

                                            >
                                                <Table stickyHeader sx={{ minWidth: 500 }}>
                                                    <TableHead>

                                                        <Row>
                                                            {tableHead1.map((cell, index) => (
                                                                <Cell style={{ textAlign: 'center' }} className="pdf-table"
                                                                    key={index}

                                                                >
                                                                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                                                        {cell?.name}
                                                                    </Box>
                                                                </Cell>
                                                            ))}
                                                        </Row>
                                                    </TableHead>
                                                    <TableBody>
                                                        {detail?.statuses?.map((item, index) => {

                                                            return (
                                                                <Row
                                                                    key={index}
                                                                    sx={{
                                                                        border: '1px solid #EEEEEE !important',
                                                                    }}
                                                                >





                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {item?.date ? moment(item?.date).format('MM-DD-YYYY') : moment(item?.createdAt).format('MM-DD-YYYY')}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        <Box component={'div'} sx={{ cursor: 'pointer', display: 'flex !important', justifyContent: 'flex-start !important' }}  >
                                                                            <Box component={'img'} src={item?.status == "Medical" ?
                                                                                Images.blueCircle :
                                                                                item?.status == "Stamping" ?
                                                                                    Images.successIcon :
                                                                                    item?.status == "Emirates Id" ?
                                                                                        Images.lightGreenCircle :
                                                                                        item?.status == "Entry permit " ?
                                                                                            Images.pendingIcon : Images.orangeCircle} width={'13px'}></Box>
                                                                            {item?.status}
                                                                        </Box>

                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        <>



                                                                            {item?.document && <Grid
                                                                                item
                                                                                md={6}
                                                                                lg={4}
                                                                                sx={{ cursor: 'pointer', display: 'flex', gap: '5px' }}
                                                                                component={'div'}
                                                                                onClick={() =>{
                                                                                    if(item?.document?.split('_').pop().includes('doc') || item?.document?.split('_').pop().includes('xls') ){
        
                                                                                        handleDownload(item?.document, item?.document?.split('_').pop());
                                                                                      }
                                                                                      else{
                                                                                        
                                                                                        window.open(process.env.REACT_APP_IMAGE_BASE_URL+item?.document, '_blank');
                                                                                      }
                                                                                }}
                                                                                // onClick={() => handleDownload(item?.document, item?.document?.split('_').pop())}
                                                                                key={index}
                                                                            >

                                                                                {item?.document && <Box>
                                                                                    <Box component={'img'} src={Images.docIcon} width={'25px'} />
                                                                                </Box>}
                                                                                <p style={{ textAlign: 'center', lineHeight: '20px', color: '#0F2772', fontWeight: 'bold', fontSize: '12px' }}>
                                                                                    {item?.document?.split('_').pop()}
                                                                                </p>
                                                                            </Grid>}
                                                                        </>
                                                                    </Cell>


                                                                </Row>

                                                            );
                                                        })}

                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </PDFExport>


                                    </Fragment>
                                )
                            )}




                        </Box>}





                    </Grid>
                </Grid>


            </Box>
        </Box >
    );
}

export default RenewDetail;
