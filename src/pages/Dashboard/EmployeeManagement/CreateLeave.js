import React, { useState } from "react";
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

const leaveTypes = [{id:'Sick Leave',name:"Sick Leave"}, {id:"Casual Leave",name:"Casual Leave"}, {id:"Annual Leave",name:"Annual Leave"}];

function CreateLeave() {
    const navigate = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const {
        control,
        handleSubmit,
        register,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setButtonDisabled(true);
            const formData = new FormData();
            formData.append("leaveType", data.leaveType);
            formData.append("startDate", data.startDate);
            formData.append("endDate", data.endDate);
            formData.append("reason", data.reason);



        } catch (error) {
            console.error(error);
        } finally {
            setButtonDisabled(false);
        }
    };

    return (
        <Box sx={{ p: 3, borderRadius: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                    <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
                        CREATE LEAVE
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
                            label="Leave Type :*"
                            options={leaveTypes}
                            selected={watch("leaveType")}
                            onSelect={(value) => setValue("leaveType", value)}
                            error={errors?.leaveType?.message}
                            register={register("leaveType", {
                                required: "Please select leave type"
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
