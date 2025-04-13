import React, { Fragment, useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, tableCellClasses, IconButton, CircularProgress, Chip, Grid, InputLabel,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Tooltip,
  Checkbox,
  InputAdornment,
  styled,
} from '@mui/material';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontFamily, Images } from "assets";
import Colors from "assets/Style/Colors";
import InputField from "components/Input";
import { ErrorToaster, SuccessToaster } from "components/Toaster";
import CustomerServices from "services/Customer";
import SelectField from "components/Select";
import SystemServices from "services/System";
import { PrimaryButton } from "components/Buttons";
import InputPhone from "components/InputPhone";
import DatePicker from "components/DatePicker";
import UploadedFile from "components/UploadedFile";
import ConfirmationDialog from "components/Dialog/ConfirmationDialog";
import AuthServices from "services/Auth";
import UserServices from "services/User";
import { getValue } from "@testing-library/user-event/dist/utils";
import { showErrorToast } from "components/NewToaster";
import CommissionServices from "services/Commission";
import { formatPermissionData, handleDownload } from "utils";
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { addPermission } from "redux/slices/navigationDataSlice";
import { useDispatch } from "react-redux";
import moment from "moment";
import { CircleLoading } from "components/Loaders";
import ExportServices from "services/Export";

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,

}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: 'Public Sans',
    border: '1px solid #EEEEEE',
    padding: '15px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    color: '#434343',
    paddingRight: '50px',
    background: 'transparent',
    fontWeight: 'bold'

  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: 'Public Sans',

    textWrap: 'nowrap',
    padding: '5px !important',
    paddingLeft: '15px !important',
    '.MuiBox-root': {
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      '.MuiBox-root': {
        cursor: 'pointer'
      }
    },
    'svg': {
      width: 'auto',
      height: '24px',
    },
    '.MuiTypography-root': {
      textTransform: 'capitalize',
      fontFamily: FontFamily.NunitoRegular,
      textWrap: 'nowrap',
    },
    '.MuiButtonBase-root': {
      padding: '8px',
      width: '28px',
      height: '28px',
    }
  },
}));


