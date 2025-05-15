import React, { Fragment, useEffect, useState } from "react";
import { Avatar, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
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

import moment from "moment";
import styled from "@emotion/styled";
import SimpleDialog from "components/Dialog/SimpleDialog";
import { CleanTypes, formatPermissionData, getFileSize } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";
import UploadFile from "components/UploadFile";
import UploadFileSingle from "components/UploadFileSingle";
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
        fontWeight: 'bold'

    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontFamily: 'Public Sans',

        textWrap: 'nowrap',
        padding: '5px !important',

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




function VisaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const tableHead1 = [{ name: 'SR No.', key: '' }, { name: 'Date ', key: 'name' }, { name: 'Customer Name', key: 'visa_eligibility' }, { name: 'Candidate Name', key: 'deposit_total' }, { name: 'Visa Rates', key: '' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]
    const { register, handleSubmit, getValues, setValue, control, formState: { errors }, reset } = useForm();
    const allowFilesType = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    // *For Dialog Box
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [confirmationDialog2, setConfirmationDialog2] = useState(false);
    const [loader, setLoader] = useState(false);
    const [open, setOpen] = useState(false)
    const [documents, setDocuments] = useState([])
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [scroll, setScroll] = React.useState('paper');
    const [statusDialog, setStatusDialog] = useState(false)
    const [selectedVisa, setSelectedVisa] = useState()
    const [status, setStatus] = useState(null)
    const [document, setDocument] = useState()
    const [date, setDate] = useState(null)
    const [statuses, setStatuses] = useState([])
    const [permissions, setPermissions] = useState()

    // *For Customer Detail
    const [visaDetail, setVisaDetail] = useState();

    // *For International Country Code
    const [intCode, setIntCode] = useState();
    // *For Countries
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const handleClose = () => {
        setOpen(false);
    };

    // *For Expiration Date
    const [passportExp, setPassportExp] = useState();
    const [editUser, setEditUser] = useState(false);

    // *For Handle Date
    const handlePassportDate = (newDate) => {
        try {
            // eslint-disable-next-line eqeqeq
            if (newDate == "Invalid Date") {
                setPassportExp("invalid");
                return;
            }
            setPassportExp(new Date(newDate));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const UpdateStatus = async () => {
        console.log(selectedVisa);
        try {
            let obj = {
                id: selectedVisa?.id,
                candidate_name: selectedVisa?.name,
                visa_id: selectedVisa?.visa_id,
                visa_charges: selectedVisa?.visa_charges,
                status: status?.id,
                date: moment(date).format('YYYY-MM-DD'),
                visa_tenure: selectedVisa?.visa_tenure,
                document: document
            }

            const promise = VisaServices.CandidateUpdateStatus(obj);
            console.log(promise);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            // Await the promise and then check its response
            const response = await promise;
            if (response?.responseCode === 200) {
                setStatusDialog(false);
                getVisaDetail();
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    // *For Get Countries
    const getCountries = async (id) => {
        try {
            const { data } = await SystemServices.getCountries();
            setCountries(data?.nations.rows);
            setSelectedCountry(data?.nations.rows.find((e) => e?.id === id));
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    // *For Get Customer Detail
    const getVisaDetail = async () => {
        try {
            let params = { visa_id: id };
            const { data } = await VisaServices.getVisaDetail(params);
            console.log(data);
            setVisaDetail(data?.details);

            setPermissions(formatPermissionData(data?.permissions))
            console.log(formatPermissionData(data?.permissions));

            setPermissions(formatPermissionData(data?.permissions))
            data?.permissions.forEach(e => {
                if (e?.route && e?.identifier && e?.permitted) {
                    dispatch(addPermission(e?.route));
                }
            })

        } catch (error) {
            showErrorToast(error);
        }
    };

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
                let maxSize = 10 * 1024 * 1024
                if (file.size > maxSize) {
                    showErrorToast('File Size Must Be Less than 10 MB')
                }
                else {

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

                console.log(data, 'asddasasd');
                return data?.data?.path

            }
        } catch (error) {
            ErrorToaster(error);
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

    const handleDownload = async (path, name) => {
        try {
            const url = `${process.env.REACT_APP_IMAGE_BASE_URL}${path}`;
            window.open(url, '_blank');
            // let params = { path: path, name: `${name}.png` };
            // const response = await SystemServices.downloadDocuments(params, { responseType: 'blob' });

            // // Create a Blob from the response data
            // const blob = new Blob([response], { type: 'image/png' });
            // const url = URL.createObjectURL(blob);

            // // Create a link element, set its href to the blob URL, and trigger a click to download
            // const link = document.createElement('a');
            // link.href = url;

            // link.download = name || 'download.png'; // Set the desired filename here
            // document.body.appendChild(link);
            // // Set the href attribute to the URL you want to open
            // link.href = link;

            // // Set the target attribute to '_blank' to open the link in a new tab
            // link.target = '_blank';

            // // Append the link to the body (not necessary for the link to work, but needed for click simulation)
            // document.body.appendChild(link);

            // // Simulate a click on the link
            // // link.click();
            // window.location.href = link

            // // Clean up by removing the link element and revoking the object URL
            // document.body.removeChild(link);
            // URL.revokeObjectURL(url);

        } catch (error) {
            showErrorToast(error);
        }
    }


    // *For Reset User Password

    useEffect(() => {
        if (id) {
            getVisaDetail();
        }
    }, [id]);

    return (
        <Box sx={{ p: 3 }}>

            <SimpleDialog
                open={statusDialog}
                onClose={() => setStatusDialog(false)}
                title={"Change Status?"}
            >
                <Box component="form" onSubmit={handleSubmit(UpdateStatus)}>
                    <Grid container >
                        <Grid item xs={12} sm={12}>
                            <SelectField
                                size={"small"}
                                label={"Select Status :"}
                                options={statuses}
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
                        <Grid item xs={12} sm={12}>
                            <DatePicker
                                label={"Date :"}
                                value={date}
                                size={"small"}
                                error={errors?.date?.message}
                                register={register("date", {
                                    required: "Please enter  date.",
                                })}
                                onChange={(date) => {
                                    handleDate(date);
                                    setValue("date", date);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ fontWeight: "bold" }}>Upload Document:</Box>
                            <UploadFileSingle
                                Memo={true}
                                accept={allowFilesType}
                                error={errors?.document?.message}

                                file={document}
                                register={register("document", {
                                    required: false,
                                    onChange: async (e) => {
                                        const path = await handleUploadDocument(e);
                                        if (path) {
                                            setDocument(path);
                                        }
                                    }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >VISA DETAIL</Typography>
                {/* <Box sx={{ display: 'flex', gap: '10px' }}>
          <PrimaryButton
           bgcolor={'#001f3f'}
            title="Edit"
            onClick={() => navigate(`/update-customer/${id}`)}


          />

        </Box> */}
            </Box>
            <Grid container sx={{ mt: 5, border: '1px solid #B6B6B6', borderRadius: "8px", p: '15px', justifyContent: 'space-between' }} >
                <Grid item xs={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Company Name:</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{visaDetail?.customer?.name}</Typography>
                        </Grid>

                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Business Address:</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{visaDetail?.customer?.address}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Phone Number:</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{visaDetail?.customer?.userDetail?.phone}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Email :</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{visaDetail?.customer?.userDetail?.email}</Typography>
                        </Grid>

                        {/* <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Website:</Typography>
                        </Grid> */}
                        {/* <Grid item xs={7}>
                            <Link sx={{ fontSize: '14px', color: '#0F2772 !important' }} href={visaDetail?.customer?.website} target="_blank" rel="noopener noreferrer">
                                {visaDetail?.customer?.website}
                            </Link>
                        </Grid> */}
                    </Grid>
                </Grid>
                <Grid item xs={4} display={'flex'} justifyContent={"center"}>
                    <Box>
                        <Avatar
                            alt="Remy Sharp"
                            src={visaDetail?.logo ? process.env.REACT_APP_IMAGE_BASE_URL + visaDetail?.logo : Images.logoDarkCircle}
                            sx={{ width: 100, height: 100 }}
                        />

                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Guarantor Name:</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{visaDetail?.customer?.guarantor_name}</Typography>
                        </Grid>

                        <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Guarantor Number:</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{visaDetail?.customer?.guarantor_number}</Typography>
                        </Grid>

                        {/* <Grid item xs={5}>
                            <Typography sx={{ fontSize: '14px' }} variant="body1">Guarantor Verified:</Typography>
                        </Grid>
                        <Grid item xs={7}>
                            <Link sx={{ fontSize: '14px', color: '#0F2772' }} target="_blank" rel="noopener noreferrer">
                                Verified
                            </Link>
                        </Grid> */}
                    </Grid>
                </Grid>
            </Grid>
            <Box p={2}>
                <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Security Deposit:</Typography>
                <Grid container spacing={4} >
                    {/* Security Deposit Section */}

                    <Grid item xs={12} sm={6}>


                        <Typography mb={2} mt={2} variant="body1">Security Deposit Scenario: <strong style={{ color: "#0F2772" }}>{visaDetail?.customer?.security_deposit_scenario == "visa" ? "VISA" : "PAYROLL"}</strong></Typography>

                        <Typography mb={2} mt={2} variant="body1">{visaDetail?.customer?.security_deposit_scenario == 'payroll' ? "Eligibility Of Payroll :" : 'Total Visa Quantity:'} <strong style={{ color: "#0F2772" }}>{visaDetail?.customer?.security_deposit_scenario == "payroll" ? visaDetail?.customer?.payroll_eligibility + ' ' + 'AED' : visaDetail?.customer?.visa_eligibility}</strong></Typography>
                        <Typography mb={2} mt={2} variant="body1">Total Amount: <strong style={{ color: "#0F2772" }}>{visaDetail?.total_visa_charges} <sub>AED</sub></strong></Typography>




                    </Grid>

                    <Grid item xs={12} sm={6}>

                        {visaDetail?.customer?.security_deposit_scenario != 'payroll' && <Typography mb={2} mt={2} variant="body1">Security Deposit Per Visa: <strong style={{ color: "#0F2772" }}>{visaDetail?.customer?.deposit_per_visa} <sub>AED</sub></strong></Typography>}
                        <Typography mb={2} mt={2} variant="body1">Security Deposit Consumed: <strong style={{ color: "#0F2772" }}>{visaDetail?.total_deposit_charges} <sub>AED</sub></strong></Typography>






                    </Grid>


                </Grid>
                <Grid container>
                    <Box >
                        <Typography sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Candidates :</Typography>
                    </Box>
                </Grid>

                <Grid container mt={2} >

                    <Grid item md={11}>
                        {<Box>




                            {(
                                visaDetail?.candidates.length > 0 && (
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
                                                                <Cell style={{ textAlign: cell?.name == 'SR No.' ? 'center' : 'left', paddingRight: cell?.name == 'SR No.' ? '15px' : '50px' }} className="pdf-table"
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
                                                        {visaDetail?.candidates?.map((item, index) => {
                                                            console.log(item?.statuses)
                                                            let sorteddata = item?.statuses.sort((a, b) => a.id - b.id);
                                                            console.log(sorteddata);

                                                            return (
                                                                <Row
                                                                    key={index}
                                                                    sx={{
                                                                        border: '1px solid #EEEEEE !important',
                                                                    }}
                                                                >

                                                                    <Cell style={{ textAlign: 'center' }} className="pdf-table">
                                                                        {item?.visa_id + "_" + item?.serial_id}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {moment(item?.created_at).format("YYYY-MM-DD")}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {visaDetail?.customer?.name}
                                                                    </Cell>

                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {item?.name}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {item?.visa_charges}


                                                                    </Cell>

                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">

                                                                        <Box component={'div'} sx={{ cursor: 'pointer', display: 'flex !important', justifyContent: 'flex-start !important' }} onClick={() => {
                                                                            if (permissions?.update_candidate_status) {
                                                                                if (permissions?.update_candidate_status) {

                                                                                    setStatusDialog(true);
                                                                                }
                                                                            }
                                                                            setSelectedVisa(item)
                                                                            if (sorteddata[sorteddata?.length - 1]?.status == 'In Progress') {
                                                                                if (item?.visa_type == 'Out') {
                                                                                    setStatuses([
                                                                                        { id: "In Progress", name: "In Progress" },
                                                                                        { id: "Change Status", name: "Change Status" },
                                                                                        { id: "Reject", name: "Reject" },
                                                                                    ])
                                                                                }
                                                                                else {
                                                                                    setStatuses([
                                                                                        { id: "In Progress", name: "In Progress" },
                                                                                        { id: "Entry Permit", name: "Entry Permit" },
                                                                                        { id: "Reject", name: "Reject" },

                                                                                    ])
                                                                                }

                                                                            }
                                                                            else if (sorteddata[sorteddata.length - 1].status == 'Pending') {
                                                                                setStatuses([
                                                                                    { id: "In Progress", name: "In Progress" },


                                                                                    { id: "Reject", name: "Reject" },

                                                                                ])
                                                                            }
                                                                            else if (sorteddata[sorteddata.length - 1].status == 'Entry Permit') {
                                                                                setStatuses([

                                                                                    { id: "Entry Permit", name: "Entry Permit" },
                                                                                    { id: "Medical", name: "Medical" },
                                                                                    { id: "Reject", name: "Reject" },

                                                                                ])
                                                                            }
                                                                            else if (sorteddata[sorteddata.length - 1].status == 'Change Status') {
                                                                                setStatuses([
                                                                                    { id: "Change Status", name: "Change Status" },
                                                                                    { id: "Medical", name: "Medical" },


                                                                                    { id: "Reject", name: "Reject" },

                                                                                ])
                                                                            }
                                                                            else if (sorteddata[sorteddata.length - 1].status == 'Medical') {
                                                                                setStatuses([
                                                                                    { id: "Medical", name: "Medical" },
                                                                                    { id: "Emirates Id", name: "Emirates Id" },

                                                                                    { id: "Reject", name: "Reject" },

                                                                                ])
                                                                            }
                                                                            else if (sorteddata[sorteddata.length - 1].status == 'Emirates Id') {
                                                                                setStatuses([
                                                                                    { id: "Emirates Id", name: "Emirates Id" },
                                                                                    { id: "Stamping", name: "Stamping" },
                                                                                    { id: "Reject", name: "Reject" },

                                                                                ])
                                                                            }
                                                                            else if (sorteddata[sorteddata.length - 1].status == 'Stamping') {
                                                                                setStatuses([

                                                                                    { id: "Stamping", name: "Stamping" },

                                                                                    { id: "Reject", name: "Reject" },

                                                                                ])
                                                                            }

                                                                        }} >
                                                                            <Box component={'img'} src={sorteddata[sorteddata.length - 1]?.status == "Medical" ?
                                                                                Images.blueCircle :
                                                                                sorteddata[sorteddata.length - 1]?.status == "Stamping" ?
                                                                                    Images.successIcon :
                                                                                    sorteddata[sorteddata.length - 1]?.status == "Emirates Id" ?
                                                                                        Images.lightGreenCircle :
                                                                                        sorteddata[sorteddata.length - 1]?.status == "Entry permit"  ?

                                                                                            Images.pendingIcon :  sorteddata[sorteddata.length - 1]?.status == "Change Status"  ? Images.pendingIcon  :   Images.errorIcon} width={'13px'}></Box>
                                                                            {sorteddata[sorteddata.length - 1]?.status}
                                                                        </Box>
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        <Box>
                                                                            <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/view-candidate-detail/${item?.id}`)} width={'35px'}></Box>

                                                                        </Box>
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


                            {loader && <CircleLoading />}


                        </Box>}





                    </Grid>
                </Grid>

            </Box>
        </Box>
    );
}

export default VisaDetail;
