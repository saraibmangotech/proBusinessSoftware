import { Fragment } from "react";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Colors from "assets/Style/Colors";
import { UploadCloudIcon, UploadIcon } from "assets";
import styled from "@emotion/styled";
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

const useStyle = makeStyles({
  root: {
    borderRadius: 2,
    textAlign: 'center',
    px: 2,
    width: '180px',
    height: '180px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

})

const Input = styled('input')({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  opacity: 0,
  fontSize: 0,
  cursor: 'pointer',
});

function UploadFile({ inputRef, error, accept, register, multiple, style, custom,Memo }) {

  const classes = useStyle();

  return (
    <Fragment>
      <Box style={style} className={classes.root} sx={{ border: `1px dashed ${error ? Colors.danger : Colors.primary}` }} >
        <Input
          ref={inputRef}
          type='file'
          multiple={multiple}
          accept={accept}
          error={error}
          {...register}
        />
        {custom && <Box sx={{ fontSize: '15px' }}>
          <Typography component={'h5'} variant="caption" sx={{ color: Colors.primary, mt: 0.2, textAlign: 'left', fontSize: '15px' }}> Upload File</Typography>


          <Typography component={'p'} variant="caption" sx={{ color: '#909593', fontSize: '11px' }}>JPEG,PNG,PDF,Word</Typography>
        </Box>}
        {Memo && <Box sx={{ fontSize: '15px' }}>
          <Typography component={'h5'} variant="caption" sx={{ color: Colors.black, mt: 0.2, textAlign: 'center', fontSize: '15px' }}> Drag & drop files or  <span style={{color:Colors.primary,textDecoration:'underline'}}>Browse</span></Typography>


          <Typography component={'p'} variant="caption" sx={{ color: '#909593', fontSize: '11px' }}>JPEG, PNG, PDF</Typography>
        </Box>}
        <Box>
          {custom ? <FileUploadOutlinedIcon sx={{ color: '#0c6135' }} /> : Memo ? <UploadCloudIcon/> : <UploadIcon />}

          {/* <Typography component={'p'} variant="caption" sx={{ color: Colors.charcoalGrey, mt: 1 }}>Browse to find or drag image here</Typography> */}
        </Box>
      </Box>
      {error &&
        <Typography color="error" sx={{ fontSize: 12, textAlign: 'left' }}>
          {error}
        </Typography>
      }
    </Fragment>
  );
}

export default UploadFile