function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { register, setValue, getValues, control, handleSubmit } = useForm();
  const tableHead = [{ name: 'SR No.', key: '' }, { name: 'Customer ', key: 'name' }, { name: 'Registration Date', key: 'visa_eligibility' }, { name: 'Deposit Amount', key: 'deposit_total' }, { name: 'Action', key: 'action' }]
  // *For Dialog Box
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [confirmationDialog2, setConfirmationDialog2] = useState(false);

  // *For Customer Detail
  const [agentDetail, setAgentDetail] = useState();
  const [permissions, setPermissions] = useState()
  const [docs, setDocs] = useState([])
  const [customerQueue, setCustomerQueue] = useState([])

  // *For Get Customer Detail
  const getAgentDetail = async () => {
    try {
      let params = { agent_id: id };
      const { data } = await CommissionServices.getAgentDetail(params);
      console.log(data);
      setAgentDetail(data?.details);
      const processedDocuments = data?.details?.documents?.map((doc) => ({
        ...doc,
        paths: doc.path ? doc.path.split(",") : [], // Split the path by commas
      })) || [];
      console.log(processedDocuments);

      setDocs(processedDocuments);


      setPermissions(formatPermissionData(data?.permissions))
      console.log(formatPermissionData(data?.permissions));
      console.log(data?.details?.customers);
      
      setCustomerQueue(data?.details?.customers)
      setPermissions(formatPermissionData(data?.permissions))
      data?.permissions.forEach(e => {
        if (e?.route && e?.identifier && e?.permitted) {
          dispatch(addPermission(e?.route));
        }
      })

    } catch (error) {
      showErrorToast(error);
    }
  };


  const downloadAll = async () => {
    try {

      // const data = await ExportServices.getAllDoc(
      //   agentDetail?.documents[0]?.reference,
      //   agentDetail?.documents[0]?.reference_id
      // );
         window.open(process.env.REACT_APP_BASE_URL +`/system/downloadZip?reference=${agentDetail?.documents[0]?.reference}&reference_id=${agentDetail?.documents[0]?.reference_id}`  , '_blank');
      
    } catch (error) {
      console.error("Error fetching the document:", error);
    }
  };


  // *For Reset User Password

  useEffect(() => {
    if (id) {
      getAgentDetail();
    }
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-end' }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 'bold' }} >AGENT DETAIL</Typography>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          {permissions?.edit_details && <PrimaryButton
           bgcolor={'#bd9b4a'}
            title="Edit"
            onClick={() => navigate(`/update-agent/${id}`)}


          />}

        </Box>
      </Box>
      <Grid container sx={{ mt: 5, border: '1px solid #B6B6B6', borderRadius: "8px", p: '15px', justifyContent: 'space-between' }} >
        <Grid item xs={6} mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: '14px' }} variant="body1">Agent Name:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{agentDetail?.name}</Typography>
            </Grid>


          </Grid>
        </Grid>
        <Grid item xs={6} mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: '14px' }} variant="body1">Agent Email:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{agentDetail?.userDetail?.email}</Typography>
            </Grid>


          </Grid>
        </Grid>
        <Grid item xs={6} mt={2}   >
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography sx={{ fontSize: '14px' }} variant="body1">Commission on Visa:</Typography>
            </Grid>
            <Grid item xs={7}>
              <Typography sx={{ fontSize: '14px', color: '#0F2772' }} variant="body1">{agentDetail?.commission_visa} %</Typography>
            </Grid>


          </Grid>
        </Grid>
        <Grid item xs={6} mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography sx={{ fontSize: '14px' }} variant="body1">Monthly Commission :</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography sx={{ fontSize: '14px', color: '#0F2772' ,textAlign:'left'}} variant="body1">{agentDetail?.commission_monthly} %</Typography>
            </Grid>


          </Grid>
        </Grid>
      </Grid>
      <Box p={2}>

        <Grid container spacing={4} p={3}>




        <Box sx={{display:'flex' ,justifyContent:"space-between",alignItems:"center",width:"100%"}}>
                 <Typography mb={2} mt={2} sx={{ color: '#03091A', fontWeight: 'bold' }} variant="h6">Documents :</Typography>
                 <Box sx={{background:Colors.DarkBlue,color:Colors.white,padding:"8px 20px",borderRadius:"10px",cursor:"pointer"}} onClick={downloadAll} > Download All</Box>
                    </Box>
          <Grid container spacing={2} mt={2}>
            {docs
              ?.sort((a, b) => (a.path ? 0 : 1) - (b.path ? 0 : 1)) // Sort documents with empty path last
              .map((doc, index) => (
                <>

                  <Grid
                    item
                    md={6}
                    lg={6}
                        sx={{ cursor: 'pointer',paddingTop:"35px !important" }}
    
                    component={'div'}

                  // Use index2 instead of index to avoid duplicate keys
                  >
                    {/* Conditionally render name only for the first doc */}
                    {(
                      <>
                      <Box sx={{ fontSize: '15px', fontWeight: 'bold' }}>{doc?.name}</Box>
                      {doc.paths.length > 0 && doc?.expiry_date != null &&(
               
               <Box sx={{mt:1,fontSize:"13px",color:Colors.gray}}><span style={{fontWeight:"bold"}}>Expiry Date : </span><span>{moment(doc?.expiry_date).format("YYYY-MM-DD")}</span></Box>
             )}
                      </>
                    )}
                    <Box sx={{ display: 'flex', gap: '10px', mt: '15px', flexWrap: 'wrap' }} >
                      {doc?.paths.length > 0 ? doc?.paths.map((item, index2) => {
                        return (
                          <>
                            <Box component={'div'} sx={{ width: '30%' }} onClick={() => {
                              
                              if(item.split('_').pop().includes('doc') || item.split('_').pop().includes('xls') ){

                                handleDownload(item, item.split('_').pop());
                              }
                              else{
                                
                                window.open(process.env.REACT_APP_IMAGE_BASE_URL+item, '_blank');
                              }
                            }}>
                              <Box key={index2}>
                                {item ? (
                                  <Box component={'img'} src={Images.docIcon} width={'35px'} />
                                ) : (
                                  <DoDisturbIcon sx={{ fontSize: '35px', color: 'gray' }} />
                                )}
                              </Box>
                              <Link rel="noopener noreferrer">
                                {item.split('_').pop()}
                              </Link>
                            </Box>
                          </>
                        );
                      }) :
                        <DoDisturbIcon sx={{ fontSize: '35px', color: 'gray' }} />}

                    </Box>

                  </Grid>
                </>
              ))}


          </Grid>
          {(
              customerQueue?.length > 0 && (
                <Fragment>
                 

                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: 'calc(100vh - 330px)', mt: 5, backgroundColor: 'transparent', boxShadow: 'none !important', borderRadius: '0px !important'

                      }}

                    >
                      <Table stickyHeader sx={{ minWidth: 500, position: 'relative' }}>
                        <TableHead>

                          <Row>
                            {tableHead?.map((cell, index) => (
                              <Cell style={{ textAlign: cell?.name == 'SR No.' ? 'center' : 'left', paddingRight: cell?.name == 'SR No.' ? '15px' : '50px' }} className="pdf-table"
                                key={index}

                              >
                                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                  {cell?.name}
                                </Box>
                              </Cell>
                            ))}
                          </Row>
                        </TableHead>
                        { <TableBody>
                          {customerQueue?.length > 0 &&  [...customerQueue]?.sort((a, b) => a?.id - b?.id) ?.map((item, index) => {

                            return (
                              <Row
                                key={index}
                                sx={{
                                  border: '1px solid #EEEEEE !important',
                                }}
                              >

                                <Cell style={{ textAlign: 'center' }} className="pdf-table">
                                  {item?.id}
                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {item?.name}
                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {moment(item?.created_at).format('MM-DD-YYYY')}
                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  {parseFloat(item?.deposit_total).toFixed(2)}
                                </Cell>
                                <Cell style={{ textAlign: 'left' }} className="pdf-table">
                                  <Box>
                                  <Box component={'img'} sx={{cursor:"pointer"}} onClick={()=> {navigate(`/customer-detail/${item?.id}`);   localStorage.setItem("currentUrl", '/customer-detail');}} src={Images.detailIcon} width={'35px'}></Box>
                              
                                  </Box>
                                </Cell>



                              </Row>

                            );
                          })}

                        </TableBody>}
                      </Table>
                    </TableContainer>
              


                </Fragment>
              )
            )}

        </Grid>
      </Box>
    </Box>
  );
}

export default AgentDetail;
