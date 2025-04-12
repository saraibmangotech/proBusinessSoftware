import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { InputLabel, Box } from "@mui/material";

export default function RowRadioButtonsGroup({ label, options, value, onChange }) {
	return (
		<Box>
			<InputLabel>{label}</InputLabel>
			<FormControl>
				<RadioGroup
					row
					aria-labelledby="demo-row-radio-buttons-group-label"
					name="row-radio-buttons-group"
					value={value}
					onChange={onChange}
				>
					{options.map((option) => (
						<FormControlLabel
							key={option.value}
							value={option.value}
							control={<Radio />}
							label={option.label}
						/>
					))}
				</RadioGroup>
			</FormControl>
		</Box>
	);
}
