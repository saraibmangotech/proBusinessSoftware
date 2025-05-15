import UploadFile from 'components/UploadFile';
import { Box, Grid, Typography } from '@mui/material';
import Colors from 'assets/Style/Colors';
import DatePicker from 'components/DatePicker';
import { ErrorToaster } from 'components/Toaster';
import instance from 'config/axios';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import routes from 'services/System/routes';
import { CleanTypes, Debounce2, getFileSize } from 'utils';
import { PrimaryButton } from 'components/Buttons';
import CommissionServices from 'services/Commission';
import { showErrorToast, showPromiseToast } from 'components/NewToaster';
import InputField from 'components/Input';
import LabelCustomInput from 'components/Input/LabelCustomInput';
import { useNavigate } from 'react-router-dom';
import { useCallbackPrompt } from 'hooks/useCallBackPrompt';
import CustomerServices from 'services/Customer';
import { addMonths } from 'date-fns';
import moment from 'moment';

const CreateAgent = () => {
    const [submit, setSubmit] = useState(true)
    const allowFilesType = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const [handleBlockedNavigation] =
        useCallbackPrompt(submit)

    const { register, handleSubmit, getValues, setValue, formState: { errors }, setError } = useForm();
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [tradeLiscense, setTradeLiscense] = useState()
    const [loader, setLoader] = useState(false)

    const [emirateIds, setEmirateIds] = useState()
    const [passport, setPassport] = useState()
    const [otherDoc, setOtherDoc] = useState()
    const [agreement, setAgreement] = useState()
    const [tradeLicenseWithExpiry, setTradeLicenseWithExpiry] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [emirateIdsWithExpiry, setEmirateIdsWithExpiry] = useState('');

    const [agreementWithExpiry, setAgreementWithExpiry] = useState('');

    const [passportWithExpiry, setPassportWithExpiry] = useState(``)
    const [loading, setLoading] = useState(false)
    const [emailVerify, setEmailVerify] = useState(false)


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
    const handleDocArrayUpdate = async (field, value, key) => {
        console.log(documents);

        if (field === 'path') {
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
                    return { ...doc, expiry_date: value }; // Update the path
                }
                return doc; // Return the document as is if the key doesn't match
            });
            console.log(updatedDocuments);
            setDocuments(updatedDocuments)
            // Handle other fields if needed
        }
    }
    //documents array
    const [documents, setDocuments] = useState([








        {
            name: "Trade License",
            key: "tradeLicense",
            path: "",
            expiry_date: null,
            is_required: true
        },
        {
            name: "Passport",
            key: "passport",
            path: "",
            expiry_date: null,
            is_required: true
        },
        {
            name: "Emirate Id's",
            key: "emirateIds",
            path: "",
            expiry_date: null,
            is_required: true
        },

        {
            name: "Agreement",
            key: "Agreement",
            path: "",
            expiry_date: null,
            is_required: true
        },
        {
            name: "Other doc",
            key: "otherdoc",
            path: "",
            expiry_date: null
        },
    ]
    )
    // *For Upload Document
    const handleUploadDocument = async (e, key) => {
        setLoader(key)
        try {
            e.preventDefault();
            let path = "";
            console.log(e.target.files, "length");

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
                    if (allowFilesType.includes(file.type)) {
                        // Add the current date before the file name
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
                    } else {
                        showErrorToast(`File type ${file.type} is not allowed.`);
                    }
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
    const verifyEmail = async (value) => {
        let email = getValues('email')
        if (email) {

            try {
                let obj = {
                    email: email.toLowerCase(),

                    validate: true


                };

                console.log(obj);

                const { status } = await CustomerServices.addCustomer(obj);

                console.log(status);
                if (status) {
                    setEmailVerify(true)
                }


            } catch (error) {
                console.log(error);
                setEmailVerify(false)
                showErrorToast(error)
            }
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
    const CreateNewAgent = async (formData) => {
        setSubmit(false)
        setLoading(true)
        console.log(formData);
        let data = documents.find(item => item.key == 'passport')
        console.log(data,'asdasad');

        const currentDate = new Date();

        
        const checkExpiryDates = (documents) => {
            let hasExpired = false; // Initialize flag as false

            for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];

                if (
                    doc.expiry_date && // If the document has an expiry date
                    doc.key !== "passport" && // Exclude Passport
                    doc.key !== "otherdoc" // Exclude Other doc
                ) {
                    const expiryDate = moment(doc.expiry_date).startOf('day'); // Set expiryDate to start of the day
                    const currentDate = moment().startOf('day'); // Set currentDate to start of the day
                    
                    console.log(expiryDate.format('YYYY-MM-DD')); // Format for clear output
                    console.log(currentDate.format('YYYY-MM-DD'));
                    
                    if (expiryDate.isBefore(currentDate)) {
                        showErrorToast(`${doc.name} Date is not Valid.`);
                        hasExpired = true; // Set flag to true if any document is expired
                        break;
                    }
                }   
            }

            return hasExpired; // Return true if any document is expired, otherwise false
        };

        const result = checkExpiryDates(documents);

        if (moment(data?.expiry_date).startOf('day') < moment().add(6, 'months').startOf('day') && !result) {

            showErrorToast('Passport Expiry Date Must Be greater than ' + moment().add(6, 'months').startOf('day').format('MM-DD-YYYY'));
        
        }
        
        else if (result){

        }

        else {


            try {
                let obj = {
                    name: formData?.agentName,
                    email: formData?.email,
                    commission_visa: formData?.commissionVisa,
                    commission_monthly: formData?.commissionMonthly,
                    documents: documents

                }
                console.log(obj);
                const promise = CommissionServices.CreateAgent(obj);

                showPromiseToast(
                    promise,
                    'Saving ...',
                    'Success',
                    'Something Went Wrong'
                );
                const response = await promise;
                if (response?.responseCode === 200) {
                    navigate('/commission-list')
                }






            } catch (error) {

            } finally {
                setLoading(false);
            }
        }
    }
    return (
        <div>
            <Box sx={{ p: 3 }} component={'form'} onSubmit={handleSubmit(CreateNewAgent)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >ADD NEW</Typography>
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                        <PrimaryButton
                           bgcolor={'#001f3f'}
                            title="Save"
                            disabled={!emailVerify ? true : false}
                            type={'submit'}


                        />

                    </Box>
                </Box>


                <Grid container sx={{ gap: '5px 25px' }}>
                    <Grid item xs={5}>
                        <InputField
                            label={"Agent Name :*"}
                            size={'small'}
                            placeholder={"Agent Name"}
                            error={errors?.agentName?.message}
                            register={register("agentName", {
                                required:
                                    "Please enter your agent name."

                            })}
                        /></Grid>
                    <Grid item xs={5}>
                        <InputField
                            label={"Email :*"}
                            size={"small"}
                            placeholder={"Email"}
                            error={errors?.email?.message}
                            register={register("email", {
                                required: "Please enter your email.",
                                onChange: (e) => {
                                    console.log('asdas');

                                    Debounce2(() => verifyEmail());
                                    // Delay the execution of verifyEmail by 2 seconds

                                },
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Please enter a valid email address."
                                },

                            })}
                        />
                    </Grid>
                    <Grid container sx={{ gap: '5px 25px' }}>
                        <Grid item xs={5} >
                            <LabelCustomInput label={'Commission on Visa :* '} max={100} step={'0.01'} StartLabel={'%'} placeholder={'Enter Percentage'} error={errors?.commissionVisa?.message} register={register("commissionVisa", { required: "Enter commission on Visa" })} />
                        </Grid>
                        <Grid item xs={5} >
                            <LabelCustomInput label={'Commission on Monthly Revenue :* '} max={100}  step={'0.01'} StartLabel={'%'} placeholder={'Enter Percentage'} error={errors?.commissionMonthly?.message} register={register("commissionMonthly", { required: "Enter Monthly Commission" })} />
                        </Grid>
                    </Grid>


                </Grid>
                <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2, mt: 2 }}>Upload Documents: </Typography>

                <Grid container sx={{ gap: '5px 25px' }}>
                    <Grid item xs={5}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Trade License:* </Typography>
                        <UploadFile
                            Memo={true}
                            accept={allowFilesType}
                            file={documents}
                            multiple={true}

                            updateResult={updateResult}
                            fileId={'tradeLicense'}
                            error={errors?.tradeLicense?.message}
                            loader={loader}
                            disabled={isUploading} // Disable while uploading
                            register={register(`tradeLicense`, {
                                required: documents.find((item => item?.key == 'tradeLicense'))?.path != '' ? false :
                                    "Please upload your trade license.",
                                onChange: async (e) => {
                                    setIsUploading(true); // Set uploading to true when the upload starts
                                    const path = await handleUploadDocument(e, "tradeLicense");
                                    if (path) {
                                        handleDocArrayUpdate('path', path, 'tradeLicense');
                                        console.log(path);
                                    }
                                    setIsUploading(false); // Reset uploading status when done
                                }
                            })}
                        />

                        {/* <UploadFile
                  Memo={true}
                  accept={allowFilesType}
                  file={documents}
                  multiple={true}
                  updateResult={updateResult}
                  fileId={'tradeLicense'}
                  error={errors?.tradeLicense?.message}
                  register={register("tradeLicense", {
                    required:
                      documents.find((item => item?.key == 'tradeLicense'))?.path != '' ? false :
                        "Please upload your trade license ."
                    ,
                    onChange: async (e) => {
                      const path = await handleUploadDocument(e);
                      if (path) {
                        setTradeLiscense(path);
                        handleDocArrayUpdate('path', path, 'tradeLicense')
                      }
                    }
                  })}
                /> */}

                    </Grid>
                    <Grid item xs={5}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Passport :* </Typography>
                        <UploadFile
                            Memo={true}
                            accept={allowFilesType}
                            file={documents}
                            multiple={true}
                            updateResult={updateResult}
                            fileId={'passport'}
                            error={errors?.passport?.message}
                            loader={loader}
                            disabled={isUploading} // Disable while uploading
                            register={register(`passport`, {
                                required: documents.find((item => item?.key == 'passport'))?.path != '' ? false :
                                    "Please upload your passport.",
                                onChange: async (e) => {
                                    setIsUploading(true); // Set uploading to true when the upload starts
                                    const path = await handleUploadDocument(e, "passport");
                                    if (path) {
                                        handleDocArrayUpdate('path', path, 'passport');
                                        console.log(path);
                                    }
                                    setIsUploading(false); // Reset uploading status when done
                                }
                            })}
                        />

                    </Grid>
                    <Grid item xs={5}><DatePicker
                        disablePast={true}
                        size={"small"}
                        label={"Trade License  Expiry Date :*"}
                        value={tradeLicenseWithExpiry}
                        error={errors?.LiscenseExp?.message}
                        register={register("LiscenseExp", {
                            required:

                                "please enter your License expiry date."

                        })}
                        onChange={(date) => {

                            setValue('LiscenseExp', date)
                            setTradeLicenseWithExpiry(new Date(date))
                            handleDocArrayUpdate('date', new Date(date), 'tradeLicense')
                        }}
                    /></Grid>
                    <Grid item xs={5}><DatePicker
                        disablePast={true}
                        size={"small"}
                        label={"Passport Expiry Date :*"}
                        value={passportWithExpiry}
                        minDate={addMonths(new Date(), 6)}
                        error={errors?.passportExp?.message}
                        register={register("passportExp", {
                            required:

                                "please enter your passport expiry date."

                        })}
                        onChange={(date) => {

                            setValue('passportExp', date)
                            setPassportWithExpiry(new Date(date))
                            handleDocArrayUpdate('date', new Date(date), 'passport')
                        }}
                    /></Grid>
                    <Grid item xs={5}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Emirate ID's:* </Typography>
                        <UploadFile
                            Memo={true}
                            accept={allowFilesType}
                            file={documents}
                            multiple={true}
                            updateResult={updateResult}
                            fileId={'emirateIds'}
                            error={errors?.emirateIds?.message}
                            loader={loader}
                            disabled={isUploading} // Disable while uploading
                            register={register(`emirateIds`, {
                                required: documents.find((item => item?.key == 'emirateIds'))?.path != '' ? false :
                                    "Please upload your trade emirateIds.",
                                onChange: async (e) => {
                                    setIsUploading(true); // Set uploading to true when the upload starts
                                    const path = await handleUploadDocument(e, "emirateIds");
                                    if (path) {
                                        handleDocArrayUpdate('path', path, 'emirateIds');
                                        console.log(path);
                                    }
                                    setIsUploading(false); // Reset uploading status when done
                                }
                            })}
                        />

                    </Grid>

                    <Grid item xs={5}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Agreement :* </Typography>
                        <UploadFile
                            Memo={true}
                            accept={allowFilesType}
                            error={errors?.Agreement?.message}
                            file={documents}
                            multiple={true}
                            updateResult={updateResult}
                            fileId={'Agreement'}
                            loader={loader}
                            disabled={isUploading} // Disable while uploading
                            register={register(`Agreement`, {
                                required: documents.find((item => item?.key == 'Agreement'))?.path != '' ? false :
                                    "Please upload your trade Agreement.",
                                onChange: async (e) => {
                                    setIsUploading(true); // Set uploading to true when the upload starts
                                    const path = await handleUploadDocument(e, "Agreement");
                                    if (path) {
                                        handleDocArrayUpdate('path', path, 'Agreement');
                                        console.log(path);
                                    }
                                    setIsUploading(false); // Reset uploading status when done
                                }
                            })}
                        />

                    </Grid>
                    <Grid item xs={5}><DatePicker
                        disablePast={true}
                        size={"small"}
                        label={"Emirate ID's  Expiry Date :*"}
                        value={emirateIdsWithExpiry}
                        error={errors?.emirateIDsExpiry?.message}
                        register={register("emirateIDsExpiry", {
                            required:

                                "please enter your passport expiry date."

                        })}
                        onChange={(date) => {

                            setValue('emirateIDsExpiry', date)
                            setEmirateIdsWithExpiry(new Date(date))
                            handleDocArrayUpdate('date', new Date(date), 'emirateIds')
                        }}
                    /></Grid>
                    <Grid item xs={5}><DatePicker
                        disablePast={true}
                        size={"small"}
                        label={"Agreement Expiry Date :*"}
                        value={agreementWithExpiry}
                        error={errors?.agreementExpiry?.message}
                        register={register("agreementExpiry", {
                            required:

                                "please enter your agreement expiry date."

                        })}
                        onChange={(date) => {

                            setValue('agreementExpiry', date)
                            setAgreementWithExpiry(new Date(date))
                            handleDocArrayUpdate('date', new Date(date), 'Agreement')
                        }}
                    /></Grid>


                    <Grid item xs={5}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Other Documents : </Typography>
                        <UploadFile
                            Memo={true}
                            accept={allowFilesType}
                            file={documents}
                            multiple={true}
                            updateResult={updateResult}
                            fileId={'otherdoc'}
                            error={errors?.otherdoc?.message}
                            loader={loader}
                            disabled={isUploading} // Disable while uploading
                            register={register(`otherdoc`, {
                                required: false,

                                onChange: async (e) => {
                                    setIsUploading(true); // Set uploading to true when the upload starts
                                    const path = await handleUploadDocument(e, "otherdoc");
                                    if (path) {
                                        handleDocArrayUpdate('path', path, 'otherdoc');
                                        console.log(path);
                                    }
                                    setIsUploading(false); // Reset uploading status when done
                                }
                            })}
                        />

                    </Grid>
                </Grid>


            </Box>
        </div>
    )
}

export default CreateAgent
