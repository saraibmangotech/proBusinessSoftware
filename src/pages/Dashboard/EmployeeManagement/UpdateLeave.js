import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";


import { useLocation, useNavigate, useParams } from "react-router-dom";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import InputField from "components/Input";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import UserServices from "services/User";
import CustomerServices from "services/Customer";
import { ErrorToaster } from "components/Toaster";
import UploadFileSingle from "components/UploadFileSingle";
import Colors from "assets/Style/Colors";
import { CleanTypes, getFileSize } from "utils";
import instance from "config/axios";
import routes from "services/System/routes";

const leaveTypes = [{ id: 'Sick Leave', name: "Sick Leave" }, { id: "Casual Leave", name: "Casual Leave" }, { id: "Annual Leave", name: "Annual Leave" }];
const allowFilesType = [

    'application/pdf',

];
function UpdateLeave() {
    const { state } = useLocation()
    const navigate = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [selectedTime, setSelectedTime] = useState(null)
    const [isHalfDay, setIsHalfDay] = useState(false)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedType, setSelectedType] = useState(null)
    const [selectedAdditionalType, setSelectedAdditionalType] = useState(null)

    const [progress, setProgress] = useState(0);
    const [uploadedSize, setUploadedSize] = useState(0);
    const [slipDetail, setSlipDetail] = useState([]);
    const [slipLink, setSlipLink] = useState("");
    const [doc, setDoc] = useState(null)
    const {
        control,
        handleSubmit,
        register,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm();

    const { id } = useParams()

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
                setSlipLink(path)

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
                setSlipDetail(docs);

                console.log(data, 'asddasasd');
                return data?.data?.path

            }
        } catch (error) {
            ErrorToaster(error);
        }
    };

    const onSubmit = async (formData) => {

        console.log(formData);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds and convert to days
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

            const obj = {
                id: id,
                user_id: selectedUser?.user_id,
                start_date: startDate,
                end_date: endDate,
                total_days: totalDays,
                request_reason: formData?.reason,
                type: selectedType?.id,
                additional_type: selectedAdditionalType?.id,
                document: doc,
                first_approver_id: selectedUser?.leave_approver_1,
                second_approver_id: selectedUser?.leave_approver_2,
                requested_minutes: selectedTime?.id,
                is_halfday: isHalfDay
            };
            const promise = CustomerServices.UpdateLeave(obj);

            showPromiseToast(
                promise,
                'Saving...',
                'Added Successfully',
                'Something Went Wrong'
            );
            const response = await promise;
            if (response?.responseCode === 200) {
                navigate('/leave-list')
            }


        } catch (error) {
            ErrorToaster(error);
        }

    };

    const getUsers = async (page, limit, filter) => {
        // setLoader(true)
        try {

            let params = {
                page: 1,
                limit: 99999,
            }


            const { data } = await CustomerServices.getEmployees(params)

            const formattedData = data?.employees?.rows?.map((item, index) => ({
                ...item,
                id: item?.id,
                name: item?.user?.name,
            }));


            setUsers(formattedData);


        } catch (error) {
            showErrorToast(error)
        } finally {
            // setLoader(false)
        }
    }

    useEffect(() => {


        getUsers()
    }, [])


    useEffect(() => {
        if (state) {
            console.log(state, 'state');
            setStartDate(new Date(state?.start_date))
            setEndDate(new Date(state?.end_date))
            setValue('user', state?.employee)
            setSelectedUser(state?.employee)
            setDoc(state?.document)
            setIsHalfDay(state?.is_halfday)
            setSelectedTime({ id: state?.request_minutes, name: state?.request_minutes })
                setValue('type',{ id: state?.request_minutes, name: state?.request_minutes })
            setSelectedType({ id: state?.type, name: state?.type })
            setValue('type',{ id: state?.type, name: state?.type })
            setSelectedAdditionalType({ id: state?.additional_type, name: state?.additional_type })
            setValue('reason', state?.request_reason)
        }
    }, [state])



    return (
        <Box sx={{ p: 3, borderRadius: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
                        Update Leave
                    </Typography>
                    <Button variant="contained" type="submit" disabled={buttonDisabled}>
                        Update
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {/* Leave Type */}

                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"Start Date:*"}
                            value={startDate}
                            size={"small"}
                            error={errors?.startDate?.message}
                            register={register("startDate", {
                                required: startDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("startDate", date)
                                setStartDate(new Date(date))

                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.8}>
                        <DatePicker
                            label={"End Date:*"}
                            value={endDate}
                            disabled={isHalfDay || selectedType?.id == 'Personal Time'}
                            size={"small"}
                            error={errors?.endDate?.message}
                            register={register("endDate", {
                                required: endDate ? false : 'Date is required'
                            })}
                            onChange={(date) => {
                                setValue("endDate", date)
                                setEndDate(new Date(date))

                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2.8}>
                        <SelectField size="small"
                            label="Select User :*"
                            options={users}
                            disabled={true}
                            selected={selectedUser}
                            onSelect={(value) => setSelectedUser(value)}
                            error={errors?.user?.message}
                            register={register("user", {
                                required: "Please select  user"
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} md={2.8}>
                        <SelectField size="small"
                            label="Select Type :"
                            options={[{ id: 'Annual', name: 'Annual' },
                            { id: 'Sick', name: 'Sick' },
                            { id: 'Maternity', name: 'Maternity (Only for females)' },
                            { id: 'Paternal', name: 'Paternal (Only for males)' },
                            { id: 'Bereavement', name: 'Bereavement' },
                            { id: 'Military', name: 'Military' },
                            { id: 'Personal Time', name: 'Personal Time' },]}

                            selected={selectedType}
                            onSelect={(value) => {
                                setSelectedType(value)
                                if (value?.id != 'Annual') {
                                    setIsHalfDay(false)
                                }

                            }}
                            error={errors?.type?.message}
                            register={register("type", {
                                required: "Please select  type"
                            })}
                        />
                    </Grid>
                    {selectedType?.id == 'Annual' && <Grid item xs={2.8} sm={2.8}>
                        <Typography sx={{ fontSize: '15px', color: Colors.black, mb: 2, fontWeight: 'bold' }}>Type : </Typography>
                        <FormControl>
                            <RadioGroup
                                row
                                defaultValue={isHalfDay}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setIsHalfDay(JSON.parse(e.target.value));

                                }}
                            >
                                <FormControlLabel
                                    sx={{ color: "#000" }}

                                    value={true}
                                    control={<Radio />}
                                    label="Half Day"
                                />
                                <FormControlLabel
                                    sx={{ color: "#000" }}

                                    value={false}
                                    control={<Radio />}
                                    label="Full Day"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>}
                    {selectedType?.id == 'Personal Time' && <Grid item xs={12} md={2.8}>
                        <SelectField size="small"
                            label="Select Time :"
                            options={[{ id: '30', name: '30' },
                            { id: '60', name: '60' },
                            { id: '120', name: '120' },

                            ]}

                            selected={selectedTime}
                            onSelect={(value) => setSelectedTime(value)}
                            error={errors?.time?.message}
                            register={register("time", {
                                required: "Please select  time"
                            })}
                        />
                    </Grid>}
                    {selectedType?.id == 'Bereavement' && <Grid item xs={12} md={2.8}>
                        <SelectField size="small"
                            label="Select Additional Type :"
                            options={[{ id: 'Spouse', name: 'Spouse' },
                            { id: 'Other', name: 'Other' },
                            ]}

                            selected={selectedAdditionalType}
                            onSelect={(value) => setSelectedAdditionalType(value)}
                            error={errors?.additionalType?.message}
                            register={register("additionalType", {
                                required: "Please select  additionalType"
                            })}
                        />
                    </Grid>}
                    <Grid item xs={12} md={2.8}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>{selectedType?.id == 'Sick' ? "Upload Document :*" : "Upload Document :"}</Typography>
                        <UploadFileSingle
                            Memo={true}
                            accept={allowFilesType}
                            error={errors?.doc?.message}

                            file={doc}
                            register={register("doc", {
                                required: selectedType?.id == 'Sick' ? 'document is required' : false,
                                onChange: async (e) => {
                                    const path = await handleUploadDocument(e);
                                    if (path) {
                                        setDoc(path);
                                    }
                                }
                            })}
                        />
                    </Grid>


                    <Grid item xs={12} sm={5.6}>

                        <InputField
                            label={" Reason :*"}
                            size={'small'}
                            multiline
                            rows={4}
                            placeholder={"  Reason "}
                            error={errors?.reason?.message}
                            register={register("reason", {
                                required:
                                    "Please enter reason."

                            })}
                        />


                    </Grid>


                </Grid>
            </form>
        </Box>
    );
}

export default UpdateLeave;
