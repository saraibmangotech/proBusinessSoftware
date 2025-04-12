import { CancelOutlined } from "@mui/icons-material";
import { Box, Dialog, IconButton, TextField, Button } from "@mui/material";
import { useState } from "react";
import InputField from "components/Input";
import { SuccessToaster } from "components/Toaster";
import ClientServices from "services/Client";
import { useForm } from "react-hook-form";
import { ErrorToaster } from "components/Toaster";
import { PrimaryButton } from "components/Buttons";
import { CleanTypes, Debounce, getYearMonthDateFormate } from "utils";

function VehicleTTApproval({ item, open, onClose, onApiSuccess }) {

    const [inputValue, setInputValue] = useState("");
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm();

    const handleSubmit2 = async () => {

        try {
            let obj = {

                booking_id: item?.invoice?.booking_id,
                vehicle_id: item?.vehicle?.id,

            }

            const { message } = await ClientServices.sendApproval(obj);
            SuccessToaster(message);
        }
        catch (error) {
            console.log(error);
            ErrorToaster(error);
        }



        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDialog-paper": {
                    width: "30%",
                    height: "auto",
                    borderRadius: 2,
                    py: { xs: 2, md: 4 },
                    px: { xs: 3, md: 6 },
                },
            }}
        >
            <IconButton onClick={onClose} sx={{ position: "absolute", right: 13, top: 13 }}>
                <CancelOutlined />
            </IconButton>
            <Box component={"form"} onSubmit={handleSubmit(handleSubmit2)}>

                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 2 }}>
                    <PrimaryButton type="submit" title="send for Approval" />
                </Box>
            </Box>
        </Dialog>
    );
}

export default VehicleTTApproval;
