import { CancelOutlined } from "@mui/icons-material";
import { Box, Dialog, IconButton, Typography, Grid } from "@mui/material";
import { FontFamily } from "assets";
import Colors from "assets/Style/Colors";
import { PrimaryButton } from "components/Buttons";
import SelectField from "components/Select";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ExportServices from "services/Export";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import DatePicker from "components/DatePicker";
import { getYearMonthDateFormate } from "utils";

function VINContainerDialog({
	open,
	onClose,
	updateStatus,
	Options,
	statusCheck,
	CurrentStatus,
	Id,
	onApiSuccess,
	rowData
}) {
	const [selectedOption, setSelectedOption] = useState([]);
	const [loading, setLoading] = useState(false);
	const [date, setDate] = useState();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	console.log(rowData);
	const UpdateStatus = async (formData) => {
		setLoading(true);
		if (statusCheck) {
			try {
				let obj = {
					container_id: Id,
					status_id: selectedOption.id,
					status_name: selectedOption.name,
					customer_phone:rowData?.customer?.uae_phone,
					customer_id:rowData?.customer?.id,
					status_date: getYearMonthDateFormate(date),
					container_number:rowData?.container_number
				};

				const { message } = await ExportServices.UpdateContainer(obj);
				SuccessToaster(message);
				if (onApiSuccess) {
					onApiSuccess();
				}
			} catch (error) {
				ErrorToaster(error);
			} finally {
				setLoading(false);
			}
		} else {
			try {
				let obj = {
					ev_id: Id,
					status_id: selectedOption.id,
					status_name: selectedOption.name,
					customer_phone:rowData?.customer?.uae_phone,
					customer_id:rowData?.customer?.id,
					vin:rowData?.vin,
					date: getYearMonthDateFormate(date),
				};

				const { message } = await ExportServices.VehicleStatusUpdate(obj);
				SuccessToaster(message);
				if (onApiSuccess) {
					onApiSuccess();
				}
			} catch (error) {
				ErrorToaster(error);
			} finally {
				setLoading(false);
			}
		}
	};

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

	useEffect(() => {
		if (open) {
			setSelectedOption(CurrentStatus);
		}
	}, [open]);

	return (
		<Dialog
			open={open}
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
			<IconButton onClick={() => onClose()} sx={{ position: "absolute", right: 13, top: 13 }}>
				<CancelOutlined />
			</IconButton>
			<Box>
				<Typography
					variant="h5"
					sx={{
						textAlign: "center",
						color: Colors.charcoalGrey,
						fontFamily: FontFamily.NunitoRegular,
						mt: 1,
						mb: 1.5,
					}}
				>
					Status
				</Typography>
				<Box component={"form"} onSubmit={handleSubmit(UpdateStatus)}>
					<SelectField
						options={Options}
						selected={selectedOption}
						onSelect={(value) => {
							setSelectedOption(value);
							setDate(new Date());
						}}
						size="small"
						error={errors?.Status?.message}
						register={register("Status", {
							required: "Please select status.",
						})}
					/>
					<DatePicker
						size={"small"}
						label={"Date"}
						value={date}
						onChange={(date) => handleDate(date)}
					/>
					<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
						<PrimaryButton title="Submit" type="submit" loading={loading} />
					</Box>
				</Box>
			</Box>
		</Dialog>
	);
}

export default VINContainerDialog;
