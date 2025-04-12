import React, { useState } from "react";
import { Grid } from "@mui/material";

function Togglebutton() {
	const [selectedButton, setSelectedButton] = useState(null);

	const handleClick = (index) => {
		setSelectedButton(index);
	};

	return (
		<Grid container sx={{ backgroundColor: "blue",width:"15%" ,borderRadius:'20px' }}>
			{[1, 2, 3].map((index) => (
				<Grid
					key={index}
					xs={4}
					className={`innerCircle ${selectedButton === index ? "selected" : ""}`}
					onClick={() => handleClick(index)}
					sx={{
						backgroundColor: selectedButton === index ? "blue" : "yellow",
						textAlign: "center",
						padding: "20px",
						cursor: "pointer",
					}}
				>
					{index === 1 ? "Yes" : index === 2 ? "No" : "uu"}
				</Grid>
			))}
		</Grid>
	);
}

export default Togglebutton;
