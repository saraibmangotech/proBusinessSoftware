import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,

  tableCellClasses,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  makeStyles,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import styled from "@emotion/styled";
import moment from "moment"; // Ensure you have moment.js installed
import { FontFamily, Images } from "assets";
import SystemServices from "services/System";
import { ErrorToaster } from "components/Toaster";
import { showErrorToast } from "components/NewToaster";
import Pagination from "components/Pagination";
import { useNavigate } from "react-router-dom";


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



export default function VisaTable() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit, setPageLimit] = useState(50);
  // *For Filters
  const [filters, setFilters] = useState({});
  const [loader, setLoader] = useState(false)

  // *For Get Customer Queue
  const getNotifications = async (page, limit, filter) => {
    setLoader(true)
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
      const { data } = await SystemServices.getNotifications(params)

      setTotalCount(data?.count)
      setNotifications(data?.notifications?.rows)

    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoader(false)
    }
  }
  const tableHead = [

    { name: "Recieving Date", key: "created_at" },
    { name: "Title", key: "title" },
    { name: "Content", key: "content" },
    { name: "Actions", key: "" },
  ];

  // Dummy data for visas
  const dummyVisas = [
    {
      id: 1,
      created_at: "2024-09-01",
      customer: { name: "John Doe" },
      candidates_count: 2,
      total_visa_charges: "$999999",
      total_deposit_charges: "$500",
      processing_status: "Approved",
      payment_status: "Paid",
    },
    {
      id: 1,
      created_at: "2024-09-01",
      customer: { name: "John Doe" },
      candidates_count: 2,
      total_visa_charges: "$999999",
      total_deposit_charges: "$500",
      processing_status: "Approved",
      payment_status: "Paid",
    },
    {
      id: 1,
      created_at: "2024-09-01",
      customer: { name: "John Doe" },
      candidates_count: 2,
      total_visa_charges: "$999999",
      total_deposit_charges: "$500",
      processing_status: "Approved",
      payment_status: "Paid",
    },
    {
      id: 1,
      created_at: "2024-09-01",
      customer: { name: "John Doe" },
      candidates_count: 2,
      total_visa_charges: "$999999",
      total_deposit_charges: "$500",
      processing_status: "Approved",
      payment_status: "Paid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },
    {
      id: 2,
      created_at: "2024-09-02",
      customer: { name: "Jane Smith" },
      candidates_count: 3,
      total_visa_charges: "$1500",
      total_deposit_charges: "$750",
      processing_status: "Pending",
      payment_status: "Unpaid",
    },

  ];
  const handleLimitChange = (event) => {
    setPageSize(event.target.value);
    setCurrentPage(1);
  };
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };
  const handleNavigation = (data) => {
  console.log(data);
  if(data?.reference == 'wps'){
    navigate('/wps-list')
    localStorage.setItem("currentRoute", data?.page_name ? data?.page_name : 'Notifications')
  }
  else if(data?.reference == 'candidate_approval' || data?.reference=='visa_request'){
    navigate(`/visa-detail/${data?.reference_id}`)
    localStorage.setItem("currentRoute", data?.page_name ? data?.page_name : 'Notifications')
  }
  else if(data?.reference == 'visa_request_payment'){
    navigate(`/payments`)
    localStorage.setItem("currentRoute", data?.page_name ? data?.page_name : 'Notifications')
  }
  else if(data?.reference == 'customer'){
    navigate(`/customer-detail/${data?.reference_id}`)
    localStorage.setItem("currentRoute", data?.page_name ? data?.page_name : 'Notifications')
  }
  else if(data?.reference == 'candidate_request_rejection'){
    navigate(`/visa-detail/${data?.reference_id}`)
    localStorage.setItem("currentRoute", data?.page_name ? data?.page_name : 'Notifications')
  }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);



  const indexOfLastRow = currentPage * pageSize;

  const indexOfFirstRow = indexOfLastRow - pageSize;

  const currentVisas = dummyVisas.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    getNotifications()
  }, [])


  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Notifications
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "calc(100vh - 200px)",
            mt: 5,
            backgroundColor: "transparent",
            boxShadow: "none !important",
            borderRadius: "0px !important",
          }}
        >
          <Table stickyHeader sx={{ minWidth: 500 }}>
            <TableHead>
              <Row >
                {tableHead.map((cell, index) => (
                  <Cell
                    key={index}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                      {cell?.name}
                      {cell?.name === "Date" && (
                        <>
                          &nbsp;
                          <span style={{ height: "20px", cursor: "pointer" }}>
                            <Box component={"img"} width={"18px"}></Box>
                          </span>
                        </>
                      )}
                    </Box>
                  </Cell>
                ))}
              </Row>
            </TableHead>
            <TableBody>
              {notifications?.map((item, index) => {
                return (
                  <Row
                    key={index}
                    sx={{
                      borderBottom: "1px solid #EEEEEE !important",
                      backgroundColor: !item?.is_seen ? '#e0dcf5 !important' : 'transparent !important',
                    }}
                  >

                    <Cell style={{ textAlign: "left", width: '170px' }}>
                      <Typography sx={{ width: "150px", fontSize: "14px" }}>
                        {moment(item?.created_at).format("MM-DD-YYYY")}
                      </Typography>
                    </Cell>


                    <Cell style={{ textAlign: "left" }}>
                      {item?.title}
                    </Cell>
                    <Cell style={{ textAlign: "left" }}>
                      {item?.content}
                    </Cell>
                    <Cell style={{ textAlign: "left", width: '70px' }}>
                      <Box component={'img'} onClick={()=> {
                        handleNavigation(JSON.parse(item?.data))
                      }} sx={{ cursor: "pointer" }} src={Images.detailIcon} width={'35px'}></Box>
                    </Cell>
                  </Row>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Component */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>

     


          <Pagination
            currentPage={currentPage}
            pageSize={pageLimit}
            onPageSizeChange={(size) => getNotifications(1, size.target.value)}
            tableCount={notifications?.length}
            totalCount={totalCount}
            onPageChange={(page) => getNotifications(page, "")}
          />
        </Box>
      </Box>
    </>
  );
}
