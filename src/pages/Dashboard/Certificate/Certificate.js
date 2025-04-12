import { Box, Divider, Grid, Typography } from '@mui/material'
import { drawDOM, exportPDF } from '@progress/kendo-drawing'
import { PDFExport } from '@progress/kendo-react-pdf'
import Colors from 'assets/Style/Colors'
import axios from 'axios'
import { PrimaryButton } from 'components/Buttons'
import { showPromiseToast } from 'components/NewToaster'
import { ErrorToaster } from 'components/Toaster'
import instance from 'config/axios'
import moment from 'moment'
import React, { useRef } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CustomerServices from 'services/Customer'
import routes from 'services/System/routes'
import { CleanTypes, getFileSize } from 'utils'


const Certificate = () => {
    const contentRef = useRef(null);
    const { state } = useLocation()
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    console.log(state);
    const [loading, setLoading] = useState(false)
    const allowFilesType = [
        
        'application/pdf', 
       
      ];

    // *For Upload Document
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

                handleUpload(file, arr);
                const path = await handleUpload(file, arr);
                console.log('Uploaded file path:', path);
                console.log(path, 'pathpathpath');
                return path
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
            console.log(formData);
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
console.log(state);

    const createCertificate = async (path) => {
        setLoading(true)

        try {
            let obj = {

                candidate_id: state?.id,
                candidate_name: state?.name,
                certificate: path
            }
            console.log(obj);
            const promise = CustomerServices.CreateCertificate(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/salary-certificate')
            }






        } catch (error) {

        } finally {
            setLoading(false);
        }
    }
    const handleExportWithComponent = (pdfExportComponent) => {
        pdfExportComponent.current.save();
    };

    const sendBlobPreview = async (base64, name) => {
        let obj = {
            document: base64,
            filename: name

        }

        try {
            const response = await axios.post(process.env.REACT_APP_BASE_URL + '/system/uploadDocumentsBase64', obj);

            console.log('Upload successful:', response.data.data.path);
            createCertificate(response?.data?.data?.path)

        } catch (error) {
            console.error('Error uploading the file:', error);
        }
    };
    const exportPDFWithMethod = () => {
        let gridElement = document.getElementById("pdf");
        drawDOM(gridElement, {
            paperSize: "A4",
        })
            .then((group) => {
                return exportPDF(group);
            })
            .then((dataUri) => {
                console.log(dataUri.split(";base64,")[1]);
                console.log(state?.selectedItem);
                
                sendBlobPreview(dataUri.split(";base64,")[1], moment().unix() + `_${state?.name}-SalaryCertificate.pdf`);
            });
    };


    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, p: 3 }}>

                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <PrimaryButton
                        bgcolor={Colors.buttonBg}
                        title="Save"
                        onClick={() => {
                            handleExportWithComponent(contentRef);
                            exportPDFWithMethod()
                        }}
                    />
                </Box>

            </Box>
            <PDFExport paperSize={'A4'} ref={contentRef}
                fileName="Salary Certificate"
            >
                <Box component={'div'} id='pdf'
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        padding: 3,
                        border: '1px solid white',
                        borderRadius: 2,
                        maxWidth: 800,
                        margin: '0 auto',
                        marginTop: 5,
                    }}
                >
                    <Typography variant="h4" align="center" gutterBottom>
                        Salary Certificate
                    </Typography>
                    <Divider sx={{ backgroundColor: 'white', marginY: 2 }} />
                    <Typography paragraph>
                        This is to certify that Mr. / Miss/ Mrs. <span style={{ textDecoration: 'underline' }}>{state?.name}</span>    is working with our esteemed organization / company    since <span style={{ textDecoration: 'underline' }}>________________</span>. We found this gentleman fully committed to his/her job and totally sincere towards this organization/company.
                    </Typography>
                    <Typography paragraph>
                        We are issuing this letter on the specific request of our employee without accepting any liability on behalf of this letter or part of this letter on our organization / company.
                    </Typography>
                    <Divider sx={{ backgroundColor: 'white', marginY: 2 }} />
                    <Typography paragraph>Regards,</Typography>
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} mt={5}>
                                <Typography>
                                    ___________________
                                    <br />
                                    Signature
                                    <br />
                                    Date
                                    <br />
                                    {moment().format('MM-DD-YYYY')}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </PDFExport>
        </>
    )
}

export default Certificate
