import React, { useEffect, useMemo, useState } from "react";
import { Box, Divider, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, IconButton, InputAdornment, ListItemText, MenuItem, OutlinedInput, Paper, Radio, RadioGroup, Select, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Images, SvgIcon, SvgIcon as SvgIconss } from 'assets';
import { useNavigate, useParams } from "react-router-dom";
import { PrimaryButton } from "components/Buttons";
import Colors from "assets/Style/Colors";
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { FontFamily } from "assets";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import InputField from "components/Input";
import RoleServices from "services/Role";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import SelectField from "components/Select";
import UserServices from "services/User";
import SystemServices from "services/System";
import { useCallbackPrompt } from "hooks/useCallBackPrompt";
import CustomerServices from "services/Customer";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { InputLabel } from "@mui/material";
import { Checkbox } from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DatePicker from "components/DatePicker";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from "moment";
import instance from "config/axios";
import routes from "services/System/routes";
import { getFileSize } from "utils";
import UploadFile from "components/UploadFile";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
// function PasswordIcon(props) {
// 	return (
// 		<SvgIcon className='saraib' {...props}>
// 			<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
// 				<path d="M16.1163 8.29886C16.9177 8.63783 17.6589 9.08308 18.3311 9.62599V5.78823C18.3311 2.59681 15.7343 0 12.5429 0H12.4538C9.26526 0 6.66846 2.59681 6.66846 5.78823V9.62599C7.34064 9.0831 8.08176 8.63786 8.88321 8.29886C9.09865 8.20694 9.31984 8.12364 9.54103 8.04895V5.78823C9.54103 4.17959 10.8481 2.87257 12.4567 2.87257H12.5457C14.1544 2.87257 15.4614 4.17959 15.4614 5.78823V8.05182C15.6797 8.12364 15.9009 8.20694 16.1163 8.29886Z" fill="#B6B6B6" />
// 				<path d="M4.35889 16.8591C4.35889 21.3547 8.00418 24.9999 12.4998 24.9999C16.9953 24.9999 20.6407 21.3575 20.6407 16.8591C20.6407 14.6501 19.7587 12.645 18.3311 11.1771C17.5268 10.3527 16.5501 9.69772 15.4585 9.26974C14.5422 8.91067 13.5425 8.71533 12.4998 8.71533C11.457 8.71533 10.4574 8.91067 9.54104 9.26974C8.44946 9.69488 7.47278 10.3498 6.66846 11.1771C5.23789 12.645 4.35889 14.6501 4.35889 16.8591ZM10.4028 15.216C10.4315 14.1043 11.3363 13.1994 12.448 13.1735C13.6286 13.1448 14.5967 14.0957 14.5967 15.2705C14.5967 15.3941 14.5852 15.5147 14.5651 15.6296C14.4616 16.2242 14.1084 16.7355 13.6142 17.0458C13.4103 17.1751 13.3069 17.4163 13.3586 17.649L13.982 20.6049C14.0194 20.783 13.8843 20.9525 13.7005 20.9525H11.299C11.1152 20.9525 10.9801 20.7859 11.0175 20.6049L11.6408 17.649C11.6897 17.4135 11.5891 17.1722 11.3852 17.0429C10.8911 16.7327 10.5378 16.2242 10.4343 15.6267C10.4114 15.4946 10.3999 15.3567 10.4028 15.216Z" fill="#B6B6B6" />
// 			</svg>
// 		</SvgIcon>
// 	);
// }

