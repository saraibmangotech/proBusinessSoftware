import { useEffect, useState } from "react";
import { Fragment } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Colors from "assets/Style/Colors";
import { Images } from "assets";
import styled from "@emotion/styled";
import DeleteIcon from '@mui/icons-material/Delete';
import $ from 'jquery'

const useStyle = makeStyles({
    root: {
        borderRadius: 2,
        textAlign: 'center',
        px: 2,
        width: '220px',
        height: '120px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

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

function UploadFileSingle({ inputRef, error, accept, register, multiple, style, custom, Memo, file, disabled, onFileChange,className }) {
    const classes = useStyle();
    const [uploadedFile, setUploadedFile] = useState(file);

    let name = uploadedFile?.split('_').pop();
    let extension = uploadedFile?.split('.').pop();

    const handleDelete = () => {
        console.log(inputRef,'inputRef');
        const fileInputs = document.getElementsByClassName('validationClass');

        // Loop through all inputs and clear their values
        for (let i = 0; i < fileInputs.length; i++) {
            fileInputs[i].value = '';  // Clear the file input
        }


        if (inputRef && inputRef.current) {
            inputRef.current.value = '';  // Clear the file input value
        }


        setUploadedFile(null);
        if (onFileChange) {
            onFileChange(null);  // Notify parent of file deletion
        }
    };

    useEffect(() => {
        console.log(file,'asdasdasasdasdasd');
        
        setUploadedFile(file);
    }, [file]);

    useEffect(() => {
        $('.disbaledClass').prop('disabled', disabled);

        if (disabled) {
            $('.disbaledClass').css('background-color', 'gray');
        } else {
            $('.disbaledClass').css('background-color', '');
        }
    }, [disabled]);

    return (
        <Fragment>
            <Box style={style} className={classes.root}>
                <Input
                    ref={inputRef}
                    type='file'
                    className={className}
                    accept={accept}
                    error={error}
                    {...register}
                    style={{ width: '250px' }}
                />
                {Memo && (
                    <Box sx={{ fontSize: '15px' }}>
                        <Box sx={{ textAlign: 'left' }}>
                            <Box component={'img'} src={Images?.uploadDoc} width={'50px'}></Box>
                        </Box>
                        <Typography
                            component={'h5'}
                            variant="caption"
                            sx={{ color: Colors.black, mt: 0.2, textAlign: 'center', fontSize: '15px', width: '223px' }}
                        >
                            <span style={{ color: Colors.blue }}>Click to Upload</span> Or drag & drop
                        </Typography>
                        <Typography
                            component={'h5'}
                            variant="caption"
                            sx={{ color: Colors.black, mt: 0.2, textAlign: 'left', fontSize: '15px' }}
                        >
                            (Max. File size: 10 MB)
                        </Typography>
                    </Box>
                )}
            </Box>
            {uploadedFile && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '2px', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                component={'div'}
                                sx={{ position: 'absolute', top: -10, right: -10, cursor: 'pointer' }}
                                onClick={handleDelete}
                            >
                                <IconButton>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                            <Box
                                component={'img'}
                                src={(extension === 'png' || extension === 'jpg' || extension === 'jpeg') ? Images.uploadImage :
                                    extension === 'pdf' ? Images.uploadPDF :
                                        extension === 'xls' ? Images.uploadXls :
                                            Images.docIcon}
                                width={'50px'} />
                            <p onClick={()=>{
                 window.open(process.env.REACT_APP_IMAGE_BASE_URL + file, '_blank')}} style={{ color: 'blue', width: "80px",cursor:"pointer" }}>{name}</p>
                        </Box>
                    </Box>
                </Box>
            )}
            {error && (
                <Typography color="error" sx={{ fontSize: 12, textAlign: 'left' }}>
                    {error}
                </Typography>
            )}
        </Fragment>
    );
}

export default UploadFileSingle;



