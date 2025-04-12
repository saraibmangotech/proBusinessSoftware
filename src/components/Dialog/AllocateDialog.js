import { Fragment, useEffect, useState } from 'react';
import { CancelOutlined } from '@mui/icons-material';
import { Box, Dialog, Divider, Grid, IconButton, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import SelectField from 'components/Select';
import { ErrorToaster } from 'components/Toaster';
import CustomerServices from 'services/Customer';
import InputField from 'components/Input';
import { CircleLoading } from 'components/Loaders';

// Import statements remain unchanged...

function AllocateDialog({ open, onClose, loading, requestDetail, allocateBuyerId, deallocateBuyerId }) {
  const { register, handleSubmit } = useForm();
  const [loader, setLoader] = useState(false);

  const [requestId, setRequestId] = useState();
  const [customerId, setCustomerId] = useState();
  const [customerName, setCustomerName] = useState();
  const [customerPhone, setCustomerPhone] = useState()

  const [allocationDetail, setAllocationDetail] = useState();
  const [selectedBuyerId, setSelectedBuyerId] = useState({});
  const [allocatedBuyerId, setAllocatedBuyerId] = useState();
  const [extractedData, setExtractedData] = useState()

  //Allocated BuyerIds from the Table
  const [allocatedIds, setAllocatedIds] = useState({});
  const [allocatedObjects, setAllocatedObjects] = useState([]);


  const [allocatedData, setAllocatedData] = useState()



  const [isDisabled, setIsDisabled] = useState(true);

  const getBuyerIdByAuctionId = async () => {
    setLoader(true);
    setSelectedBuyerId({});


    try {
      const auctionIds = [];
      const allocatedId = [];
      let selectedIds = {};

      setCustomerId(requestDetail?.id);
      setCustomerName(requestDetail?.name);
      setCustomerPhone(requestDetail?.uae_phone)

      setRequestId(requestDetail?.request?.id);
      let typeId
      if (requestDetail?.customerProfile?.type.id == 1) {

        typeId = "A"
      }
      if (requestDetail?.customerProfile?.type.id == 2) {

        typeId = "B"
      }
      if (requestDetail?.customerProfile?.type.id == 3) {
        typeId = "C"
      }

      requestDetail?.request?.details.forEach((element) => {
        auctionIds.push(element.auction_id);
        for (let i = 0; i < element.allocated.length; i++) {
          const id = element.allocated[i];
          allocatedId.push(id.buyer_id);

        }
      });
      console.log(requestDetail.request.details, 'requestDetail.request.detailsrequestDetail.request.detailsrequestDetail.request.details');
      const Data = requestDetail.request.details.map(detail => ({
        auction_id: detail.auction.id,
        detail_id: detail.id,
        auction_house: detail?.auction?.name

      }));
      const allocatedData = requestDetail.request.details.map(detail => detail.allocated);





      setAllocatedData(allocatedData)
      setExtractedData(Data)
      setAllocatedBuyerId(allocatedId);

      let params = { auction_ids: auctionIds.join(','), type: typeId };



      const { data } = await CustomerServices.getBuyerIdByAuctionId(params);
      setAllocationDetail(data?.details);

      let oldSelectedIds = []
      let oldSelectedObjects = []
      data?.details.forEach((e, i) => {
        const values = e.buyer_ids.filter((v) => allocatedId.includes(v.id));
        const filteredIds = values.map((val) => val.id);
        oldSelectedIds = oldSelectedIds.concat(filteredIds);
        selectedIds[`buyerId-${i}`] = values;
        oldSelectedObjects = oldSelectedObjects.concat(values)

      });

      setAllocatedIds(oldSelectedIds)
      setSelectedBuyerId(selectedIds);
      setAllocatedObjects(oldSelectedObjects)


    } catch (error) {
      ErrorToaster(error);
    } finally {
      setLoader(false);
    }
  };

  const submitData = () => {
    try {
      const allocations = [];

      let shallowBuyerIds = { ...selectedBuyerId }


      let newAccumulativeSelectedIds = []
      console.log(shallowBuyerIds, 'saraib');
      Object.values(shallowBuyerIds).forEach((buyerArray) => {
        buyerArray.forEach((element) => {
          if (!allocatedIds.includes(element.id)) {
            allocations.push({
              auction_id: element?.auction_house_id,
              buyer_id: element?.id,
              buyer_name: element?.name,
              auction_house: element?.auction_name

            });
          }
          newAccumulativeSelectedIds.push({
            auction_id: element?.auction_house_id,
            buyer_id: element?.id,
            buyer_name: element?.name,
            auction_house: element?.auction_name
          })
        });
      });
      console.log("🚀 ~ file: AllocateDialog.js:123 ~ submitData ~ newAccumulativeSelectedIds:", newAccumulativeSelectedIds)


      const deallocations = allocatedIds
        .filter((id) => !newAccumulativeSelectedIds.some((obj) => obj.buyer_id === id))
        .map((id) => {
          const matchedObj = allocatedObjects.find((x) => x.id === id);
          console.log(matchedObj,'matchedObj');
          return {
            buyer_id: id,
            buyer_name: matchedObj ? matchedObj.name : null,
            auction_id: matchedObj ? matchedObj.auction_house_id : null // Use auction_id or null if not found
          };
        });
      console.log(deallocations, 'saraibdeallocations');

      // for (const [key, values] of Object.entries(selectedBuyerId)) {
      //   if (values && values.length > 0 && allocationDetail[key]?.auction_house_id) {
      //     values.forEach((value) => {
      //       let allocate = {
      //         auction_id: allocationDetail[key]?.auction_house_id,
      //         buyer_id: value?.id,

      //       };
      //       allocations.push(allocate);
      //     });
      //   }
      // }

      const mergeArrays = (arr1, arr2) => {
        console.log(arr1, arr2, 'sadsdasdasdasdasdasasadsda');
        const result = [];

        for (const obj1 of arr1) {
          for (const obj2 of arr2) {
            if (obj1.auction_id === obj2.auction_id) {
              // Merge objects with matching auction_id
              const mergedObj = {
                "auction_id": obj1.auction_id,
                "buyer_id": obj2.buyer_id,
                "detail_id": obj1.detail_id,
                "auction_house": obj1.auction_house,
                "buyer_name": obj2.buyer_name
              };
              result.push(mergedObj);
            }
          }
        }

        return result;
      };

      // Merge arrays
      const mergedArrayResult = mergeArrays(extractedData, allocations);
      const mergedDeallocationArrayResult = mergeArrays(extractedData, deallocations);
      console.log("🚀 ~ file: AllocateDialog.js:186 ~ submitData ~ deallocations:", deallocations)
      console.log("🚀 ~ file: AllocateDialog.js:186 ~ submitData ~ mergedDeallocationArrayResult:", mergedDeallocationArrayResult)

      // Set the merged array in the state
      console.log(mergedArrayResult, 'mergedArrayResult')
      let obj = {
        requested_allocations: mergedArrayResult,
        allocations: mergedDeallocationArrayResult,
        request_id: requestId,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone
      };

      if (mergedDeallocationArrayResult.length > 0) {

        deallocateBuyerId(obj)
      }

      if (mergedArrayResult.length > 0) {

        allocateBuyerId(obj);
      }


      handleClose();
    } catch (error) {
      console.log(error)
      ErrorToaster(error);
    }
  };

  const deallocate = (index, auctionHouseId, buyerId) => {
    try {
      let obj = {
        buyer_id: buyerId,
        auction_id: auctionHouseId,
        request_id: requestId,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone
      };
      const buyerIds = { ...selectedBuyerId };
      buyerIds[`buyerId-${index}`] = buyerIds[`buyerId-${index}`].filter((id) => id !== buyerId);
      setSelectedBuyerId(buyerIds);
      deallocateBuyerId(obj);
    } catch (error) {
      ErrorToaster(error);
    }
  };

  const handleClose = () => {
    onClose();
    setAllocatedIds([])
    setAllocatedObjects([])
  };

  useEffect(() => {
    if (requestDetail) {
      getBuyerIdByAuctionId();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { width: '40%', height: 'auto', borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
    >
      <IconButton onClick={() => handleClose()} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Box>
        <Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 1.5 }}>
          Allocate Buyer ID
        </Typography>
        <Box sx={{ mt: 4 }}>
          {loader ? (
            <CircleLoading />
          ) : (
            <Box component="form" onSubmit={handleSubmit(submitData)}>
              <Grid container spacing={0}>
                {allocationDetail?.map((item, index) => (
                  <Fragment key={index}>
                    <Grid item xs={12} sm={12}>
                      <InputField
                        disabled={true}
                        size={'small'}
                        value={item.auction_house_name}
                        label={'Auction House'}
                        placeholder={'Auction House'}
                        register={register('auctionHouse')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <Box sx={{ position: 'relative' }}>
                        {console.log(selectedBuyerId[`buyerId-${index}`], 'allocatedData[index].buyer')}
                        <SelectField
                          disabled={allocatedBuyerId.includes(selectedBuyerId[index]?.id)}
                          size={'small'}
                          label={'Buyer Id'}
                          multiple={true}
                          options={item.buyer_ids}
                          selected={selectedBuyerId[`buyerId-${index}`]}
                          onSelect={(value) => {
                            const updatedSelectedBuyerId = { ...selectedBuyerId };
                            updatedSelectedBuyerId[`buyerId-${index}`] = value;
                            setSelectedBuyerId(updatedSelectedBuyerId);
                            setIsDisabled(false);
                          }}
                          register={register(`buyerId-${index}`)}
                          isMultiSelect // Add this prop to support multi-selection
                        />
                        {allocatedBuyerId.includes(selectedBuyerId[index]?.id) && (
                          <Typography
                            variant="body2"
                            onClick={() => deallocate(index, item.auction_house_id, selectedBuyerId[index]?.id)}
                            sx={{ cursor: 'pointer', position: 'absolute', top: '5px', right: '0', color: Colors.danger, fontFamily: FontFamily.NunitoRegular }}
                          >
                            Remove
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    {allocationDetail.length !== index + 1 && (
                      <Grid item xs={12} sm={12}>
                        <Divider sx={{ my: 2.5 }} />
                      </Grid>
                    )}
                  </Fragment>
                ))}
                <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
                  <PrimaryButton disabled={isDisabled} title="Submit" type="submit" loading={loading} />
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

export default AllocateDialog;
