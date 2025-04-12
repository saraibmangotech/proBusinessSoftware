import { CancelOutlined } from '@mui/icons-material';
import { Box, Dialog, Grid, IconButton, Typography } from '@mui/material';
import { FontFamily } from 'assets';
import Colors from 'assets/Style/Colors';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { ErrorToaster } from 'components/Toaster';
import { useForm } from 'react-hook-form';

function AddShippingVendor({ open, onClose, onSubmit, loading }) {

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const submitData = (formData) => {
    try {
      let obj = {
        name: formData?.name
      }
      onSubmit(obj)
      reset()
    } catch (error) {
      ErrorToaster(error)
    }
  }

  return (
    <Dialog
      open={open}
      sx={{ '& .MuiDialog-paper': { width: '40%', height: "auto", borderRadius: 2, py: { xs: 2, md: 4 }, px: { xs: 3, md: 6 } } }}
    >
      <IconButton onClick={() => { onClose(); reset() }} sx={{ position: 'absolute', right: 13, top: 13 }}>
        <CancelOutlined />
      </IconButton>
      <Typography variant="h5" sx={{ textAlign: 'center', color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mt: 1, mb: 2.5 }}>
        Add Shipping Vendor
      </Typography>
      <Box component="form" onSubmit={handleSubmit(submitData)} >
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <InputField
              size={'small'}
              label={'Shipping Vendor'}
              placeholder={'Shipping Vendor'}
              error={errors?.name?.message}
              register={register("name", {
                required: 'Please enter shipping vendor.',
              })}
            />
          </Grid>
          <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: 'right' }}>
            <PrimaryButton
              title="Submit"
              type='submit'
              loading={loading}
            />
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  )
}

export default AddShippingVendor