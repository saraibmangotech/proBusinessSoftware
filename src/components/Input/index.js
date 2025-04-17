import { Fragment, useRef } from "react";
import { FormControl, InputLabel, TextField, Typography, InputAdornment, } from "@mui/material";
import Colors from "assets/Style/Colors";

function InputField(props) {
	const {
		inputRef,
		variant,
		step,
		size,
		dir,
		label,
		labelIcon,
		placeholder,
		defaultValue,
		value,
		register,
		error,
		rows,
		multiline,
		type,
		InputProps,
		disabled,
		inputProps,
		onInput,
		onBlur,
		helperText,
		style,
		id,
		inputStyle,
		startAdornment,
		endAdornment,
		custom,
		max,
		readOnly
	} = props;

	return (
		<Fragment>
			<InputLabel error={error && true} sx={custom ? custom : { textTransform: "capitalize", textAlign: 'left',fontWeight:700,color:Colors.gray }}>
				{" "}
				{labelIcon ? (
					<img src={labelIcon} alt="" width={"13px"} height={"13px"} />
				) : (
					""
				)}{" "}
				{label}
			</InputLabel>
			<FormControl
				variant="standard"
				fullWidth
				sx={{ mt: 1, mb: 2, ...style, ".MuiFormHelperText-root": { ml: 0 } }}
			>
				<TextField
					inputRef={inputRef}
					variant={variant ?? "outlined"}
					size={size}
					dir={dir}
				
					step={step}
					value={value}
					type={type}
					disabled={disabled}
					placeholder={placeholder}
					defaultValue={defaultValue}
					id={id}
					error={error && true}
					multiline={multiline}
					rows={rows ? 4 :''}
					onBlur={onBlur}

					InputProps={{
						startAdornment: (
							startAdornment && (
								<InputAdornment position="start">
									{startAdornment}
								</InputAdornment>
							)
						),
						endAdornment: (
							endAdornment && (
								<InputAdornment position="end">
									{endAdornment}
								</InputAdornment>
							)
						),
						...InputProps,
					}}

					inputProps={inputProps} // *For Input Attributes
					onInput={onInput}
					helperText={helperText}
					{...register}
					sx={{
						borderRadius: '10px !important',  // Apply border radius here
						'.MuiOutlinedInput-root': {
							border: "2px solid black !important",
							borderRadius: "10px !important",
							outline: "none !important",
							'& fieldset' : {border:'none !important'},
							"&.Mui-focused": {
								'& fieldset' : {border:'none !important'},
								"svg": {
									"path": {
										fill: "#0076bf"
									}
								}
							}
						},
						...inputStyle,
					}} // Custom input style
				/>
				<Typography color="error" sx={{ fontSize: 12, textAlign: "left" }}>
					{error}
				</Typography>
			</FormControl>
		</Fragment>
	);
}

export default InputField;
