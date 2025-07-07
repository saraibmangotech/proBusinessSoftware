"use client"

import { Box, Typography } from "@mui/material"
import axios from "axios"
import moment from "moment"
import { saveAs } from "file-saver"
import htmlDocx from "html-docx-js/dist/html-docx"
import { PrimaryButton } from "components/Buttons"
import { showPromiseToast } from "components/NewToaster"
import { ErrorToaster } from "components/Toaster"
import instance from "config/axios"
import CustomerServices from "services/Customer"
import routes from "services/System/routes"
import { agencyType, CleanTypes, getFileSize } from "utils"
import { useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Images } from "assets"


const ExpCertificate = () => {
    const contentRef = useRef(null)
    const { state } = useLocation()
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0)
    const [uploadedSize, setUploadedSize] = useState(0)
    const [loading, setLoading] = useState(false)

    // Function to convert image to base64
    const getImageAsBase64 = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)
                const dataURL = canvas.toDataURL("image/png")
                resolve(dataURL)
            }
            img.onerror = reject
            img.src = url
        })
    }

    console.log(state)

    const allowFilesType = ["application/pdf"]

    // *For Upload Document
    const handleUploadDocument = async (e) => {
        try {
            e.preventDefault()
            const file = e.target.files[0]
            const arr = [
                {
                    name: file?.name,
                    file: "",
                    type: file?.type.split("/")[1],
                    size: getFileSize(file.size),
                    isUpload: false,
                },
            ]
            if (allowFilesType.includes(file.type)) {
                handleUpload(file, arr)
                const path = await handleUpload(file, arr)
                console.log("Uploaded file path:", path)
                console.log(path, "pathpathpath")
                return path
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
            const formData = new FormData()
            formData.append("document", file)
            console.log(formData)
            const { data } = await instance.post(routes.uploadDocuments, formData, {
                onUploadProgress: (progressEvent) => {
                    const uploadedBytes = progressEvent.loaded
                    const percentCompleted = Math.round((uploadedBytes * 100) / progressEvent.total)
                    setProgress(percentCompleted)
                    console.log(getFileSize(uploadedBytes))
                    setUploadedSize(getFileSize(uploadedBytes))
                },
            })
            if (data) {
                docs[0].isUpload = true
                docs[0].file = data?.data?.nations
                console.log(data, "asddasasd")
                return data?.data?.path
            }
        } catch (error) {
            ErrorToaster(error)
        }
    }
    console.log(state, 'state');

    const createCertificate = async (path) => {
        setLoading(true)
        try {
            const obj = {
                type: "experience",                //"experience"
                reference_number: state?.reference,
                to: state?.to,
                forField: state?.for,
                employee_id: state?.user_id,
                content:'12'
            }
            console.log(obj)
            const promise = CustomerServices.CreateCertificate(obj)
            showPromiseToast(promise, "Saving ...", "Success", "Something Went Wrong")
            const response = await promise
            if (response?.responseCode === 200) {
                navigate("/experience-certificate")
            }
        } catch (error) {
            console.error("Error creating certificate:", error)
        } finally {
            setLoading(false)
        }
    }

    const sendBlobPreview = async (base64, name) => {
        const obj = {
            document: base64,
            filename: name,
        }
        try {
            const response = await axios.post(process.env.REACT_APP_BASE_URL + "/system/uploadDocumentsBase64", obj)
            console.log("Upload successful:", response.data.data.path)
            createCertificate(response?.data?.data?.path)
        } catch (error) {
            console.error("Error uploading the file:", error)
        }
    }

    const exportDOCWithMethod = async () => {
        const refNumber = `HR-01-SC-${moment().format("DDMM")}-${moment().format("MM-YYYY")}`
        const currentDate = moment().format("D MMM YYYY")
        const fileName = `${moment().unix()}_${state?.name}-SalaryCertificate.docx`

        // Convert logo to base64
        let logoBase64 = ""
        try {
            logoBase64 = await getImageAsBase64(agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? Images.tasheel : Images.aldeed )
        } catch (error) {
            console.error("Error converting logo to base64:", error)
            // Fallback to placeholder if logo conversion fails
            logoBase64 =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }

        // Get the HTML content matching the professional format
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Salary Certificate</title>
                    <style>
                        body { 
                            font-family: 'Times New Roman', serif; 
                            line-height: 1.4; 
                            max-width: 800px; 
                            margin: 0 auto; 
                            padding: 40px 60px;
                            font-size: 12pt;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 40px;
                            border-bottom: 2px solid #000;
                            padding-bottom: 20px;
                        }
                        .logo {
                            width: 80px;
                            height: 80px;
                            margin: 0 auto 20px;
                        }
                        .company-name {
                            font-size: 16pt;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        .company-details {
                            font-size: 10pt;
                            color: #666;
                        }
                        .ref-section {
                            margin: 30px 0;
                            font-size: 11pt;
                        }
                        .ref-number {
                            margin-bottom: 10px;
                        }
                        .date {
                            margin-bottom: 20px;
                        }
                        .to-section {
                            margin-bottom: 30px;
                            font-size: 11pt;
                        }
                        .certificate-title {
                            text-align: center;
                            font-size: 14pt;
                            font-weight: bold;
                            text-decoration: underline;
                            margin: 40px 0 30px 0;
                        }
                        .content {
                            text-align: justify;
                            margin: 20px 0;
                            font-size: 11pt;
                            line-height: 1.6;
                        }
                        .employee-details {
                            font-weight: bold;
                        }
                        .signature-section {
                            margin-top: 80px;
                            font-size: 11pt;
                        }
                        .signature-line {
                            margin-top: 60px;
                            border-bottom: 1px solid #000;
                            width: 200px;
                        }
                        .footer {
                            margin-top: 60px;
                            border-top: 2px solid #000;
                            padding-top: 20px;
                            font-size: 9pt;
                            text-align: center;
                            color: #666;
                        }
                        .underline {
                            text-decoration: underline;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="${logoBase64}" 
                                 alt="Company Logo" 
                                 style="width: 80px; height: 80px; margin: 0 auto; display: block;" />
                        </div>
                      
                    </div>

                    <div class="ref-section">
                        <div class="ref-number">Ref: ${state?.reference}</div>
                        <div class="date">Date: ${currentDate}</div>
                    </div>

                    <div class="to-section">
                        <div><strong>To,</strong></div>
                        <div>${state?.to}</div>
                        <div>UAE</div>
                    </div>

                    <div class="certificate-title">SALARY CERTIFICATE</div>

                    <div class="content">
                        <p>This is to certify that, <span class="employee-details underline">${state?.user?.name || "Employee Name"}</span>, passport no. <span class="employee-details">${state?.passport_number || "-"}</span>, was working in the capacity of <span class="employee-details">"Legal Assistant"</span> in our esteemed organization from <span class="employee-details">1st September 2022</span> to <span class="employee-details">present</span>. During his/her tenure, he/she has shown dedication, professionalism and commitment to his/her duties.</p>

                        <p>We found him/her to be honest, hardworking and of good conduct. We wish him/her all the best in his/her future endeavors.</p>
                    </div>

                  

                    <div class="signature-section">
                        <p><strong>Authorized Signatory</strong></p>
                        <p><strong>Human Resources Department</strong></p>
                        <div class="signature-line"></div>
                        <p style="margin-top: 10px;">Date: ${currentDate}</p>
                    </div>

                    <div class="footer">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 33%; text-align: left; vertical-align: top; font-size: 9pt;">
                                    www.premiumservices.ae
                                </td>
                                <td style="width: 34%; text-align: center; vertical-align: top; font-size: 9pt;">
                                    ${agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL"
                ? "Premium Businessmen Services"
                : 'For Premium Professional Government Services L.L.C.'}<br/>
                                   P.O. Box 334338, United Arab   Emirates<br/>
                                
                                    Telephone: +971 4 520 4444
                                </td>
                                <td style="width: 33%; text-align: right; vertical-align: top; font-size: 9pt; direction: rtl;">
                                    بريميم بروفيشنال الخدمات الحكومية<br/>
                                    ش.ذ.م.م ص.ب 334338<br/>
                                    في الإمارات العربية المتحدة<br/>
                                    هاتف: 4444 520 4 971+
                                </td>
                            </tr>
                        </table>
                    </div>
                </body>
            </html>
        `

        // Convert HTML to DOC
        const converted = htmlDocx.asBlob(htmlContent)

        // Save the file
        saveAs(converted, fileName)

        // Convert to base64 for upload (if needed)
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result.split(",")[1]
            sendBlobPreview(base64, `${state?.user?.name}_Salary_Certificate`)
        }
        reader.readAsDataURL(converted)
    }

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, p: 3 }}>
                <Box sx={{ display: "flex", gap: "10px" }}>
                    <PrimaryButton
                        bgcolor={"#001f3f"}
                        title="Save"
                        onClick={() => {
                            exportDOCWithMethod()
                        }}
                        disabled={loading}
                    />
                </Box>
            </Box>

            <Box
                ref={contentRef}
                component={"div"}
                id="doc"
                sx={{
                    backgroundColor: "white",
                    color: "black",
                    padding: 4,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    maxWidth: 800,
                    margin: "0 auto",
                    marginTop: 3,
                    fontFamily: "Times New Roman, serif",
                }}
            >
                {/* Header Section */}
                <Box sx={{ textAlign: "center", mb: 4, pb: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <img
                            src={agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? Images.tasheel : Images.aldeed  }
                            alt="Company Logo"
                            style={{
                                width: "150px",
                                height: "150px",
                                display: "block",
                                margin: "0 auto",
                            }}
                        />
                    </Box>

                </Box>

                {/* Reference Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Ref: {state?.reference}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Date: {moment().format("D MMM YYYY")}
                    </Typography>
                </Box>

                {/* To Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                        To,
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {state?.to}
                    </Typography>
                    <Typography variant="body2">UAE</Typography>
                </Box>

                {/* Certificate Title */}
                <Typography
                    variant="h6"
                    align="center"
                    sx={{
                        textDecoration: "underline",
                        fontWeight: "bold",
                        my: 4,
                    }}
                >
                    SALARY CERTIFICATE
                </Typography>

                {/* Main Content */}
                <Box sx={{ textAlign: "justify", mb: 3 }}>
                    <Typography paragraph sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                        This is to certify that{" "}
                        <span style={{ textDecoration: "underline", fontWeight: "bold" }}>{state?.user?.name || "Employee Name"}</span> •{" "}
                        <strong>{state?.designation}</strong>, Passport no: <strong>{state?.passport_number || "-"}</strong> is
                        currently employed by our company since <strong>{moment(state?.date_of_joining).format('DD-MMMM-YYYY')}</strong> till now, in the capacity of{" "}
                        <strong>{state?.department}</strong>. His monthly Gross salary is{" "}
                        <strong>AED {parseFloat(state?.basic_salary || 0) + parseFloat(state?.housing_allowance || 0) + parseFloat(state?.transport_allowance || 0) + parseFloat(state?.other_allowance || 0)}</strong> inclusive.
                    </Typography>

                    <Typography paragraph sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                        This certificate has been issued at the request of the employee, for whatever purpose it may serve him
                        without any legal obligation to the company.
                    </Typography>
                </Box>

                <Typography paragraph sx={{ fontWeight: "bold", mt: 3 }}>

                    {agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "Premium Businessmen Services" : 'For Premium Professional Government Services L.L.C.'}

                </Typography>

                {/* Signature Section */}
                <Box sx={{ mt: 6 }}>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Authorized Signatory</Typography>
                    <Typography sx={{ fontWeight: "bold", mb: 4 }}>Human Resources Department</Typography>
                    <Box sx={{ borderBottom: "1px solid #000", width: "200px", mb: 1 }}></Box>
                    <Typography variant="body2">Date: {moment().format("D MMM YYYY")}</Typography>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        mt: 6,
                        borderTop: "2px solid #000",
                        pt: 2,
                        fontSize: "0.8rem",
                        color: "#666",
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box sx={{ flex: 1, textAlign: "left" }}>
                            <Typography variant="body2">www.premiumservices.ae</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                {agencyType[process.env.REACT_APP_TYPE]?.category === "TASHEEL" ? "Premium Businessmen Services" : 'For Premium Professional Government Services L.L.C.'}

                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Services L.L.C P.O. Box 334338, United Arab Emirates
                            </Typography>

                            <Typography variant="body2">Telephone: +971 4 520 4444</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: "right", direction: "rtl" }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                بريميم بروفيشنال الخدمات الحكومية
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                ش.ذ.م.م ص.ب 334338
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                في الإمارات العربية المتحدة
                            </Typography>
                            <Typography variant="body2">هاتف: 4444 520 4 971+</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default ExpCertificate
