import React from "react";
import { Modal, Box } from "@mui/material";
import { Viewer } from '@react-pdf-viewer/core';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const DocViewerModal = ({ isOpen, onClose, documents }) => {
  const baseUrl  = process.env.REACT_APP_BASE_URL
  console.log(baseUrl )
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{width:'35%',margin:'0 auto'}}
      aria-labelledby="document-viewer-title"
      aria-describedby="document-viewer-description"
    >

<div style={{width:'100%',backgroundColor:'white',display :"flex" ,justifyContent:'center'}}>
 <iframe src={process.env.REACT_APP_BASE_URL +'/media/users/temp/1722345268_Invoice.pdf'} width={"600px"} height={"500px"} />
 </div>

    </Modal>
  );
};

export default DocViewerModal;