function UpdateEmployee() {
    const [handleBlockedNavigation] =
        useCallbackPrompt(false)
    const navigate = useNavigate();
    const { id } = useParams()

    const { register, handleSubmit, formState: { errors }, control, getValues, watch, setError, setValue, reset,
        clearErrors, } = useForm({
            defaultValues: {
                overtime: '', // include all controlled fields here
                leftJob: '',
                // other fields
            },
        });

    const allowFilesType = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [inputError, setInputError] = useState(false);
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [buttondisabled, setButtondisabled] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState([])
    const [categories, setCategories] = useState([])
    const [dob, setDob] = useState(null)
    const [selectedGender, setSelectedGender] = useState(null)
    const [doj, setDoj] = useState(null)
    const [airFareDueDate, setAirFareDueDate] = useState(null)
    const [probEndDate, setProbEndDate] = useState(null)
    const [leavingDate, setLeavingDate] = useState(null)
    const [selectedTimeDetection, setSelectedTimeDetection] = useState(null)
    const [isActive, setIsActive] = useState('');
    const [isApplicable, setIsApplicable] = useState('')
    const [leftJob, setLeftJob] = useState('');
    const [overtime, setOvertime] = useState('');
    const [costCenters, setCostCenters] = useState([])
    const [selectedCostCenter, setSelectedCostCenter] = useState(null)
    const [isLocal, setisLocal] = useState(true)
    const [shiftType, setShiftType] = useState(null)
    const [shifts, setShifts] = useState([])
    const [selectedShift, setSelectedShift] = useState(null)
    const [nationalities, setNationalities] = useState([])
    const [selectedNationality, setSelectedNationality] = useState(null)
    const [approvals, setApprovals] = useState([])
    const [isUploading, setIsUploading] = useState(false);
    const [loader, setLoader] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const theme = useTheme();
    const [selectedDays, setSelectedDays] = useState([]);
    function getStyles(name, personName, theme) {
        return {
            fontWeight: personName.includes(name)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
        };
    }
    const [documents, setDocuments] = useState([
        {
            name: "Emirates  IDs",
            key: "emirates_id",
            path: "",
            expiry_date: null,
            is_required: false


        },
        {
            name: "Passport ",
            key: "passport",
            path: "",
            expiry_date: null,
            is_required: false
        },

        {
            name: "Visa Copy",
            key: "visa_copy",
            path: "",
            expiry_date: null,
            is_required: false
        },
        {
            name: "Labor Card",
            key: "labor",
            path: "",
            expiry_date: null,
            is_required: false
        },



    ]
    )
    const [approvers, setApprovers] = useState([]);

    const handleAddApprover = () => {
        if (approvers.length < 2) {
            const nextIndex = approvers.length + 1;
            setApprovers([...approvers, { key: `leave_approver_${nextIndex}`, value: '' }]);
        }
    };

    const handleRemoveApprover = (indexToRemove) => {
        const updated = approvers
            .filter((_, index) => index !== indexToRemove)
            .map((item, idx) => ({ ...item, key: `leave_approver_${idx + 1}` }));

        setApprovers(updated);
    };

    const handleApproverChange = (index, value) => {
        // Check if value already exists at a different index
        const isDuplicate = approvers.some((item, i) => i !== index && item.value === value);
        console.log(isDuplicate, 'isDuplicate');

        if (isDuplicate) {
            showErrorToast('This approver is already selected.');
            return; // Don't update
        }

        const updated = [...approvers];
        updated[index].value = value;
        setApprovers(updated);
    };
    // Watch both password and confirm password fields for changes
    const password = watch('password', '');
    const confirmPassword = watch('confirmpassword', '');
    console.log(errors);

    const [personName, setPersonName] = React.useState([]);
    const daysOfWeek = [
        { id: 0, name: 'Sunday' },
        { id: 1, name: 'Monday' },
        { id: 2, name: 'Tuesday' },
        { id: 3, name: 'Wednesday' },
        { id: 4, name: 'Thursday' },
        { id: 5, name: 'Friday' },
        { id: 6, name: 'Saturday' },
    ];

    const handleDeleteApproval = (keyToDelete) => {
        // Remove the key
        const filteredUserIds = Object.entries(approvals)
            .filter(([key]) => key !== keyToDelete)
            .map(([_, userId]) => userId);

        // Reconstruct approvals with sequential keys
        const reIndexedApprovals = {};
        filteredUserIds.forEach((userId, index) => {
            reIndexedApprovals[`leave_approver_${index + 1}`] = userId;
        });

        setApprovals(reIndexedApprovals);
    };


    const handleChangeDays = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedDays(value);
        console.log(value, 'valuevalue');

        setValue("workingDays", value);
    };
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;

        const selected = typeof value === 'string' ? value.split(',') : value;

        const selectedObjects = categories.filter((item) => selected.includes(item.label));

        setPersonName(selectedObjects); // Now you're storing the whole objects
    };


    const getRoles = async (search) => {
        try {
            let params = {
                page: 1,
                limit: 999999,
                search: search,
            };
            const { data } = await SystemServices.getRoles(params);
            setRoles(data?.roles?.rows)
        } catch (error) {
            showErrorToast(error);
        }
    };


    // *For Create Role
    const UpdateEmployee = async (formData) => {
        console.log(selectedCategoryObjects);

        setLoading(true)
        setButtondisabled(true)
        console.log(formData);
        try {
            let obj = {
                id: id,
                name: getValues('name'),
                employee_id: getValues('id'),
                email: getValues('email'),
                phone: getValues('phone'),
                password: getValues('password'),
                documents: documents,
                permittedCategories: selectedRole?.name == 'Typist' ? selectedCategoryObjects : null,
                role_id: selectedRole?.id,
                employee_detail: {
                    date_of_joining: doj,
                    id: newDetails?.id,
                    date_of_birth: dob,
                    probation_period_months: formData?.probation,
                    probation_end_date: probEndDate,
                    employment_status: formData?.status,
                    shift_start: moment(formData?.shiftStartTime).format('HH:mm'),
                    shift_end: moment(formData?.shiftEndTime).format('HH:mm'),

                    grace_period_minutes: formData?.graceMonths,
                    passport_number: formData?.passportnumber,
                    minimum_required_minutes: formData?.minHours,
                    short_time_deduction_type: selectedTimeDetection?.id,
                    personal_time_minutes_per_month: formData?.personalMintPerMonth,
                    leave_allocation_per_month: formData?.leavesPerMonth,
                    eligible_for_airfare: formData?.eligibleForAirfare == 'yes' ? true : false,
                    airfare_cycle_years: formData?.airfaireCycleYear,
                    next_airfare_due_date: airFareDueDate,
                    basic_salary: formData?.basicSalary,

                    designation: formData?.designation,
                    department: formData?.department,
                    is_active: isActive == 'yes' ? true : false,
                    is_overtime_eligible: overtime == 'yes' ? true : false,
                    has_left_job: leftJob == 'yes' ? true : false,
                    date_of_leaving: leavingDate,
                    transport_allowance: formData?.transport_allowance,
                    housing_allowance: formData?.housing_allowance,
                    other_allowance: formData?.other_allowance,
                    leaving_reason: formData?.reason,
                    branch: formData?.branch,
                    visa: formData?.visa,
                    work_permit: formData?.work_permit,
                    pension_percentage: formData?.pensionPercentage,
                    pension_applicable: isApplicable == 'yes' ? true : false,
                    pension_percentage_employer: formData?.pensionPercentageEmp,
                    iban: formData?.iban,
                    routing: formData?.routing,
                    is_local: isLocal,
                    cost_center: selectedCostCenter?.name,
                    shift_type: shiftType?.id,
                    shift_id: selectedShift?.id,
                    working_days: selectedDays.join(','),
                    gender: selectedGender?.id,
                    nationality: selectedNationality?.name,
                    emergency_contact_name: formData?.emergencyName,
                    emergency_contact_number: formData?.emergencyContact,
                    leave_approver_1: approvers[0]?.value,
                    leave_approver_2: approvers[1]?.value ? approvers[1]?.value : null

                }

            }


            console.log(obj);
            const promise = UserServices.UpdateEmployee(obj);

            showPromiseToast(
                promise,
                'Saving ...',
                'Success',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/employee-list')
            }


        } catch (error) {
            setButtondisabled(false)
            // showErrorToast(error)
        } finally {
            setLoading(false)
        }
    }



    // *For Get Customer Queue
    const getCategoryList = async (page, limit, filter) => {


        try {

            let params = {
                page: 1,
                limit: 999999,


            }

            const { data } = await CustomerServices.getCategoryList(params)
            setCategories(data?.categories);



        } catch (error) {
            showErrorToast(error)
        }
    }

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
    const parseTime = (timeString) => {
        return timeString && moment(timeString, 'HH:mm').isValid()
            ? moment(timeString, 'HH:mm')
            : null;
    };
    const [newDetails, setNewDetails] = useState(null)

    const getData = async () => {
        try {
            let params = { user_id: id };
            const { data } = await CustomerServices.getEmployeeDetail(params);
            let data2 = data?.employee
            console.log(data2, 'datadata');

            const employee = data2 || {};
            const details = data2 || {};
            console.log(details, 'details');
            setNewDetails(details)
            getShifts(details?.shift_id)
            setValue('name', employee?.user?.name || '');
            setValue('id', employee?.user?.employee_id || '');
            setValue('email', employee?.user?.email || '');
            setValue('phone', employee?.user?.phone || '');
            setValue('password', ''); // Usually not returned
            console.log(details?.leave_approver_2, 'details?.leave_approver_2');
            if (employee?.documents?.length > 0) {
                setDocuments(employee?.documents);

            }
            if (details?.leave_approver_2) {

                setApprovers([
                    { key: 'leave_approver_1', value: details?.leave_approver_1 },
                    { key: 'leave_approver_2', value: details?.leave_approver_2 }
                ])
            }
            else {
                setApprovers([
                    { key: 'leave_approver_1', value: details?.leave_approver_1 },
                ])
            }
            setValue('shiftStartTime', details?.shift_start ? moment(details?.shift_start, 'HH:mm') : null);
            setValue('shiftEndTime', details?.shift_end ? moment(details?.shift_end, 'HH:mm') : null);
            setValue('probation', details?.probation_period_months || '');
            setValue('status', details?.employment_status || '');
            setValue('passportnumber', details?.passport_number || '');
            setValue('graceMonths', details?.grace_period_minutes || '');
            setValue('minHours', details?.minimum_required_minutes || '');
            setValue('timedetection', details?.short_time_deduction_type || '');
            setSelectedTimeDetection({ id: details?.short_time_deduction_type, name: details?.short_time_deduction_type })
            setValue('personalMintPerMonth', details?.personal_time_minutes_per_month || '');
            setValue('leavesPerMonth', details?.leave_allocation_per_month || '');
            setValue('transport_allowance', details?.transport_allowance);
            setValue('pensionPercentage', details?.pension_percentage);
            setValue('pensionPercentageEmp', details?.pension_percentage_employer);
            setValue('other_allowance', details?.other_allowance);
            setValue('housing_allowance', details?.housing_allowance);
            setValue('eligibleForAirfare', details?.eligible_for_airfare ? 'yes' : 'no');
            setValue('airfaireCycleYear', details?.airfare_cycle_years || '');
            setValue('basicSalary', details?.basic_salary || '');
            setValue('designation', details?.designation || '');
            setValue('department', details?.department || '');
            setValue('emergencyName', details?.emergency_contact_name || '');
            setValue('emergencyContact', details?.emergency_contact_number || '');
            setSelectedGender({ id: details?.gender, name: details?.gender })
            setValue('gender', { id: details?.gender, name: details?.gender })
            setSelectedNationality({ id: details?.nationality, name: details?.nationality })
            setValue('nationality', { id: details?.nationality, name: details?.nationality })
            setIsActive(details?.is_active ? 'yes' : 'no')
            setIsApplicable(details?.pension_applicable ? 'yes' : 'no')
            setOvertime(details?.is_overtime_eligible ? "yes" : "no")
            setLeftJob(details?.has_left_job ? "yes" : "no")
            setValue('isActive', details?.is_active ? 'yes' : 'no');
            setValue("leftJob", details?.has_left_job ? "yes" : "no");
            setValue("overtime", details?.is_overtime_eligible ? "yes" : "no");
            setValue('reason', details?.leaving_reason || '');
            setValue('iban', details?.iban || '');
            setValue('branch', details?.branch || '');
            setValue('visa', details?.visa || '');
            setValue('work_permit', details?.work_permit || '');
            setValue('routing', details?.routing || '');
            setisLocal(details?.is_local ? "yes" : "no")
            setSelectedCostCenter({ id: details?.cost_center, name: details?.cost_center })
            console.log(moment(details?.date_of_birth).format('MM/DD/YYYY'));
            setShiftType({ id: details?.shift_type, name: details?.shift_type })
            setValue('shiftType', { id: details?.shift_type, name: details?.shift_type } || '');
            let selected = shifts.find(item => item?.id == details?.shift_id)
            setSelectedShift({ id: details?.shift_id, name: details?.shift_id })
            setValue('shift', { id: details?.shift_id, name: details?.shift_id } || '');
            setSelectedDays(details?.working_days.split(',').map(Number))
            setDob(details?.date_of_birth ? new Date(details?.date_of_birth) : null)
            setValue('dob', details?.date_of_birth ? new Date(details?.date_of_birth) : null);
            setDoj(details?.date_of_birth ? new Date(details?.date_of_joining) : null)
            setValue('doj', details?.date_of_joining ? new Date(details?.date_of_joining) : null);
            // setValue('doj', details?.date_of_joining ? moment(details?.date_of_joining) : null);
            // setValue('leavingDate', details?.date_of_leaving ? moment(details?.date_of_leaving) : null);
            setLeavingDate(details?.date_of_leaving ? new Date(details?.date_of_leaving) : null)
            setValue('leavingDate', details?.date_of_leaving ? new Date(details?.date_of_leaving) : null);
            setProbEndDate(details?.probation_end_date ? new Date(details?.probation_end_date) : null)
            setValue('probEndDate', details?.probation_end_date ? new Date(details?.probation_end_date) : null);
            setAirFareDueDate(details?.probation_end_date ? new Date(details?.next_airfare_due_date) : null)
            setValue('airFareDueDate', details?.next_airfare_due_date ? new Date(details?.next_airfare_due_date) : null);


        } catch (error) {
            console.error("Error fetching employee data:", error);
        }
    };

    const basicSalary = watch("basicSalary") || 0;
    const housing = watch("housing_allowance") || 0;
    const transport = watch("transport_allowance") || 0;
    const other = watch("other_allowance") || 0;

    const totalSalary = useMemo(() => {
        return (
            (parseFloat(basicSalary) || 0) +
            (parseFloat(housing) || 0) +
            (parseFloat(transport) || 0) +
            (parseFloat(other) || 0)
        );
    }, [basicSalary, housing, transport, other]);

    useEffect(() => {
        setValue("total_salary", totalSalary);
    }, [totalSalary, setValue]);
    const getCostCenters = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getCostCenters(params);
            setCostCenters(data?.cost_centers);

        } catch (error) {
            showErrorToast(error);
        }
    };
    const getShifts = async (id) => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await CustomerServices.getShifts(params);
            setShifts(data?.shifts?.rows);

            let selected = data?.shifts?.rows?.find(item => item?.id == id)
            setSelectedShift({ id: selected?.id, name: selected?.name })
            setValue('shift', { id: selected?.id, name: selected?.name } || '');
        } catch (error) {
            showErrorToast(error);
        }
    };

    const getNationalities = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await SystemServices.getNationalities(params);
            const formattedNationalities = data?.nationalities?.map((item, index) => ({
                id: item,
                name: item,
            }));

            setNationalities(formattedNationalities);



        } catch (error) {
            showErrorToast(error);
        }
    };

    const getEmployees = async () => {
        try {
            let params = {
                page: 1,
                limit: 999999,
            };

            const { data } = await UserServices.getUsers(params);

            const formattedData = data?.employees?.rows?.map((item, index) => ({
                ...item,
                id: item?.id,
                name: item?.user?.name,
            }));


            setEmployees(data?.users?.rows);



        } catch (error) {
            showErrorToast(error);
        }
    };
    useEffect(() => {
        getCostCenters()
        getEmployees()
        getData()
        getNationalities()
        getCategoryList()
        getRoles()

    }, [])

    // useEffect(() => {
    //     if (shifts?.length > 0) {
    //         console.log(shifts);
    //         console.log(newDetails);


    //         let selected = shifts.find(item => item?.id == newDetails?.shift_id)
    //         console.log(selected, 'selectedselected');

    //         setSelectedShift({ id: selected?.id, name: selected?.name })
    //         setValue('shift', { id: selected?.id, name: selected?.name });
    //     }

    // }, [newDetails, shifts])


    const selectedCategoryObjects = categories.filter((category) => selectedCategory.includes(category.id))

    // Handle checkbox change
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory((prev) => {
            if (prev.includes(categoryId)) {
                // Remove if already selected
                return prev.filter((id) => id !== categoryId)
            } else {
                // Add if not selected
                return [...prev, categoryId]
            }
        })
    }




    return (
        <Box sx={{ p: 3, borderRadius: 3, backgroundColor: 'white !important', boxShadow: ' rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>

            <Box component="form" onSubmit={handleSubmit(UpdateEmployee)} >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >Update Employee</Typography>

                </Box>
                <Box>
                    <Box display="flex" alignItems="center" mt={2}>
                        <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                        <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                            Personal Info
                        </Typography>
                    </Box>
                    <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                </Box>
                <Grid container spacing={0} mt={3} p={1} gap={'0px 20px'} >

                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Name :*"}
                            size={'small'}
                            placeholder={" Name"}
                            error={errors?.name?.message}
                            register={register("name", {
                                required:
                                    "Please enter name."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Employee ID :*"}
                            size={'small'}
                            placeholder={" Employee ID "}
                            error={errors?.id?.message}
                            register={register("id", {
                                required:
                                    "Please enter id."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Email :"}
                            size={'small'}
                            placeholder={"Email"}
                            error={errors?.email?.message}
                            register={register("email", {
                                required: false,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Please enter a valid email address."
                                }
                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Phone :*"}
                            size={'small'}
                            placeholder={"Phone "}
                            type={'number'}
                            error={errors?.phone?.message}
                            register={register("phone", {
                                required:
                                    false,
                                pattern: {
                                    value: /^05[0-9]{8}$/,
                                    message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                }

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Passport Number :*"}
                            size={'small'}
                            placeholder={"Passport Number"}
                            error={errors?.passportnumber?.message}
                            register={register("passportnumber", {
                                required:
                                    "Please enter passport number."

                            })}
                        />


                    </Grid>



                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"DOB:*"}
                            value={dob}
                            size={"small"}
                            error={errors?.dob?.message}
                            register={register("dob", {
                                required: dob ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("dob", date)
                                setDob(new Date(date))

                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <SelectField

                            size={"small"}
                            label={"Gender"}
                            options={[{ id: 'Male', name: 'Male' }, { id: 'Female', name: 'Female' }]}
                            selected={selectedGender}
                            onSelect={(value) => {
                                setSelectedGender(value);
                            }}
                            register={register("gender", {
                                required: 'gender is required'
                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <SelectField

                            size={"small"}
                            label={"Nationality"}
                            options={nationalities}
                            selected={selectedNationality}
                            onSelect={(value) => {
                                setSelectedNationality(value);
                            }}
                            register={register("nationality", {
                                required: 'nationality is required'
                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Emergency Contact Name :*"}
                            size={'small'}
                            placeholder={" Emergency Contact Name"}
                            error={errors?.emergencyName?.message}
                            register={register("emergencyName", {
                                required:
                                    "Please enter name."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Emergency Contact :"}
                            size={'small'}
                            placeholder={"Emergency Contact "}
                            type={'number'}
                            error={errors?.emergencyContact?.message}
                            register={register("emergencyContact", {
                                required:
                                    false,
                                pattern: {
                                    value: /^05[0-9]{8}$/,
                                    message: "Please enter a valid UAE phone number (starting with 05 and 8 digits)."
                                }

                            })}
                        />


                    </Grid>
                    {/* <Grid item xs={12} sm={2.8}>
                        <InputField
                            size="small"
                            label="Password :*"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Your Password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            error={errors.password?.message || (inputError && 'You have entered an invalid email or password.')}
                            register={register('password', {
                                required: 'Please enter the password.',
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            size="small"
                            label="Confirm Password :*"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Enter Your Confirm Password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            error={errors.confirmpassword?.message || (inputError && 'You have entered an invalid email or password.')}
                            register={register('confirmpassword', {
                                required: 'Please enter the confirm password.',
                                validate: value => value === password || 'Passwords do not match.',
                            })}
                        />

                    </Grid> */}
                    {selectedRole?.name === 'Typist' && (
                        <Grid item xs={12} sm={12}>

                            <Typography variant="h5" gutterBottom>
                                Select Categories
                            </Typography>

                            {selectedRole?.name === "Typist" && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={5}>
                                        <FormGroup>
                                            {categories?.map((category) => (
                                                <FormControlLabel
                                                    key={category.id}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedCategory?.includes(category.id)}
                                                            onChange={() => handleCategoryChange(category.id)}
                                                        />
                                                    }
                                                    label={category.name}
                                                />
                                            ))}
                                        </FormGroup>
                                    </Grid>


                                </Grid>
                            )}

                        </Grid>
                    )}
                </Grid>
                <Grid item xs={12}  >
                    <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: Colors.textColorDarkBlue }}>Documents : </Typography>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {documents?.length > 0 &&
                        documents.map((item, index) => (
                            <Grid item xs={12} md={4} key={item.key}>
                                {/* Upload Section */}
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    sx={{ color: Colors.gray }}
                                >
                                    {item?.is_required ? item?.name : `${item?.name} (If Any)`} :{" "}
                                    {item?.is_required ? "*" : ""}
                                </Typography>

                                <UploadFile
                                    Memo={true}
                                    accept={allowFilesType}
                                    file={documents}
                                    multiple={true}
                                    updateResult={updateResult}
                                    fileId={item?.key}
                                    loader={loader}
                                    error={errors[item?.key]?.message}
                                    disabled={isUploading}
                                    register={register(`${item?.key}`, {
                                        required: item?.is_required
                                            ? documents.find((item2) => item2?.key === item?.key)?.path !== ""
                                                ? false
                                                : "Please upload document."
                                            : false,
                                        onChange: async (e) => {
                                            setIsUploading(true);
                                            const path = await handleUploadDocument(e, item?.key);
                                            if (path) {
                                                handleDocArrayUpdate("path", path, item?.key);
                                                console.log(path);
                                            }
                                            setIsUploading(false);
                                        },
                                    })}
                                />

                                <DatePicker
                                    disablePast={true}
                                    size="small"
                                    label={`${item?.name} Expiry Date :`}
                                    value={item?.expiry_date ? new Date(item.expiry_date) : null}
                                    error={errors[`${item?.key}_expiry`]?.message}
                                    register={register(`${item?.key}_expiry`, {
                                        required: item?.is_required
                                            ? item?.expiry_date
                                                ? false
                                                : "Please select expiry date."
                                            : false,

                                    })}
                                    onChange={(date) => {



                                        setValue(`${item?.key}_expiry`, date);
                                        handleDocArrayUpdate("date", date, item?.key);
                                    }}
                                />
                            </Grid>
                        ))}
                </Grid>
                <Box>
                    <Box display="flex" alignItems="center" mt={2}>
                        <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                        <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                            Employeement Info
                        </Typography>
                    </Box>
                    <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                </Box>
                <Grid container spacing={0} mt={3} p={1} gap={'0px 20px'} >




                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Date of Joining:*"}
                            value={doj}
                            size={"small"}
                            error={errors?.doj?.message}
                            register={register("doj", {
                                required: doj ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("doj", date)
                                setDoj(new Date(date))

                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Probation Period End Date:*"}
                            value={probEndDate}
                            size={"small"}
                            error={errors?.probEndDate?.message}
                            register={register("probEndDate", {
                                required: probEndDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("probEndDate", date)
                                setProbEndDate(new Date(date))

                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Grace Period Minutes :*"}
                            size={'small'}
                            placeholder={"Grace Period Minutes"}
                            error={errors?.graceMonths?.message}
                            register={register("graceMonths", {
                                required:
                                    "Please enter graceMonths."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Minimum Required Minutes :*"}
                            size={'small'}
                            placeholder={"Minimum Required Minutes"}
                            error={errors?.minHours?.message}
                            register={register("minHours", {
                                required:
                                    "Please enter min hours."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <SelectField

                            size={"small"}
                            label={"Short Time Deduction Type"}
                            options={[{ id: 'Time', name: 'Time' }, { id: 'Hours', name: 'Hours' }]}
                            selected={selectedTimeDetection}
                            onSelect={(value) => {
                                setSelectedTimeDetection(value);
                            }}
                            register={register("timedetection")}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Personal Time Minutes Per Month :*"}
                            size={'small'}
                            placeholder={"Personal Time Minutes Per Month"}
                            error={errors?.personalMintPerMonth?.message}
                            register={register("personalMintPerMonth", {
                                required:
                                    "Please enter personal time mint per month."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={"Leaves Allocation Per Month :*"}
                            size={'small'}
                            type={'number'}
                            step={'any'}
                            placeholder={"Leaves Allocation Per Month"}
                            error={errors?.leavesPerMonth?.message}
                            register={register("leavesPerMonth", {
                                required:
                                    "Please enter leaves per month."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Branch:"}
                            size="small"
                            placeholder="Branch"
                            error={errors?.branch?.message}
                            register={register("branch", {
                                required: false,
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Visa:"}
                            size="small"
                            placeholder="Visa"
                            error={errors?.visa?.message}
                            register={register("visa", {
                                required: false,
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Work Permit:"}
                            size="small"
                            placeholder="Work Permit"
                            error={errors?.work_permit?.message}
                            register={register("work_permit", {
                                required: false,
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"IBAN:"}
                            size="small"
                            placeholder="IBAN"
                            error={errors?.iban?.message}
                            register={register("iban", {
                                required: false,
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <SelectField

                            size={"small"}
                            label={"Cost Center"}
                            options={costCenters}
                            selected={selectedCostCenter}
                            onSelect={(value) => {
                                setSelectedCostCenter(value);
                            }}
                            register={register("costCenter")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Routing:"}
                            size="small"
                            placeholder="Routing"
                            error={errors?.routing?.message}
                            register={register("routing", {
                                required: false,
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <SelectField
                            size="small"
                            label="Shift Type *"
                            options={[
                                { id: 'Fixed', name: 'Fixed' },
                                { id: 'Roaster', name: 'Roaster' }
                            ]}
                            selected={shiftType}
                            onSelect={(value) => {
                                setShiftType(value);
                            }}
                            register={register("shiftType", { required: "Shift type is required" })}
                            error={!!errors?.shiftType}
                            helperText={errors?.shiftType?.message}
                        />
                    </Grid>

                    {shiftType?.id === 'Fixed' && (
                        <Grid item xs={12} sm={2.8}>
                            <SelectField
                                size="small"
                                label="Shifts *"
                                options={shifts}
                                selected={selectedShift}
                                onSelect={(value) => {
                                    setSelectedShift(value);
                                    setValue('shift', value);
                                }}
                                register={register("shift", { required: "Shift is required" })}
                                error={!!errors?.shift}
                                helperText={errors?.shift?.message}
                            />
                        </Grid>
                    )}


                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ textTransform: "capitalize", textAlign: 'left', fontWeight: 700, color: Colors.gray }}>

                            Working Days
                        </InputLabel>
                        <FormControl
                            fullWidth
                            size="small"
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    paddingRight: '8px',
                                    height: '40px',
                                    borderColor: '#000',
                                },
                                '& .MuiSelect-select': {
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#000',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#000',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#000',
                                },
                            }}
                        >
                            <Select
                                multiple
                                displayEmpty
                                value={selectedDays}
                                onChange={handleChangeDays}
                                renderValue={(selected) =>
                                    selected.length === 0
                                        ? <span style={{ color: '#aaa' }}>Select Shifts</span>
                                        : selected.map((day) => daysOfWeek.find((d) => d.id === day)?.name).join(', ')
                                }
                            >
                                {daysOfWeek.map((day) => (
                                    <MenuItem key={day.id} value={day.id}>
                                        <Checkbox checked={selectedDays.includes(day.id)} />
                                        <ListItemText primary={day.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>



                    </Grid>
                </Grid>
                <Box>
                    <Box display="flex" alignItems="center" mt={2}>
                        <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                        <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                            Salary Info
                        </Typography>
                    </Box>
                    <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                </Box>
                <Grid container spacing={0} mt={3} p={1} gap={'0px 20px'} >




                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Is Active :*</InputLabel>
                        <Controller
                            name="isActive"
                            control={control}
                            rules={{ required: isActive ? false : "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={isActive}
                                    onChange={(e) => {
                                        setIsActive(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.isActive && <Typography color="error" sx={{ fontSize: 12 }}>{errors.isActive.message}</Typography>}
                    </Grid>

                    {/* Has Left Job */}
                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Has Left Job :*</InputLabel>
                        <Controller
                            name="leftJob"
                            control={control}
                            rules={{ required: leftJob ? false : "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={leftJob}
                                    onChange={(e) => {
                                        setLeftJob(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.leftJob && <Typography color="error" sx={{ fontSize: 12 }}>{errors.leftJob.message}</Typography>}
                    </Grid>

                    {/* Overtime */}
                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Overtime Eligible :*</InputLabel>
                        <Controller
                            name="overtime"
                            control={control}
                            rules={{ required: overtime ? false : "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={overtime}
                                    onChange={(e) => {
                                        setOvertime(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.overtime && <Typography color="error" sx={{ fontSize: 12 }}>{errors.overtime.message}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Is Local :*</InputLabel>
                        <Controller
                            name="isLocal"
                            control={control}
                            rules={{ required: isLocal ? false : "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={isLocal}
                                    onChange={(e) => {
                                        setisLocal(e.target.value);
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.isLocal && <Typography color="error" sx={{ fontSize: 12 }}>{errors.isLocal.message}</Typography>}
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputLabel sx={{ fontWeight: 700, color: "#434343", mb: 1 }}>Pension Applicable :*</InputLabel>
                        <Controller
                            name="isApplicable"
                            control={control}
                            rules={{ required: isApplicable ? false : "Please select an option" }}
                            render={({ field }) => (
                                <RadioGroup
                                    row
                                    {...field}
                                    value={isApplicable}
                                    onChange={(e) => {
                                        setIsApplicable(e.target.value);
                                        if (e.target.value == 'no') {
                                            setValue('pensionPercentage', 0)
                                            setValue('pensionPercentageEmp', 0)

                                        }
                                        field.onChange(e);
                                    }}
                                >
                                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                </RadioGroup>
                            )}
                        />
                        {errors.isApplicable && <Typography color="error" sx={{ fontSize: 12 }}>{errors.isApplicable.message}</Typography>}
                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Pension Percentage :"}
                            size={'small'}
                            step={'any'}
                            type={'number'}
                            disabled={isApplicable == 'no'}
                            placeholder={"  Pension Percentage "}
                            error={errors?.pensionPercentage?.message}
                            register={register("pensionPercentage", {
                                required:
                                    false

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Pension Percentage Employer :"}
                            size={'small'}
                            step={'any'}
                            type={'number'}
                            disabled={isApplicable == 'no'}
                            placeholder={"  Pension Percentage Employer "}
                            error={errors?.pensionPercentageEmp?.message}
                            register={register("pensionPercentageEmp", {
                                required:
                                    false

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Next Airfare Due Date:*"}
                            value={airFareDueDate}
                            size={"small"}
                            error={errors?.AirFareDueDate?.message}
                            register={register("AirFareDueDate", {
                                required: airFareDueDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("AirFareDueDate", date)
                                setAirFareDueDate(new Date(date))

                            }}
                        />
                    </Grid>





                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Airfare Cycle Years :*"}
                            size={'small'}
                            placeholder={" Airfare Cycle Years "}
                            error={errors?.airfaireCycleYear?.message}
                            register={register("airfaireCycleYear", {
                                required:
                                    "Please enter airfaireCycleYear."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={" Basic Salary :*"}
                            size={"small"}
                            type={"number"}
                            placeholder={"  Basic Salary "}
                            error={errors?.basicSalary?.message}
                            register={register("basicSalary", {
                                required: "Please enter basic salary.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Housing Allowance :*"}
                            size={"small"}
                            type={"number"}
                            placeholder={"  Housing Allowance  "}
                            error={errors?.housing_allowance?.message}
                            register={register("housing_allowance", {
                                required: "Please enter housing allowance.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Transport Allowance :*"}
                            size={"small"}
                            type={"number"}
                            placeholder={"  Transport Allowance "}
                            error={errors?.transport_allowance?.message}
                            register={register("transport_allowance", {
                                required: "Please enter transport allowance.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Other Allowance :*"}
                            size={"small"}
                            type={"number"}
                            placeholder={" Other Allowance "}
                            error={errors?.other_allowance?.message}
                            register={register("other_allowance", {
                                required: "Please enter other allowance.",
                            })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>
                        <InputField
                            label={"Total Salary"}
                            size={"small"}
                            type={"number"}
                            placeholder={"Total Salary"}
                            disabled
                            value={totalSalary}
                        />
                    </Grid>

                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Designation :*"}
                            size={'small'}

                            placeholder={"  Designation "}
                            error={errors?.designation?.message}
                            register={register("designation", {
                                required:
                                    "Please enter designation."

                            })}
                        />


                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Department :*"}
                            size={'small'}

                            placeholder={"  Department "}
                            error={errors?.department?.message}
                            register={register("department", {
                                required:
                                    "Please enter department."

                            })}
                        />


                    </Grid>


                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Leaving Date:"}
                            value={leavingDate}
                            size={"small"}
                            error={errors?.leavingDate?.message}
                            register={register("leavingDate", {
                                required: false
                            })}
                            onChange={(date) => {
                                setValue("leavingDate", date)
                                setLeavingDate(new Date(date))

                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>

                        <InputField
                            label={" Leaving Reason :"}
                            size={'small'}

                            placeholder={"  Leaving Reason "}
                            error={errors?.reason?.message}
                            register={register("reason", {
                                required:
                                    false

                            })}
                        />


                    </Grid>
                </Grid>
                <Box display="flex" alignItems="center" mt={2}>
                    <PersonOutlineIcon sx={{ fontSize: 20, mr: 1, color: '#2f3b52' }} />
                    <Typography variant="subtitle1" sx={{ color: '#2f3b52' }}>
                        Leave Approval Info
                    </Typography>

                </Box>
                {console.log(approvers, 'approvers')}
                <Divider mt={1} sx={{ borderColor: '#2f3b52' }} />
                <Grid container xs={12} mt={4} spacing={2}>
                    {employees?.length > 0 && approvers?.length > 0 && approvers?.map((approver, index) => (
                        <Grid item xs={6} sm={4} key={approver.key}>
                            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SelectField
                                    size="small"
                                    label={`Leave Approval ${index + 1}`}
                                    options={employees}
                                    // ✅ Pass the selected employee object here by finding it from value
                                    selected={employees.find(emp => emp.id === approver.value) || null}
                                    // ✅ Set value only, not object (you’ll reconstruct object in `SelectField`)
                                    onSelect={(selectedObj) => handleApproverChange(index, selectedObj?.id)}
                                    register={register(approver.key, {
                                        required: approver.value ? false : 'Approver is required',
                                    })}
                                    error={errors?.[approver.key]?.message}
                                />

                                {index > 0 && (
                                    <PrimaryButton
                                        bgcolor="#001f3f"
                                        title="Remove"
                                        buttonStyle={{ mt: 2 }}
                                        onClick={() => handleRemoveApprover(index)}
                                    />
                                )}
                            </Box>
                        </Grid>
                    ))}


                    {/* Show Add Button only if less than 2 approvers */}
                    {approvers.length < 2 && (
                        <Grid item xs={12} sm={2.8} mt={3.8}>
                            <PrimaryButton
                                bgcolor="#001f3f"
                                title="Add"
                                onClick={handleAddApprover}
                            />
                        </Grid>
                    )}

                </Grid>
                <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <PrimaryButton
                        bgcolor={'#001f3f'}
                        title="Update"
                        type={'submit'}
                        disabled={buttondisabled}

                    />

                </Box>
            </Box>

        </Box>
    );
}

export default UpdateEmployee;