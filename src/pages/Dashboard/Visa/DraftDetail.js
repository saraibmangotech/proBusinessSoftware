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
import { Button } from "@mui/material";
import UploadFile from "components/UploadFile";
import { CleanTypes, formatPermissionData, getFileSize } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";

import moment from "moment";
import styled from "@emotion/styled";
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




function DraftDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tableHead1 = [{ name: 'SR No.', key: '' }, { name: 'Date ', key: 'name' }, { name: 'Customer Name', key: 'visa_eligibility' }, { name: 'Candidate Name', key: 'deposit_total' }, { name: 'Visa Rates', key: '' }, { name: 'Status', key: '' }, { name: 'Actions', key: '' }]
    const { register, setValue, getValues, control, handleSubmit, formState: { errors } } = useForm();
    let buttonEnabled = true
    // *For Dialog Box
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [confirmationDialog2, setConfirmationDialog2] = useState(false);
    const [loader, setLoader] = useState(false);
    const [open, setOpen] = useState(false)

    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [scroll, setScroll] = React.useState('paper');
    const [selectedId, setSelectedId] = useState()
    // *For Customer Detail
    const [visaDetail, setVisaDetail] = useState();

    // *For International Country Code
    const [intCode, setIntCode] = useState();
    // *For Countries
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    // *For Expiration Date
    const [passportExp, setPassportExp] = useState();
    const [editUser, setEditUser] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [permissions, setPermissions] = useState([])
    const allowFilesType = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    //documents array
    const [documents, setDocuments] = useState(
        [
            {
                name: "Employee Undertaking",
                key: "undertaking",
                path: "",
                expiry_date: null,
                is_required: true


            },
            {
                name: "Company Undertaking",
                key: "cundertaking",
                path: "",
                expiry_date: null,
                is_required: true
            },

            {
                name: "Passport Copy",
                key: "passportcopy",
                path: "",
                expiry_date: null,
                is_required: true
            },
            {
                name: "Digital Photo",
                key: "digitalphoto",
                path: "",
                expiry_date: null,
                is_required: true
            },
            {
                name: "Employment Contract",
                key: "contract",
                path: "",
                expiry_date: null,
                is_required: true
            },
            {
                name: "Offer Letter",
                key: "offerletter",
                path: "",
                expiry_date: null,
                is_required: true
            },
            {
                name: "Previous Emirates Ids",
                key: "emiratesids",
                path: "",
                expiry_date: null,
                is_required: false
            },
            {
                name: "Previous UAE Visa Copy",
                key: "uaevisa",
                path: "",
                expiry_date: null,
                is_required: false
            },
            {
                name: "Cancellation",
                key: "cancellation",
                path: "",
                expiry_date: null,
                is_required: false
            },
            {
                name: "UAE Driving License",
                key: "drivinglicense",
                path: "",
                expiry_date: null,
                is_required: false
            },
            {
                name: "Work Permit",
                key: "workpermit",
                path: "",
                expiry_date: null,
                is_required: false
            },
            {
                name: "Other Documents",
                key: "otherdoc",
                path: "",
                expiry_date: null,
                is_required: false
            },

        ]
    )

    const checkRequiredDocuments = (docs) => {
        if (docs.length < 1) {
            return false
        }
        else {

            return docs
                .filter(doc => doc.is_required)
                .every(doc => doc.path);
        }
    };
    const UploadCandidateDocs = async (formData) => {
        try {
            let obj = {
                id: selectedId,
                documents: documents
            };


            const promise = VisaServices.UploadCandidateDocs(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            const response = await promise;
            if (response?.responseCode === 200) {
                setOpen(false)
                getVisaDetail()
                setDocuments([
                    {
                        name: "Employee Undertaking",
                        key: "undertaking",
                        path: "",
                        expiry_date: null,
                        is_required: true


                    },
                    {
                        name: "Company Undertaking",
                        key: "cundertaking",
                        path: "",
                        expiry_date: null,
                        is_required: true
                    },

                    {
                        name: "Passport Copy",
                        key: "passportcopy",
                        path: "",
                        expiry_date: null,
                        is_required: true
                    },
                    {
                        name: "Digital Photo",
                        key: "digitalphoto",
                        path: "",
                        expiry_date: null,
                        is_required: true
                    },
                    {
                        name: "Employment Contract",
                        key: "contract",
                        path: "",
                        expiry_date: null,
                        is_required: true
                    },
                    {
                        name: "Offer Letter",
                        key: "offerletter",
                        path: "",
                        expiry_date: null,
                        is_required: true
                    },
                    {
                        name: "Previous Emirates Ids",
                        key: "emiratesids",
                        path: "",
                        expiry_date: null,
                        is_required: false
                    },
                    {
                        name: "Previous UAE Visa Copy",
                        key: "uaevisa",
                        path: "",
                        expiry_date: null,
                        is_required: false
                    },
                    {
                        name: "Cancellation",
                        key: "cancellation",
                        path: "",
                        expiry_date: null,
                        is_required: false
                    },
                    {
                        name: "UAE Driving License",
                        key: "drivinglicense",
                        path: "",
                        expiry_date: null,
                        is_required: false
                    },
                    {
                        name: "Work Permit",
                        key: "workpermit",
                        path: "",
                        expiry_date: null,
                        is_required: false
                    },
                    {
                        name: "Other Documents",
                        key: "otherdoc",
                        path: "",
                        expiry_date: null,
                        is_required: false
                    },

                ])
            }
        } catch (error) {
            console.log(error);
        } finally {
            // Any cleanup code goes here
        }
    };
    const PublishDraft = async (formData) => {
        try {
            let obj = {
                id: id,

            };


            const promise = VisaServices.PublishDraft(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );

            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/visa-list')
            }
        } catch (error) {
            console.log(error);
        } finally {
            // Any cleanup code goes here
        }
    };

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
    const handleClose = () => {
        setOpen(false);
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

    const handleDocArrayUpdate = async (e,field, value, key) => {
        console.log(documents);
        console.log(e,value,field,key,'valuevalue');
        if (field === 'path') {
            console.log(value,'valuevalue');
            
            if(!value){
                console.log(e.target);
                
                e.target.value = ''
            }
            const updatedDocuments = documents.map(doc => {
                if (doc.key === key) {
                    return { ...doc, path: value }; // Update the path
                }
                return doc; // Return the document as is if the key doesn't match
            });
            console.log(updatedDocuments);
            // Assuming you want to update the documents array
            // You can replace the following line with your state updating logic
            setDocuments(updatedDocuments)
        } else {
            const updatedDocuments = documents.map(doc => {
                if (doc.key === key) {
                    return { ...doc, expiry_date: moment(value).format('MM-DD-YYYY') }; // Update the path
                }
                return doc; // Return the document as is if the key doesn't match
            });
            console.log(updatedDocuments);
            setDocuments(updatedDocuments)
            // Handle other fields if needed
        }
    }

    const updateResult = (key, newResult) => {
        
        console.log(newResult)
        const updatedDocuments = documents.map(doc => {
            if (doc.key === key) {
                return { ...doc, path: newResult }; // Update the path
            }
            return doc; // Return the document as is if the key doesn't match
        });
        console.log(updatedDocuments, 'updatedDocuments');
        setDocuments(updatedDocuments)
    };

    // *For Upload Document
    const handleUploadDocument = async (e, key) => {
        setLoader(key)

        try {
            e.preventDefault();
            let path = "";
            console.log(e.target.files.length, "length");

            const inputElement = e.target; // Store a reference to the file input element

            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                let arr = [
                    {
                        name: file?.name,
                        file: "",
                        type: file?.type.split("/")[1],
                        size: getFileSize(file.size),
                        isUpload: false,
                    },
                ];

                let maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    showErrorToast('File Size Must Be Less than 10 MB');
                } else {
                    // Add the current date before the file name to ensure uniqueness
                    const currentDate = new Date().toISOString().split('T')[0]; // e.g., "2024-08-23"
                    const uniqueFileName = `${currentDate}_${file.name}`;

                    // Create a new file with the date-prefixed name
                    const newFile = new File([file], uniqueFileName, { type: file.type });

                    // Upload the file with the new name
                    const uploadedPath = await handleUpload(newFile, arr);

                    if (path) {
                        path += "," + uploadedPath;
                    } else {
                        path = uploadedPath;
                    }
                    setLoader(false)

                }
            }

            console.log(path, "path");

            // Clear the file input after processing
            inputElement.value = "";

            return path;
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
            let docs = data?.details?.documents
            console.log(formatPermissionData(data?.permissions))
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
            <Dialog
                component={'form'} onSubmit={handleSubmit(UploadCandidateDocs)}
                open={open}
                onClose={handleClose}
                maxWidth={'md'}
                fullWidth={true}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">Update Documents</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        <Grid container spacing={2}>







                            {documents?.length > 0 && documents?.map((item, index) => (


                                <Grid item xs={5} >
                                    {console.log(documents, 'documents')}
                                    {console.log(documents.find((item2 => item2?.key == item?.key)), item?.key)}


                                    <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>{item?.is_required ? item?.name : item?.name + " " + '(If Any)'} : {item?.is_required ? '*' : ''} </Typography>
                                    <UploadFile
                                        Memo={true}
                                        accept={allowFilesType}
                                        file={documents}
                                        multiple={true}
                                        updateResult={updateResult}
                                        fileId={item?.key}
                                        error={errors[item?.key]?.message}
                                        register={register(`${item?.key}`, {
                                            required: item?.is_required ? documents.find((item2 => item2?.key == item?.key))?.path != '' ? false :
                                            "Please upload document." : false,
                                            onChange: async (e) => {
                                                const path = await handleUploadDocument(e);
                                                if (path) {
                                                    handleDocArrayUpdate(e,'path', path, item?.key)
                                                    console.log(path)
                                                }
                                            }
                                        })}
                                    />


                                </Grid>


                            ))}


                        </Grid>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ fontFamily: 'Public Sans' }} onClick={handleClose}>Cancel</Button>
                    <Button sx={{ fontFamily: 'Public Sans' }} type='submit'>Update</Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >DRAFT DETAIL</Typography>
                <Box sx={{ display: 'flex', gap: '10px' }}>
                    {permissions?.publish && <PrimaryButton
                       bgcolor={'#bd9b4a'}
                        title="Publish"

                        onClick={() => {
                            if (!buttonEnabled) {
                                showErrorToast('Please Upload All Candidate Documents')
                            }
                            else {
                                PublishDraft()
                            }
                        }}


                    />}

                </Box>
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

            </Grid>
            <Box p={2}>


            </Box>
            <Box p={2}>
                <Typography
                    mb={2}
                    mt={2}
                    sx={{ color: "#03091A", fontWeight: "bold" }}
                    variant="h6"
                >
                    Security Deposit:
                </Typography>
                <Grid container spacing={4}>
                    {/* Security Deposit Section */}

                    <Grid item xs={12} sm={6}>
                        <Typography mb={2} mt={2} variant="body1">
                            Security Deposit Scenario:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {visaDetail?.customer?.security_deposit_scenario.toLowerCase() == "visa"
                                    ? "VISA"
                                    : "PAYROLL"}
                            </strong>
                        </Typography>

                        {visaDetail?.customer?.security_deposit_scenario.toLowerCase() != "visa" && <Typography mb={2} mt={2} variant="body1">
                            Payroll Percentage:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {visaDetail?.customer?.payroll_percentage} %
                            </strong>
                        </Typography>}
                        <Typography mb={2} mt={2} variant="body1">
                            Security Deposit:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {visaDetail?.customer?.deposit_total} AED
                            </strong>
                        </Typography>
                        <Typography mb={2} mt={2} variant="body1">
                            Previously Consumed:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {parseFloat(visaDetail?.customer?.deposit_total) - parseFloat(visaDetail?.customer?.deposit_balance || 0)} AED
                            </strong>
                        </Typography>


                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography mb={2} mt={2} variant="body1">
                            Deposit Available:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {visaDetail?.customer?.deposit_balance || 0} AED

                            </strong>
                        </Typography>

                        {/* <Typography mb={2} mt={2} variant="body1">
                            {visaDetail?.customer?.security_deposit_scenario == "payroll"
                                ? "Payroll Eligibility:"
                                : "Total Visa Quantity:"}{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {visaDetail?.customer?.security_deposit_scenario == "payroll"
                                    ? visaDetail?.customer?.payroll_eligibility + " " + "AED"
                                    : visaDetail?.customer?.visa_eligibility}
                            </strong>
                        </Typography> */}
                           {visaDetail?.customer?.security_deposit_scenario == 'visa' && <Typography mb={2} mt={2} variant="body1">{ 'Visa Eligibility Remaining : '} <strong style={{ color: "#0F2772" }}> { visaDetail?.customer?.visa_eligibility } </strong></Typography>}

                        <Typography mb={2} mt={2} variant="body1">
                            This VR Consumption:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {visaDetail?.total_deposit_charges} AED
                            </strong>
                        </Typography>
                        <Typography mb={2} mt={2} variant="body1">
                            Final Balance:{" "}
                            <strong style={{ color: "#0F2772" }}>
                                {parseFloat(visaDetail?.customer?.deposit_balance || 0) - parseFloat(visaDetail?.total_deposit_charges || 0)} AED
                            </strong>
                        </Typography>
                    </Grid>
                </Grid>
                <Typography
                    mb={2}
                    mt={2}
                    sx={{ color: "#03091A", fontWeight: "bold" }}
                    variant="h6"
                >
                    Total Visa Charges: <strong style={{ color: "#0F2772" }}>
                        {visaDetail?.total_visa_charges || 0} AED
                    </strong>
                </Typography>
                <Grid container>
                    <Box >
                        <Typography sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Candidates :</Typography>
                    </Box>
                </Grid>
                <Grid container spacing={4}>

                    <Grid item md={11}>
                        {<Box>


                            {(
                                visaDetail?.candidates.length > 0 && (
                                    <Fragment>
                                        <PDFExport landscape={true} paperSize="A4" margin={5} fileName='Import Customers' >

                                            <TableContainer
                                                component={Paper}
                                                sx={{
                                                    maxHeight: 'calc(100vh - 200px)', mt: 1, backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

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
                                                            let result = checkRequiredDocuments(item?.documents)
                                                            console.log(result);
                                                            if (!result) {
                                                                buttonEnabled = false
                                                            }

                                                            return (
                                                                <Row
                                                                    key={index}
                                                                    sx={{
                                                                        border: '1px solid #EEEEEE !important',
                                                                    }}
                                                                >

                                                                    <Cell style={{ textAlign: 'center' }} className="pdf-table">
                                                                        {item?.visa_id + "_" + item?.id}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {moment(item?.created_at).format("MM-DD-YYYY")}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {visaDetail?.customer?.name}
                                                                    </Cell>

                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {item?.name}
                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        {parseFloat(item?.visa_charges)}


                                                                    </Cell>

                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">

                                                                        {result ? <Box sx={{ cursor: 'pointer', textAlign: 'left' }}>Uploaded</Box> :

                                                                            <Box component={'div'} sx={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => {
                                                                                if (permissions?.status_update) {

                                                                                    setOpen(true);
                                                                                }
                                                                                setSelectedId(item?.id)
                                                                                if (item?.documents?.length > 0) {
                                                                                    setDocuments(item?.documents)
                                                                                }
                                                                            }}>
                                                                                Upload
                                                                            </Box>}

                                                                    </Cell>
                                                                    <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                                                        <Box>
                                                                            {permissions?.candidate_details && <Box component={'img'} src={Images.detailIcon} onClick={() => navigate(`/view-candidate-detail/${item?.id}`)} width={'35px'}></Box>}

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

export default DraftDetail;