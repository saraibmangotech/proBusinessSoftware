import { Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Typography } from '@mui/material'
import Colors from 'assets/Style/Colors'
import { PrimaryButton } from 'components/Buttons'
import DatePicker from 'components/DatePicker'
import InputField from 'components/Input'
import LabelCustomInput from 'components/Input/LabelCustomInput'
import { showErrorToast, showPromiseToast } from 'components/NewToaster'
import SelectField from 'components/Select'
import { ErrorToaster } from 'components/Toaster'
import UploadFile from 'components/UploadFile'
import instance from 'config/axios'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import CustomerServices from 'services/Customer'
import routes from 'services/System/routes'
import { CleanTypes, Debounce2, getFileSize } from 'utils'
import DeleteIcon from '@mui/icons-material/Delete';
import VisaServices from 'services/Visa'
import { useBlocker, useLocation, useNavigate } from 'react-router-dom'
import SystemServices from 'services/System'
import { useAuth } from 'context/UseContext'
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog'
import { useCallbackPrompt } from 'hooks/useCallBackPrompt'
import { addDays, addMonths } from 'date-fns'
import ConfirmationDialog2 from 'components/Dialog/confrimationDialog2'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const AddVisa = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, getValues, setValue, control, formState: { errors }, reset } = useForm();
    const [submit, setSubmit] = useState(false)
    const [handleBlockedNavigation] =
        useCallbackPrompt(submit)
    const {
        register: register1,
        handleSubmit: handleSubmit1,
        setValue: setValue1,
        formState: { errors: errors1 },

    } = useForm();
    const {
        register: register2,
        handleSubmit: handleSubmit2,
        setValue: setValue2,
        getValues: getValues2,
        formState: { errors: errors2 },

    } = useForm();
    // *For Customer Queue
    const [customerQueue, setCustomerQueue] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(null)

    const [open, setOpen] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);
    const [scroll, setScroll] = React.useState('paper');
    const [visaType, setVisaType] = useState('In')
    const [visaTenture, setVisaTenture] = useState('1 year')
    const [customerDetail, setCustomerDetail] = useState(null)
    const [candidateIndex, setCandidateIndex] = useState()
    const [eligibility, setEligibility] = useState()
    const [salaryError, setSalaryError] = useState(false)
    const [depositError, setDepositError] = useState(false)
    const [countries, setCountries] = useState([])
    const [selectedCountry, setSelectedCountry] = useState(null)
    const [vipMedicalCheck, setVipMedicalCheck] = useState(false)
    // *For setPermissions
    const [totalCount, setTotalCount] = useState(0);
    const [pageLimit, setPageLimit] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const allowFilesType = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [updateCandidate, setUpdateCandidate] = useState(null)
    const [customerPaymentType, setCustomerPaymentType] = useState(null)
    const [candidateSalary, setCandidateSalary] = useState()
    const [payrollPercent, setPayrollPercent] = useState()
    const [customerDeposit, setCustomerDeposit] = useState()
    const [totalVisaCharges, setTotalVisaCharges] = useState()
    const [totalDepositCharges, setTotalDepositCharges] = useState()
    const [candidates, setCandidates] = useState([])
    const [customerBalance, setCustomerBalance] = useState()
    const { user, userLogout } = useAuth();
    const [confirmationDialog, setConfirmationDialog] = useState(false)
    const [confirmationDialog2, setConfirmationDialog2] = useState(false)
    const [confirmationDialog3, setConfirmationDialog3] = useState(false)
    const [wpsList, setWpsList] = useState([])
    const [wpsValid, setWpsValid] = useState(false)
    const [isUploading, setIsUploading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [depositScenario, setDepositScenario] = useState()
    const [verifyPassport, setVerifyPassport] = useState(false)
    const [verifyPassport2, setVerifyPassport2] = useState(false)
    const [charges, setCharges] = useState(null)
    const [byPass, setByPass] = useState(null)

    // *For Filters
    const [filters, setFilters] = useState({});
    const [date, setDate] = useState(null)
    const [fieldsDisabled, setFieldsDisabled] = useState({
        monthlyVisaServiceCharges: true,
        vipMedical: false,
        extraTyping: true,
    });
    //documents array
    const [documents, setDocuments] = useState([
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

    const handleClickOpen = (scrollType) => {
        console.log(selectedCustomer);
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
        if (true) {

            setSelectedCountry(null)
            setDate('')
            setSalaryError(false)
            reset()
            getCustomerDetail(selectedCustomer?.id, 'balance')
            if (customerPaymentType == 'visa') {
                if (eligibility == 0 && !byPass) {
                    showErrorToast('Deposit Limit Reached')
                }
                else {
                    setOpen(true);
                    setScroll(scrollType);
                }
            }
            else {
                if (candidateSalary > customerDeposit && !byPass) {
                    showErrorToast('Deposit Limit Reached')
                }
                else {
                    setOpen(true);
                    setScroll(scrollType);
                }

            }
        }
        else {
            showErrorToast("WPS for last month has not been added.")
        }
    };
    // *For Get Countries
    const getCountries = async (id) => {
        try {
            const { data } = await SystemServices.getCountries();
            setCountries(data?.countries?.rows);

        } catch (error) {
            ErrorToaster(error);
        }
    };


    const handleClose = () => {

        setOpen(false);
    };
    const handleClose1 = () => {
        setOpen1(false);
    };
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
    const getData = async (formData) => {

        console.log(formData);
        try {
            let params = {
                charges_type: "cost",
            };

            const { data } = await SystemServices.getRates(params);

            let details = data?.charges;
            setCharges(details);
        } catch (error) {
        } finally {

        }
    };

    const CreateVisa = async (formData) => {
        setSubmit(false)
        console.log(selectedCustomer);
        const total = candidates.reduce((total, item) => total + item.visa_charges, 0);
        const total2 = candidates.reduce((total2, item) => total2 + item.visa_cost, 0);
        const totalsal = candidates.reduce((totalsal, item) => totalsal + item.salary_total, 0);

        let multiplier = payrollPercent / 100
        let multiplied = totalsal * multiplier
        if (customerBalance < candidateSalary && !byPass) {
            showErrorToast('Deposit Balance Is Low')
        }
        else {

            console.log(total);
            try {

                let charges = customerPaymentType === 'visa' ? parseFloat(totalDepositCharges) * candidates.length : candidateSalary;
                let obj = {
                    customer_id: selectedCustomer?.id,
                    customer_name: selectedCustomer?.name,
                    due_date: customerDetail?.due_date_policy,
                    agent_id: customerDetail?.agent_id,
                    force_create:byPass,

                    deposit_balance: parseFloat(customerBalance) - parseFloat(charges),

                    total_deposit_charges: customerPaymentType === 'visa' ? parseFloat(totalDepositCharges) * candidates.length : candidateSalary,
                    total_visa_charges: total,
                    total_visa_cost: total2,
                    request_date: new Date(),
                    candidates: candidates
                };

                console.log(obj, 'obj');

                const promise = VisaServices.AddVisa(obj);

                showPromiseToast(
                    promise,
                    'Saving...',
                    'Added Successfully',
                    'Something Went Wrong'
                );

                const response = await promise;
                if (response?.responseCode === 200) {
                    navigate("/visa-list");
                }


            } catch (error) {
                console.log(error);
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
    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);
    const totalSalaryCalc = (type) => {
        if (type == 'update') {
            let basic = getValues2('basic')
            let allowance = getValues2('allowance')
            if (basic && allowance) {
                let total = parseFloat(basic) + parseFloat(allowance)
                setValue2('totalSalary', total)
                console.log(total);

                console.log(eligibility);

                let multiplier = payrollPercent / 100
                let multiplied = total * multiplier
                if (multiplied > customerBalance) {

                    setDepositError(true)
                }
                else {
                    setDepositError(false)
                }
                if (total > eligibility) {
                    if (depositScenario.toLowerCase() == 'payroll') {

                        setSalaryError(true)
                    }
                }
                else {
                    setSalaryError(false)
                    setDepositError(false)
                }
            }
        }
        else {
            let basic = getValues('basic')
            let allowance = getValues('allowance')
            if (basic && allowance) {
                let total = parseFloat(basic) + parseFloat(allowance)
                setValue('totalSalary', total)
                console.log(total);
                console.log(eligibility);
                let multiplier = payrollPercent / 100
                let multiplied = total * multiplier
                if (multiplied > customerBalance) {

                    setDepositError(true)
                }
                else {
                    setDepositError(false)
                }
                if (total > eligibility) {
                    if (depositScenario.toLowerCase() == 'payroll') {

                        setSalaryError(true)
                    }
                }
                else {
                    setSalaryError(false)
                }
            }
        }

    }
    const handleCheckboxChange = (name) => (event) => {
        console.log(name);
        setFieldsDisabled({
            ...fieldsDisabled,
            [name]: !event.target.checked,
        });
    };

    const handleUpdateCandidate = (item, index) => {
        let serialId = item?.serial_id
        console.log(item);
        setCandidateIndex(item?.serial_id)
        setDocuments(item?.documents)
        setUpdateCandidate(item)
        setOpen1(true)
        console.log(item);

        setVisaTenture(item?.visa_tenure)
        setVisaType(item?.visa_type)

        setValue2('candidateName', item?.name)
        setValue2('Phone', item?.phone)
        setValue2('email', item?.email)
        setValue2('campLocation', item?.camp_location)
        setValue2('passportNumber', item?.passport_number)
        setValue2('employeeid', item?.employee_id)
        setValue2('passportExp', moment(item?.passport_expiry).format('YYYY-MM-DD'))
        handleDate(item?.passport_expiry)
        if (item.vip_medical_extra) {
            setVipMedicalCheck(true)
        }
        else {
            setVipMedicalCheck(false)
        }
        setSelectedCountry(item?.nationality)
        setValue2('nationality', item?.nationality)
        setValue2('visaDesignation', item?.visa_designation)
        setValue2('basic', item?.salary_basic)
        setValue2('allowance', item?.salary_allowance)
        setValue2('endConsumer', item?.end_consumer)
        setValue2('endConsumerCompany', item?.end_consumer_company)
        setValue2('totalSalary', item?.salary_total)

        setValue2('2yearInsideRate', item?.inside_rate)
        setValue2('2yearOutsideRate', item?.outside_rate)
        setValue2('2yearRenewalRates', item?.renewal_rate)


        setValue2('1yearInsideRate', item?.inside_rate)
        setValue2('1yearOutsideRate', item?.outside_rate)
        setValue2('1yearRenewalRates', item?.renewal_rate)



        setValue2('monthlyVisaServiceCharges', item?.monthly_visa_service)
        setValue2('vipMedical', item?.vip_medical_extra)







    }
    const handleTotalVisaCharges = () => {
        let fields = [];

        // Determine which fields to use based on visaTenture and visaType
        if (visaTenture.includes('1') && visaType.toLowerCase() == 'in') {
            fields = [
                '1yearInsideRate',
                '1yearRenewalRates',
                'monthlyVisaServiceCharges',
                'vipMedical',
                'extraTyping'
            ];
        } else if (visaTenture.includes('1') && visaType.toLowerCase() == 'out') {
            fields = [
                '1yearOutsideRate',
                '1yearRenewalRates',
                'monthlyVisaServiceCharges',
                'vipMedical',
                'extraTyping'
            ];
        } else if (visaTenture.includes('2') && visaType == 'in') {
            fields = [
                '2yearInsideRate',
                '2yearRenewalRates',
                'monthlyVisaServiceCharges',
                'vipMedical',
                'extraTyping'
            ];
        } else if (visaTenture.includes('2') && visaType.toLowerCase() === 'out') {
            fields = [
                '2yearOutsideRate',
                '2yearRenewalRates',
                'monthlyVisaServiceCharges',
                'vipMedical',
                'extraTyping'
            ];
        }

        // Retrieve the current values of the specified fields
        const values = getValues(fields);

        // Convert non-numeric values to 0 and calculate the sum
        const total = values.reduce((acc, value) => {
            const numericValue = parseFloat(value) || 0;
            return acc + numericValue;
        }, 0);
        setTotalVisaCharges(total)
        console.log('Total Visa Charges:', total);
    };
    // *For Get Customer Detail
    const getCustomerDetail = async (id, type) => {
        try {
            let params = { customer_id: id };
            if (id) {

                const { data } = await CustomerServices.getCustomerDetail(params);
                console.log(data?.details?.security_deposit_scenario);
                setByPass(data?.details?.bypass_requirements)
                if(!data?.details?.bypass_requirements){
                    getWPSList(1, 1, {}, id)
                }
                else{
                    setWpsValid(false)
                }
               
                // setCandidates([])
                setCustomerPaymentType(data?.details?.security_deposit_scenario)


                setCustomerBalance(data?.details?.deposit_balance)

                setDepositScenario(data?.details?.security_deposit_scenario)
                if (data?.details?.security_deposit_scenario == 'visa') {

                    setEligibility(data?.details?.visa_eligibility_remaining)
                    setTotalDepositCharges(data?.details?.deposit_per_visa)

                }
                else {
                    setPayrollPercent(parseFloat(data?.details?.payroll_percentage))
                    setEligibility(data?.details?.payroll_eligibility)
                }
                setCustomerDeposit(parseFloat(data?.details?.deposit_balance))
                setCustomerDetail(data?.details);
                let details = data?.details
                if (type == 'update') {
                    setValue2('1yearInsideRate', details?.one_year_inside)
                    setValue2('1yearOutsideRate', details?.one_year_outside)
                    setValue2('1yearRenewalRates', details?.one_year_renewal)
                    setValue2('2yearInsideRate', details?.two_year_inside)
                    setValue2('2yearOutsideRate', details?.two_year_outside)
                    setValue2('2yearRenewalRates', details?.two_year_renewal)
                    setValue2('monthlyVisaServiceCharges', details?.monthly_visa_service)



                    handleTotalVisaCharges()
                }
                setValue('1yearInsideRate', details?.one_year_inside)
                setValue('1yearOutsideRate', details?.one_year_outside)
                setValue('1yearRenewalRates', details?.one_year_renewal)
                setValue('2yearInsideRate', details?.two_year_inside)
                setValue('2yearOutsideRate', details?.two_year_outside)
                setValue('2yearRenewalRates', details?.two_year_renewal)
                setValue('monthlyVisaServiceCharges', details?.monthly_visa_service)
                setValue('vipMedical', details?.medical_extra)
                setValue2('vipMedical', details?.medical_extra)
                if (parseFloat(details?.medical_extra) > 0) {
                    setVipMedicalCheck(true)
                }
                else {
                    setVipMedicalCheck(false)
                }


                handleTotalVisaCharges()
            }


        } catch (error) {
            showErrorToast(error);
        }
    };

    // *For Get Customer Queue
    const getWPSList = async (page, limit, filter, id) => {
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
                limit: 1,
                customer_id: user?.user_type == 'C' ? user?.customer_id : id,


            }
            params = { ...params, ...Filter }

            const { data } = await CustomerServices.checkWPS(params)
            setWpsValid(data?.wpsRequired)
            console.log(data);

            // if (data?.rows?.length > 0) {

            //     let dateMonth = moment(data?.rows[0]?.date).startOf("month");
            //     let currentMonth = moment().startOf("month");

            //     let diff = currentMonth.diff((dateMonth), 'months')
            //     console.log(diff, 'diff');
            //     if (diff <= 1) {
            //         setWpsValid(true)
            //     }
            //     else {
            //         setWpsValid(false)
            //     }
            // }
            // else {
            //     setWpsValid(true)
            // }


        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    const verifyPassportNumber = async (value) => {
        let passportNumber = getValues('passportNumber')
        if (passportNumber) {

            try {
                let obj = {
                    passport_number: passportNumber.toUpperCase(),
                };

                console.log(obj);

                const { data } = await CustomerServices.getCandidateDetail(obj);

                console.log(data);
                 if (data?.customer_id && (data.approval_status == 'Pending' || data.approval_status == 'Approved' || data.admin_rejected == false || data.admin_rejected == null)) {
                    setVerifyPassport(true)
                    showErrorToast('Passport Number  already exists')
                }
                else {
                    setVerifyPassport(false)
                }


            } catch (error) {
                console.log(error);
                setVerifyPassport(false)
                showErrorToast(error)
            }
        }
    };

    const verifyPassportNumber2 = async (value) => {
        let passportNumber = getValues2('passportNumber')
        if (passportNumber) {

            try {
                let obj = {
                    passport_number: passportNumber.toUpperCase(),
                };

                console.log(obj);

                const { data } = await CustomerServices.getCandidateDetail(obj);

                console.log(data);
                if (data?.customer_id && (data.approval_status == 'Pending' || data.approval_status == 'Approved' || data.admin_rejected == false || data.admin_rejected == null)){
                    setVerifyPassport2(true)
                    showErrorToast('Passport Number already existss')
                }
                else {
                    setVerifyPassport2(false)
                }


            } catch (error) {
                console.log(error);
                setVerifyPassport2(false)
                showErrorToast(error)
            }
        }
    };

    const handleDelete = (index) => {
        // Access the candidate to be deleted
        const deletedCandidate = candidates[index];

        // Log the deposit_consumed value
        setCustomerBalance(parseFloat(customerBalance) + parseFloat(deletedCandidate.deposit_consumed))
        if (customerPaymentType == 'visa') {
            setEligibility(eligibility + 1)
        }
        console.log('Deleted deposit_consumed', parseFloat(customerBalance) + parseFloat(deletedCandidate.deposit_consumed));
        setCandidates((prevCandidates) => prevCandidates.filter((_, i) => i !== index));
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
                    return { ...doc, expiry_date: moment(value).format('YYYY-MM-DD') }; // Update the path
                }
                return doc; // Return the document as is if the key doesn't match
            });
            console.log(updatedDocuments);
            setDocuments(updatedDocuments)
            // Handle other fields if needed
        }
    }
    const AddCandidate = async (formData) => {
        handleClose()
        console.log(formData);
        let sum = 0;
        let sum2 = 0;

        if (visaTenture.includes('1')) {
            if (visaType.toLowerCase() === 'in') {
                sum += parseFloat(Number(formData["1yearInsideRate"]));
            } else if (visaType.toLowerCase() === 'out') {
                sum += parseFloat(Number(formData["1yearOutsideRate"]));
            }


            sum += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

        } else if (visaTenture.includes('2')) {
            if (visaType.toLowerCase() === 'in') {
                sum += parseFloat(Number(formData["2yearInsideRate"]));
            } else if (visaType.toLowerCase() === 'out') {
                sum += parseFloat(Number(formData["2yearOutsideRate"]));
            }
            sum += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

        }

        if (visaTenture.includes('1')) {
            if (visaType.toLowerCase() === 'in') {
                sum2 += parseFloat(Number(charges?.one_year_inside));
            } else if (visaType.toLowerCase() === 'out') {
                sum2 += parseFloat(Number(charges?.one_year_outside));
            }


            sum2 += vipMedicalCheck ? parseFloat(Number(charges?.medical_extra)) || 0 : 0;

        } else if (visaTenture.includes('2')) {
            if (visaType.toLowerCase() === 'in') {
                sum2 += parseFloat(Number(charges?.two_year_inside));
            } else if (visaType.toLowerCase() === 'out') {
                sum2 += parseFloat(Number(charges?.two_year_outside));
            }
            sum2 += vipMedicalCheck ? parseFloat(Number(charges?.medical_extra)) || 0 : 0;

        }
        console.log(sum, 'sum');
        console.log(sum2, 'sum');

        try {
            setCandidates((prevCandidates) => {
                // const newSerialId = prevCandidates.length + 1;
                // console.log(prevCandidates);
                const lastElement = prevCandidates[prevCandidates.length - 1];
                console.log(lastElement);
                let multiplier = payrollPercent / 100


                let obj = {
                    serial_id: prevCandidates?.length > 0 ? Number(lastElement.serial_id) + 1 : 1,
                    name: formData?.candidateName,
                    phone: formData?.Phone,
                    email: formData?.email,
                    visa_charges: sum,
                    visa_cost: sum2,
                    visa_type: visaType,
                    visa_tenure: visaTenture,
                    employee_id: formData?.employeeid,
                    deposit_consumed: customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier,
                    security_deposit_visa: totalDepositCharges,
                    payroll_percentage: payrollPercent,
                    inside_rate: visaTenture.includes('1') ? formData["1yearInsideRate"] : formData["2yearInsideRate"],
                    outside_rate: visaTenture.includes('1') ? formData["1yearOutsideRate"] : formData["2yearOutsideRate"],
                    renewal_rate: 0,
                    vip_medical_temp: formData?.vipMedical,
                    vip_medical_extra: vipMedicalCheck ? formData?.vipMedical ? formData?.vipMedical : null : null,
                    camp_location: formData?.campLocation,
                    nationality: selectedCountry,
                    nationality_id: selectedCountry?.id,
                    passport_number: formData?.passportNumber.toUpperCase(),
                    passport_expiry: moment(formData?.passportExp).format('YYYY-MM-DD'),
                    visa_designation: formData?.visaDesignation,
                    salary_basic: formData?.basic,
                    salary_allowance: formData?.allowance,
                    salary_total: parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)).toFixed(2),
                    end_consumer: formData?.endConsumer,
                    end_consumer_company: formData?.endConsumerCompany,
                    documents: documents
                };

                console.log('Adding candidate:', obj);
                console.log('Previous candidates:', prevCandidates);

                return [...prevCandidates, obj];
            });




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
            reset()

            setDate(null)
            setSelectedCountry(null)
            console.log(candidates);
            // Add your logic to handle the form data here, e.g., sending it to an API.
        } catch (error) {
            console.error('Error adding candidate:', error);
            // Handle the error appropriately, e.g., displaying an error message to the user.
        }





    }
    const UpdateCandidate = async (formData) => {
        if (!salaryError && !byPass) {

            handleClose()
            console.log(candidateIndex);
            let sum = 0
            let sum2 = 0
            if (visaTenture.includes('1')) {
                if (visaType.toLowerCase() === 'in') {
                    sum += parseFloat(Number(formData["1yearInsideRate"]));
                } else if (visaType.toLowerCase() === 'out') {
                    sum += parseFloat(Number(formData["1yearOutsideRate"]));
                }


                sum += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

            } else if (visaTenture.includes('2')) {
                if (visaType.toLowerCase() === 'in') {
                    sum += parseFloat(Number(formData["2yearInsideRate"]));
                } else if (visaType.toLowerCase() === 'out') {
                    sum += parseFloat(Number(formData["2yearOutsideRate"]));
                }
                sum += vipMedicalCheck ? parseFloat(Number(formData["vipMedical"])) || 0 : 0;

            }
            if (visaTenture.includes('1')) {
                if (visaType.toLowerCase() === 'in') {
                    sum2 += parseFloat(Number(charges?.one_year_inside));
                } else if (visaType.toLowerCase() === 'out') {
                    sum2 += parseFloat(Number(charges?.one_year_outside));
                }


                sum2 += vipMedicalCheck ? parseFloat(Number(charges?.medical_extra)) || 0 : 0;

            } else if (visaTenture.includes('2')) {
                if (visaType.toLowerCase() === 'in') {
                    sum2 += parseFloat(Number(charges?.two_year_inside));
                } else if (visaType.toLowerCase() === 'out') {
                    sum2 += parseFloat(Number(charges?.two_year_outside));
                }
                sum2 += vipMedicalCheck ? parseFloat(Number(charges?.medical_extra)) || 0 : 0;

            }
            console.log(sum2, 'sum');
            console.log(vipMedicalCheck, 'sum2');

            let multiplier = payrollPercent / 100

            try {
                let obj = {
                    serial_id: candidateIndex,
                    name: formData?.candidateName,
                    phone: formData?.Phone,
                    email: formData?.email,
                    camp_location: formData?.campLocation,
                    visa_charges: sum,
                    visa_cost: sum2,
                    visa_type: visaType,
                    visa_tenure: visaTenture,
                    deposit_consumed: customerPaymentType === 'visa' ? totalDepositCharges : parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)) * multiplier,
                    security_deposit_visa: totalDepositCharges,
                    payroll_percentage: payrollPercent,
                    inside_rate: visaTenture.includes('1') ? formData["1yearInsideRate"] : formData["2yearInsideRate"],
                    outside_rate: visaTenture.includes('1') ? formData["1yearOutsideRate"] : formData["2yearOutsideRate"],
                    renewal_rate: 0,
                    vip_medical_temp: formData?.vipMedical,
                    vip_medical_extra: vipMedicalCheck ? formData?.vipMedical : null,
                    nationality: selectedCountry,
                    nationality_id: selectedCountry?.id,
                    passport_number: formData?.passportNumber.toUpperCase(),
                    employee_id: formData?.employeeid,
                    passport_expiry: moment(formData?.passportExp).format('YYYY-MM-DD'),
                    visa_designation: formData?.visaDesignation,
                    salary_basic: formData?.basic,
                    salary_allowance: formData?.allowance,
                    salary_total: parseFloat(parseFloat(formData?.basic) + parseFloat(formData?.allowance)).toFixed(2),
                    end_consumer: formData?.endConsumer,
                    end_consumer_company: formData?.endConsumerCompany,
                    documents: documents
                }
                console.log(obj);
                // setCandidates((prevCandidates) => [...prevCandidates, obj]);
                const updatedCandidates = candidates.map(candidate =>
                    candidate.serial_id === candidateIndex ? obj : candidate
                );
                console.log(updatedCandidates);
                setOpen1(false)
                // Update the state with the updated candidates array
                setCandidates(updatedCandidates);
                reset()
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
                console.log(candidates);
                // Add your logic to handle the form data here, e.g., sending it to an API.
            } catch (error) {
                console.error('Error adding candidate:', error);
                // Handle the error appropriately, e.g., displaying an error message to the user.
            }
        }
        else {
            showErrorToast('Salary Limit Exceeded')
        }
    }
    // *For Get Customer Queue

    const getCustomerQueue = async (page, limit, filter) => {
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
                limit: 1000,
            }
            params = { ...params, ...Filter }
            const { data } = await CustomerServices.getCustomerQueue(params)
            if (user?.user_type == 'C') {
                console.log(customerQueue);
                let currentUser = data?.rows?.find(item => item?.id == user?.customer_id)
                console.log(currentUser);
                setSelectedCustomer(currentUser)
                setValue1('customer', currentUser)
                getCustomerDetail(currentUser?.id)
            }
            setCustomerQueue(data?.rows)

        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }
    useEffect(() => {
        getCustomerQueue()
        getCountries()
        getData()

    }, [])
    useEffect(() => {
        if (candidates.length > 0) {
            setSubmit(true)
        }
        const totalSalary = candidates.reduce((sum, candidate) => sum + parseFloat(candidate.salary_total), 0);
        // Update the candidateSalary state with the calculated sum
        console.log(totalSalary);

        let multiplier = payrollPercent / 100
        setCandidateSalary(parseFloat(parseFloat(totalSalary) * parseFloat(multiplier)));


    }, [candidates])

    return (
        <Box sx={{ p: 3 }}>
            {/* ========== Confirmation Dialog ========== */}
            <ConfirmationDialog2
                warning={true}
                open={confirmationDialog3}
                onClose={() => setConfirmationDialog3(false)}

                action={() => {
                    setConfirmationDialog3(false);
                    CreateVisa()
                }}
            />
            <ConfirmationDialog
                open={confirmationDialog}
                onClose={() => setConfirmationDialog(false)}
                message={"You Have Unsaved Changes on this Page"}
                action={() => {
                    setConfirmationDialog(false);
                    handleClose()
                    handleClose1()
                }}
            />
            <ConfirmationDialog
                open={confirmationDialog2}
                onClose={() => setConfirmationDialog2(false)}
                message={"You Have Unsaved Changes on this Page"}
                action={() => {
                    setConfirmationDialog2(false);

                }}
            />
            <Dialog
                component={'form'} onSubmit={handleSubmit(AddCandidate)}
                open={open}

                maxWidth={'md'}
                fullWidth={true}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">Add Candidate</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        <Grid container spacing={2}>
                            <Grid container mt={5} pl={3}>
                                <Grid item xs={3} sm={3}>
                                    <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Type : </Typography>
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            defaultValue={visaType}

                                            onChange={(e) => {
                                                setVisaType(e.target.value);
                                                console.log(getValues('1yearInsideRate'));
                                                console.log(getValues('1yearOutsideRate'));
                                                setTimeout(() => {
                                                    setValue('1yearInsideRate', getValues('1yearInsideRate'))
                                                    setValue('1yearOutsideRate', getValues('1yearOutsideRate'))
                                                    console.log(getValues('1yearInsideRate'), 'asdasdasdasd');
                                                }, 1000);



                                            }}
                                        >
                                            <FormControlLabel
                                                sx={{ color: "#000" }}

                                                value="In"
                                                control={<Radio />}
                                                label="In"
                                            />
                                            <FormControlLabel
                                                sx={{ color: "#000" }}

                                                value="out"
                                                control={<Radio />}
                                                label="Out"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={3} sm={3}>
                                    <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Tenure : </Typography>
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            defaultValue={visaTenture}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setVisaTenture(e.target.value);

                                            }}
                                        >
                                            <FormControlLabel
                                                sx={{ color: "#000" }}

                                                value="1 year"
                                                control={<Radio />}
                                                label="1 Year"
                                            />
                                            <FormControlLabel
                                                sx={{ color: "#000" }}

                                                value="2 year"
                                                control={<Radio />}
                                                label="2 Years"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                            </Grid>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.textColorDarkBlue, p: 3 }}>Visa Rates : </Typography>
                            {<Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mt: 3 }}>{visaTenture.includes('1') ? "1 Year Rates " : "2 Years Rates "}</Typography>}

                            <Grid container pl={3}>

                                {visaTenture.includes('1') && visaType.toLowerCase() == 'in' && <Grid container sx={{ gap: '20px 25px' }}>


                                    <Grid item xs={5} >
                                        <LabelCustomInput label={'Year Inside Rates :* '} StartLabel={'AED'} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} register={register("1yearInsideRate", { required: "Enter year inside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />
                                    </Grid>

                                    {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '} StartLabel={'AED'} disabled={user?.user_type == 'C' ? true : false }  register={register("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                                </Grid>}
                                {visaTenture.includes('1') && visaType.toLowerCase() == 'out' && <Grid container sx={{ gap: '20px 25px' }}>


                                    <Grid item xs={5} >
                                        <LabelCustomInput label={'Year Outside Rates :*  '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register("1yearOutsideRate", { required: "Enter year outside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />
                                    </Grid>

                                    {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                                </Grid>}

                                {visaTenture.includes('2') && visaType.toLowerCase() == 'in' && <>

                                    <Grid container sx={{ gap: '20px 25px' }}>

                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Year Inside Rates :*  '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register("2yearInsideRate", { required: "Enter year inside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />

                                        </Grid>


                                        {/* <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                                    </Grid></>}
                                {visaTenture.includes('2') && visaType.toLowerCase() == 'out' && <>

                                    <Grid container sx={{ gap: '20px 25px' }}>

                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Year Outside Rates :*  '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register("2yearOutsideRate", { required: "Enter year outside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />
                                        </Grid>


                                        {/* <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                                    </Grid></>}
                            </Grid>
                            <Grid container p={3}>
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2 }}>Extra Costing : </Typography>

                                <Grid container sx={{ gap: '20px 25px' }}>

                                    <Grid item xs={5}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{ marginTop: '22px' }}>
                                                {<Checkbox checked={vipMedicalCheck} onChange={() => setVipMedicalCheck(!vipMedicalCheck)} />}
                                                {/* <Controller
                                                    
                                                    
                                                        <FormControlLabel
                                                            control={<Checkbox checked={vipMedicalCheck} onChange={()=> setVipMedicalCheck(!vipMedicalCheck)} />

                                                        />
                                                    
                                                /> */}
                                            </Box>
                                            <LabelCustomInput
                                                label="VIP Medical Charges : "
                                                disabled={user?.user_type == 'C' || user?.user_type == 'A' || !vipMedicalCheck}
                                                StartLabel="AED"
                                                register={register('vipMedical', { required: false })}
                                                postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true}

                                            />

                                        </Box>
                                    </Grid>


                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Candidate Name :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Candidate Name"}
                                    error={errors?.candidateName?.message}
                                    register={register("candidateName", {
                                        required:
                                            "Please enter your candidate name."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Phone :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    type={'number'}
                                    placeholder={"Phone"}
                                    error={errors?.Phone?.message}
                                    register={register("Phone", {
                                        required:
                                            "Please enter your Phone.",
                                        pattern: {
                                            value: /^05[0-9]{8}$/,
                                            message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                        }

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Email :*"}
                                    fullWidth={true}
                                    size={'small'}
                                    placeholder={"Email"}
                                    error={errors?.email?.message}
                                    register={register("email", {
                                        required: "Please enter your email.",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Please enter a valid email address."
                                        }
                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Camp Location  :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Camp Location "}
                                    error={errors?.campLocation?.message}
                                    register={register("campLocation", {
                                        required:
                                            "Please enter your camp location."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Employee ID :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Employee ID"}
                                    error={errors?.employeeid?.message}
                                    register={register("employeeid", {
                                        required:
                                            "Please enter your employee id."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <SelectField
                                    size={'small'}
                                    label={'Nationality :*'}
                                    options={countries}
                                    selected={selectedCountry}
                                    onSelect={(value) => setSelectedCountry(value)}
                                    error={errors?.nationality?.message}
                                    register={register("nationality", {
                                        required: 'Please select nationality'
                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Passport Number :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Passport Number"}
                                    error={errors?.passportNumber?.message}
                                    register={register("passportNumber", {
                                        required:
                                            "Please enter your passport number.",
                                        onChange: (e) => {
                                            console.log('asdas');

                                            Debounce2(() => verifyPassportNumber());
                                            // Delay the execution of verifyPassportNumber by 2 seconds

                                        },

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                            <DatePicker
                                    label={"Passport Expiry :*"}
                                    value={date}
                                    disablePast={true}
                                    minDate={addDays(addMonths(new Date(), 6), 1)} 
                                    size={'small'}
                                    error={errors?.passportExp?.message}
                                    {...register("passportExp", {
                                        required: "Please enter your passport expiry date.",
                                        validate: (value) => {
                                            const minAllowedDate = addMonths(new Date(), 6);
                                            console.log(value,'value');
                                            console.log(moment(minAllowedDate),'value');
                                            console.log(moment(value) > moment(minAllowedDate),'value');
                                            
                                            return moment(value) > moment(minAllowedDate) || "Passport expiry date must be at least 6 months from today.";
                                        },
                                    })}
                                    onChange={(date) => {
                                        handleDate(date);
                                        setValue("passportExp", date, { shouldValidate: true });
                                    }}
                                />

                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Visa Designation :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Visa Designation"}
                                    error={errors?.visaDesignation?.message}
                                    register={register("visaDesignation", {
                                        required:
                                            "Please enter your visa designation ."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Salary : </Typography>
                            </Grid>
                            <Grid item xs={6} >
                                <LabelCustomInput label={'Basic :* '} StartLabel={'AED'} placeholder={'Basic'} error={errors?.basic?.message} register={register("basic", { required: "Enter basic  salary", onChange: (e) => totalSalaryCalc() })} />
                            </Grid>
                            <Grid item xs={6} >
                                <LabelCustomInput allowance={true} label={'Allowance : '} StartLabel={'AED'} placeholder={'Allowance'} error={errors?.allowance?.message} register={register("allowance", { required: "Enter allowance ", onChange: (e) => totalSalaryCalc() })} />
                            </Grid>
                            <Grid item xs={6} >

                                <LabelCustomInput disabled={true} label={'Total Salary : '} StartLabel={'AED'} placeholder={'Total'} register={register("totalSalary")} />
                                {(customerPaymentType == 'payroll' && salaryError) ? <p style={{ color: 'red' }}>Salary Limit Exceeded </p> : ''}
                                {(customerPaymentType == 'payroll' && depositError) ? <p style={{ color: 'red' }}>Deposit Balance is Low </p> : ''}
                            </Grid>
                            {/* <Grid item xs={6}>
                                <InputField
                                    label={"End Consumer :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"End Consumer"}
                                    error={errors?.endConsumer?.message}
                                    register={register("endConsumer", {
                                        required:
                                            "Please enter your end consumer  ."

                                    })}
                                />
                            </Grid> */}
                            <Grid item xs={6}>
                                <InputField
                                    label={"End Consumer Company :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"End Consumer Company "}
                                    error={errors?.endConsumerCompany?.message}
                                    register={register("endConsumerCompany", {
                                        required:
                                            "Please enter your end consumer company ."

                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} >
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Documents : </Typography>
                            </Grid>
                            {documents?.length > 0 && documents?.map((item, index) => (


                                <Grid item xs={5} >
                                    <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>{item?.is_required ? item?.name : item?.name + " " + '(If Any)'} : {item?.is_required ? '*' : ''} </Typography>
                                    <UploadFile
                                        Memo={true}
                                        accept={allowFilesType}
                                        file={documents}
                                        multiple={true}
                                        updateResult={updateResult}
                                        fileId={item?.key}
                                        loader={loader}
                                        error={errors[item?.key]?.message}
                                        disabled={isUploading} // Disable while uploading
                                        register={register(`${item?.key}`, {
                                            required: item?.is_required ? documents.find((item2 => item2?.key == item?.key))?.path != '' ? false :
                                                "Please upload document." : false,
                                            onChange: async (e) => {
                                                setIsUploading(true); // Set uploading to true when the upload starts
                                                const path = await handleUploadDocument(e, item?.key);
                                                if (path) {
                                                    handleDocArrayUpdate('path', path, item?.key);
                                                    console.log(path);
                                                }
                                                setIsUploading(false); // Reset uploading status when done
                                            }
                                        })}
                                    />


                                </Grid>


                            ))}


                        </Grid>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ fontFamily: 'Public Sans' }} onClick={() => {
                        setConfirmationDialog(true)
                        setVerifyPassport(false)
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

                    }}>Cancel</Button>
                    <Button sx={{ fontFamily: 'Public Sans' }} disabled={(customerPaymentType == 'payroll' && (salaryError || depositError)) || verifyPassport ? true : false} type='submit'>Add</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                component={'form'} onSubmit={handleSubmit2(UpdateCandidate)}
                open={open1}

                maxWidth={'md'}
                fullWidth={true}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">Update Candidate</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        <Grid container spacing={2}>
                            <Grid container mt={5} pl={3}>
                                <Grid item xs={3} sm={3}>
                                    <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Type : </Typography>
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            defaultValue={visaType}
                                            onChange={(e) => {
                                                setVisaType(e.target.value);
                                                console.log(getValues('1yearInsideRate'));
                                                console.log(getValues('1yearOutsideRate'));
                                                getCustomerDetail(selectedCustomer?.id, 'update')
                                                setTimeout(() => {
                                                    setValue2('2yearInsideRate', getValues('2yearInsideRate'))
                                                    setValue2('2yearOutsideRate', getValues('2yearOutsideRate'))
                                                    console.log(getValues('1yearInsideRate'), 'asdasdasdasd');
                                                }, 1000);
                                            }}
                                        >
                                            <FormControlLabel
                                                sx={{ color: "#000" }}
                                                value="In"
                                                control={<Radio />}
                                                label="In"
                                            />
                                            <FormControlLabel
                                                sx={{ color: "#000" }}
                                                value="out"
                                                control={<Radio />}
                                                label="Out"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={3} sm={3}>
                                    <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Visa Tenure : </Typography>
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            defaultValue={visaTenture}
                                            onChange={(e) => {
                                                console.log(e.target.value);
                                                setVisaTenture(e.target.value);
                                                getCustomerDetail(selectedCustomer?.id, 'update')
                                            }}
                                        >
                                            <FormControlLabel
                                                sx={{ color: "#000" }}

                                                value="1 year"
                                                control={<Radio />}
                                                label="1 Year"
                                            />
                                            <FormControlLabel
                                                sx={{ color: "#000" }}

                                                value="2 year"
                                                control={<Radio />}
                                                label="2 Years"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                            </Grid>
                            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.textColorDarkBlue, p: 3 }}>Visa Rates : </Typography>
                            {<Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mt: 3 }}>{visaTenture.includes('1') ? "1 Year Rates " : "2 Years Rates "}</Typography>}

                            <Grid container pl={3}>

                                {visaTenture.includes('1') && visaType.toLowerCase() == 'in' && <Grid container sx={{ gap: '20px 25px' }}>


                                    <Grid item xs={5} >
                                        <LabelCustomInput label={'Year Inside Rates :* '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register2("1yearInsideRate", { required: "Enter year inside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />
                                    </Grid>

                                    {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false }  StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                                </Grid>}
                                {visaTenture.includes('1') && visaType.toLowerCase() == 'out' && <Grid container sx={{ gap: '20px 25px' }}>


                                    <Grid item xs={5} >
                                        <LabelCustomInput label={'Year Outside Rates :*  '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register2("1yearOutsideRate", { required: "Enter year outside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />
                                    </Grid>

                                    {/* <Grid item xs={5} >
                                        <LabelCustomInput label={'Renewal Rates :*  '}  disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("1yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                    </Grid> */}



                                </Grid>}

                                {visaTenture.includes('2') && visaType.toLowerCase() == 'in' && <>

                                    <Grid container sx={{ gap: '20px 25px' }}>

                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Year Inside Rates :*  '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register2("2yearInsideRate", { required: "Enter year inside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />

                                        </Grid>


                                        {/* <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                                    </Grid></>}
                                {visaTenture.includes('2') && visaType.toLowerCase() == 'out' && <>

                                    <Grid container sx={{ gap: '20px 25px' }}>

                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Year Outside Rates :*  '} disabled={user?.user_type == 'C' || user?.user_type == 'A' ? true : false} StartLabel={'AED'} register={register2("2yearOutsideRate", { required: "Enter year outside rate", onChange: () => handleTotalVisaCharges() })} postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true} />
                                        </Grid>

                                        {/* 
                                        <Grid item xs={5} >
                                            <LabelCustomInput label={'Renewal Rates :*  '} disabled={user?.user_type == 'C' ? true : false } StartLabel={'AED'} register={register2("2yearRenewalRates", { required: "Enter renewal rate", onChange: () => handleTotalVisaCharges() })} postfix={true} />
                                        </Grid> */}



                                    </Grid></>}
                            </Grid>
                            <Grid container p={3}>
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mb: 2 }}>Extra Costing : </Typography>

                                <Grid container sx={{ gap: '20px 25px' }}>

                                    <Grid item xs={5}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{ marginTop: '22px' }}>
                                                {<Checkbox checked={vipMedicalCheck} onChange={(e) => {
                                                    console.log(!vipMedicalCheck);
                                                    if (!vipMedicalCheck == true) {
                                                        console.log(updateCandidate);


                                                        setValue2('vipMedical', updateCandidate?.vip_medical_temp)
                                                    }

                                                    setVipMedicalCheck(!vipMedicalCheck)
                                                }} />}
                                            </Box>
                                            <LabelCustomInput
                                                label="VIP Medical Extra Charges : "
                                                StartLabel="AED"
                                                register={register2('vipMedical')}
                                                postfix={user?.user_type == 'C' || user?.user_type == 'A' ? false : true}
                                                disabled={user?.user_type == 'C' || user?.user_type == 'A' || !vipMedicalCheck}
                                            />

                                        </Box>
                                    </Grid>


                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Candidate Name :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Candidate Name"}
                                    error={errors2?.candidateName?.message}
                                    register={register2("candidateName", {
                                        required:
                                            "Please enter your candidate name."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Phone :"}
                                    size={'small'}
                                    fullWidth={true}
                                    type={'number'}
                                    placeholder={"Phone"}
                                    error={errors2?.Phone?.message}
                                    register={register2("Phone", {
                                        required:
                                            "Please enter your Phone.",
                                        pattern: {
                                            value: /^05[0-9]{8}$/,
                                            message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                        }

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Email :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Email "}
                                    error={errors2?.email?.message}
                                    register={register2("email", {
                                        required:
                                            "Please enter your email."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Camp Location  :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Camp Location "}
                                    error={errors2?.campLocation?.message}
                                    register={register2("campLocation", {
                                        required:
                                            "Please enter your camp location."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Employee ID :*"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Employee ID"}
                                    error={errors?.employeeid?.message}
                                    register={register2("employeeid", {
                                        required:
                                            "Please enter your employee id."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <SelectField
                                    size={'small'}
                                    label={'Nationality :*'}
                                    options={countries}
                                    selected={selectedCountry}
                                    onSelect={(value) => setSelectedCountry(value)}
                                    error={errors2?.nationality?.message}
                                    register={register2("nationality", {
                                        required: 'Please select nationality'
                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Passport Number :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Passport Number"}
                                    error={errors2?.passportNumber?.message}
                                    register={register2("passportNumber", {
                                        required:
                                            "Please enter your passport number.",
                                        onChange: (e) => {
                                            console.log('asdas');

                                            Debounce2(() => verifyPassportNumber2());
                                            // Delay the execution of verifyPassportNumber by 2 seconds

                                        },

                                    })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                            <DatePicker
                                    label={"Passport Expiry :*"}
                                    value={date}
                                    disablePast={true}
                                    minDate={addDays(addMonths(new Date(), 6), 1)} 
                                    size={'small'}
                                    error={errors2?.passportExp?.message}
                                    {...register2("passportExp", {
                                        required: "Please enter your passport expiry date.",
                                        validate: (value) => {
                                            const minAllowedDate = addMonths(new Date(), 6);
                                            console.log(value,'value');
                                            console.log(moment(minAllowedDate),'value');
                                            console.log(moment(value) > moment(minAllowedDate),'value');
                                            
                                            return moment(value) > moment(minAllowedDate) || "Passport expiry date must be at least 6 months from today.";
                                        },
                                    })}
                                    onChange={(date) => {
                                        handleDate(date);
                                        setValue2("passportExp", date, { shouldValidate: true });
                                    }}
                                />

                            </Grid>
                            <Grid item xs={6}>
                                <InputField
                                    label={"Visa Designation :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"Visa Designation"}
                                    error={errors2?.visaDesignation?.message}
                                    register={register2("visaDesignation", {
                                        required:
                                            "Please enter your visa designation ."

                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} >
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Salary : </Typography>
                            </Grid>
                            <Grid item xs={6} >
                                <LabelCustomInput label={'Basic : '} StartLabel={'AED'} placeholder={'Basic'} error={errors?.basic?.message} register={register2("basic", { required: "Enter basic  salary", onChange: (e) => totalSalaryCalc('update') })} />
                            </Grid>
                            <Grid item xs={6} >
                                <LabelCustomInput allowance={true} label={'Allowance : '} StartLabel={'AED'} placeholder={'Allowance'} error={errors?.allowance?.message} register={register2("allowance", { required: "Enter allowance ", onChange: (e) => totalSalaryCalc('update') })} />
                            </Grid>
                            <Grid item xs={6} >
                                <LabelCustomInput disabled={true} label={'Total Salary : '} StartLabel={'AED'} placeholder={'Total'} register={register2("totalSalary")} />
                                {(customerPaymentType == 'payroll' && salaryError) ? <p style={{ color: 'red' }}>Salary Limit Exceeded </p> : ''}
                            </Grid>
                            {/* <Grid item xs={6}>
                                <InputField
                                    label={"End Consumer :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"End Consumer"}
                                    error={errors2?.endConsumer?.message}
                                    register={register2("endConsumer", {
                                        required:
                                            "Please enter your end consumer  ."

                                    })}
                                />
                            </Grid> */}
                            <Grid item xs={6}>
                                <InputField
                                    label={"End Consumer Company :"}
                                    size={'small'}
                                    fullWidth={true}
                                    placeholder={"End Consumer Company "}
                                    error={errors2?.endConsumerCompany?.message}
                                    register={register2("endConsumerCompany", {
                                        required:
                                            "Please enter your end consumer company ."

                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} >
                                <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Documents : </Typography>
                            </Grid>
                            {documents?.length > 0 && documents?.map((item, index) => (


                                <Grid item xs={5} >
                                    <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>{item?.is_required ? item?.name : item?.name + '(If Any)'} :{item?.is_required ? '*' : ' '} </Typography>
                                    <UploadFile
                                        Memo={true}
                                        accept={allowFilesType}
                                        file={documents}
                                        multiple={true}
                                        updateResult={updateResult}
                                        fileId={item?.key}
                                        error={errors2[item?.key]?.message}
                                        loader={loader}
                                        disabled={isUploading}
                                        register={register2(`${item?.key}`, {
                                            required: item?.is_required ? documents.find((item2 => item2?.key == item?.key))?.path != '' ? false :
                                                "Please upload document." : false,
                                            onChange: async (e) => {
                                                setIsUploading(true); // Set uploading to true when the upload starts
                                                const path = await handleUploadDocument(e, item?.key);
                                                if (path) {
                                                    handleDocArrayUpdate('path', path, item?.key);
                                                    console.log(path);
                                                }
                                                setIsUploading(false); // Reset uploading status when done
                                            }
                                        })}
                                    />


                                </Grid>


                            ))}


                        </Grid>

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ fontFamily: 'Public Sans' }} onClick={() => {setConfirmationDialog(true); setVerifyPassport2(false)}}>Cancel</Button>
                    <Button sx={{ fontFamily: 'Public Sans' }} disabled={verifyPassport2} type='submit'>Update</Button>
                </DialogActions>
            </Dialog>
            <Box component={'form'} onSubmit={handleSubmit1(CreateVisa)}>


                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >ADD NEW</Typography>
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                        <PrimaryButton
                            bgcolor={Colors.buttonBg}
                            title="Save"
                            onClick={() => setConfirmationDialog3(true)}
                            disabled={candidates.length > 0 ? false : true}
                        // onClick={ ()=> navigate(`/update-customer/${id}`)}


                        />

                    </Box>
                </Box>
                <Grid container mt={5}>
                    <Grid item xs={5} >
                        <SelectField
                            size={'small'}
                            label={'Select Customer :'}
                            disabled={user?.user_type == 'C' ? true : false}
                            options={customerQueue}
                            selected={selectedCustomer}
                            onSelect={(value) => {
                                console.log(value,'asdasdasasd');
                                
                                setSelectedCustomer(value)
                                getCustomerDetail(value?.id)
                                setValue1('customer', value)
                                setCandidates([])

                            }}
                            error={errors1?.customer?.message}
                            register={register1("customer", {
                                required: 'Please select customer account.',
                            })}
                        />
                    </Grid>

                </Grid>

                <Grid container mt={2} xs={10} justifyContent={'flex-end'}>
                    <PrimaryButton
                        bgcolor={Colors.buttonBg}
                        title="Add Candidate"
                        disabled={(selectedCustomer && customerDetail) ? false : true}
                        onClick={() => {
                            const today = moment();
                            const tenthOfMonth = moment().startOf('month').add(9, 'days');
                            let valid = false

                            const lastMonth = moment().subtract(1, 'months');
                            console.log(customerDetail, 'customerDetailcustomerDetail');
                            console.log(today.isAfter(tenthOfMonth));
                            console.log(moment(customerDetail.created_at).isSame(moment(), 'month'));

                            const total = candidates.reduce((total, item) => total + item.salary_total, 0);

                            let multiplier = payrollPercent / 100
                            let multiplied = total * multiplier
                            console.log(customerBalance, 'customerBalance');
                            console.log(candidateSalary, 'customerBalance');

                            if (customerBalance < candidateSalary && !byPass) {
                                showErrorToast('Deposit Balance Is Low')
                            }
                            else {




                                if (wpsValid) {
                                    showErrorToast('Create WPS First')
                                }
                                else {
                                    handleClickOpen('paper')
                                    console.log("The 10th date of the current month has not passed yet.");
                                }
                            }


                        }}


                    />
                </Grid>


                {candidates?.length > 0 && <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue, mt: 5 }}>Candidates Details: </Typography>}
                <Grid container mt={3} gap={2}>



                    {candidates?.length > 0 && candidates?.map((item, index) => (

                        <Grid item xs={5} >
                            <Box
                                component={'div'}

                                sx={{
                                    position: 'relative',
                                    border: `2px solid ${Colors.primary}`,
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    maxWidth: '400px',
                                    margin: '0 auto',
                                    backgroundColor: '#fff',
                                    fontFamily: 'Public Sans'
                                }}
                            >
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '35px'
                                    }}
                                    aria-label="delete"
                                    onClick={() => {

                                        handleUpdateCandidate(item, index)

                                    }}
                                >
                                    <MoreHorizIcon />
                                </IconButton>
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px'
                                    }}
                                    aria-label="delete"
                                    onClick={() => {

                                        handleDelete(index)

                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>

                                <Typography variant="body1" gutterBottom>
                                    <strong>Name:</strong>&nbsp; {item?.name?.length > 20 ? item?.name.slice(0, 20) + '...' : item?.name}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Email:</strong>&nbsp;{item?.email}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Number:</strong>&nbsp;{item?.phone}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Visa Type:</strong>&nbsp;{item?.visa_type.toLowerCase() == 'out' ? 'Out' : 'In'}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Visa Tenure:</strong>&nbsp;{item?.visa_tenure.includes('1') ? '1 Year' : '2 Year'}
                                </Typography>
                            </Box>
                            {/* <Chip
                                label={item?.name}
                                onClick={() => {
                                    handleUpdateCandidate(item, index)

                                }}
                                onDelete={() => handleDelete(index)}
                                deleteIcon={<DeleteIcon />}
                                variant="outlined"
                            /> */}


                        </Grid>


                    ))}
                </Grid>
            </Box>
        </Box >
    )
}

export default AddVisa
