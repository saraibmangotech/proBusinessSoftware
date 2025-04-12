import React, { Fragment, useEffect, useState } from 'react';
import { Avatar, Box, CircularProgress, Dialog, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, tableCellClasses } from '@mui/material';
import styled from '@emotion/styled';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, EyeIcon, FontFamily, PendingIcon, } from 'assets';
import Colors from 'assets/Style/Colors';
import VehicleBookingServices from 'services/VehicleBooking';
import { ErrorToaster, SuccessToaster } from 'components/Toaster';
import { CircleLoading } from 'components/Loaders';
import { CancelOutlined, Edit } from '@mui/icons-material';
import Pagination from 'components/Pagination';
import { PrimaryButton } from 'components/Buttons';
import InputField from 'components/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import DatePicker from 'components/DatePicker';
import { Debounce } from 'utils';
import VehiclePaymentServices from 'services/VehiclePayment';
import GatePassServices from 'services/GatePass';
import VccServices from 'services/Vcc';
import SimpleDialog from 'components/Dialog/SimpleDialog';
import VccPurpose from 'data/Vcc_Purpose';
import SelectField from 'components/Select';

// *For Table Style
const Row = styled(TableRow)(({ theme }) => ({
  border: 0,
}));

const Cell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    border: 0,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    background: Colors.primary,
    color: Colors.white
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    fontFamily: FontFamily.NunitoRegular,
    textAlign: 'center',
    textWrap: 'nowrap',
    padding: '5px !important',

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
      height: '24px'
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

const useStyles = makeStyles({
  loaderWrap: {
    display: 'flex',
    height: 100,
    '& svg': {
      width: '40px !important',
      height: '40px !important'
    }
  }
})

