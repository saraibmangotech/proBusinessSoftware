import React from "react";
import { Box } from "@mui/material";
import { Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	
	},
}));

function PageNotFound() {
	const classes = useStyles();
	return (
		<Container className={classes.container}>
			<Box sx={{mt:25}}  display={"flex"} justifyContent={"center"} flexDirection={"column"} alignItems={"center"}>
				<Typography variant="h1" gutterBottom></Typography>
				<Typography variant="h6"  sx={{fontSize:'100px'}} >
					404
				</Typography>
				<Typography variant="h4" gutterBottom>
					Page not found
				</Typography>
				<Typography variant="body1" paragraph>
					The page you are looking for might be under construction or does not exist.
				</Typography>
				<Button component={Link} to="/dashboard" variant="contained" color="primary">
					Go to Dashboard
				</Button>
			</Box>
		</Container>
	);
}

export default PageNotFound;
