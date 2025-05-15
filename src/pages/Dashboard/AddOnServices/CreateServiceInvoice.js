import { Box, Grid, TextField, Typography } from '@mui/material'
import Colors from 'assets/Style/Colors'
import { PrimaryButton } from 'components/Buttons'
import DatePicker from 'components/DatePicker'
import InputField from 'components/Input'
import LabelCustomInput from 'components/Input/LabelCustomInput'
import { showErrorToast, showPromiseToast } from 'components/NewToaster'
import SelectField from 'components/Select'
import { ErrorToaster } from 'components/Toaster'
import { useCallbackPrompt } from 'hooks/useCallBackPrompt'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import CustomerServices from 'services/Customer'

const CreateServiceInvoice = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, getValues, setValue, control, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false)
  // const [handleBlockedNavigation] =
  // useCallbackPrompt(true)

  // *For Filters
  const [filters, setFilters] = useState({});
  const [pageLimit, setPageLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  // *For Customer Queue
  const [customerQueue, setCustomerQueue] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [date, setDate] = useState(null)

  // *For Get Customer Queue

  const getCustomerQueue = async (page, limit, filter) => {
    // setLoader(true)
    try {
      const Page = page ? page : currentPage
      const Limit = limit ? limit : pageLimit
      const Filter = { ...filters, ...filter }
      setCurrentPage(Page)
      setPageLimit(Limit)
      setFilters(Filter)
      let params = {
        page: Page,
        limit: Limit,
      }
      params = { ...params, ...Filter }
      const { data } = await CustomerServices.getCustomerQueue(params)
      setCustomerQueue(data?.rows)

    } catch (error) {
      showErrorToast(error)
    } finally {
      // setLoader(false)
    }
  }


  const hanldeDate = (newDate) => {
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == "Invalid Date") {
        setDate("invalid");
        return;
      }
      setDate(new Date(newDate));
    } catch (error) {
      ErrorToaster(error);
    }
  };
  const CreateAddOnService = async (formData) => {
    console.log(formData);

    if (moment(date).isAfter(moment().startOf('day'))) {
      showErrorToast('Invalid Date');
    }
    else {

      try {

        let obj = {
          customer_id: selectedCustomer?.id,
          description: getValues('description'),
          service_cost: getValues('cost'),
          date: date
        };

        console.log(obj, 'obj');

        const promise = CustomerServices.CreateAddOnService(obj);

        showPromiseToast(
          promise,
          'Saving...',
          'Added Successfully',
          'Something Went Wrong'
        );

        const response = await promise;
        if (response?.responseCode === 200) {
          navigate("/service-invoice");
        }


      } catch (error) {
        console.log(error);
      }
    }

  };
  useEffect(() => {
    getCustomerQueue()
  }, [])

  return (
    <Box sx={{ p: 3 }} component={'form'} onSubmit={handleSubmit(CreateAddOnService)}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>Create Service Invoice</Typography>
        <PrimaryButton
         bgcolor={'#001f3f'}
          title="Save"
          type={'submit'}
          loading={loading}
        />


      </Box>
      <Box sx={{ p: 3, border: '1px solid #EEEEEE', borderRadius: '10px' }}>
        {/* <Box display="flex" alignItems="center" borderRadius={1} overflow="hidden" >
          <Box bgcolor="white" px={2} py={1} sx={{ border: '2px solid #f5f5f5' }}>
            <Typography variant="body1" >Date</Typography>
          </Box>
          <Box bgcolor="grey.100" px={2} py={1} sx={{ border: '2px solid #f5f5f5' }}>
            <Typography variant="body1">{moment().format('MM-DD-YYYY')}</Typography>
          </Box>
        </Box> */}
        <Grid container mt={5}>
          <Grid item xs={5} >
            <SelectField
              size={'small'}
              label={'Select Customer :'}

              options={customerQueue}
              selected={selectedCustomer}
              onSelect={(value) => {
                setSelectedCustomer(value)


              }}
              error={errors?.customer?.message}
              register={register("customer", {
                required: 'Please select customer account.',
              })}
            />
          </Grid>

        </Grid>
        <Grid container>
          <Grid item xs={5}>

            {/* <DatePicker
              label={"Date :*"}
              value={date}
              disableFuture={true}
              size={'small'}

              error={errors?.date?.message}
              register={register("date", {
                required:
                  date ? false :
                    "please enter date."

              })}
              onChange={(date) => {
                console.log(date);
                
                hanldeDate(date)
                setValue('date', date)

              }

              }
            /> */}


            <DatePicker
              label={"Date :*"}
              value={date}

              size={'small'}
              error={errors?.date?.message}
              register={register("date", {
                required:

                  "Please enter  date."

              })}
              onChange={(date) => {
                hanldeDate(date)
                setValue('date', date)


              }

              }
            /></Grid>
        </Grid>
        <Grid container mt={2}>
          <Grid item xs={5}>
            <InputField
              label={"Description :"}
              size={'small'}
              fullWidth={true}
              multiline={true}
              rows={7}
              placeholder={"Description"}
              error={errors?.description?.message}
              register={register("description", {
                required:
                  false

              })}
            />
          </Grid>
        </Grid>
        <Grid container mt={1}>
          <Grid item xs={5} >
            <LabelCustomInput label={'Service Cost :* '} StartLabel={'AED'} placeholder={'Service Cost'} error={errors?.cost?.message} register={register("cost", { required: "Enter service  cost" })} />
          </Grid>
        </Grid>
      </Box>

    </Box>
  )
}

export default CreateServiceInvoice
