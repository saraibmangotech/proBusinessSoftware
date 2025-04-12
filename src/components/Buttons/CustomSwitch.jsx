import React from "react";
import { alpha, styled } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import Switch from "@mui/material/Switch";

const MySwitch = styled(Switch)(({ theme }) => ({
	"& .MuiSwitch-switchBase.Mui-checked": {
		color: "#38cb89",
		"&:hover": {
			backgroundColor: alpha("#38cb89", theme.palette.action.hoverOpacity),
		},
	},
	"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
		backgroundColor:" #38cb89",
	},
}));

const label = { inputProps: { "aria-label": "Color switch demo" } };

const CustomSwitch = ({ checked, onChange }) => {
	return <MySwitch {...label} checked={checked} onChange={onChange} />;
};

export default CustomSwitch;
