import { FormControl, TextField, Typography } from "@mui/material";
import { Fragment } from "react";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Colors from "assets/Style/Colors";
import { format as formatDate } from "date-fns";

function DatePicker({ 
  label, 
  value, 
  size, 
  views, 
  openTo, 
  error, 
  disabled, 
  disablePast, 
  disableFuture, 
  register, 
  onChange, 
  minDate, 
  maxDate 
}) {
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  return (
    <Fragment>
      <Typography 
        variant="body1" 
        sx={{ 
          textTransform: 'capitalize', 
          color: Colors.gray,
          fontWeight: 700 
        }}
      >
        {label}
      </Typography>
      <FormControl 
        variant="standard" 
        fullWidth 
        sx={{ 
          mb: 1, 
          '.MuiStack-root': { overflow: 'hidden' } 
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DemoContainer components={['DesktopDatePicker']}>
            <DesktopDatePicker
              openTo={openTo}
              className="custom-file"
              views={views}
              disabled={disabled}
              disablePast={disablePast}
              disableFuture={disableFuture}
              value={value}
              minDate={minDate}
              maxDate={maxDate}
              format="dd/MM/yyyy" // Updated format here
              sx={{ 
                width: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: `2px solid ${Colors.DarkBlue} !important`,
                    borderRadius: '10px'
                  }
                }
              }}
              onChange={(newValue) => {
                if (isValidDate(newValue)) {
                  const formattedDate = formatDate(newValue, 'dd/MM/yyyy'); // Updated format here
                  onChange(formattedDate);
                } else {
                  onChange(null);
                }
              }}
              slotProps={{ textField: { size: size }, field: { clearable: true } }}
              renderInput={(params) => (
                <TextField {...params} {...register} error={error} />
              )}
            />
          </DemoContainer>
        </LocalizationProvider>
        {error && (
          <Typography 
            color="error" 
            sx={{ fontSize: 12, textAlign: 'left' }}
          >
            {error}
          </Typography>
        )}
      </FormControl>
    </Fragment>
  );
}

export default DatePicker;
