import { LoadingButton } from "@mui/lab";
import { Button, Switch } from "@mui/material";
import Colors from "assets/Style/Colors";

export const PrimaryButton = (props) => {
  return (
    <LoadingButton
      startIcon={
        (props.src || props.icon) && (
          <span style={{ marginRight: "8px", display: "flex" }}>
            {props.src ? <img src={props.src} alt="icon" width={"18px"} height={"18px"} /> : props.icon}
          </span>
        )
      }
      variant="contained"
      {...props}
      className={props.className}
      sx={{
        textTransform: "capitalize",
        boxShadow: "none",
        pl: '25px',
        pr: '25px',
        // minWidth: { xs: "100px", md: "150px" },
        py: 1.2,
        background: '#001f3f',
        color: props.textcolor ? props.textcolor : Colors.white, // Apply text color
        fontSize: { xs: 12, md: 14 },
        ...props.buttonStyle,
      }}
    >
      {props.title ? props.title : ''}
    </LoadingButton>
  );
};

export const PaginationButton = (props) => {
  return (
    <Button
      {...props}
      variant="contained"
      sx={{
        py: 0.5,
        mx: 0.5,
        width: '10px',
        height: '40px',
        textTransform: "capitalize",
        bgcolor: Colors.white,
        color: Colors.black,
        "&:hover": { bgcolor: Colors.white, color: Colors.black },
      }}
    >
      {props.children}
    </Button>
  );
}

export const SwitchButton = ({ isChecked, setIsChecked }) => {

  return (
    <Switch
      checked={isChecked}
      onClick={setIsChecked}
      focusVisibleClassName=".Mui-focusVisible"
      sx={{
        width: 50,
        height: 28,
        padding: 0,
        margin: 0,
        '& .MuiSwitch-switchBase': {
          padding: '0px !important',
          margin: 0,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(21px)',
            color: Colors.white,
            '& + .MuiSwitch-track': {
              backgroundColor: Colors.primary,
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
          },
          '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: Colors.primary,
            border: '6px solid #fff',
          },
          '&.Mui-disabled .MuiSwitch-thumb': {
            color: 'red',
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.3,
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 20,
          height: 20,
        },
        '& .MuiSwitch-track': {
          borderRadius: 24 / 2,
          backgroundColor: '#E9E9EA',
          opacity: 1,
          transition: 500,
        },
      }}
    />
  );
};
