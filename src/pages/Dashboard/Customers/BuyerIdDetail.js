import React, { Fragment, useEffect, useState } from 'react';
import { Box, Grid, Typography, IconButton, } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, FontFamily, PendingIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import InputField from 'components/Input';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CancelOutlined, Edit, CheckCircle } from "@mui/icons-material";
import CustomerServices from 'services/Customer';
import { PrimaryButton } from 'components/Buttons';
import UploadedFile from 'components/UploadedFile';
import FinanceStatusDialog from 'components/Dialog/FinanceStatusDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import ConfirmationDialog from 'components/Dialog/ConfirmationDialog';



function BuyerIdDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  // *For Buyer Id Detail
  const [auctionHouses, setAuctionHouses] = useState()
  const [buyerIdDetail, setBuyerIdDetail] = useState([]);
  const [mainData, setMainData] = useState([])

  const [selectedId, setselectedId] = useState()

  const [allocatedData, setAllocatedData] = useState()

  const [deleteDialog, setDeleteDialog] = useState(false)

  // *For Dialog Box
  const [financeStatusDialog, setFinanceStatusDialog] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState({});

  const [test, setTest] = useState([]);





  // *For Get Customer Detail
  const getBuyerIdDetail = async () => {
    try {
      let params = { customerID: id }
      const { data } = await CustomerServices.getBuyerIdDetail(params)
      setBuyerIdDetail(data?.details)
      setAuctionHouses(data?.details?.request?.details)
      getCustomerBuyerId(data?.details?.request?.details)

      const buyerids = await CustomerServices.getCustomerBuyerId(params)

      let newData = data?.details?.request?.details.map((item) => {
        return { auction_id: item?.auction_id, auction_name: item?.auction?.name, status: item?.allocation_status, detail_id: item?.id, allocation_status: item?.allocated?.length > 0 ? true : false }
      })


      for (let i = 0; i < buyerids.data.details.length; i++) {
        const element = buyerids.data.details[i];
        const index = newData.findIndex(obj => obj.auction_id === element.auction_house_id);

        if (index >= 0) {

          if (newData[index]["buyer_ids"]) {
            newData[index]["buyer_ids"] += ", " + element.name;
          }
          else {
            newData[index]["buyer_ids"] = element.name;
          }

        }

      }

      setMainData(newData)




    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *For Update Purpose
  const deleteId = async (status) => {

    try {
      let params = { detail_id: selectedId }

      const { message } = await CustomerServices.deleteId(params);

      SuccessToaster(message);
      window.location.reload();


    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Get Customer Buyer ID
  const getCustomerBuyerId = async (value) => {
    let test1 = []
    try {




      let params = { customerID: id }
      const { data } = await CustomerServices.getCustomerBuyerId(params)

      let shallowAuctionHouses = auctionHouses;




      const filteredData = data?.details?.filter(obj1 =>
        value?.some(obj2 => obj1?.auction_house_id === obj2?.auction_id)
      );
      filteredData?.map((item) => {
        test1?.push(item?.name)
      })

      setTest(test1)

      setAllocatedData(data?.details)


      // let oldSelectedIds = []
      // let oldSelectedObjects = []
      // data?.details.forEach((e, i) => {
      //   const values = e.buyer_ids.filter((v) => allocatedId.includes(v.id));
      //   const filteredIds = values.map((val) => val.id);
      //   oldSelectedIds = oldSelectedIds.concat(filteredIds);
      //   selectedIds[`buyerId-${i}`] = values;
      //   oldSelectedObjects = oldSelectedObjects.concat(values)

      // });
    } catch (error) {
      ErrorToaster(error)
    }
  }

  // *Update Broker
  const handleDelete = (e, item) => {
    e.preventDefault();
    setselectedId(item?.detail_id)


  }

  // *For Update Finance Status
  const updateFinanceStatus = async (status) => {
    try {
      let obj = {
        request_id: buyerIdDetail?.request?.id,
        status: status
      }
      const { message } = await CustomerServices.verifyFinance(obj)
      SuccessToaster(message)
      getBuyerIdDetail()
      setFinanceStatusDialog(false)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  useEffect(() => {
    if (id) {
      getBuyerIdDetail()
      // getCustomerBuyerId()
    }
  }, [id]);

  return (
    <Box sx={{ m: 4, p: 5, bgcolor: Colors.white, borderRadius: 3, boxShadow: '0px 8px 18px 0px #9B9B9B1A' }}>

      {/* ========== Finance Status Dialog ========== */}
      <FinanceStatusDialog open={financeStatusDialog} onClose={() => setFinanceStatusDialog(false)} status={buyerIdDetail?.request?.finance_status} updateStatus={(e) => updateFinanceStatus(e)} />

      <ConfirmationDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        message={`Are you sure ?`}
        action={() => deleteId()}
      />
      {/* <SimpleDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}

      >
        <Box component="form" >
          <Grid container spacing={2}>
          <IconButton onClick={() => setDeleteDialog(false)} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
          Are you Sure
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-evenly', '.MuiSvgIcon-root': { fontSize: '32px !important' } }}>
          <PrimaryButton
            title={"Rejected"}
            onClick={() => deleteId(false)}
            startIcon={
              <CheckCircle sx={{ color: Colors.white }} />
            }
            style={{ backgroundColor: true === true ? Colors.iron : Colors.danger }}
          />
          <PrimaryButton
            title={"Approve"}
            onClick={() => deleteId(true)}
            startIcon={
              <CheckCircle sx={{ color: Colors.white }} />
            }
            style={{ backgroundColor: false === false ? Colors.iron : Colors.primary }}
          />
        </Box>
      </Box>
           
          </Grid>
        </Box>
      </SimpleDialog> */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
            Buyer Id Detail
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
          <PrimaryButton
            title={"Request Buyer Id"}
            onClick={() => navigate(`/request-buyer-id/${id}`, { state: { customerId: id } })}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
            Finance Status
          </Typography>
          <Box onClick={() => setFinanceStatusDialog(false)} sx={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer' }}>
            {buyerIdDetail?.request?.finance_status ? <CheckIcon /> : <PendingIcon />}
            <Typography variant="body1">
              {buyerIdDetail?.request?.finance_status ? 'Verified' : 'Pending'}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
            Allocation Status
          </Typography>
          <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center', 'path': { fill: buyerIdDetail?.request?.allocation_status === 'allocated' && Colors.bluishCyan } }}>
            {buyerIdDetail?.request?.allocation_status === 'pending' ? <PendingIcon /> : <CheckIcon />}
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {buyerIdDetail?.request?.allocation_status}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={2.5}>
          <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
            Deposit Medium
          </Typography>
          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
            {buyerIdDetail?.request?.deposit_medium}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2.5}>
          <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
            Deposit Amount
          </Typography>
          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
            {buyerIdDetail?.request?.deposit_amount} AED
          </Typography>
        </Grid>
        {buyerIdDetail?.request?.deposit_medium === 'bank' &&
          <Grid item xs={12} sm={3.5}>
            <Typography variant="subtitle1" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 2 }}>
              Deposit Slip
            </Typography>
            <UploadedFile data={{ name: 'Deposit Slip', file: buyerIdDetail?.request?.deposit_slip }} />
          </Grid>
        }
        <Grid container spacing={2} item xs={12} sm={12} sx={{ my: 2 }}>
          {mainData?.map((item, index) => (

            <Fragment>
              <Grid item xs={12} sm={3}>
                <InputField
                  disabled={true}
                  size={'small'}
                  value={item.auction_name}
                  label={'Auction House'}
                  placeholder={'Auction House'}
                />
              </Grid>
              <Grid item xs={12} sm={3}>

                <InputField
                  disabled={true}
                  size={'small'}
                  value={item?.buyer_ids}
                  label={'Buyer ID'}
                  placeholder={'Buyer ID'}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body1" sx={{ color: '#00000099', mb: 2 }}>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center', 'path': { fill: item?.status === 'allocated' ? Colors.bluishCyan : item?.status === 'deallocated' ? Colors.danger : '' } }}>
                  {item?.status === 'pending' ? <PendingIcon /> : <CheckIcon />}
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {item?.status}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body1" sx={{ color: '#00000099', mb: 2 }}>
                  Action
                </Typography>
                {mainData?.length > 1 && !item?.allocation_status && <button style={{ border: 'none', backgroundColor: 'transparent', color: 'red', cursor: "pointer" }} onClick={(e) => { handleDelete(e, item); setDeleteDialog(true) }} ><DeleteIcon /></button>}
              </Grid>
            </Fragment>
          ))}
        </Grid>
        <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
          <PrimaryButton
            title="Back"
            style={{ backgroundColor: Colors.greyShade }}
            onClick={() => navigate(-1)}
          />
        </Grid>
      </Grid>

    </Box>
  );
}

export default BuyerIdDetail;