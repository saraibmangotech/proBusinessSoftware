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
import VendorServices from "services/Vendor";

function EditNotesVendor({  item ,open, onClose, onApiSuccess}) {
    console.log(item);

	const [inputValue, setInputValue] = useState("");
	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors },
	} = useForm();

	const handleSubmit2 = async () => {

		try{

			let obj={
				costings:[
					{	
						booking_id: item?.booking_id,
						customer_id: item?.booking?.customer_id,
						container_no: item?.shipping?.container_no,
						vehicle_make: item?.booking?.veh_make?.id,
						vehicle_model: item?.booking?.veh_model?.id,
						vin: item?.booking?.vin,
						lot_number: item?.booking?.lot_number,
						color: item?.booking?.color,
						loading_port: item?.shipping?.loading_port_id,
						location: item?.shipping?.location?.id,
						country_code: item?.shipping?.country_code,
						destination: item?.shipping?.destination,
						galaxy_arrival_date: getYearMonthDateFormate(item?.vehicle?.arrived_galaxy_date),
						costing_id:item?.id,
					    notes:getValues('notes')}
				
				
				]
			
			}
	
	
		const { message } = await VendorServices.updateVendorCosting(obj);
		SuccessToaster(message);
		}
		catch (error) {
			
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
				<InputField
					label="Notes"
					error={errors?.notes?.message}
					register={register("notes", {
						required: "Please enter notes.",
					})}
				
					
				
				/>
				<Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 2 }}>
				<PrimaryButton type="submit" title="Submit" />
				</Box>
			</Box>
		</Dialog>
	);
}

export default EditNotesVendor;
