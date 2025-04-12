import { useEffect, useState } from "react";
import { ArrowRightAlt } from "@mui/icons-material";
import { Box, Button, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import clsx from 'clsx';
import Colors from "assets/Style/Colors";
import { PaginationButton } from "components/Buttons";
import { DOTS, UsePagination } from "hooks/UsePagination";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const useStyles = makeStyles({
  pageBtn: {
    
    minWidth: '32px !important',
    '&:hover': { background: `transparent !important`, color: `${Colors.primary} !important`,border:'1px solid #EEEE' }
  },
  pageBtnActive: {
    background: `transparent !important`,
    border:`1px solid ${Colors.primary}`,
    color: `${Colors.primary} !important`,
    '&:hover': { backgroundColor: `transparent !important`, color: `${Colors.primary} !important`,border:`1px solid ${Colors.primary}` }
  },
  text: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.black
  }
});

function Pagination({ tableCount, totalCount, currentPage, siblingCount = 1, onPageChange, pageSize, onPageSizeChange }) {
console.log(totalCount);
console.log(currentPage);

  const classes = useStyles();

  const [initialCount, setInitialCount] = useState(0);

  const paginationRange = UsePagination({ currentPage, totalCount, siblingCount, pageSize });

  let lastPage = paginationRange[paginationRange?.length - 1]

  useEffect(() => {
    setInitialCount((currentPage - 1) * pageSize)
  }, [currentPage, pageSize]);


  return (
    <Grid container spacing={3} justifyContent="flex-start" alignItems="center" sx={{ mt: 0 }}>
      <Grid item xl={6} md={6} xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Button  sx={{backgroundColor:'#EEEEEE',width:'20px !important',p:0}}    disabled={currentPage === 1 ? true : false}
          onClick={() => onPageChange(currentPage - 1)} variant="outlined"><ChevronLeftIcon sx={{ fontSize: '22px' }} /></Button>
       

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return <Typography sx={{ width: 40, fontSize: 20, fontWeight: 700, textAlign: 'center' }}>...</Typography>
          }

          return (
            <PaginationButton
              key={index}
              onClick={() => onPageChange(pageNumber)}
              className={clsx(classes.pageBtn, {
                [classes.pageBtnActive]: pageNumber === currentPage,
              })}
            >
              {pageNumber}
            </PaginationButton>
          )
        })}
        <Button sx={{backgroundColor:'#EEEEEE',width:'20px !important',p:0}}  disabled={currentPage === lastPage || totalCount === 0 ? true : false}
          onClick={() => onPageChange(currentPage + 1)} variant="outlined"><ChevronLeftIcon sx={{ fontSize: '22px', transform: 'rotate(180deg)' }} /></Button>
         <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography component="select" name="countPerPage" sx={{ mx: 1, px: 2, width: 'auto', border: '2px solid #B6B6B6', boxShadow: '0px 4px 4px 0px #D7DCE8', p: '5px 30px', borderRadius: '5px', color: Colors.gray }} onChange={onPageSizeChange}>
            <Typography component="option" value="50" sx={{ color: Colors.smokeyGrey }}>50</Typography>
            <Typography component="option" value="100" sx={{ color: Colors.smokeyGrey }}>100</Typography>
            <Typography component="option" value="150" sx={{ color: Colors.smokeyGrey }}>150</Typography>
          </Typography>
          <Typography variant="body2" sx={{ color: Colors.gray }} >/Page &nbsp;</Typography>
        </Box>
      </Grid>
      <Grid item xl={6} md={6} xs={12} sx={{ display: 'flex' }}>

       
        {/* <Typography variant="body2" sx={{ color: Colors.smokeyGrey }} >showing &nbsp;
          <Typography component="span" className={classes.text}>{totalCount === 0 ? 0 : initialCount + 1}</Typography>
          &nbsp; to &nbsp;
          <Typography component="span" className={classes.text}>{initialCount + tableCount}</Typography>
          &nbsp; of &nbsp;
          <Typography component="span" className={classes.text}>{totalCount}</Typography>
          &nbsp; entries
        </Typography> */}
      </Grid>


    </Grid>
  )
}

export default Pagination