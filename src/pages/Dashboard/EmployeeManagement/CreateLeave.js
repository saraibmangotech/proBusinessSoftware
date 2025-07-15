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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";


import { useNavigate } from "react-router-dom";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import InputField from "components/Input";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import UserServices from "services/User";
import CustomerServices from "services/Customer";
import { ErrorToaster } from "components/Toaster";
import { useAuth } from "context/UseContext";
import instance from "config/axios";
import routes from "services/System/routes";
import { CleanTypes, getFileSize } from "utils";
import UploadFileSingle from "components/UploadFileSingle";
import Colors from "assets/Style/Colors";

const leaveTypes = [{ id: 'Sick Leave', name: "Sick Leave" }, { id: "Casual Leave", name: "Casual Leave" }, { id: "Annual Leave", name: "Annual Leave" }];
const allowFilesType = [

    'application/pdf',

];
function CreateLeave() {
    const navigate = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [users, setUsers] = useState([])
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState(null)
    const [selectedAdditionalType, setSelectedAdditionalType] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
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

        console.log(selectedUser,'selectedUser');
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds and convert to days
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

            const obj = {
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

            };
            console.log(obj,'objobj');
            
            const promise = CustomerServices.CreateLeave(obj);

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
        if (user?.role_id === 4) {

            setSelectedUser(user)
            setValue('user', user)

        }

    }, [user])

    return (
        <Box sx={{ p: 3, borderRadius: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
                        Create Leave
                    </Typography>
                    <Button variant="contained" type="submit" disabled={buttonDisabled}>
                        Submit
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
                            disabled={user?.role_id == 4}
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
                            { id: 'Bereavement', name: 'Bereavement' }]}

                            selected={selectedType}
                            onSelect={(value) => setSelectedType(value)}
                            error={errors?.type?.message}
                            register={register("type", {
                                required: "Please select  type"
                            })}
                        />
                    </Grid>
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
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: Colors.gray }}>Upload Document :</Typography>
                        <UploadFileSingle
                            Memo={true}
                            accept={allowFilesType}
                            error={errors?.doc?.message}

                            file={doc}
                            register={register("doc", {
                                required: false,
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

export default CreateLeave;
