import React, { useState } from 'react';
import { Stack, Pagination } from '@mui/material';

const ItemsPerPage = 15; // Number of items to display per page

const CustomPagination = ({ ratesData }) => {

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the start and end indices based on the current page and items per page
  const startIndex = (currentPage - 1) * ItemsPerPage;
  const endIndex = startIndex + ItemsPerPage;

  // Slice the array to get the items for the current page
  const currentItems = ratesData?.slice(startIndex, endIndex);


  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {/* Render your items here using the 'currentItems' array */}

      <Stack spacing={2}>
        {/* Render the Pagination component */}
        <Pagination
          count={Math.ceil(ratesData?.length / ItemsPerPage)} // Calculate the total number of pages
          page={currentPage}
          variant="outlined"
          shape="rounded"
          onChange={handlePageChange}
        />
      </Stack>
    </div>
  );
};

export default CustomPagination;
