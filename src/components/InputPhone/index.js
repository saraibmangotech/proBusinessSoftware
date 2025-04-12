import { Fragment } from "react";
import { FormControl, InputLabel, Typography } from "@mui/material";
import Colors from "assets/Style/Colors";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/bootstrap.css'

function InputPhone(props) {

  const { label, disabled,size, name, control, height,rules, error, onBlur, disableDropdown, countryCodeEditable } = props

  return (
    <Fragment>
      <InputLabel sx={{color:'#323B4B'}} error={error}>{label}</InputLabel>
      <FormControl variant="standard" fullWidth sx={{ mb: 2 }} >
        <Controller
          name={name}
          control={control}
          rules={rules}
   
          render={({ field }) => (
            <PhoneInput
              {...field}
              country={'ae'}
              disabled={disabled}
              size={size}
              disableDropdown={disableDropdown}
              countryCodeEditable={countryCodeEditable}
              containerStyle={{ marginTop: '8px' }}
              
              
              inputStyle={{ width: '100%', borderColor: error && Colors.danger, boxShadow: 'none',height: height ? height : '' }}
              onBlur={onBlur}
              isValid={(value, country) => {
                if (value.match(/12345/)) {
                  return 'Invalid value: ' + value + ', ' + country.name;
                } else if (value.match(/1234/)) {
                  return false;
                } else {
                  return true;
                }
              }}
            />
          )}
        />
        {error &&
          <Typography color="error" sx={{ fontSize: 12, textAlign: 'left' }}>
            {error}
          </Typography>
        }
      </FormControl>
    </Fragment>
  );
}

export default InputPhone