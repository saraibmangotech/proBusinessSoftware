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


import { useLocation, useNavigate, useParams } from "react-router-dom";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import InputField from "components/Input";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import UserServices from "services/User";
import CustomerServices from "services/Customer";
import { ErrorToaster } from "components/Toaster";

const leaveTypes = [{ id: 'Sick Leave', name: "Sick Leave" }, { id: "Casual Leave", name: "Casual Leave" }, { id: "Annual Leave", name: "Annual Leave" }];

function UpdateLeave() {
    const { state } = useLocation()
    const navigate = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
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

    const onSubmit = async (formData) => {

        console.log(formData);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate the difference in milliseconds and convert to days
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

            const obj = {
                id: id,
                user_id: selectedUser?.id,
                start_date: startDate,
                end_date: endDate,
                total_days: totalDays,
                request_reason: formData?.reason,
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


            const { data } = await UserServices.getUsers(params)
            setUsers(data?.users?.rows)



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
            setValue('user',state?.employee)
            setSelectedUser(state?.employee)
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