function IssueMobaya() {

  const navigate = useNavigate();
  const classes = useStyles();

  const tableHead = ['Mobaya Reference', 'Mobaya Issued Date', 'Customer Name', 'Email', 'LOT', 'VIN', 'Deposit Slip', 'Make', 'Model', 'Color', 'VCC Declaration Number', 'VCC Declaration Date', 'VCC Declaration Expiry Date', 'Expiry Date', 'Action']

  const { register, handleSubmit } = useForm();
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 }, setValue: setValue2 } = useForm();
  const { register: register3, handleSubmit: handleSubmit3, formState: { errors: errors3 }, setValue: setValue3 } = useForm();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedVccPurpose, setSelectedVccPurpose] = useState(null);

  const [tableData, setTableData] = useState()

  const [purposeDialog, setPurposeDialog] = useState(false);

  const [vccId, setVccId] = useState();
  const [vehicleId, setvehicleId] = useState()



  // *For Mobaya List
  const [mobayaList, setMobayaList] = useState();

  // *For Mobaya Issue Date
  const [mobayaIssueDate, setMobayaIssueDate] = useState();

  // *For Tooltip
  const [copied, setCopied] = useState(false);

  // *For Handle Date
  const handleMobayaIssueDate = (newDate) => {
    console.log(newDate);
    try {
      // eslint-disable-next-line eqeqeq
      if (newDate == 'Invalid Date') {
        setMobayaIssueDate('invalid')
        return
      }
      setMobayaIssueDate(newDate)
      setValue2('mobayaIssueDate', newDate)
    } catch (error) {
      ErrorToaster(error)
    }
  }

  const handleClick2 = (item) => {
    console.log(item);
    setTableData(item)
    setSelectedVccPurpose(null)

    if (true) {


      setPurposeDialog(true);



    }

    setVccId(item?.vcc?.id);
    setvehicleId(item?.id)

  };


  // *For Get Payment History
  const getMobaya = async (formData) => {
    setLoader(true)
    try {
      const hasNonEmptyValue = Object.values(formData).some(value => value !== '');
      if (hasNonEmptyValue === false) return
      let params = {
        vin: formData?.vin,
        lot: formData?.lot,
        deposit_slip: formData?.depositSlip,
      }
      const { data } = await GatePassServices.getMobaya(params)
      if (data?.details) {
        setMobayaList([data?.details])
        console.log(data.details);
      } else {
        setMobayaList([])
      }
    } catch (error) {
      ErrorToaster(error)
    } finally {
      setLoader(false)
    }
  }

  // *For Update Purpose
  const updatePurpose = async () => {
    console.log('assa')
    try {
      let obj = {
        vcc_id: vccId,
        vcc_purpose: selectedVccPurpose?.id,
        vehicle_id: vehicleId,
        booking_id: tableData?.booking_id,
        mobaya_reference: tableData?.mobaya_reference,
        mobaya_date: tableData?.mobaya_issued_date,

      };

      const { message } = await VccServices.reverseMobaya(obj);

      SuccessToaster(message);
      setPurposeDialog(false)


    } catch (error) {
      ErrorToaster(error);
    }
  };

  // *For Issue Mobaya 
  const issueMobaya = async (formData) => {
    console.log(formData);
    console.log(mobayaList);
    setLoading(true)
    try {
      let obj = {
        vehicle_id: mobayaList[0]?.id,
        mobaya_referece: formData?.mobayaRef,
        mobaya_issued_date: mobayaIssueDate,
        customer_id: mobayaList[0]?.booking?.customer?.id,
        customer_phone: mobayaList[0]?.booking?.customer?.uae_phone,
      }
      if (mobayaList[0]?.vcc_refunded === null) {
        obj.vcc_id = mobayaList[0]?.vcc?.id
        obj.vcc_expiry = mobayaList[0]?.vcc?.vcc_expiry_date
      }
      const { message } = await GatePassServices.issueMobaya(obj)
      SuccessToaster(message)
      navigate('/mobaya-list')
    } catch (error) {
      ErrorToaster(error)
    } finally {
     
    }
  }

  const copyContent = (text) => {
    const contentToCopy = text;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  return (
    <Box sx={{ m: 4, mb: 2 }}>
      {/* ========== VCC Purpose ========== */}
      <SimpleDialog
        open={purposeDialog}
        onClose={() => setPurposeDialog(false)}
        title={"Select Purpose"}
      >
        <Box component="form" onSubmit={handleSubmit3(updatePurpose)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <SelectField
                label={'Select VCC Purpose'}
                options={VccPurpose.filter(item => item?.name != 'Local-UAE')}
                selected={selectedVccPurpose}
                onSelect={(value) => setSelectedVccPurpose(value)}
                error={errors3?.vccPurpose?.message}
                register={register3("vccPurpose", {
                  required: 'Please select vcc purpose.',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={12} sx={{ mt: 2, textAlign: "right" }}>
              <PrimaryButton title="Reverse" type="submit" />
            </Grid>
          </Grid>
        </Box>
      </SimpleDialog>
      <Typography variant="h5" sx={{ color: Colors.charcoalGrey, fontFamily: FontFamily.NunitoRegular, mb: 4 }}>
        Vehicle Sales Certificates
      </Typography>

      {/* Filters */}
      <Box sx={{ boxShadow: " 0px 3px 10px 0px #00000040", p: 3, borderRadius: '15px' }}>
        <Box component={'form'} onSubmit={handleSubmit(getMobaya)}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={3}>
              <InputField
                size={'small'}
                label={'VIN'}
                placeholder={'VIN'}
                register={register('vin')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <InputField
                size={'small'}
                label={'LOT'}
                placeholder={'LOT'}
                register={register('lot')}
              />
            </Grid>

            <Grid item xs={12} sm={3} sx={{ mt: 1 }}>
              <PrimaryButton
                title="Search"
                type='submit'
                loading={loader}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ========== Table ========== */}
        {mobayaList &&
          <Box component={'form'} onSubmit={handleSubmit2(issueMobaya)}>
            <TableContainer component={Paper} sx={{ boxShadow: '0px 8px 18px 0px #9B9B9B1A', borderRadius: 2, maxHeight: 'calc(100vh - 330px)' }}>
              <Table stickyHeader sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    {tableHead.map((item, index) => (
                      <Cell key={index}>{item}</Cell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mobayaList?.length > 0 ? (
                    <Fragment>
                      {mobayaList.map((item, index) => (
                        <Row key={index} sx={{ bgcolor: index % 2 !== 0 && '#EEFBEE' }}>
                          <Cell>
                            {item.mobaya_reference ? (
                              item.mobaya_reference
                            ) : (
                              <InputField
                                size={'small'}
                                placeholder={'Mobaya Reference'}
                                style={{ m: 0 }}
                                error={errors2?.mobayaRef?.message}
                                register={register2("mobayaRef", {
                                  required: ' '
                                })}
                              />
                            )}
                          </Cell>
                          <Cell>
                            {item.mobaya_issued_date ? (
                              moment(item.mobaya_issued_date).format('MM-DD-YYYY')
                            ) : (
                              <DatePicker
                                size={'small'}
                                value={mobayaIssueDate}
                                disablePast={true}
                                error={errors2?.mobayaIssueDate?.message}
                                register={register2("mobayaIssueDate", {
                                  required: ' ',
                                })}
                                onChange={(date) => handleMobayaIssueDate(date)}
                              />
                            )}
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.customer?.name ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.booking?.customer?.name?.length > 12
                                  ? item?.booking?.customer?.name?.slice(0, 8) + "..." : item?.booking?.customer?.name
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.customer?.email ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.booking?.customer?.email?.length > 12
                                  ? item?.booking?.customer?.email?.slice(0, 8) + "..." : item?.booking?.customer?.email
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.lot_number ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.booking?.lot_number?.length > 12
                                  ? item?.booking?.lot_number?.slice(0, 8) + "..." : item?.booking?.lot_number
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.vin ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.booking?.vin?.length > 12
                                  ? item?.booking?.vin?.slice(0, 8) + "..." : item?.booking?.vin
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            {item?.vcc?.deposit?.id ?? '-'}
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.veh_make?.name ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.booking?.veh_make?.name?.length > 12
                                  ? item?.booking?.veh_make?.name?.slice(0, 8) + "..." : item?.booking?.veh_make?.name
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.booking?.veh_model?.name ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.booking?.veh_model?.name?.length > 12
                                  ? item?.booking?.veh_model?.name?.slice(0, 8) + "..." : item?.booking?.veh_model?.name
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            {item?.booking?.color ?? '-'}
                          </Cell>
                          <Cell>
                            <Tooltip
                              title={item?.vcc?.vcc_declaration ?? "-"}
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [10, -2],
                                      },
                                    },
                                  ],
                                },
                              }}
                            >
                              {
                                item?.vcc?.vcc_declaration?.length > 12
                                  ? item?.vcc?.vcc_declaration?.slice(0, 8) + "..." : item?.vcc?.vcc_declaration
                              }
                            </Tooltip>
                          </Cell>
                          <Cell>
                            {item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_date).format('MM-DD-YYYY') : '-'}
                          </Cell>
                          <Cell>
                            {item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-'}
                          </Cell>
                          <Cell>
                            {item?.vcc?.vcc_date ? moment(item?.vcc?.vcc_expiry_date).format('MM-DD-YYYY') : '-'}
                          </Cell>
                          <Cell>
                            <Box onClick={() => handleClick2(item)}>
                              <IconButton sx={{ bgcolor: Colors.blackShade, '&:hover': { bgcolor: Colors.blackShade } }}>
                                <Edit sx={{ color: Colors.white, height: '16px !important' }} />
                              </IconButton>
                              <Typography variant="body2">
                                Reverse
                              </Typography>
                            </Box>
                          </Cell>
                        </Row>
                      ))}
                    </Fragment>
                  ) : (
                    <Row>
                      <Cell colSpan={tableHead.length + 1} align="center" sx={{ fontWeight: 600 }}>
                        No Data Found
                      </Cell>
                    </Row>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {mobayaList[0]?.mobaya_reference === null &&
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <PrimaryButton
                  disabled={!mobayaList[0]?.vcc?.vat_charges_aed ? true : false}
                  title="Submit"
                  type='submit'
                  loading={loading}
                />
              </Box>
            }
          </Box>
        }

        {loader && <CircleLoading />}
      </Box>
    </Box>
  );
}

export default IssueMobaya;