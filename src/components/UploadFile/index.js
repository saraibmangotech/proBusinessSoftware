import React, { Fragment, useEffect, useState } from "react";
import { Box, CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Colors from "assets/Style/Colors";
import { Images } from "assets";
import styled from "@emotion/styled";
import DeleteIcon from '@mui/icons-material/Delete';
import $ from 'jquery';

// Styles
const useStyle = makeStyles({
  root: {
    borderRadius: 8,
    textAlign: "center",

    width: "220px",
    height: "140px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    border: "2px dashed #9BA3AF",
    backgroundColor: "#F8FAFC",
    px: '80px',
    transition: "0.3s ease",
    cursor: "pointer",

    "&:hover": {
      borderColor: Colors.primary,
      backgroundColor: "#F1F5F9",
    },
  },
});


// Styled component for the input
const Input = styled('input')({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  padding:'25px',
  opacity: 0,
  fontSize: 0,
  cursor: 'pointer',
});

function UploadFile({ inputRef, error, accept, register, multiple, style, custom, Memo, file, fileId, updateResult, disabled, loader }) {


  const [fileAvailable, setFileAvailable] = useState(file || []);

  const classes = useStyle();

  useEffect(() => {
    // Select inputs with the 'custom-file' class and set their 'disabled' property
    $('input.custom-file').prop('disabled', disabled);

    // Select inputs inside elements with the 'custom-file' class and set their 'disabled' property
    $('.custom-file input').prop('disabled', disabled);
    $('.custom-file button').prop('disabled', disabled);
  }, [disabled]);



  useEffect(() => {
    let currentFile = file && file.length > 0 && file.find(item => item.key === fileId);
    let multiPaths = currentFile?.path.split(",");
    let result = multiPaths?.length > 0 && multiPaths?.map(item => ({
      extension: item.split('.').pop(),
      name: item.split('_').pop(),
      path: item
    }));

    setFileAvailable(result);
  }, [file, fileId]);

  const handleDelete = (path) => {
    let newResult = [...fileAvailable];
    let ind = newResult.findIndex(x => x.path === path);
    newResult.splice(ind, 1);
    let updatedPaths = newResult.map(item => item.path).join(',');
    setFileAvailable(newResult);
    updateResult(fileId, updatedPaths);
  };

  return (
    <Fragment>
      <Box style={style} className={classes.root}>
        <Input
          className="custom-file"
          disabled={disabled}
          ref={inputRef}
          type='file'
          multiple={multiple}
          accept={accept}

          {...register}
          style={{ width: '250px' }}
        />
        {Memo && (
          <Box sx={{ fontSize: '15px' }}>
            <Box sx={{ textAlign: 'left' }}>
              <Box component={'img'} src={Images?.uploadDoc} width={'50px'}></Box>
            </Box>
            <Typography component={'h5'} variant="caption" sx={{ color: Colors.black, mt: 0.2, textAlign: 'center', fontSize: '15px', width: '223px' }}>
              <span style={{ color: Colors.blue }}>Click to Upload</span> Or drag & drop
            </Typography>
            <Typography component={'h5'} variant="caption" sx={{ color: Colors.black, mt: 0.2, textAlign: 'left', fontSize: '15px' }}>
              (Max. File size: 10 MB)
            </Typography>
          </Box>
        )}
      </Box>
      {/* {loader && <CircularProgress />}  */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '2px', flexWrap: 'wrap' }}>
        {loader == fileId ? <CircularProgress /> : fileAvailable?.length > 0 && fileAvailable.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
            {item?.extension &&
              <Box sx={{ position: 'relative' }}>
                <Box component={'div'} onClick={() => handleDelete(item?.path)} sx={{ position: 'absolute', top: -10, right: -10, cursor: 'pointer' }}>
                  <IconButton>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box component={'img'} sx={{ cursor: 'pointer' }} onClick={() => {
                  console.log(item);
                  window.open(process.env.REACT_APP_IMAGE_BASE_URL + item.path, '_blank')
                }}
                  src={(item?.extension === 'png' || item?.extension === 'jpg' || item?.extension === 'jpeg') ? Images.uploadImage :
                    item?.extension === 'pdf' ? Images.uploadPDF :
                      item?.extension === 'xls' ? Images.uploadXls :
                        Images.docIcon}
                  width={'50px'} />
                <p onClick={() => {
                  console.log(item);
                  window.open(process.env.REACT_APP_IMAGE_BASE_URL + item.path, '_blank')
                }} style={{ color: 'blue', width: "120px", cursor: 'pointer' }}>{item?.name}</p>

              </Box>}
          </Box>
        ))}
      </Box>

      {(error || fileAvailable?.length === 0) && (
        <Typography color="error" sx={{ fontSize: 12, textAlign: 'left' }}>
          {error || 'Please upload at least one file.'}
        </Typography>
      )}
    </Fragment>
  );
}

export default UploadFile;
