import { IconButton, Grid, Box, Button, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import InputField from "components/Input";
import DatePicker from "components/DatePicker";
import SelectField from "components/Select";
import { showErrorToast, showPromiseToast } from "components/NewToaster";
import CustomerServices from "services/Customer";
import { useNavigate } from "react-router-dom";

const CreateCreditNote = () => {
  const { register, setValue, formState: { errors }, handleSubmit } = useForm();
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [date, setDate] = useState(null);
  const navigate = useNavigate()
  // *For Customer Booking
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const getReceptionDetail = (isSearchClicked) => {
    console.log("Reception detail clicked:", isSearchClicked);
  };
  const onSubmit = async (formData) => {
    console.log(formData);

    try {
      let obj = {
        type: "credit_note",  //credit_note or debit_note
        note_for: "refund",
        customer_id: selectedCustomer?.id, //Customer id in case of Credit Note
        vendor_id: null, // vendor ID in case of Debit NOte
        related_invoice_id: formData?.originalInvoiceNumber,
        date: date,
        reason: formData?.notes,
        amount: formData?.totalCreditAmount,
        tax_amount: formData?.Vat,
        total_amount: formData?.totalAmount
      }

      const promise = CustomerServices.CreateNote(obj);

      showPromiseToast(
        promise,
        'Saving...',
        'Added Successfully',
        'Something Went Wrong'
      );
      const response = await promise;
      if (response?.responseCode === 200) {
        navigate("/credit-note-list");
      }


    } catch (error) {
      showErrorToast(error);
    }

  };
  // *For Get Customer Queue
  const getCustomerQueue = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
      };

      const { data } = await CustomerServices.getCustomerQueue(params);
      setCustomers(data?.rows);
    } catch (error) {
      showErrorToast(error);
    }
  };
  const getTokenNumber = async () => {
    try {
      let params = {
        page: 1,
        limit: 1000,
        type: 'credit_note'
      };

      const { data } = await CustomerServices.getCreditDebitToken(params);
      console.log(data);
      setValue('creditNoteNumber', data?.voucherNumber)

    } catch (error) {
      showErrorToast(error);
    }
  };
  useEffect(() => {
    getTokenNumber()
    getCustomerQueue();
  }, []);

  return (
    <Box p={3} component={'form'} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Create Credit Note
      </Typography>

      <Grid container spacing={2}>
        {/* Credit Note Information */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <InputField
                label="Credit Note #"
                size="small"
                disabled
                placeholder="Credit Note Number"
                register={register("creditNoteNumber", { required: false })}

              />
            </Grid>

            <Grid item xs={6}>
              <DatePicker
                label="Credit Note Date :*"
                value={date}
                size="small"
                register={register("creditNoteDate", { required: "Credit Note Date is required" })}
                error={errors?.creditNoteDate?.message}
                onChange={(date) => {
                  setValue("creditNoteDate", date);
                  setDate(new Date(date));
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <InputField
                label="Reference Invoice #"
                size="small"
                disabled={fieldsDisabled}
                placeholder="Reference Invoice Number"
                register={register("originalInvoiceNumber", { required: "Original Invoice Number is required" })}
                error={!!errors?.originalInvoiceNumber}
                helperText={errors?.originalInvoiceNumber?.message}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <SelectField
                size="small"
                label="Select Customer"
                options={customers}
                selected={selectedCustomer}
                onSelect={(value) => {
                  setSelectedCustomer(value)
                  setValue('email', value?.email)
                  setValue('name', value?.name)
                  setValue('phone', value?.phone)
                }}
                register={register("customer", { required: "Customer is required" })}
                error={errors?.customer?.message}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InputField
                label="Name"
                size="small"
                disabled
                placeholder="Name"
                register={register("name", { required: false })}

              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InputField
                label="Email"
                size="small"
                disabled
                placeholder="Email"
                register={register("email", { required: false })}

              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InputField
                label="Phone"
                size="small"
                disabled
                placeholder="Phone"
                register={register("phone", { required: false })}

              />
            </Grid>
          </Grid>
        </Grid>

        {/* Credit Amount */}
        <Grid item xs={12} md={2}>
          <InputField
            label="Total Credit Amount"
            size="small"
            type={'number'}
            step={'any'}
            disabled={fieldsDisabled}
            placeholder="Total Credit Amount"
            register={register("totalCreditAmount", {
              required: "Total Credit Amount is required",
              onChange: (e) => {
                // custom onChange logic here
                const value = parseFloat(e.target.value) || 0;
                setValue("Vat", (value * 0.05).toFixed(2));
                let total = parseFloat(value * 0.05) + parseFloat(value)
                console.log(total);

                setValue("totalAmount", total);
              },
            })}
            error={!!errors?.totalCreditAmount}
            helperText={errors?.totalCreditAmount?.message}
          />

        </Grid>

        <Grid item xs={12} md={2}>
          <InputField
            label="Vat"
            size="small"
            disabled
            placeholder="Vat"
            register={register("Vat", { required: false })}

          />
        </Grid>

        <Grid item xs={12} md={2}>
          <InputField
            label="Total Amount"
            size="small"
            disabled
            placeholder="Total Amount"
            register={register("totalAmount", { required: false })}

          />
        </Grid>

        {/* Credit Note Details */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputField
                label="Notes"
                size="small"
                disabled={fieldsDisabled}
                placeholder="Additional notes"
                register={register("notes", { required: false })}
                multiline
                rows={4}

              />
            </Grid>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            type="submit"

            variant="contained"
            sx={{
              textTransform: "capitalize",
              backgroundColor: "#bd9b4a",
              ":hover": {
                backgroundColor: "rgb(189 155 74)",
              },
            }}
          >
            Create
          </Button>
        </Grid>
      </Grid>
    </Box>

  );
};

export default CreateCreditNote;
